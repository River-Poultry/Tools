import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { authService } from '../services/authService';
import { Menu, X, Ruler, Home, Syringe, Calculator, User, Settings, BarChart3 } from "lucide-react";
import styled from "styled-components";
import riverPoultryLogo from "../assets/river-poultry-logo.png";
import { User as UserType } from "../services/authService";

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
    height: 45px;
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

const UserInfo = styled.div<{ scrolled: boolean }>`
  display: flex;
  align-items: center;
  gap: 15px;
  color: ${props => props.scrolled ? "#000000" : "white"};
  
  @media (max-width: 768px) {
    display: none;
  }
`;

const UserButton = styled.button<{ scrolled: boolean }>`
  background: none;
  border: none;
  color: ${props => props.scrolled ? "#000000" : "white"};
  cursor: pointer;
  padding: 8px;
  border-radius: 4px;
  transition: background-color 0.3s ease;
  
  &:hover {
    background-color: ${props => props.scrolled ? "rgba(0, 0, 0, 0.1)" : "rgba(255, 255, 255, 0.1)"};
  }
`;

interface NavigationProps {
  user: UserType | null;
  onLogout: () => void;
}

const Navigation: React.FC<NavigationProps> = ({ user, onLogout }) => {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 50;
      setScrolled(isScrolled);
    };

    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuOpen && !(event.target as Element).closest('[data-user-menu]')) {
        setUserMenuOpen(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [userMenuOpen]);

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
              <Home size={16} />
              Home
            </Link>
          </NavItem>
          <NavItem active={location.pathname === "/vaccination"} scrolled={scrolled}>
            <Link to="/vaccination" onClick={() => setOpen(false)}>
              <Syringe size={16} />
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
          {/* Poultry Manager - Commented out for now */}
          {/* <NavItem active={false} scrolled={scrolled}>
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
          </NavItem> */}
          
          {/* Admin Links - Only show for admin users */}
          {user && user.is_staff && (
            <>
              <NavItem active={location.pathname === "/notifications"} scrolled={scrolled}>
                <Link to="/notifications" onClick={() => setOpen(false)}>
                  <Settings size={16} />
                  Notifications
                </Link>
              </NavItem>
              <NavItem active={location.pathname === "/dev/analytics"} scrolled={scrolled}>
                <Link to="/dev/analytics" onClick={() => setOpen(false)}>
                  <BarChart3 size={16} />
                  Analytics
                </Link>
              </NavItem>
            </>
          )}
          
        </NavList>

        {/* User Info */}
        <UserInfo scrolled={scrolled}>
          {user ? (
            <div style={{ position: 'relative' }} data-user-menu>
              <UserButton 
                scrolled={scrolled} 
                onClick={() => setUserMenuOpen(!userMenuOpen)} 
                title="User Menu"
                style={{ 
                  background: 'transparent',
                  border: `1px solid ${scrolled ? "#000000" : "white"}`,
                  borderRadius: "20px",
                  padding: "8px 16px",
                  fontSize: "14px",
                  fontWeight: "500",
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <User size={16} />
                {user.first_name}
                <span style={{ fontSize: '12px', opacity: 0.7 }}>▼</span>
              </UserButton>
              
              {/* User Dropdown Menu */}
              {userMenuOpen && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  marginTop: '8px',
                  background: scrolled ? 'white' : 'rgba(0,0,0,0.9)',
                  border: `1px solid ${scrolled ? '#ddd' : 'rgba(255,255,255,0.2)'}`,
                  borderRadius: '8px',
                  padding: '8px 0',
                  minWidth: '160px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  zIndex: 1000
                }}>
                  <div style={{
                    padding: '8px 16px',
                    color: scrolled ? '#333' : 'white',
                    fontSize: '14px',
                    fontWeight: '500',
                    borderBottom: `1px solid ${scrolled ? '#eee' : 'rgba(255,255,255,0.1)'}`
                  }}>
                    {user.first_name} {user.last_name}
                  </div>
                  
                  <Link
                    to="/profile"
                    onClick={() => setUserMenuOpen(false)}
                    style={{
                      display: 'block',
                      width: '100%',
                      padding: '8px 16px',
                      color: scrolled ? '#333' : 'white',
                      textDecoration: 'none',
                      fontSize: '14px',
                      textAlign: 'left',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = scrolled ? '#f5f5f5' : 'rgba(255,255,255,0.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    My Profile
                  </Link>
                  
                  <button
                    onClick={async () => {
                      setUserMenuOpen(false);
                      try {
                        await authService.logout();
                      } catch (err) {
                        console.error('Logout error:', err);
                      }
                      onLogout();
                    }}
                    style={{
                      width: '100%',
                      padding: '8px 16px',
                      background: 'transparent',
                      border: 'none',
                      color: scrolled ? '#333' : 'white',
                      textAlign: 'left',
                      fontSize: '14px',
                      cursor: 'pointer',
                      transition: 'background 0.2s'
                    }}
                    onMouseEnter={(e) => (e.target as HTMLElement).style.background = scrolled ? '#f5f5f5' : 'rgba(255,255,255,0.1)'}
                    onMouseLeave={(e) => (e.target as HTMLElement).style.background = 'transparent'}
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div data-user-menu>
              <UserButton 
                scrolled={scrolled} 
                onClick={() => window.location.href = '/login'} 
                title="Login or Register"
                style={{ 
                  background: 'transparent',
                  border: `1px solid ${scrolled ? "#000000" : "white"}`,
                  borderRadius: "20px",
                  padding: "8px 16px",
                  fontSize: "14px",
                  fontWeight: "500",
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <User size={16} />
                Sign In
              </UserButton>
            </div>
          )}
        </UserInfo>

        {/* Hamburger (only visible on mobile) */}
        <Hamburger onClick={() => setOpen(!open)}>
          {open ? <X size={28} /> : <Menu size={28} />}
        </Hamburger>
      </NavContainer>
    </Nav>
  );
};

export default Navigation;
