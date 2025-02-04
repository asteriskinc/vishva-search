// app/page.tsx
import { auth } from "@/auth"
import { MainContent } from "@/app/MainContent"

export default async function Page() {
  const session = await auth()
  
  return <MainContent initialSession={session?.user} />
}