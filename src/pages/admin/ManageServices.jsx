import { useEffect, useState, useRef } from 'react'
import toast from 'react-hot-toast'
import { Section, SectionHeader } from '@/components/ui/Section'
import { Button } from '@/components/ui/Button'
import { servicesApi } from '@/api/services'
import Modal from '@/components/ui/Modal'
import { Input, Textarea } from '@/components/ui/Input'
import { X, Film, Image as ImageIcon, Upload } from 'lucide-react'

// ── Media preview strip ──────────────────────────────────────────────────────
function MediaPreviewStrip({ previews, onRemove }) {
  if (!previews.length) return null
  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {previews.map((p, i) => (
        <div key={i} className="relative group w-24 h-20 rounded-lg overflow-hidden bg-muted border border-border">
          {p.type === 'video' ? (
            <video src={p.src} className="w-full h-full object-cover" muted />
          ) : (
            <img src={p.src} alt={p.name} className="w-full h-full object-cover" />
          )}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors" />
          {/* Type badge */}
          <span className="absolute top-1 left-1 bg-black/60 text-white rounded px-1 py-0.5 text-[10px] flex items-center gap-0.5">
            {p.type === 'video' ? <Film className="w-2.5 h-2.5" /> : <ImageIcon className="w-2.5 h-2.5" />}
            {p.type}
          </span>
          {/* Remove button */}
          {onRemove && (
            <button
              type="button"
              onClick={() => onRemove(i)}
              className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="w-2.5 h-2.5" />
            </button>
          )}
        </div>
      ))}
    </div>
  )
}

// ── Upload drop zone ─────────────────────────────────────────────────────────
function MediaUploadZone({ inputRef, onChange, label = 'Images & Videos', multiple = true }) {
  return (
    <label className="block cursor-pointer">
      <div className="border-2 border-dashed border-gold/60 bg-gold/5 hover:bg-gold/10 hover:border-gold rounded-xl p-6 text-center transition-all duration-200 group">
        <div className="flex flex-col items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Upload className="w-5 h-5 text-gold" />
          </div>
          <div>
            <p className="font-semibold text-foreground text-sm">Click to upload {label}</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              JPG, PNG, WEBP, MP4, MOV, AVI — No size limits
            </p>
          </div>
          {multiple && (
            <span className="text-xs bg-gold/20 text-gold px-2 py-0.5 rounded-full">Multiple files supported</span>
          )}
        </div>
      </div>
      <input
        ref={inputRef}
        type="file"
        multiple={multiple}
        accept="image/*,video/*"
        className="hidden"
        onChange={onChange}
      />
    </label>
  )
}

// ── FIX: helper to get the first image URL from a service (admin table preview)
// Previously this read service.image?.url (legacy single-image field).
// New uploads populate service.media[] — so check that first.
function getServicePreviewUrl(service) {
  // New uploads: check media[] for first image
  const firstMediaImage = (service.media || []).find(m => !m.resourceType || m.resourceType === 'image')
  if (firstMediaImage?.url) return firstMediaImage.url
  // Legacy single image field
  if (service.image?.url) return service.image.url
  // Video fallback (show it as image thumbnail via poster-less video — handled in JSX)
  return null
}

// ── FIX: check if service has a video to show as fallback thumbnail
function getServicePreviewVideo(service) {
  if (getServicePreviewUrl(service)) return null // already have an image
  const firstVideo = (service.media || []).find(m => m.resourceType === 'video')
  return firstVideo?.url || null
}

export default function ManageServices() {
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [removing, setRemoving] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingService, setEditingService] = useState(null)
  const [form, setForm] = useState({ title: '', description: '' })
  const mediaRef = useRef(null)
  const [mediaPreviews, setMediaPreviews] = useState([])

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
      toast.error('Failed to delete service.')
    } finally {
      setRemoving(null)
    }
  }

  const openCreate = () => {
    setEditingService(null)
    setForm({ title: '', description: '' })
    if (mediaRef.current) mediaRef.current.value = null
    setMediaPreviews([])
    setIsModalOpen(true)
  }

  const openEdit = (service) => {
    setEditingService(service)
    setForm({ title: service.title || '', description: service.description || '' })
    // Show existing media
    const existing = [
      ...(service.media || []).map(m => ({ src: m.url, type: m.resourceType || 'image', name: '', existing: true, publicId: m.publicId })),
      // Fallback: legacy single image
      ...(!service.media?.length && service.image?.url ? [{ src: service.image.url, type: 'image', name: '', existing: true }] : []),
    ]
    setMediaPreviews(existing)
    setIsModalOpen(true)
  }

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

  const removePreview = (idx) => {
    setMediaPreviews(prev => prev.filter((_, i) => i !== idx))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.title.trim())       { toast.error('Title is required.');       return }
    if (!form.description.trim()) { toast.error('Description is required.'); return }

    try {
      const data = new FormData()
      data.append('title',       form.title.trim())
      data.append('description', form.description.trim())

      // Append all new (non-existing) files
      const newFiles = mediaPreviews.filter(p => p.file)
      for (const p of newFiles) {
        data.append('media', p.file)
      }

      // Tell backend which existing media to remove
      if (editingService) {
        const existingInEdit = mediaPreviews.filter(p => p.existing && p.publicId).map(p => p.publicId)
        const originalIds = [
          ...(editingService.media || []).map(m => m.publicId),
        ].filter(Boolean)
        const removedIds = originalIds.filter(id => !existingInEdit.includes(id))
        for (const id of removedIds) data.append('removeMedia', id)
      }

      if (editingService) {
        await servicesApi.update(editingService._id, data)
        toast.success('Service updated.')
      } else {
        await servicesApi.create(data)
        toast.success('Service created.')
      }
      setIsModalOpen(false)
      setMediaPreviews([])
      await loadServices()
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to save service.')
    }
  }

  return (
    <Section className="bg-background min-h-[calc(100vh-4rem)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader title="Manage Services" description="Add, edit, and remove service offerings. Upload unlimited images and videos." />

        <div className="mt-8 overflow-x-auto rounded-3xl border border-border bg-card">
          <div className="flex items-center justify-between p-6 border-b border-border">
            <div className="text-sm text-muted-foreground">{services.length} service{services.length !== 1 ? 's' : ''}</div>
            <Button variant="gold" onClick={openCreate}>Add Service</Button>
          </div>
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-background/80 text-left text-sm uppercase tracking-[0.12em] text-muted-foreground">
              <tr>
                <th className="px-6 py-4">Preview</th>
                <th className="px-6 py-4">Service</th>
                <th className="px-6 py-4">Media</th>
                <th className="px-6 py-4">Description</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr><td colSpan="5" className="px-6 py-10 text-center text-muted-foreground">Loading services...</td></tr>
              ) : services.length > 0 ? (
                services.map((service) => {
                  // FIX: use the helper that checks media[] first, then legacy image
                  const previewUrl   = getServicePreviewUrl(service)
                  const previewVideo = getServicePreviewVideo(service)
                  const totalFiles   = (service.media?.length || 0) + (service.image?.url && !service.media?.length ? 1 : 0)

                  return (
                    <tr key={service._id}>
                      <td className="px-6 py-4">
                        {previewUrl ? (
                          <div className="w-14 h-14 rounded-lg overflow-hidden bg-muted">
                            <img src={previewUrl} alt={service.title} className="w-full h-full object-cover" />
                          </div>
                        ) : previewVideo ? (
                          <div className="w-14 h-14 rounded-lg overflow-hidden bg-muted">
                            <video src={previewVideo} className="w-full h-full object-cover" muted />
                          </div>
                        ) : (
                          <div className="w-14 h-14 rounded-lg bg-muted flex items-center justify-center">
                            <ImageIcon className="w-5 h-5 text-muted-foreground" />
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-foreground font-medium">{service.title}</td>
                      <td className="px-6 py-4 text-muted-foreground text-sm">
                        {totalFiles > 0 ? (
                          <span className="flex items-center gap-1">
                            <span className="bg-gold/20 text-gold text-xs px-2 py-0.5 rounded-full">{totalFiles} file{totalFiles !== 1 ? 's' : ''}</span>
                          </span>
                        ) : '—'}
                      </td>
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
                  )
                })
              ) : (
                <tr><td colSpan="5" className="px-6 py-10 text-center text-muted-foreground">No services found.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <Modal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setMediaPreviews([]) }} title={editingService ? 'Edit Service' : 'Add Service'} size="md">
          <form onSubmit={handleSubmit} className="p-4 space-y-4">
            <Input id="title" label="Title *" value={form.title} onChange={(e) => setForm(s => ({ ...s, title: e.target.value }))} required />
            <Textarea id="description" label="Description *" value={form.description} onChange={(e) => setForm(s => ({ ...s, description: e.target.value }))} required />

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Images & Videos <span className="text-muted-foreground text-xs font-normal">(unlimited, no size limit)</span>
              </label>
              <MediaUploadZone inputRef={mediaRef} onChange={handleMediaChange} />
              <MediaPreviewStrip previews={mediaPreviews} onRemove={removePreview} />
              {mediaPreviews.length > 0 && (
                <p className="text-xs text-muted-foreground mt-2">
                  {mediaPreviews.length} file{mediaPreviews.length !== 1 ? 's' : ''} — hover to remove
                </p>
              )}
            </div>

            <div className="flex items-center justify-end gap-2">
              <Button variant="ghost" type="button" onClick={() => { setIsModalOpen(false); setMediaPreviews([]) }}>Cancel</Button>
              <Button type="submit" variant="gold">{editingService ? 'Update' : 'Create'}</Button>
            </div>
          </form>
        </Modal>
      </div>
    </Section>
  )
}
