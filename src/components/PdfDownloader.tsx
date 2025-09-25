import React, { useState } from "react";
import { Button, TextField, useMediaQuery, useTheme, Box, Typography, MenuItem } from "@mui/material";
import { Download } from "@mui/icons-material";
import jsPDF from "jspdf";
import logoImg from "../assets/logo.png";

// Country code options for phone numbers
const COUNTRY_CODES = [
  { code: "+254", name: "Kenya (+254)" },
  { code: "+256", name: "Uganda (+256)" },
  { code: "+255", name: "Tanzania (+255)" },
  { code: "+250", name: "Rwanda (+250)" },
  { code: "+251", name: "Ethiopia (+251)" },
  { code: "+234", name: "Nigeria (+234)" },
  { code: "+233", name: "Ghana (+233)" },
  { code: "+27", name: "South Africa (+27)" },
  { code: "+1", name: "USA/Canada (+1)" },
  { code: "+44", name: "UK (+44)" },
  { code: "+49", name: "Germany (+49)" },

];

interface PdfDownloaderProps {
    data: { age: string; vaccine: string; route: string; notes: string; date?: string }[];
    type: string;
    arrivalDate: string;
    saleDate: string;
}

const PdfDownloader: React.FC<PdfDownloaderProps> = ({ data, type, arrivalDate, saleDate }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
    const [contact, setContact] = useState({ phone: "", email: "", countryCode: "+254" }); // Default to Kenya

    const generatePdf = () => {
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        let yPosition = 35;
        let pageNum = 1;

        // Helper function to add header to each page
        const addHeader = (pageNum: number) => {
            // Logo
            const img = new Image();
            img.src = logoImg;
            doc.addImage(img, "PNG", 14, 8, 20, 20, undefined, "FAST");
            
            // Title
            doc.setFontSize(16);
            doc.setTextColor(40, 100, 60);
            doc.setFont('helvetica', 'bold');
            doc.text("Poultry Vaccination Report", 40, 20);
            
            // Page number
            doc.setFontSize(10);
            doc.setTextColor(100, 100, 100);
            doc.setFont('helvetica', 'normal');
            doc.text(`Page ${pageNum}`, pageWidth - 20, 20, { align: 'right' });
        };

        // Helper function to add footer
        const addFooter = (pageNum: number, isLastPage: boolean) => {
            const footerY = pageHeight - 20;
            
            if (isLastPage) {
                // Contact info and generated date on last page
                doc.setFontSize(9);
                doc.setTextColor(100, 100, 100);
                doc.setFont('helvetica', 'normal');
                
                if (contact.phone || contact.email) {
                    const contactInfo = [];
                    if (contact.phone) contactInfo.push(`Phone: ${contact.countryCode}${contact.phone}`);
                    if (contact.email) contactInfo.push(`Email: ${contact.email}`);
                    doc.text(contactInfo.join(' | '), 14, footerY);
                }
                
                const generatedDate = new Date().toLocaleString();
                doc.text(`Generated: ${generatedDate}`, pageWidth - 14, footerY, { align: 'right' });
                
                // Company branding
                doc.setFontSize(8);
                doc.text("Powered by River Poultry & SmartVet", pageWidth / 2, footerY + 8, { align: 'center' });
            } else {
                // Just page number on other pages
                doc.setFontSize(10);
                doc.setTextColor(100, 100, 100);
                doc.text(`Page ${pageNum}`, pageWidth / 2, footerY, { align: 'center' });
            }
        };

        // Helper function to check if new page is needed
        const checkNewPage = (requiredSpace: number) => {
            if (yPosition + requiredSpace > pageHeight - 40) {
                doc.addPage();
                pageNum++;
                addHeader(pageNum);
                yPosition = 35;
            }
        };

        // Helper function to draw table row
        const drawTableRow = (label: string, value: string, isHeader = false) => {
            checkNewPage(15);
            
            if (isHeader) {
                doc.setFillColor(241, 242, 176);
                doc.rect(14, yPosition - 5, pageWidth - 28, 12, 'F');
                doc.setFontSize(12);
                doc.setTextColor(40, 100, 60);
                doc.setFont('helvetica', 'bold');
                doc.text(label, 20, yPosition + 2);
            } else {
                doc.setFontSize(10);
                doc.setTextColor(0, 0, 0);
                doc.setFont('helvetica', 'normal');
                doc.text(label, 20, yPosition + 2);
                doc.text(value, pageWidth - 20, yPosition + 2, { align: 'right' });
            }
            yPosition += 8;
        };

        // Helper function to draw section divider
        const drawSectionDivider = () => {
            yPosition += 5;
            doc.setDrawColor(200, 200, 200);
            doc.setLineWidth(0.5);
            doc.line(14, yPosition, pageWidth - 14, yPosition);
            yPosition += 10;
        };

        // Add header to first page
        addHeader(pageNum);

        // Basic Information Section
        drawTableRow("BASIC INFORMATION", "", true);
        drawTableRow("Bird Type", type.toUpperCase());
        drawTableRow("Arrival Date", arrivalDate);
        drawTableRow("Production Period", type === 'broilers' ? '42 days' : type === 'layers' ? '500 days' : '120 days');
        drawTableRow("Estimated Sale/Stop Date", saleDate);
        drawSectionDivider();

        // Vaccination Schedule Section
        drawTableRow("VACCINATION SCHEDULE", "", true);
        
        data.forEach((vaccine, index) => {
            checkNewPage(20);
            
            // Vaccine header
            doc.setFillColor(240, 240, 240);
            doc.rect(14, yPosition - 3, pageWidth - 28, 10, 'F');
            doc.setFontSize(10);
            doc.setTextColor(0, 0, 0);
            doc.setFont('helvetica', 'bold');
            doc.text(`${index + 1}. ${vaccine.age} - ${vaccine.date || 'TBD'}`, 20, yPosition + 2);
            yPosition += 8;
            
            // Vaccine details
            drawTableRow("Vaccine", vaccine.vaccine);
            drawTableRow("Route", vaccine.route);
            drawTableRow("Notes", vaccine.notes);
            yPosition += 5;
        });

        drawSectionDivider();

        // Technical Summary Section
        drawTableRow("TECHNICAL SUMMARY", "", true);
        drawTableRow("Total Vaccinations", `${data.length} vaccines`);
        drawTableRow("Vaccination Period", `${data[0]?.age || 'Day 1'} to ${data[data.length - 1]?.age || 'Final'}`);
        drawTableRow("Primary Diseases Covered", getPrimaryDiseases(data));
        drawTableRow("Administration Routes", getRoutes(data));
        drawSectionDivider();

        // Important Notes Section
        drawTableRow("IMPORTANT NOTES", "", true);
        drawTableRow("•", "Follow manufacturer's instructions for each vaccine");
        drawTableRow("•", "Maintain proper cold chain storage (2-8°C)");
        drawTableRow("•", "Use clean, sterile equipment for administration");
        drawTableRow("•", "Monitor birds for adverse reactions post-vaccination");
        drawTableRow("•", "Keep vaccination records for traceability");
        drawTableRow("•", "Consult veterinarian for any health concerns");

        // Add footer to all pages
        for (let i = 1; i <= pageNum; i++) {
            doc.setPage(i);
            addFooter(i, i === pageNum);
        }

        // Save the PDF
        doc.save(`Vaccination_${type}_${arrivalDate.replace(/\s+/g, '_')}.pdf`);
    };

    // Helper functions for technical summary
    const getPrimaryDiseases = (data: any[]) => {
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

    const getRoutes = (data: any[]) => {
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
        <Box sx={{ mt: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, color: '#286844', fontWeight: 'bold' }}>
                Download Report
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 2, mb: 2, flexDirection: isMobile ? 'column' : 'row' }}>
                <Box sx={{ display: 'flex', gap: 1, flex: 1 }}>
                    <TextField
                        select
                        label="Country Code"
                        value={contact.countryCode}
                        onChange={e => setContact({ ...contact, countryCode: e.target.value })}
                        size="small"
                        sx={{ minWidth: 140 }}
                    >
                        {COUNTRY_CODES.map((country) => (
                            <MenuItem key={country.code} value={country.code}>
                                {country.name}
                            </MenuItem>
                        ))}
                    </TextField>
                    <TextField
                        label="Phone/WhatsApp"
                        value={contact.phone}
                        onChange={(e) => setContact({ ...contact, phone: e.target.value })}
                        size="small"
                        fullWidth
                        placeholder="e.g., 712345678"
                    />
                </Box>
                <TextField
                    label="Email"
                    value={contact.email}
                    onChange={(e) => setContact({ ...contact, email: e.target.value })}
                    size="small"
                    sx={{ flex: 1 }}
                />
            </Box>
            
            <Button
                variant="contained"
                color="success"
                startIcon={<Download />}
                disabled={!contact.phone && !contact.email}
                sx={{ width: isMobile ? "100%" : "auto" }}
                onClick={generatePdf}
                data-pdf-download
            >
                Download PDF
            </Button>
            
            {(!contact.phone && !contact.email) && (
                <Typography variant="caption" sx={{ display: 'block', mt: 1, color: '#666' }}>
                    Please provide phone or email to download the report
                </Typography>
            )}
        </Box>
    );
};

export default PdfDownloader;
