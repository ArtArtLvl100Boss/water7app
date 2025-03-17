"use client"

import { useState } from "react"
import { Trash2 } from "lucide-react"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { PasscodeDialog } from "@/components/passcode-dialog"
import { useToast } from "@/hooks/use-toast"

interface DeleteAlertProps {
  onDelete: () => Promise<void>
  triggerClassName?: string
}

export function DeleteAlert({ onDelete, triggerClassName }: DeleteAlertProps) {
  const [isAlertOpen, setIsAlertOpen] = useState(false)
  const [isPasscodeOpen, setIsPasscodeOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const { toast } = useToast()

  const handleDeleteConfirm = () => {
    // Close the alert dialog and open the passcode dialog
    setIsAlertOpen(false)
    setIsPasscodeOpen(true)
  }

  const handlePasscodeSuccess = async () => {
    setIsDeleting(true)
    try {
      // Execute the delete operation
      await onDelete()
      toast({
        title: "Report deleted",
        description: "The report has been successfully deleted.",
      })
    } catch (error) {
      console.error("Error deleting report:", error)
      toast({
        title: "Error",
        description: "Failed to delete the report. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
      setIsPasscodeOpen(false)
    }
  }

  const handlePasscodeCancel = () => {
    setIsPasscodeOpen(false)
  }

  return (
    <>
      {/* First dialog: Confirm deletion */}
      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogTrigger asChild>
          <Button variant="ghost" size="icon" className={triggerClassName}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the report and remove it from the database.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault()
                handleDeleteConfirm()
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Second dialog: Passcode verification */}
      <PasscodeDialog
        isOpen={isPasscodeOpen}
        onClose={handlePasscodeCancel}
        onSuccess={handlePasscodeSuccess}
        actionType="delete"
      />
    </>
  )
}

