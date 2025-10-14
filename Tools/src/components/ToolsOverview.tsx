import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Container,
  Stack,
} from "@mui/material";
import {
  LocalHospital,
  Straighten,
  Calculate,
  ArrowForward,
  TrendingUp,
  BarChart,
  CalendarToday,
} from "@mui/icons-material";
import HeroSection from "./HeroSection";
import { analyticsService, DashboardMetrics } from "../services/analyticsService";

interface Tool {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  path: string;
  color: string;
  features: string[];
  popular?: boolean;
}

const ToolsOverview: React.FC = () => {
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState<DashboardMetrics | null>(null);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      const data = await analyticsService.getDashboardMetrics();
      setAnalytics(data);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    }
  };

  const tools: Tool[] = [
    {
      id: "vaccination",
      title: "Vaccination Scheduler",
      description: "Professional vaccination planning for all poultry types with automated scheduling and health management protocols.",
      icon: <LocalHospital sx={{ fontSize: 32 }} />,
      path: "/vaccination",
      color: "#2E7D32",
      features: ["Multi-poultry type support", "Calendar integration", "Reminder system", "PDF export"],
      popular: true,
    },
    {
      id: "measurement",
      title: "Room Measurement",
      description: "Advanced facility design and capacity planning tools for optimal poultry housing and space utilization.",
      icon: <Straighten sx={{ fontSize: 32 }} />,
      path: "/measurement",
      color: "#4CAF50",
      features: ["Capacity calculations", "Dimension planning", "Space optimization", "Professional reports"],
    },
    {
      id: "budget",
      title: "Budget Calculator",
      description: "Comprehensive financial planning and analysis tools for sustainable poultry farming operations and profitability.",
      icon: <Calculate sx={{ fontSize: 32 }} />,
      path: "/budget-calculator",
      color: "#4CAF50",
      features: ["Cost analysis", "Profit projections", "Budget planning", "Financial reports"],
    },
  ];

  const stats = [
    { 
      label: "Total Sessions", 
      value: analytics ? `${analytics.totalSessions.toLocaleString()}+` : "Loading...", 
      icon: <TrendingUp /> 
    },
    { 
      label: "Tool Usage", 
      value: analytics ? `${(analytics.toolUsage.vaccination + analytics.toolUsage.roomMeasurement + analytics.toolUsage.budgetCalculator).toLocaleString()}+` : "Loading...", 
      icon: <BarChart /> 
    },
    { 
      label: "Vaccination Plans", 
      value: analytics ? `${analytics.toolUsage.vaccination.toLocaleString()}+` : "Loading...", 
      icon: <CalendarToday /> 
    },
  ];

  return (
    <Box sx={{ bgcolor: "#FFFFFF", minHeight: "100vh" }}>
      {/* Hero Section */}
      <HeroSection
        title="Farm Management Solutions"
        subtitle="Empowering poultry farmers with professional tools and expertise"
        description="Comprehensive solutions for vaccination planning, facility design, and financial management. Trusted by farmers across Africa for sustainable poultry operations."
      />

      <Container maxWidth="xl" sx={{ py: 3 }}>
        {/* Stats Section */}
        <Box sx={{ mb: 6, textAlign: "center", bgcolor: "#F5F5F5", py: 4, borderRadius: 2, border: "1px solid #E9ECEF" }}>
          <Typography variant="h6" fontWeight="bold" sx={{ mb: 4, color: "#2E7D32" }}>
            Trusted by Poultry Farmers across Africa
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3, justifyContent: "center" }}>
            {stats.map((stat, index) => (
              <Box key={index} sx={{ flex: "1 1 300px", maxWidth: 300, textAlign: "center" }}>
                <Box
                  sx={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 60,
                    height: 60,
                    borderRadius: "50%",
                    bgcolor: "#2E7D32",
                    color: "white",
                    mb: 1.5,
                  }}
                >
                  {stat.icon}
                </Box>
                <Typography variant="h5" fontWeight="bold" color="#2E7D32">
                  {stat.value}
                </Typography>
                <Typography variant="body1" sx={{ color: "#6C757D" }}>
                  {stat.label}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>

        {/* Tools Section */}
        <Box sx={{ mb: 6 }}>
          <Typography variant="h6" fontWeight="bold" sx={{ mb: 2, textAlign: "center", color: "#2E7D32" }}>
            Comprehensive Farm Management Solutions
          </Typography>
          <Typography variant="body1" sx={{ mb: 4, textAlign: "center", color: "#6C757D", maxWidth: 600, mx: "auto" }}>
            Professional-grade tools developed by poultry experts to enhance productivity, health management, and profitability.
          </Typography>

          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3, justifyContent: "center" }}>
            {tools.map((tool) => (
              <Box key={tool.id} sx={{ flex: "1 1 350px", maxWidth: 350 }}>
                <Card
                  sx={{
                    height: "100%",
                    borderRadius: 2,
                    boxShadow: tool.popular ? "0 4px 16px rgba(46, 125, 50, 0.15)" : "0 2px 8px rgba(0,0,0,0.08)",
                    border: tool.popular ? "2px solid #2E7D32" : "1px solid #E9ECEF",
                    transition: "all 0.2s ease",
                    position: "relative",
                    maxWidth: 350,
                    mx: "auto",
                    "&:hover": {
                      transform: "translateY(-4px)",
                      boxShadow: "0 6px 20px rgba(46, 125, 50, 0.2)",
                      border: tool.popular ? "2px solid #1E7E34" : "1px solid #D1D5DB",
                    },
                  }}
                >
                  {tool.popular && (
                    <Box
                      sx={{
                        position: "absolute",
                        top: -8,
                        right: 16,
                        bgcolor: "#FF8C00",
                        color: "white",
                        px: 1.5,
                        py: 0.3,
                        borderRadius: 1.5,
                        fontSize: "0.7rem",
                        fontWeight: "bold",
                      }}
                    >
                      Most Popular
                    </Box>
                  )}
                  
                  <CardContent sx={{ p: 2.5, height: "100%", display: "flex", flexDirection: "column" }}>
                    <Box sx={{ textAlign: "center", mb: 2 }}>
                      <Box
                        sx={{
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          width: 60,
                          height: 60,
                          borderRadius: "50%",
                          bgcolor: `${tool.color}10`,
                          color: tool.color,
                          mb: 1.5,
                        }}
                      >
                        {tool.icon}
                      </Box>
                      <Typography variant="h6" fontWeight="bold" sx={{ mb: 1, color: "#2E7D32", fontSize: "1rem" }}>
                        {tool.title}
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 2, fontSize: "0.85rem", lineHeight: 1.4, color: "#6C757D" }}>
                        {tool.description}
                      </Typography>
                    </Box>

                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1, color: "#2E7D32", fontSize: "0.8rem" }}>
                        Key Features:
                      </Typography>
                      <Stack spacing={0.5} sx={{ mb: 2 }}>
                        {tool.features.map((feature, index) => (
                          <Box key={index} sx={{ display: "flex", alignItems: "center" }}>
                            <Box
                              sx={{
                                width: 4,
                                height: 4,
                                borderRadius: "50%",
                                bgcolor: tool.color,
                                mr: 1,
                              }}
                            />
                            <Typography variant="body2" sx={{ fontSize: "0.75rem", color: "#8E8E93" }}>
                              {feature}
                            </Typography>
                          </Box>
                        ))}
                      </Stack>
                    </Box>

                    <Button
                      variant="contained"
                      size="small"
                      endIcon={<ArrowForward sx={{ fontSize: "1rem" }} />}
                      onClick={() => navigate(tool.path)}
                      sx={{
                        bgcolor: tool.color,
                        color: "white",
                        py: 1,
                        borderRadius: 1.5,
                        textTransform: "none",
                        fontSize: "0.85rem",
                        fontWeight: "bold",
                        "&:hover": {
                          bgcolor: tool.color === "#2E7D32" ? "#1E7E34" : tool.color === "#4CAF50" ? "#388E3C" : tool.color,
                          filter: "brightness(0.9)",
                        },
                      }}
                    >
                      Use Tool
                    </Button>
                  </CardContent>
                </Card>
              </Box>
            ))}
          </Box>
        </Box>

        {/* Simple Call to Action */}
        <Box
          sx={{
            bgcolor: "#2E7D32",
            borderRadius: 3,
            p: 4,
            textAlign: "center",
            color: "white",
            background: "linear-gradient(135deg, #2E7D32 0%, #4CAF50 100%)",
          }}
        >
          <Typography variant="h5" fontWeight="bold" sx={{ mb: 3 }}>
            🎯 Why Keep Struggling When Success is Within Reach?
          </Typography>
          <Typography variant="body1" sx={{ mb: 4, fontSize: "1.1rem", lineHeight: 1.6 }}>
            <strong>Still not sure what you spent to run your farm?</strong> Join thousands of successful farmers who've transformed their operations with our proven tools.
          </Typography>
          {/* Poultry Manager Button - Commented out for now */}
          {/* <Button
            variant="contained"
            size="large"
            href="https://manager.riverpoultry.com/"
            target="_blank"
            rel="noopener noreferrer"
            sx={{
              bgcolor: "white",
              color: "#2E7D32",
              px: 6,
              py: 2,
              borderRadius: 2,
              textTransform: "none",
              fontSize: "1.2rem",
              fontWeight: "bold",
              "&:hover": {
                bgcolor: "rgba(255,255,255,0.95)",
                transform: "translateY(-2px)",
                boxShadow: "0 6px 20px rgba(0,0,0,0.2)",
              },
            }}
          >
            Try Poultry Manager
          </Button> */}
          
          <Button
            variant="contained"
            size="medium"
            href="https://manager.riverpoultry.com/"
            target="_blank"
            rel="noopener noreferrer"
            sx={{
              bgcolor: "#fff3e0",
              color: "#2E7D32",
              px: 4,
              py: 1.5,
              borderRadius: 2,
              textTransform: "none",
              fontSize: "1rem",
              fontWeight: "bold",
              boxShadow: "0 4px 16px rgba(0,0,0,0.2)",
              border: "2px solid rgba(255,255,255,0.3)",
              position: "relative",
              zIndex: 1,
              "&:hover": {
                bgcolor: "#ffffff",
                transform: "translateY(-2px)",
                boxShadow: "0 6px 20px rgba(0,0,0,0.3)",
                border: "2px solid rgba(255,255,255,0.5)",
              },
              "&::before": {
                content: '""',
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: "linear-gradient(45deg, rgba(255,255,255,0.1) 0%, transparent 50%, rgba(255,255,255,0.1) 100%)",
                borderRadius: 2,
                zIndex: -1,
              }
            }}
          >
            🚀 Try Poultry Manager Now
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

export default ToolsOverview;
