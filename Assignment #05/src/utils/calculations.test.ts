import { describe, it, expect } from "vitest";
import {
  calculateTotal,
  calculateBudgetRemaining,
  type Expense,
} from "./calculations";

const sample: Expense[] = [
  { id: "1", title: "Lunch", amount: 12.5, category: "Food", date: "2026-11-01" },
  { id: "2", title: "Bus", amount: 3.0, category: "Transport", date: "2026-11-02" },
  { id: "3", title: "Movie", amount: 15, category: "Entertainment", date: "2026-11-03" },
];

describe("calculateTotal", () => {
  it("sums all expense amounts", () => {
    expect(calculateTotal(sample)).toBeCloseTo(30.5);
  });

  it("returns 0 for an empty list", () => {
    expect(calculateTotal([])).toBe(0);
  });
});

describe("calculateBudgetRemaining", () => {
  it("returns the difference between budget and total", () => {
    expect(calculateBudgetRemaining(30.5, 100)).toBeCloseTo(69.5);
  });

  it("returns a negative number when over budget", () => {
    expect(calculateBudgetRemaining(120, 100)).toBeCloseTo(-20);
  });
});
