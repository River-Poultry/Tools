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

const LoanCalculator: React.FC = () => {
  const [loanAmount, setLoanAmount] = useState<number | "">(15000000);
  const [interestRate, setInterestRate] = useState<number | "">(22);
  const [termMonths, setTermMonths] = useState<number | "">(24);
  const [extraRevenue, setExtraRevenue] = useState<number | "">(2200000);
  const [extraOpCost, setExtraOpCost] = useState<number | "">(900000);
  const [currency] = useState<string>("UGX");

  const results = useMemo(() => {
    const P = Number(loanAmount) || 0;
    const rate = Number(interestRate) || 0;
    const n = Number(termMonths) || 0;
    const rev = Number(extraRevenue) || 0;
    const op = Number(extraOpCost) || 0;

    const r = (rate / 100) / 12;
    let payment = 0;
    if (n <= 0) {
      payment = 0;
    } else if (r === 0) {
      payment = P / n;
    } else {
      payment = (P * r) / (1 - Math.pow(1 + r, -n));
    }

    const totalRepay = payment * n;
    const totalInterest = Math.max(0, totalRepay - P);
    const netBeforeLoan = rev - op;
    const netAfterLoan = netBeforeLoan - payment;
    const payback = netBeforeLoan > 0 ? P / netBeforeLoan : NaN;
    const netReturnOverTerm = (netBeforeLoan * n) - totalInterest;
    const roiPct = P > 0 ? (netReturnOverTerm / P) * 100 : 0;

    return {
      P,
      n,
      payment,
      totalRepay,
      totalInterest,
      netBeforeLoan,
      netAfterLoan,
      payback,
      netReturnOverTerm,
      roiPct,
    };
  }, [loanAmount, interestRate, termMonths, extraRevenue, extraOpCost]);

  const fmt = (val: number) =>
    isFinite(val) ? `${currency} ${Math.round(val).toLocaleString()}` : "—";

  return (
    <Box sx={{ bgcolor: "#F8FAF8", minHeight: "100vh", pb: 8 }}>
      <HeroSection
        title="Loan & Investment ROI Calculator"
        subtitle="Poultry Expansion & Capital Equipment Financing"
        description="Simulate commercial bank and MFI financing on a reducing balance, model debt service coverage, and evaluate investment payback."
      />

      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1.1fr 0.9fr" }, gap: 4 }}>
          {/* Inputs Column */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <Card sx={{ borderRadius: 3, boxShadow: "0 4px 20px rgba(0,0,0,0.06)" }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight="bold" sx={{ color: "#1B5E20", mb: 2 }}>
                  1. Loan Terms & Financing
                </Typography>
                <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2.5 }}>
                  <TextField
                    label="Loan Principal Amount"
                    type="number"
                    value={loanAmount}
                    onChange={(e) => setLoanAmount(e.target.value === "" ? "" : Number(e.target.value))}
                    InputProps={{ endAdornment: <InputAdornment position="end">{currency}</InputAdornment> }}
                    fullWidth
                    sx={{ gridColumn: { xs: "1", sm: "span 2" } }}
                  />
                  <TextField
                    label="Annual Interest Rate"
                    type="number"
                    value={interestRate}
                    onChange={(e) => setInterestRate(e.target.value === "" ? "" : Number(e.target.value))}
                    InputProps={{ endAdornment: <InputAdornment position="end">%/yr</InputAdornment> }}
                    helperText="Reducing balance rate"
                    fullWidth
                  />
                  <TextField
                    label="Repayment Term"
                    type="number"
                    value={termMonths}
                    onChange={(e) => setTermMonths(e.target.value === "" ? "" : Number(e.target.value))}
                    InputProps={{ endAdornment: <InputAdornment position="end">months</InputAdornment> }}
                    fullWidth
                  />
                </Box>
              </CardContent>
            </Card>

            <Card sx={{ borderRadius: 3, boxShadow: "0 4px 20px rgba(0,0,0,0.06)" }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight="bold" sx={{ color: "#1B5E20", mb: 2 }}>
                  2. Expected Cash Flow Impact
                </Typography>
                <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2.5 }}>
                  <TextField
                    label="Extra Monthly Revenue"
                    type="number"
                    value={extraRevenue}
                    onChange={(e) => setExtraRevenue(e.target.value === "" ? "" : Number(e.target.value))}
                    InputProps={{ endAdornment: <InputAdornment position="end">{currency}/mo</InputAdornment> }}
                    helperText="Generated from this investment"
                    fullWidth
                  />
                  <TextField
                    label="Extra Operating Costs"
                    type="number"
                    value={extraOpCost}
                    onChange={(e) => setExtraOpCost(e.target.value === "" ? "" : Number(e.target.value))}
                    InputProps={{ endAdornment: <InputAdornment position="end">{currency}/mo</InputAdornment> }}
                    helperText="Feed, utilities, labour to run it"
                    fullWidth
                  />
                </Box>
              </CardContent>
            </Card>
          </Box>

          {/* Results Sticky Column */}
          <Box>
            <Card sx={{ position: "sticky", top: 80, borderRadius: 3, boxShadow: "0 6px 24px rgba(0,0,0,0.08)", border: "1px solid #E2E8F0" }}>
              <CardContent sx={{ p: 3.5 }}>
                <Typography variant="h6" fontWeight="bold" sx={{ color: "#1B5E20", mb: 2 }}>
                  Loan Feasibility & Returns
                </Typography>

                {/* Status Indicator */}
                <Box sx={{ mb: 2.5 }}>
                  {results.netAfterLoan < 0 ? (
                    <Box sx={{ display: "inline-flex", alignItems: "center", gap: 1, bgcolor: "#FFEBEE", color: "#C62828", px: 2, py: 0.8, borderRadius: 999, fontWeight: "bold", fontSize: "0.875rem" }}>
                      <ErrorIcon sx={{ fontSize: 18 }} /> Negative Cash Flow After Loan Instalment
                    </Box>
                  ) : isFinite(results.payback) && results.payback > results.n ? (
                    <Box sx={{ display: "inline-flex", alignItems: "center", gap: 1, bgcolor: "#FFF8E1", color: "#F57F17", px: 2, py: 0.8, borderRadius: 999, fontWeight: "bold", fontSize: "0.875rem" }}>
                      <Warning sx={{ fontSize: 18 }} /> Cash Flow Positive, But Payback Exceeds Loan Term
                    </Box>
                  ) : (
                    <Box sx={{ display: "inline-flex", alignItems: "center", gap: 1, bgcolor: "#E8F5E9", color: "#2E7D32", px: 2, py: 0.8, borderRadius: 999, fontWeight: "bold", fontSize: "0.875rem" }}>
                      <CheckCircle sx={{ fontSize: 18 }} /> Healthy Cash Flow & Fully Affordable
                    </Box>
                  )}
                </Box>

                {/* KPI Tiles */}
                <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2, mb: 3 }}>
                  <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, gridColumn: "span 2", bgcolor: "#F0FDF4", borderColor: "#BBF7D0" }}>
                    <Typography variant="caption" sx={{ color: "#166534", textTransform: "uppercase", fontWeight: 600 }}>
                      Monthly Loan Instalment (PMT)
                    </Typography>
                    <Typography variant="h4" fontWeight="bold" sx={{ mt: 0.5, color: "#15803D" }}>
                      {fmt(results.payment)}
                    </Typography>
                    <Typography variant="caption" sx={{ color: "#166534" }}>
                      Per month for {results.n} months
                    </Typography>
                  </Paper>

                  <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                    <Typography variant="caption" sx={{ color: "#64748B", textTransform: "uppercase", fontWeight: 600 }}>
                      Total Interest Paid
                    </Typography>
                    <Typography variant="h6" fontWeight="bold" sx={{ mt: 0.5, color: "#1E293B" }}>
                      {fmt(results.totalInterest)}
                    </Typography>
                  </Paper>

                  <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                    <Typography variant="caption" sx={{ color: "#64748B", textTransform: "uppercase", fontWeight: 600 }}>
                      Net Cash Flow / Mo
                    </Typography>
                    <Typography variant="h6" fontWeight="bold" sx={{ mt: 0.5, color: results.netAfterLoan >= 0 ? "#15803D" : "#DC2626" }}>
                      {fmt(results.netAfterLoan)}
                    </Typography>
                  </Paper>

                  <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, gridColumn: "span 2", bgcolor: "#F8FAFC" }}>
                    <Typography variant="caption" sx={{ color: "#475569", textTransform: "uppercase", fontWeight: 600 }}>
                      Investment Payback Period
                    </Typography>
                    <Typography variant="h6" fontWeight="bold" sx={{ mt: 0.5, color: "#0F172A" }}>
                      {isFinite(results.payback) ? `${results.payback.toFixed(1)} months` : "Never at current cash flow"}
                    </Typography>
                    <Typography variant="caption" sx={{ color: "#64748B" }}>
                      {results.payback <= results.n ? "Recovers investment capital within the loan term" : "Exceeds the loan repayment duration"}
                    </Typography>
                  </Paper>

                  <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, gridColumn: "span 2" }}>
                    <Typography variant="caption" sx={{ color: "#64748B", textTransform: "uppercase", fontWeight: 600 }}>
                      Net Economic Return Over Term
                    </Typography>
                    <Typography variant="h6" fontWeight="bold" sx={{ mt: 0.5, color: "#1E293B" }}>
                      {fmt(results.netReturnOverTerm)} ({results.roiPct.toFixed(1)}% ROI)
                    </Typography>
                  </Paper>
                </Box>

                {/* Principal vs Interest Breakdown */}
                <Typography variant="subtitle2" fontWeight="bold" sx={{ color: "#334155", mb: 1 }}>
                  Repayment Composition
                </Typography>
                <Box sx={{ width: "100%", height: 16, borderRadius: 1, bgcolor: "#E2E8F0", overflow: "hidden", display: "flex", mb: 2 }}>
                  {results.totalRepay > 0 && (
                    <>
                      <Box sx={{ width: `${(results.P / results.totalRepay) * 100}%`, bgcolor: "#15803D" }} title="Principal" />
                      <Box sx={{ width: `${(results.totalInterest / results.totalRepay) * 100}%`, bgcolor: "#F59E0B" }} title="Interest" />
                    </>
                  )}
                </Box>

                <Box sx={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", color: "#64748B" }}>
                  <span><Box component="span" sx={{ display: "inline-block", width: 8, height: 8, bgcolor: "#15803D", borderRadius: "50%", mr: 1 }} />Principal: <strong>{fmt(results.P)} ({results.totalRepay > 0 ? ((results.P / results.totalRepay) * 100).toFixed(0) : 0}%)</strong></span>
                  <span><Box component="span" sx={{ display: "inline-block", width: 8, height: 8, bgcolor: "#F59E0B", borderRadius: "50%", mr: 1 }} />Interest: <strong>{fmt(results.totalInterest)} ({results.totalRepay > 0 ? ((results.totalInterest / results.totalRepay) * 100).toFixed(0) : 0}%)</strong></span>
                </Box>
              </CardContent>
            </Card>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default LoanCalculator;
