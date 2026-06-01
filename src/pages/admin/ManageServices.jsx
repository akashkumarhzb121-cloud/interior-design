import { useEffect, useState, useRef } from 'react'
import toast from 'react-hot-toast'
import { Section, SectionHeader } from '@/components/ui/Section'
import { Button } from '@/components/ui/Button'
import { servicesApi } from '@/api/services'
import Modal from '@/components/ui/Modal'
import { Input, Textarea } from '@/components/ui/Input'

export default function ManageServices() {
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [removing, setRemoving] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingService, setEditingService] = useState(null)
  const [form, setForm] = useState({ title: '', description: '' })
  const imageRef = useRef(null)
  const [imagePreview, setImagePreview] = useState(null)

  const loadServices = async () => {
    setLoading(true)
    try {
      const response = await servicesApi.getAll()
      setServices(response.data?.data || response.data || [])
    } catch (error) {
      console.error('[Services] Load error:', error)
      toast.error('Unable to load services.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadServices() }, [])

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this service?')) return
    setRemoving(id)
    try {
      await servicesApi.delete(id)
      toast.success('Service removed.')
      await loadServices()
    } catch (error) {
      console.error('[Services] Delete error:', error)
      toast.error('Failed to delete service.')
    } finally {
      setRemoving(null)
    }
  }

  const openCreate = () => {
    setEditingService(null)
    setForm({ title: '', description: '' })
    if (imageRef.current) imageRef.current.value = null
    setImagePreview(null)
    setIsModalOpen(true)
  }

  const openEdit = (service) => {
    setEditingService(service)
    setForm({ title: service.title || '', description: service.description || '' })
    setImagePreview(service.image?.url || null)
    setIsModalOpen(true)
  }

  const handleImageChange = (e) => {
    const f = e.target.files?.[0]
    if (!f) { setImagePreview(null); return }
    if (!f.type.startsWith('image/')) { toast.error('Only images are allowed.'); return }
    if (f.size > 5 * 1024 * 1024) { toast.error('Image must be under 5MB.'); return }
    setImagePreview(URL.createObjectURL(f))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.title.trim()) { toast.error('Title is required.'); return }
    if (!form.description.trim()) { toast.error('Description is required.'); return }

    try {
      const data = new FormData()
      data.append('title',       form.title.trim())
      data.append('description', form.description.trim())
      const file = imageRef.current?.files?.[0]
      if (file) {
        if (!file.type.startsWith('image/')) { toast.error('Only images are allowed.'); return }
        if (file.size > 5 * 1024 * 1024) { toast.error('Image must be under 5MB.'); return }
        data.append('image', file)
      }

      if (editingService) {
        await servicesApi.update(editingService._id, data)
        toast.success('Service updated.')
      } else {
        await servicesApi.create(data)
        toast.success('Service created.')
      }
      setIsModalOpen(false)
      setImagePreview(null)
      await loadServices()
    } catch (error) {
      console.error('[Services] Save error:', error)
      toast.error(error?.response?.data?.message || 'Failed to save service.')
    }
  }

  return (
    <Section className="bg-background min-h-[calc(100vh-4rem)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader title="Manage Services" description="Add, edit, and remove service offerings." />

        <div className="mt-8 overflow-x-auto rounded-3xl border border-border bg-card">
          <div className="flex items-center justify-between p-6 border-b border-border">
            <div className="text-sm text-muted-foreground">{services.length} service{services.length !== 1 ? 's' : ''}</div>
            <Button variant="gold" onClick={openCreate}>Add Service</Button>
          </div>
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-background/80 text-left text-sm uppercase tracking-[0.12em] text-muted-foreground">
              <tr>
                <th className="px-6 py-4">Service</th>
                <th className="px-6 py-4">Description</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr><td colSpan="3" className="px-6 py-10 text-center text-muted-foreground">Loading services...</td></tr>
              ) : services.length > 0 ? (
                services.map((service) => (
                  <tr key={service._id}>
                    <td className="px-6 py-4 text-foreground font-medium">{service.title}</td>
                    <td className="px-6 py-4 text-muted-foreground max-w-xs truncate">{service.description}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Button size="sm" onClick={() => openEdit(service)}>Edit</Button>
                        <Button variant="destructive" size="sm" onClick={() => handleDelete(service._id)} disabled={removing === service._id}>
                          {removing === service._id ? 'Removing...' : 'Remove'}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="3" className="px-6 py-10 text-center text-muted-foreground">No services found.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingService ? 'Edit Service' : 'Add Service'} size="md">
          <form onSubmit={handleSubmit} className="p-4 space-y-4">
            <Input id="title" label="Title *" value={form.title} onChange={(e) => setForm((s) => ({ ...s, title: e.target.value }))} required />
            <Textarea id="description" label="Description *" value={form.description} onChange={(e) => setForm((s) => ({ ...s, description: e.target.value }))} required />
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Image (optional)</label>
<label className="block cursor-pointer">
  <div className="border-2 border-dashed border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-6 text-center hover:border-yellow-600 hover:bg-yellow-100 dark:hover:bg-yellow-900/30 transition-all duration-200">
    
    <div className="text-xl mb-2">📸</div>

    <div className="font-semibold text-yellow-700 dark:text-yellow-400">
      Click Here To Upload Service Image
    </div>

    <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
      JPG, PNG, WEBP Supported
    </div>

  </div>

  <input
    ref={imageRef}
    type="file"
    accept="image/*"
    className="hidden"
    onChange={handleImageChange}
  />
</label>
              {imagePreview && (
                <div className="mt-3 w-full h-32 overflow-hidden rounded-lg bg-muted">
                  <img src={imagePreview} alt="preview" className="object-cover h-full w-full" />
                </div>
              )}
            </div>
            <div className="flex items-center justify-end gap-2">
              <Button variant="ghost" type="button" onClick={() => setIsModalOpen(false)}>Cancel</Button>
              <Button type="submit" variant="gold">{editingService ? 'Update' : 'Create'}</Button>
            </div>
          </form>
        </Modal>
      </div>
    </Section>
  )
}
