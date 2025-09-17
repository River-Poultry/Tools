import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { TrendingUp, Ruler, TrendingUpDownIcon } from 'lucide-react';
import styled from 'styled-components';

const Nav = styled.nav`
  background: #f3c362ff;
  padding: 0 20px;
`;

const NavList = styled.ul`
  list-style: none;
  display: flex;
  margin: 0;
  padding: 0;
`;

const NavItem = styled.li<{ active: boolean }>`
  margin: 0;
  
  a {
    display: flex;
    align-items: center;
    gap: 8px;
    color: ${props => props.active ? '#000000ff' : 'white'};
    text-decoration: none;
    padding: 15px 20px;
    font-weight: 600;
    border-bottom: 3px solid ${props => props.active ? '#000000ff' : 'transparent'};
    
    
  }
`;

const Navigation: React.FC = () => {
  const location = useLocation();

  return (
    <Nav>
      <NavList>
        <NavItem active={location.pathname === '/Vaccination'}>
          <Link to="/vaccination">
            <TrendingUpDownIcon size={18} />
            Vaccination Planner
          </Link>
        </NavItem>
        <NavItem active={location.pathname === '/measurement'}>
          <Link to="/measurement">
            <Ruler size={18} />
            Room Measurement
          </Link>
        </NavItem>
        <NavItem active={location.pathname === '/budget'}>
          <Link to="/budget">
            <TrendingUp size={18} />
            Budget Tracker
          </Link>
        </NavItem>
      </NavList>
    </Nav>
  );
};

export default Navigation;