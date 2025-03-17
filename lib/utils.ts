import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(value: string | number): string {
  const numValue = typeof value === "string" ? Number.parseFloat(value) || 0 : value
  return numValue.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

export function calculateTotalIncome(waterSales: string, soapSales: string): number {
  const water = Number.parseFloat(waterSales) || 0
  const soap = Number.parseFloat(soapSales) || 0
  return water + soap
}

export function calculateTotalExpenses(expenses: { amount: string }[]): number {
  return expenses.reduce((total, expense) => {
    return total + (Number.parseFloat(expense.amount) || 0)
  }, 0)
}

export function calculateNetIncome(totalIncome: number, totalExpenses: number): number {
  return totalIncome - totalExpenses
}

