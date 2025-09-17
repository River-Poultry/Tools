import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import BudgetTracker from './components/BudgetTracker';
import RoomMeasurement from './components/RoomMeasurement';
import Navigation from './components/Navigation';
import Vaccination from "./components/Vaccination";
import styled from 'styled-components';

const AppContainer = styled.div`
  min-height: 100vh;
  background: #ffffffff;
`;

const App: React.FC = () => {
  return (
    <Router>
      <AppContainer>
        <Navigation />
        <Routes>
          <Route path="/" element={<Vaccination />} />
          <Route path="/measurement" element={<RoomMeasurement />} />
          <Route path="/budget" element={<BudgetTracker />} />

        </Routes>
      </AppContainer>
    </Router>
  );
};

export default App;