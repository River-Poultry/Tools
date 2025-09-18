import React, { useState } from "react";
import {
    Box,
    Typography,
    TextField,
    MenuItem,
    Select,
    FormControl,
    InputLabel,
    Button,
    Card,
    CardContent,
    Stack,
} from "@mui/material";
import HomeWorkIcon from "@mui/icons-material/HomeWork";
import HeroSection from "./HeroSection";

const spaceRequirements: Record<string, number> = {
    broilers: 0.09, // m² per bird
    layers: 0.18,
    sasso: 0.14,
    kuroilers: 0.14,
};

const HouseMeasurement: React.FC = () => {
    const [type, setType] = useState<string>("");
    const [birds, setBirds] = useState<number | "">("");
    const [result, setResult] = useState<string>("");

    const calculate = () => {
        if (!type || !birds) {
            setResult("⚠️ Please select chicken type and enter number of birds.");
            return;
        }

        const requiredSpace = spaceRequirements[type] * Number(birds);

        setResult(
            `✅ You need approximately ${requiredSpace.toFixed(2)} m² to accommodate ${birds} ${type}.`
        );
    };

    return (
        <Box sx={{ bgcolor: "#f5f5f5", minHeight: "100vh" }}>
            {/* Hero Section */}
            <HeroSection
                title="House Measurement Tool"
                subtitle="Tools that work as hard as you do."
                description="Our digital tools help you calculate the space required for your flock efficiently."
                note="Select the chicken type and number of birds to get the recommended house size."
            />

            {/* Content Section */}
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "flex-start",
                    minHeight: "calc(100vh - 150px)",
                    p: 3,
                }}
            >
                <Card
                    sx={{
                        width: "100%",
                        maxWidth: 500,
                        borderRadius: 3,
                        boxShadow: 6,
                        p: 3,
                        mt: -6,
                        bgcolor: "white",
                    }}
                >
                    <CardContent>
                        <Stack direction="row" spacing={2} alignItems="center" mb={3}>
                            <HomeWorkIcon sx={{ fontSize: 40, color: "#2e7d32" }} />
                            <Typography variant="h5" color="success.main">
                                Enter Flock Details
                            </Typography>
                        </Stack>

                        {/* Inputs */}
                        <Stack spacing={3}>
                            <FormControl fullWidth>
                                <InputLabel>Chicken Type</InputLabel>
                                <Select
                                    value={type}
                                    onChange={(e) => {
                                        setType(e.target.value);
                                        setResult("");
                                    }}
                                >
                                    <MenuItem value="broilers">Broilers</MenuItem>
                                    <MenuItem value="layers">Layers</MenuItem>
                                    <MenuItem value="sasso">Sasso</MenuItem>
                                    <MenuItem value="kuroilers">Kuroilers</MenuItem>
                                </Select>
                            </FormControl>

                            <TextField
                                label="Number of Birds"
                                type="number"
                                fullWidth
                                value={birds}
                                onChange={(e) => setBirds(Number(e.target.value))}
                            />

                            <Button
                                variant="contained"
                                color="success"
                                size="large"
                                onClick={calculate}
                            >
                                Calculate
                            </Button>
                        </Stack>

                        {/* Results */}
                        {result && (
                            <Card
                                sx={{
                                    mt: 4,
                                    p: 3,
                                    borderRadius: 2,
                                    bgcolor: result.includes("✅") ? "#e8f5e9" : "#ffebee",
                                }}
                            >
                                <Typography
                                    variant="h6"
                                    sx={{ fontWeight: "bold" }}
                                    color={result.includes("✅") ? "success.main" : "error.main"}
                                >
                                    {result}
                                </Typography>
                            </Card>
                        )}
                    </CardContent>
                </Card>
            </Box>
        </Box>
    );
};

export default HouseMeasurement;
