import React from "react";
import { Box, Typography, useMediaQuery, useTheme } from "@mui/material";
import logo from "../assets/logo.png";

interface HeroSectionProps {
    title: string;
    subtitle?: string;
    description?: string;
    note?: string;
}

const HeroSection: React.FC<HeroSectionProps> = ({
    title,
    subtitle,
    description,
    note,
}) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

    return (
        <Box
            sx={{
                bgcolor: "#638f65ff",
                color: "white",
                py: isMobile ? 3 : 6,
                textAlign: "center",
                px: 2,
            }}
        >
            <img
                src={logo}
                alt="Company Logo"
                style={{
                    width: isMobile ? 70 : 110,
                    height: "auto",
                    marginBottom: "15px",
                }}
            />
            <Typography
                variant={isMobile ? "h4" : "h3"}
                fontWeight="bold"
                gutterBottom
            >
                {title}
            </Typography>
            {subtitle && (
                <Typography
                    variant={isMobile ? "body1" : "h6"}
                    sx={{ mb: 1, fontSize: "1.2rem" }}
                >
                    {subtitle}
                </Typography>
            )}
            {description && (
                <Typography
                    variant={isMobile ? "body2" : "body1"}
                    sx={{ mb: 1, px: isMobile ? 1 : 8, fontSize: "1.05rem" }}
                >
                    {description}
                </Typography>
            )}
            {note && (
                <Typography
                    variant={isMobile ? "body2" : "body1"}
                    sx={{ px: isMobile ? 1 : 8, fontSize: "1.05rem" }}
                >
                    {note}
                </Typography>
            )}
        </Box>
    );
};

export default HeroSection;
