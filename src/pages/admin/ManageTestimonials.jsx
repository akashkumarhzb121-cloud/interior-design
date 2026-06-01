import { useEffect, useState, useRef } from 'react'
import toast from 'react-hot-toast'
import { Star } from 'lucide-react'
import { Section, SectionHeader } from '@/components/ui/Section'
import { Button } from '@/components/ui/Button'
import { testimonialsApi } from '@/api/services'
import { cn } from '@/lib/utils'

// ─── Create / Edit Modal ──────────────────────────────────────────────────────
function TestimonialModal({ testimonial, onClose, onSaved }) {
  const isEdit = !!testimonial
  const [form, setForm] = useState({
    name:       testimonial?.name       || '',
    profession: testimonial?.profession || '',
    review:     testimonial?.review     || '',
    rating:     testimonial?.rating     || 5,
  })
  const [saving,     setSaving]     = useState(false)
  const [hoverStar,  setHoverStar]  = useState(0)
  const [imgPreview, setImgPreview] = useState(testimonial?.image?.url || null)
  const imageRef = useRef(null)

  const handleSave = async () => {
    if (!form.name.trim())   { toast.error('Name is required.');   return }
    if (!form.review.trim()) { toast.error('Review is required.'); return }

    setSaving(true)
    try {
      const data = new FormData()
      data.append('name',       form.name.trim())
      data.append('profession', form.profession.trim())
      data.append('review',     form.review.trim())
      data.append('rating',     form.rating)

      const file = imageRef.current?.files?.[0]
      if (file) data.append('image', file)

      if (isEdit) {
        data.append('isApproved', testimonial.isApproved ? 'true' : 'false')
        await testimonialsApi.update(testimonial._id, data)
        toast.success('Testimonial updated.')
      } else {
        // FIX: use createByAdmin so admin-added testimonials are live immediately
        await testimonialsApi.createByAdmin(data)
        toast.success('Testimonial published to the website.')
      }
      onSaved()
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to save. Please try again.')
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
        background: 'var(--card,#fff)', borderRadius: '1rem', padding: '1.75rem',
        width: '100%', maxWidth: '520px', border: '1px solid var(--border)',
        boxShadow: '0 20px 60px rgba(0,0,0,0.2)', maxHeight: '90vh', overflowY: 'auto',
      }}>
        <h2 style={{ margin: '0 0 1.25rem', fontSize: '1.1rem', fontWeight: 600, color: 'var(--foreground)' }}>
          {isEdit ? 'Edit Testimonial' : 'Add Testimonial'}
        </h2>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {[
              { id: 'name',       label: 'Name *',     val: form.name },
              { id: 'profession', label: 'Profession', val: form.profession },
            ].map(({ id, label, val }) => (
              <div key={id}>
                <label className="block text-sm font-medium text-foreground mb-1">{label}</label>
                <input
                  value={val}
                  onChange={set(id)}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm outline-none focus:border-gold transition-colors"
                />
              </div>
            ))}
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Rating</label>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, rating: s }))}
                  onMouseEnter={() => setHoverStar(s)}
                  onMouseLeave={() => setHoverStar(0)}
                >
                  <Star className={cn(
                    'w-7 h-7 transition-colors',
                    s <= (hoverStar || form.rating) ? 'fill-gold text-gold' : 'text-muted-foreground/25'
                  )} />
                </button>
              ))}
              <span className="ml-2 text-sm text-muted-foreground">
                {['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent'][hoverStar || form.rating]}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Review *</label>
            <textarea
              value={form.review}
              onChange={set('review')}
              rows={4}
              placeholder="Client's review text..."
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm outline-none resize-none focus:border-gold transition-colors"
            />
            <p className="text-xs text-muted-foreground text-right mt-0.5">{form.review.length}/1000</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Photo (optional)</label>
            {imgPreview && (
              <div className="mb-2 w-14 h-14 rounded-full overflow-hidden bg-muted">
                <img src={imgPreview} alt="preview" className="w-full h-full object-cover" />
              </div>
            )}
<label className="block cursor-pointer">
  <div className="border-2 border-dashed border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-5 text-center hover:border-yellow-600 transition-all">
    <div className="font-semibold text-yellow-600">
      📸 Click Here To Upload Image
    </div>
    <div className="text-sm text-muted-foreground">
      JPG, PNG, WEBP Supported
    </div>
  </div>

  <input
    ref={imageRef}
    type="file"
    accept="image/*"
    className="hidden"
    onChange={(e) => {
      const f = e.target.files?.[0]
      if (f) setImgPreview(URL.createObjectURL(f))
    }}
  />
</label>
          </div>
        </div>

        <div className="flex gap-2 justify-end mt-5">
          <button
            onClick={onClose}
            style={{
              padding: '0.5rem 1rem', borderRadius: '0.5rem',
              border: '1px solid var(--border)', background: 'transparent',
              color: 'var(--foreground)', cursor: 'pointer', fontSize: '0.875rem',
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              padding: '0.5rem 1.25rem', borderRadius: '0.5rem',
              background: '#D4AF37', border: 'none', color: '#1a1a1a',
              cursor: saving ? 'not-allowed' : 'pointer',
              fontWeight: 600, fontSize: '0.875rem', opacity: saving ? 0.65 : 1,
            }}
          >
            {saving ? 'Saving...' : isEdit ? 'Save Changes' : 'Create & Publish'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function ManageTestimonials() {
  const [testimonials, setTestimonials] = useState([])
  const [loading,   setLoading]   = useState(true)
  const [updating,  setUpdating]  = useState(null)
  const [deleting,  setDeleting]  = useState(null)
  const [modalItem, setModalItem] = useState(undefined) // undefined=closed | null=create | obj=edit
  const [filter,    setFilter]    = useState('all')

  const load = async () => {
    setLoading(true)
    try {
      const response = await testimonialsApi.getAll()
      // FIX: axios interceptor sends admin_token in Authorization header automatically
      // Backend optionalAuth middleware decodes it → req.user set → returns ALL testimonials
      // response.data = { success, data: [...] }  →  array at response.data.data
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
    setUpdating(id + '_a')
    try {
      const data = new FormData()
      data.append('isApproved', 'true')
      await testimonialsApi.update(id, data)
      toast.success('Approved — now visible on the website.')
      await load()
    } catch { toast.error('Failed to approve.') }
    finally  { setUpdating(null) }
  }

  const handleReject = async (id) => {
    setUpdating(id + '_r')
    try {
      const data = new FormData()
      data.append('isApproved', 'false')
      await testimonialsApi.update(id, data)
      toast.success('Unpublished — hidden from the website.')
      await load()
    } catch { toast.error('Failed to unpublish.') }
    finally  { setUpdating(null) }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Permanently delete this testimonial?')) return
    setDeleting(id)
    try {
      await testimonialsApi.delete(id)
      toast.success('Deleted.')
      await load()
    } catch { toast.error('Failed to delete.') }
    finally  { setDeleting(null) }
  }

  const pendingCount  = testimonials.filter((t) => !t.isApproved).length
  const approvedCount = testimonials.filter((t) =>  t.isApproved).length

  const displayed = testimonials.filter((t) => {
    if (filter === 'pending')  return !t.isApproved
    if (filter === 'approved') return  t.isApproved
    return true
  })

  return (
    <Section className="bg-background min-h-[calc(100vh-4rem)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          title="Manage Testimonials"
          description="Approve user-submitted reviews and manage all client testimonials."
        />

        {modalItem !== undefined && (
          <TestimonialModal
            testimonial={modalItem}
            onClose={() => setModalItem(undefined)}
            onSaved={() => { setModalItem(undefined); load() }}
          />
        )}

        <div className="mt-8 overflow-x-auto rounded-3xl border border-border bg-card">
          {/* Header */}
          <div className="p-6 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2 flex-wrap">
              {[
                { key: 'all',      label: `All (${testimonials.length})` },
                { key: 'pending',  label: `Pending (${pendingCount})` },
                { key: 'approved', label: `Published (${approvedCount})` },
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
              {pendingCount > 0 && (
                <span className="text-xs text-yellow-800 bg-yellow-100 px-3 py-1 rounded-full">
                  {pendingCount} awaiting approval
                </span>
              )}
            </div>
            <Button variant="gold" onClick={() => setModalItem(null)}>
              + Add Testimonial
            </Button>
          </div>

          <table className="min-w-full divide-y divide-border">
            <thead className="bg-background/80 text-left text-sm uppercase tracking-[0.12em] text-muted-foreground">
              <tr>
                <th className="px-6 py-4">Client</th>
                <th className="px-6 py-4">Rating</th>
                <th className="px-6 py-4">Review</th>
                <th className="px-6 py-4">Date</th>
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

                    {/* Client */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gold/10 overflow-hidden flex-shrink-0 flex items-center justify-center">
                          {t.image?.url
                            ? <img src={t.image.url} alt={t.name} className="w-full h-full object-cover" />
                            : <span className="text-gold font-semibold text-sm">{t.name?.charAt(0)}</span>
                          }
                        </div>
                        <div>
                          <p className="font-medium text-foreground text-sm">{t.name}</p>
                          {/* FIX: correct field name is `profession` not `designation` */}
                          <p className="text-xs text-muted-foreground">{t.profession || '—'}</p>
                        </div>
                      </div>
                    </td>

                    {/* Rating */}
                    <td className="px-6 py-4">
                      <div className="flex gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className={cn(
                            'w-4 h-4',
                            i < t.rating ? 'fill-gold text-gold' : 'text-muted-foreground/20'
                          )} />
                        ))}
                      </div>
                    </td>

                    {/* Review — FIX: correct field is `review` not `content` */}
                    <td className="px-6 py-4 max-w-xs">
                      <p className="text-sm text-muted-foreground line-clamp-2">{t.review}</p>
                    </td>

                    {/* Date */}
                    <td className="px-6 py-4 text-sm text-muted-foreground whitespace-nowrap">
                      {t.createdAt
                        ? new Date(t.createdAt).toLocaleDateString('en-IN', {
                            day: '2-digit', month: 'short', year: 'numeric',
                          })
                        : '—'
                      }
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">
                      <span className={cn(
                        'inline-flex px-2 py-1 rounded-full text-xs font-medium',
                        t.isApproved
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      )}>
                        {t.isApproved ? 'Published' : 'Pending'}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 flex-wrap">
                        {!t.isApproved ? (
                          <Button
                            size="sm"
                            variant="gold"
                            onClick={() => handleApprove(t._id)}
                            disabled={updating === t._id + '_a'}
                          >
                            {updating === t._id + '_a' ? '...' : 'Approve'}
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            onClick={() => handleReject(t._id)}
                            disabled={updating === t._id + '_r'}
                          >
                            {updating === t._id + '_r' ? '...' : 'Unpublish'}
                          </Button>
                        )}
                        <Button size="sm" onClick={() => setModalItem(t)}>
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
                    {filter === 'pending'  ? 'No pending testimonials — all caught up!' :
                     filter === 'approved' ? 'No published testimonials yet.' :
                     'No testimonials yet. Add one or wait for user submissions.'}
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
