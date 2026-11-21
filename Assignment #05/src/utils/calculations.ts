export interface Expense {
  id: string;
  title: string;
  amount: number;
  category: ExpenseCategory;
  date: string;
}

export type ExpenseCategory =
  | "Food"
  | "Transport"
  | "Utilities"
  | "Entertainment"
  | "Other";

export const CATEGORIES: ExpenseCategory[] = [
  "Food",
  "Transport",
  "Utilities",
  "Entertainment",
  "Other",
];

export function calculateTotal(expenses: Expense[]): number {
  return expenses.reduce((sum, e) => sum + e.amount, 0);
}

export function calculateBudgetRemaining(
  total: number,
  budget: number
): number {
  return budget - total;
}
