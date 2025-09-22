import React from "react";
import { Button, useMediaQuery, useTheme } from "@mui/material";
import { Download } from "@mui/icons-material";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import logoImg from "../assets/logo.png";

interface PdfDownloaderProps {
    data: { age: string; vaccine: string; route: string; notes: string; date?: string }[];
    type: string;
    arrivalDate: string;
    saleDate: string;
}

const PdfDownloader: React.FC<PdfDownloaderProps> = ({ data, type, arrivalDate, saleDate }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

    const generatePdf = () => {
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();

        // --- Watermark Logo ---
        const img = new Image();
        img.src = logoImg;
        doc.addImage(
            img,
            "PNG",
            (pageWidth - 80) / 2,
            (pageHeight - 80) / 2,
            80,
            80,
            undefined,
            "FAST"
        );

        // --- Header Title ---
        doc.setFontSize(18);
        doc.setTextColor(40, 100, 60);
        doc.text("Vaccination Planner Report", pageWidth / 2, 20, { align: "center" });

        // --- Info Section ---
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
        doc.text(`Chicken Type: ${type.toUpperCase()}`, 14, 35);
        doc.text(`Arrival Date: ${arrivalDate}`, 14, 42);
        doc.text(`Estimated Sale/Stop Date: ${saleDate}`, 14, 49);

        // --- Vaccination Table ---
        autoTable(doc, {
            startY: 60,
            head: [["Age/Time", "Vaccine", "Route", "Notes", "Date"]],
            body: data.map((v) => [v.age, v.vaccine, v.route, v.notes, v.date || ""]),
            styles: { fontSize: 10, cellPadding: 3 },
            headStyles: { fillColor: [99, 143, 101], textColor: 255, halign: "center" },
            bodyStyles: { valign: "middle" },
            didDrawPage: () => {
                // --- Footer ---
                doc.setFontSize(10);
                doc.setTextColor(100);
                const footerText = "Powered by RiverPoultry and SmartVet";
                doc.text(footerText, pageWidth / 2, pageHeight - 10, { align: "center" });
            },
        });

        // --- Save File ---
        doc.save(`Vaccination_${type}_${arrivalDate}.pdf`);
    };

    return (
        <Button
            variant="contained"
            color="success"
            startIcon={<Download />}
            sx={{ mt: 2, width: isMobile ? "100%" : "auto" }}
            onClick={generatePdf}
        >
            Download PDF
        </Button>
    );
};

export default PdfDownloader;
