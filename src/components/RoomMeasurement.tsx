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
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    IconButton,
    Chip,
} from "@mui/material";
import { Close, Visibility, Download } from "@mui/icons-material";
import jsPDF from "jspdf";
import logoImg from "../assets/logo.png";
import HeroSection from "./HeroSection";
import { COUNTRY_CODES, DEFAULT_COUNTRY_CODE } from "../constants";

const spaceRequirements: Record<string, number> = {
    broilers: 0.09,
    layers: 0.18,
    "sasso/kroilers": 0.14,
    local: 0.12,
};


const HouseMeasurement: React.FC = () => {
    const [type, setType] = useState<string>("");
    const [birds, setBirds] = useState<number | "">("");
    const [result, setResult] = useState<string>("");
    const [contact, setContact] = useState({ phone: "", email: "", countryCode: DEFAULT_COUNTRY_CODE });
    const [previewOpen, setPreviewOpen] = useState(false);

    const resultRef = useRef<HTMLDivElement>(null);

    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

    useEffect(() => {
        if (type && birds) {
            const requiredSpace = spaceRequirements[type] * Number(birds);
            // Prefer a 2:1 aspect, but cap width at 12m; adjust length accordingly
            let width = Math.sqrt(requiredSpace / 2);
            if (width > 12) width = 12;
            const length = +(requiredSpace / width).toFixed(2);

            // Ventilation recommendation: target ~10% of floor area as continuous side openings
            const targetOpenArea = requiredSpace * 0.1; // m²
            const openingHeight = 1.9; // Window area height (2.80m - 0.90m = 1.90m)
            const totalSideOpeningLength = targetOpenArea / openingHeight; // Total length of openings needed
            const openingPerSide = totalSideOpeningLength / 2; // Opening length per side wall

            const recommendation = [
                `✅ Space needed: ${requiredSpace.toFixed(2)} m² for ${birds} ${type}.`,
                `🏗️ Build size: ${length.toFixed(2)} m long × ${width.toFixed(2)} m wide (max width 12 m).`,
                `🌬️ Continuous side windows: Create continuous openings along both side walls for fresh air. Total opening area needed: ${(targetOpenArea).toFixed(1)} m². This means approximately ${(openingPerSide).toFixed(1)} m of continuous opening along each side wall (from 0.90m to 2.80m height). Use wire mesh or curtains to control airflow and weather.`,
                `📏 Wall heights: solid wall from ground to 0.90 m; continuous window area from 0.90 m to 2.80 m; eave (roof edge) around 3.20 m.`,
                `🧭 Orientation: Orient the building in an East-West direction for best aeration and to avoid direct sun exposure for the flock.`,
                `ℹ️ Tip: face the long side to the wind, add roof overhangs and gutters, and raise the floor a little to drain water.`,
            ].join("\n\n");

            setResult(recommendation);
        } else {
            setResult("");
        }
    }, [type, birds]);

    useEffect(() => {
        if (resultRef.current) {
            resultRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [result]);

    // Generate PDF with multi-page support
    const generatePDF = () => {
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();

        // Calculate values
        const requiredSpace = spaceRequirements[type] * Number(birds);
        let width = Math.sqrt(requiredSpace / 2);
        if (width > 12) width = 12;
        const length = +(requiredSpace / width).toFixed(2);
        const targetOpenArea = requiredSpace * 0.1;
        const openingHeight = 1.9; // Window area height (2.80m - 0.90m = 1.90m)
        const totalSideOpeningLength = targetOpenArea / openingHeight; // Total length of openings needed
        const openingPerSide = totalSideOpeningLength / 2; // Opening length per side wall

        // Helper function to add header to each page
        const addHeader = (pageNum: number) => {
            // Logo
            const img = new Image();
            img.src = logoImg;
            doc.addImage(img, "PNG", 14, 8, 20, 20, undefined, "FAST");
            
            // Title
            doc.setFontSize(18);
            doc.setTextColor(40, 100, 60);
            doc.text("Poultry House Design Report", pageWidth / 2, 20, { align: "center" });
            
            // Page number
            doc.setFontSize(10);
            doc.setTextColor(100);
            doc.text(`Page ${pageNum}`, pageWidth - 14, 20, { align: "right" });
        };

        // Helper function to add footer to each page
        const addFooter = (pageNum: number, isLastPage: boolean) => {
            const footerY = pageHeight - 40;
            
            if (isLastPage) {
                // Contact info
                doc.setFontSize(9);
                doc.setTextColor(100);
                doc.setFont('helvetica', 'normal');
                
                const fullPhoneNumber = contact.phone ? `${contact.countryCode}${contact.phone}` : '';
                const contactText = contact.phone && contact.email
                    ? `Contact: ${fullPhoneNumber} | ${contact.email}`
                    : contact.phone
                        ? `Contact: ${fullPhoneNumber}`
                        : contact.email
                            ? `Contact: ${contact.email}`
                            : 'Contact: Not provided';
                
                doc.text(contactText, 14, footerY);
                
                // Generated date and time
                const now = new Date();
                const dateTime = `Generated: ${now.toLocaleDateString()} at ${now.toLocaleTimeString()}`;
                doc.text(dateTime, pageWidth - 14, footerY, { align: "right" });
                
                // Company branding
                doc.text("Powered by River Poultry & SmartVet", pageWidth / 2, footerY + 15, { align: "center" });
            } else {
                // Just page number for non-last pages
                doc.setFontSize(9);
                doc.setTextColor(100);
                doc.text(`Page ${pageNum}`, pageWidth / 2, footerY + 15, { align: "center" });
            }
        };

        // Helper function to draw table row
        const drawTableRow = (label: string, value: string, isHeader = false, isTotal = false) => {
            const leftMargin = 14;
            const rightMargin = pageWidth - 14;
            const tableWidth = rightMargin - leftMargin;
            const rowHeight = 8;
            const headerHeight = 10;

            if (isHeader) {
                doc.setFillColor(241, 242, 176);
                doc.rect(leftMargin, yPosition, tableWidth, headerHeight, 'F');
                doc.setFontSize(12);
                doc.setTextColor(40, 100, 60);
                doc.setFont('helvetica', 'bold');
            } else if (isTotal) {
                doc.setFillColor(240, 240, 240);
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
            const leftMargin = 14;
            const rightMargin = pageWidth - 14;
            yPosition += 3;
            doc.setDrawColor(200, 200, 200);
            doc.line(leftMargin, yPosition, rightMargin, yPosition);
            yPosition += 5;
        };

        // Check if we need a new page
        const checkNewPage = (requiredSpace: number) => {
            if (yPosition + requiredSpace > pageHeight - 60) {
                doc.addPage();
                pageNum++;
                yPosition = 35;
                addHeader(pageNum);
            }
        };

        let yPosition = 35;
        let pageNum = 1;
        addHeader(pageNum);

        // Basic Information Section
        checkNewPage(50);
        drawTableRow("BASIC INFORMATION", "", true);
        drawTableRow("Chicken Type", type);
        drawTableRow("Number of Birds", Number(birds).toLocaleString());
        drawTableRow("Space per Bird", `${spaceRequirements[type]} m²`);
        drawTableRow("Total Space Required", `${requiredSpace.toFixed(2)} m²`);
        drawSectionDivider();

        // Building Dimensions Section
        checkNewPage(50);
        drawTableRow("BUILDING DIMENSIONS", "", true);
        drawTableRow("Length", `${length.toFixed(2)} m`);
        drawTableRow("Width", `${width.toFixed(2)} m`);
        drawTableRow("Aspect Ratio", `${(length/width).toFixed(1)}:1`);
        drawSectionDivider();

        // Ventilation Section
        checkNewPage(50);
        drawTableRow("VENTILATION REQUIREMENTS", "", true);
        drawTableRow("Required Opening Area", `${targetOpenArea.toFixed(1)} m²`);
        drawTableRow("Opening Type", "Continuous side openings");
        drawTableRow("Opening per Side Wall", `${openingPerSide.toFixed(1)} m length`);
        drawTableRow("Opening Height", "1.90 m (0.90m to 2.80m)");
        drawTableRow("Control Method", "Wire mesh or curtains");
        drawSectionDivider();

        // Building Specifications Section
        checkNewPage(50);
        drawTableRow("BUILDING SPECIFICATIONS", "", true);
        drawTableRow("Solid Wall Height", "0.90 m (from ground)");
        drawTableRow("Window Area Height", "0.90 m - 2.80 m");
        drawTableRow("Eave Height", "3.20 m");
        drawTableRow("Orientation", "East-West (recommended)");
        drawSectionDivider();

        // Design Notes Section
        checkNewPage(50);
        drawTableRow("DESIGN RECOMMENDATIONS", "", true);
        drawTableRow("Window Type", "Continuous side openings");
        drawTableRow("Window Control", "Wire mesh or curtains");
        drawTableRow("Roof Features", "Overhangs and gutters");
        drawTableRow("Floor Design", "Raised for drainage");

                                            // Add chicken barn sketch on a new page
                                            checkNewPage(120);
                                            yPosition += 15;
                                            doc.setFontSize(12);
                                            doc.setTextColor(40, 100, 60);
                                            doc.setFont('helvetica', 'bold');
                                            doc.text("CHICKEN BARN SIDE ELEVATION SKETCH", 14, yPosition);
                                            yPosition += 10;

                                            // Draw side elevation sketch (architectural style)
                                            const sketchY = yPosition;
                                            const sketchWidth = 100;
                                            const sketchHeight = 70;
                                            const sketchX = 14 + (pageWidth - 28 - sketchWidth) / 2;

                                            // Ground line
                                            doc.setDrawColor(0, 0, 0);
                                            doc.setLineWidth(1);
                                            doc.line(sketchX - 10, sketchY + sketchHeight, sketchX + sketchWidth + 10, sketchY + sketchHeight);

                                            // Roof (pitched roof)
                                            const roofHeight = 15;
                                            doc.line(sketchX, sketchY + 10, sketchX + sketchWidth/2, sketchY + 10 - roofHeight);
                                            doc.line(sketchX + sketchWidth/2, sketchY + 10 - roofHeight, sketchX + sketchWidth, sketchY + 10);

                                            // Eave overhang
                                            doc.line(sketchX - 5, sketchY + 10, sketchX + sketchWidth + 5, sketchY + 10);

                                            // Solid wall from ground to 0.90m (fill with solid color)
                                            doc.setFillColor(240, 240, 240);
                                            doc.setDrawColor(0, 0, 0);
                                            doc.setLineWidth(1);
                                            const solidWallHeight = 15; // Represents 0.90m
                                            doc.rect(sketchX, sketchY + 10, sketchWidth, solidWallHeight, 'FD');

                                            // Window area (0.90m to 2.80m = 1.90m height) - above solid wall
                                            doc.setFillColor(255, 255, 255); // White background for window area
                                            doc.setDrawColor(0, 0, 0);
                                            doc.setLineWidth(1);
                                            const windowHeight = 25; // Represents 1.90m window area
                                            const windowStartY = sketchY + 10 + solidWallHeight;
                                            doc.rect(sketchX, windowStartY, sketchWidth, windowHeight, 'FD');
                                            
                                            // Continuous side windows
                                            doc.setDrawColor(100, 100, 100);
                                            doc.setLineWidth(0.5);
                                            
                                            // Left side windows (continuous)
                                            doc.rect(sketchX - 3, windowStartY, 3, windowHeight);
                                            doc.rect(sketchX - 3, windowStartY + 5, 3, 2); // Window frame detail
                                            doc.rect(sketchX - 3, windowStartY + 12, 3, 2); // Window frame detail
                                            doc.rect(sketchX - 3, windowStartY + 19, 3, 2); // Window frame detail
                                            
                                            // Right side windows (continuous)
                                            doc.rect(sketchX + sketchWidth, windowStartY, 3, windowHeight);
                                            doc.rect(sketchX + sketchWidth, windowStartY + 5, 3, 2); // Window frame detail
                                            doc.rect(sketchX + sketchWidth, windowStartY + 12, 3, 2); // Window frame detail
                                            doc.rect(sketchX + sketchWidth, windowStartY + 19, 3, 2); // Window frame detail

                                            // Door (main entrance) - in 1st third of side wall, solid wall section
                                            doc.setDrawColor(0, 0, 0);
                                            doc.setLineWidth(1);
                                            const doorWidth = 12;
                                            const doorHeight = 12;
                                            const doorX = sketchX + sketchWidth/3 - doorWidth/2; // 1st third of side wall
                                            doc.rect(doorX, sketchY + 10 + solidWallHeight - doorHeight, doorWidth, doorHeight);

                                            // Height measurements and labels
                                            doc.setFontSize(7);
                                            doc.setTextColor(0, 0, 0);
                                            doc.setFont('helvetica', 'normal');
                                            
                                            // Height labels
                                            doc.text("0.90m", sketchX - 12, sketchY + 10 + solidWallHeight + 3);
                                            doc.text("2.80m", sketchX - 12, sketchY + 10 + solidWallHeight + windowHeight + 3);
                                            doc.text("3.20m", sketchX - 12, sketchY + 10 - 5);
                                            
                                            // Feature labels
                                            doc.text("Solid Wall", sketchX + 5, sketchY + 10 + 8);
                                            doc.text("(Ground to 0.90m)", sketchX + 5, sketchY + 10 + 12);
                                            doc.text("Windows", sketchX - 20, sketchY + 10 + solidWallHeight + 12);
                                            doc.text("Door", doorX + doorWidth/2 - 2, sketchY + 10 + solidWallHeight + 5);
                                            doc.text("Eave", sketchX + sketchWidth/2 - 2, sketchY + 10 - 8);
                                            
                                            // Orientation
                                            doc.setFontSize(8);
                                            doc.text("E", sketchX + sketchWidth/2 - 1, sketchY - 20);
                                            doc.text("W", sketchX + sketchWidth/2 - 1, sketchY + sketchHeight + 15);

                                            // Professional disclaimer
                                            yPosition += sketchHeight + 25;
                                            doc.setFontSize(9);
                                            doc.setTextColor(100, 100, 100);
                                            doc.setFont('helvetica', 'italic');
                                            doc.text("Note: This is not an architectural design but rather a technical recommendation for your design.", 14, yPosition);
                                            yPosition += 8;
                                            doc.text("Always consult a professional builder to translate this to a standard build.", 14, yPosition);

        // Add footer to all pages
        for (let i = 1; i <= pageNum; i++) {
            doc.setPage(i);
            addFooter(i, i === pageNum);
        }

        return doc;
    };

    // Preview component
    const PreviewDialog = () => {
        if (!result) return null;

        const requiredSpace = spaceRequirements[type] * Number(birds);
        let width = Math.sqrt(requiredSpace / 2);
        if (width > 12) width = 12;
        const length = +(requiredSpace / width).toFixed(2);
        const targetOpenArea = requiredSpace * 0.1;
        const openingHeight = 1.9; // Window area height (2.80m - 0.90m = 1.90m)
        const totalSideOpeningLength = targetOpenArea / openingHeight; // Total length of openings needed
        const openingPerSide = totalSideOpeningLength / 2; // Opening length per side wall

        return (
            <Dialog
                open={previewOpen}
                onClose={() => setPreviewOpen(false)}
                maxWidth="md"
                fullWidth
                PaperProps={{
                    sx: { minHeight: '80vh' }
                }}
            >
                <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6" sx={{ color: '#286844', fontWeight: 'bold' }}>
                        📋 House Design Report Preview
                    </Typography>
                    <IconButton onClick={() => setPreviewOpen(false)}>
                        <Close />
                    </IconButton>
                </DialogTitle>
                <DialogContent dividers>
                    <Box sx={{ p: 2 }}>
                        {/* Header */}
                        <Box sx={{ textAlign: 'center', mb: 3, pb: 2, borderBottom: '2px solid #f1f2b0' }}>
                            <Typography variant="h5" sx={{ color: '#286844', fontWeight: 'bold', mb: 1 }}>
                                Poultry House Design Report
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#666' }}>
                                Generated: {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}
                            </Typography>
                        </Box>

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
                                        <Typography variant="body2">Chicken Type:</Typography>
                                        <Chip label={type} color="primary" size="small" />
                                    </Box>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <Typography variant="body2">Number of Birds:</Typography>
                                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>{Number(birds).toLocaleString()}</Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <Typography variant="body2">Space per Bird:</Typography>
                                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>{spaceRequirements[type]} m²</Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <Typography variant="body2">Total Space Required:</Typography>
                                        <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#286844' }}>{requiredSpace.toFixed(2)} m²</Typography>
                                    </Box>
                                </Stack>
                            </Box>
                        </Card>

                        {/* Building Dimensions */}
                        <Card sx={{ mb: 2, border: '1px solid #e0e0e0' }}>
                            <Box sx={{ bgcolor: '#f1f2b0', p: 1.5, borderBottom: '1px solid #e0e0e0' }}>
                                <Typography variant="subtitle1" sx={{ color: '#286844', fontWeight: 'bold' }}>
                                    BUILDING DIMENSIONS
                                </Typography>
                            </Box>
                            <Box sx={{ p: 2 }}>
                                <Stack spacing={1}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <Typography variant="body2">Length:</Typography>
                                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>{length.toFixed(2)} m</Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <Typography variant="body2">Width:</Typography>
                                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>{width.toFixed(2)} m</Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <Typography variant="body2">Aspect Ratio:</Typography>
                                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>{(length/width).toFixed(1)}:1</Typography>
                                    </Box>
                                </Stack>
                            </Box>
                        </Card>

                        {/* Ventilation Requirements */}
                        <Card sx={{ mb: 2, border: '1px solid #e0e0e0' }}>
                            <Box sx={{ bgcolor: '#f1f2b0', p: 1.5, borderBottom: '1px solid #e0e0e0' }}>
                                <Typography variant="subtitle1" sx={{ color: '#286844', fontWeight: 'bold' }}>
                                    VENTILATION REQUIREMENTS
                                </Typography>
                            </Box>
                            <Box sx={{ p: 2 }}>
                                <Stack spacing={1}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <Typography variant="body2">Required Opening Area:</Typography>
                                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>{targetOpenArea.toFixed(1)} m²</Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <Typography variant="body2">Opening Type:</Typography>
                                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>Continuous side openings</Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <Typography variant="body2">Opening per Side Wall:</Typography>
                                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>{openingPerSide.toFixed(1)} m length</Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <Typography variant="body2">Opening Height:</Typography>
                                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>1.90 m (0.90m to 2.80m)</Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <Typography variant="body2">Control Method:</Typography>
                                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>Wire mesh or curtains</Typography>
                                    </Box>
                                </Stack>
                            </Box>
                        </Card>

                        {/* Building Specifications */}
                        <Card sx={{ mb: 2, border: '1px solid #e0e0e0' }}>
                            <Box sx={{ bgcolor: '#f1f2b0', p: 1.5, borderBottom: '1px solid #e0e0e0' }}>
                                <Typography variant="subtitle1" sx={{ color: '#286844', fontWeight: 'bold' }}>
                                    BUILDING SPECIFICATIONS
                                </Typography>
                            </Box>
                            <Box sx={{ p: 2 }}>
                                <Stack spacing={1}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <Typography variant="body2">Solid Wall Height:</Typography>
                                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>0.90 m (from ground)</Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <Typography variant="body2">Window Area Height:</Typography>
                                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>0.90 m - 2.80 m</Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <Typography variant="body2">Eave Height:</Typography>
                                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>3.20 m</Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <Typography variant="body2">Orientation:</Typography>
                                        <Chip label="East-West (recommended)" color="success" size="small" />
                                    </Box>
                                </Stack>
                            </Box>
                        </Card>

                        {/* Design Recommendations */}
                        <Card sx={{ mb: 2, border: '1px solid #e0e0e0' }}>
                            <Box sx={{ bgcolor: '#f1f2b0', p: 1.5, borderBottom: '1px solid #e0e0e0' }}>
                                <Typography variant="subtitle1" sx={{ color: '#286844', fontWeight: 'bold' }}>
                                    DESIGN RECOMMENDATIONS
                                </Typography>
                            </Box>
                            <Box sx={{ p: 2 }}>
                                <Stack spacing={1}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <Typography variant="body2">Window Type:</Typography>
                                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>Continuous side openings</Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <Typography variant="body2">Window Control:</Typography>
                                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>Wire mesh or curtains</Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <Typography variant="body2">Roof Features:</Typography>
                                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>Overhangs and gutters</Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <Typography variant="body2">Floor Design:</Typography>
                                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>Raised for drainage</Typography>
                                    </Box>
                                </Stack>
                            </Box>
                        </Card>

                        {/* Barn Sketch */}
                        <Card sx={{ mb: 2, border: '1px solid #e0e0e0' }}>
                            <Box sx={{ bgcolor: '#f1f2b0', p: 1.5, borderBottom: '1px solid #e0e0e0' }}>
                                <Typography variant="subtitle1" sx={{ color: '#286844', fontWeight: 'bold' }}>
                                    CHICKEN BARN SIDE ELEVATION SKETCH
                                </Typography>
                            </Box>
                            <Box sx={{ p: 2, textAlign: 'center' }}>
                                <Box sx={{ 
                                    display: 'inline-block', 
                                    border: '2px solid #333', 
                                    p: 2, 
                                    borderRadius: 1,
                                    bgcolor: '#f9f9f9',
                                    position: 'relative'
                                }}>
                                    <Typography variant="body2" sx={{ mb: 1, fontWeight: 'bold' }}>E</Typography>
                                    
                                    {/* Side Elevation View */}
                                    <Box sx={{ 
                                        width: 150, 
                                        height: 90, 
                                        position: 'relative',
                                        bgcolor: 'white',
                                        border: '2px solid #333'
                                    }}>
                                        {/* Ground line */}
                                        <Box sx={{ 
                                            position: 'absolute', 
                                            bottom: 0, 
                                            left: -10, 
                                            right: -10, 
                                            height: 2, 
                                            bgcolor: '#333' 
                                        }} />
                                        
                                        {/* Roof (pitched) */}
                                        <Box sx={{ 
                                            position: 'absolute', 
                                            top: 10, 
                                            left: 0, 
                                            right: 0, 
                                            height: 0, 
                                            borderLeft: '75px solid transparent',
                                            borderRight: '75px solid transparent',
                                            borderBottom: '15px solid #8B4513'
                                        }} />
                                        
                                        {/* Eave overhang */}
                                        <Box sx={{ 
                                            position: 'absolute', 
                                            top: 25, 
                                            left: -5, 
                                            right: -5, 
                                            height: 2, 
                                            bgcolor: '#333' 
                                        }} />
                                        
                                        {/* Solid wall from ground to 0.90m */}
                                        <Box sx={{ 
                                            position: 'absolute', 
                                            top: 25, 
                                            left: 0, 
                                            right: 0, 
                                            height: 18, 
                                            bgcolor: '#f0f0f0',
                                            border: '1px solid #ccc'
                                        }} />
                                        <Typography variant="caption" sx={{ 
                                            position: 'absolute', 
                                            left: 5, 
                                            top: 30, 
                                            fontSize: '7px',
                                            fontWeight: 'bold',
                                            color: '#333'
                                        }}>
                                            Solid Wall (Ground to 0.90m)
                                        </Typography>
                                        
                                        {/* Window area (0.90m to 2.80m) - above solid wall */}
                                        <Box sx={{ 
                                            position: 'absolute', 
                                            top: 43, 
                                            left: 0, 
                                            right: 0, 
                                            height: 30, 
                                            bgcolor: 'white',
                                            border: '1px solid #ccc'
                                        }} />
                                        
                                        {/* Left side windows */}
                                        <Box sx={{ 
                                            position: 'absolute', 
                                            left: -8, 
                                            top: 43, 
                                            width: 6, 
                                            height: 30, 
                                            bgcolor: '#81c784',
                                            border: '1px solid #4caf50'
                                        }} />
                                        
                                        {/* Right side windows */}
                                        <Box sx={{ 
                                            position: 'absolute', 
                                            right: -8, 
                                            top: 43, 
                                            width: 6, 
                                            height: 30, 
                                            bgcolor: '#81c784',
                                            border: '1px solid #4caf50'
                                        }} />
                                        
                                        {/* Door - in 1st third of side wall, solid wall section */}
                                        <Box sx={{ 
                                            position: 'absolute', 
                                            top: 31, 
                                            left: '33.33%', 
                                            transform: 'translateX(-50%)',
                                            width: 20, 
                                            height: 12, 
                                            bgcolor: '#8B4513',
                                            border: '1px solid #654321'
                                        }} />
                                        
                                        {/* Height measurements */}
                                        <Typography variant="caption" sx={{ 
                                            position: 'absolute', 
                                            left: -25, 
                                            top: 34, 
                                            fontSize: '8px',
                                            fontWeight: 'bold'
                                        }}>
                                            0.90m
                                        </Typography>
                                        <Typography variant="caption" sx={{ 
                                            position: 'absolute', 
                                            left: -25, 
                                            top: 64, 
                                            fontSize: '8px',
                                            fontWeight: 'bold'
                                        }}>
                                            2.80m
                                        </Typography>
                                        <Typography variant="caption" sx={{ 
                                            position: 'absolute', 
                                            left: -25, 
                                            top: 20, 
                                            fontSize: '8px',
                                            fontWeight: 'bold'
                                        }}>
                                            3.20m
                                        </Typography>
                                    </Box>
                                    
                                    <Typography variant="body2" sx={{ mt: 1, fontWeight: 'bold' }}>W</Typography>
                                    <Typography variant="caption" sx={{ display: 'block', mt: 1, mb: 1 }}>
                                        Side Elevation: Continuous windows, solid base wall, door in 1st third, pitched roof
                                    </Typography>
                                    
                                    {/* Professional disclaimer */}
                                    <Typography variant="caption" sx={{ 
                                        display: 'block', 
                                        fontStyle: 'italic', 
                                        color: '#666',
                                        textAlign: 'left',
                                        mt: 2,
                                        p: 1,
                                        bgcolor: '#f5f5f5',
                                        borderRadius: 1
                                    }}>
                                        <strong>Note:</strong> This is not an architectural design but rather a technical recommendation for your design. Always consult a professional builder to translate this to a standard build.
                                    </Typography>
                                </Box>
                            </Box>
                        </Card>

                        {/* Footer */}
                        <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid #e0e0e0', textAlign: 'center' }}>
                            <Typography variant="body2" sx={{ color: '#666', mb: 1 }}>
                                {contact.phone && contact.email
                                    ? `Contact: ${contact.countryCode}${contact.phone} | ${contact.email}`
                                    : contact.phone
                                        ? `Contact: ${contact.countryCode}${contact.phone}`
                                        : contact.email
                                            ? `Contact: ${contact.email}`
                                            : 'Contact: Not provided'}
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#999' }}>
                                Powered by River Poultry & SmartVet
                            </Typography>
                        </Box>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 2, gap: 1 }}>
                    <Button onClick={() => setPreviewOpen(false)} variant="outlined">
                        Close Preview
                    </Button>
                    <Button 
                        onClick={() => {
                            const doc = generatePDF();
                            doc.save("House_Design_Report.pdf");
                            setPreviewOpen(false);
                        }} 
                        variant="contained" 
                        startIcon={<Download />}
                        sx={{ bgcolor: '#286844', '&:hover': { bgcolor: '#1e4d2e' } }}
                    >
                        Download PDF
                    </Button>
                </DialogActions>
            </Dialog>
        );
    };

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
                                    <MenuItem value="sasso/kroilers">Sasso/Kroilers</MenuItem>
                                    <MenuItem value="local">Local</MenuItem>
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
                            <Card ref={resultRef} sx={{ mt: 4, p: isMobile ? 2 : 3, borderRadius: 2, bgcolor: "#fff" }}>
                                <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>House Design Notes</Typography>
                                <Typography variant="body1" sx={{ whiteSpace: "pre-line", lineHeight: 1.6 }}>{result}</Typography>

                                {/* Contact gate for PDF */}
                                <Stack direction={{ xs: "column", md: "row" }} spacing={2} mt={3}>
                                    <Box sx={{ display: 'flex', gap: 1, flex: 2 }}>
                                        <TextField
                                            select
                                            label="Country Code"
                                            value={contact.countryCode}
                                            onChange={e => setContact({ ...contact, countryCode: e.target.value })}
                                            sx={{ minWidth: 140 }}
                                        >
                                            {COUNTRY_CODES.map((country) => (
                                                <MenuItem key={country.code} value={country.code}>
                                                    {country.name}
                                                </MenuItem>
                                            ))}
                                        </TextField>
                                        <TextField 
                                            label="Phone/WhatsApp (optional)" 
                                            fullWidth 
                                            value={contact.phone} 
                                            onChange={(e) => setContact({ ...contact, phone: e.target.value })}
                                            placeholder="e.g., 712345678"
                                        />
                                    </Box>
                                    <TextField label="Email (optional)" type="email" fullWidth value={contact.email} onChange={(e) => setContact({ ...contact, email: e.target.value })} sx={{ flex: 1 }} />
                                </Stack>
                                <Box mt={2}>
                                    <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                                        <Button
                                            variant="outlined"
                                            startIcon={<Visibility />}
                                            onClick={() => setPreviewOpen(true)}
                                            sx={{ 
                                                borderColor: '#286844', 
                                                color: '#286844',
                                                '&:hover': { 
                                                    borderColor: '#1e4d2e', 
                                                    bgcolor: '#f1f2b0' 
                                                }
                                            }}
                                        >
                                            Preview Report
                                        </Button>
                                        <Button
                                            variant="contained"
                                            disabled={!contact.phone && !contact.email}
                                            startIcon={<Download />}
                                            onClick={() => {
                                                const doc = generatePDF();
                                                doc.save("House_Design_Report.pdf");
                                            }}
                                            sx={{ 
                                                bgcolor: '#286844', 
                                                '&:hover': { bgcolor: '#1e4d2e' }
                                            }}
                                        >
                                            Download PDF
                                        </Button>
                                    </Stack>
                                </Box>
                            </Card>
                        )}
                    </CardContent>
                </Card>
            </Box>
            
            {/* Preview Dialog */}
            <PreviewDialog />
        </Box>
    );
};

export default HouseMeasurement;
