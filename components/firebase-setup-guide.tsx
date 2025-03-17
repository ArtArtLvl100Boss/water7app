"use client"

import { AlertCircle } from "lucide-react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"

export function FirebaseSetupGuide() {
  return (
    <Alert variant="destructive" className="mb-6">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Firebase Permission Error</AlertTitle>
      <AlertDescription className="mt-2">
        <p className="mb-2">
          You need to update your Firestore security rules to allow read/write access without authentication.
        </p>
        <ol className="list-decimal pl-5 mb-4 space-y-2">
          <li>
            Go to the{" "}
            <a
              href="https://console.firebase.google.com/project/water7-b8baf/firestore/rules"
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              Firebase Console
            </a>
          </li>
          <li>Select your project (water7-b8baf)</li>
          <li>Navigate to Firestore Database → Rules</li>
          <li>Replace the rules with the following:</li>
        </ol>
        <pre className="bg-muted p-3 rounded-md text-xs mb-4 overflow-x-auto">
          {`rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}`}
        </pre>
        <p className="text-sm mb-4">
          <strong>Note:</strong> These rules allow anyone to read and write to your database. This is suitable for
          personal use but not recommended for production applications with sensitive data.
        </p>
        <Button
          variant="outline"
          className="bg-background text-foreground hover:bg-background/90"
          onClick={() => window.location.reload()}
        >
          Refresh after updating rules
        </Button>
      </AlertDescription>
    </Alert>
  )
}

