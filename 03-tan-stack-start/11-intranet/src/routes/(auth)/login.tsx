import { createFileRoute } from '@tanstack/react-router'
import { Login } from '@/pods/login'

export const Route = createFileRoute('/(auth)/login')({
  component: LoginPage,
})

function LoginPage() {
  return <Login />
}
