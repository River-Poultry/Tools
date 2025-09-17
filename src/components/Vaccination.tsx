import React, { useState } from "react";
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
} from "@mui/material";
import { Agriculture, LocalHospital } from "@mui/icons-material";
import PdfDownloader from "../components/PdfDownloader";
import logo from "../assets/logo.png";

type VaccineEntry = {
    age: string;
    vaccine: string;
    route: string;
    notes: string;
};

const schedules: Record<string, VaccineEntry[]> = {
    broilers: [
        { age: "Day 1", vaccine: "Marek’s disease", route: "SC / hatchery", notes: "Protection against tumors/paralysis" },
        { age: "Day 1", vaccine: "Newcastle + IB", route: "Spray / Eye-drop", notes: "Respiratory protection" },
        { age: "Day 7–10", vaccine: "Infectious Bursal Disease (Gumboro)", route: "Water / Eye-drop", notes: "Protect immune organs" },
        { age: "Day 14–21", vaccine: "Newcastle + IB (Booster)", route: "Water / Spray", notes: "Reinforce protection" },
        { age: "Day 21–28 (if risk)", vaccine: "Additional boosters (IBD/respiratory)", route: "Water / Spray", notes: "Maintain immunity" },
    ],
    layers: [
        { age: "Day 1", vaccine: "Marek’s disease", route: "SC / hatchery", notes: "Early life protection" },
        { age: "Day 1", vaccine: "Newcastle + IB", route: "Spray / Eye-drop", notes: "Initial respiratory coverage" },
        { age: "Week 2–3", vaccine: "IBD (Gumboro)", route: "Water / Eye-drop", notes: "Build early immunity" },
        { age: "Week 4–5", vaccine: "Fowl Pox, Fowl Cholera (if risk)", route: "Wing-web / IM", notes: "Supports long-term health" },
        { age: "Week 6–8", vaccine: "Newcastle + IB (Booster)", route: "Water / Spray", notes: "Reinforcement before maturity" },
        { age: "Week 10–14", vaccine: "EDS, Infectious Coryza (if risk)", route: "IM / Water", notes: "Protect egg production" },
        { age: "Week 16–18 (Pre-lay)", vaccine: "Final boosters (ND, IB, EDS)", route: "Injection / Water", notes: "Strong immunity entering laying" },
        { age: "During laying", vaccine: "Periodic boosters (ND, IB)", route: "Injection / Water", notes: "Every 8–12 weeks to maintain" },
    ],
    sasso: [
        { age: "Day 1", vaccine: "Marek’s; Newcastle + IB", route: "SC / Spray", notes: "Same as broilers/layers" },
        { age: "Week 1–2", vaccine: "IBD (Gumboro)", route: "Water / Eye-drop", notes: "Early immunity" },
        { age: "Week 4–6", vaccine: "Fowl Pox, Fowl Cholera", route: "Wing-web / IM", notes: "Local disease risk higher" },
        { age: "Week 6–8", vaccine: "ND + IB (Booster)", route: "Water / Spray", notes: "Reinforcement due to longer lifespan" },
        { age: "Week 16–20 (Pre-lay)", vaccine: "Boosters (ND, IB, EDS, Salmonella)", route: "Injection / Water", notes: "For egg production quality" },
    ],
};

const Vaccination: React.FC = () => {
    const [type, setType] = useState<string>("");
    const [age, setAge] = useState<string>("");

    const vaccines = type ? schedules[type] || [] : [];
    const ages = Array.from(new Set(vaccines.map((v) => v.age)));
    const filteredVaccines = age ? vaccines.filter((v) => v.age === age) : [];

    return (
        <Box sx={{ bgcolor: "#f5f5f5", minHeight: "100vh", pb: 5 }}>
            {/* Hero Section */}
            <Box
                sx={{
                    bgcolor: "#638f65ff",
                    color: "white",
                    py: 5,
                    px: 3,
                    textAlign: "center",
                }}
            >
                <img
                    src={logo}
                    alt="Company Logo"
                    style={{ width: 100, height: "auto", marginBottom: "10px" }}
                />
                <Typography variant="h3" fontWeight="bold" gutterBottom>
                    Vaccination Planner
                </Typography>
                <Typography variant="h6">
                    Use this planner to know when to vaccinate, protect your flock, and grow your farm with confidence.
                </Typography>
                <Typography variant="h6">
                    Healthy chickens, strong profits, happy farmers
                </Typography>
            </Box>

            {/* Selection Card */}
            <Card
                sx={{
                    maxWidth: 600,
                    mx: "auto",
                    mt: -4,
                    p: 3,
                    borderRadius: 3,
                    boxShadow: 6,
                    bgcolor: "white",
                }}
            >
                <CardContent>
                    <Typography variant="h5" gutterBottom color="success.main">
                        Select Your Options
                    </Typography>

                    <Stack spacing={3}>
                        <FormControl fullWidth>
                            <InputLabel id="type-label">Chicken Type</InputLabel>
                            <Select
                                labelId="type-label"
                                value={type}
                                onChange={(e) => {
                                    setType(e.target.value);
                                    setAge(""); // reset age when type changes
                                }}
                            >
                                <MenuItem value="broilers"> Broilers</MenuItem>
                                <MenuItem value="layers"> Layers / Pullets</MenuItem>
                                <MenuItem value="sasso"> Sasso / Kuroilers</MenuItem>
                            </Select>
                        </FormControl>

                        {type && (
                            <FormControl fullWidth>
                                <InputLabel id="age-label">Select Age/Time</InputLabel>
                                <Select
                                    labelId="age-label"
                                    value={age}
                                    onChange={(e) => setAge(e.target.value)}
                                >
                                    {ages.map((a, index) => (
                                        <MenuItem key={index} value={a}>
                                            {a}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        )}
                    </Stack>
                </CardContent>
            </Card>

            {/* Results Section */}
            {type && age && (
                <Box maxWidth={900} mx="auto" mt={5}>
                    <Card sx={{ borderRadius: 3, boxShadow: 6, bgcolor: "white" }}>
                        <CardContent>
                            <Stack direction="row" spacing={2} alignItems="center" mb={2}>
                                <LocalHospital sx={{ fontSize: 40, color: "#f9a825" }} />
                                <Typography variant="h5" color="success.main">
                                    Vaccination Details for {type.toUpperCase()} at {age}
                                </Typography>
                            </Stack>

                            <Paper sx={{ overflowX: "auto" }}>
                                <Table>
                                    <TableHead sx={{ bgcolor: "#f9fbe7" }}>
                                        <TableRow>
                                            <TableCell sx={{ fontWeight: "bold" }}>Age/Time</TableCell>
                                            <TableCell sx={{ fontWeight: "bold" }}>Vaccine</TableCell>
                                            <TableCell sx={{ fontWeight: "bold" }}>Route</TableCell>
                                            <TableCell sx={{ fontWeight: "bold" }}>Notes</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {filteredVaccines.map((v, index) => (
                                            <TableRow key={index}>
                                                <TableCell>{v.age}</TableCell>
                                                <TableCell>{v.vaccine}</TableCell>
                                                <TableCell>{v.route}</TableCell>
                                                <TableCell>{v.notes}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </Paper>

                            {/* PDF Download */}
                            <Box textAlign="right">
                                <PdfDownloader data={filteredVaccines} type={type} age={age} />
                            </Box>
                        </CardContent>
                    </Card>
                </Box>
            )}
        </Box>
    );
};

export default Vaccination;
