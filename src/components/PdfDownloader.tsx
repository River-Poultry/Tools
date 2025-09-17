import React from "react";
import { Button } from "@mui/material";
import { Download } from "@mui/icons-material";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import logoImg from "../assets/logo.png"; // import from src/assets

interface PdfDownloaderProps {
    data: { age: string; vaccine: string; route: string; notes: string }[];
    type: string;
    age: string;
}

const PdfDownloader: React.FC<PdfDownloaderProps> = ({ data, type, age }) => {
    const generatePdf = () => {
        const doc = new jsPDF();

        // Add logo directly
        doc.addImage(logoImg, "PNG", 10, 5, 40, 20);

        doc.setFontSize(16);
        doc.text("Vaccination Schedule", 70, 20);
        doc.setFontSize(12);
        doc.text(`Chicken Type: ${type.toUpperCase()} | Age: ${age}`, 70, 28);

        // Table
        autoTable(doc, {
            startY: 40,
            head: [["Age/Time", "Vaccine", "Route", "Notes"]],
            body: data.map((v) => [v.age, v.vaccine, v.route, v.notes]),
        });

        doc.save(`Vaccination_${type}_${age}.pdf`);
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
