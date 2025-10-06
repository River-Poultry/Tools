import React from "react";
import { Box, Typography, useMediaQuery, useTheme } from "@mui/material";

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
                background: "linear-gradient(135deg, #1B5E20 0%, #2E7D32 100%)",
                transition: "all 0.3s ease-in-out",
                color: "white",
                py: isMobile ? 6 : 8,
                textAlign: "center",
                px: 2,
                boxShadow: "0px 8px 32px rgba(46, 125, 50, 0.3)",
                position: "relative",
                overflow: "hidden",
                "&::before": {
                    content: '""',
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: "url('data:image/svg+xml,<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 100 100\"><defs><pattern id=\"grain\" width=\"100\" height=\"100\" patternUnits=\"userSpaceOnUse\"><circle cx=\"25\" cy=\"25\" r=\"1\" fill=\"rgba(255,255,255,0.1)\"/><circle cx=\"75\" cy=\"75\" r=\"1\" fill=\"rgba(255,255,255,0.1)\"/><circle cx=\"50\" cy=\"10\" r=\"0.5\" fill=\"rgba(255,255,255,0.05)\"/><circle cx=\"10\" cy=\"60\" r=\"0.5\" fill=\"rgba(255,255,255,0.05)\"/><circle cx=\"90\" cy=\"40\" r=\"0.5\" fill=\"rgba(255,255,255,0.05)\"/></pattern></defs><rect width=\"100\" height=\"100\" fill=\"url(%23grain)\"/></svg>')",
                    opacity: 0.3,
                },
            }}
        >
            {/* Main Title */}
            <Typography
                variant={isMobile ? "h6" : "h5"}
                fontWeight="bold"
                gutterBottom
                sx={{ textShadow: "1px 1px 3px rgba(0,0,0,0.3)" }}
            >
                {title}
            </Typography>

            {/* Subtitle */}
            {subtitle && (
                <Typography
                    variant={isMobile ? "body2" : "body1"}
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
