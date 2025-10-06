import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Ruler, TrendingUpDown, Calculator, ExternalLink } from "lucide-react";
import styled from "styled-components";
import riverPoultryLogo from "../assets/river-poultry-logo.png";

const Nav = styled.nav<{ scrolled: boolean }>`
  background: ${props => props.scrolled 
    ? 'linear-gradient(135deg, #F4E4BC 0%, #F7E7C4 100%)' 
    : 'linear-gradient(135deg, #1B5E20 0%, #2E7D32 100%)'};
  padding: 0 20px;
  position: sticky;
  top: 0;
  box-shadow: ${props => props.scrolled 
    ? '0 4px 20px rgba(244, 228, 188, 0.4)' 
    : '0 2px 4px rgba(0, 0, 0, 0.1)'};
  z-index: 1000;
  transition: all 0.3s ease-in-out;
`;

const NavContainer = styled.div<{ open: boolean }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 60px;
  position: relative;
`;

const LogoContainer = styled.div<{ scrolled: boolean }>`
  display: flex;
  align-items: center;
  margin-right: 30px;
  padding: 0 !important;
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
  outline: none !important;
  
  img {
    height: 50px;
    width: auto;
    display: block;
    background: transparent !important;
    border: none !important;
    box-shadow: none !important;
    outline: none !important;
    filter: ${props => props.scrolled 
      ? 'drop-shadow(0 2px 8px rgba(0, 0, 0, 0.3))' 
      : 'drop-shadow(0 2px 8px rgba(0, 0, 0, 0.2))'};
    transition: all 0.3s ease-in-out;
    
    &:hover {
      transform: scale(1.05);
      filter: ${props => props.scrolled 
        ? 'drop-shadow(0 4px 12px rgba(0, 0, 0, 0.4))' 
        : 'drop-shadow(0 4px 12px rgba(0, 0, 0, 0.3))'};
    }
  }
  
  @media (max-width: 768px) {
    margin-right: 15px;
    
    img {
      height: 45px;
    }
  }
`;


// Hamburger icon for mobile
const Hamburger = styled.div`
  display: none;
  cursor: pointer;

  @media (max-width: 768px) {
    display: block;
  }
`;

// Navigation items
const NavList = styled.ul<{ open: boolean }>`
  list-style: none;
  display: flex;
  margin: 0;
  padding: 0;
  gap: 20px; /* spacing between items */

  @media (max-width: 768px) {
    flex-direction: column;
    position: absolute;
    top: 60px;
    left: 0;
    right: 0;
    background: #f1f2b0ff;
    max-height: ${({ open }) => (open ? "300px" : "0")};
    overflow: hidden;
    transition: max-height 0.3s ease-in-out;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
`;

// Individual nav item
const NavItem = styled.li<{ active: boolean; scrolled: boolean }>`
  margin: 0;

  a {
    display: flex;
    align-items: center;
    gap: 8px;
    color: ${props => props.scrolled ? '#000000' : 'white'};
    text-decoration: none;
    padding: 15px 20px;
    font-weight: 500;
    font-size: 1rem;
    border-bottom: 3px solid
      ${(props) => (props.active ? (props.scrolled ? '#000000' : 'white') : 'transparent')};
    transition: all 0.3s ease;
    text-shadow: ${props => props.scrolled 
      ? 'none' 
      : '1px 1px 2px rgba(0,0,0,0.3)'};

    &:hover {
      background: ${props => props.scrolled 
        ? 'rgba(0, 0, 0, 0.1)' 
        : 'rgba(255,255,255,0.15)'};
      transform: translateY(-1px);
    }
  }

  @media (max-width: 768px) {
    a {
      justify-content: flex-start;
      border-bottom: 1px solid rgba(255,255,255,0.2);
      width: 100%;
    }
  }
`;

const Navigation: React.FC = () => {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 50;
      setScrolled(isScrolled);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <Nav scrolled={scrolled}>
      <NavContainer open={open}>
        {/* Logo */}
        <LogoContainer scrolled={scrolled}>
          <img src={riverPoultryLogo} alt="River Poultry Logo" />
        </LogoContainer>
        
        {/* Navigation Items */}
        <NavList open={open}>
          <NavItem active={location.pathname === "/"} scrolled={scrolled}>
            <Link to="/" onClick={() => setOpen(false)}>
              <TrendingUpDown size={16} />
              Tools Overview
            </Link>
          </NavItem>
          <NavItem active={location.pathname === "/vaccination"} scrolled={scrolled}>
            <Link to="/vaccination" onClick={() => setOpen(false)}>
              <TrendingUpDown size={16} />
              Vaccination Schedule
            </Link>
          </NavItem>
          <NavItem active={location.pathname === "/measurement"} scrolled={scrolled}>
            <Link to="/measurement" onClick={() => setOpen(false)}>
              <Ruler size={16} />
              Room Measurement
            </Link>
          </NavItem>
          <NavItem active={location.pathname === "/budget-calculator"} scrolled={scrolled}>
            <Link to="/budget-calculator" onClick={() => setOpen(false)}>
              <Calculator size={16} />
              Budget Calculator
            </Link>
          </NavItem>
          <NavItem active={false} scrolled={scrolled}>
            <a 
              href="https://manager.riverpoultry.com/" 
              target="_blank" 
              rel="noopener noreferrer"
              onClick={() => setOpen(false)}
              style={{ 
                display: "flex", 
                alignItems: "center", 
                gap: "8px", 
                color: scrolled ? "#000000" : "white", 
                textDecoration: "none", 
                padding: "15px 20px", 
                fontWeight: 500, 
                fontSize: "1rem",
                borderBottom: "3px solid transparent", 
                transition: "all 0.3s ease", 
                textShadow: scrolled ? "none" : "1px 1px 2px rgba(0,0,0,0.3)"
              }}
              onMouseEnter={(e) => (e.target as HTMLElement).style.background = scrolled ? "rgba(0, 0, 0, 0.1)" : "rgba(255,255,255,0.15)"}
              onMouseLeave={(e) => (e.target as HTMLElement).style.background = "transparent"}
            >
              <ExternalLink size={16} />
              Poultry Manager
            </a>
          </NavItem>
        </NavList>

        {/* Hamburger (only visible on mobile) */}
        <Hamburger onClick={() => setOpen(!open)}>
          {open ? <X size={28} /> : <Menu size={28} />}
        </Hamburger>
      </NavContainer>
    </Nav>
  );
};

export default Navigation;
