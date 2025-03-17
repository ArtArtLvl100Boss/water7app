"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Loader2 } from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { verifyPasscode } from "@/lib/passcode-utils"
import { useToast } from "@/hooks/use-toast"

interface PasscodeDialogProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  actionType: "create" | "edit" | "delete"
}

export function PasscodeDialog({ isOpen, onClose, onSuccess, actionType }: PasscodeDialogProps) {
  const [passcode, setPasscode] = useState("")
  const [isVerifying, setIsVerifying] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  // Reset passcode and error when dialog opens
  useEffect(() => {
    if (isOpen) {
      setPasscode("")
      setError(null)
    }
  }, [isOpen])

  const handleVerify = async () => {
    if (!passcode.trim()) {
      setError("Please enter a passcode")
      return
    }

    setIsVerifying(true)
    setError(null)

    try {
      const isValid = await verifyPasscode(passcode)

      if (isValid) {
        setPasscode("")
        onSuccess()
      } else {
        setError("Invalid passcode. Please try again.")
        toast({
          title: "Verification Failed",
          description: "The passcode you entered is incorrect.",
          variant: "destructive",
        })
      }
    } catch (err) {
      console.error("Error during passcode verification:", err)
      setError("An error occurred during verification. Please try again.")
      toast({
        title: "Verification Error",
        description: "There was a problem verifying your passcode.",
        variant: "destructive",
      })
    } finally {
      setIsVerifying(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !isVerifying) {
      e.preventDefault()
      handleVerify()
    }
  }

  const getActionText = () => {
    switch (actionType) {
      case "create":
        return "create a new report"
      case "edit":
        return "save changes to this report"
      case "delete":
        return "delete this report"
      default:
        return "proceed"
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !isVerifying && !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Passcode Required</DialogTitle>
          <DialogDescription>Please enter the admin passcode to {getActionText()}.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="passcode">Passcode</Label>
            <Input
              id="passcode"
              type="password"
              placeholder="Enter passcode"
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isVerifying}
              autoFocus
            />
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isVerifying}>
            Cancel
          </Button>
          <Button onClick={handleVerify} disabled={isVerifying}>
            {isVerifying && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Verify
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

