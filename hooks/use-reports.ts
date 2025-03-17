"use client"

import { useState, useEffect } from "react"
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  query,
  orderBy,
  Timestamp,
  where,
  type DocumentData,
  serverTimestamp,
} from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { Report } from "@/types/report"
import { calculateTotalIncome, calculateTotalExpenses, calculateNetIncome } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"

export function useReports() {
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dateFilter, setDateFilter] = useState<Date | null>(null)
  const { toast } = useToast()

  // Fetch reports
  const fetchReports = async () => {
    setLoading(true)
    setError(null)
    try {
      let q

      // Apply date filter if set
      if (dateFilter) {
        // Get first and last day of the selected month
        const year = dateFilter.getFullYear()
        const month = dateFilter.getMonth()
        const firstDay = new Date(year, month, 1)
        const lastDay = new Date(year, month + 1, 0, 23, 59, 59, 999)

        console.log("Filtering by month:", firstDay, "to", lastDay)

        // First try to get reports with the date filter
        try {
          q = query(collection(db, "reports"), where("date", ">=", firstDay), where("date", "<=", lastDay))

          const querySnapshot = await getDocs(q)

          // If we get results, process them
          const fetchedReports: Report[] = []
          querySnapshot.forEach((doc) => {
            const data = doc.data()

            // Convert Firestore timestamp to Date
            const date = data.date instanceof Timestamp ? data.date.toDate() : new Date(data.date)
            const createdAt = data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(data.createdAt)

            const report: Report = {
              id: doc.id,
              date,
              waterSales: data.waterSales,
              soapSales: data.soapSales,
              expenses: data.expenses,
              totalIncome: data.totalIncome,
              totalExpenses: data.totalExpenses,
              netIncome: data.netIncome,
              createdAt,
            }

            fetchedReports.push(report)
          })

          setReports(fetchedReports)
          setLoading(false)
          return
        } catch (err) {
          console.error("Error with date filter query:", err)
          // If date filter fails, fall back to getting all reports
        }
      }

      // If no date filter or date filter failed, get all reports
      q = query(collection(db, "reports"), orderBy("createdAt", "desc"))
      const querySnapshot = await getDocs(q)

      const fetchedReports: Report[] = []
      querySnapshot.forEach((doc) => {
        const data = doc.data()

        // Convert Firestore timestamp to Date
        const date = data.date instanceof Timestamp ? data.date.toDate() : new Date(data.date)
        const createdAt = data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(data.createdAt)

        const report: Report = {
          id: doc.id,
          date,
          waterSales: data.waterSales,
          soapSales: data.soapSales,
          expenses: data.expenses,
          totalIncome: data.totalIncome,
          totalExpenses: data.totalExpenses,
          netIncome: data.netIncome,
          createdAt,
        }

        // If date filter is active, only include matching reports
        if (dateFilter) {
          const reportDate = new Date(date)
          const filterMonth = dateFilter.getMonth()
          const filterYear = dateFilter.getFullYear()

          if (reportDate.getMonth() === filterMonth && reportDate.getFullYear() === filterYear) {
            fetchedReports.push(report)
          }
        } else {
          fetchedReports.push(report)
        }
      })

      setReports(fetchedReports)
    } catch (err) {
      console.error("Error fetching reports:", err)
      setError("Missing or insufficient permissions. Please update your Firestore security rules.")
      toast({
        title: "Error fetching reports",
        description: "Please check your Firebase security rules to allow read/write access.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Add a new report
  const addReport = async (reportData: Omit<Report, "id" | "createdAt">) => {
    try {
      // Calculate totals
      const totalIncome = calculateTotalIncome(reportData.waterSales, reportData.soapSales)
      const totalExpenses = calculateTotalExpenses(reportData.expenses)
      const netIncome = calculateNetIncome(totalIncome, totalExpenses)

      // Prepare data for Firestore
      const newReport = {
        ...reportData,
        totalIncome,
        totalExpenses,
        netIncome,
        createdAt: serverTimestamp(),
      }

      const docRef = await addDoc(collection(db, "reports"), newReport)

      // Update local state
      const addedReport: Report = {
        ...newReport,
        id: docRef.id,
        createdAt: new Date(), // Use current date for local state until sync
      }

      setReports((prev) => [addedReport, ...prev])
      return addedReport
    } catch (err) {
      console.error("Error adding report:", err)
      toast({
        title: "Error adding report",
        description: "Please check your Firebase security rules to allow write access.",
        variant: "destructive",
      })
      throw err
    }
  }

  // Update an existing report
  const updateReport = async (id: string, reportData: Partial<Report>) => {
    try {
      const reportRef = doc(db, "reports", id)

      // If we're updating sales or expenses, recalculate totals
      let updatedData: DocumentData = { ...reportData }

      if (
        reportData.waterSales !== undefined ||
        reportData.soapSales !== undefined ||
        reportData.expenses !== undefined
      ) {
        // Get current report data
        const currentReport = reports.find((r) => r.id === id)
        if (!currentReport) throw new Error("Report not found")

        // Calculate new totals
        const waterSales = reportData.waterSales !== undefined ? reportData.waterSales : currentReport.waterSales
        const soapSales = reportData.soapSales !== undefined ? reportData.soapSales : currentReport.soapSales
        const expenses = reportData.expenses !== undefined ? reportData.expenses : currentReport.expenses

        const totalIncome = calculateTotalIncome(waterSales, soapSales)
        const totalExpenses = calculateTotalExpenses(expenses)
        const netIncome = calculateNetIncome(totalIncome, totalExpenses)

        updatedData = {
          ...updatedData,
          totalIncome,
          totalExpenses,
          netIncome,
        }
      }

      await updateDoc(reportRef, updatedData)

      // Update local state
      setReports((prev) =>
        prev.map((report) => (report.id === id ? { ...report, ...reportData, ...updatedData } : report)),
      )

      return { id, ...reportData, ...updatedData }
    } catch (err) {
      console.error("Error updating report:", err)
      toast({
        title: "Error updating report",
        description: "Please check your Firebase security rules to allow write access.",
        variant: "destructive",
      })
      throw err
    }
  }

  // Delete a report
  const deleteReport = async (id: string) => {
    try {
      await deleteDoc(doc(db, "reports", id))

      // Update local state
      setReports((prev) => prev.filter((report) => report.id !== id))
    } catch (err) {
      console.error("Error deleting report:", err)
      toast({
        title: "Error deleting report",
        description: "Please check your Firebase security rules to allow write access.",
        variant: "destructive",
      })
      throw err
    }
  }

  // Load reports on mount and when filters change
  useEffect(() => {
    fetchReports()
  }, [dateFilter])

  return {
    reports,
    loading,
    error,
    addReport,
    updateReport,
    deleteReport,
    dateFilter,
    setDateFilter,
    refreshReports: fetchReports,
  }
}

