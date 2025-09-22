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
                background: "linear-gradient(135deg, #4caf50 0%, #2e7d32 100%)",
                color: "white",
                py: isMobile ? 4 : 8,
                textAlign: "center",
                px: 2,
                boxShadow: "0px 4px 10px rgba(0,0,0,0.2)",
            }}
        >
            {/* Company Logo */}
            <img
                src={logo}
                alt="Company Logo"
                style={{
                    width: isMobile ? 70 : 120,
                    height: "auto",
                    marginBottom: "20px",
                }}
            />

            {/* Main Title */}
            <Typography
                variant={isMobile ? "h4" : "h2"}
                fontWeight="bold"
                gutterBottom
                sx={{ textShadow: "1px 1px 3px rgba(0,0,0,0.3)" }}
            >
                {title}
            </Typography>

            {/* Subtitle */}
            {subtitle && (
                <Typography
                    variant={isMobile ? "h6" : "h5"}
                    sx={{
                        mb: 2,
                        fontWeight: 500,
                        opacity: 0.9,
                    }}
                >
                    {subtitle}
                </Typography>
            )}

            {/* Description */}
            {description && (
                <Typography
                    variant={isMobile ? "body2" : "body1"}
                    sx={{
                        mb: 2,
                        px: isMobile ? 2 : 10,
                        maxWidth: "900px",
                        margin: "0 auto",
                        lineHeight: 1.6,
                    }}
                >
                    {description}
                </Typography>
            )}

            {/* Note */}
            {note && (
                <Typography
                    variant={isMobile ? "body2" : "body1"}
                    sx={{
                        px: isMobile ? 2 : 10,
                        maxWidth: "900px",
                        margin: "0 auto",
                        lineHeight: 1.6,
                        fontStyle: "italic",
                        opacity: 0.85,
                    }}
                >
                    {note}
                </Typography>
            )}
        </Box>
    );
};

export default HeroSection;
