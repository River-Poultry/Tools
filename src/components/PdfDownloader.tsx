import React from "react";
import { Button } from "@mui/material";
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
    const generatePdf = () => {
        const doc = new jsPDF();

        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();

        // Add watermark logo (centered, light opacity)
        doc.setGState(new (doc as any).GState({ opacity: 0.1 })); // set transparency
        const watermarkWidth = 100;
        const watermarkHeight = 50;
        doc.addImage(
            logoImg,
            "PNG",
            (pageWidth - watermarkWidth) / 2,
            (pageHeight - watermarkHeight) / 2,
            watermarkWidth,
            watermarkHeight
        );
        doc.setGState(new (doc as any).GState({ opacity: 1 })); // reset opacity

        // Add title and info
        doc.setFontSize(16);
        doc.text("Vaccination Schedule", 70, 20);
        doc.setFontSize(12);
        doc.text(`Chicken Type: ${type.toUpperCase()}`, 70, 28);
        doc.text(`Arrival Date: ${arrivalDate}`, 70, 34);
        doc.text(`Estimated Sale/Stop Date: ${saleDate}`, 70, 40);

        // Add table using autoTable
        autoTable(doc, {
            startY: 50,
            head: [["Age/Time", "Vaccine", "Route", "Notes", "Date"]],
            body: data.map((v) => [v.age, v.vaccine, v.route, v.notes, v.date || ""]),
            didDrawPage: (data) => {
                // Footer
                doc.setFontSize(10);
                doc.setTextColor(150);
                const footerText = "Powered by RiverPoultry and SmartVet";
                doc.text(footerText, pageWidth / 2, pageHeight - 10, { align: "center" });
            },
        });

        doc.save(`Vaccination_${type}_${arrivalDate}.pdf`);
    };

    return (
        <Button
            variant="contained"
            color="success"
            startIcon={<Download />}
            sx={{ mt: 2 }}
            onClick={generatePdf}
        >
            Download PDF
        </Button>
    );
};

export default PdfDownloader;
