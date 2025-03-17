export interface Expense {
  id: string
  description: string
  amount: string
}

export interface Report {
  id?: string
  date: Date | string
  waterSales: string
  soapSales: string
  expenses: Expense[]
  totalIncome?: number
  totalExpenses?: number
  netIncome?: number
  createdAt?: Date | string
}

