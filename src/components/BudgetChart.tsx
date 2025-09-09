import React from 'react';
import { BudgetItem } from '../types';
import styled from 'styled-components';

const ChartContainer = styled.div`
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
`;

const ChartTitle = styled.h3`
  margin: 0 0 15px 0;
  color: #2c3e50;
`;

const Chart = styled.div`
  display: flex;
  height: 30px;
  margin-bottom: 10px;
  border-radius: 4px;
  overflow: hidden;
`;

const IncomeBar = styled.div<{ width: number }>`
  background: #27ae60;
  width: ${props => props.width}%;
  transition: width 0.3s ease;
`;

const ExpenseBar = styled.div<{ width: number }>`
  background: #e74c3c;
  width: ${props => props.width}%;
  transition: width 0.3s ease;
`;

const Legend = styled.div`
  display: flex;
  gap: 20px;
`;

const LegendItem = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
`;

const ColorBox = styled.div<{ color: string }>`
  width: 15px;
  height: 15px;
  background: ${props => props.color};
  border-radius: 3px;
`;

interface BudgetChartProps {
  budgetItems: BudgetItem[];
}

const BudgetChart: React.FC<BudgetChartProps> = ({ budgetItems }) => {
  const totalIncome = budgetItems
    .filter(item => item.type === 'income')
    .reduce((sum, item) => sum + item.amount, 0);

  const totalExpenses = budgetItems
    .filter(item => item.type === 'expense')
    .reduce((sum, item) => sum + item.amount, 0);

  const total = totalIncome + totalExpenses;
  const incomePercentage = total > 0 ? (totalIncome / total) * 100 : 0;
  const expensePercentage = total > 0 ? (totalExpenses / total) * 100 : 0;

  return (
    <ChartContainer>
      <ChartTitle>Income vs Expenses</ChartTitle>
      <Chart>
        <IncomeBar width={incomePercentage} />
        <ExpenseBar width={expensePercentage} />
      </Chart>
      <Legend>
        <LegendItem>
          <ColorBox color="#27ae60" />
          <span>Income: ${totalIncome.toFixed(2)}</span>
        </LegendItem>
        <LegendItem>
          <ColorBox color="#e74c3c" />
          <span>Expenses: ${totalExpenses.toFixed(2)}</span>
        </LegendItem>
      </Legend>
    </ChartContainer>
  );
};

export default BudgetChart;