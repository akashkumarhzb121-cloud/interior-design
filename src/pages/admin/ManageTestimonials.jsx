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
  const [form, setForm] = useState({ name: '', designation: '', content: '', rating: 5 })
  const imageRef = useRef(null)
  const [imagePreview, setImagePreview] = useState(null)

  const loadTestimonials = async () => {
    setLoading(true)
    try {
      const response = await testimonialsApi.getAll()
      setTestimonials(response.data || [])
    } catch (error) {
      console.error('[v0] Error loading testimonials:', error)
      toast.error('Unable to load testimonials.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadTestimonials()
  }, [])

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this testimonial?')) return
    setRemoving(id)
    try {
      await testimonialsApi.delete(id)
      toast.success('Testimonial removed successfully.')
      await loadTestimonials()
    } catch (error) {
      console.error('[v0] Error deleting testimonial:', error)
      toast.error('Failed to delete testimonial.')
    } finally {
      setRemoving(null)
    }
  }

  const openCreate = () => {
    setEditingTestimonial(null)
    setForm({ name: '', designation: '', content: '', rating: 5 })
    if (imageRef.current) imageRef.current.value = null
    setImagePreview(null)
    setIsModalOpen(true)
  }

  const openEdit = (t) => {
    setEditingTestimonial(t)
    setForm({ name: t.name || '', designation: t.designation || '', content: t.content || t.message || '', rating: t.rating || 5 })
    // preload existing image
    setImagePreview(t.image || t.photo || null)
    setIsModalOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (!form.name || form.name.trim().length < 2) {
        toast.error('Please enter a name.')
        return
      }
      const data = new FormData()
      data.append('name', form.name)
      data.append('designation', form.designation)
      data.append('content', form.content)
      data.append('rating', form.rating)
      const file = imageRef.current?.files?.[0]
      if (file) {
        if (!file.type.startsWith('image/')) {
          toast.error('Only images are allowed.')
          return
        }
        if (file.size > 5 * 1024 * 1024) {
          toast.error('Image must be smaller than 5MB.')
          return
        }
        data.append('image', file)
      }

      if (editingTestimonial) {
        await testimonialsApi.update(editingTestimonial._id, data)
        toast.success('Testimonial updated')
      } else {
        await testimonialsApi.create(data)
        toast.success('Testimonial created')
      }
      setIsModalOpen(false)
      setImagePreview(null)
      await loadTestimonials()
    } catch (error) {
      console.error('[v0] Error saving testimonial:', error)
      toast.error('Failed to save testimonial')
    }
  }

  const handleImageChange = (e) => {
    const f = e.target.files?.[0]
    if (!f) {
      setImagePreview(null)
      return
    }
    if (!f.type.startsWith('image/')) {
      toast.error('Only images are allowed.')
      return
    }
    if (f.size > 5 * 1024 * 1024) {
      toast.error('Image must be smaller than 5MB.')
      return
    }
    setImagePreview(URL.createObjectURL(f))
  }

  return (
    <Section className="bg-background min-h-[calc(100vh-4rem)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader title="Manage Testimonials" description="Review, approve, and remove client feedback." />

        <div className="mt-8 overflow-x-auto rounded-3xl border border-border bg-card">
          <div className="flex items-center justify-between p-6 border-b border-border">
            <div className="text-sm text-muted-foreground">Testimonials</div>
            <div>
              <Button variant="gold" onClick={openCreate}>Add Testimonial</Button>
            </div>
          </div>
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-background/80 text-left text-sm uppercase tracking-[0.12em] text-muted-foreground">
              <tr>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Message</th>
                <th className="px-6 py-4">Rating</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan="4" className="px-6 py-10 text-center text-muted-foreground">Loading testimonials...</td>
                </tr>
              ) : testimonials.length > 0 ? (
                testimonials.map((testimonial) => (
                  <tr key={testimonial._id}>
                    <td className="px-6 py-4 text-foreground font-medium">{testimonial.name}</td>
                    <td className="px-6 py-4 text-muted-foreground">{testimonial.content || testimonial.message}</td>
                    <td className="px-6 py-4 text-muted-foreground">{testimonial.rating || '—'}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Button size="sm" onClick={() => openEdit(testimonial)}>Edit</Button>
                        <Button variant="destructive" size="sm" onClick={() => handleDelete(testimonial._id)} disabled={removing === testimonial._id}>
                          {removing === testimonial._id ? 'Removing...' : 'Remove'}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="px-6 py-10 text-center text-muted-foreground">No testimonials found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingTestimonial ? 'Edit Testimonial' : 'Add Testimonial'} size="md">
          <form onSubmit={handleSubmit} className="p-4 space-y-4">
            <Input id="name" label="Name" value={form.name} onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))} required />
            <Input id="designation" label="Designation" value={form.designation} onChange={(e) => setForm((s) => ({ ...s, designation: e.target.value }))} />
            <Textarea id="content" label="Message" value={form.content} onChange={(e) => setForm((s) => ({ ...s, content: e.target.value }))} />
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Rating</label>
              <select value={form.rating} onChange={(e) => setForm((s) => ({ ...s, rating: Number(e.target.value) }))} className="w-32 rounded-lg border border-input px-3 py-2">
                {[5,4,3,2,1].map((r) => <option key={r} value={r}>{r} Star{r>1?'s':''}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Image</label>
              <input ref={imageRef} type="file" accept="image/*" className="w-full" onChange={handleImageChange} />
              {imagePreview && (
                <div className="mt-3 w-32 h-32 overflow-hidden rounded-lg bg-muted">
                  <img src={imagePreview} alt="preview" className="object-cover h-full w-full" />
                </div>
              )}
            </div>
            <div className="flex items-center justify-end gap-2">
              <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
              <Button type="submit" variant="gold">{editingTestimonial ? 'Update' : 'Create'}</Button>
            </div>
          </form>
        </Modal>
      </div>
    </Section>
  )
}
