import React from "react";
import { AppBar, Toolbar, Typography, Box, useMediaQuery, useTheme } from "@mui/material";
import riverPoultryLogo from "../assets/river-poultry-logo.png";

const Header: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <AppBar 
      position="static" 
      sx={{ 
        background: "linear-gradient(135deg, #1B5E20 0%, #2E7D32 50%, #388E3C 100%)",
        boxShadow: "0px 4px 20px rgba(46, 125, 50, 0.2)",
        borderBottom: "1px solid rgba(255,255,255,0.1)",
      }}
    >
      <Toolbar sx={{ px: isMobile ? 2 : 4 }}>
        {/* River Poultry Logo */}
        <Box sx={{ display: "flex", alignItems: "center", mr: 3 }}>
          <Box
            component="img"
            src={riverPoultryLogo}
            alt="River Poultry Logo"
            sx={{
              height: isMobile ? 40 : 50,
              width: "auto",
              mr: 2,
              filter: "brightness(0) invert(1) drop-shadow(0px 2px 4px rgba(0,0,0,0.2))",
            }}
          />
        </Box>

        {/* Spacer to push content to the right if needed */}
        <Box sx={{ flexGrow: 1 }} />

        {/* Optional: Add navigation items here in the future */}
      </Toolbar>
    </AppBar>
  );
};

export default Header;
