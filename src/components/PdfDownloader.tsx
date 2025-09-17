import React from "react";
import { Button } from "@mui/material";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

type VaccineEntry = {
    age: string;
    vaccine: string;
    route: string;
    notes: string;
};

interface PdfDownloaderProps {
    data: VaccineEntry[];
    type: string;
    age: string;
}

const PdfDownloader: React.FC<PdfDownloaderProps> = ({ data, type, age }) => {
    const handleDownload = () => {
        const doc = new jsPDF();

        doc.setFontSize(16);
        doc.text("🐔 Vaccination Planner Report", 14, 20);
        doc.setFontSize(12);
        doc.text(`Chicken Type: ${type}`, 14, 30);
        doc.text(`Selected Age: ${age}`, 14, 38);

        autoTable(doc, {
            startY: 45,
            head: [["Age/Time", "Vaccine", "Route", "Notes"]],
            body: data.map((v) => [v.age, v.vaccine, v.route, v.notes]),
        });

        doc.save(`Vaccination_${type}_${age}.pdf`);
    };

    return (
        <Button
            variant="contained"
            color="secondary"
            onClick={handleDownload}
            sx={{ mt: 2 }}
        >
            📄 Download PDF
        </Button>
    );
};

export default PdfDownloader;
