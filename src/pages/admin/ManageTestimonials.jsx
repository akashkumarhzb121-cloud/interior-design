import { useEffect, useState, useRef } from 'react'
import toast from 'react-hot-toast'
import { Section, SectionHeader } from '@/components/ui/Section'
import { Button } from '@/components/ui/Button'
import { testimonialsApi } from '@/api/services'
import Modal from '@/components/ui/Modal'
import { Input, Textarea } from '@/components/ui/Input'

export default function ManageTestimonials() {
  const [testimonials, setTestimonials] = useState([])
  const [loading, setLoading] = useState(true)
  const [removing, setRemoving] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTestimonial, setEditingTestimonial] = useState(null)
  const [form, setForm] = useState({ name: '', profession: '', review: '', rating: 5 })
  const imageRef = useRef(null)
  const [imagePreview, setImagePreview] = useState(null)

  const loadTestimonials = async () => {
    setLoading(true)
    try {
      const response = await testimonialsApi.getAll()
      // FIX: backend wraps array inside response.data.data (sendResponse util)
      setTestimonials(response.data?.data || response.data || [])
    } catch (error) {
      console.error('[Testimonials] Load error:', error)
      toast.error('Unable to load testimonials.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadTestimonials() }, [])

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this testimonial?')) return
    setRemoving(id)
    try {
      await testimonialsApi.delete(id)
      toast.success('Testimonial removed.')
      await loadTestimonials()
    } catch (error) {
      console.error('[Testimonials] Delete error:', error)
      toast.error('Failed to delete testimonial.')
    } finally {
      setRemoving(null)
    }
  }

  const openCreate = () => {
    setEditingTestimonial(null)
    setForm({ name: '', profession: '', review: '', rating: 5 })
    if (imageRef.current) imageRef.current.value = null
    setImagePreview(null)
    setIsModalOpen(true)
  }

  const openEdit = (t) => {
    setEditingTestimonial(t)
    setForm({
      name:       t.name       || '',
      profession: t.profession || '',
      review:     t.review     || '',
      rating:     t.rating     || 5,
    })
    // FIX: image is an object {url, publicId}, not a plain string
    setImagePreview(t.image?.url || null)
    setIsModalOpen(true)
  }

  const handleImageChange = (e) => {
    const f = e.target.files?.[0]
    if (!f) { setImagePreview(null); return }
    if (!f.type.startsWith('image/')) { toast.error('Only images are allowed.'); return }
    setImagePreview(URL.createObjectURL(f))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) { toast.error('Name is required.'); return }
    if (!form.review.trim()) { toast.error('Review is required.'); return }

    try {
      const data = new FormData()
      data.append('name',       form.name.trim())
      data.append('profession', form.profession.trim())
      data.append('review',     form.review.trim())
      data.append('rating',     form.rating)
      data.append('isApproved', 'true')   // admin-created testimonials are auto-approved

      const file = imageRef.current?.files?.[0]
      if (file) {
        if (!file.type.startsWith('image/')) { toast.error('Only images are allowed.'); return }
        data.append('image', file)
      }

      if (editingTestimonial) {
        await testimonialsApi.update(editingTestimonial._id, data)
        toast.success('Testimonial updated.')
      } else {
        await testimonialsApi.create(data)
        toast.success('Testimonial created.')
      }
      setIsModalOpen(false)
      setImagePreview(null)
      await loadTestimonials()
    } catch (error) {
      console.error('[Testimonials] Save error:', error)
      toast.error(error?.response?.data?.message || 'Failed to save testimonial.')
    }
  }

  return (
    <Section className="bg-background min-h-[calc(100vh-4rem)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader title="Manage Testimonials" description="Add, edit, and remove client feedback." />

        <div className="mt-8 overflow-x-auto rounded-3xl border border-border bg-card">
          <div className="flex items-center justify-between p-6 border-b border-border">
            <div className="text-sm text-muted-foreground">{testimonials.length} testimonial{testimonials.length !== 1 ? 's' : ''}</div>
            <Button variant="gold" onClick={openCreate}>Add Testimonial</Button>
          </div>
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-background/80 text-left text-sm uppercase tracking-[0.12em] text-muted-foreground">
              <tr>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Profession</th>
                <th className="px-6 py-4">Review</th>
                <th className="px-6 py-4">Rating</th>
                <th className="px-6 py-4">Approved</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr><td colSpan="6" className="px-6 py-10 text-center text-muted-foreground">Loading testimonials...</td></tr>
              ) : testimonials.length > 0 ? (
                testimonials.map((t) => (
                  <tr key={t._id}>
                    <td className="px-6 py-4 text-foreground font-medium">{t.name}</td>
                    <td className="px-6 py-4 text-muted-foreground">{t.profession || '—'}</td>
                    <td className="px-6 py-4 text-muted-foreground max-w-xs truncate">{t.review}</td>
                    <td className="px-6 py-4 text-muted-foreground">{t.rating} ★</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${t.isApproved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {t.isApproved ? 'Approved' : 'Pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Button size="sm" onClick={() => openEdit(t)}>Edit</Button>
                        <Button variant="destructive" size="sm" onClick={() => handleDelete(t._id)} disabled={removing === t._id}>
                          {removing === t._id ? 'Removing...' : 'Remove'}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="6" className="px-6 py-10 text-center text-muted-foreground">No testimonials found.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingTestimonial ? 'Edit Testimonial' : 'Add Testimonial'} size="md">
          <form onSubmit={handleSubmit} className="p-4 space-y-4">
            <Input id="name" label="Name" value={form.name} onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))} required />
            <Input id="profession" label="Profession / Designation" value={form.profession} onChange={(e) => setForm((s) => ({ ...s, profession: e.target.value }))} />
            <Textarea id="review" label="Review" value={form.review} onChange={(e) => setForm((s) => ({ ...s, review: e.target.value }))} required />
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Rating</label>
              <select value={form.rating} onChange={(e) => setForm((s) => ({ ...s, rating: Number(e.target.value) }))} className="w-32 rounded-lg border border-input px-3 py-2 bg-background text-foreground">
                {[5, 4, 3, 2, 1].map((r) => <option key={r} value={r}>{r} Star{r > 1 ? 's' : ''}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Photo (optional)</label>
              <input ref={imageRef} type="file" accept="image/*" className="w-full" onChange={handleImageChange} />
              {imagePreview && (
                <div className="mt-3 w-20 h-20 overflow-hidden rounded-full bg-muted">
                  <img src={imagePreview} alt="preview" className="object-cover h-full w-full" />
                </div>
              )}
            </div>
            <div className="flex items-center justify-end gap-2">
              <Button variant="ghost" type="button" onClick={() => setIsModalOpen(false)}>Cancel</Button>
              <Button type="submit" variant="gold">{editingTestimonial ? 'Update' : 'Create'}</Button>
            </div>
          </form>
        </Modal>
      </div>
    </Section>
  )
}
