// Firebase configuration
import { initializeApp } from "firebase/app"
import { getFirestore } from "firebase/firestore"

const firebaseConfig = {
  apiKey: "AIzaSyBMuZ3cAK0jZAQO16kclTjxcLUNxQAAM2M",
  projectId: "water7-b8baf",
  authDomain: "water7-b8baf.firebaseapp.com",
  storageBucket: "water7-b8baf.appspot.com",
  messagingSenderId: "123456789012", // This is a placeholder
  appId: "1:123456789012:web:abcdef123456789", // This is a placeholder
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)

// Enable offline persistence
try {
  import("firebase/firestore")
    .then(async ({ enableIndexedDbPersistence }) => {
      await enableIndexedDbPersistence(db)
      console.log("Offline persistence enabled")
    })
    .catch((err) => {
      if (err.code === "failed-precondition") {
        console.warn("Multiple tabs open, persistence can only be enabled in one tab at a time.")
      } else if (err.code === "unimplemented") {
        console.warn("The current browser doesn't support all of the features required to enable persistence")
      }
    })
} catch (err) {
  console.warn("Error enabling offline persistence:", err)
}

