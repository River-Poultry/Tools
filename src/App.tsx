import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import BudgetCalculator from './components/BudgetCalculator';
import RoomMeasurement from './components/RoomMeasurement';
import Navigation from './components/Navigation';
import Vaccination from "./components/Vaccination";
import ToolsOverview from './components/ToolsOverview';
import LeadsViewer from './components/LeadsViewer';
import ProtectedRoute from './components/ProtectedRoute';
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
          <Route path="/" element={<ToolsOverview />} />
          <Route path="/vaccination" element={<Vaccination />} />
          <Route path="/measurement" element={<RoomMeasurement />} />
          <Route path="/budget-calculator" element={<BudgetCalculator />} />
          <Route path="/admin/leads" element={
            <ProtectedRoute password="RiverPoultry2025!">
              <LeadsViewer />
            </ProtectedRoute>
          } />
        </Routes>
      </AppContainer>
    </Router>
  );
};

export default App;