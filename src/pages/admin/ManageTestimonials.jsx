import { useEffect, useState, useRef } from 'react'
import toast from 'react-hot-toast'
import { Star, Upload, X, Film, Image as ImageIcon } from 'lucide-react'
import { Section, SectionHeader } from '@/components/ui/Section'
import { Button } from '@/components/ui/Button'
import { testimonialsApi } from '@/api/services'
import { cn } from '@/lib/utils'

function MediaPreviewStrip({ previews, onRemove }) {
  if (!previews.length) return null
  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {previews.map((p, i) => (
        <div key={i} className="relative group w-20 h-16 rounded-lg overflow-hidden bg-muted border border-border">
          {p.type === 'video' ? (
            <video src={p.src} className="w-full h-full object-cover" muted />
          ) : (
            <img src={p.src} alt="" className="w-full h-full object-cover" />
          )}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors" />
          <span className="absolute top-0.5 left-0.5 bg-black/60 text-white rounded px-1 py-0 text-[9px] flex items-center gap-0.5">
            {p.type === 'video' ? <Film className="w-2 h-2" /> : <ImageIcon className="w-2 h-2" />}
            {p.type}
          </span>
          {onRemove && (
            <button
              type="button"
              onClick={() => onRemove(i)}
              className="absolute top-0.5 right-0.5 bg-red-500 text-white rounded-full w-3.5 h-3.5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="w-2 h-2" />
            </button>
          )}
        </div>
      ))}
    </div>
  )
}

function TestimonialModal({ testimonial, onClose, onSaved }) {
  const isEdit = !!testimonial
  const [form, setForm] = useState({
    name:       testimonial?.name       || '',
    profession: testimonial?.profession || '',
    review:     testimonial?.review     || '',
    rating:     testimonial?.rating     || 5,
  })
  const [saving,    setSaving]    = useState(false)
  const [hoverStar, setHoverStar] = useState(0)
  const mediaRef = useRef(null)
  const [mediaPreviews, setMediaPreviews] = useState(() => {
    const existing = []
    if (testimonial?.media?.length) {
      existing.push(...testimonial.media.map(m => ({ src: m.url, type: m.resourceType || 'image', existing: true, publicId: m.publicId })))
    } else if (testimonial?.image?.url) {
      existing.push({ src: testimonial.image.url, type: 'image', existing: true, publicId: testimonial.image.publicId })
    }
    return existing
  })

  const handleMediaChange = (e) => {
    const files = Array.from(e.target.files || [])
    if (!files.length) return
    const newPreviews = files.map(f => ({
      src:  URL.createObjectURL(f),
      type: f.type.startsWith('video/') ? 'video' : 'image',
      name: f.name,
      file: f,
    }))
    setMediaPreviews(prev => [...prev, ...newPreviews])
  }

  const removePreview = (idx) => setMediaPreviews(prev => prev.filter((_, i) => i !== idx))

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

      const newFiles = mediaPreviews.filter(p => p.file)
      for (const p of newFiles) data.append('media', p.file)

      if (isEdit) {
        data.append('isApproved', testimonial.isApproved ? 'true' : 'false')
        // Send removed media public IDs
        const keptIds = mediaPreviews.filter(p => p.existing && p.publicId).map(p => p.publicId)
        const allMedia = [...(testimonial.media || []), ...(testimonial.image?.publicId ? [testimonial.image] : [])]
        const removedIds = allMedia.map(m => m.publicId).filter(id => id && !keptIds.includes(id))
        for (const id of removedIds) data.append('removeMedia', id)
        await testimonialsApi.update(testimonial._id, data)
        toast.success('Testimonial updated.')
      } else {
        await testimonialsApi.createByAdmin(data)
        toast.success('Testimonial published.')
      }
      onSaved()
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to save.')
    } finally {
      setSaving(false)
    }
  }

  const set = (field) => (e) => setForm(s => ({ ...s, [field]: e.target.value }))

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div style={{ background: 'var(--card,#fff)', borderRadius: '1rem', padding: '1.75rem', width: '100%', maxWidth: '560px', border: '1px solid var(--border)', boxShadow: '0 20px 60px rgba(0,0,0,0.2)', maxHeight: '90vh', overflowY: 'auto' }}>
        <h2 style={{ margin: '0 0 1.25rem', fontSize: '1.1rem', fontWeight: 600, color: 'var(--foreground)' }}>
          {isEdit ? 'Edit Testimonial' : 'Add Testimonial'}
        </h2>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {[
              { id: 'name', label: 'Name *', val: form.name },
              { id: 'profession', label: 'Profession', val: form.profession },
            ].map(({ id, label, val }) => (
              <div key={id}>
                <label className="block text-sm font-medium text-foreground mb-1">{label}</label>
                <input value={val} onChange={set(id)} className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm outline-none focus:border-gold transition-colors" />
              </div>
            ))}
          </div>

          {/* Star rating */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Rating</label>
            <div className="flex items-center gap-1">
              {[1,2,3,4,5].map(s => (
                <button key={s} type="button" onClick={() => setForm(f => ({ ...f, rating: s }))} onMouseEnter={() => setHoverStar(s)} onMouseLeave={() => setHoverStar(0)}>
                  <Star className={cn('w-7 h-7 transition-colors', s <= (hoverStar || form.rating) ? 'fill-gold text-gold' : 'text-muted-foreground/25')} />
                </button>
              ))}
              <span className="ml-2 text-sm text-muted-foreground">{['','Poor','Fair','Good','Great','Excellent'][hoverStar || form.rating]}</span>
            </div>
          </div>

          {/* Review */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Review *</label>
            <textarea value={form.review} onChange={set('review')} rows={4} placeholder="Client's review..." className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm outline-none resize-none focus:border-gold transition-colors" />
            <p className="text-xs text-muted-foreground text-right mt-0.5">{form.review.length}/1000</p>
          </div>

          {/* Media upload */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Photos & Videos <span className="text-muted-foreground text-xs font-normal">(unlimited, no size limit)</span>
            </label>
            <label className="block cursor-pointer">
              <div className="border-2 border-dashed border-gold/60 bg-gold/5 hover:bg-gold/10 hover:border-gold rounded-xl p-5 text-center transition-all duration-200 group">
                <div className="flex flex-col items-center gap-1.5">
                  <div className="w-9 h-9 rounded-full bg-gold/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Upload className="w-4 h-4 text-gold" />
                  </div>
                  <p className="font-semibold text-foreground text-sm">Upload Photos & Videos</p>
                  <p className="text-xs text-muted-foreground">JPG, PNG, WEBP, MP4, MOV — Multiple files · No size limit</p>
                </div>
              </div>
              <input ref={mediaRef} type="file" multiple accept="image/*,video/*" className="hidden" onChange={handleMediaChange} />
            </label>
            <MediaPreviewStrip previews={mediaPreviews} onRemove={removePreview} />
            {mediaPreviews.length > 0 && (
              <p className="text-xs text-muted-foreground mt-1.5">{mediaPreviews.length} file{mediaPreviews.length !== 1 ? 's' : ''} (hover to remove)</p>
            )}
          </div>
        </div>

        <div className="flex gap-2 justify-end mt-5">
          <button onClick={onClose} style={{ padding: '0.5rem 1rem', borderRadius: '0.5rem', border: '1px solid var(--border)', background: 'transparent', color: 'var(--foreground)', cursor: 'pointer', fontSize: '0.875rem' }}>
            Cancel
          </button>
          <button onClick={handleSave} disabled={saving} style={{ padding: '0.5rem 1.25rem', borderRadius: '0.5rem', background: '#D4AF37', border: 'none', color: '#1a1a1a', cursor: saving ? 'not-allowed' : 'pointer', fontWeight: 600, fontSize: '0.875rem', opacity: saving ? 0.65 : 1 }}>
            {saving ? 'Saving...' : isEdit ? 'Save Changes' : 'Create & Publish'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function ManageTestimonials() {
  const [testimonials, setTestimonials] = useState([])
  const [loading,  setLoading]  = useState(true)
  const [updating, setUpdating] = useState(null)
  const [deleting, setDeleting] = useState(null)
  const [modalItem, setModalItem] = useState(undefined)
  const [filter, setFilter] = useState('all')

  const load = async () => {
    setLoading(true)
    try {
      const response = await testimonialsApi.getAll()
      const list = response.data?.data || response.data || []
      setTestimonials(Array.isArray(list) ? list : [])
    } catch {
      toast.error('Unable to load testimonials.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const handleApprove = async (id) => {
    setUpdating(id + '_a')
    try {
      const data = new FormData(); data.append('isApproved', 'true')
      await testimonialsApi.update(id, data)
      toast.success('Approved — now visible on the website.')
      await load()
    } catch { toast.error('Failed to approve.') }
    finally  { setUpdating(null) }
  }

  const handleReject = async (id) => {
    setUpdating(id + '_r')
    try {
      const data = new FormData(); data.append('isApproved', 'false')
      await testimonialsApi.update(id, data)
      toast.success('Unpublished.')
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

  const pendingCount  = testimonials.filter(t => !t.isApproved).length
  const approvedCount = testimonials.filter(t =>  t.isApproved).length
  const displayed = testimonials.filter(t => {
    if (filter === 'pending')  return !t.isApproved
    if (filter === 'approved') return  t.isApproved
    return true
  })

  return (
    <Section className="bg-background min-h-[calc(100vh-4rem)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader title="Manage Testimonials" description="Approve reviews and manage client testimonials. Upload unlimited photos and videos per testimonial." />

        {modalItem !== undefined && (
          <TestimonialModal
            testimonial={modalItem}
            onClose={() => setModalItem(undefined)}
            onSaved={() => { setModalItem(undefined); load() }}
          />
        )}

        <div className="mt-8 overflow-x-auto rounded-3xl border border-border bg-card">
          <div className="p-6 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2 flex-wrap">
              {[
                { key: 'all',      label: `All (${testimonials.length})` },
                { key: 'pending',  label: `Pending (${pendingCount})` },
                { key: 'approved', label: `Published (${approvedCount})` },
              ].map(({ key, label }) => (
                <button key={key} onClick={() => setFilter(key)} className={cn('px-4 py-1.5 rounded-full text-sm font-medium transition-colors', filter === key ? 'bg-gold text-charcoal' : 'bg-secondary text-foreground hover:bg-gold/10')}>
                  {label}
                </button>
              ))}
              {pendingCount > 0 && (
                <span className="text-xs text-yellow-800 bg-yellow-100 px-3 py-1 rounded-full">{pendingCount} awaiting approval</span>
              )}
            </div>
            <Button variant="gold" onClick={() => setModalItem(null)}>+ Add Testimonial</Button>
          </div>

          <table className="min-w-full divide-y divide-border">
            <thead className="bg-background/80 text-left text-sm uppercase tracking-[0.12em] text-muted-foreground">
              <tr>
                <th className="px-6 py-4">Client</th>
                <th className="px-6 py-4">Rating</th>
                <th className="px-6 py-4">Review</th>
                <th className="px-6 py-4">Media</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr><td colSpan="7" className="px-6 py-10 text-center text-muted-foreground">Loading testimonials...</td></tr>
              ) : displayed.length > 0 ? (
                displayed.map((t) => (
                  <tr key={t._id} className={!t.isApproved ? 'bg-yellow-50/20' : ''}>
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
                          <p className="text-xs text-muted-foreground">{t.profession || '—'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className={cn('w-4 h-4', i < t.rating ? 'fill-gold text-gold' : 'text-muted-foreground/20')} />
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 max-w-xs">
                      <p className="text-sm text-muted-foreground line-clamp-2">{t.review}</p>
                    </td>
                    <td className="px-6 py-4">
                      {t.media?.length > 0 ? (
                        <div className="flex items-center gap-1">
                          <span className="bg-gold/20 text-gold text-xs px-2 py-0.5 rounded-full">
                            {t.media.length} file{t.media.length !== 1 ? 's' : ''}
                          </span>
                        </div>
                      ) : t.image?.url ? (
                        <span className="bg-gold/20 text-gold text-xs px-2 py-0.5 rounded-full">1 image</span>
                      ) : <span className="text-muted-foreground text-sm">—</span>}
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground whitespace-nowrap">
                      {t.createdAt ? new Date(t.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn('inline-flex px-2 py-1 rounded-full text-xs font-medium', t.isApproved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800')}>
                        {t.isApproved ? 'Published' : 'Pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 flex-wrap">
                        {!t.isApproved ? (
                          <Button size="sm" variant="gold" onClick={() => handleApprove(t._id)} disabled={updating === t._id + '_a'}>
                            {updating === t._id + '_a' ? '...' : 'Approve'}
                          </Button>
                        ) : (
                          <Button size="sm" onClick={() => handleReject(t._id)} disabled={updating === t._id + '_r'}>
                            {updating === t._id + '_r' ? '...' : 'Unpublish'}
                          </Button>
                        )}
                        <Button size="sm" onClick={() => setModalItem(t)}>Edit</Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDelete(t._id)} disabled={deleting === t._id}>
                          {deleting === t._id ? '...' : 'Delete'}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="px-6 py-10 text-center text-muted-foreground">
                    {filter === 'pending' ? 'No pending testimonials!' : filter === 'approved' ? 'No published testimonials yet.' : 'No testimonials yet.'}
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
