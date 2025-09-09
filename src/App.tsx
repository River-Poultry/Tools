import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import BudgetTracker from './components/BudgetTracker';
import RoomMeasurement from './components/RoomMeasurement';
import Navigation from './components/Navigation';
import styled from 'styled-components';

const AppContainer = styled.div`
  min-height: 100vh;
  background: #ecf0f1;
`;

const App: React.FC = () => {
  return (
    <Router>
      <AppContainer>
        <Navigation />
        <Routes>
          <Route path="/" element={<BudgetTracker />} />
          <Route path="/budget" element={<BudgetTracker />} />
          <Route path="/measurement" element={<RoomMeasurement />} />
        </Routes>
      </AppContainer>
    </Router>
  );
};

export default App;