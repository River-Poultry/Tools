import React, { useState, useEffect } from 'react';
import { BudgetItem } from '../types'; // Fixed import path
import { Plus, TrendingUp, Trash2 } from 'lucide-react';
import styled from 'styled-components';
import BudgetChart from './BudgetChart';

const Container = styled.div`
  padding: 20px;
  max-width: 1000px;
  margin: 0 auto;
  background: #fff;
`;

const Header = styled.h2`
  color: #000;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const Form = styled.form`
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr auto;
  gap: 10px;
  align-items: end;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
`;

const Label = styled.label`
  margin-bottom: 5px;
  font-weight: 600;
  color: #000;
`;

const Input = styled.input`
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
  color: #000;
`;

const Select = styled.select`
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
  color: #000;
`;

const Button = styled.button`
  padding: 10px 15px;
  background: #e74c3c;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
  font-weight: 600;

  &:hover {
    background: #c0392b;
  }
`;

const DeleteButton = styled.button`
  background: transparent;
  border: none;
  cursor: pointer;
  color: #e74c3c;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    color: #c0392b;
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
`;

const TableHeader = styled.th`
  background: #000;
  color: #fff;
  padding: 12px;
  text-align: left;
`;

const TableRow = styled.tr`
  &:nth-child(even) {
    background: #f9f9f9;
  }
`;

const TableCell = styled.td`
  padding: 12px;
  border-bottom: 1px solid #eee;
  color: #000;
`;

const IncomeCell = styled(TableCell)`
  color: #27ae60;
  font-weight: 600;
`;

const ExpenseCell = styled(TableCell)`
  color: #e74c3c;
  font-weight: 600;
`;

const Summary = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-bottom: 20px;
`;

const SummaryCard = styled.div`
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  text-align: center;
`;

const SummaryTitle = styled.h3`
  margin: 0 0 10px 0;
  color: #000;
`;

const SummaryAmount = styled.p<{ positive?: boolean }>`
  font-size: 24px;
  font-weight: 600;
  margin: 0;
  color: ${props => props.positive ? '#27ae60' : props.positive === false ? '#e74c3c' : '#000'};
`;

const BudgetTracker: React.FC = () => {
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    type: 'expense',
    category: ''
  });

  // Load from localStorage on mount
  useEffect(() => {
    const savedItems = localStorage.getItem('budgetItems');
    if (savedItems) {
      const parsed = JSON.parse(savedItems);
      // convert dates back to Date objects
      const withDates = parsed.map((item: any) => ({
        ...item,
        date: new Date(item.date),
      }));
      setBudgetItems(withDates);
    }
  }, []);

  // Save to localStorage whenever budgetItems changes
  useEffect(() => {
    localStorage.setItem('budgetItems', JSON.stringify(budgetItems));
  }, [budgetItems]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newItem: BudgetItem = {
      id: Date.now().toString(),
      name: formData.name,
      amount: parseFloat(formData.amount),
      type: formData.type as 'income' | 'expense',
      category: formData.category,
      date: new Date()
    };

    setBudgetItems([...budgetItems, newItem]);
    setFormData({ name: '', amount: '', type: 'expense', category: '' });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleDelete = (id: string) => {
    setBudgetItems(budgetItems.filter(item => item.id !== id));
  };

  const totalIncome = budgetItems
    .filter(item => item.type === 'income')
    .reduce((sum, item) => sum + item.amount, 0);

  const totalExpenses = budgetItems
    .filter(item => item.type === 'expense')
    .reduce((sum, item) => sum + item.amount, 0);

  const netProfit = totalIncome - totalExpenses;

  const categories = ['Housing', 'Food', 'Transportation', 'Entertainment', 'Utilities', 'Other'];

  return (
    <Container>
      <Header>
        <TrendingUp size={24} />
        Budget Tracker
      </Header>

      <Summary>
        <SummaryCard>
          <SummaryTitle>Total Income</SummaryTitle>
          <SummaryAmount positive>{totalIncome.toFixed(2)}</SummaryAmount>
        </SummaryCard>

        <SummaryCard>
          <SummaryTitle>Total Expenses</SummaryTitle>
          <SummaryAmount positive={false}>{totalExpenses.toFixed(2)}</SummaryAmount>
        </SummaryCard>

        <SummaryCard>
          <SummaryTitle>Net Profit/Loss</SummaryTitle>
          <SummaryAmount positive={netProfit > 0}>
            {netProfit.toFixed(2)}
          </SummaryAmount>
        </SummaryCard>
      </Summary>

      <Form onSubmit={handleSubmit}>
        <FormGroup>
          <Label>Name</Label>
          <Input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </FormGroup>

        <FormGroup>
          <Label>Amount</Label>
          <Input
            type="number"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            min="0"
            step="0.01"
            required
          />
        </FormGroup>

        <FormGroup>
          <Label>Type</Label>
          <Select name="type" value={formData.type} onChange={handleChange}>
            <option value="expense">Expense</option>
            <option value="income">Income</option>
          </Select>
        </FormGroup>

        <FormGroup>
          <Label>Category</Label>
          <Select name="category" value={formData.category} onChange={handleChange} required>
            <option value="">Select a category</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </Select>
        </FormGroup>

        <Button type="submit">
          <Plus size={16} />
          Add
        </Button>
      </Form>

      <BudgetChart budgetItems={budgetItems} />

      <Table>
        <thead>
          <tr>
            <TableHeader>Date</TableHeader>
            <TableHeader>Name</TableHeader>
            <TableHeader>Category</TableHeader>
            <TableHeader>Type</TableHeader>
            <TableHeader>Amount</TableHeader>
            <TableHeader>Action</TableHeader>
          </tr>
        </thead>
        <tbody>
          {budgetItems.map(item => (
            <TableRow key={item.id}>
              <TableCell>{item.date.toLocaleDateString()}</TableCell>
              <TableCell>{item.name}</TableCell>
              <TableCell>{item.category}</TableCell>
              <TableCell>{item.type}</TableCell>
              {item.type === 'income' ? (
                <IncomeCell>+${item.amount.toFixed(2)}</IncomeCell>
              ) : (
                <ExpenseCell>-${item.amount.toFixed(2)}</ExpenseCell>
              )}
              <TableCell>
                <DeleteButton onClick={() => handleDelete(item.id)}>
                  <Trash2 size={18} />
                </DeleteButton>
              </TableCell>
            </TableRow>
          ))}
        </tbody>
      </Table>
    </Container>
  );
};

export default BudgetTracker;
