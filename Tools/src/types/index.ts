export interface BudgetItem {
  id: string;
  name: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  date: Date;
}

export interface RoomDimension {
  length: number;
  width: number;
  height: number;
  unit: 'feet' | 'meters';
}

export interface RoomMeasurement {
  id: string;
  name: string;
  dimensions: RoomDimension;
  area: number;
  volume: number;
}

// Add this to make it a module
export { };