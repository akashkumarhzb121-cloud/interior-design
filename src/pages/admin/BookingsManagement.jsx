import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { Section, SectionHeader } from '@/components/ui/Section'
import { Button } from '@/components/ui/Button'
import { bookingsApi } from '@/api/services'

const STATUS_COLORS = {
  pending:   'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-green-100 text-green-800',
  completed: 'bg-blue-100 text-blue-800',
  cancelled: 'bg-red-100 text-red-800',
}

export default function BookingsManagement() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(null)
  const [deleting, setDeleting] = useState(null)

  const loadBookings = async () => {
    setLoading(true)
    try {
      const response = await bookingsApi.getAll()
      setBookings(response.data?.data || response.data || [])
    } catch (error) {
      console.error('[Bookings] Load error:', error)
      toast.error('Unable to load bookings.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadBookings() }, [])

  const handleStatusUpdate = async (id, status) => {
    setUpdating(id + status)
    try {
      await bookingsApi.updateStatus(id, { status })
      toast.success(`Booking ${status}.`)
      await loadBookings()
    } catch (error) {
      console.error('[Bookings] Status update error:', error)
      toast.error(error?.response?.data?.message || 'Failed to update booking.')
    } finally {
      setUpdating(null)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this booking permanently?')) return
    setDeleting(id)
    try {
      await bookingsApi.delete(id)
      toast.success('Booking deleted.')
      await loadBookings()
    } catch (error) {
      console.error('[Bookings] Delete error:', error)
      toast.error('Failed to delete booking.')
    } finally {
      setDeleting(null)
    }
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return '—'
    try { return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) }
    catch { return dateStr }
  }

  return (
    <Section className="bg-background min-h-[calc(100vh-4rem)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader title="Bookings" description="Review consultation requests and accept or reject them." />

        <div className="mt-8 overflow-x-auto rounded-3xl border border-border bg-card">
          <div className="p-6 border-b border-border">
            <div className="text-sm text-muted-foreground">{bookings.length} booking{bookings.length !== 1 ? 's' : ''}</div>
          </div>
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-background/80 text-left text-sm uppercase tracking-[0.12em] text-muted-foreground">
              <tr>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Contact</th>
                <th className="px-6 py-4">Project Type</th>
                <th className="px-6 py-4">Budget</th>
                <th className="px-6 py-4">Date & Time</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr><td colSpan="7" className="px-6 py-10 text-center text-muted-foreground">Loading bookings...</td></tr>
              ) : bookings.length > 0 ? (
                bookings.map((booking) => (
                  <tr key={booking._id}>
                    <td className="px-6 py-4 text-foreground font-medium">
                      <div>{booking.name}</div>
                      {booking.message && (
                        <div className="text-xs text-muted-foreground mt-1 max-w-[160px] truncate" title={booking.message}>
                          {booking.message}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      <div>{booking.email}</div>
                      <div className="text-xs">{booking.phone}</div>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">{booking.projectType || '—'}</td>
                    <td className="px-6 py-4 text-muted-foreground">{booking.budget || '—'}</td>
                    <td className="px-6 py-4 text-muted-foreground">
                      <div>{formatDate(booking.date)}</div>
                      <div className="text-xs">{booking.time}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[booking.status] || 'bg-gray-100 text-gray-800'}`}>
                        {booking.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 flex-wrap">
                        {booking.status === 'pending' && (
                          <>
                            <Button size="sm" variant="gold" onClick={() => handleStatusUpdate(booking._id, 'confirmed')} disabled={updating === booking._id + 'confirmed'}>
                              {updating === booking._id + 'confirmed' ? '...' : 'Accept'}
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => handleStatusUpdate(booking._id, 'cancelled')} disabled={updating === booking._id + 'cancelled'}>
                              {updating === booking._id + 'cancelled' ? '...' : 'Reject'}
                            </Button>
                          </>
                        )}
                        {booking.status === 'confirmed' && (
                          <Button size="sm" onClick={() => handleStatusUpdate(booking._id, 'completed')} disabled={updating === booking._id + 'completed'}>
                            {updating === booking._id + 'completed' ? '...' : 'Mark Done'}
                          </Button>
                        )}
                        <Button size="sm" variant="destructive" onClick={() => handleDelete(booking._id)} disabled={deleting === booking._id}>
                          {deleting === booking._id ? '...' : 'Delete'}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="7" className="px-6 py-10 text-center text-muted-foreground">No bookings yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Section>
  )
}