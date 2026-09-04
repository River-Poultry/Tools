import React, { useState, useMemo } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  InputAdornment,
  Container,
  Paper,
} from "@mui/material";
import {
  CheckCircle,
  Warning,
  Error as ErrorIcon,
} from "@mui/icons-material";
import HeroSection from "./HeroSection";

const FlockBreakeven: React.FC = () => {
  const [chicks, setChicks] = useState<number | "">(500);
  const [chickCost, setChickCost] = useState<number | "">(4500);
  const [feedKg, setFeedKg] = useState<number | "">(4.2);
  const [feedPrice, setFeedPrice] = useState<number | "">(2800);
  const [vaccine, setVaccine] = useState<number | "">(800);
  const [other, setOther] = useState<number | "">(1200);
  const [mortality, setMortality] = useState<number | "">(5);
  const [weight, setWeight] = useState<number | "">(1.8);
  const [price, setPrice] = useState<number | "">(12500);
  const [currency] = useState<string>("UGX");

  const results = useMemo(() => {
    const c = Number(chicks) || 0;
    const cc = Number(chickCost) || 0;
    const fkg = Number(feedKg) || 0;
    const fp = Number(feedPrice) || 0;
    const vac = Number(vaccine) || 0;
    const oth = Number(other) || 0;
    const mort = Math.min(100, Math.max(0, Number(mortality) || 0));
    const w = Number(weight) || 0;
    const p = Number(price) || 0;

    const survivors = c * (1 - mort / 100);
    const totalChick = c * cc;
    const totalFeed = c * fkg * fp;
    const totalVaccine = c * vac;
    const totalOther = c * oth;
    const totalCost = totalChick + totalFeed + totalVaccine + totalOther;
    const revenue = survivors * w * p;
    const profit = revenue - totalCost;
    const costPerBird = survivors > 0 ? totalCost / survivors : 0;
    const profitPerBird = survivors > 0 ? profit / survivors : 0;
    const margin = revenue > 0 ? (profit / revenue) * 100 : 0;
    const breakeven = survivors > 0 && w > 0 ? totalCost / (survivors * w) : 0;

    return {
      survivors,
      totalChick,
      totalFeed,
      totalVaccine,
      totalOther,
      totalCost,
      revenue,
      profit,
      costPerBird,
      profitPerBird,
      margin,
      breakeven,
    };
  }, [chicks, chickCost, feedKg, feedPrice, vaccine, other, mortality, weight, price]);

  const fmt = (n: number) =>
    isFinite(n) ? `${currency} ${Math.round(n).toLocaleString()}` : "—";

  return (
    <Box sx={{ bgcolor: "#F8FAF8", minHeight: "100vh", pb: 8 }}>
      <HeroSection
        title="Flock Cost & Breakeven Calculator"
        subtitle="Precision Meat Bird & Broiler Financial Modeling"
        description="Quickly estimate rearing costs, mortality impacts, margins, and market breakeven live-weight pricing for broiler batches."
      />

      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1.1fr 0.9fr" }, gap: 4 }}>
          {/* Inputs */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <Card sx={{ borderRadius: 3, boxShadow: "0 4px 20px rgba(0,0,0,0.06)" }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight="bold" sx={{ color: "#1B5E20", mb: 2 }}>
                  1. Batch & Rearing Costs
                </Typography>
                <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2.5 }}>
                  <TextField
                    label="Day-old Chicks Placed"
                    type="number"
                    value={chicks}
                    onChange={(e) => setChicks(e.target.value === "" ? "" : Number(e.target.value))}
                    InputProps={{ endAdornment: <InputAdornment position="end">birds</InputAdornment> }}
                    fullWidth
                  />
                  <TextField
                    label="Cost per Chick"
                    type="number"
                    value={chickCost}
                    onChange={(e) => setChickCost(e.target.value === "" ? "" : Number(e.target.value))}
                    InputProps={{ endAdornment: <InputAdornment position="end">{currency}</InputAdornment> }}
                    fullWidth
                  />
                  <TextField
                    label="Feed per Bird to Market"
                    type="number"
                    value={feedKg}
                    onChange={(e) => setFeedKg(e.target.value === "" ? "" : Number(e.target.value))}
                    InputProps={{ endAdornment: <InputAdornment position="end">kg</InputAdornment> }}
                    helperText="Total intake across cycle"
                    fullWidth
                  />
                  <TextField
                    label="Feed Price per kg"
                    type="number"
                    value={feedPrice}
                    onChange={(e) => setFeedPrice(e.target.value === "" ? "" : Number(e.target.value))}
                    InputProps={{ endAdornment: <InputAdornment position="end">{currency}/kg</InputAdornment> }}
                    fullWidth
                  />
                  <TextField
                    label="Vaccines & Medication / Bird"
                    type="number"
                    value={vaccine}
                    onChange={(e) => setVaccine(e.target.value === "" ? "" : Number(e.target.value))}
                    InputProps={{ endAdornment: <InputAdornment position="end">{currency}</InputAdornment> }}
                    fullWidth
                  />
                  <TextField
                    label="Labour, Bedding & Overhead / Bird"
                    type="number"
                    value={other}
                    onChange={(e) => setOther(e.target.value === "" ? "" : Number(e.target.value))}
                    InputProps={{ endAdornment: <InputAdornment position="end">{currency}</InputAdornment> }}
                    fullWidth
                  />
                </Box>
              </CardContent>
            </Card>

            <Card sx={{ borderRadius: 3, boxShadow: "0 4px 20px rgba(0,0,0,0.06)" }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight="bold" sx={{ color: "#1B5E20", mb: 2 }}>
                  2. Mortality & Sales Assumptions
                </Typography>
                <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2.5 }}>
                  <TextField
                    label="Expected Mortality"
                    type="number"
                    value={mortality}
                    onChange={(e) => setMortality(e.target.value === "" ? "" : Number(e.target.value))}
                    InputProps={{ endAdornment: <InputAdornment position="end">%</InputAdornment> }}
                    helperText="Typically 3-7% for good management"
                    fullWidth
                  />
                  <TextField
                    label="Average Weight at Sale"
                    type="number"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value === "" ? "" : Number(e.target.value))}
                    InputProps={{ endAdornment: <InputAdornment position="end">kg</InputAdornment> }}
                    fullWidth
                  />
                  <TextField
                    label="Selling Price per kg"
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value === "" ? "" : Number(e.target.value))}
                    InputProps={{ endAdornment: <InputAdornment position="end">{currency}/kg</InputAdornment> }}
                    helperText="Live weight farm-gate price"
                    fullWidth
                    sx={{ gridColumn: { xs: "1", sm: "span 2" } }}
                  />
                </Box>
              </CardContent>
            </Card>
          </Box>

          {/* Results Sticky Pane */}
          <Box>
            <Card sx={{ position: "sticky", top: 80, borderRadius: 3, boxShadow: "0 6px 24px rgba(0,0,0,0.08)", border: "1px solid #E2E8F0" }}>
              <CardContent sx={{ p: 3.5 }}>
                <Typography variant="h6" fontWeight="bold" sx={{ color: "#1B5E20", mb: 2 }}>
                  Financial Summary
                </Typography>

                {/* Status Badge */}
                <Box sx={{ mb: 2.5 }}>
                  {results.profit > 0 ? (
                    results.margin >= 15 ? (
                      <Box sx={{ display: "inline-flex", alignItems: "center", gap: 1, bgcolor: "#E8F5E9", color: "#2E7D32", px: 2, py: 0.8, borderRadius: 999, fontWeight: "bold", fontSize: "0.875rem" }}>
                        <CheckCircle sx={{ fontSize: 18 }} /> High-Performing Batch ({results.margin.toFixed(1)}% Margin)
                      </Box>
                    ) : (
                      <Box sx={{ display: "inline-flex", alignItems: "center", gap: 1, bgcolor: "#FFF8E1", color: "#F57F17", px: 2, py: 0.8, borderRadius: 999, fontWeight: "bold", fontSize: "0.875rem" }}>
                        <Warning sx={{ fontSize: 18 }} /> Profitable with Thin Margin ({results.margin.toFixed(1)}%)
                      </Box>
                    )
                  ) : (
                    <Box sx={{ display: "inline-flex", alignItems: "center", gap: 1, bgcolor: "#FFEBEE", color: "#C62828", px: 2, py: 0.8, borderRadius: 999, fontWeight: "bold", fontSize: "0.875rem" }}>
                      <ErrorIcon sx={{ fontSize: 18 }} /> Loss-Making at Current Prices
                    </Box>
                  )}
                </Box>

                {/* KPI Grid */}
                <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2, mb: 3 }}>
                  <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                    <Typography variant="caption" sx={{ color: "#64748B", textTransform: "uppercase", fontWeight: 600 }}>
                      Birds Sold
                    </Typography>
                    <Typography variant="h6" fontWeight="bold" sx={{ mt: 0.5, color: "#1E293B" }}>
                      {Math.round(results.survivors).toLocaleString()}
                    </Typography>
                    <Typography variant="caption" sx={{ color: "#94A3B8" }}>
                      of {Number(chicks).toLocaleString()} placed
                    </Typography>
                  </Paper>

                  <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                    <Typography variant="caption" sx={{ color: "#64748B", textTransform: "uppercase", fontWeight: 600 }}>
                      Cost / Bird Sold
                    </Typography>
                    <Typography variant="h6" fontWeight="bold" sx={{ mt: 0.5, color: "#1E293B" }}>
                      {fmt(results.costPerBird)}
                    </Typography>
                  </Paper>

                  <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, gridColumn: "span 2", bgcolor: results.profit >= 0 ? "#F0FDF4" : "#FEF2F2", borderColor: results.profit >= 0 ? "#BBF7D0" : "#FECACA" }}>
                    <Typography variant="caption" sx={{ color: results.profit >= 0 ? "#166534" : "#991B1B", textTransform: "uppercase", fontWeight: 600 }}>
                      Total Batch Net Profit
                    </Typography>
                    <Typography variant="h4" fontWeight="bold" sx={{ mt: 0.5, color: results.profit >= 0 ? "#15803D" : "#DC2626" }}>
                      {fmt(results.profit)}
                    </Typography>
                  </Paper>

                  <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                    <Typography variant="caption" sx={{ color: "#64748B", textTransform: "uppercase", fontWeight: 600 }}>
                      Profit / Bird Sold
                    </Typography>
                    <Typography variant="h6" fontWeight="bold" sx={{ mt: 0.5, color: "#1E293B" }}>
                      {fmt(results.profitPerBird)}
                    </Typography>
                  </Paper>

                  <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                    <Typography variant="caption" sx={{ color: "#64748B", textTransform: "uppercase", fontWeight: 600 }}>
                      Net Margin
                    </Typography>
                    <Typography variant="h6" fontWeight="bold" sx={{ mt: 0.5, color: "#1E293B" }}>
                      {results.margin.toFixed(1)}%
                    </Typography>
                  </Paper>

                  <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, gridColumn: "span 2", bgcolor: "#F8FAFC" }}>
                    <Typography variant="caption" sx={{ color: "#475569", textTransform: "uppercase", fontWeight: 600 }}>
                      Breakeven Selling Price
                    </Typography>
                    <Typography variant="h6" fontWeight="bold" sx={{ mt: 0.5, color: "#0F172A" }}>
                      {fmt(results.breakeven)} / kg
                    </Typography>
                    <Typography variant="caption" sx={{ color: "#64748B" }}>
                      Minimum price needed to cover all production costs
                    </Typography>
                  </Paper>
                </Box>

                {/* Cost Breakdown Progress */}
                <Typography variant="subtitle2" fontWeight="bold" sx={{ color: "#334155", mb: 1 }}>
                  Cost Structure Breakdown
                </Typography>
                <Box sx={{ width: "100%", height: 16, borderRadius: 1, bgcolor: "#E2E8F0", overflow: "hidden", display: "flex", mb: 2 }}>
                  {results.totalCost > 0 && (
                    <>
                      <Box sx={{ width: `${(results.totalChick / results.totalCost) * 100}%`, bgcolor: "#15803D" }} title="Chicks" />
                      <Box sx={{ width: `${(results.totalFeed / results.totalCost) * 100}%`, bgcolor: "#22C55E" }} title="Feed" />
                      <Box sx={{ width: `${(results.totalVaccine / results.totalCost) * 100}%`, bgcolor: "#3B82F6" }} title="Vaccines" />
                      <Box sx={{ width: `${(results.totalOther / results.totalCost) * 100}%`, bgcolor: "#94A3B8" }} title="Overhead" />
                    </>
                  )}
                </Box>

                <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5, fontSize: "0.8rem", color: "#64748B" }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                    <span><Box component="span" sx={{ display: "inline-block", width: 8, height: 8, bgcolor: "#15803D", borderRadius: "50%", mr: 1 }} />Chicks:</span>
                    <strong>{fmt(results.totalChick)} ({results.totalCost > 0 ? ((results.totalChick / results.totalCost) * 100).toFixed(0) : 0}%)</strong>
                  </Box>
                  <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                    <span><Box component="span" sx={{ display: "inline-block", width: 8, height: 8, bgcolor: "#22C55E", borderRadius: "50%", mr: 1 }} />Feed:</span>
                    <strong>{fmt(results.totalFeed)} ({results.totalCost > 0 ? ((results.totalFeed / results.totalCost) * 100).toFixed(0) : 0}%)</strong>
                  </Box>
                  <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                    <span><Box component="span" sx={{ display: "inline-block", width: 8, height: 8, bgcolor: "#3B82F6", borderRadius: "50%", mr: 1 }} />Vaccines & Meds:</span>
                    <strong>{fmt(results.totalVaccine)} ({results.totalCost > 0 ? ((results.totalVaccine / results.totalCost) * 100).toFixed(0) : 0}%)</strong>
                  </Box>
                  <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                    <span><Box component="span" sx={{ display: "inline-block", width: 8, height: 8, bgcolor: "#94A3B8", borderRadius: "50%", mr: 1 }} />Labour & Other:</span>
                    <strong>{fmt(results.totalOther)} ({results.totalCost > 0 ? ((results.totalOther / results.totalCost) * 100).toFixed(0) : 0}%)</strong>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default FlockBreakeven;
