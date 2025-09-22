import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Ruler, TrendingUpDown } from "lucide-react";
import styled from "styled-components";

const Nav = styled.nav`
  background: #f1f2b0ff;
  padding: 0 20px;
  position: sticky;
  top: 0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  z-index: 1000;
`;

const NavContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 60px; /* better height for header */
`;

const Logo = styled.div`
  font-weight: 700;
  font-size: 1.3rem;
  color: #000;
`;

const Hamburger = styled.div`
  display: none;
  cursor: pointer;

  @media (max-width: 768px) {
    display: block;
  }
`;

const NavList = styled.ul<{ open: boolean }>`
  list-style: none;
  display: flex;
  margin: 0;
  padding: 0;

  @media (max-width: 768px) {
    flex-direction: column;
    position: absolute;
    top: 60px; /* just below header */
    left: 0;
    right: 0;
    background: #f1f2b0ff;
    max-height: ${({ open }) => (open ? "300px" : "0")};
    overflow: hidden;
    transition: max-height 0.3s ease-in-out;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
`;

const NavItem = styled.li<{ active: boolean }>`
  margin: 0;

  a {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #000;
    text-decoration: none;
    padding: 15px 20px;
    font-weight: 600;
    border-bottom: 3px solid
      ${(props) => (props.active ? "#000" : "transparent")};
    transition: background 0.2s ease;

    &:hover {
      background: #e6e7a8;
    }
  }

  @media (max-width: 768px) {
    a {
      justify-content: flex-start;
      border-bottom: 1px solid #ddd;
      width: 100%;
    }
  }
`;

const Navigation: React.FC = () => {
  const location = useLocation();
  const [open, setOpen] = useState(false);

  return (
    <Nav>
      <NavContainer>
        <Logo>Farm Tools</Logo>

        {/* Hamburger (only visible on mobile) */}
        <Hamburger onClick={() => setOpen(!open)}>
          {open ? <X size={28} /> : <Menu size={28} />}
        </Hamburger>
      </NavContainer>

      {/* Nav Items */}
      <NavList open={open}>
        <NavItem active={location.pathname === "/"}>
          <Link to="/" onClick={() => setOpen(false)}>
            <TrendingUpDown size={18} />
            Vaccination Schedule
          </Link>
        </NavItem>
        <NavItem active={location.pathname === "/measurement"}>
          <Link to="/measurement" onClick={() => setOpen(false)}>
            <Ruler size={18} />
            Room Measurement
          </Link>
        </NavItem>
      </NavList>
    </Nav>
  );
};

export default Navigation;
