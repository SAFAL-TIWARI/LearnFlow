import { useAuth } from "../hooks/useAuth"
import { useRouter } from "next/router"
import { useEffect } from "react"

export default function Dashboard() {
const { user } = useAuth()
const router = useRouter()

useEffect(() => {
if (!user) router.push("/login")
}, [user])

if (!user) return <p>Loading...</p>
return <div>Welcome, {user.email}</div>
}