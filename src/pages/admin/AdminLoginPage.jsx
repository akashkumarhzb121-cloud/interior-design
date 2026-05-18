import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuth } from '@/context/AuthContext'
import { Section } from '@/components/ui/Section'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

export default function AdminLoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)

    try {
      await login(email, password)
      toast.success('Logged in successfully')
      navigate('/admin')
    } catch (error) {
      console.error('[v0] Admin login failed:', error)
      toast.error(error?.response?.data?.message || 'Login failed. Please check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-24">
      <div className="w-full max-w-md rounded-3xl border border-border bg-card p-10 shadow-xl">
        <div className="mb-8 text-center">
          <p className="text-sm text-gold font-semibold uppercase tracking-[0.3em]">Admin Panel</p>
          <h1 className="mt-4 text-3xl font-serif font-bold text-foreground">Sign in to your dashboard</h1>
          <p className="mt-2 text-muted-foreground">Manage projects, services, testimonials, contact inquiries, and bookings.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            id="admin-email"
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            id="admin-password"
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>
      </div>
    </div>
  )
}
