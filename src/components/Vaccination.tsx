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
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    IconButton,
    Button,
    Chip,
    Alert,
    Snackbar,
    Menu,
    ListItemIcon,
    ListItemText,
} from "@mui/material";
import { 
    LocalHospital, 
    Close, 
    Visibility, 
    Download, 
    CalendarToday, 
    Notifications,
    CheckCircle,
    Warning
} from "@mui/icons-material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { Dayjs } from "dayjs";
import dayjs from "dayjs";
import PdfDownloader from "../components/PdfDownloader";
import HeroSection from "../components/HeroSection";
import { analyticsService } from "../services/analyticsService";
import { buildGoogleCalendarUrl, downloadIcsForEvents, CalendarEvent } from "../utils/calendar";

type VaccineEntry = {
    age: string;
    vaccine: string;
    route: string;
    notes: string;
    days?: number;
    startDay?: number;
    endDay?: number;
};

type VaccinationReminder = {
    id: string;
    batchId: string;
    batchName: string;
    vaccine: string;
    scheduledDate: Dayjs;
    status: 'pending' | 'completed' | 'overdue';
    notes?: string;
    createdAt: Dayjs;
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
    "sasso/kroilers": [
        { age: "Day 1", vaccine: "Marek's; Newcastle + IB", route: "SC / Spray", notes: "Same as broilers", days: 1 },
        { age: "Week 1–2", vaccine: "IBD (Gumboro)", route: "Water / Eye-drop", notes: "Early immunity", startDay: 7, endDay: 14 },
        { age: "Week 4–6", vaccine: "Fowl Pox, Cholera", route: "Wing-web / IM", notes: "Local disease risk", startDay: 28, endDay: 42 },
        { age: "Week 6–8", vaccine: "ND + IB (Booster)", route: "Water / Spray", notes: "Reinforcement", startDay: 42, endDay: 56 },
    ],
};

const saleDays: Record<string, number> = {
    broilers: 42,
    layers: 500,
    "sasso/kroilers": 120,
};

const Vaccination: React.FC = () => {
    const [type, setType] = useState<string>("");
    const [arrivalDate, setArrivalDate] = useState<Dayjs | null>(null);
    const [previewOpen, setPreviewOpen] = useState(false);
    const [reminders, setReminders] = useState<VaccinationReminder[]>([]);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState("");
    const resultRef = useRef<HTMLDivElement>(null);
    const [calendarMenuAnchorEl, setCalendarMenuAnchorEl] = useState<HTMLElement | null>(null);
    const [selectedVaccine, setSelectedVaccine] = useState<VaccineEntry | null>(null);

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

    // Auto-scroll when results appear and track usage
    useEffect(() => {
        if (type && arrivalDate && resultRef.current) {
            resultRef.current.scrollIntoView({ behavior: "smooth" });
            
            // Track vaccination schedule generation
            analyticsService.trackVaccinationSchedule(type, 1000); // Default batch size
        }
    }, [type, arrivalDate]);

    // Local reminder helper (kept for in-app reminders)
    const createLocalReminder = (vaccine: VaccineEntry, batchName: string = "Batch 1") => {
        if (!arrivalDate) return;

        const scheduledDate = vaccine.days
            ? arrivalDate.add(vaccine.days - 1, "day")
            : vaccine.startDay
                ? arrivalDate.add(vaccine.startDay - 1, "day")
                : arrivalDate;

        const reminder: VaccinationReminder = {
            id: `${Date.now()}-${Math.random()}`,
            batchId: `batch-${Date.now()}`,
            batchName,
            vaccine: vaccine.vaccine,
            scheduledDate,
            status: 'pending',
            notes: vaccine.notes,
            createdAt: dayjs(),
        };

        setReminders(prev => [...prev, reminder]);
        setSnackbarMessage(`Vaccination reminder added for ${vaccine.vaccine}`);
        setSnackbarOpen(true);
    };

    const openCalendarMenu = (event: React.MouseEvent<HTMLElement>, vaccine: VaccineEntry) => {
        setSelectedVaccine(vaccine);
        setCalendarMenuAnchorEl(event.currentTarget);
    };

    const closeCalendarMenu = () => setCalendarMenuAnchorEl(null);

    const makeCalendarEvent = (v: VaccineEntry): CalendarEvent | null => {
        if (!arrivalDate) return null;
        const isRange = Boolean(v.startDay && v.endDay);
        const start = v.days
            ? arrivalDate.add(v.days - 1, 'day')
            : v.startDay
                ? arrivalDate.add(v.startDay - 1, 'day')
                : arrivalDate;
        const end = isRange && v.endDay
            ? arrivalDate.add(v.endDay, 'day') // end is exclusive for all-day
            : undefined;

        const title = `Vaccination: ${v.vaccine} (${type.toUpperCase()})`;
        const description = `Route: ${v.route}${v.notes ? `\nNotes: ${v.notes}` : ''}`;

        return {
            title,
            description,
            start,
            end,
            allDay: true,
        };
    };

    const handleAddGoogleCalendar = async () => {
        if (!selectedVaccine) return;
        const ev = makeCalendarEvent(selectedVaccine);
        if (!ev) return;
        const url = buildGoogleCalendarUrl(ev);
        window.open(url, '_blank', 'noopener,noreferrer');
        createLocalReminder(selectedVaccine);
        await analyticsService.trackToolUsage({
            toolName: 'vaccination',
            action: 'export',
            metadata: {
                calendar_provider: 'google',
                vaccine: selectedVaccine.vaccine,
                poultryType: type,
                bulk: false,
            },
        });
        closeCalendarMenu();
    };

    const handleDownloadIcsSingle = async () => {
        if (!selectedVaccine) return;
        const ev = makeCalendarEvent(selectedVaccine);
        if (!ev) return;
        const safe = (s: string) => s.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-_]/g, '');
        const filename = `vaccination-${safe(selectedVaccine.vaccine)}-${arrivalDate!.format('YYYYMMDD')}.ics`;
        downloadIcsForEvents(filename, [ev]);
        createLocalReminder(selectedVaccine);
        await analyticsService.trackToolUsage({
            toolName: 'vaccination',
            action: 'export',
            metadata: {
                calendar_provider: 'ics',
                vaccine: selectedVaccine.vaccine,
                poultryType: type,
                bulk: false,
            },
        });
        closeCalendarMenu();
    };

    const exportAllAsIcs = async () => {
        if (!arrivalDate || !type) return;
        const events = vaccines
            .map(v => makeCalendarEvent(v))
            .filter(Boolean) as CalendarEvent[];
        if (events.length === 0) return;
        const safe = (s: string) => s.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-_]/g, '');
        const filename = `vaccination-schedule-${safe(type)}-${arrivalDate.format('YYYYMMDD')}.ics`;
        downloadIcsForEvents(filename, events);
        await analyticsService.trackToolUsage({
            toolName: 'vaccination',
            action: 'export',
            metadata: {
                calendar_provider: 'ics',
                poultryType: type,
                bulk: true,
                count: events.length,
            },
        });
    };

    const markAsCompleted = (reminderId: string) => {
        setReminders(prev => 
            prev.map(reminder => 
                reminder.id === reminderId 
                    ? { ...reminder, status: 'completed' as const }
                    : reminder
            )
        );
        setSnackbarMessage("Vaccination marked as completed");
        setSnackbarOpen(true);
    };

    const getUpcomingReminders = () => {
        const today = dayjs();
        return reminders
            .filter(reminder => 
                reminder.status === 'pending' && 
                reminder.scheduledDate.isAfter(today.subtract(1, 'day'))
            )
            .sort((a, b) => a.scheduledDate.diff(b.scheduledDate))
            .slice(0, 5);
    };

    const getOverdueReminders = () => {
        const today = dayjs();
        return reminders.filter(reminder => 
            reminder.status === 'pending' && 
            reminder.scheduledDate.isBefore(today)
        );
    };

    // Preview component
    const PreviewDialog = () => {
        if (!type || !arrivalDate) return null;

        const getPrimaryDiseases = (data: VaccineEntry[]) => {
            const diseases = new Set();
            data.forEach(v => {
                if (v.vaccine.includes('Newcastle')) diseases.add('Newcastle Disease');
                if (v.vaccine.includes('IB')) diseases.add('Infectious Bronchitis');
                if (v.vaccine.includes('IBD') || v.vaccine.includes('Gumboro')) diseases.add('Infectious Bursal Disease');
                if (v.vaccine.includes('Marek')) diseases.add("Marek's Disease");
                if (v.vaccine.includes('Pox')) diseases.add('Fowl Pox');
                if (v.vaccine.includes('Cholera')) diseases.add('Fowl Cholera');
            });
            return Array.from(diseases).join(', ');
        };

        const getRoutes = (data: VaccineEntry[]) => {
            const routes = new Set();
            data.forEach(v => {
                if (v.route.includes('Water')) routes.add('Water');
                if (v.route.includes('Spray')) routes.add('Spray');
                if (v.route.includes('Eye-drop')) routes.add('Eye-drop');
                if (v.route.includes('SC')) routes.add('Subcutaneous');
                if (v.route.includes('IM')) routes.add('Intramuscular');
                if (v.route.includes('Wing-web')) routes.add('Wing-web');
            });
            return Array.from(routes).join(', ');
        };

        return (
            <Dialog
                open={previewOpen}
                onClose={() => setPreviewOpen(false)}
                maxWidth="md"
                fullWidth
                fullScreen={isMobile}
            >
                <DialogTitle sx={{ bgcolor: '#f1f2b0', color: '#286844', fontWeight: 'bold' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <LocalHospital sx={{ fontSize: 24 }} />
                            Poultry Vaccination Report Preview
                        </Box>
                        <IconButton onClick={() => setPreviewOpen(false)} size="small">
                            <Close />
                        </IconButton>
                    </Box>
                </DialogTitle>
                
                <DialogContent sx={{ p: 0 }}>
                    <Box sx={{ p: 2 }}>
                        {/* Basic Information */}
                        <Card sx={{ mb: 2, border: '1px solid #e0e0e0' }}>
                            <Box sx={{ bgcolor: '#f1f2b0', p: 1.5, borderBottom: '1px solid #e0e0e0' }}>
                                <Typography variant="subtitle1" sx={{ color: '#286844', fontWeight: 'bold' }}>
                                    BASIC INFORMATION
                                </Typography>
                            </Box>
                            <Box sx={{ p: 2 }}>
                                <Stack spacing={1}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <Typography variant="body2">Bird Type:</Typography>
                                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>{type.toUpperCase()}</Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <Typography variant="body2">Arrival Date:</Typography>
                                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>{arrivalDate.format("DD MMM YYYY")}</Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <Typography variant="body2">Production Period:</Typography>
                                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                            {type === 'broilers' ? '42 days' : type === 'layers' ? '500 days' : '120 days'}
                                        </Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <Typography variant="body2">Estimated Sale/Stop Date:</Typography>
                                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>{saleDate}</Typography>
                                    </Box>
                                </Stack>
                            </Box>
                        </Card>

                        {/* Vaccination Schedule */}
                        <Card sx={{ mb: 2, border: '1px solid #e0e0e0' }}>
                            <Box sx={{ bgcolor: '#f1f2b0', p: 1.5, borderBottom: '1px solid #e0e0e0' }}>
                                <Typography variant="subtitle1" sx={{ color: '#286844', fontWeight: 'bold' }}>
                                    VACCINATION SCHEDULE
                                </Typography>
                            </Box>
                            <Box sx={{ p: 2 }}>
                                <Stack spacing={2}>
                                    {vaccines.map((vaccine, index) => (
                                        <Card key={index} variant="outlined" sx={{ p: 2, bgcolor: '#f9f9f9' }}>
                                            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                                                {index + 1}. {vaccine.age} - {getDate(vaccine)}
                                            </Typography>
                                            <Stack spacing={0.5}>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                                    <Typography variant="body2">Vaccine:</Typography>
                                                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>{vaccine.vaccine}</Typography>
                                                </Box>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                                    <Typography variant="body2">Route:</Typography>
                                                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>{vaccine.route}</Typography>
                                                </Box>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                                    <Typography variant="body2">Notes:</Typography>
                                                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>{vaccine.notes}</Typography>
                                                </Box>
                                            </Stack>
                                        </Card>
                                    ))}
                                </Stack>
                            </Box>
                        </Card>

                        {/* Technical Summary */}
                        <Card sx={{ mb: 2, border: '1px solid #e0e0e0' }}>
                            <Box sx={{ bgcolor: '#f1f2b0', p: 1.5, borderBottom: '1px solid #e0e0e0' }}>
                                <Typography variant="subtitle1" sx={{ color: '#286844', fontWeight: 'bold' }}>
                                    TECHNICAL SUMMARY
                                </Typography>
                            </Box>
                            <Box sx={{ p: 2 }}>
                                <Stack spacing={1}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <Typography variant="body2">Total Vaccinations:</Typography>
                                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>{vaccines.length} vaccines</Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <Typography variant="body2">Vaccination Period:</Typography>
                                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                            {vaccines[0]?.age || 'Day 1'} to {vaccines[vaccines.length - 1]?.age || 'Final'}
                                        </Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <Typography variant="body2">Primary Diseases Covered:</Typography>
                                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>{getPrimaryDiseases(vaccines)}</Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <Typography variant="body2">Administration Routes:</Typography>
                                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>{getRoutes(vaccines)}</Typography>
                                    </Box>
                                </Stack>
                            </Box>
                        </Card>

                        {/* Important Notes */}
                        <Card sx={{ mb: 2, border: '1px solid #e0e0e0' }}>
                            <Box sx={{ bgcolor: '#f1f2b0', p: 1.5, borderBottom: '1px solid #e0e0e0' }}>
                                <Typography variant="subtitle1" sx={{ color: '#286844', fontWeight: 'bold' }}>
                                    IMPORTANT NOTES
                                </Typography>
                            </Box>
                            <Box sx={{ p: 2 }}>
                                <Stack spacing={1}>
                                    <Typography variant="body2">• Follow manufacturer's instructions for each vaccine</Typography>
                                    <Typography variant="body2">• Maintain proper cold chain storage (2-8°C)</Typography>
                                    <Typography variant="body2">• Use clean, sterile equipment for administration</Typography>
                                    <Typography variant="body2">• Monitor birds for adverse reactions post-vaccination</Typography>
                                    <Typography variant="body2">• Keep vaccination records for traceability</Typography>
                                    <Typography variant="body2">• Consult veterinarian for any health concerns</Typography>
                                </Stack>
                            </Box>
                        </Card>
                    </Box>
                </DialogContent>
                
                <DialogActions sx={{ p: 2, bgcolor: '#f9f9f9' }}>
                    <Button onClick={() => setPreviewOpen(false)} variant="outlined">
                        Close Preview
                    </Button>
                    <Button 
                        onClick={() => {
                            setPreviewOpen(false);
                            // Trigger PDF download
                            const downloadButton = document.querySelector('[data-pdf-download]') as HTMLButtonElement;
                            if (downloadButton) downloadButton.click();
                        }} 
                        variant="contained" 
                        color="success"
                        startIcon={<Download />}
                    >
                        Download PDF
                    </Button>
                </DialogActions>
            </Dialog>
        );
    };

    return (
        <Box sx={{ bgcolor: "#f8f9fa", minHeight: "100vh", pb: 5 }}>
            {/* Hero Section */}
            <HeroSection
                title="Vaccination Schedule Generator"
                subtitle="Professional vaccination planning for all poultry types"
                description="Generate comprehensive vaccination schedules for broilers, layers, and sasso/kroilers. Get expert-recommended timelines and protocols with calendar integration."
                note="Enter chicken arrival date and type to get your full vaccination plan with calendar reminders."
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
                                <MenuItem value="sasso/kroilers">Sasso / Kroilers</MenuItem>
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
                            {/* Export all */}
                            <Box display="flex" justifyContent="flex-end" mb={2}>
                                <Button
                                    size="small"
                                    startIcon={<Download />}
                                    onClick={exportAllAsIcs}
                                    variant="contained"
                                    color="primary"
                                >
                                    Export all (.ics)
                                </Button>
                            </Box>

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
                                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                                {v.notes}
                                            </Typography>
                                            <Button
                                                size="small"
                                                startIcon={<CalendarToday />}
                                                onClick={(e) => openCalendarMenu(e, v)}
                                                variant="outlined"
                                                color="primary"
                                                fullWidth
                                            >
                                                Add to Calendar
                                            </Button>
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
                                                <TableCell sx={{ fontWeight: "bold" }}>Actions</TableCell>
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
                                                    <TableCell>
                                                        <Button
                                                            size="small"
                                                            startIcon={<CalendarToday />}
                                                            onClick={(e) => openCalendarMenu(e, v)}
                                                            variant="outlined"
                                                            color="primary"
                                                            sx={{ mr: 1 }}
                                                        >
                                                            Add to Calendar
                                                        </Button>
                                                    </TableCell>
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

                            {/* Contact Information */}
                            <Box mt={3}>
                                <Typography variant="h6" sx={{ mb: 2, color: '#286844', fontWeight: 'bold' }}>
                                    Contact Information
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                    Enter your contact details to download a PDF report.
                                </Typography>
                                
                                <PdfDownloader
                                    data={vaccines.map((v) => ({ ...v, date: getDate(v) }))}
                                    type={type}
                                    arrivalDate={arrivalDate.format("DD MMM YYYY")}
                                    saleDate={saleDate}
                                />
                            </Box>

                            {/* Preview Button */}
                            <Box textAlign={isMobile ? "center" : "right"} mt={2}>
                                <Button
                                    variant="outlined"
                                    color="success"
                                    startIcon={<Visibility />}
                                    onClick={() => setPreviewOpen(true)}
                                    sx={{ width: isMobile ? "100%" : "auto" }}
                                >
                                    Preview Report
                                </Button>
                            </Box>
                        </CardContent>
                    </Card>
                </Box>
            )}

            {/* Vaccination Reminders Section */}
            {reminders.length > 0 && (
                <Box maxWidth={900} mx="auto" mt={4} px={isMobile ? 2 : 0}>
                    <Card sx={{ borderRadius: 4, boxShadow: 6, bgcolor: "white" }}>
                        <CardContent>
                            <Stack direction="row" spacing={2} alignItems="center" mb={3}>
                                <Notifications sx={{ fontSize: 40, color: "#ff9800" }} />
                                <Typography variant="h5" color="warning.main" fontWeight="bold">
                                    Vaccination Reminders
                                </Typography>
                            </Stack>

                            {/* Overdue Reminders */}
                            {getOverdueReminders().length > 0 && (
                                <Box mb={3}>
                                    <Typography variant="h6" color="error" sx={{ mb: 2 }}>
                                        <Warning sx={{ mr: 1, verticalAlign: 'middle' }} />
                                        Overdue Vaccinations
                                    </Typography>
                                    <Stack spacing={2}>
                                        {getOverdueReminders().map((reminder) => (
                                            <Card key={reminder.id} sx={{ bgcolor: '#ffebee', border: '1px solid #f44336' }}>
                                                <CardContent sx={{ py: 2 }}>
                                                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                                                        <Box>
                                                            <Typography variant="subtitle1" fontWeight="bold">
                                                                {reminder.vaccine}
                                                            </Typography>
                                                            <Typography variant="body2" color="text.secondary">
                                                                {reminder.batchName} • Due: {reminder.scheduledDate.format('DD MMM YYYY')}
                                                            </Typography>
                                                            {reminder.notes && (
                                                                <Typography variant="body2" sx={{ mt: 1 }}>
                                                                    {reminder.notes}
                                                                </Typography>
                                                            )}
                                                        </Box>
                                                        <Button
                                                            size="small"
                                                            startIcon={<CheckCircle />}
                                                            onClick={() => markAsCompleted(reminder.id)}
                                                            variant="contained"
                                                            color="success"
                                                        >
                                                            Mark Complete
                                                        </Button>
                                                    </Stack>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </Stack>
                                </Box>
                            )}

                            {/* Upcoming Reminders */}
                            {getUpcomingReminders().length > 0 && (
                                <Box>
                                    <Typography variant="h6" color="primary" sx={{ mb: 2 }}>
                                        <CalendarToday sx={{ mr: 1, verticalAlign: 'middle' }} />
                                        Upcoming Vaccinations
                                    </Typography>
                                    <Stack spacing={2}>
                                        {getUpcomingReminders().map((reminder) => (
                                            <Card key={reminder.id} sx={{ bgcolor: '#e3f2fd', border: '1px solid #2196f3' }}>
                                                <CardContent sx={{ py: 2 }}>
                                                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                                                        <Box>
                                                            <Typography variant="subtitle1" fontWeight="bold">
                                                                {reminder.vaccine}
                                                            </Typography>
                                                            <Typography variant="body2" color="text.secondary">
                                                                {reminder.batchName} • Scheduled: {reminder.scheduledDate.format('DD MMM YYYY')}
                                                            </Typography>
                                                            {reminder.notes && (
                                                                <Typography variant="body2" sx={{ mt: 1 }}>
                                                                    {reminder.notes}
                                                                </Typography>
                                                            )}
                                                        </Box>
                                                        <Chip 
                                                            label={reminder.scheduledDate.diff(dayjs(), 'days') === 0 ? 'Today' : 
                                                                   reminder.scheduledDate.diff(dayjs(), 'days') === 1 ? 'Tomorrow' :
                                                                   `${reminder.scheduledDate.diff(dayjs(), 'days')} days`}
                                                            color={reminder.scheduledDate.diff(dayjs(), 'days') <= 1 ? 'warning' : 'default'}
                                                        />
                                                    </Stack>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </Stack>
                                </Box>
                            )}
                        </CardContent>
                    </Card>
                </Box>
            )}

            {/* Preview Dialog */}
            <PreviewDialog />

            {/* Calendar provider menu */}
            <Menu
                anchorEl={calendarMenuAnchorEl}
                open={Boolean(calendarMenuAnchorEl)}
                onClose={closeCalendarMenu}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                transformOrigin={{ vertical: 'top', horizontal: 'left' }}
            >
                <MenuItem onClick={handleAddGoogleCalendar}>
                    <ListItemIcon>
                        <CalendarToday fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary="Add to Google Calendar" />
                </MenuItem>
                <MenuItem onClick={handleDownloadIcsSingle}>
                    <ListItemIcon>
                        <Download fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary="Download .ics (Apple/Outlook)" />
                </MenuItem>
            </Menu>

            {/* Snackbar for notifications */}
            <Snackbar
                open={snackbarOpen}
                autoHideDuration={4000}
                onClose={() => setSnackbarOpen(false)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert onClose={() => setSnackbarOpen(false)} severity="success" sx={{ width: '100%' }}>
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default Vaccination;
