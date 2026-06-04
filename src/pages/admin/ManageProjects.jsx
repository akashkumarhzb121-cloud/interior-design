import { useEffect, useState, useRef } from 'react'
import toast from 'react-hot-toast'
import { Section, SectionHeader } from '@/components/ui/Section'
import { Button } from '@/components/ui/Button'
import { projectsApi } from '@/api/services'
import Modal from '@/components/ui/Modal'
import { Input, Textarea } from '@/components/ui/Input'
import { X, Film, Image as ImageIcon, Upload, Star } from 'lucide-react'
import { cn } from '@/lib/utils'

const CATEGORIES = ['Residential', 'Commercial', 'Office', 'Hospitality', 'Retail', 'Other']

// ── Preview strip shown inside the modal ────────────────────────────────────
function MediaPreviewStrip({ previews, onRemove }) {
  if (!previews.length) return null
  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {previews.map((p, i) => (
        <div key={i} className="relative group w-24 h-20 rounded-lg overflow-hidden bg-muted border border-border">
          {/* Use <video> for videos, <img> for images */}
          {p.type === 'video' ? (
            <video src={p.src} className="w-full h-full object-cover" muted />
          ) : (
            <img src={p.src} alt={p.name || ''} className="w-full h-full object-cover" />
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

export default function ManageProjects() {
  const [projects, setProjects] = useState([])
  const [loading,  setLoading]  = useState(true)
  const [deleting, setDeleting] = useState(null)
  const [isModalOpen,     setIsModalOpen]     = useState(false)
  const [editingProject,  setEditingProject]  = useState(null)
  const [form, setForm] = useState({
    title: '', category: 'Residential', location: '',
    budget: '', completionDate: '', description: '', featured: false,
  })
  const mediaRef = useRef(null)
  const [mediaPreviews, setMediaPreviews] = useState([])

  const loadProjects = async () => {
    setLoading(true)
    try {
      const response = await projectsApi.getAll()
      setProjects(response.data?.data || response.data || [])
    } catch {
      toast.error('Unable to load projects.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadProjects() }, [])

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this project? This cannot be undone.')) return
    setDeleting(id)
    try {
      await projectsApi.delete(id)
      toast.success('Project deleted.')
      await loadProjects()
    } catch {
      toast.error('Failed to delete project.')
    } finally {
      setDeleting(null)
    }
  }

  const openCreate = () => {
    setEditingProject(null)
    setForm({ title: '', category: 'Residential', location: '', budget: '', completionDate: '', description: '', featured: false })
    if (mediaRef.current) mediaRef.current.value = null
    setMediaPreviews([])
    setIsModalOpen(true)
  }

  const openEdit = (project) => {
    setEditingProject(project)
    setForm({
      title:          project.title          || '',
      category:       project.category       || 'Residential',
      location:       project.location       || '',
      budget:         project.budget         || '',
      completionDate: project.completionDate ? project.completionDate.split('T')[0] : '',
      description:    project.description    || '',
      featured:       project.featured       || false,
    })

    // ── FIX: use img.resourceType to detect videos; don't hardcode 'image' ──
    const existing = (project.images || []).map(img => ({
      src:          typeof img === 'string' ? img : img.url,
      type:         (typeof img === 'object' && img.resourceType) ? img.resourceType : 'image',
      name:         '',
      existing:     true,
      publicId:     typeof img === 'string' ? null : img.publicId,
    }))
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

  const removePreview = (idx) => setMediaPreviews(prev => prev.filter((_, i) => i !== idx))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.title.trim() || form.title.trim().length < 3) { toast.error('Title is required (min 3 chars).'); return }
    if (!form.description.trim()) { toast.error('Description is required.'); return }

    try {
      const data = new FormData()
      data.append('title',       form.title.trim())
      data.append('category',    form.category)
      data.append('location',    form.location)
      data.append('description', form.description.trim())
      data.append('featured',    form.featured ? 'true' : 'false')
      if (form.budget)         data.append('budget',         form.budget)
      if (form.completionDate) data.append('completionDate', form.completionDate)

      // New files (not existing DB files)
      for (const p of mediaPreviews.filter(p => p.file)) data.append('images', p.file)

      // Tell backend which previously-saved files were removed
      if (editingProject) {
        const keptPublicIds  = mediaPreviews.filter(p => p.existing && p.publicId).map(p => p.publicId)
        const allOriginalIds = (editingProject.images || []).map(img => img.publicId).filter(Boolean)
        for (const id of allOriginalIds.filter(id => !keptPublicIds.includes(id))) {
          data.append('removeImages', id)
        }
      }

      if (editingProject) {
        await projectsApi.update(editingProject._id, data)
        toast.success('Project updated.')
      } else {
        await projectsApi.create(data)
        toast.success('Project created.')
      }
      setIsModalOpen(false)
      setMediaPreviews([])
      await loadProjects()
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to save project.')
    }
  }

  // ── Helper: first IMAGE url for table preview (skip videos) ──────────────
  const getPreviewUrl = (project) => {
    const firstImage = (project.images || []).find(img => !img.resourceType || img.resourceType === 'image')
    return firstImage?.url || null
  }

  return (
    <Section className="bg-background min-h-[calc(100vh-4rem)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          title="Manage Projects"
          description="Add, edit, and remove portfolio projects. Upload unlimited images and videos."
        />

        <div className="mt-8 overflow-x-auto rounded-3xl border border-border bg-card">
          <div className="flex items-center justify-between p-6 border-b border-border">
            <div className="text-sm text-muted-foreground">{projects.length} project{projects.length !== 1 ? 's' : ''}</div>
            <Button variant="gold" onClick={openCreate}>Add Project</Button>
          </div>

          <table className="min-w-full divide-y divide-border">
            <thead className="bg-background/80 text-left text-xs uppercase tracking-[0.12em] text-muted-foreground">
              <tr>
                <th className="px-6 py-4">Preview</th>
                <th className="px-6 py-4">Title</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Media</th>
                <th className="px-6 py-4">Featured</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr><td colSpan="6" className="px-6 py-10 text-center text-muted-foreground">Loading projects…</td></tr>
              ) : projects.length > 0 ? (
                projects.map((project) => {
                  const previewUrl   = getPreviewUrl(project)
                  const totalFiles   = project.images?.length || 0
                  const videoCount   = (project.images || []).filter(i => i.resourceType === 'video').length
                  const imageCount   = totalFiles - videoCount

                  return (
                    <tr key={project._id}>
                      <td className="px-6 py-4">
                        {previewUrl ? (
                          <div className="w-14 h-14 rounded-lg overflow-hidden bg-muted">
                            <img src={previewUrl} alt={project.title} className="w-full h-full object-cover" />
                          </div>
                        ) : (
                          <div className="w-14 h-14 rounded-lg bg-muted flex items-center justify-center">
                            <ImageIcon className="w-5 h-5 text-muted-foreground" />
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 font-medium text-foreground">{project.title}</td>
                      <td className="px-6 py-4 text-muted-foreground">{project.category}</td>
                      <td className="px-6 py-4 text-sm">
                        {totalFiles > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {imageCount > 0 && (
                              <span className="bg-gold/20 text-gold text-xs px-2 py-0.5 rounded-full">
                                {imageCount} img
                              </span>
                            )}
                            {videoCount > 0 && (
                              <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full flex items-center gap-0.5">
                                <Film className="w-2.5 h-2.5" /> {videoCount} vid
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {project.featured
                          ? <span className="text-gold flex items-center gap-1"><Star className="w-3.5 h-3.5 fill-gold" /> Yes</span>
                          : 'No'}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Button size="sm" onClick={() => openEdit(project)}>Edit</Button>
                          <Button
                            variant="destructive" size="sm"
                            onClick={() => handleDelete(project._id)}
                            disabled={deleting === project._id}
                          >
                            {deleting === project._id ? 'Deleting…' : 'Delete'}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr><td colSpan="6" className="px-6 py-10 text-center text-muted-foreground">No projects yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* ── Modal ── */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => { setIsModalOpen(false); setMediaPreviews([]) }}
          title={editingProject ? 'Edit Project' : 'Add Project'}
          size="lg"
        >
          <form onSubmit={handleSubmit} className="p-4 space-y-4">
            <Input
              id="title" label="Title *"
              value={form.title}
              onChange={(e) => setForm(s => ({ ...s, title: e.target.value }))}
              required
            />

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Category *</label>
              <select
                value={form.category}
                onChange={(e) => setForm(s => ({ ...s, category: e.target.value }))}
                className="w-full rounded-lg border border-input px-3 py-2 bg-background text-foreground"
              >
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Input
                id="location" label="Location"
                value={form.location}
                onChange={(e) => setForm(s => ({ ...s, location: e.target.value }))}
              />
              <Input
                id="budget" label="Budget (₹)" type="number"
                value={form.budget}
                onChange={(e) => setForm(s => ({ ...s, budget: e.target.value }))}
              />
            </div>

            <Input
              id="completionDate" label="Completion Date" type="date"
              value={form.completionDate}
              onChange={(e) => setForm(s => ({ ...s, completionDate: e.target.value }))}
            />

            <Textarea
              id="description" label="Description *"
              value={form.description}
              onChange={(e) => setForm(s => ({ ...s, description: e.target.value }))}
              required
            />

            <div className="flex items-center gap-3">
              <input
                id="featured" type="checkbox"
                checked={form.featured}
                onChange={(e) => setForm(s => ({ ...s, featured: e.target.checked }))}
                className="w-4 h-4 accent-gold"
              />
              <label htmlFor="featured" className="text-sm font-medium text-foreground">Mark as Featured</label>
            </div>

            {/* ── Media upload zone ── */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Images &amp; Videos{' '}
                <span className="text-muted-foreground text-xs font-normal">(unlimited · no size limit)</span>
              </label>

              <label className="block cursor-pointer">
                <div className="border-2 border-dashed border-gold/60 bg-gold/5 hover:bg-gold/10 hover:border-gold rounded-xl p-6 text-center transition-all duration-200 group">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Upload className="w-5 h-5 text-gold" />
                    </div>
                    <p className="font-semibold text-foreground text-sm">Click to upload Images &amp; Videos</p>
                    <p className="text-xs text-muted-foreground">JPG · PNG · WEBP · MP4 · MOV · AVI — Multiple files · No size limit</p>
                  </div>
                </div>
                <input
                  ref={mediaRef}
                  type="file" multiple accept="image/*,video/*"
                  className="hidden"
                  onChange={handleMediaChange}
                />
              </label>

              <MediaPreviewStrip previews={mediaPreviews} onRemove={removePreview} />

              {mediaPreviews.length > 0 && (
                <p className="text-xs text-muted-foreground mt-2">
                  {mediaPreviews.length} file{mediaPreviews.length !== 1 ? 's' : ''} — hover to remove
                </p>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button variant="ghost" type="button" onClick={() => { setIsModalOpen(false); setMediaPreviews([]) }}>
                Cancel
              </Button>
              <Button type="submit" variant="gold">
                {editingProject ? 'Update Project' : 'Create Project'}
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </Section>
  )
}
