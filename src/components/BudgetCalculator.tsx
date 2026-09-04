import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Stack,
  TextField,
  Typography,
  Button,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Alert,
  Grid,
} from "@mui/material";
import { Download, Email, Refresh, ArrowBack, ArrowForward } from "@mui/icons-material";
import HeroSection from "./HeroSection";
import jsPDF from "jspdf";
import logoImg from "../assets/logo.png";
import { EMAIL_CONFIG, generateEmailTemplate } from "../config/email";
import { DEFAULT_CURRENCY, DEFAULT_COUNTRY_CODE } from "../constants";
import { userTrackingService } from "../services/userTrackingService";

export type BirdType = "layers" | "broilers" | "sasso/kroilers" | "local";

export interface FeedIngredient {
  id: string;
  name: string;
  parts: number;
  cost: number;
}

export interface FeedStage {
  id: string;
  key: string;
  name: string;
  range: string;
  weeks: number;
  mode: "flat" | "daily";
  kgPerBird?: number;
  gramsPerBirdDay?: number;
  recipe: FeedIngredient[];
}

export interface HealthItem {
  id: string;
  name: string;
  rate: number;
  cost: number;
  vial?: boolean;
  vialSize?: number;
}

export interface EquipRatioItem {
  id: string;
  name: string;
  per: number;
  cost: number;
}

export interface EquipFlatItem {
  id: string;
  name: string;
  qty: number;
  cost: number;
}

export interface StaffItem {
  id: string;
  name: string;
  qty: number;
  cost: number;
}

interface BreedPreset {
  salesMode: "eggs" | "meat";
  feedStages: FeedStage[];
  health: HealthItem[];
  equipRatio: EquipRatioItem[];
  equipFlat: EquipFlatItem[];
  staff: StaffItem[];
  layRateCurve: number[] | null;
  defaults: {
    birds: number;
    chickCost: number;
    transport: number;
    mortality: number;
    crumbleKg: number;
    crumbleCost: number;
    water: number;
    manure: number;
    eggPrice?: number;
    offlayerPrice?: number;
    offlayerPct?: number;
    marketWeight?: number;
    meatPrice?: number;
    meatPct?: number;
  };
}

const BREED_PRESETS: Record<BirdType, BreedPreset> = {
  layers: {
    salesMode: "eggs",
    feedStages: [
      {
        id: "stg-1",
        key: "starter",
        name: "Starter Mash",
        range: "Week 2–8",
        weeks: 6,
        mode: "flat",
        kgPerBird: 1.5,
        recipe: [
          { id: "i1", name: "Broken Maize", parts: 180, cost: 600 },
          { id: "i2", name: "Maize Bran", parts: 520, cost: 600 },
          { id: "i3", name: "Sunflower Cake", parts: 100, cost: 2000 },
          { id: "i4", name: "Soybean Meal", parts: 120, cost: 1500 },
          { id: "i5", name: "Stock Feed Lime", parts: 20, cost: 1000 },
          { id: "i6", name: "5% Layer Concentrate", parts: 60, cost: 4700 },
        ],
      },
      {
        id: "stg-2",
        key: "grower",
        name: "Grower Mash",
        range: "Week 8–17",
        weeks: 9,
        mode: "flat",
        kgPerBird: 3.0,
        recipe: [
          { id: "i7", name: "Broken Maize", parts: 200, cost: 900 },
          { id: "i8", name: "Maize Bran", parts: 530, cost: 600 },
          { id: "i9", name: "Sunflower Cake", parts: 100, cost: 2000 },
          { id: "i10", name: "Soybean Meal", parts: 100, cost: 1500 },
          { id: "i11", name: "Stock Feed Lime", parts: 20, cost: 1000 },
          { id: "i12", name: "5% Layer Concentrate", parts: 50, cost: 4700 },
        ],
      },
      {
        id: "stg-3",
        key: "prelay",
        name: "Prelay Mash",
        range: "Week 18–20",
        weeks: 3,
        mode: "flat",
        kgPerBird: 1.0,
        recipe: [
          { id: "i13", name: "Broken Maize", parts: 180, cost: 900 },
          { id: "i14", name: "Maize Bran", parts: 490, cost: 600 },
          { id: "i15", name: "Sunflower Cake", parts: 90, cost: 2000 },
          { id: "i16", name: "Soybean Meal", parts: 100, cost: 3500 },
          { id: "i17", name: "Stock Feed Lime", parts: 90, cost: 1000 },
          { id: "i18", name: "5% Layer Concentrate", parts: 50, cost: 4700 },
        ],
      },
      {
        id: "stg-4",
        key: "layer",
        name: "Layer Mash",
        range: "Week 21–90",
        weeks: 70,
        mode: "daily",
        gramsPerBirdDay: 114,
        recipe: [
          { id: "i19", name: "Broken Maize", parts: 185, cost: 750 },
          { id: "i20", name: "Maize Bran", parts: 500, cost: 500 },
          { id: "i21", name: "Sunflower Cake", parts: 75, cost: 1000 },
          { id: "i22", name: "Soybean Meal", parts: 95, cost: 2800 },
          { id: "i23", name: "Stock Feed Lime", parts: 95, cost: 1000 },
          { id: "i24", name: "5% Layer Concentrate", parts: 50, cost: 4700 },
        ],
      },
    ],
    health: [
      { id: "h1", name: "IBD / NCD vaccine (Day 1)", rate: 1.0, cost: 20000, vial: true, vialSize: 1000 },
      { id: "h2", name: "Gumboro vaccine (Day 14)", rate: 1.0, cost: 20000, vial: true, vialSize: 1000 },
      { id: "h3", name: "NCD vaccine (Day 21)", rate: 1.0, cost: 20000, vial: true, vialSize: 1000 },
      { id: "h4", name: "Fowl pox vaccine (Week 6)", rate: 1.0, cost: 80000, vial: true, vialSize: 1000 },
      { id: "h5", name: "Infectious coryza treatment", rate: 1.43, cost: 65000 },
      { id: "h6", name: "NCD booster (Growing stage)", rate: 10.29, cost: 20000, vial: true, vialSize: 1000 },
      { id: "h7", name: "Other vaccines (Growing stage)", rate: 2.0, cost: 25000, vial: true, vialSize: 1000 },
      { id: "h8", name: "Assorted drugs & supplements", rate: 0.29, cost: 1500000 },
      { id: "h9", name: "Charcoal for brooding (bags)", rate: 4.29, cost: 45000 },
      { id: "h10", name: "White lime for biosecurity (bags)", rate: 2.86, cost: 35000 },
    ],
    equipRatio: [
      { id: "er1", name: "Automatic Drinkers (1 per 100 birds)", per: 100, cost: 55000 },
      { id: "er2", name: "Jumbo Feeders 10kg (1 per 50 birds)", per: 50, cost: 55000 },
      { id: "er3", name: "Brooding Stoves (1 per 350 birds)", per: 350, cost: 50000 },
      { id: "er4", name: "Laying Boxes (1 per 150 birds)", per: 150, cost: 250000 },
      { id: "er5", name: "Brooding Trays (1 per 300 birds)", per: 300, cost: 5000 },
    ],
    equipFlat: [
      { id: "ef1", name: "Water Tank (500 Litres)", qty: 1, cost: 300000 },
      { id: "ef2", name: "Plumbing Fixtures", qty: 3, cost: 150000 },
      { id: "ef3", name: "Water Tank Stand", qty: 1, cost: 150000 },
      { id: "ef4", name: "Plumbing Labour", qty: 1, cost: 150000 },
      { id: "ef5", name: "Protective Boots & Gear", qty: 5, cost: 10000 },
    ],
    staff: [
      { id: "s1", name: "Farm Manager / Supervisor", qty: 1, cost: 300000 },
      { id: "s2", name: "Production Attendants", qty: 2, cost: 250000 },
      { id: "s3", name: "Feed Mixing Labour", qty: 2, cost: 150000 },
      { id: "s4", name: "Staff Meals & Welfare", qty: 4, cost: 180000 },
    ],
    layRateCurve: [40, 65, 75, 85, 95, 95, 95, 95, 95, 95, 95, 85, 85, 80, 75],
    defaults: {
      birds: 3500,
      chickCost: 5000,
      transport: 0,
      mortality: 5,
      crumbleKg: 0.1,
      crumbleCost: 3120,
      water: 300000,
      manure: 5000000,
      eggPrice: 11500,
      offlayerPrice: 14000,
      offlayerPct: 80,
    },
  },
  broilers: {
    salesMode: "meat",
    feedStages: [
      {
        id: "bstg-1",
        key: "starter",
        name: "Broiler Starter Mash",
        range: "Week 1–2",
        weeks: 2,
        mode: "flat",
        kgPerBird: 0.7,
        recipe: [
          { id: "bi1", name: "Broken Maize", parts: 200, cost: 700 },
          { id: "bi2", name: "Maize Bran", parts: 300, cost: 600 },
          { id: "bi3", name: "Soybean Meal", parts: 200, cost: 1600 },
          { id: "bi4", name: "Sunflower Cake", parts: 150, cost: 2000 },
          { id: "bi5", name: "Stock Feed Lime", parts: 20, cost: 1000 },
          { id: "bi6", name: "5% Broiler Starter Concentrate", parts: 130, cost: 5200 },
        ],
      },
      {
        id: "bstg-2",
        key: "grower",
        name: "Broiler Grower Mash",
        range: "Week 3–4",
        weeks: 2,
        mode: "flat",
        kgPerBird: 1.3,
        recipe: [
          { id: "bi7", name: "Broken Maize", parts: 220, cost: 750 },
          { id: "bi8", name: "Maize Bran", parts: 320, cost: 600 },
          { id: "bi9", name: "Soybean Meal", parts: 200, cost: 1600 },
          { id: "bi10", name: "Sunflower Cake", parts: 120, cost: 2000 },
          { id: "bi11", name: "Stock Feed Lime", parts: 20, cost: 1000 },
          { id: "bi12", name: "5% Broiler Grower Concentrate", parts: 120, cost: 5000 },
        ],
      },
      {
        id: "bstg-3",
        key: "finisher",
        name: "Broiler Finisher Mash",
        range: "Week 5–6",
        weeks: 2,
        mode: "flat",
        kgPerBird: 2.3,
        recipe: [
          { id: "bi13", name: "Broken Maize", parts: 280, cost: 800 },
          { id: "bi14", name: "Maize Bran", parts: 330, cost: 600 },
          { id: "bi15", name: "Soybean Meal", parts: 150, cost: 1600 },
          { id: "bi16", name: "Sunflower Cake", parts: 110, cost: 2000 },
          { id: "bi17", name: "Stock Feed Lime", parts: 20, cost: 1000 },
          { id: "bi18", name: "5% Broiler Finisher Concentrate", parts: 110, cost: 4900 },
        ],
      },
    ],
    health: [
      { id: "bh1", name: "NCD Vaccine (Day 1)", rate: 1.0, cost: 20000, vial: true, vialSize: 1000 },
      { id: "bh2", name: "Gumboro / IBD Vaccine (Day 10)", rate: 1.0, cost: 20000, vial: true, vialSize: 1000 },
      { id: "bh3", name: "Anticoccidial (Whole Cycle)", rate: 1.0, cost: 180000 },
      { id: "bh4", name: "Vitamins & Electrolytes", rate: 2.0, cost: 45000 },
      { id: "bh5", name: "Broad-Spectrum Antibiotic", rate: 1.0, cost: 250000 },
      { id: "bh6", name: "Charcoal for Brooding", rate: 4.29, cost: 45000 },
      { id: "bh7", name: "White Lime for Biosecurity", rate: 2.86, cost: 35000 },
    ],
    equipRatio: [
      { id: "ber1", name: "Automatic Drinkers (1 per 100 birds)", per: 100, cost: 55000 },
      { id: "ber2", name: "Jumbo Feeders 10kg (1 per 50 birds)", per: 50, cost: 55000 },
      { id: "ber3", name: "Brooding Stoves (1 per 350 birds)", per: 350, cost: 50000 },
      { id: "ber4", name: "Brooding Trays (1 per 300 birds)", per: 300, cost: 5000 },
    ],
    equipFlat: [
      { id: "bef1", name: "Water Tank (500 Litres)", qty: 1, cost: 300000 },
      { id: "bef2", name: "Plumbing Fixtures", qty: 3, cost: 150000 },
      { id: "bef3", name: "Water Tank Stand", qty: 1, cost: 150000 },
      { id: "bef4", name: "Plumbing Labour", qty: 1, cost: 150000 },
      { id: "bef5", name: "Protective Boots & Gear", qty: 5, cost: 10000 },
    ],
    staff: [
      { id: "bs1", name: "Farm Supervisor", qty: 1, cost: 300000 },
      { id: "bs2", name: "Broiler Attendants", qty: 2, cost: 250000 },
      { id: "bs3", name: "Feed Mixing Labour", qty: 2, cost: 150000 },
      { id: "bs4", name: "Staff Meals & Welfare", qty: 4, cost: 180000 },
    ],
    layRateCurve: null,
    defaults: {
      birds: 3500,
      chickCost: 3500,
      transport: 0,
      mortality: 5,
      crumbleKg: 0.1,
      crumbleCost: 3120,
      water: 150000,
      manure: 1500000,
      marketWeight: 2.0,
      meatPrice: 7200,
      meatPct: 98,
    },
  },
  "sasso/kroilers": {
    salesMode: "eggs",
    feedStages: [
      {
        id: "sstg-1",
        key: "starter",
        name: "Starter Mash",
        range: "Week 2–8",
        weeks: 6,
        mode: "flat",
        kgPerBird: 1.7,
        recipe: [
          { id: "si1", name: "Broken Maize", parts: 180, cost: 600 },
          { id: "si2", name: "Maize Bran", parts: 500, cost: 600 },
          { id: "si3", name: "Sunflower Cake", parts: 110, cost: 2000 },
          { id: "si4", name: "Soybean Meal", parts: 130, cost: 1500 },
          { id: "si5", name: "Stock Feed Lime", parts: 20, cost: 1000 },
          { id: "si6", name: "5% Dual-Purpose Concentrate", parts: 60, cost: 4500 },
        ],
      },
      {
        id: "sstg-2",
        key: "grower",
        name: "Grower Mash",
        range: "Week 8–18",
        weeks: 10,
        mode: "flat",
        kgPerBird: 3.4,
        recipe: [
          { id: "si7", name: "Broken Maize", parts: 200, cost: 900 },
          { id: "si8", name: "Maize Bran", parts: 510, cost: 600 },
          { id: "si9", name: "Sunflower Cake", parts: 110, cost: 2000 },
          { id: "si10", name: "Soybean Meal", parts: 110, cost: 1500 },
          { id: "si11", name: "Stock Feed Lime", parts: 20, cost: 1000 },
          { id: "si12", name: "5% Dual-Purpose Concentrate", parts: 50, cost: 4500 },
        ],
      },
      {
        id: "sstg-3",
        key: "prelay",
        name: "Prelay Mash",
        range: "Week 19–21",
        weeks: 3,
        mode: "flat",
        kgPerBird: 1.2,
        recipe: [
          { id: "si13", name: "Broken Maize", parts: 180, cost: 900 },
          { id: "si14", name: "Maize Bran", parts: 480, cost: 600 },
          { id: "si15", name: "Sunflower Cake", parts: 100, cost: 2000 },
          { id: "si16", name: "Soybean Meal", parts: 110, cost: 3500 },
          { id: "si17", name: "Stock Feed Lime", parts: 80, cost: 1000 },
          { id: "si18", name: "5% Dual-Purpose Concentrate", parts: 50, cost: 4500 },
        ],
      },
      {
        id: "sstg-4",
        key: "layer",
        name: "Dual-Purpose Layer Mash",
        range: "Week 22–72",
        weeks: 50,
        mode: "daily",
        gramsPerBirdDay: 120,
        recipe: [
          { id: "si19", name: "Broken Maize", parts: 190, cost: 750 },
          { id: "si20", name: "Maize Bran", parts: 490, cost: 500 },
          { id: "si21", name: "Sunflower Cake", parts: 80, cost: 1000 },
          { id: "si22", name: "Soybean Meal", parts: 100, cost: 2800 },
          { id: "si23", name: "Stock Feed Lime", parts: 90, cost: 1000 },
          { id: "si24", name: "5% Dual-Purpose Concentrate", parts: 50, cost: 4500 },
        ],
      },
    ],
    health: [
      { id: "sh1", name: "IBD / NCD vaccine (Day 1)", rate: 1.0, cost: 20000, vial: true, vialSize: 1000 },
      { id: "sh2", name: "Gumboro vaccine (Day 14)", rate: 1.0, cost: 20000, vial: true, vialSize: 1000 },
      { id: "sh3", name: "NCD vaccine (Day 21)", rate: 1.0, cost: 20000, vial: true, vialSize: 1000 },
      { id: "sh4", name: "Fowl pox vaccine (Week 6)", rate: 1.0, cost: 80000, vial: true, vialSize: 1000 },
      { id: "sh5", name: "Infectious coryza treatment", rate: 1.43, cost: 65000 },
      { id: "sh6", name: "NCD booster (Growing stage)", rate: 8.0, cost: 20000, vial: true, vialSize: 1000 },
      { id: "sh7", name: "Other vaccines (Growing stage)", rate: 2.0, cost: 25000, vial: true, vialSize: 1000 },
      { id: "sh8", name: "Assorted drugs & supplements", rate: 0.29, cost: 1200000 },
      { id: "sh9", name: "Charcoal for brooding (bags)", rate: 4.29, cost: 45000 },
      { id: "sh10", name: "White lime for biosecurity", rate: 2.86, cost: 35000 },
    ],
    equipRatio: [
      { id: "ser1", name: "Automatic Drinkers (1 per 100 birds)", per: 100, cost: 55000 },
      { id: "ser2", name: "Jumbo Feeders 10kg (1 per 50 birds)", per: 50, cost: 55000 },
      { id: "ser3", name: "Brooding Stoves (1 per 350 birds)", per: 350, cost: 50000 },
      { id: "ser4", name: "Laying Boxes (1 per 150 birds)", per: 150, cost: 250000 },
      { id: "ser5", name: "Brooding Trays (1 per 300 birds)", per: 300, cost: 5000 },
    ],
    equipFlat: [
      { id: "sef1", name: "Water Tank (500 Litres)", qty: 1, cost: 300000 },
      { id: "sef2", name: "Plumbing Fixtures", qty: 3, cost: 150000 },
      { id: "sef3", name: "Water Tank Stand", qty: 1, cost: 150000 },
      { id: "sef4", name: "Plumbing Labour", qty: 1, cost: 150000 },
      { id: "sef5", name: "Protective Boots & Gear", qty: 5, cost: 10000 },
    ],
    staff: [
      { id: "ss1", name: "Farm Manager / Supervisor", qty: 1, cost: 300000 },
      { id: "ss2", name: "Production Attendants", qty: 2, cost: 250000 },
      { id: "ss3", name: "Feed Mixing Labour", qty: 2, cost: 150000 },
      { id: "ss4", name: "Staff Meals & Welfare", qty: 4, cost: 180000 },
    ],
    layRateCurve: [30, 50, 65, 70, 75, 75, 75, 70, 65, 60, 55, 50],
    defaults: {
      birds: 3500,
      chickCost: 4000,
      transport: 0,
      mortality: 6,
      crumbleKg: 0.1,
      crumbleCost: 3120,
      water: 250000,
      manure: 4000000,
      eggPrice: 11500,
      offlayerPrice: 18000,
      offlayerPct: 85,
    },
  },
  local: {
    salesMode: "eggs",
    feedStages: [
      {
        id: "lstg-1",
        key: "starter",
        name: "Chick Mash",
        range: "Week 1–6",
        weeks: 6,
        mode: "flat",
        kgPerBird: 1.5,
        recipe: [
          { id: "li1", name: "Broken Maize", parts: 200, cost: 600 },
          { id: "li2", name: "Maize Bran", parts: 500, cost: 600 },
          { id: "li3", name: "Sunflower Cake", parts: 100, cost: 2000 },
          { id: "li4", name: "Soybean Meal", parts: 130, cost: 1500 },
          { id: "li5", name: "Stock Feed Lime", parts: 20, cost: 1000 },
          { id: "li6", name: "5% Concentrate", parts: 50, cost: 4500 },
        ],
      },
      {
        id: "lstg-2",
        key: "grower",
        name: "Grower Mash",
        range: "Week 7–18",
        weeks: 11,
        mode: "flat",
        kgPerBird: 3.5,
        recipe: [
          { id: "li7", name: "Broken Maize", parts: 220, cost: 800 },
          { id: "li8", name: "Maize Bran", parts: 500, cost: 600 },
          { id: "li9", name: "Sunflower Cake", parts: 100, cost: 2000 },
          { id: "li10", name: "Soybean Meal", parts: 110, cost: 1500 },
          { id: "li11", name: "Stock Feed Lime", parts: 20, cost: 1000 },
          { id: "li12", name: "5% Concentrate", parts: 50, cost: 4500 },
        ],
      },
      {
        id: "lstg-3",
        key: "layer",
        name: "Layer / Maintenance Mash",
        range: "Week 19–60",
        weeks: 40,
        mode: "daily",
        gramsPerBirdDay: 105,
        recipe: [
          { id: "li13", name: "Broken Maize", parts: 200, cost: 750 },
          { id: "li14", name: "Maize Bran", parts: 500, cost: 500 },
          { id: "li15", name: "Sunflower Cake", parts: 80, cost: 1000 },
          { id: "li16", name: "Soybean Meal", parts: 90, cost: 2800 },
          { id: "li17", name: "Stock Feed Lime", parts: 80, cost: 1000 },
          { id: "li18", name: "5% Concentrate", parts: 50, cost: 4500 },
        ],
      },
    ],
    health: [
      { id: "lh1", name: "NCD Vaccine (Day 1)", rate: 1.0, cost: 20000, vial: true, vialSize: 1000 },
      { id: "lh2", name: "Gumboro Vaccine (Day 14)", rate: 1.0, cost: 20000, vial: true, vialSize: 1000 },
      { id: "lh3", name: "Fowl Pox Vaccine", rate: 1.0, cost: 80000, vial: true, vialSize: 1000 },
      { id: "lh4", name: "Dewormer & Vitamins", rate: 1.0, cost: 120000 },
      { id: "lh5", name: "Charcoal for Brooding", rate: 2.5, cost: 45000 },
      { id: "lh6", name: "Biosecurity Lime", rate: 2.0, cost: 35000 },
    ],
    equipRatio: [
      { id: "ler1", name: "Drinkers (1 per 50 birds)", per: 50, cost: 25000 },
      { id: "ler2", name: "Feeders (1 per 40 birds)", per: 40, cost: 25000 },
      { id: "ler3", name: "Brooding Stoves", per: 250, cost: 50000 },
    ],
    equipFlat: [
      { id: "lef1", name: "Water Container", qty: 1, cost: 100000 },
      { id: "lef2", name: "Disinfection Sprayer", qty: 1, cost: 120000 },
    ],
    staff: [
      { id: "ls1", name: "Attendant / Caretaker", qty: 1, cost: 200000 },
      { id: "ls2", name: "Welfare & Meals", qty: 1, cost: 100000 },
    ],
    layRateCurve: [25, 40, 50, 55, 55, 50, 45, 40, 35, 30],
    defaults: {
      birds: 1000,
      chickCost: 3000,
      transport: 0,
      mortality: 8,
      crumbleKg: 0.1,
      crumbleCost: 3120,
      water: 150000,
      manure: 2000000,
      eggPrice: 12000,
      offlayerPrice: 20000,
      offlayerPct: 90,
    },
  },
};

const BudgetCalculator: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);

  // Flock & Basic state
  const [birdType, setBirdType] = useState<BirdType>("layers");
  const [numBirds, setNumBirds] = useState<number>(3500);
  const [docCostPerChick, setDocCostPerChick] = useState<number>(5000);
  const [transportCost, setTransportCost] = useState<number>(0);
  const [mortalityRate, setMortalityRate] = useState<number>(5);
  const [crumbleKg, setCrumbleKg] = useState<number>(0.1);
  const [crumbleCost, setCrumbleCost] = useState<number>(3120);
  const [currencyCode, setCurrencyCode] = useState<string>(DEFAULT_CURRENCY);

  // Multi-stage feed state
  const [feedStages, setFeedStages] = useState<FeedStage[]>(BREED_PRESETS.layers.feedStages);

  // Health state
  const [healthItems, setHealthItems] = useState<HealthItem[]>(BREED_PRESETS.layers.health);
  const [waterCost, setWaterCost] = useState<number>(300000);

  // Equipment state
  const [equipRatioItems, setEquipRatioItems] = useState<EquipRatioItem[]>(BREED_PRESETS.layers.equipRatio);
  const [equipFlatItems, setEquipFlatItems] = useState<EquipFlatItem[]>(BREED_PRESETS.layers.equipFlat);

  // Staff state
  const [staffItems, setStaffItems] = useState<StaffItem[]>(BREED_PRESETS.layers.staff);

  // Sales state
  const [layRateCurve, setLayRateCurve] = useState<number[]>(BREED_PRESETS.layers.layRateCurve || []);
  const [eggPrice, setEggPrice] = useState<number>(11500); // per tray (30 eggs)
  const [offlayerPrice, setOfflayerPrice] = useState<number>(14000); // per cull bird
  const [offlayerPct, setOfflayerPct] = useState<number>(80);
  const [marketWeight, setMarketWeight] = useState<number>(2.0); // kg
  const [meatPrice, setMeatPrice] = useState<number>(7200); // per kg live weight
  const [meatPct, setMeatPct] = useState<number>(98); // % of survivors sold
  const [manureRevenue, setManureRevenue] = useState<number>(5000000);

  // Contact info
  const [contactInfo, setContactInfo] = useState({
    phone: "",
    email: "",
    countryCode: DEFAULT_COUNTRY_CODE,
  });

  // Switch breed and apply default preset
  const handleBreedChange = (newBreed: BirdType) => {
    setBirdType(newBreed);
    const preset = BREED_PRESETS[newBreed];
    setFeedStages(JSON.parse(JSON.stringify(preset.feedStages)));
    setHealthItems(JSON.parse(JSON.stringify(preset.health)));
    setEquipRatioItems(JSON.parse(JSON.stringify(preset.equipRatio)));
    setEquipFlatItems(JSON.parse(JSON.stringify(preset.equipFlat)));
    setStaffItems(JSON.parse(JSON.stringify(preset.staff)));
    if (preset.layRateCurve) {
      setLayRateCurve([...preset.layRateCurve]);
    } else {
      setLayRateCurve([]);
    }
    setNumBirds(preset.defaults.birds);
    setDocCostPerChick(preset.defaults.chickCost);
    setTransportCost(preset.defaults.transport);
    setMortalityRate(preset.defaults.mortality);
    setCrumbleKg(preset.defaults.crumbleKg);
    setCrumbleCost(preset.defaults.crumbleCost);
    setWaterCost(preset.defaults.water);
    setManureRevenue(preset.defaults.manure);
    if (preset.defaults.eggPrice !== undefined) setEggPrice(preset.defaults.eggPrice);
    if (preset.defaults.offlayerPrice !== undefined) setOfflayerPrice(preset.defaults.offlayerPrice);
    if (preset.defaults.offlayerPct !== undefined) setOfflayerPct(preset.defaults.offlayerPct);
    if (preset.defaults.marketWeight !== undefined) setMarketWeight(preset.defaults.marketWeight);
    if (preset.defaults.meatPrice !== undefined) setMeatPrice(preset.defaults.meatPrice);
    if (preset.defaults.meatPct !== undefined) setMeatPct(preset.defaults.meatPct);
  };

  const isEggSales = BREED_PRESETS[birdType].salesMode === "eggs";

  const formatter = useMemo(() => {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: currencyCode,
      maximumFractionDigits: 0,
    });
  }, [currencyCode]);

  // Load from local storage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("smartvet_budget_calculator_v2");
      if (saved) {
        const data = JSON.parse(saved);
        if (data.birdType && BREED_PRESETS[data.birdType as BirdType]) {
          setBirdType(data.birdType);
          setNumBirds(data.numBirds ?? 3500);
          setDocCostPerChick(data.docCostPerChick ?? 5000);
          setTransportCost(data.transportCost ?? 0);
          setMortalityRate(data.mortalityRate ?? 5);
          setCrumbleKg(data.crumbleKg ?? 0.1);
          setCrumbleCost(data.crumbleCost ?? 3120);
          setCurrencyCode(data.currencyCode || DEFAULT_CURRENCY);
          if (data.feedStages) setFeedStages(data.feedStages);
          if (data.healthItems) setHealthItems(data.healthItems);
          if (data.waterCost !== undefined) setWaterCost(data.waterCost);
          if (data.equipRatioItems) setEquipRatioItems(data.equipRatioItems);
          if (data.equipFlatItems) setEquipFlatItems(data.equipFlatItems);
          if (data.staffItems) setStaffItems(data.staffItems);
          if (data.layRateCurve) setLayRateCurve(data.layRateCurve);
          if (data.eggPrice !== undefined) setEggPrice(data.eggPrice);
          if (data.offlayerPrice !== undefined) setOfflayerPrice(data.offlayerPrice);
          if (data.offlayerPct !== undefined) setOfflayerPct(data.offlayerPct);
          if (data.marketWeight !== undefined) setMarketWeight(data.marketWeight);
          if (data.meatPrice !== undefined) setMeatPrice(data.meatPrice);
          if (data.meatPct !== undefined) setMeatPct(data.meatPct);
          if (data.manureRevenue !== undefined) setManureRevenue(data.manureRevenue);
          if (data.contactInfo) setContactInfo(data.contactInfo);
        }
      }
    } catch {
      // Ignore parse error
    }
  }, []);

  // Save to local storage on changes
  useEffect(() => {
    try {
      localStorage.setItem(
        "smartvet_budget_calculator_v2",
        JSON.stringify({
          birdType,
          numBirds,
          docCostPerChick,
          transportCost,
          mortalityRate,
          crumbleKg,
          crumbleCost,
          currencyCode,
          feedStages,
          healthItems,
          waterCost,
          equipRatioItems,
          equipFlatItems,
          staffItems,
          layRateCurve,
          eggPrice,
          offlayerPrice,
          offlayerPct,
          marketWeight,
          meatPrice,
          meatPct,
          manureRevenue,
          contactInfo,
        })
      );
    } catch {
      // Ignore save error
    }
  }, [
    birdType,
    numBirds,
    docCostPerChick,
    transportCost,
    mortalityRate,
    crumbleKg,
    crumbleCost,
    currencyCode,
    feedStages,
    healthItems,
    waterCost,
    equipRatioItems,
    equipFlatItems,
    staffItems,
    layRateCurve,
    eggPrice,
    offlayerPrice,
    offlayerPct,
    marketWeight,
    meatPrice,
    meatPct,
    manureRevenue,
    contactInfo,
  ]);

  // Calculations Engine
  const chicksCostTotal = useMemo(() => {
    return numBirds * docCostPerChick + transportCost;
  }, [numBirds, docCostPerChick, transportCost]);

  const crumbleTotal = useMemo(() => {
    return numBirds * crumbleKg * crumbleCost;
  }, [numBirds, crumbleKg, crumbleCost]);

  // Feed calculation per stage
  const feedCalculation = useMemo(() => {
    let growingWeeks = 0;
    let totalFeedCost = crumbleTotal;
    let totalFeedKg = numBirds * crumbleKg;

    const stagesCalculated = feedStages.map((stage) => {
      if (stage.key !== "layer" && stage.key !== "finisher") {
        growingWeeks += stage.weeks || 0;
      }

      let stageKg = 0;
      if (stage.mode === "daily") {
        stageKg = numBirds * (((stage.gramsPerBirdDay || 0) * (stage.weeks || 0) * 7) / 1000);
      } else {
        stageKg = numBirds * (stage.kgPerBird || 0);
      }

      const totalParts = stage.recipe.reduce((sum, item) => sum + (item.parts || 0), 0);

      let stageCost = 0;
      const ingredientsCalculated = stage.recipe.map((ingr) => {
        const buyKg = totalParts > 0 ? (ingr.parts / totalParts) * stageKg : 0;
        const cost = buyKg * (ingr.cost || 0);
        stageCost += cost;
        return {
          ...ingr,
          buyKg,
          costTotal: cost,
        };
      });

      totalFeedCost += stageCost;
      totalFeedKg += stageKg;

      return {
        ...stage,
        stageKg,
        totalParts,
        stageCost,
        ingredients: ingredientsCalculated,
      };
    });

    return {
      growingWeeks,
      totalFeedCost,
      totalFeedKg,
      stages: stagesCalculated,
    };
  }, [crumbleTotal, numBirds, crumbleKg, feedStages]);

  // Health Calculation
  const healthCalculation = useMemo(() => {
    let total = 0;
    const items = healthItems.map((item) => {
      const qty = item.vial
        ? Math.ceil(numBirds / (item.vialSize || 1000))
        : (item.rate * numBirds) / 1000;
      const cost = qty * (item.cost || 0);
      total += cost;
      return {
        ...item,
        qty,
        totalCost: cost,
      };
    });
    const grandHealthTotal = total + (waterCost || 0);
    return {
      items,
      healthTotal: total,
      grandHealthTotal,
    };
  }, [healthItems, numBirds, waterCost]);

  // Equipment Capex Calculation
  const equipmentCalculation = useMemo(() => {
    let ratioTotal = 0;
    const ratioItems = equipRatioItems.map((item) => {
      const qty = item.per > 0 ? Math.ceil(numBirds / item.per) : 0;
      const cost = qty * (item.cost || 0);
      ratioTotal += cost;
      return {
        ...item,
        qty,
        totalCost: cost,
      };
    });

    let flatTotal = 0;
    const flatItems = equipFlatItems.map((item) => {
      const cost = (item.qty || 0) * (item.cost || 0);
      flatTotal += cost;
      return {
        ...item,
        totalCost: cost,
      };
    });

    return {
      ratioItems,
      flatItems,
      totalCapex: ratioTotal + flatTotal,
    };
  }, [equipRatioItems, equipFlatItems, numBirds]);

  // Staff & Duration Calculation
  const staffCalculation = useMemo(() => {
    const monthlyStaffCost = staffItems.reduce(
      (sum, item) => sum + (item.qty || 0) * (item.cost || 0),
      0
    );

    const growingMonths =
      feedCalculation.growingWeeks > 0
        ? feedCalculation.growingWeeks / 4.345
        : birdType === "broilers"
        ? 1.5
        : 4.14;

    const salesMonths = isEggSales && layRateCurve.length > 0 ? layRateCurve.length : 2;
    const totalCycleMonths = growingMonths + salesMonths;
    const totalStaffCost = monthlyStaffCost * totalCycleMonths;

    return {
      monthlyStaffCost,
      growingMonths,
      salesMonths,
      totalCycleMonths,
      totalStaffCost,
    };
  }, [staffItems, feedCalculation.growingWeeks, birdType, isEggSales, layRateCurve]);

  // Sales & Revenue Calculation
  const salesCalculation = useMemo(() => {
    const survivors = numBirds * (1 - Math.min(100, Math.max(0, mortalityRate)) / 100);
    let totalEggRevenue = 0;
    let totalEggTrays = 0;
    let offlayerRevenue = 0;
    let meatRevenue = 0;
    let meatKgSold = 0;

    const monthlyEggSales = layRateCurve.map((rate, monthIdx) => {
      const layPct = rate / 100;
      // 30 eggs/tray and 30 days/month cancels out: survivors * layPct * 30 / 30 = survivors * layPct
      const trays = Math.round(survivors * layPct);
      const revenue = trays * eggPrice;
      totalEggTrays += trays;
      totalEggRevenue += revenue;
      return {
        month: monthIdx + 1,
        rate,
        trays,
        revenue,
      };
    });

    if (isEggSales) {
      const offlayerCulls = survivors * (offlayerPct / 100);
      offlayerRevenue = offlayerCulls * offlayerPrice;
    } else {
      const birdsSold = survivors * (meatPct / 100);
      meatKgSold = birdsSold * marketWeight;
      meatRevenue = meatKgSold * meatPrice;
    }

    const grossRevenue = isEggSales
      ? totalEggRevenue + offlayerRevenue + (manureRevenue || 0)
      : meatRevenue + (manureRevenue || 0);

    return {
      survivors,
      monthlyEggSales,
      totalEggTrays,
      totalEggRevenue,
      offlayerRevenue,
      meatKgSold,
      meatRevenue,
      grossRevenue,
    };
  }, [
    numBirds,
    mortalityRate,
    layRateCurve,
    eggPrice,
    isEggSales,
    offlayerPct,
    offlayerPrice,
    meatPct,
    marketWeight,
    meatPrice,
    manureRevenue,
  ]);

  // Comprehensive Financial Totals & KPIs
  const financialTotals = useMemo(() => {
    const productionCost =
      chicksCostTotal + feedCalculation.totalFeedCost + healthCalculation.grandHealthTotal;
    const totalOperatingCost = productionCost + staffCalculation.totalStaffCost;
    const netProfit = salesCalculation.grossRevenue - totalOperatingCost;
    const monthlyNetCashFlow =
      staffCalculation.totalCycleMonths > 0
        ? netProfit / staffCalculation.totalCycleMonths
        : 0;

    const equipmentCapex = equipmentCalculation.totalCapex;
    const paybackPeriod =
      equipmentCapex > 0 && monthlyNetCashFlow > 0
        ? equipmentCapex / monthlyNetCashFlow
        : null;

    const breakevenEggPricePerTray =
      isEggSales && salesCalculation.totalEggTrays > 0
        ? totalOperatingCost / salesCalculation.totalEggTrays
        : null;

    const breakevenMeatPricePerKg =
      !isEggSales && salesCalculation.meatKgSold > 0
        ? totalOperatingCost / salesCalculation.meatKgSold
        : null;

    const profitMargin =
      salesCalculation.grossRevenue > 0
        ? (netProfit / salesCalculation.grossRevenue) * 100
        : 0;

    const roi =
      totalOperatingCost + equipmentCapex > 0
        ? (netProfit / (totalOperatingCost + equipmentCapex)) * 100
        : 0;

    return {
      productionCost,
      totalOperatingCost,
      netProfit,
      monthlyNetCashFlow,
      equipmentCapex,
      paybackPeriod,
      breakevenEggPricePerTray,
      breakevenMeatPricePerKg,
      profitMargin,
      roi,
    };
  }, [
    chicksCostTotal,
    feedCalculation.totalFeedCost,
    healthCalculation.grandHealthTotal,
    staffCalculation.totalStaffCost,
    staffCalculation.totalCycleMonths,
    salesCalculation.grossRevenue,
    salesCalculation.totalEggTrays,
    salesCalculation.meatKgSold,
    equipmentCalculation.totalCapex,
    isEggSales,
  ]);

  // Stepper handlers
  const handleNext = () => setActiveStep((prev) => prev + 1);
  const handleBack = () => setActiveStep((prev) => prev - 1);
  const handleReset = () => {
    handleBreedChange("layers");
    setActiveStep(0);
  };

  // PDF Generation
  const generatePDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const leftMargin = 14;
    const rightMargin = pageWidth - 14;
    const tableWidth = rightMargin - leftMargin;
    let yPosition = 35;
    const rowHeight = 7.5;
    const headerHeight = 9.5;

    // Header logo
    try {
      const img = new Image();
      img.src = logoImg;
      doc.addImage(img, "PNG", 14, 8, 20, 20, undefined, "FAST");
    } catch {
      // Logo fallback
    }

    doc.setFontSize(18);
    doc.setTextColor(20, 92, 46);
    doc.text("River Poultry & SmartVet Budget", pageWidth / 2, 20, { align: "center" });

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text("Commercial Enterprise Budget & ROI Projection", pageWidth / 2, 26, { align: "center" });

    const drawRow = (label: string, value: string, isHeader = false, isHighlight = false) => {
      if (yPosition > pageHeight - 25) {
        doc.addPage();
        yPosition = 20;
      }
      if (isHeader) {
        doc.setFillColor(231, 240, 234);
        doc.rect(leftMargin, yPosition, tableWidth, headerHeight, "F");
        doc.setFontSize(11);
        doc.setTextColor(20, 92, 46);
        doc.setFont("helvetica", "bold");
      } else if (isHighlight) {
        doc.setFillColor(245, 245, 245);
        doc.rect(leftMargin, yPosition, tableWidth, rowHeight, "F");
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        doc.setFont("helvetica", "bold");
      } else {
        doc.setFontSize(9.5);
        doc.setTextColor(50, 50, 50);
        doc.setFont("helvetica", "normal");
      }

      doc.text(label, leftMargin + 4, yPosition + (isHeader ? 6.5 : 5));
      doc.text(value, rightMargin - 4, yPosition + (isHeader ? 6.5 : 5), { align: "right" });
      yPosition += isHeader ? headerHeight : rowHeight;
    };

    const drawDivider = () => {
      yPosition += 2;
      doc.setDrawColor(210, 224, 214);
      doc.line(leftMargin, yPosition, rightMargin, yPosition);
      yPosition += 4;
    };

    // 1. Flock Profile
    drawRow("1. FLOCK ASSUMPTIONS & BASIC DATA", "", true);
    drawRow("Flock Breed & Type", birdType.toUpperCase());
    drawRow("Initial Bird Count", numBirds.toLocaleString());
    drawRow("Expected Mortality", `${mortalityRate}% (${Math.round(salesCalculation.survivors).toLocaleString()} survivors)`);
    drawRow("Day-Old Chick Cost & Transport", formatter.format(chicksCostTotal));
    drawRow("Growing Period", `${feedCalculation.growingWeeks} weeks (${staffCalculation.growingMonths.toFixed(1)} months)`);
    drawRow("Total Production Cycle", `${staffCalculation.totalCycleMonths.toFixed(1)} months`);
    drawDivider();

    // 2. Cost Structure
    drawRow("2. OPERATING & CAPITAL COST SUMMARY", "", true);
    drawRow("Day-Old Chicks (Capex/Stock)", formatter.format(chicksCostTotal));
    drawRow("Multi-Stage Feed Total", formatter.format(feedCalculation.totalFeedCost));
    drawRow("Health, Vaccines & Water", formatter.format(healthCalculation.grandHealthTotal));
    drawRow("Farm Staff & Labour", formatter.format(staffCalculation.totalStaffCost));
    drawRow("TOTAL OPERATING EXPENSES", formatter.format(financialTotals.totalOperatingCost), false, true);
    drawRow("Housing & Equipment (Capex)", formatter.format(financialTotals.equipmentCapex));
    drawDivider();

    // 3. Revenue Projections
    drawRow("3. REVENUE & RETURNS", "", true);
    if (isEggSales) {
      drawRow("Total Egg Production (Trays)", `${salesCalculation.totalEggTrays.toLocaleString()} trays`);
      drawRow("Egg Sales Revenue", formatter.format(salesCalculation.totalEggRevenue));
      drawRow("Off-Layer Cull Birds Revenue", formatter.format(salesCalculation.offlayerRevenue));
    } else {
      drawRow("Meat Produced & Sold (kg)", `${Math.round(salesCalculation.meatKgSold).toLocaleString()} kg`);
      drawRow("Meat Sales Revenue", formatter.format(salesCalculation.meatRevenue));
    }
    drawRow("Manure & Organic Byproduct Revenue", formatter.format(manureRevenue));
    drawRow("GROSS REVENUE", formatter.format(salesCalculation.grossRevenue), false, true);
    drawDivider();

    // 4. Executive KPIs
    drawRow("4. EXECUTIVE FINANCIAL KPIS", "", true);
    drawRow("NET BATCH PROFIT", formatter.format(financialTotals.netProfit), false, true);
    drawRow("Net Cash Flow per Month", formatter.format(financialTotals.monthlyNetCashFlow));
    drawRow("Operating Profit Margin", `${financialTotals.profitMargin.toFixed(1)}%`);
    drawRow("Return on Investment (ROI)", `${financialTotals.roi.toFixed(1)}%`);
    if (isEggSales && financialTotals.breakevenEggPricePerTray) {
      drawRow("Breakeven Egg Price", `${formatter.format(financialTotals.breakevenEggPricePerTray)} / tray`);
    } else if (financialTotals.breakevenMeatPricePerKg) {
      drawRow("Breakeven Meat Price", `${formatter.format(financialTotals.breakevenMeatPricePerKg)} / kg`);
    }
    drawRow(
      "Equipment Capex Payback",
      financialTotals.paybackPeriod ? `${financialTotals.paybackPeriod.toFixed(1)} months` : "N/A"
    );

    // Footer
    const footerY = pageHeight - 15;
    doc.setFontSize(8.5);
    doc.setTextColor(120);
    doc.text(
      `Generated on ${new Date().toLocaleDateString()} | SmartVet & River Poultry Farm Advisory`,
      leftMargin,
      footerY
    );
    doc.text(`Page 1 of 1`, rightMargin, footerY, { align: "right" });

    return doc;
  };

  const handleDownloadPDF = async () => {
    try {
      await userTrackingService.trackUserLead({
        toolName: "budgetCalculator",
        action: "pdf_download",
        contactInfo: {
          email: contactInfo.email,
          phone: contactInfo.phone,
          countryCode: contactInfo.countryCode,
        },
        toolData: {
          birdType,
          numBirds,
          productionPeriod: feedCalculation.growingWeeks,
          totalCosts: financialTotals.totalOperatingCost,
          netProfit: financialTotals.netProfit,
        },
      });
    } catch {
      // Tracking error handled gracefully
    }

    const doc = generatePDF();
    doc.save(`Poultry_Budget_${birdType}_${numBirds}_birds.pdf`);
  };

  const handleSendEmail = async () => {
    if (!contactInfo.email) {
      alert("Please enter a valid email address first.");
      return;
    }

    try {
      await userTrackingService.trackUserLead({
        toolName: "budgetCalculator",
        action: "email_request",
        contactInfo: {
          email: contactInfo.email,
          phone: contactInfo.phone,
          countryCode: contactInfo.countryCode,
        },
        toolData: {
          birdType,
          numBirds,
          productionPeriod: feedCalculation.growingWeeks,
          totalCosts: financialTotals.totalOperatingCost,
          netProfit: financialTotals.netProfit,
        },
      });
    } catch {
      // Ignore lead tracking failures
    }

    try {
      const doc = generatePDF();
      const pdfBlob = doc.output("blob");
      const base64PDF = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64 = reader.result?.toString().split(",")[1];
          resolve(base64 || "");
        };
        reader.readAsDataURL(pdfBlob);
      });

      const emailData = {
        to: contactInfo.email,
        recipientName: contactInfo.phone
          ? `Farmer (${contactInfo.countryCode}${contactInfo.phone})`
          : "Valued Customer",
        subject: EMAIL_CONFIG.SUBJECT_TEMPLATE,
        htmlContent: generateEmailTemplate({
          birdType,
          numBirds,
          productionPeriod: feedCalculation.growingWeeks,
          ageUnit: "weeks",
          totalCosts: formatter.format(financialTotals.totalOperatingCost),
          netProfit: formatter.format(financialTotals.netProfit),
          contactPhone: contactInfo.phone ? `${contactInfo.countryCode}${contactInfo.phone}` : "",
        }),
        pdfBase64: base64PDF,
        pdfFilename: `River_Poultry_${birdType}_Budget.pdf`,
      };

      const response = await fetch(`${EMAIL_CONFIG.BACKEND_API_URL}/api/send-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(emailData),
      });

      if (response.ok) {
        alert(`Detailed budget report successfully dispatched to ${contactInfo.email}!`);
      } else {
        throw new Error("Failed to send email via backend");
      }
    } catch {
      // Fallback to mailto
      const doc = generatePDF();
      doc.save(`Poultry_Budget_${birdType}.pdf`);
      window.open(
        `mailto:${contactInfo.email}?subject=Your%20Poultry%20Budget%20Report&body=Attached%20is%20your%20commercial%20poultry%20budget%20report.`
      );
      alert("Report downloaded! You can now send it to your email address.");
    }
  };

  return (
    <Box sx={{ bgcolor: "#F1F6F2", minHeight: "100vh", pb: 8 }}>
      <HeroSection
        title="SmartVet Commercial Budget Engine"
        subtitle="Dynamic multi-stage feed formulation, capex scaling & egg/meat financial model"
        description="Standardized against Cobb500, Ross308, and East African commercial poultry benchmarks. Formulate exact feed stages, equipment, staff duration, and cash flow."
      />

      {/* Quick Breed Switcher Card */}
      <Card sx={{ maxWidth: 1100, mx: "auto", mt: -4, mb: 3, borderRadius: 3, boxShadow: 2 }}>
        <CardContent sx={{ py: 2 }}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", sm: "center" }}
            spacing={2}
          >
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#145C2E" }}>
                Active Production Preset:
              </Typography>
              <Chip
                label={birdType.toUpperCase()}
                color="success"
                size="small"
                sx={{ fontWeight: 700 }}
              />
            </Stack>

            <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", gap: 1 }}>
              <Button
                size="small"
                variant={birdType === "layers" ? "contained" : "outlined"}
                color="success"
                onClick={() => handleBreedChange("layers")}
              >
                Commercial Layers
              </Button>
              <Button
                size="small"
                variant={birdType === "broilers" ? "contained" : "outlined"}
                color="success"
                onClick={() => handleBreedChange("broilers")}
              >
                Fast Broilers
              </Button>
              <Button
                size="small"
                variant={birdType === "sasso/kroilers" ? "contained" : "outlined"}
                color="success"
                onClick={() => handleBreedChange("sasso/kroilers")}
              >
                Dual-Purpose (Sasso)
              </Button>
              <Button
                size="small"
                variant={birdType === "local" ? "contained" : "outlined"}
                color="success"
                onClick={() => handleBreedChange("local")}
              >
                Indigenous / Local
              </Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      {/* Main Stepper Container */}
      <Card sx={{ maxWidth: 1100, mx: "auto", p: { xs: 2, md: 4 }, borderRadius: 4, boxShadow: 4 }}>
        <CardContent>
          <Stepper activeStep={activeStep} orientation="vertical">
            {/* STEP 0: Flock Basics */}
            <Step>
              <StepLabel>
                <Typography variant="h6" sx={{ fontWeight: 700, color: "#16241C" }}>
                  1. Flock Basics & Upfront Stocking
                </Typography>
              </StepLabel>
              <StepContent>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Define your initial flock population, chick prices, transport logistics, and expected mortality.
                </Typography>

                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <TextField
                      label="Flock Size (Number of Birds)"
                      type="number"
                      fullWidth
                      value={numBirds}
                      onChange={(e) => setNumBirds(Math.max(1, parseInt(e.target.value) || 0))}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <TextField
                      label={`Day-Old Chick Cost (${currencyCode})`}
                      type="number"
                      fullWidth
                      value={docCostPerChick}
                      onChange={(e) => setDocCostPerChick(parseFloat(e.target.value) || 0)}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <TextField
                      label={`Chick Transport / Delivery (${currencyCode})`}
                      type="number"
                      fullWidth
                      value={transportCost}
                      onChange={(e) => setTransportCost(parseFloat(e.target.value) || 0)}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <TextField
                      label="Expected Mortality Rate (%)"
                      type="number"
                      fullWidth
                      value={mortalityRate}
                      onChange={(e) => setMortalityRate(Math.min(100, Math.max(0, parseFloat(e.target.value) || 0)))}
                      helperText={`${Math.round(salesCalculation.survivors).toLocaleString()} expected survivors`}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <TextField
                      label="Starter Crumble (kg / bird)"
                      type="number"
                      fullWidth
                      value={crumbleKg}
                      onChange={(e) => setCrumbleKg(parseFloat(e.target.value) || 0)}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <TextField
                      label={`Starter Crumble Cost (${currencyCode}/kg)`}
                      type="number"
                      fullWidth
                      value={crumbleCost}
                      onChange={(e) => setCrumbleCost(parseFloat(e.target.value) || 0)}
                    />
                  </Grid>
                </Grid>

                <Alert severity="info" sx={{ mt: 3, mb: 2 }}>
                  <strong>Flock Stocking Subtotal:</strong> {formatter.format(chicksCostTotal + crumbleTotal)} (Includes Day-Old Chicks + Transport + Initial Crumble).
                </Alert>

                <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
                  <Button variant="contained" color="success" onClick={handleNext} endIcon={<ArrowForward />}>
                    Continue to Feed Stages
                  </Button>
                </Stack>
              </StepContent>
            </Step>

            {/* STEP 1: Multi-Stage Feeding Strategy */}
            <Step>
              <StepLabel>
                <Typography variant="h6" sx={{ fontWeight: 700, color: "#16241C" }}>
                  2. Multi-Stage Feed Formulation
                </Typography>
              </StepLabel>
              <StepContent>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Commercial poultry feeding transitions across distinct nutritional stages. Each stage uses a precise recipe
                  calculated from ingredient parts per ton (1,000 kg).
                </Typography>

                <Stack spacing={3}>
                  {feedStages.map((stage, stageIdx) => {
                    const stageCalc = feedCalculation.stages[stageIdx];
                    return (
                      <Paper
                        key={stage.id}
                        variant="outlined"
                        sx={{ p: 2.5, borderRadius: 3, borderColor: "#D2E0D6", bgcolor: "#FAFCFA" }}
                      >
                        <Stack
                          direction={{ xs: "column", sm: "row" }}
                          justifyContent="space-between"
                          alignItems={{ xs: "flex-start", sm: "center" }}
                          spacing={2}
                          sx={{ mb: 2 }}
                        >
                          <Box>
                            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "#145C2E" }}>
                              {stage.name} ({stage.range})
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {stage.mode === "daily"
                                ? `${stage.gramsPerBirdDay} g/bird/day across ${stage.weeks} weeks`
                                : `${stage.kgPerBird} kg total per bird across ${stage.weeks} weeks`}
                            </Typography>
                          </Box>

                          <Stack direction="row" spacing={1} alignItems="center">
                            <TextField
                              size="small"
                              label="Weeks"
                              type="number"
                              sx={{ width: 90 }}
                              value={stage.weeks}
                              onChange={(e) => {
                                const val = parseFloat(e.target.value) || 0;
                                setFeedStages((prev) =>
                                  prev.map((s, idx) => (idx === stageIdx ? { ...s, weeks: val } : s))
                                );
                              }}
                            />
                            {stage.mode === "daily" ? (
                              <TextField
                                size="small"
                                label="g / bird / day"
                                type="number"
                                sx={{ width: 130 }}
                                value={stage.gramsPerBirdDay}
                                onChange={(e) => {
                                  const val = parseFloat(e.target.value) || 0;
                                  setFeedStages((prev) =>
                                    prev.map((s, idx) =>
                                      idx === stageIdx ? { ...s, gramsPerBirdDay: val } : s
                                    )
                                  );
                                }}
                              />
                            ) : (
                              <TextField
                                size="small"
                                label="kg / bird"
                                type="number"
                                sx={{ width: 110 }}
                                value={stage.kgPerBird}
                                onChange={(e) => {
                                  const val = parseFloat(e.target.value) || 0;
                                  setFeedStages((prev) =>
                                    prev.map((s, idx) => (idx === stageIdx ? { ...s, kgPerBird: val } : s))
                                  );
                                }}
                              />
                            )}
                          </Stack>
                        </Stack>

                        <TableContainer component={Paper} elevation={0} sx={{ border: "1px solid #E2EBE5" }}>
                          <Table size="small">
                            <TableHead sx={{ bgcolor: "#E7F0EA" }}>
                              <TableRow>
                                <TableCell sx={{ fontWeight: 700 }}>Raw Material / Ingredient</TableCell>
                                <TableCell sx={{ fontWeight: 700 }} align="right">
                                  Parts / 1000kg
                                </TableCell>
                                <TableCell sx={{ fontWeight: 700 }} align="right">
                                  Price / kg ({currencyCode})
                                </TableCell>
                                <TableCell sx={{ fontWeight: 700 }} align="right">
                                  Batch Buy (kg)
                                </TableCell>
                                <TableCell sx={{ fontWeight: 700 }} align="right">
                                  Cost ({currencyCode})
                                </TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {stage.recipe.map((ingr, ingrIdx) => {
                                const ingrCalc = stageCalc?.ingredients[ingrIdx];
                                return (
                                  <TableRow key={ingr.id}>
                                    <TableCell>{ingr.name}</TableCell>
                                    <TableCell align="right" sx={{ width: 130 }}>
                                      <TextField
                                        size="small"
                                        type="number"
                                        value={ingr.parts}
                                        onChange={(e) => {
                                          const val = parseFloat(e.target.value) || 0;
                                          setFeedStages((prev) =>
                                            prev.map((s, sI) => {
                                              if (sI !== stageIdx) return s;
                                              const updatedRecipe = s.recipe.map((r, rI) =>
                                                rI === ingrIdx ? { ...r, parts: val } : r
                                              );
                                              return { ...s, recipe: updatedRecipe };
                                            })
                                          );
                                        }}
                                      />
                                    </TableCell>
                                    <TableCell align="right" sx={{ width: 140 }}>
                                      <TextField
                                        size="small"
                                        type="number"
                                        value={ingr.cost}
                                        onChange={(e) => {
                                          const val = parseFloat(e.target.value) || 0;
                                          setFeedStages((prev) =>
                                            prev.map((s, sI) => {
                                              if (sI !== stageIdx) return s;
                                              const updatedRecipe = s.recipe.map((r, rI) =>
                                                rI === ingrIdx ? { ...r, cost: val } : r
                                              );
                                              return { ...s, recipe: updatedRecipe };
                                            })
                                          );
                                        }}
                                      />
                                    </TableCell>
                                    <TableCell align="right">
                                      {ingrCalc ? Math.round(ingrCalc.buyKg).toLocaleString() : 0} kg
                                    </TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 600 }}>
                                      {ingrCalc ? formatter.format(ingrCalc.costTotal) : 0}
                                    </TableCell>
                                  </TableRow>
                                );
                              })}

                              {/* Stage summary row */}
                              <TableRow sx={{ bgcolor: "#F5FAF6" }}>
                                <TableCell sx={{ fontWeight: 700 }}>Stage Total</TableCell>
                                <TableCell align="right" sx={{ fontWeight: 700 }}>
                                  {stageCalc?.totalParts.toLocaleString()} parts
                                </TableCell>
                                <TableCell align="right">—</TableCell>
                                <TableCell align="right" sx={{ fontWeight: 700 }}>
                                  {stageCalc ? Math.round(stageCalc.stageKg).toLocaleString() : 0} kg
                                </TableCell>
                                <TableCell align="right" sx={{ fontWeight: 700, color: "#145C2E" }}>
                                  {stageCalc ? formatter.format(stageCalc.stageCost) : 0}
                                </TableCell>
                              </TableRow>
                            </TableBody>
                          </Table>
                        </TableContainer>
                      </Paper>
                    );
                  })}
                </Stack>

                <Alert severity="success" sx={{ mt: 3, mb: 2 }}>
                  <strong>Total Feed Requirement:</strong>{" "}
                  {Math.round(feedCalculation.totalFeedKg).toLocaleString()} kg across{" "}
                  {feedCalculation.growingWeeks} growing weeks. Total Feed Cost:{" "}
                  <strong>{formatter.format(feedCalculation.totalFeedCost)}</strong>.
                </Alert>

                <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
                  <Button variant="outlined" onClick={handleBack} startIcon={<ArrowBack />}>
                    Back
                  </Button>
                  <Button variant="contained" color="success" onClick={handleNext} endIcon={<ArrowForward />}>
                    Continue to Health & Vaccines
                  </Button>
                </Stack>
              </StepContent>
            </Step>

            {/* STEP 2: Health, Vaccines & Biosecurity */}
            <Step>
              <StepLabel>
                <Typography variant="h6" sx={{ fontWeight: 700, color: "#16241C" }}>
                  3. Health, Vaccines & Biosecurity
                </Typography>
              </StepLabel>
              <StepContent>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Vaccines are dosed in vials (1,000 birds/vial), while preventative treatments and disinfectants scale by bird count.
                </Typography>

                <TableContainer component={Paper} elevation={0} sx={{ border: "1px solid #E2EBE5", mb: 3 }}>
                  <Table size="small">
                    <TableHead sx={{ bgcolor: "#E7F0EA" }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 700 }}>Item / Vaccine Program</TableCell>
                        <TableCell sx={{ fontWeight: 700 }} align="center">
                          Dosing Type
                        </TableCell>
                        <TableCell sx={{ fontWeight: 700 }} align="right">
                          Rate / Doses
                        </TableCell>
                        <TableCell sx={{ fontWeight: 700 }} align="right">
                          Unit Cost ({currencyCode})
                        </TableCell>
                        <TableCell sx={{ fontWeight: 700 }} align="right">
                          Total ({currencyCode})
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {healthCalculation.items.map((item, idx) => (
                        <TableRow key={item.id}>
                          <TableCell>{item.name}</TableCell>
                          <TableCell align="center">
                            <Chip
                              size="small"
                              label={item.vial ? "1,000-dose vial" : "Per 1,000 birds"}
                              variant="outlined"
                              color={item.vial ? "primary" : "default"}
                            />
                          </TableCell>
                          <TableCell align="right">
                            {item.vial ? `${item.qty} vials` : `${item.qty.toFixed(2)} units`}
                          </TableCell>
                          <TableCell align="right" sx={{ width: 140 }}>
                            <TextField
                              size="small"
                              type="number"
                              value={item.cost}
                              onChange={(e) => {
                                const val = parseFloat(e.target.value) || 0;
                                setHealthItems((prev) =>
                                  prev.map((h, hI) => (hI === idx ? { ...h, cost: val } : h))
                                );
                              }}
                            />
                          </TableCell>
                          <TableCell align="right" sx={{ fontWeight: 600 }}>
                            {formatter.format(item.totalCost)}
                          </TableCell>
                        </TableRow>
                      ))}

                      {/* Water & Brooding utility row */}
                      <TableRow sx={{ bgcolor: "#F5FAF6" }}>
                        <TableCell colSpan={3} sx={{ fontWeight: 700 }}>
                          Farm Water & Sanitation Utilities
                        </TableCell>
                        <TableCell align="right">
                          <TextField
                            size="small"
                            type="number"
                            value={waterCost}
                            onChange={(e) => setWaterCost(parseFloat(e.target.value) || 0)}
                          />
                        </TableCell>
                        <TableCell align="right" sx={{ fontWeight: 700 }}>
                          {formatter.format(waterCost)}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>

                <Alert severity="info" sx={{ mb: 2 }}>
                  <strong>Health & Biosecurity Total:</strong>{" "}
                  {formatter.format(healthCalculation.grandHealthTotal)}
                </Alert>

                <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
                  <Button variant="outlined" onClick={handleBack} startIcon={<ArrowBack />}>
                    Back
                  </Button>
                  <Button variant="contained" color="success" onClick={handleNext} endIcon={<ArrowForward />}>
                    Continue to Equipment & Housing
                  </Button>
                </Stack>
              </StepContent>
            </Step>

            {/* STEP 3: Housing & Equipment Capex */}
            <Step>
              <StepLabel>
                <Typography variant="h6" sx={{ fontWeight: 700, color: "#16241C" }}>
                  4. Housing & Equipment (Capex)
                </Typography>
              </StepLabel>
              <StepContent>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Equipment scales proportionally with bird density (e.g., 1 drinker per 100 birds) alongside fixed plumbing, storage, and biosecurity assets.
                </Typography>

                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#145C2E", mb: 1 }}>
                  Ratio-Scaled Equipment
                </Typography>
                <TableContainer component={Paper} elevation={0} sx={{ border: "1px solid #E2EBE5", mb: 3 }}>
                  <Table size="small">
                    <TableHead sx={{ bgcolor: "#E7F0EA" }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 700 }}>Equipment Item</TableCell>
                        <TableCell sx={{ fontWeight: 700 }} align="right">
                          Ratio (Birds per Unit)
                        </TableCell>
                        <TableCell sx={{ fontWeight: 700 }} align="right">
                          Required Units
                        </TableCell>
                        <TableCell sx={{ fontWeight: 700 }} align="right">
                          Unit Cost ({currencyCode})
                        </TableCell>
                        <TableCell sx={{ fontWeight: 700 }} align="right">
                          Total ({currencyCode})
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {equipmentCalculation.ratioItems.map((item, idx) => (
                        <TableRow key={item.id}>
                          <TableCell>{item.name}</TableCell>
                          <TableCell align="right" sx={{ width: 140 }}>
                            <TextField
                              size="small"
                              type="number"
                              value={item.per}
                              onChange={(e) => {
                                const val = parseFloat(e.target.value) || 1;
                                setEquipRatioItems((prev) =>
                                  prev.map((er, erI) => (erI === idx ? { ...er, per: val } : er))
                                );
                              }}
                            />
                          </TableCell>
                          <TableCell align="right">{item.qty.toLocaleString()} units</TableCell>
                          <TableCell align="right" sx={{ width: 140 }}>
                            <TextField
                              size="small"
                              type="number"
                              value={item.cost}
                              onChange={(e) => {
                                const val = parseFloat(e.target.value) || 0;
                                setEquipRatioItems((prev) =>
                                  prev.map((er, erI) => (erI === idx ? { ...er, cost: val } : er))
                                );
                              }}
                            />
                          </TableCell>
                          <TableCell align="right" sx={{ fontWeight: 600 }}>
                            {formatter.format(item.totalCost)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>

                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#145C2E", mb: 1 }}>
                  Fixed / Flat Capex Items
                </Typography>
                <TableContainer component={Paper} elevation={0} sx={{ border: "1px solid #E2EBE5", mb: 3 }}>
                  <Table size="small">
                    <TableHead sx={{ bgcolor: "#E7F0EA" }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 700 }}>Item Description</TableCell>
                        <TableCell sx={{ fontWeight: 700 }} align="right">
                          Quantity
                        </TableCell>
                        <TableCell sx={{ fontWeight: 700 }} align="right">
                          Unit Cost ({currencyCode})
                        </TableCell>
                        <TableCell sx={{ fontWeight: 700 }} align="right">
                          Total ({currencyCode})
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {equipmentCalculation.flatItems.map((item, idx) => (
                        <TableRow key={item.id}>
                          <TableCell>{item.name}</TableCell>
                          <TableCell align="right" sx={{ width: 110 }}>
                            <TextField
                              size="small"
                              type="number"
                              value={item.qty}
                              onChange={(e) => {
                                const val = parseFloat(e.target.value) || 0;
                                setEquipFlatItems((prev) =>
                                  prev.map((ef, efI) => (efI === idx ? { ...ef, qty: val } : ef))
                                );
                              }}
                            />
                          </TableCell>
                          <TableCell align="right" sx={{ width: 140 }}>
                            <TextField
                              size="small"
                              type="number"
                              value={item.cost}
                              onChange={(e) => {
                                const val = parseFloat(e.target.value) || 0;
                                setEquipFlatItems((prev) =>
                                  prev.map((ef, efI) => (efI === idx ? { ...ef, cost: val } : ef))
                                );
                              }}
                            />
                          </TableCell>
                          <TableCell align="right" sx={{ fontWeight: 600 }}>
                            {formatter.format(item.totalCost)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>

                <Alert severity="info" sx={{ mb: 2 }}>
                  <strong>Total Equipment & Housing Investment:</strong>{" "}
                  {formatter.format(equipmentCalculation.totalCapex)} (Capital expenditure amortized across multiple batches).
                </Alert>

                <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
                  <Button variant="outlined" onClick={handleBack} startIcon={<ArrowBack />}>
                    Back
                  </Button>
                  <Button variant="contained" color="success" onClick={handleNext} endIcon={<ArrowForward />}>
                    Continue to Staffing
                  </Button>
                </Stack>
              </StepContent>
            </Step>

            {/* STEP 4: Staff & Cycle Duration */}
            <Step>
              <StepLabel>
                <Typography variant="h6" sx={{ fontWeight: 700, color: "#16241C" }}>
                  5. Farm Staffing & Labour Duration
                </Typography>
              </StepLabel>
              <StepContent>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Labour is calculated across the total flock cycle: growing period (
                  {staffCalculation.growingMonths.toFixed(1)} months) plus active sales/laying period (
                  {staffCalculation.salesMonths} months) ={" "}
                  <strong>{staffCalculation.totalCycleMonths.toFixed(1)} total months</strong>.
                </Typography>

                <TableContainer component={Paper} elevation={0} sx={{ border: "1px solid #E2EBE5", mb: 3 }}>
                  <Table size="small">
                    <TableHead sx={{ bgcolor: "#E7F0EA" }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 700 }}>Staff Role / Personnel</TableCell>
                        <TableCell sx={{ fontWeight: 700 }} align="right">
                          Staff Count
                        </TableCell>
                        <TableCell sx={{ fontWeight: 700 }} align="right">
                          Monthly Salary ({currencyCode})
                        </TableCell>
                        <TableCell sx={{ fontWeight: 700 }} align="right">
                          Monthly Total ({currencyCode})
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {staffItems.map((item, idx) => (
                        <TableRow key={item.id}>
                          <TableCell>{item.name}</TableCell>
                          <TableCell align="right" sx={{ width: 110 }}>
                            <TextField
                              size="small"
                              type="number"
                              value={item.qty}
                              onChange={(e) => {
                                const val = parseFloat(e.target.value) || 0;
                                setStaffItems((prev) =>
                                  prev.map((s, sI) => (sI === idx ? { ...s, qty: val } : s))
                                );
                              }}
                            />
                          </TableCell>
                          <TableCell align="right" sx={{ width: 150 }}>
                            <TextField
                              size="small"
                              type="number"
                              value={item.cost}
                              onChange={(e) => {
                                const val = parseFloat(e.target.value) || 0;
                                setStaffItems((prev) =>
                                  prev.map((s, sI) => (sI === idx ? { ...s, cost: val } : s))
                                );
                              }}
                            />
                          </TableCell>
                          <TableCell align="right" sx={{ fontWeight: 600 }}>
                            {formatter.format((item.qty || 0) * (item.cost || 0))}
                          </TableCell>
                        </TableRow>
                      ))}

                      <TableRow sx={{ bgcolor: "#F5FAF6" }}>
                        <TableCell colSpan={3} sx={{ fontWeight: 700 }}>
                          Monthly Farm Payroll
                        </TableCell>
                        <TableCell align="right" sx={{ fontWeight: 700, color: "#145C2E" }}>
                          {formatter.format(staffCalculation.monthlyStaffCost)} / mo
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>

                <Alert severity="success" sx={{ mb: 2 }}>
                  <strong>Cycle Labour Total:</strong>{" "}
                  {formatter.format(staffCalculation.totalStaffCost)} ({formatter.format(staffCalculation.monthlyStaffCost)}/mo × {staffCalculation.totalCycleMonths.toFixed(1)} months).
                </Alert>

                <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
                  <Button variant="outlined" onClick={handleBack} startIcon={<ArrowBack />}>
                    Back
                  </Button>
                  <Button variant="contained" color="success" onClick={handleNext} endIcon={<ArrowForward />}>
                    Continue to Sales Projections
                  </Button>
                </Stack>
              </StepContent>
            </Step>

            {/* STEP 5: Sales Projection & Laying Curve */}
            <Step>
              <StepLabel>
                <Typography variant="h6" sx={{ fontWeight: 700, color: "#16241C" }}>
                  6. Sales Projection & Laying Curve
                </Typography>
              </StepLabel>
              <StepContent>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {isEggSales
                    ? "Project egg collection trays month by month based on breed standard laying percentages, followed by spent hen sales."
                    : "Project live meat sales by target weight and market price per kg."}
                </Typography>

                {isEggSales ? (
                  <Box>
                    <Grid container spacing={2} sx={{ mb: 3 }}>
                      <Grid size={{ xs: 12, sm: 4 }}>
                        <TextField
                          label={`Egg Price per Tray (${currencyCode})`}
                          type="number"
                          fullWidth
                          value={eggPrice}
                          onChange={(e) => setEggPrice(parseFloat(e.target.value) || 0)}
                          helperText="30 eggs per tray"
                        />
                      </Grid>

                      <Grid size={{ xs: 12, sm: 4 }}>
                        <TextField
                          label={`Off-Layer Spent Hen Price (${currencyCode})`}
                          type="number"
                          fullWidth
                          value={offlayerPrice}
                          onChange={(e) => setOfflayerPrice(parseFloat(e.target.value) || 0)}
                          helperText="Value per cull bird at end of lay"
                        />
                      </Grid>

                      <Grid size={{ xs: 12, sm: 4 }}>
                        <TextField
                          label="Cull Birds Sold (%)"
                          type="number"
                          fullWidth
                          value={offlayerPct}
                          onChange={(e) => setOfflayerPct(parseFloat(e.target.value) || 0)}
                          helperText="Percentage of surviving flock sold"
                        />
                      </Grid>
                    </Grid>

                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#145C2E", mb: 1 }}>
                      Monthly Laying Rate Curve
                    </Typography>
                    <TableContainer component={Paper} elevation={0} sx={{ border: "1px solid #E2EBE5", mb: 3 }}>
                      <Table size="small">
                        <TableHead sx={{ bgcolor: "#E7F0EA" }}>
                          <TableRow>
                            <TableCell sx={{ fontWeight: 700 }}>Production Month</TableCell>
                            <TableCell sx={{ fontWeight: 700 }} align="center">
                              Laying Rate (%)
                            </TableCell>
                            <TableCell sx={{ fontWeight: 700 }} align="right">
                              Trays Collected
                            </TableCell>
                            <TableCell sx={{ fontWeight: 700 }} align="right">
                              Revenue ({currencyCode})
                            </TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {salesCalculation.monthlyEggSales.map((m, idx) => (
                            <TableRow key={m.month}>
                              <TableCell>Month {m.month}</TableCell>
                              <TableCell align="center" sx={{ width: 140 }}>
                                <TextField
                                  size="small"
                                  type="number"
                                  value={m.rate}
                                  onChange={(e) => {
                                    const val = parseFloat(e.target.value) || 0;
                                    setLayRateCurve((prev) =>
                                      prev.map((r, rI) => (rI === idx ? val : r))
                                    );
                                  }}
                                />
                              </TableCell>
                              <TableCell align="right">{m.trays.toLocaleString()} trays</TableCell>
                              <TableCell align="right" sx={{ fontWeight: 600 }}>
                                {formatter.format(m.revenue)}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Box>
                ) : (
                  <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid size={{ xs: 12, sm: 4 }}>
                      <TextField
                        label="Target Live Market Weight (kg)"
                        type="number"
                        fullWidth
                        value={marketWeight}
                        onChange={(e) => setMarketWeight(parseFloat(e.target.value) || 0)}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 4 }}>
                      <TextField
                        label={`Live Meat Price (${currencyCode}/kg)`}
                        type="number"
                        fullWidth
                        value={meatPrice}
                        onChange={(e) => setMeatPrice(parseFloat(e.target.value) || 0)}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 4 }}>
                      <TextField
                        label="Surviving Birds Marketed (%)"
                        type="number"
                        fullWidth
                        value={meatPct}
                        onChange={(e) => setMeatPct(parseFloat(e.target.value) || 0)}
                      />
                    </Grid>
                  </Grid>
                )}

                <Grid container spacing={2} sx={{ mb: 2 }}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      label={`Manure & Fertilizer Byproduct Revenue (${currencyCode})`}
                      type="number"
                      fullWidth
                      value={manureRevenue}
                      onChange={(e) => setManureRevenue(parseFloat(e.target.value) || 0)}
                    />
                  </Grid>
                </Grid>

                <Alert severity="success" sx={{ mb: 2 }}>
                  <strong>Gross Projected Revenue:</strong>{" "}
                  {formatter.format(salesCalculation.grossRevenue)} (
                  {isEggSales
                    ? `Eggs: ${formatter.format(salesCalculation.totalEggRevenue)} + Culls: ${formatter.format(salesCalculation.offlayerRevenue)} + Manure: ${formatter.format(manureRevenue)}`
                    : `Meat: ${formatter.format(salesCalculation.meatRevenue)} + Manure: ${formatter.format(manureRevenue)}`}
                  ).
                </Alert>

                <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
                  <Button variant="outlined" onClick={handleBack} startIcon={<ArrowBack />}>
                    Back
                  </Button>
                  <Button variant="contained" color="success" onClick={handleNext} endIcon={<ArrowForward />}>
                    View Executive Results & KPIs
                  </Button>
                </Stack>
              </StepContent>
            </Step>

            {/* STEP 6: Financial Results & KPIs */}
            <Step>
              <StepLabel>
                <Typography variant="h6" sx={{ fontWeight: 700, color: "#16241C" }}>
                  7. Executive Financial Summary & KPIs
                </Typography>
              </StepLabel>
              <StepContent>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Review comprehensive flock economics, operating margin, payback period, and breakeven thresholds.
                </Typography>

                {/* Status Banner */}
                <Paper
                  variant="outlined"
                  sx={{
                    p: 2.5,
                    borderRadius: 3,
                    mb: 3,
                    bgcolor:
                      financialTotals.netProfit > 0
                        ? financialTotals.profitMargin >= 15
                          ? "#E2F0DF"
                          : "#F6EAD2"
                        : "#F6DEDA",
                    borderColor:
                      financialTotals.netProfit > 0
                        ? financialTotals.profitMargin >= 15
                          ? "#A3D199"
                          : "#E0C28A"
                        : "#EAA69E",
                  }}
                >
                  <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems="center" spacing={2}>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 800, color: financialTotals.netProfit > 0 ? "#145C2E" : "#C13A2E" }}>
                        {financialTotals.netProfit > 0
                          ? financialTotals.profitMargin >= 15
                            ? "High-Performing Commercial Flock"
                            : "Profitable Batch (Moderate Margin)"
                          : "Loss-Making Batch (Action Required)"}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {financialTotals.netProfit > 0
                          ? `Projected Net Profit: ${formatter.format(financialTotals.netProfit)} with ${financialTotals.profitMargin.toFixed(1)}% operating margin.`
                          : `Projected Loss: ${formatter.format(financialTotals.netProfit)}. Review feed costs or increase stocking efficiency.`}
                      </Typography>
                    </Box>
                    <Chip
                      label={`ROI: ${financialTotals.roi.toFixed(1)}%`}
                      color={financialTotals.netProfit > 0 ? "success" : "error"}
                      sx={{ fontWeight: 800, fontSize: 16, px: 1, py: 2 }}
                    />
                  </Stack>
                </Paper>

                {/* KPI Cards Grid */}
                <Grid container spacing={2} sx={{ mb: 3 }}>
                  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, bgcolor: "#FAFCFA" }}>
                      <Typography variant="caption" color="text.secondary">
                        Total Operating Cost
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: "#16241C" }}>
                        {formatter.format(financialTotals.totalOperatingCost)}
                      </Typography>
                    </Paper>
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, bgcolor: "#FAFCFA" }}>
                      <Typography variant="caption" color="text.secondary">
                        Gross Revenue
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: "#1E8A47" }}>
                        {formatter.format(salesCalculation.grossRevenue)}
                      </Typography>
                    </Paper>
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, bgcolor: "#FAFCFA" }}>
                      <Typography variant="caption" color="text.secondary">
                        Net Profit
                      </Typography>
                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: 700,
                          color: financialTotals.netProfit >= 0 ? "#145C2E" : "#C13A2E",
                        }}
                      >
                        {formatter.format(financialTotals.netProfit)}
                      </Typography>
                    </Paper>
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, bgcolor: "#FAFCFA" }}>
                      <Typography variant="caption" color="text.secondary">
                        Net Cash Flow / Month
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: "#145C2E" }}>
                        {formatter.format(financialTotals.monthlyNetCashFlow)}
                      </Typography>
                    </Paper>
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, bgcolor: "#FAFCFA" }}>
                      <Typography variant="caption" color="text.secondary">
                        Equipment Capex
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: "#16241C" }}>
                        {formatter.format(financialTotals.equipmentCapex)}
                      </Typography>
                    </Paper>
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, bgcolor: "#FAFCFA" }}>
                      <Typography variant="caption" color="text.secondary">
                        Capex Payback Period
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: "#16241C" }}>
                        {financialTotals.paybackPeriod
                          ? `${financialTotals.paybackPeriod.toFixed(1)} months`
                          : "Unprofitable"}
                      </Typography>
                    </Paper>
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, bgcolor: "#FAFCFA" }}>
                      <Typography variant="caption" color="text.secondary">
                        {isEggSales ? "Breakeven Egg Price" : "Breakeven Meat Price"}
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: "#145C2E" }}>
                        {isEggSales && financialTotals.breakevenEggPricePerTray
                          ? `${formatter.format(financialTotals.breakevenEggPricePerTray)} / tray`
                          : financialTotals.breakevenMeatPricePerKg
                          ? `${formatter.format(financialTotals.breakevenMeatPricePerKg)} / kg`
                          : "—"}
                      </Typography>
                    </Paper>
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, bgcolor: "#FAFCFA" }}>
                      <Typography variant="caption" color="text.secondary">
                        Operating Margin
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: "#16241C" }}>
                        {financialTotals.profitMargin.toFixed(1)}%
                      </Typography>
                    </Paper>
                  </Grid>
                </Grid>

                {/* Visual Cost Composition Chart (SVG) */}
                <Paper variant="outlined" sx={{ p: 3, borderRadius: 3, mb: 3 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#145C2E", mb: 2 }}>
                    Cost & Capital Composition Breakdown
                  </Typography>

                  <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", my: 2 }}>
                    <svg width="280" height="280" viewBox="0 0 280 280">
                      {(() => {
                        const total =
                          chicksCostTotal +
                          feedCalculation.totalFeedCost +
                          healthCalculation.grandHealthTotal +
                          staffCalculation.totalStaffCost +
                          financialTotals.equipmentCapex;

                        if (total <= 0) return null;

                        const items = [
                          { label: "Feed", val: feedCalculation.totalFeedCost, color: "#1E8A47" },
                          { label: "Chicks", val: chicksCostTotal, color: "#C98A2B" },
                          { label: "Labour", val: staffCalculation.totalStaffCost, color: "#3B82F6" },
                          { label: "Health", val: healthCalculation.grandHealthTotal, color: "#8B5CF6" },
                          { label: "Capex", val: financialTotals.equipmentCapex, color: "#EC4899" },
                        ];

                        let accumulatedPercent = 0;
                        const radius = 100;
                        const centerX = 140;
                        const centerY = 140;

                        return (
                          <>
                            {items.map((item, i) => {
                              const pct = item.val / total;
                              const startAngle = accumulatedPercent * 2 * Math.PI - Math.PI / 2;
                              accumulatedPercent += pct;
                              const endAngle = accumulatedPercent * 2 * Math.PI - Math.PI / 2;

                              const x1 = centerX + radius * Math.cos(startAngle);
                              const y1 = centerY + radius * Math.sin(startAngle);
                              const x2 = centerX + radius * Math.cos(endAngle);
                              const y2 = centerY + radius * Math.sin(endAngle);

                              const largeArc = pct > 0.5 ? 1 : 0;
                              const pathData = `M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;

                              return <path key={i} d={pathData} fill={item.color} stroke="#FFFFFF" strokeWidth="2" />;
                            })}
                            <circle cx={centerX} cy={centerY} r="50" fill="#FFFFFF" />
                            <text
                              x={centerX}
                              y={centerY - 5}
                              textAnchor="middle"
                              fill="#16241C"
                              fontSize="11"
                              fontWeight="bold"
                            >
                              Total Cost
                            </text>
                            <text
                              x={centerX}
                              y={centerY + 14}
                              textAnchor="middle"
                              fill="#52685A"
                              fontSize="9"
                            >
                              {formatter.format(total)}
                            </text>
                          </>
                        );
                      })()}
                    </svg>
                  </Box>

                  <Stack direction="row" spacing={2} justifyContent="center" sx={{ flexWrap: "wrap", gap: 1 }}>
                    <Chip size="small" sx={{ bgcolor: "#1E8A47", color: "#fff", fontWeight: 600 }} label="Feed" />
                    <Chip size="small" sx={{ bgcolor: "#C98A2B", color: "#fff", fontWeight: 600 }} label="Chicks & Stock" />
                    <Chip size="small" sx={{ bgcolor: "#3B82F6", color: "#fff", fontWeight: 600 }} label="Staff & Labour" />
                    <Chip size="small" sx={{ bgcolor: "#8B5CF6", color: "#fff", fontWeight: 600 }} label="Health & Water" />
                    <Chip size="small" sx={{ bgcolor: "#EC4899", color: "#fff", fontWeight: 600 }} label="Housing & Equipment" />
                  </Stack>
                </Paper>

                {/* Lead capture & PDF / Email Action Section */}
                <Paper variant="outlined" sx={{ p: 3, borderRadius: 3, bgcolor: "#F5FAF6", borderColor: "#D2E0D6", mb: 3 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "#145C2E", mb: 1 }}>
                    Export Official Commercial Budget Report
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Download a high-resolution PDF report complete with detailed ingredient formulas, vaccine schedules, equipment lists, and financial KPIs, or email it directly.
                  </Typography>

                  <Grid container spacing={2} sx={{ mb: 2 }}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Farmer / Business Email"
                        type="email"
                        value={contactInfo.email}
                        onChange={(e) => setContactInfo((prev) => ({ ...prev, email: e.target.value }))}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Phone Number"
                        value={contactInfo.phone}
                        onChange={(e) => setContactInfo((prev) => ({ ...prev, phone: e.target.value }))}
                      />
                    </Grid>
                  </Grid>

                  <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                    <Button
                      variant="contained"
                      color="success"
                      startIcon={<Download />}
                      onClick={handleDownloadPDF}
                    >
                      Download Executive PDF
                    </Button>
                    <Button
                      variant="outlined"
                      color="success"
                      startIcon={<Email />}
                      onClick={handleSendEmail}
                    >
                      Email Me the Report
                    </Button>
                  </Stack>
                </Paper>

                {/* Stepper Footer Controls */}
                <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
                  <Button variant="outlined" onClick={handleBack} startIcon={<ArrowBack />}>
                    Back to Projections
                  </Button>
                  <Button variant="outlined" color="secondary" onClick={handleReset} startIcon={<Refresh />}>
                    Reset All Inputs
                  </Button>
                </Stack>
              </StepContent>
            </Step>
          </Stepper>
        </CardContent>
      </Card>
    </Box>
  );
};

export default BudgetCalculator;
