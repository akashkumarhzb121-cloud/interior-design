import { useEffect, useState, useRef } from 'react'
import toast from 'react-hot-toast'
import { Star } from 'lucide-react'
import { Section, SectionHeader } from '@/components/ui/Section'
import { Button } from '@/components/ui/Button'
import { testimonialsApi } from '@/api/services'
import { cn } from '@/lib/utils'

// ─── Edit Modal ──────────────────────────────────────────────────────────────
function EditModal({ testimonial, onClose, onSaved }) {
  const [form, setForm] = useState({
    name:       testimonial.name       || '',
    profession: testimonial.profession || '',
    review:     testimonial.review     || '',
    rating:     testimonial.rating     || 5,
  })
  const [saving, setSaving] = useState(false)
  const imageRef = useRef(null)

  const handleSave = async () => {
    if (!form.name.trim() || !form.review.trim()) {
      toast.error('Name and review are required.')
      return
    }
    setSaving(true)
    try {
      const data = new FormData()
      data.append('name',       form.name.trim())
      data.append('profession', form.profession.trim())
      data.append('review',     form.review.trim())
      data.append('rating',     form.rating)
      data.append('isApproved', testimonial.isApproved ? 'true' : 'false')

      const file = imageRef.current?.files?.[0]
      if (file) data.append('image', file)

      await testimonialsApi.update(testimonial._id, data)
      toast.success('Testimonial updated.')
      onSaved()
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to update.')
    } finally {
      setSaving(false)
    }
  }

  const set = (field) => (e) => setForm((s) => ({ ...s, [field]: e.target.value }))

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(0,0,0,0.55)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '1rem',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div style={{
        background: 'var(--card, #fff)', borderRadius: '1rem',
        padding: '1.5rem', width: '100%', maxWidth: '520px',
        border: '1px solid var(--border)', boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
        maxHeight: '90vh', overflowY: 'auto',
      }}>
        <h2 style={{ margin: '0 0 1.25rem', fontSize: '1.1rem', fontWeight: 600, color: 'var(--foreground)' }}>
          Edit Testimonial
        </h2>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {[
              { id: 'name', label: 'Name *', val: form.name },
              { id: 'profession', label: 'Profession', val: form.profession },
            ].map(({ id, label, val }) => (
              <div key={id}>
                <label className="block text-sm font-medium text-foreground mb-1">{label}</label>
                <input
                  value={val}
                  onChange={set(id)}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm outline-none focus:border-gold"
                />
              </div>
            ))}
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Rating</label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <button key={s} type="button" onClick={() => setForm((f) => ({ ...f, rating: s }))}>
                  <Star className={cn('w-6 h-6', s <= form.rating ? 'fill-gold text-gold' : 'text-muted-foreground/30')} />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Review *</label>
            <textarea
              value={form.review}
              onChange={set('review')}
              rows={4}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm outline-none resize-none focus:border-gold"
            />
            <p className="text-xs text-muted-foreground text-right mt-0.5">{form.review.length}/1000</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Replace photo (optional)</label>
            <input ref={imageRef} type="file" accept="image/*" className="w-full text-sm" />
          </div>
        </div>

        <div className="flex gap-2 justify-end mt-5">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-border text-sm text-foreground bg-transparent cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2 rounded-lg bg-gold text-charcoal text-sm font-semibold cursor-pointer disabled:opacity-60"
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Status badge ────────────────────────────────────────────────────────────
function StatusBadge({ isApproved }) {
  return (
    <span className={cn(
      'inline-flex px-2 py-1 rounded-full text-xs font-medium',
      isApproved
        ? 'bg-green-100 text-green-800'
        : 'bg-yellow-100 text-yellow-800'
    )}>
      {isApproved ? 'Approved' : 'Pending'}
    </span>
  )
}

// ─── Page ────────────────────────────────────────────────────────────────────
export default function ManageTestimonials() {
  const [testimonials, setTestimonials] = useState([])
  const [loading,   setLoading]   = useState(true)
  const [updating,  setUpdating]  = useState(null)
  const [deleting,  setDeleting]  = useState(null)
  const [editItem,  setEditItem]  = useState(null)
  const [filter,    setFilter]    = useState('all') // 'all' | 'pending' | 'approved'

  const load = async () => {
    setLoading(true)
    try {
      const response = await testimonialsApi.getAll()
      // FIX: backend wraps array as { success, data: [...] }
      const list = response.data?.data || response.data || []
      setTestimonials(Array.isArray(list) ? list : [])
    } catch (err) {
      console.error('[Testimonials] Load error:', err)
      toast.error('Unable to load testimonials.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const handleApprove = async (id) => {
    setUpdating(id + 'approve')
    try {
      const data = new FormData()
      data.append('isApproved', 'true')
      await testimonialsApi.update(id, data)
      toast.success('Testimonial approved — it is now visible on the website.')
      await load()
    } catch (err) {
      toast.error('Failed to approve.')
    } finally {
      setUpdating(null)
    }
  }

  const handleReject = async (id) => {
    setUpdating(id + 'reject')
    try {
      const data = new FormData()
      data.append('isApproved', 'false')
      await testimonialsApi.update(id, data)
      toast.success('Testimonial rejected.')
      await load()
    } catch (err) {
      toast.error('Failed to reject.')
    } finally {
      setUpdating(null)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Permanently delete this testimonial?')) return
    setDeleting(id)
    try {
      await testimonialsApi.delete(id)
      toast.success('Testimonial deleted.')
      await load()
    } catch (err) {
      toast.error('Failed to delete.')
    } finally {
      setDeleting(null)
    }
  }

  const displayed = testimonials.filter((t) => {
    if (filter === 'pending')  return !t.isApproved
    if (filter === 'approved') return  t.isApproved
    return true
  })

  const pendingCount  = testimonials.filter((t) => !t.isApproved).length
  const approvedCount = testimonials.filter((t) =>  t.isApproved).length

  return (
    <Section className="bg-background min-h-[calc(100vh-4rem)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          title="Manage Testimonials"
          description="Review, approve, reject, and edit client testimonials submitted from the website."
        />

        {editItem && (
          <EditModal
            testimonial={editItem}
            onClose={() => setEditItem(null)}
            onSaved={() => { setEditItem(null); load() }}
          />
        )}

        <div className="mt-8 overflow-x-auto rounded-3xl border border-border bg-card">
          {/* Header with filter tabs */}
          <div className="p-6 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2 flex-wrap">
              {[
                { key: 'all',      label: `All (${testimonials.length})` },
                { key: 'pending',  label: `Pending (${pendingCount})` },
                { key: 'approved', label: `Approved (${approvedCount})` },
              ].map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setFilter(key)}
                  className={cn(
                    'px-4 py-1.5 rounded-full text-sm font-medium transition-colors',
                    filter === key
                      ? 'bg-gold text-charcoal'
                      : 'bg-secondary text-foreground hover:bg-gold/10'
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
            {pendingCount > 0 && (
              <span className="text-sm text-yellow-700 bg-yellow-100 px-3 py-1 rounded-full">
                {pendingCount} awaiting approval
              </span>
            )}
          </div>

          <table className="min-w-full divide-y divide-border">
            <thead className="bg-background/80 text-left text-sm uppercase tracking-[0.12em] text-muted-foreground">
              <tr>
                <th className="px-6 py-4">Client</th>
                <th className="px-6 py-4">Rating</th>
                <th className="px-6 py-4">Review</th>
                <th className="px-6 py-4">Submitted</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-10 text-center text-muted-foreground">
                    Loading testimonials...
                  </td>
                </tr>
              ) : displayed.length > 0 ? (
                displayed.map((t) => (
                  <tr key={t._id} className={!t.isApproved ? 'bg-yellow-50/20' : ''}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {/* FIX: image is {url, publicId} object */}
                        <div className="w-10 h-10 rounded-full bg-gold/10 overflow-hidden flex-shrink-0 flex items-center justify-center">
                          {t.image?.url
                            ? <img src={t.image.url} alt={t.name} className="w-full h-full object-cover" />
                            : <span className="text-gold font-semibold">{t.name?.charAt(0)}</span>
                          }
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{t.name}</p>
                          {/* FIX: field is `profession` not `designation` */}
                          <p className="text-xs text-muted-foreground">{t.profession || '—'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={cn('w-4 h-4', i < t.rating ? 'fill-gold text-gold' : 'text-muted-foreground/20')}
                          />
                        ))}
                      </div>
                    </td>
                    {/* FIX: field is `review` not `content` or `message` */}
                    <td className="px-6 py-4 text-muted-foreground max-w-xs">
                      <p className="line-clamp-2 text-sm">{t.review}</p>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground text-sm">
                      {t.createdAt
                        ? new Date(t.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
                        : '—'
                      }
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge isApproved={t.isApproved} />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 flex-wrap">
                        {/* Approve / Reject — mirroring bookings Accept/Reject pattern */}
                        {!t.isApproved ? (
                          <Button
                            size="sm"
                            variant="gold"
                            onClick={() => handleApprove(t._id)}
                            disabled={updating === t._id + 'approve'}
                          >
                            {updating === t._id + 'approve' ? '...' : 'Approve'}
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            onClick={() => handleReject(t._id)}
                            disabled={updating === t._id + 'reject'}
                          >
                            {updating === t._id + 'reject' ? '...' : 'Reject'}
                          </Button>
                        )}
                        <Button size="sm" onClick={() => setEditItem(t)}>
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(t._id)}
                          disabled={deleting === t._id}
                        >
                          {deleting === t._id ? '...' : 'Delete'}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-10 text-center text-muted-foreground">
                    {filter === 'pending'
                      ? 'No pending testimonials.'
                      : filter === 'approved'
                      ? 'No approved testimonials yet.'
                      : 'No testimonials found.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Section>
  )
}
