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
    useMediaQuery,
    useTheme,
    TextField,
} from "@mui/material";
import { LocalHospital } from "@mui/icons-material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs, { Dayjs } from "dayjs";
import PdfDownloader from "../components/PdfDownloader";
import logo from "../assets/logo.png";

type VaccineEntry = {
    age: string;
    vaccine: string;
    route: string;
    notes: string;
    days?: number; // exact day for easier calculation
    startDay?: number; // for ranges like 7–10
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
    broilers: 42, // ~6 weeks
    layers: 500, // kept long-term, assume pre-lay at 16–18 weeks
    sasso: 120, // ~4 months for dual-purpose
};

const Vaccination: React.FC = () => {
    const [type, setType] = useState<string>("");
    const [arrivalDate, setArrivalDate] = useState<Dayjs | null>(null);

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
        type && arrivalDate
            ? arrivalDate.add(saleDays[type], "day").format("DD MMM YYYY")
            : "";

    return (
        <Box sx={{ bgcolor: "#f5f5f5", minHeight: "100vh", pb: 5 }}>
            {/* Hero Section */}
            <Box
                sx={{
                    bgcolor: "#638f65ff",
                    color: "white",
                    py: isMobile ? 3 : 5,
                    textAlign: "center",
                }}
            >
                <img
                    src={logo}
                    alt="Company Logo"
                    style={{
                        width: isMobile ? 70 : 100,
                        height: "auto",
                        marginBottom: "10px",
                    }}
                />
                <Typography variant={isMobile ? "h4" : "h3"} fontWeight="bold">
                    Vaccination Planner
                </Typography>
                <Typography variant={isMobile ? "body1" : "h6"}>
                    Enter chicken arrival date and type to get your full vaccination plan.
                </Typography>
            </Box>

            {/* Selection */}
            <Card
                sx={{
                    maxWidth: 700,
                    mx: "auto",
                    mt: -4,
                    p: isMobile ? 2 : 3,
                    borderRadius: 3,
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
                            >
                                <MenuItem value="broilers">Broilers</MenuItem>
                                <MenuItem value="layers">Layers / Pullets</MenuItem>
                                <MenuItem value="sasso">Sasso / Kuroilers</MenuItem>
                            </Select>
                        </FormControl>

                        <DatePicker
                            label="Chicken Arrival Date"
                            value={arrivalDate}
                            onChange={(newValue) => setArrivalDate(newValue)}
                            slotProps={{ textField: { fullWidth: true } }}
                        />
                    </Stack>
                </CardContent>
            </Card>

            {/* Results */}
            {type && arrivalDate && (
                <Box maxWidth={900} mx="auto" mt={5} px={isMobile ? 1 : 0}>
                    <Card sx={{ borderRadius: 3, boxShadow: 6, bgcolor: "white" }}>
                        <CardContent>
                            <Stack direction="row" spacing={2} mb={2}>
                                <LocalHospital sx={{ fontSize: 40, color: "#f9a825" }} />
                                <Typography variant="h5" color="success.main">
                                    Vaccination Schedule for {type.toUpperCase()}
                                </Typography>
                            </Stack>

                            <Paper sx={{ overflowX: "auto" }}>
                                <Table size={isMobile ? "small" : "medium"}>
                                    <TableHead sx={{ bgcolor: "#f9fbe7" }}>
                                        <TableRow>
                                            <TableCell>Age/Time</TableCell>
                                            <TableCell>Vaccine</TableCell>
                                            <TableCell>Route</TableCell>
                                            <TableCell>Notes</TableCell>
                                            <TableCell>Date</TableCell>
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

                            <Typography
                                variant="h6"
                                color="error"
                                sx={{ mt: 3, fontWeight: "bold" }}
                            >
                                Estimated Sale/Stop Date: {saleDate}
                            </Typography>

                            <Box textAlign={isMobile ? "center" : "right"}>
                                <PdfDownloader data={vaccines} type={type} age={"All"} />
                            </Box>
                        </CardContent>
                    </Card>
                </Box>
            )}
        </Box>
    );
};

export default Vaccination;
