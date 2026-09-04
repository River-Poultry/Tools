import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Ruler, Calculator, TrendingUp, DollarSign } from "lucide-react";
import styled from "styled-components";
import riverPoultryLogo from "../assets/river-poultry-logo.png";

const Nav = styled.nav<{ scrolled: boolean }>`
  background: ${props => props.scrolled 
    ? "linear-gradient(135deg, #F4E4BC 0%, #F7E7C4 100%)" 
    : "linear-gradient(135deg, #1B5E20 0%, #2E7D32 100%)"};
  padding: 0 20px;
  position: sticky;
  top: 0;
  box-shadow: ${props => props.scrolled 
    ? "0 4px 20px rgba(244, 228, 188, 0.4)" 
    : "0 2px 4px rgba(0, 0, 0, 0.1)"};
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
  margin-right: 20px;
  padding: 0 !important;
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
  outline: none !important;
  
  img {
    height: 48px;
    width: auto;
    display: block;
    background: transparent !important;
    border: none !important;
    box-shadow: none !important;
    outline: none !important;
    filter: ${props => props.scrolled 
      ? "drop-shadow(0 2px 8px rgba(0, 0, 0, 0.3))" 
      : "drop-shadow(0 2px 8px rgba(0, 0, 0, 0.2))"};
    transition: all 0.3s ease-in-out;
    
    &:hover {
      transform: scale(1.05);
    }
  }
  
  @media (max-width: 768px) {
    margin-right: 15px;
    img {
      height: 40px;
    }
  }
`;

const Hamburger = styled.div`
  display: none;
  cursor: pointer;

  @media (max-width: 900px) {
    display: block;
  }
`;

const NavList = styled.ul<{ open: boolean }>`
  list-style: none;
  display: flex;
  margin: 0;
  padding: 0;
  gap: 12px;

  @media (max-width: 900px) {
    flex-direction: column;
    position: absolute;
    top: 60px;
    left: 0;
    right: 0;
    background: #f1f2b0;
    max-height: ${({ open }) => (open ? "400px" : "0")};
    overflow: hidden;
    transition: max-height 0.3s ease-in-out;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
`;

const NavItem = styled.li<{ active: boolean; scrolled: boolean }>`
  margin: 0;

  a {
    display: flex;
    align-items: center;
    gap: 6px;
    color: ${props => props.scrolled ? "#000000" : "white"};
    text-decoration: none;
    padding: 10px 14px;
    font-weight: 500;
    font-size: 0.9rem;
    border-bottom: 3px solid
      ${(props) => (props.active ? (props.scrolled ? "#000000" : "white") : "transparent")};
    transition: all 0.2s ease;
    white-space: nowrap;

    &:hover {
      background: ${props => props.scrolled 
        ? "rgba(0, 0, 0, 0.08)" 
        : "rgba(255,255,255,0.15)"};
      border-radius: 4px;
    }
  }

  @media (max-width: 900px) {
    a {
      justify-content: flex-start;
      border-bottom: 1px solid rgba(0,0,0,0.1);
      width: 100%;
      padding: 12px 20px;
      color: #1B5E20;
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

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <Nav scrolled={scrolled}>
      <NavContainer open={open}>
        <LogoContainer scrolled={scrolled}>
          <Link to="/">
            <img src={riverPoultryLogo} alt="River Poultry Logo" />
          </Link>
        </LogoContainer>
        
        <NavList open={open}>
          <NavItem active={location.pathname === "/vaccination"} scrolled={scrolled}>
            <Link to="/vaccination" onClick={() => setOpen(false)}>
              <Ruler size={15} />
              Vaccination
            </Link>
          </NavItem>
          <NavItem active={location.pathname === "/measurement"} scrolled={scrolled}>
            <Link to="/measurement" onClick={() => setOpen(false)}>
              <Ruler size={15} />
              Room Measurement
            </Link>
          </NavItem>
          <NavItem active={location.pathname === "/budget-calculator"} scrolled={scrolled}>
            <Link to="/budget-calculator" onClick={() => setOpen(false)}>
              <Calculator size={15} />
              Enterprise Budget
            </Link>
          </NavItem>
          <NavItem active={location.pathname === "/flock-breakeven"} scrolled={scrolled}>
            <Link to="/flock-breakeven" onClick={() => setOpen(false)}>
              <TrendingUp size={15} />
              Flock Breakeven
            </Link>
          </NavItem>
          <NavItem active={location.pathname === "/loan-calculator"} scrolled={scrolled}>
            <Link to="/loan-calculator" onClick={() => setOpen(false)}>
              <DollarSign size={15} />
              Loan & ROI
            </Link>
          </NavItem>
        </NavList>

        <Hamburger onClick={() => setOpen(!open)}>
          {open ? <X size={26} color={scrolled ? "#000" : "#fff"} /> : <Menu size={26} color={scrolled ? "#000" : "#fff"} />}
        </Hamburger>
      </NavContainer>
    </Nav>
  );
};

export default Navigation;
