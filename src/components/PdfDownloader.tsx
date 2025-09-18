import React from "react";
import { Button } from "@mui/material";
import { Download } from "@mui/icons-material";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import logoImg from "../assets/logo.png"; // import from src/assets

interface PdfDownloaderProps {
    data: { age: string; vaccine: string; route: string; notes: string; date?: string }[];
    type: string;
    arrivalDate: string;
    saleDate: string;
}

const PdfDownloader: React.FC<PdfDownloaderProps> = ({ data, type, arrivalDate, saleDate }) => {
    const generatePdf = () => {
        const doc = new jsPDF();

        // Add logo
        doc.addImage(logoImg, "PNG", 10, 5, 40, 20);

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
