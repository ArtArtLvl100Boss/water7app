import { redirect } from "next/navigation"

export default function Home() {
  // Redirect to reports page
  redirect("/reports")
}

