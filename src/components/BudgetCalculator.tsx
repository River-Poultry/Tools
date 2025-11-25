import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Stack,
  TextField,
  Typography,
  Button,
  MenuItem,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Paper,
  Divider,
  IconButton,
} from "@mui/material";
import { Add, Delete, Download, Email } from "@mui/icons-material";
import HeroSection from "./HeroSection";
import jsPDF from "jspdf";
import logoImg from "../assets/logo.png";
import { EMAIL_CONFIG, generateEmailTemplate } from "../config/email";
import { COUNTRY_CODES, DEFAULT_CURRENCY, DEFAULT_COUNTRY_CODE } from "../constants";
import { userTrackingService } from "../services/userTrackingService";

type BirdType = "layers" | "broilers" | "sasso/kroilers" | "local";
type FeedItem = { id: string; name: string; kgPerTon: number; pricePerKg: number };
type VaccinationItem = { id: string; name: string; age: number; cost: number; notes: string };
type DrugTreatmentItem = { id: string; name: string; age: number; cost: number; notes: string };
type FeedType = "ingredients" | "complete";
type CompleteFeedStage = "prestarter" | "starter" | "grower" | "finisher";
type CompleteFeedItem = { stage: CompleteFeedStage; pricePerKg: number; kgPerTon: number };



// Predefined feed ingredients with suggested quantities based on industry standards
const PREDEFINED_FEED_INGREDIENTS = {
  layers: [
    { name: "Maize", suggestedKgPerTon: 550, pricePerKg: 0 },
    { name: "Soybean Meal", suggestedKgPerTon: 250, pricePerKg: 0 },
    { name: "Sunflower Cake", suggestedKgPerTon: 100, pricePerKg: 0 },
    { name: "Layer Concentrate (5%)", suggestedKgPerTon: 50, pricePerKg: 0 },
    { name: "Layer Concentrate (20%)", suggestedKgPerTon: 30, pricePerKg: 0 },
    { name: "Stock Feed Lime", suggestedKgPerTon: 20, pricePerKg: 0 },
  ],
  broilers: [
    { name: "Maize", suggestedKgPerTon: 580, pricePerKg: 0 },
    { name: "Soybean Meal", suggestedKgPerTon: 280, pricePerKg: 0 },
    { name: "Sunflower Cake", suggestedKgPerTon: 80, pricePerKg: 0 },
    { name: "Broiler Concentrate (5%)", suggestedKgPerTon: 40, pricePerKg: 0 },
    { name: "Broiler Concentrate (20%)", suggestedKgPerTon: 20, pricePerKg: 0 },
    { name: "Stock Feed Lime", suggestedKgPerTon: 0, pricePerKg: 0 },
  ],
  "sasso/kroilers": [
    { name: "Maize", suggestedKgPerTon: 570, pricePerKg: 0 },
    { name: "Soybean Meal", suggestedKgPerTon: 270, pricePerKg: 0 },
    { name: "Sunflower Cake", suggestedKgPerTon: 90, pricePerKg: 0 },
    { name: "Broiler Concentrate (5%)", suggestedKgPerTon: 45, pricePerKg: 0 },
    { name: "Broiler Concentrate (20%)", suggestedKgPerTon: 25, pricePerKg: 0 },
    { name: "Stock Feed Lime", suggestedKgPerTon: 0, pricePerKg: 0 },
  ],
  local: [
    { name: "Maize", suggestedKgPerTon: 550, pricePerKg: 0 },
    { name: "Soybean Meal", suggestedKgPerTon: 250, pricePerKg: 0 },
    { name: "Sunflower Cake", suggestedKgPerTon: 100, pricePerKg: 0 },
    { name: "Layer Concentrate (5%)", suggestedKgPerTon: 50, pricePerKg: 0 },
    { name: "Layer Concentrate (20%)", suggestedKgPerTon: 30, pricePerKg: 0 },
    { name: "Stock Feed Lime", suggestedKgPerTon: 20, pricePerKg: 0 },
  ],
};

// Suggested complete feed quantities based on Cobb500 and industry standards
const SUGGESTED_COMPLETE_FEED_QUANTITIES: Record<BirdType, Array<{ stage: CompleteFeedStage; suggestedKgPerTon: number; description: string }>> = {
  broilers: [
    { stage: "prestarter", suggestedKgPerTon: 0, description: "Day 1-7 (Optional)" },
    { stage: "starter", suggestedKgPerTon: 200, description: "Day 8-14 (1.5kg per bird)" },
    { stage: "grower", suggestedKgPerTon: 400, description: "Day 15-28 (3.0kg per bird)" },
    { stage: "finisher", suggestedKgPerTon: 400, description: "Day 29+ (4.5kg per bird)" },
  ],
  layers: [
    { stage: "prestarter", suggestedKgPerTon: 0, description: "Week 1-2 (Optional)" },
    { stage: "starter", suggestedKgPerTon: 300, description: "Week 3-6 (1.5kg per bird)" },
    { stage: "grower", suggestedKgPerTon: 700, description: "Week 7-20 (6.0kg per bird)" },
    { stage: "finisher", suggestedKgPerTon: 0, description: "Week 21+ (Layer feed)" },
  ],
  "sasso/kroilers": [
    { stage: "prestarter", suggestedKgPerTon: 0, description: "Day 1-7 (Optional)" },
    { stage: "starter", suggestedKgPerTon: 200, description: "Day 8-14 (1.5kg per bird)" },
    { stage: "grower", suggestedKgPerTon: 400, description: "Day 15-28 (3.0kg per bird)" },
    { stage: "finisher", suggestedKgPerTon: 400, description: "Day 29+ (4.5kg per bird)" },
  ],
  local: [
    { stage: "prestarter", suggestedKgPerTon: 0, description: "Week 1-2 (Optional)" },
    { stage: "starter", suggestedKgPerTon: 300, description: "Week 3-6 (1.5kg per bird)" },
    { stage: "grower", suggestedKgPerTon: 700, description: "Week 7-20 (6.0kg per bird)" },
    { stage: "finisher", suggestedKgPerTon: 0, description: "Week 21+ (Layer feed)" },
  ],
};

// Recommended vaccines based on Merck Veterinary Manual (https://www.merckvetmanual.com/poultry/nutrition-and-management-poultry/vaccination-programs-for-poultry)
const RECOMMENDED_VACCINES = {
  broilers: [
    { name: "Marek Disease Vaccine", typicalAge: 1, notes: "Subcutaneous injection - Done at hatchery (in ovo at 17-19 days embryonation)" },
    { name: "Newcastle Disease Vaccine", typicalAge: 1, notes: "Coarse spray - Done at hatchery for broilers" },
    { name: "Infectious Bronchitis Vaccine", typicalAge: 1, notes: "Coarse spray - Massachusetts strain, often combined with Newcastle" },
    { name: "Newcastle Disease Booster", typicalAge: 7, notes: "Drinking water or coarse spray - Optional 2nd dose for broilers" },
    { name: "Infectious Bronchitis Booster", typicalAge: 7, notes: "Drinking water or coarse spray - Massachusetts strain booster" },
    { name: "Infectious Bursal Disease (IBD)", typicalAge: 14, notes: "Drinking water - Intermediate strain, protects immune system" },
    { name: "Newcastle Disease Final", typicalAge: 21, notes: "Drinking water or coarse spray - Final booster for market birds" },
  ],
  layers: [
    { name: "Marek Disease Vaccine", typicalAge: 1, notes: "Subcutaneous injection - Done at hatchery (in ovo at 17-19 days embryonation)" },
    { name: "Tenosynovitis Vaccine", typicalAge: 6, notes: "Subcutaneous injection - Live mild strain" },
    { name: "Newcastle Disease/Infectious Bronchitis", typicalAge: 14, notes: "Drinking water - B1/Massachusetts combined vaccine" },
    { name: "Infectious Bursal Disease (IBD)", typicalAge: 14, notes: "Drinking water - Intermediate strain" },
    { name: "Newcastle Disease/Infectious Bronchitis", typicalAge: 28, notes: "Drinking water or coarse spray - B1/Massachusetts booster" },
    { name: "Tenosynovitis Booster", typicalAge: 42, notes: "Subcutaneous injection - Live mild strain booster" },
    { name: "Infectious Bursal Disease Booster", typicalAge: 56, notes: "Drinking water or coarse spray - Live strain" },
    { name: "Newcastle Disease/Infectious Bronchitis", typicalAge: 56, notes: "Drinking water or coarse spray - B1 or LaSota/Massachusetts" },
    { name: "Avian Encephalomyelitis", typicalAge: 70, notes: "Wing web - Live chick-embryo origin" },
    { name: "Fowl Pox Vaccine", typicalAge: 70, notes: "Wing web - Modified live vaccine" },
    { name: "Chicken Infectious Anemia", typicalAge: 70, notes: "Drinking water - Live vaccine" },
    { name: "Newcastle Disease (Inactivated)", typicalAge: 98, notes: "Subcutaneous injection - Killed vaccine for long-term protection" },
    { name: "Infectious Bronchitis (Inactivated)", typicalAge: 98, notes: "Subcutaneous injection - Killed vaccine booster" },
    { name: "Egg Drop Syndrome", typicalAge: 98, notes: "Subcutaneous injection - Prevents egg production drops" },
    { name: "Fowl Cholera", typicalAge: 126, notes: "Drinking water (live) or subcutaneous (inactivated)" },
    { name: "Newcastle Disease Booster", typicalAge: 147, notes: "Drinking water or spray - LaSota strain" },
    { name: "Fowl Cholera Booster", typicalAge: 168, notes: "Drinking water (live) or subcutaneous (inactivated)" },
    { name: "Erysipelas", typicalAge: 182, notes: "Drinking water (live) or subcutaneous (inactivated)" },
    { name: "Fowl Pox Booster", typicalAge: 182, notes: "Wing web - Modified live vaccine" },
    { name: "Newcastle Disease (Inactivated)", typicalAge: 196, notes: "Subcutaneous injection - Killed vaccine" },
    { name: "Fowl Cholera Booster", typicalAge: 196, notes: "Drinking water (live) or subcutaneous (inactivated)" },
    { name: "Avian Encephalomyelitis Booster", typicalAge: 196, notes: "Drinking water - Live vaccine" },
  ],
  "sasso/kroilers": [
    { name: "Marek Disease Vaccine", typicalAge: 1, notes: "Subcutaneous injection - Done at hatchery (in ovo at 17-19 days embryonation)" },
    { name: "Newcastle Disease Vaccine", typicalAge: 1, notes: "Coarse spray - Done at hatchery" },
    { name: "Infectious Bronchitis Vaccine", typicalAge: 1, notes: "Coarse spray - Massachusetts strain, often combined with Newcastle" },
    { name: "Newcastle Disease Booster", typicalAge: 7, notes: "Drinking water or coarse spray - Optional 2nd dose" },
    { name: "Infectious Bronchitis Booster", typicalAge: 7, notes: "Drinking water or coarse spray - Massachusetts strain booster" },
    { name: "Infectious Bursal Disease (IBD)", typicalAge: 14, notes: "Drinking water - Intermediate strain, protects immune system" },
    { name: "Newcastle Disease Final", typicalAge: 21, notes: "Drinking water or coarse spray - Final booster for market birds" },
  ],
  local: [
    { name: "Marek Disease Vaccine", typicalAge: 1, notes: "Subcutaneous injection - Done at hatchery (in ovo at 17-19 days embryonation)" },
    { name: "Tenosynovitis Vaccine", typicalAge: 6, notes: "Subcutaneous injection - Live mild strain" },
    { name: "Newcastle Disease/Infectious Bronchitis", typicalAge: 14, notes: "Drinking water - B1/Massachusetts combined vaccine" },
    { name: "Infectious Bursal Disease (IBD)", typicalAge: 14, notes: "Drinking water - Intermediate strain" },
    { name: "Newcastle Disease/Infectious Bronchitis", typicalAge: 28, notes: "Drinking water or coarse spray - B1/Massachusetts booster" },
    { name: "Tenosynovitis Booster", typicalAge: 42, notes: "Subcutaneous injection - Live mild strain booster" },
    { name: "Infectious Bursal Disease Booster", typicalAge: 56, notes: "Drinking water or coarse spray - Live strain" },
    { name: "Newcastle Disease/Infectious Bronchitis", typicalAge: 56, notes: "Drinking water or coarse spray - B1 or LaSota/Massachusetts" },
    { name: "Avian Encephalomyelitis", typicalAge: 70, notes: "Wing web - Live chick-embryo origin" },
    { name: "Fowl Pox Vaccine", typicalAge: 70, notes: "Wing web - Modified live vaccine" },
    { name: "Chicken Infectious Anemia", typicalAge: 70, notes: "Drinking water - Live vaccine" },
    { name: "Newcastle Disease (Inactivated)", typicalAge: 98, notes: "Subcutaneous injection - Killed vaccine for long-term protection" },
    { name: "Infectious Bronchitis (Inactivated)", typicalAge: 98, notes: "Subcutaneous injection - Killed vaccine booster" },
    { name: "Egg Drop Syndrome", typicalAge: 98, notes: "Subcutaneous injection - Prevents egg production drops" },
  ],
};

// Approximate Cobb500 daily feed intake curve (g/bird/day) - for broilers in days
export const COBB500_DAILY_G_PER_DAY: number[] = [
  // Days 1-7 (Week 1)
  30, 30, 32, 34, 36, 38, 40,
  // Days 8-14 (Week 2) 
  42, 44, 46, 48, 50, 52, 54,
  // Days 15-21 (Week 3)
  56, 58, 60, 62, 64, 66, 68,
  // Days 22-28 (Week 4)
  70, 72, 74, 76, 78, 80, 82,
  // Days 29-35 (Week 5)
  84, 86, 88, 90, 92, 94, 96,
  // Days 36-42 (Week 6)
  98, 100, 102, 104, 106, 108, 110,
  // Days 43-49 (Week 7)
  112, 114, 116, 118, 120, 122, 124
];

// Standard feed intake for non-broiler birds (g/bird/day)
const STANDARD_INTAKE: Record<BirdType, number> = {
  layers: 120,
  broilers: 0, // Will use COBB500_DAILY_G_PER_DAY
  "sasso/kroilers": 130,
  local: 100,
};

const BudgetCalculator: React.FC = () => {
  // Step management
  const [activeStep, setActiveStep] = useState(0);

  // Basic information state
  const [birdType, setBirdType] = useState<BirdType>("layers");
  const [numBirds, setNumBirds] = useState<string>("");
  const [productionPeriod, setProductionPeriod] = useState<string>("");
  const [docCostPerChick, setDocCostPerChick] = useState<string>(""); // upfront, moved from other costs
  const [eggPrice, setEggPrice] = useState<string>(""); // per egg, moved from pricing
  const [broilerPrice, setBroilerPrice] = useState<string>(""); // per kg live weight, moved from pricing
  const [currencyCode, setCurrencyCode] = useState<string>(DEFAULT_CURRENCY);

  // Feed state
  const [feedType, setFeedType] = useState<FeedType>("ingredients");
  const [completeFeedItems, setCompleteFeedItems] = useState<CompleteFeedItem[]>([
    { stage: "prestarter", pricePerKg: 0, kgPerTon: 0 },
    { stage: "starter", pricePerKg: 0, kgPerTon: 0 },
    { stage: "grower", pricePerKg: 0, kgPerTon: 0 },
    { stage: "finisher", pricePerKg: 0, kgPerTon: 0 },
  ]);
  const [feedItems, setFeedItems] = useState<FeedItem[]>([]);

  // Vaccination state
  const [vaccinations, setVaccinations] = useState<VaccinationItem[]>([]);

  // Drug treatment state
  const [drugTreatments, setDrugTreatments] = useState<DrugTreatmentItem[]>([]);

  // Other costs state
  const [labourCost, setLabourCost] = useState<string>(""); // per month
  const [waterCost, setWaterCost] = useState<string>(""); // per month
  const [biosecurityCost, setBiosecurityCost] = useState<string>(""); // per month
  const [broodingCost, setBroodingCost] = useState<string>(""); // month 1 only

  // Contact information for PDF download/email
  const [contactInfo, setContactInfo] = useState({ phone: "", email: "", countryCode: DEFAULT_COUNTRY_CODE });

  // Helper functions to convert string values to numbers for calculations
  const getNumBirds = useCallback(() => parseFloat(numBirds) || 0, [numBirds]);
  const getProductionPeriod = useCallback(() => parseFloat(productionPeriod) || 0, [productionPeriod]);
  const getDocCostPerChick = useCallback(() => parseFloat(docCostPerChick) || 0, [docCostPerChick]);
  const getEggPrice = useCallback(() => parseFloat(eggPrice) || 0, [eggPrice]);
  const getBroilerPrice = useCallback(() => parseFloat(broilerPrice) || 0, [broilerPrice]);
  const getLabourCost = useCallback(() => parseFloat(labourCost) || 0, [labourCost]);
  const getWaterCost = useCallback(() => parseFloat(waterCost) || 0, [waterCost]);
  const getBiosecurityCost = useCallback(() => parseFloat(biosecurityCost) || 0, [biosecurityCost]);
  const getBroodingCost = useCallback(() => parseFloat(broodingCost) || 0, [broodingCost]);


  // Initialize feed items when bird type changes
  useEffect(() => {
    if (feedType === "ingredients") {
      const predefinedIngredients = PREDEFINED_FEED_INGREDIENTS[birdType];
      setFeedItems(predefinedIngredients.map((ingredient, index) => ({
        id: String(Date.now() + index),
        name: ingredient.name,
        kgPerTon: ingredient.suggestedKgPerTon,
        pricePerKg: ingredient.pricePerKg,
      })));
    } else if (feedType === "complete") {
      const suggestedQuantities = SUGGESTED_COMPLETE_FEED_QUANTITIES[birdType];
      setCompleteFeedItems(suggestedQuantities.map(item => ({
        stage: item.stage,
        kgPerTon: item.suggestedKgPerTon,
        pricePerKg: 0,
      })));
    }
  }, [birdType, feedType]);

  // Load saved data
  useEffect(() => {
    try {
      const saved = localStorage.getItem("budget_calculator_step_by_step");
      if (saved) {
        const data = JSON.parse(saved);
        setBirdType(data.birdType || "layers");
        setNumBirds(data.numBirds?.toString() || "");
        setProductionPeriod(data.productionPeriod?.toString() || "");
        setDocCostPerChick(data.docCostPerChick?.toString() || "");
        setEggPrice(data.eggPrice?.toString() || "");
        setBroilerPrice(data.broilerPrice?.toString() || "");
        setCurrencyCode(data.currencyCode || DEFAULT_CURRENCY);
        setFeedType(data.feedType || "ingredients");
        setCompleteFeedItems(data.completeFeedItems || [
          { stage: "prestarter", pricePerKg: 0, kgPerTon: 0 },
          { stage: "starter", pricePerKg: 0, kgPerTon: 0 },
          { stage: "grower", pricePerKg: 0, kgPerTon: 0 },
          { stage: "finisher", pricePerKg: 0, kgPerTon: 0 },
        ]);
        setFeedItems(data.feedItems || []);
        setVaccinations(data.vaccinations || []);
        setDrugTreatments(data.drugTreatments || []);
        setLabourCost(data.labourCost?.toString() || "");
        setWaterCost(data.waterCost?.toString() || "");
        setBiosecurityCost(data.biosecurityCost?.toString() || "");
        setBroodingCost(data.broodingCost?.toString() || "");
        setContactInfo(data.contactInfo || { phone: "", email: "", countryCode: "+254" });
      }
    } catch { }
  }, []);

  // Save data
  useEffect(() => {
    try {
      localStorage.setItem("budget_calculator_step_by_step", JSON.stringify({
        birdType, numBirds, productionPeriod, docCostPerChick, eggPrice, broilerPrice, currencyCode, feedType, completeFeedItems, feedItems, vaccinations, drugTreatments,
        labourCost, waterCost, biosecurityCost, broodingCost, contactInfo
      }));
    } catch { }
  }, [birdType, numBirds, productionPeriod, docCostPerChick, eggPrice, broilerPrice, currencyCode, feedType, completeFeedItems, feedItems, vaccinations, drugTreatments,
    labourCost, waterCost, biosecurityCost, broodingCost, contactInfo]);

  const formatter = useMemo(() =>
    new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: currencyCode,
      maximumFractionDigits: 2
    }), [currencyCode]);

  // Helper functions
  const addFeedRow = () => setFeedItems(prev => [...prev, {
    id: String(Date.now()),
    name: "",
    kgPerTon: 0,
    pricePerKg: 0
  }]);

  const updateFeed = (id: string, key: keyof FeedItem, value: string) => {
    setFeedItems(prev => prev.map(f =>
      f.id === id ? { ...f, [key]: key === "name" ? value : (parseFloat(value) || 0) } : f
    ));
  };

  const removeFeed = (id: string) => setFeedItems(prev => prev.filter(f => f.id !== id));

  const updateCompleteFeed = (stage: CompleteFeedStage, key: keyof CompleteFeedItem, value: number) => {
    setCompleteFeedItems(prev => prev.map(item =>
      item.stage === stage ? { ...item, [key]: value } : item
    ));
  };

  const getSuggestedCompleteFeedQuantity = (stage: CompleteFeedStage) => {
    const suggested = SUGGESTED_COMPLETE_FEED_QUANTITIES[birdType];
    return suggested.find(item => item.stage === stage)?.suggestedKgPerTon || 0;
  };

  const getSuggestedCompleteFeedDescription = (stage: CompleteFeedStage) => {
    const suggested = SUGGESTED_COMPLETE_FEED_QUANTITIES[birdType];
    return suggested.find(item => item.stage === stage)?.description || "";
  };

  const addVaccination = () => setVaccinations(prev => [...prev, {
    id: String(Date.now()),
    name: "",
    age: 0,
    cost: 0,
    notes: ""
  }]);

  const updateVaccination = (id: string, key: keyof VaccinationItem, value: string | number) => {
    setVaccinations(prev => prev.map(v =>
      v.id === id ? { ...v, [key]: value } : v
    ));
  };

  const removeVaccination = (id: string) => setVaccinations(prev => prev.filter(v => v.id !== id));

  const addDrugTreatment = () => setDrugTreatments(prev => [...prev, {
    id: String(Date.now()),
    name: "",
    age: 0,
    cost: 0,
    notes: ""
  }]);

  const updateDrugTreatment = (id: string, key: keyof DrugTreatmentItem, value: string | number) => {
    setDrugTreatments(prev => prev.map(d =>
      d.id === id ? { ...d, [key]: value } : d
    ));
  };

  const removeDrugTreatment = (id: string) => setDrugTreatments(prev => prev.filter(d => d.id !== id));

  const addRecommendedVaccines = () => {
    const birdVaccines = RECOMMENDED_VACCINES[birdType] || RECOMMENDED_VACCINES.broilers;
    const newVaccinations = birdVaccines.map((vaccine, index) => ({
      id: String(Date.now() + index),
      name: vaccine.name,
      age: isBroiler ? vaccine.typicalAge : Math.ceil(vaccine.typicalAge / 7), // Convert days to weeks for non-broilers
      cost: 0,
      notes: vaccine.notes,
    }));
    setVaccinations(prev => [...prev, ...newVaccinations]);
  };

  // Calculations
  const isBroiler = birdType === "broilers";
  const ageUnit = isBroiler ? "days" : "weeks";
  const productionDays = isBroiler ? getProductionPeriod() : getProductionPeriod() * 7;
  const months = Math.ceil(productionDays / 30);

  // Feed calculations
  const dailyIntakePerBird = useMemo(() => {
    if (isBroiler) {
      // Use average of COBB500 curve for the production period
      const avgIntake = COBB500_DAILY_G_PER_DAY
        .slice(0, Math.min(productionDays, COBB500_DAILY_G_PER_DAY.length))
        .reduce((sum, intake) => sum + intake, 0) / Math.min(productionDays, COBB500_DAILY_G_PER_DAY.length);
      return avgIntake / 1000; // convert g to kg
    }
    return (STANDARD_INTAKE[birdType] || 0) / 1000; // convert g to kg
  }, [isBroiler, productionDays, birdType]);

  const feedCostPerKg = useMemo(() => {
    if (feedType === "complete") {
      // Calculate weighted average cost based on kg per ton for each stage
      const totalKg = completeFeedItems.reduce((sum, item) => sum + item.kgPerTon, 0);
      if (totalKg === 0) return 0;

      const weightedCost = completeFeedItems.reduce((sum, item) => {
        const proportion = item.kgPerTon / totalKg;
        return sum + proportion * item.pricePerKg;
      }, 0);

      return weightedCost;
    }
    return feedItems.reduce((sum, f) => {
      const proportion = (f.kgPerTon || 0) / 1000;
      return sum + proportion * (f.pricePerKg || 0);
    }, 0);
  }, [feedType, completeFeedItems, feedItems]);

  const dailyFeedCostPerBird = dailyIntakePerBird * feedCostPerKg;
  const monthlyFeedCost = dailyFeedCostPerBird * getNumBirds() * 30;

  // Vaccination and drug costs (distributed over production period)
  const totalVaccinationCost = vaccinations.reduce((sum, v) => sum + (v.cost || 0), 0);
  const totalDrugCost = drugTreatments.reduce((sum, d) => sum + (d.cost || 0), 0);
  const monthlyVaccinationCost = totalVaccinationCost / months;
  const monthlyDrugCost = totalDrugCost / months;

  // Other costs
  const monthlyOtherCosts = getLabourCost() + getWaterCost() + getBiosecurityCost();
  const firstMonthOtherCosts = monthlyOtherCosts + getBroodingCost() + (getDocCostPerChick() * getNumBirds());

  // Revenue calculations with realistic sales distribution
  const monthlyRevenue = useMemo(() => {
    if (getNumBirds() <= 0) return 0;
    if (birdType === "layers") {
      // Calculate monthly egg production in trays (30 eggs per tray)
      // Account for 4% mortality - only 96% of birds are productive
      const productiveBirds = getNumBirds() * 0.96;
      const eggsPerBirdPerMonth = 0.8 * 30; // 80% laying rate, 30 days
      const traysPerBirdPerMonth = eggsPerBirdPerMonth / 30; // Convert to trays
      return productiveBirds * traysPerBirdPerMonth * getEggPrice(); // Revenue per tray
    }
    // For meat birds, revenue comes at the end
    return 0;
  }, [getNumBirds, birdType, getEggPrice]);

  const finalRevenue = useMemo(() => {
    if (birdType === "layers") return 0;

    // Realistic sales distribution for meat birds:
    // 80% sold at full price, 4% mortality (no revenue), 16% sold at 50% price
    const totalBirds = getNumBirds();
    const fullPriceBirds = totalBirds * 0.80; // 80% at full price
    const discountedBirds = totalBirds * 0.16; // 16% at 50% price
    // 4% mortality = no revenue

    const fullPriceRevenue = fullPriceBirds * getBroilerPrice();
    const discountedRevenue = discountedBirds * getBroilerPrice() * 0.5;

    return fullPriceRevenue + discountedRevenue;
  }, [getNumBirds, birdType, getBroilerPrice]);

  // Calculate total costs for display
  const totalCosts = useMemo(() => {
    return monthlyFeedCost * months + totalVaccinationCost + totalDrugCost + monthlyOtherCosts * months + getBroodingCost() + (getDocCostPerChick() * getNumBirds());
  }, [monthlyFeedCost, months, totalVaccinationCost, totalDrugCost, monthlyOtherCosts, getBroodingCost, getDocCostPerChick, getNumBirds]);

  const netProfit = useMemo(() => {
    if (birdType === "layers") {
      return monthlyRevenue * months - totalCosts;
    } else {
      return finalRevenue - totalCosts;
    }
  }, [birdType, monthlyRevenue, months, finalRevenue, totalCosts]);

  // Step validation
  const isStepValid = (step: number): boolean => {
    switch (step) {
      case 0: return birdType && getNumBirds() > 0 && getProductionPeriod() > 0 && getDocCostPerChick() > 0 && ((birdType === "layers" && getEggPrice() > 0) || (birdType !== "layers" && getBroilerPrice() > 0));
      case 1:
        if (feedType === "complete") {
          // Require starter and grower to have values, prestarter and finisher can be 0
          const starter = completeFeedItems.find(item => item.stage === "starter");
          const grower = completeFeedItems.find(item => item.stage === "grower");
          return !!(starter && starter.kgPerTon > 0 && starter.pricePerKg > 0) &&
            !!(grower && grower.kgPerTon > 0 && grower.pricePerKg > 0);
        }
        return feedItems.some(f => f.name && f.kgPerTon > 0 && f.pricePerKg > 0);
      case 2: return true; // Vaccinations are optional
      case 3: return true; // Drug treatments are optional
      case 4: return true; // Other costs are optional
      case 5: return true; // Pricing moved to step 0, results step is always valid
      default: return false;
    }
  };

  const handleNext = () => {
    if (isStepValid(activeStep)) {
      setActiveStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
  };

  const handleReset = () => {
    setActiveStep(0);
    setBirdType("layers");
    setNumBirds("");
    setProductionPeriod("");
    setDocCostPerChick("");
    setEggPrice("");
    setBroilerPrice("");
    setFeedType("ingredients");
    setCompleteFeedItems([
      { stage: "prestarter", pricePerKg: 0, kgPerTon: 0 },
      { stage: "starter", pricePerKg: 0, kgPerTon: 0 },
      { stage: "grower", pricePerKg: 0, kgPerTon: 0 },
      { stage: "finisher", pricePerKg: 0, kgPerTon: 0 },
    ]);
    setFeedItems([]);
    setVaccinations([]);
    setDrugTreatments([]);
    setLabourCost("");
    setWaterCost("");
    setBiosecurityCost("");
    setBroodingCost("");
    setContactInfo({ phone: "", email: "", countryCode: "+254" });
  };

  // PDF generation function with tabular format
  const generatePDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // Header with small logo
    const img = new Image();
    img.src = logoImg;
    doc.addImage(
      img,
      "PNG",
      14, // Left margin
      8,  // Top margin
      20, // Width
      20, // Height
      undefined,
      "FAST"
    );

    // Header text
    doc.setFontSize(18);
    doc.setTextColor(40, 100, 60); // Green color
    doc.text("Poultry Budget Report", pageWidth / 2, 20, { align: "center" });

    // Table styling
    const leftMargin = 14;
    const rightMargin = pageWidth - 14;
    const tableWidth = rightMargin - leftMargin;
    let yPosition = 35;
    const rowHeight = 8;
    const headerHeight = 10;

    // Helper function to draw table row
    const drawTableRow = (label: string, value: string, isHeader = false, isTotal = false) => {
      if (isHeader) {
        doc.setFillColor(241, 242, 176); // Light green background
        doc.rect(leftMargin, yPosition, tableWidth, headerHeight, 'F');
        doc.setFontSize(12);
        doc.setTextColor(40, 100, 60); // Green text
        doc.setFont('helvetica', 'bold');
      } else if (isTotal) {
        doc.setFillColor(240, 240, 240); // Light grey background
        doc.rect(leftMargin, yPosition, tableWidth, rowHeight, 'F');
        doc.setFontSize(11);
        doc.setTextColor(0, 0, 0);
        doc.setFont('helvetica', 'bold');
      } else {
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        doc.setFont('helvetica', 'normal');
      }

      doc.text(label, leftMargin + 5, yPosition + (isHeader ? 7 : 5));
      doc.text(value, rightMargin - 5, yPosition + (isHeader ? 7 : 5), { align: 'right' });

      yPosition += isHeader ? headerHeight : rowHeight;
    };

    // Helper function to draw section divider
    const drawSectionDivider = () => {
      yPosition += 3;
      doc.setDrawColor(200, 200, 200);
      doc.line(leftMargin, yPosition, rightMargin, yPosition);
      yPosition += 5;
    };

    // Basic Information Section
    drawTableRow("BASIC INFORMATION", "", true);
    drawTableRow("Bird Type", birdType);
    drawTableRow("Number of Birds", getNumBirds().toLocaleString());
    drawTableRow("Production Period", `${getProductionPeriod()} ${ageUnit} (${months} months)`);
    drawTableRow("Currency", currencyCode);
    drawSectionDivider();

    // Costs Section
    drawTableRow("COSTS BREAKDOWN", "", true);
    drawTableRow("Total Feed Cost", formatter.format(monthlyFeedCost * months));
    drawTableRow("Total Vaccination Cost", formatter.format(totalVaccinationCost));
    drawTableRow("Total Drug Cost", formatter.format(totalDrugCost));

    // Other Costs Subsection
    drawTableRow("Other Costs", "", false);
    drawTableRow("  • Labour Cost", formatter.format(getLabourCost() * months));
    drawTableRow("  • Water Cost", formatter.format(getWaterCost() * months));
    drawTableRow("  • Biosecurity Cost", formatter.format(getBiosecurityCost() * months));
    drawTableRow("  • Brooding Cost", formatter.format(getBroodingCost()));
    drawTableRow("  • Day-old Chick Cost", formatter.format(getDocCostPerChick() * getNumBirds()));

    drawTableRow("TOTAL COSTS", formatter.format(totalCosts), false, true);
    drawSectionDivider();

    // Revenue Section
    drawTableRow("REVENUE BREAKDOWN", "", true);
    if (birdType === "layers") {
      drawTableRow("Monthly Egg Revenue", formatter.format(monthlyRevenue));
      drawTableRow("Total Egg Revenue", formatter.format(monthlyRevenue * months));
      drawTableRow("  • Based on 96% productive birds (4% mortality)", "");
    } else {
      drawTableRow("Final Sale Revenue", formatter.format(finalRevenue));
      drawTableRow("  • 80% sold at full price", formatter.format(getNumBirds() * 0.80 * getBroilerPrice()));
      drawTableRow("  • 16% sold at 50% price", formatter.format(getNumBirds() * 0.16 * getBroilerPrice() * 0.5));
      drawTableRow("  • 4% mortality (no revenue)", "");
    }
    drawSectionDivider();

    // Net Profit Section
    drawTableRow("NET PROFIT", formatter.format(netProfit), false, true);

    // Add profit margin percentage
    const profitMargin = totalCosts > 0 ? (netProfit / totalCosts) * 100 : 0;
    drawTableRow("Profit Margin", `${profitMargin.toFixed(1)}%`);

    // Footer section
    const footerY = pageHeight - 40;

    // Contact info
    doc.setFontSize(9);
    doc.setTextColor(100); // Grey color
    doc.setFont('helvetica', 'normal');

    const fullPhoneNumber = contactInfo.phone ? `${contactInfo.countryCode}${contactInfo.phone}` : '';
    const contactText = contactInfo.phone && contactInfo.email
      ? `Contact: ${fullPhoneNumber} | ${contactInfo.email}`
      : contactInfo.phone
        ? `Contact: ${fullPhoneNumber}`
        : contactInfo.email
          ? `Contact: ${contactInfo.email}`
          : 'Contact: Not provided';

    doc.text(contactText, leftMargin, footerY);

    // Generated date and time
    const now = new Date();
    const dateTime = `Generated: ${now.toLocaleDateString()} at ${now.toLocaleTimeString()}`;
    doc.text(dateTime, rightMargin, footerY, { align: "right" });

    // Company branding
    doc.text("Powered by River Poultry & SmartVet", pageWidth / 2, footerY + 15, { align: "center" });

    return doc;
  };

  const handleDownloadPDF = async () => {
    // Track user lead
    await userTrackingService.trackUserLead({
      toolName: 'budgetCalculator',
      action: 'pdf_download',
      contactInfo: {
        email: contactInfo.email,
        phone: contactInfo.phone,
        countryCode: contactInfo.countryCode,
      },
      toolData: {
        birdType,
        numBirds: getNumBirds(),
        productionPeriod: getProductionPeriod(),
        totalCosts,
        netProfit,
      },
    });

    const doc = generatePDF();
    doc.save("Poultry_Budget_Report.pdf");
  };

  const handleEmailPDF = async () => {
    if (!contactInfo.email) {
      alert("Please enter an email address to send the report.");
      return;
    }

    // Track user lead for email request
    await userTrackingService.trackUserLead({
      toolName: 'budgetCalculator',
      action: 'email_request',
      contactInfo: {
        email: contactInfo.email,
        phone: contactInfo.phone,
        countryCode: contactInfo.countryCode,
      },
      toolData: {
        birdType,
        numBirds: getNumBirds(),
        productionPeriod: getProductionPeriod(),
        totalCosts,
        netProfit,
      },
    });

    try {
      const doc = generatePDF();
      const pdfBlob = doc.output('blob');

      // Convert blob to base64 for backend API
      const base64PDF = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64 = reader.result?.toString().split(',')[1];
          resolve(base64 || '');
        };
        reader.readAsDataURL(pdfBlob);
      });

      // Prepare email data for backend
      const emailData = {
        to: contactInfo.email,
        recipientName: contactInfo.phone ? `Farmer (${contactInfo.countryCode}${contactInfo.phone})` : "Customer",
        subject: EMAIL_CONFIG.SUBJECT_TEMPLATE,
        htmlContent: generateEmailTemplate({
          birdType,
          numBirds: getNumBirds(),
          productionPeriod: getProductionPeriod(),
          ageUnit,
          totalCosts: formatter.format(totalCosts),
          netProfit: formatter.format(netProfit),
          contactPhone: contactInfo.phone ? `${contactInfo.countryCode}${contactInfo.phone}` : ''
        }),
        pdfBase64: base64PDF,
        pdfFilename: "Poultry_Budget_Report.pdf"
      };

      // Send email via backend API
      const response = await fetch(`${EMAIL_CONFIG.BACKEND_API_URL}/api/send-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(emailData)
      });

      const result = await response.json();

      if (response.ok && result.success) {
        alert(`Report successfully sent to ${contactInfo.email}!`);
        console.log('Email sent successfully via backend:', result.messageId);
      } else {
        throw new Error(result.message || 'Failed to send email');
      }

    } catch (error) {
      console.error('Error sending email:', error);

      // Fallback: Open default email client with pre-filled content
      const doc = generatePDF();
      const pdfBlob = doc.output('blob');
      const pdfUrl = URL.createObjectURL(pdfBlob);

      const subject = encodeURIComponent(EMAIL_CONFIG.SUBJECT_TEMPLATE);
      const body = encodeURIComponent(`
Dear ${contactInfo.phone ? 'Farmer' : 'Customer'},

Thank you for using our Poultry Budget Calculator! 

Please find attached your detailed budget report.

Report Summary:
- Bird Type: ${birdType}
- Number of Birds: ${getNumBirds().toLocaleString()}
- Production Period: ${getProductionPeriod()} ${ageUnit}
- Total Costs: ${formatter.format(totalCosts)}
- Net Profit: ${formatter.format(netProfit)}

This report includes detailed cost breakdowns, revenue projections, and profit analysis based on industry standards.

If you have any questions about your budget or need assistance with poultry farming, please don't hesitate to contact us.

Best regards,
${EMAIL_CONFIG.COMPANY_NAME} Team

---
Powered by ${EMAIL_CONFIG.COMPANY_NAME} | ${EMAIL_CONFIG.COMPANY_WEBSITE}
      `);

      // Create a temporary link to download the PDF
      const downloadLink = document.createElement('a');
      downloadLink.href = pdfUrl;
      downloadLink.download = 'Poultry_Budget_Report.pdf';
      downloadLink.click();

      // Open email client
      window.open(`mailto:${contactInfo.email}?subject=${subject}&body=${body}`);

      alert(`Could not send email automatically. The report has been downloaded - please attach it to your email manually.`);
    }
  };

  return (
    <Box sx={{ bgcolor: "#f5f5f5", minHeight: "100vh", pb: 5 }}>
      <HeroSection
        title="Step-by-Step Budget Calculator"
        subtitle="Plan your poultry operation with detailed cost breakdowns"
        description="Follow the steps below to create a comprehensive budget for your poultry operation."
      />

      <Card sx={{ maxWidth: 1000, mx: "auto", mt: -4, p: 3, borderRadius: 4, boxShadow: 6 }}>
        <CardContent>
          <Stepper activeStep={activeStep} orientation="vertical">

            {/* Step 1: Basic Information */}
            <Step>
              <StepLabel>Basic Information</StepLabel>
              <StepContent>
                <Stack spacing={2}>
                  <TextField
                    select
                    label="Bird Type"
                    value={birdType}
                    onChange={e => setBirdType(e.target.value as BirdType)}
                    fullWidth
                  >
                    <MenuItem value="layers">Layers</MenuItem>
                    <MenuItem value="broilers">Broilers</MenuItem>
                    <MenuItem value="sasso/kroilers">Sasso/Kroilers</MenuItem>
                    <MenuItem value="local">Local</MenuItem>
                  </TextField>

                  <TextField
                    label="Number of Birds"
                    type="number"
                    inputProps={{ min: 1 }}
                    value={numBirds}
                    onChange={e => setNumBirds(e.target.value)}
                    fullWidth
                  />

                  <TextField
                    label={`Production Period (${ageUnit})`}
                    type="number"
                    inputProps={{ min: 1 }}
                    value={productionPeriod}
                    onChange={e => setProductionPeriod(e.target.value)}
                    fullWidth
                    helperText={isBroiler ? "Typically 35-42 days for broilers" : "Typically 18-20 weeks for layers"}
                  />

                  <TextField
                    label="Day-old Chick Cost (per chick)"
                    type="number"
                    inputProps={{ step: "0.01", min: 0 }}
                    value={docCostPerChick}
                    onChange={e => setDocCostPerChick(e.target.value)}
                    fullWidth
                    helperText={`Total DOC cost: ${formatter.format(getDocCostPerChick() * getNumBirds())}`}
                  />

                  {birdType === "layers" ? (
                    <TextField
                      label="Egg Price (per tray)"
                      type="number"
                      inputProps={{ step: "0.01", min: 0 }}
                      value={eggPrice}
                      onChange={e => setEggPrice(e.target.value)}
                      fullWidth
                      helperText="Price you'll receive for each tray of eggs (typically 30 eggs per tray)"
                    />
                  ) : (
                    <TextField
                      label="Broiler Price (per bird)"
                      type="number"
                      inputProps={{ step: "0.01", min: 0 }}
                      value={broilerPrice}
                      onChange={e => setBroilerPrice(e.target.value)}
                      fullWidth
                      helperText="Price you'll receive for each bird at sale"
                    />
                  )}

                  <TextField
                    select
                    label="Currency"
                    value={currencyCode}
                    onChange={e => setCurrencyCode(e.target.value)}
                    fullWidth
                  >
                    <MenuItem value="USD">USD — US Dollar</MenuItem>
                    <MenuItem value="EUR">EUR — Euro</MenuItem>
                    <MenuItem value="ZAR">ZAR — South African Rand</MenuItem>
                    <MenuItem value="NGN">NGN — Nigerian Naira</MenuItem>
                    <MenuItem value="EGP">EGP — Egyptian Pound</MenuItem>
                    <MenuItem value="KES">KES — Kenyan Shilling</MenuItem>
                    <MenuItem value="UGX">UGX — Ugandan Shilling</MenuItem>
                    <MenuItem value="TZS">TZS — Tanzanian Shilling</MenuItem>
                    <MenuItem value="GHS">GHS — Ghanaian Cedi</MenuItem>
                    <MenuItem value="XOF">XOF — West African CFA franc</MenuItem>
                    <MenuItem value="XAF">XAF — Central African CFA franc</MenuItem>
                  </TextField>

                  <Box sx={{ display: "flex", gap: 1, mt: 2 }}>
                    <Button
                      variant="contained"
                      onClick={handleNext}
                      disabled={!isStepValid(0)}
                    >
                      Next: Feed Formula
                    </Button>
                  </Box>
                </Stack>
              </StepContent>
            </Step>

            {/* Step 2: Feed Formula */}
            <Step>
              <StepLabel>Feed Formula</StepLabel>
              <StepContent>
                <Stack spacing={2}>
                  <Typography variant="subtitle2">
                    Daily intake per bird: {dailyIntakePerBird.toFixed(3)} kg
                  </Typography>

                  <TextField
                    select
                    label="Feed Type"
                    value={feedType}
                    onChange={e => setFeedType(e.target.value as FeedType)}
                    fullWidth
                  >
                    <MenuItem value="ingredients">Own formulated feeds</MenuItem>
                    <MenuItem value="complete">Complete Feed</MenuItem>
                  </TextField>

                  {feedType === "complete" ? (
                    <>
                      <Typography variant="body2" color="text.secondary">
                        Complete feed stages with quantities and prices. Prestarter and Finisher can be 0, but Starter and Grower are required.
                      </Typography>

                      <Button
                        variant="outlined"
                        onClick={() => {
                          const suggested = SUGGESTED_COMPLETE_FEED_QUANTITIES[birdType];
                          setCompleteFeedItems(suggested.map(item => ({
                            stage: item.stage,
                            kgPerTon: item.suggestedKgPerTon,
                            pricePerKg: completeFeedItems.find(c => c.stage === item.stage)?.pricePerKg || 0,
                          })));
                        }}
                        sx={{ mb: 2 }}
                      >
                        Apply Suggested Quantities for {birdType.charAt(0).toUpperCase() + birdType.slice(1)}
                      </Button>

                      {completeFeedItems.map((item) => (
                        <Box key={item.stage} sx={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 1, alignItems: "center" }}>
                          <TextField
                            label={`${item.stage.charAt(0).toUpperCase() + item.stage.slice(1)} Stage`}
                            value={getSuggestedCompleteFeedDescription(item.stage)}
                            InputProps={{ readOnly: true }}
                            helperText={`Suggested: ${getSuggestedCompleteFeedQuantity(item.stage)} kg/ton`}
                          />
                          <TextField
                            label="Kg per Ton"
                            type="number"
                            inputProps={{ step: "0.1", min: 0, max: 1000 }}
                            value={item.kgPerTon}
                            onChange={e => updateCompleteFeed(item.stage, "kgPerTon", parseFloat(e.target.value || "0"))}
                          />
                          <TextField
                            label="Price per kg"
                            type="number"
                            inputProps={{ step: "0.01", min: 0 }}
                            value={item.pricePerKg}
                            onChange={e => updateCompleteFeed(item.stage, "pricePerKg", parseFloat(e.target.value || "0"))}
                          />
                        </Box>
                      ))}
                    </>
                  ) : (
                    <>
                      <Typography variant="body2" color="text.secondary">
                        Predefined ingredients for {birdType}. Adjust quantities and prices as needed.
                      </Typography>

                      <Button
                        variant="outlined"
                        onClick={() => {
                          const predefinedIngredients = PREDEFINED_FEED_INGREDIENTS[birdType];
                          setFeedItems(predefinedIngredients.map((ingredient, index) => ({
                            id: String(Date.now() + index),
                            name: ingredient.name,
                            kgPerTon: ingredient.suggestedKgPerTon,
                            pricePerKg: feedItems.find(f => f.name === ingredient.name)?.pricePerKg || 0,
                          })));
                        }}
                        sx={{ mb: 2 }}
                      >
                        Apply Suggested Quantities for {birdType.charAt(0).toUpperCase() + birdType.slice(1)}
                      </Button>

                      {feedItems.map((f) => (
                        <Box key={f.id} sx={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr auto", gap: 1, alignItems: "center" }}>
                          <TextField
                            label="Ingredient"
                            value={f.name}
                            onChange={e => updateFeed(f.id, "name", e.target.value)}
                          />
                          <TextField
                            label="Kg per Ton"
                            type="number"
                            inputProps={{ step: "0.1", min: 0, max: 1000 }}
                            value={f.kgPerTon}
                            onChange={e => updateFeed(f.id, "kgPerTon", e.target.value)}
                          />
                          <TextField
                            label="Price per kg"
                            type="number"
                            inputProps={{ step: "0.01", min: 0 }}
                            value={f.pricePerKg}
                            onChange={e => updateFeed(f.id, "pricePerKg", e.target.value)}
                          />
                          <IconButton onClick={() => removeFeed(f.id)} color="error">
                            <Delete />
                          </IconButton>
                        </Box>
                      ))}

                      <Button variant="outlined" startIcon={<Add />} onClick={addFeedRow}>
                        Add Custom Ingredient
                      </Button>
                    </>
                  )}

                  <Paper sx={{ p: 2, bgcolor: "grey.50" }}>
                    <Typography variant="subtitle2">Feed Cost Summary</Typography>
                    <Typography variant="body2">
                      Cost per kg of feed: {formatter.format(feedCostPerKg)}
                    </Typography>
                    <Typography variant="body2">
                      Daily feed cost per bird: {formatter.format(dailyFeedCostPerBird)}
                    </Typography>
                    <Typography variant="body2">
                      Monthly feed cost for {numBirds} birds: {formatter.format(monthlyFeedCost)}
                    </Typography>
                  </Paper>

                  <Box sx={{ display: "flex", gap: 1, mt: 2 }}>
                    <Button onClick={handleBack}>Back</Button>
                    <Button
                      variant="contained"
                      onClick={handleNext}
                      disabled={!isStepValid(1)}
                    >
                      Next: Vaccinations
                    </Button>
                  </Box>
                </Stack>
              </StepContent>
            </Step>

            {/* Step 3: Vaccinations */}
            <Step>
              <StepLabel>Vaccinations</StepLabel>
              <StepContent>
                <Stack spacing={2}>
                  <Typography variant="body2" color="text.secondary">
                    Add each vaccination with its timing and cost. These costs will be distributed over the production period.
                  </Typography>

                  <Box sx={{ display: "flex", gap: 1 }}>
                    <Button variant="outlined" startIcon={<Add />} onClick={addVaccination}>
                      Add Custom Vaccination
                    </Button>
                    <Button variant="contained" onClick={addRecommendedVaccines}>
                      Add {birdType.charAt(0).toUpperCase() + birdType.slice(1)} Recommended Vaccines
                    </Button>
                  </Box>

                  <Typography variant="body2" color="text.secondary">
                    Recommended vaccines for {birdType} based on Merck Veterinary Manual standards.
                    {isBroiler ? " Ages shown in days." : " Ages automatically converted to weeks."}
                  </Typography>

                  {vaccinations.map((v) => (
                    <Box key={v.id} sx={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr auto", gap: 1, alignItems: "center" }}>
                      <TextField
                        label="Vaccine Name"
                        value={v.name}
                        onChange={e => updateVaccination(v.id, "name", e.target.value)}
                      />
                      <TextField
                        label={`Age (${ageUnit})`}
                        type="number"
                        inputProps={{ min: 0 }}
                        value={v.age}
                        onChange={e => updateVaccination(v.id, "age", parseInt(e.target.value || "0", 10))}
                      />
                      <TextField
                        label="Total Cost"
                        type="number"
                        inputProps={{ step: "0.01", min: 0 }}
                        value={v.cost}
                        onChange={e => updateVaccination(v.id, "cost", parseFloat(e.target.value || "0"))}
                      />
                      <TextField
                        label="Notes"
                        value={v.notes}
                        onChange={e => updateVaccination(v.id, "notes", e.target.value)}
                      />
                      <IconButton onClick={() => removeVaccination(v.id)} color="error">
                        <Delete />
                      </IconButton>
                    </Box>
                  ))}

                  {vaccinations.length > 0 && (
                    <Paper sx={{ p: 2, bgcolor: "grey.50" }}>
                      <Typography variant="subtitle2">Vaccination Summary</Typography>
                      <Typography variant="body2">
                        Total vaccination cost: {formatter.format(totalVaccinationCost)}
                      </Typography>
                      <Typography variant="body2">
                        Monthly vaccination cost: {formatter.format(monthlyVaccinationCost)}
                      </Typography>
                    </Paper>
                  )}

                  <Box sx={{ display: "flex", gap: 1, mt: 2 }}>
                    <Button onClick={handleBack}>Back</Button>
                    <Button
                      variant="contained"
                      onClick={handleNext}
                    >
                      Next: Drug Treatments
                    </Button>
                  </Box>
                </Stack>
              </StepContent>
            </Step>

            {/* Step 4: Drug Treatments */}
            <Step>
              <StepLabel>Drug Treatments</StepLabel>
              <StepContent>
                <Stack spacing={2}>
                  <Typography variant="body2" color="text.secondary">
                    Add any planned drug treatments with their timing and cost.
                  </Typography>

                  {drugTreatments.map((d) => (
                    <Box key={d.id} sx={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr auto", gap: 1, alignItems: "center" }}>
                      <TextField
                        label="Treatment Name"
                        value={d.name}
                        onChange={e => updateDrugTreatment(d.id, "name", e.target.value)}
                      />
                      <TextField
                        label={`Age (${ageUnit})`}
                        type="number"
                        inputProps={{ min: 0 }}
                        value={d.age}
                        onChange={e => updateDrugTreatment(d.id, "age", parseInt(e.target.value || "0", 10))}
                      />
                      <TextField
                        label="Total Cost"
                        type="number"
                        inputProps={{ step: "0.01", min: 0 }}
                        value={d.cost}
                        onChange={e => updateDrugTreatment(d.id, "cost", parseFloat(e.target.value || "0"))}
                      />
                      <TextField
                        label="Notes"
                        value={d.notes}
                        onChange={e => updateDrugTreatment(d.id, "notes", e.target.value)}
                      />
                      <IconButton onClick={() => removeDrugTreatment(d.id)} color="error">
                        <Delete />
                      </IconButton>
                    </Box>
                  ))}

                  <Button variant="outlined" startIcon={<Add />} onClick={addDrugTreatment}>
                    Add Drug Treatment
                  </Button>

                  {drugTreatments.length > 0 && (
                    <Paper sx={{ p: 2, bgcolor: "grey.50" }}>
                      <Typography variant="subtitle2">Drug Treatment Summary</Typography>
                      <Typography variant="body2">
                        Total drug cost: {formatter.format(totalDrugCost)}
                      </Typography>
                      <Typography variant="body2">
                        Monthly drug cost: {formatter.format(monthlyDrugCost)}
                      </Typography>
                    </Paper>
                  )}

                  <Box sx={{ display: "flex", gap: 1, mt: 2 }}>
                    <Button onClick={handleBack}>Back</Button>
                    <Button
                      variant="contained"
                      onClick={handleNext}
                    >
                      Next: Other Costs
                    </Button>
                  </Box>
                </Stack>
              </StepContent>
            </Step>

            {/* Step 5: Other Costs */}
            <Step>
              <StepLabel>Other Costs</StepLabel>
              <StepContent>
                <Stack spacing={2}>
                  <TextField
                    label="Labour Cost (per month)"
                    type="number"
                    inputProps={{ step: "0.01", min: 0 }}
                    value={labourCost}
                    onChange={e => setLabourCost(e.target.value)}
                    fullWidth
                  />

                  <TextField
                    label="Water Cost (per month)"
                    type="number"
                    inputProps={{ step: "0.01", min: 0 }}
                    value={waterCost}
                    onChange={e => setWaterCost(e.target.value)}
                    fullWidth
                  />

                  <TextField
                    label="Biosecurity Cost (per month)"
                    type="number"
                    inputProps={{ step: "0.01", min: 0 }}
                    value={biosecurityCost}
                    onChange={e => setBiosecurityCost(e.target.value)}
                    fullWidth
                  />

                  <TextField
                    label="Brooding Cost (month 1 only)"
                    type="number"
                    inputProps={{ step: "0.01", min: 0 }}
                    value={broodingCost}
                    onChange={e => setBroodingCost(e.target.value)}
                    fullWidth
                  />

                  <Paper sx={{ p: 2, bgcolor: "grey.50" }}>
                    <Typography variant="subtitle2">Other Costs Summary</Typography>
                    <Typography variant="body2">
                      Monthly other costs: {formatter.format(monthlyOtherCosts)}
                    </Typography>
                    <Typography variant="body2">
                      First month costs (including brooding): {formatter.format(firstMonthOtherCosts)}
                    </Typography>
                  </Paper>

                  <Box sx={{ display: "flex", gap: 1, mt: 2 }}>
                    <Button onClick={handleBack}>Back</Button>
                    <Button
                      variant="contained"
                      onClick={handleNext}
                    >
                      Next: Pricing & Results
                    </Button>
                  </Box>
                </Stack>
              </StepContent>
            </Step>

            {/* Step 6: Results */}
            <Step>
              <StepLabel>Results</StepLabel>
              <StepContent>
                <Stack spacing={2}>

                  <Paper sx={{ p: 3, bgcolor: "primary.50" }}>
                    <Typography variant="h6" gutterBottom>Budget Summary</Typography>

                    <Stack spacing={1}>
                      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                        <Typography>Production Period:</Typography>
                        <Typography>{getProductionPeriod()} {ageUnit} ({months} months)</Typography>
                      </Box>

                      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                        <Typography>Number of Birds:</Typography>
                        <Typography>{getNumBirds().toLocaleString()}</Typography>
                      </Box>

                      <Divider />

                      <Typography variant="subtitle2" color="info.main">Costs:</Typography>
                      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                        <Typography>Total Feed Cost:</Typography>
                        <Typography>{formatter.format(monthlyFeedCost * months)}</Typography>
                      </Box>
                      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                        <Typography>Total Vaccination Cost:</Typography>
                        <Typography>{formatter.format(totalVaccinationCost)}</Typography>
                      </Box>
                      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                        <Typography>Total Drug Cost:</Typography>
                        <Typography>{formatter.format(totalDrugCost)}</Typography>
                      </Box>
                      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                        <Typography>Total Other Costs:</Typography>
                        <Typography>{formatter.format(monthlyOtherCosts * months + getBroodingCost() + (getDocCostPerChick() * getNumBirds()))}</Typography>
                      </Box>

                      <Divider />

                      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                        <Typography variant="subtitle2">Total Costs:</Typography>
                        <Typography variant="subtitle2" color="error.main">
                          {formatter.format(totalCosts)}
                        </Typography>
                      </Box>

                      <Divider />

                      <Typography variant="subtitle2" color="success.main">Revenue:</Typography>
                      {birdType === "layers" ? (
                        <>
                          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                            <Typography>Monthly Egg Revenue (per tray):</Typography>
                            <Typography>{formatter.format(monthlyRevenue)}</Typography>
                          </Box>
                          <Box sx={{ ml: 2, fontSize: "0.875rem", color: "text.secondary" }}>
                            <Typography variant="caption" display="block">
                              • Based on 96% productive birds (4% mortality)
                            </Typography>
                          </Box>
                        </>
                      ) : (
                        <>
                          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                            <Typography>Final Sale Revenue:</Typography>
                            <Typography>{formatter.format(finalRevenue)}</Typography>
                          </Box>
                          <Box sx={{ ml: 2, fontSize: "0.875rem", color: "text.secondary" }}>
                            <Typography variant="caption" display="block">
                              • 80% sold at full price: {formatter.format(getNumBirds() * 0.80 * getBroilerPrice())}
                            </Typography>
                            <Typography variant="caption" display="block">
                              • 16% sold at 50% price: {formatter.format(getNumBirds() * 0.16 * getBroilerPrice() * 0.5)}
                            </Typography>
                            <Typography variant="caption" display="block">
                              • 4% mortality (no revenue)
                            </Typography>
                          </Box>
                        </>
                      )}

                      <Divider />

                      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                        <Typography variant="h6">Net Profit:</Typography>
                        <Typography variant="h6" color="success.main">
                          {formatter.format(netProfit)}
                        </Typography>
                      </Box>
                    </Stack>
                  </Paper>

                  <Divider sx={{ my: 2 }} />

                  <Typography variant="h6" gutterBottom>
                    Download Report
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Enter your contact details to download a PDF report or have it sent to your email.
                  </Typography>

                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <TextField
                      select
                      label="Country Code"
                      value={contactInfo.countryCode}
                      onChange={e => setContactInfo({ ...contactInfo, countryCode: e.target.value })}
                      sx={{ minWidth: 140 }}
                    >
                      {COUNTRY_CODES.map((country) => (
                        <MenuItem key={country.code} value={country.code}>
                          {country.name}
                        </MenuItem>
                      ))}
                    </TextField>
                    <TextField
                      label="Phone/WhatsApp Number"
                      value={contactInfo.phone}
                      onChange={e => setContactInfo({ ...contactInfo, phone: e.target.value })}
                      fullWidth
                      placeholder="e.g., 712345678"
                    />
                  </Box>
                  <TextField
                    label="Email (optional)"
                    type="email"
                    value={contactInfo.email}
                    onChange={e => setContactInfo({ ...contactInfo, email: e.target.value })}
                    fullWidth
                  />

                  <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
                    <Button
                      variant="contained"
                      startIcon={<Download />}
                      disabled={!contactInfo.phone && !contactInfo.email}
                      onClick={handleDownloadPDF}
                    >
                      Download PDF
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<Email />}
                      disabled={!contactInfo.email}
                      onClick={handleEmailPDF}
                    >
                      Send by Email
                    </Button>
                  </Box>

                  <Box sx={{ display: "flex", gap: 1, mt: 2 }}>
                    <Button onClick={handleBack}>Back</Button>
                    <Button variant="contained" onClick={handleReset}>
                      Start New Budget
                    </Button>
                  </Box>
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