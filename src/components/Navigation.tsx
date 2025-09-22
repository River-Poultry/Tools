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
  z-index: 1000;
`;

const NavList = styled.ul`
  list-style: none;
  display: flex;
  margin: 0;
  padding: 0;

  @media (max-width: 768px) {
    flex-direction: column;   /* stack items */
    width: 100%;
  }
`;

const NavItem = styled.li<{ active: boolean }>`
  margin: 0;
  flex: 1; /* equal width on desktop */

  a {
    display: flex;
    align-items: center;
    justify-content: center; /* center text + icon */
    gap: 8px;
    color: #000000ff;
    text-decoration: none;
    padding: 15px 20px;
    font-weight: 600;
    transition: background 0.2s ease;

    border-bottom: 3px solid
      ${(props) => (props.active ? '#000000ff' : 'transparent')};

    &:hover {
      background: #e6e7a8; /* subtle hover effect */
    }
  }

  @media (max-width: 768px) {
    a {
      justify-content: flex-start; /* align left on mobile */
      border-bottom: 1px solid #ddd; /* separate items */
      width: 100%;
    }
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
