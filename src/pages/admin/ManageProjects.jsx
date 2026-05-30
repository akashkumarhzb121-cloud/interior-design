import { useEffect, useState, useRef } from 'react'
import toast from 'react-hot-toast'
import { Section, SectionHeader } from '@/components/ui/Section'
import { Button } from '@/components/ui/Button'
import { projectsApi } from '@/api/services'
import Modal from '@/components/ui/Modal'
import { Input, Textarea } from '@/components/ui/Input'

const CATEGORIES = ['Residential', 'Commercial', 'Office', 'Hospitality', 'Retail', 'Other']

export default function ManageProjects() {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProject, setEditingProject] = useState(null)
  const [form, setForm] = useState({
    title: '', category: 'Residential', location: '',
    budget: '', completionDate: '', description: '', featured: false,
  })
  const imagesRef = useRef(null)
  const [imagePreviews, setImagePreviews] = useState([])

  const loadProjects = async () => {
    setLoading(true)
    try {
      const response = await projectsApi.getAll()
      setProjects(response.data?.data || response.data || [])
    } catch (error) {
      console.error('[Projects] Load error:', error)
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
    } catch (error) {
      console.error('[Projects] Delete error:', error)
      toast.error('Failed to delete project.')
    } finally {
      setDeleting(null)
    }
  }

  const openCreate = () => {
    setEditingProject(null)
    setForm({ title: '', category: 'Residential', location: '', budget: '', completionDate: '', description: '', featured: false })
    if (imagesRef.current) imagesRef.current.value = null
    setImagePreviews([])
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
    const existing = (project.images || []).map((img) => ({
      src:  typeof img === 'string' ? img : img.url,
      name: '',
    }))
    setImagePreviews(existing)
    setIsModalOpen(true)
  }

  const handleImageChange = (e) => {
    const files = e.target.files
    if (!files || !files.length) { setImagePreviews([]); return }
    const previews = Array.from(files).slice(0, 10).map((f) => ({
      src: URL.createObjectURL(f), name: f.name,
    }))
    setImagePreviews(previews)
  }

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
      data.append('featured',    form.featured)
      if (form.budget)         data.append('budget',         form.budget)
      if (form.completionDate) data.append('completionDate', form.completionDate)

      const files = imagesRef.current?.files
      if (files && files.length) {
        for (const file of Array.from(files)) {
          if (!file.type.startsWith('image/')) { toast.error('Only image files are allowed.'); return }
          if (file.size > 5 * 1024 * 1024)    { toast.error('Each image must be under 5MB.'); return }
          data.append('images', file)
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
      setImagePreviews([])
      await loadProjects()
    } catch (error) {
      console.error('[Projects] Save error:', error)
      toast.error(error?.response?.data?.message || 'Failed to save project.')
    }
  }

  return (
    <Section className="bg-background min-h-[calc(100vh-4rem)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader title="Manage Projects" description="Add, edit, and remove portfolio projects." />

        <div className="mt-8 overflow-x-auto rounded-3xl border border-border bg-card">
          <div className="flex items-center justify-between p-6 border-b border-border">
            <div className="text-sm text-muted-foreground">{projects.length} project{projects.length !== 1 ? 's' : ''}</div>
            <Button variant="gold" onClick={openCreate}>Add Project</Button>
          </div>
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-background/80 text-left text-sm uppercase tracking-[0.12em] text-muted-foreground">
              <tr>
                <th className="px-6 py-4">Title</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Location</th>
                <th className="px-6 py-4">Featured</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr><td colSpan="5" className="px-6 py-10 text-center text-muted-foreground">Loading projects...</td></tr>
              ) : projects.length > 0 ? (
                projects.map((project) => (
                  <tr key={project._id}>
                    <td className="px-6 py-4 text-foreground font-medium">{project.title}</td>
                    <td className="px-6 py-4 text-muted-foreground">{project.category}</td>
                    <td className="px-6 py-4 text-muted-foreground">{project.location || '—'}</td>
                    <td className="px-6 py-4 text-muted-foreground">{project.featured ? '★ Yes' : 'No'}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Button size="sm" onClick={() => openEdit(project)}>Edit</Button>
                        <Button variant="destructive" size="sm" onClick={() => handleDelete(project._id)} disabled={deleting === project._id}>
                          {deleting === project._id ? 'Deleting...' : 'Delete'}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="5" className="px-6 py-10 text-center text-muted-foreground">No projects yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingProject ? 'Edit Project' : 'Add Project'} size="lg">
          <form onSubmit={handleSubmit} className="p-4 space-y-4">
            <Input id="title" label="Title" value={form.title} onChange={(e) => setForm((s) => ({ ...s, title: e.target.value }))} required />

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Category *</label>
              <select value={form.category} onChange={(e) => setForm((s) => ({ ...s, category: e.target.value }))} className="w-full rounded-lg border border-input px-3 py-2 bg-background text-foreground">
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Input id="location" label="Location" value={form.location} onChange={(e) => setForm((s) => ({ ...s, location: e.target.value }))} />
              <Input id="budget" label="Budget (₹)" type="number" value={form.budget} onChange={(e) => setForm((s) => ({ ...s, budget: e.target.value }))} />
            </div>

            <Input id="completionDate" label="Completion Date" type="date" value={form.completionDate} onChange={(e) => setForm((s) => ({ ...s, completionDate: e.target.value }))} />

            <Textarea id="description" label="Description *" value={form.description} onChange={(e) => setForm((s) => ({ ...s, description: e.target.value }))} required />

            <div className="flex items-center gap-3">
              <input id="featured" type="checkbox" checked={form.featured} onChange={(e) => setForm((s) => ({ ...s, featured: e.target.checked }))} className="w-4 h-4" />
              <label htmlFor="featured" className="text-sm font-medium text-foreground">Mark as Featured</label>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Images (up to 10)</label>
              <input ref={imagesRef} type="file" accept="image/*" multiple className="w-full" onChange={handleImageChange} />
              {imagePreviews.length > 0 && (
                <div className="mt-3 grid grid-cols-4 gap-2">
                  {imagePreviews.map((p, i) => (
                    <div key={i} className="h-20 w-full overflow-hidden rounded-lg bg-muted">
                      <img src={p.src} alt={p.name || `img-${i}`} className="object-cover h-full w-full" />
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2">
              <Button variant="ghost" type="button" onClick={() => { setIsModalOpen(false); setImagePreviews([]) }}>Cancel</Button>
              <Button type="submit" variant="gold">{editingProject ? 'Update' : 'Create'}</Button>
            </div>
          </form>
        </Modal>
      </div>
    </Section>
  )
}