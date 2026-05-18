import { useEffect, useState } from 'react'
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

  const loadServices = async () => {
    setLoading(true)
    try {
      const response = await servicesApi.getAll()
      setServices(response.data || [])
    } catch (error) {
      console.error('[v0] Error loading services:', error)
      toast.error('Unable to load services.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadServices()
  }, [])

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this service?')) return
    setRemoving(id)
    try {
      await servicesApi.delete(id)
      toast.success('Service removed successfully.')
      await loadServices()
    } catch (error) {
      console.error('[v0] Error deleting service:', error)
      toast.error('Failed to delete service.')
    } finally {
      setRemoving(null)
    }
  }

  const openCreate = () => {
    setEditingService(null)
    setForm({ title: '', description: '' })
    setIsModalOpen(true)
  }

  const openEdit = (service) => {
    setEditingService(service)
    setForm({ title: service.title || '', description: service.description || '' })
    setIsModalOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingService) {
        await servicesApi.update(editingService._id, { title: form.title, description: form.description })
        toast.success('Service updated')
      } else {
        await servicesApi.create({ title: form.title, description: form.description })
        toast.success('Service created')
      }
      setIsModalOpen(false)
      await loadServices()
    } catch (error) {
      console.error('[v0] Error saving service:', error)
      toast.error('Failed to save service')
    }
  }

  return (
    <Section className="bg-background min-h-[calc(100vh-4rem)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader title="Manage Services" description="Update and remove existing service offerings." />

        <div className="mt-8 overflow-x-auto rounded-3xl border border-border bg-card">
          <div className="flex items-center justify-between p-6 border-b border-border">
            <div className="text-sm text-muted-foreground">Service offerings</div>
            <div>
              <Button variant="gold" onClick={openCreate}>Add Service</Button>
            </div>
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
                <tr>
                  <td colSpan="3" className="px-6 py-10 text-center text-muted-foreground">Loading services...</td>
                </tr>
              ) : services.length > 0 ? (
                services.map((service) => (
                  <tr key={service._id}>
                    <td className="px-6 py-4 text-foreground font-medium">{service.title}</td>
                    <td className="px-6 py-4 text-muted-foreground">{service.description}</td>
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
                <tr>
                  <td colSpan="3" className="px-6 py-10 text-center text-muted-foreground">No services found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingService ? 'Edit Service' : 'Add Service'} size="md">
          <form onSubmit={handleSubmit} className="p-4 space-y-4">
            <Input id="title" label="Title" value={form.title} onChange={(e) => setForm((s) => ({ ...s, title: e.target.value }))} required />
            <Textarea id="description" label="Description" value={form.description} onChange={(e) => setForm((s) => ({ ...s, description: e.target.value }))} />
            <div className="flex items-center justify-end gap-2">
              <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
              <Button type="submit" variant="gold">{editingService ? 'Update' : 'Create'}</Button>
            </div>
          </form>
        </Modal>
      </div>
    </Section>
  )
}
