import React, { useState, useEffect, useRef } from "react";
import {
    Box,
    Typography,
    TextField,
    MenuItem,
    Select,
    FormControl,
    InputLabel,
    Card,
    CardContent,
    Stack,
} from "@mui/material";
import HomeWorkIcon from "@mui/icons-material/HomeWork";
import HeroSection from "./HeroSection";

const spaceRequirements: Record<string, number> = {
    broilers: 0.09,
    layers: 0.18,
    sasso: 0.14,
    kuroilers: 0.14,
};

const HouseMeasurement: React.FC = () => {
    const [type, setType] = useState<string>("");
    const [birds, setBirds] = useState<number | "">("");
    const [result, setResult] = useState<string>("");

    const resultRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (type && birds) {
            const requiredSpace = spaceRequirements[type] * Number(birds);
            const width = Math.sqrt(requiredSpace / 2);
            const length = width * 2;

            setResult(
                `✅ You need approximately ${requiredSpace.toFixed(
                    2
                )} m² to accommodate ${birds} ${type}.\nRecommended house dimensions: ${length.toFixed(
                    2
                )}m (length) × ${width.toFixed(2)}m (width).`
            );
        } else {
            setResult("");
        }
    }, [type, birds]);

    useEffect(() => {
        if (resultRef.current) {
            resultRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [result]);

    return (
        <Box sx={{ bgcolor: "#f5f5f5", minHeight: "100vh", pb: 5 }}>
            {/* Hero Section */}
            <HeroSection
                title="House Measurement Tool"
                subtitle="Tools that work as hard as you do."
                description="Our digital tools help you manage flock health, manage feed, and track growth, giving you the insights to make smarter farming decisions and increase profits."
                note="Select the chicken type and number of birds to get the recommended house size."
            />

            {/* Content Section */}
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "flex-start",
                    minHeight: "calc(100vh - 150px)",
                    px: 5, // enlarge horizontally
                }}
            >
                <Card
                    sx={{
                        width: "100%",
                        maxWidth: 700, // wider form
                        borderRadius: 3,
                        boxShadow: 6,
                        p: 3,
                        mt: -6,
                        bgcolor: "white",
                    }}
                >
                    <CardContent>


                        {/* Inputs */}
                        <Stack spacing={3}>
                            <FormControl fullWidth>
                                <InputLabel>Chicken Type</InputLabel>
                                <Select
                                    value={type}
                                    onChange={(e) => setType(e.target.value)}
                                    sx={{
                                        borderRadius: "50px",
                                        "& .MuiSelect-select": { padding: "14px 20px" },
                                    }}
                                >
                                    <MenuItem value="broilers">Broilers</MenuItem>
                                    <MenuItem value="layers">Layers</MenuItem>
                                    <MenuItem value="sasso">Sasso</MenuItem>
                                    <MenuItem value="kuroilers">Kuroilers</MenuItem>
                                </Select>
                            </FormControl>

                            {type && (
                                <TextField
                                    label="Number of Birds"
                                    type="number"
                                    fullWidth
                                    value={birds}
                                    onChange={(e) => setBirds(Number(e.target.value))}
                                />
                            )}
                        </Stack>

                        {/* Results */}
                        {result && (
                            <Card
                                ref={resultRef}
                                sx={{
                                    mt: 4,
                                    p: 3,
                                    borderRadius: 2,
                                    whiteSpace: "pre-line",
                                    bgcolor: "#e8f5e9",
                                }}
                            >
                                <Typography
                                    variant="h6"
                                    sx={{ fontWeight: "bold" }}
                                    color="success.main"
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
