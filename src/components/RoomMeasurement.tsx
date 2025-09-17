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
import logo from "../assets/logo.png";

const spaceRequirements: Record<string, number> = {
    broilers: 0.09, // m² per bird
    layers: 0.18,
    sasso: 0.14,
    kuroilers: 0.14,
};

const HouseMeasurement: React.FC = () => {
    const [length, setLength] = useState<number | "">("");
    const [width, setWidth] = useState<number | "">("");
    const [type, setType] = useState<string>("");
    const [birds, setBirds] = useState<number | "">("");
    const [result, setResult] = useState<string>("");

    const calculate = () => {
        if (!length || !width || !type || !birds) {
            setResult("⚠️ Please fill in all fields.");
            return;
        }

        const area = Number(length) * Number(width); // house area
        const requiredSpace = spaceRequirements[type]; // m² per bird
        const maxCapacity = Math.floor(area / requiredSpace);

        if (Number(birds) <= maxCapacity) {
            setResult(
                `✅ Your house can accommodate ${birds} ${type} comfortably. (Max capacity: ${maxCapacity})`
            );
        } else {
            setResult(
                `❌ Not enough space. Your house can only hold about ${maxCapacity} ${type}.`
            );
        }
    };

    return (
        <Box sx={{ bgcolor: "#f5f5f5", minHeight: "100vh" }}>
            {/* Hero Section */}
            <Box
                sx={{
                    bgcolor: "#638f65ff",
                    color: "white",
                    py: 10,
                    textAlign: "center",
                }}
            >
                <img
                    src={logo}
                    alt="Company Logo"
                    style={{ width: 100, height: "auto", marginBottom: "10px" }}
                />
                <Typography variant="h3" fontWeight="bold">
                    House Measurement Tool
                </Typography>
                <Typography variant="h6">
                    Plan better, raise healthier chickens 🐔🌱
                </Typography>
            </Box>

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
                        maxWidth: 700,
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
                                Enter House Details
                            </Typography>
                        </Stack>

                        {/* Inputs */}
                        <Stack spacing={3}>
                            <TextField
                                label="House Length (m)"
                                type="number"
                                fullWidth
                                value={length}
                                onChange={(e) => setLength(Number(e.target.value))}
                            />

                            <TextField
                                label="House Width (m)"
                                type="number"
                                fullWidth
                                value={width}
                                onChange={(e) => setWidth(Number(e.target.value))}
                            />

                            <FormControl fullWidth>
                                <InputLabel>Chicken Type</InputLabel>
                                <Select
                                    value={type}
                                    onChange={(e) => {
                                        setType(e.target.value);
                                        setResult("");
                                    }}
                                >
                                    <MenuItem value="broilers">🐓 Broilers</MenuItem>
                                    <MenuItem value="layers">🥚 Layers</MenuItem>
                                    <MenuItem value="sasso">🌾 Sasso</MenuItem>
                                    <MenuItem value="kuroilers">🐤 Kuroilers</MenuItem>
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
