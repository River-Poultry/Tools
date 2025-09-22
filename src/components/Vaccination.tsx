import React, { useState, useRef, useEffect } from "react";
import {
    Box,
    Typography,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Paper,
    Card,
    CardContent,
    Stack,
    useMediaQuery,
    useTheme,
} from "@mui/material";
import { LocalHospital } from "@mui/icons-material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { Dayjs } from "dayjs";
import PdfDownloader from "../components/PdfDownloader";
import HeroSection from "../components/HeroSection";

type VaccineEntry = {
    age: string;
    vaccine: string;
    route: string;
    notes: string;
    days?: number;
    startDay?: number;
    endDay?: number;
};

const schedules: Record<string, VaccineEntry[]> = {
    broilers: [
        { age: "Day 1", vaccine: "Marek’s disease", route: "SC / hatchery", notes: "Protection against tumors", days: 1 },
        { age: "Day 1", vaccine: "Newcastle + IB", route: "Spray / Eye-drop", notes: "Respiratory protection", days: 1 },
        { age: "Day 7–10", vaccine: "IBD (Gumboro)", route: "Water / Eye-drop", notes: "Protect immune organs", startDay: 7, endDay: 10 },
        { age: "Day 14–21", vaccine: "Newcastle + IB (Booster)", route: "Water / Spray", notes: "Reinforce protection", startDay: 14, endDay: 21 },
        { age: "Day 21–28 (if risk)", vaccine: "Additional boosters", route: "Water / Spray", notes: "Maintain immunity", startDay: 21, endDay: 28 },
    ],
    layers: [
        { age: "Day 1", vaccine: "Marek’s disease", route: "SC / hatchery", notes: "Early protection", days: 1 },
        { age: "Day 1", vaccine: "Newcastle + IB", route: "Spray / Eye-drop", notes: "Respiratory coverage", days: 1 },
        { age: "Week 2–3", vaccine: "IBD (Gumboro)", route: "Water / Eye-drop", notes: "Build immunity", startDay: 14, endDay: 21 },
        { age: "Week 4–5", vaccine: "Fowl Pox, Cholera", route: "Wing-web / IM", notes: "Long-term health", startDay: 28, endDay: 35 },
        { age: "Week 6–8", vaccine: "ND + IB (Booster)", route: "Water / Spray", notes: "Reinforcement", startDay: 42, endDay: 56 },
    ],
    sasso: [
        { age: "Day 1", vaccine: "Marek’s; Newcastle + IB", route: "SC / Spray", notes: "Same as broilers", days: 1 },
        { age: "Week 1–2", vaccine: "IBD (Gumboro)", route: "Water / Eye-drop", notes: "Early immunity", startDay: 7, endDay: 14 },
        { age: "Week 4–6", vaccine: "Fowl Pox, Cholera", route: "Wing-web / IM", notes: "Local disease risk", startDay: 28, endDay: 42 },
        { age: "Week 6–8", vaccine: "ND + IB (Booster)", route: "Water / Spray", notes: "Reinforcement", startDay: 42, endDay: 56 },
    ],
};

const saleDays: Record<string, number> = {
    broilers: 42,
    layers: 500,
    sasso: 120,
};

const Vaccination: React.FC = () => {
    const [type, setType] = useState<string>("");
    const [arrivalDate, setArrivalDate] = useState<Dayjs | null>(null);
    const resultRef = useRef<HTMLDivElement>(null);

    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

    const vaccines = type ? schedules[type] || [] : [];

    const getDate = (entry: VaccineEntry) => {
        if (!arrivalDate) return "";
        if (entry.days) {
            return arrivalDate.add(entry.days - 1, "day").format("DD MMM YYYY");
        }
        if (entry.startDay && entry.endDay) {
            return `${arrivalDate.add(entry.startDay - 1, "day").format("DD MMM")} - ${arrivalDate
                .add(entry.endDay - 1, "day")
                .format("DD MMM YYYY")}`;
        }
        return "";
    };

    const saleDate =
        type && arrivalDate ? arrivalDate.add(saleDays[type], "day").format("DD MMM YYYY") : "";

    // Auto-scroll when results appear
    useEffect(() => {
        if (type && arrivalDate && resultRef.current) {
            resultRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [type, arrivalDate]);

    return (
        <Box sx={{ bgcolor: "#f5f5f5", minHeight: "100vh", pb: 5 }}>
            {/* Hero Section */}
            <HeroSection
                title="Vaccination Planner"
                subtitle="Tools that work as hard as you do."
                description="Our digital tools help you manage flock health, manage feed, and track growth, giving you the insights to make smarter farming decisions and increase profits."
                note="Enter chicken arrival date and type to get your full vaccination plan."
            />

            {/* Selection */}
            <Card
                sx={{
                    maxWidth: 700,
                    mx: "auto",
                    mt: -4,
                    p: isMobile ? 2 : 4,
                    borderRadius: 4,
                    boxShadow: 6,
                }}
            >
                <CardContent>
                    <Stack spacing={3}>
                        <FormControl fullWidth>
                            <InputLabel id="type-label">Chicken Type</InputLabel>
                            <Select
                                labelId="type-label"
                                value={type}
                                onChange={(e) => setType(e.target.value)}
                                sx={{
                                    borderRadius: "50px",
                                    fontSize: "1.1rem",
                                    "& .MuiSelect-select": { padding: "14px 20px" },
                                }}
                            >
                                <MenuItem value="broilers">Broilers</MenuItem>
                                <MenuItem value="layers">Layers / Pullets</MenuItem>
                                <MenuItem value="sasso">Sasso / Kuroilers</MenuItem>
                            </Select>
                        </FormControl>

                        {type && (
                            <DatePicker
                                label="Chicken Arrival Date"
                                value={arrivalDate}
                                onChange={(newValue) => setArrivalDate(newValue)}
                                slotProps={{
                                    textField: {
                                        fullWidth: true,
                                        sx: {
                                            borderRadius: "50px",
                                            "& .MuiOutlinedInput-root": { borderRadius: "50px" },
                                        },
                                    },
                                }}
                            />
                        )}
                    </Stack>
                </CardContent>
            </Card>

            {/* Results */}
            {type && arrivalDate && (
                <Box ref={resultRef} maxWidth={900} mx="auto" mt={6} px={isMobile ? 2 : 0}>
                    <Card sx={{ borderRadius: 4, boxShadow: 6, bgcolor: "white" }}>
                        <CardContent>
                            <Stack direction="row" spacing={2} alignItems="center" mb={3}>
                                <LocalHospital sx={{ fontSize: 40, color: "#f9a825" }} />
                                <Typography variant="h5" color="success.main" fontWeight="bold">
                                    Vaccination Schedule for {type.toUpperCase()}
                                </Typography>
                            </Stack>

                            {/* Responsive Layout */}
                            {isMobile ? (
                                // Card layout for mobile
                                <Stack spacing={2}>
                                    {vaccines.map((v, index) => (
                                        <Card key={index} variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                                            <Typography variant="subtitle2" fontWeight="bold">
                                                {v.age} — {getDate(v)}
                                            </Typography>
                                            <Typography variant="body2">💉 {v.vaccine}</Typography>
                                            <Typography variant="body2">🛠 Route: {v.route}</Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                {v.notes}
                                            </Typography>
                                        </Card>
                                    ))}
                                </Stack>
                            ) : (
                                // Table for desktop
                                <Paper sx={{ overflowX: "auto" }}>
                                    <Table>
                                        <TableHead sx={{ bgcolor: "#f9fbe7" }}>
                                            <TableRow>
                                                <TableCell sx={{ fontWeight: "bold" }}>Age/Time</TableCell>
                                                <TableCell sx={{ fontWeight: "bold" }}>Vaccine</TableCell>
                                                <TableCell sx={{ fontWeight: "bold" }}>Route</TableCell>
                                                <TableCell sx={{ fontWeight: "bold" }}>Notes</TableCell>
                                                <TableCell sx={{ fontWeight: "bold" }}>Date</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {vaccines.map((v, index) => (
                                                <TableRow key={index}>
                                                    <TableCell>{v.age}</TableCell>
                                                    <TableCell>{v.vaccine}</TableCell>
                                                    <TableCell>{v.route}</TableCell>
                                                    <TableCell>{v.notes}</TableCell>
                                                    <TableCell>{getDate(v)}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </Paper>
                            )}

                            {/* Sale Date */}
                            <Typography variant="h6" color="error" sx={{ mt: 4, fontWeight: "bold" }}>
                                Estimated Sale/Stop Date: {saleDate}
                            </Typography>

                            {/* PDF Download */}
                            <Box textAlign={isMobile ? "center" : "right"} mt={3}>
                                <PdfDownloader
                                    data={vaccines.map((v) => ({ ...v, date: getDate(v) }))}
                                    type={type}
                                    arrivalDate={arrivalDate.format("DD MMM YYYY")}
                                    saleDate={saleDate}
                                />
                            </Box>
                        </CardContent>
                    </Card>
                </Box>
            )}
        </Box>
    );
};

export default Vaccination;
