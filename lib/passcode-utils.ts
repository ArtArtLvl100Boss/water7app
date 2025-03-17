import { collection, getDocs, query, limit } from "firebase/firestore"
import { db } from "@/lib/firebase"

// Function to verify passcode against Firestore
export async function verifyPasscode(passcode: string): Promise<boolean> {
  try {
    // Query the passcode collection
    const passcodeQuery = query(collection(db, "passcode"), limit(1))
    const querySnapshot = await getDocs(passcodeQuery)

    if (querySnapshot.empty) {
      console.error("No passcode document found in Firestore")
      return false
    }

    // Get the first document
    const passcodeDoc = querySnapshot.docs[0]
    const storedPasscode = passcodeDoc.data().passcode

    if (!storedPasscode) {
      console.error("Passcode field not found in document")
      return false
    }

    // Compare the entered passcode with the stored one
    return passcode === storedPasscode
  } catch (error) {
    console.error("Error verifying passcode:", error)
    return false
  }
}

