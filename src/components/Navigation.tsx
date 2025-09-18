import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { TrendingUp, Ruler, TrendingUpDown } from 'lucide-react';
import styled from 'styled-components';

const Nav = styled.nav`
  background: #f1f2b0ff;
  padding: 0 20px;
  position: sticky;
  top: 0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
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
    color: #000000ff; /* always black */
    text-decoration: none;
    padding: 15px 20px;
    font-weight: 600;
    border-bottom: 3px solid
      ${props => (props.active ? '#000000ff' : 'transparent')};
  }
`;

const Navigation: React.FC = () => {
  const location = useLocation();

  return (
    <Nav>
      <NavList>
        <NavItem active={location.pathname === '/'}>
          <Link to="/">
            <TrendingUpDown size={18} />
            Vaccination Schedule
          </Link>
        </NavItem>
        <NavItem active={location.pathname === '/measurement'}>
          <Link to="/measurement">
            <Ruler size={18} />
            Room Measurement
          </Link>
        </NavItem>
        {/* <NavItem active={location.pathname === '/budget'}>
          <Link to="/budget">
            <TrendingUp size={18} />
            Budget Tracker
          </Link>
        </NavItem> */}
      </NavList>
    </Nav>
  );
};

export default Navigation;
