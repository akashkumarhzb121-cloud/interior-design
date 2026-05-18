import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { Section, SectionHeader } from '@/components/ui/Section'
import { Button } from '@/components/ui/Button'
import { bookingsApi } from '@/api/services'

export default function BookingsManagement() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)

  const loadBookings = async () => {
    setLoading(true)
    try {
      const response = await bookingsApi.getAll()
      setBookings(response.data || [])
    } catch (error) {
      console.error('[v0] Error loading bookings:', error)
      toast.error('Unable to load bookings.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadBookings()
  }, [])

  return (
    <Section className="bg-background min-h-[calc(100vh-4rem)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader title="Bookings" description="Review scheduled consultations and pending requests." />

        <div className="mt-8 overflow-x-auto rounded-3xl border border-border bg-card">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-background/80 text-left text-sm uppercase tracking-[0.12em] text-muted-foreground">
              <tr>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Service</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-10 text-center text-muted-foreground">Loading bookings...</td>
                </tr>
              ) : bookings.length > 0 ? (
                bookings.map((booking) => (
                  <tr key={booking._id || `${booking.email}-${booking.date}-${booking.time}`}>
                    <td className="px-6 py-4 text-foreground font-medium">{booking.name}</td>
                    <td className="px-6 py-4 text-muted-foreground">{booking.email}</td>
                    <td className="px-6 py-4 text-muted-foreground">{booking.serviceType || booking.service || 'Consultation'}</td>
                    <td className="px-6 py-4 text-muted-foreground">{booking.date || '—'}</td>
                    <td className="px-6 py-4 text-muted-foreground">{booking.time || '—'}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-10 text-center text-muted-foreground">No bookings found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Section>
  )
}
