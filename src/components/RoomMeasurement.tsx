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
    useMediaQuery,
    useTheme,
} from "@mui/material";
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

    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

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
                description="Plan better poultry houses by entering your bird numbers and type — we’ll calculate the required space instantly."
                note="Select chicken type and number of birds to get recommendations."
            />

            {/* Content Section */}
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "flex-start",
                    minHeight: "calc(100vh - 150px)",
                    px: isMobile ? 2 : 5,
                }}
            >
                <Card
                    sx={{
                        width: "100%",
                        maxWidth: 700,
                        borderRadius: 3,
                        boxShadow: 6,
                        p: isMobile ? 2 : 3,
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
                                        "& .MuiSelect-select": {
                                            padding: isMobile ? "12px 16px" : "14px 20px",
                                        },
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
                                    InputProps={{ sx: { borderRadius: "50px" } }}
                                />
                            )}
                        </Stack>

                        {/* Results */}
                        {result && (
                            <Card
                                ref={resultRef}
                                sx={{
                                    mt: 4,
                                    p: isMobile ? 2 : 3,
                                    borderRadius: 2,
                                    whiteSpace: "pre-line",
                                    bgcolor: "#f1f8e9",
                                }}
                            >
                                <Typography
                                    variant={isMobile ? "body1" : "h6"}
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
