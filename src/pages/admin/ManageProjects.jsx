import { useEffect, useState, useRef } from 'react'
import toast from 'react-hot-toast'
import { Section, SectionHeader } from '@/components/ui/Section'
import { Button } from '@/components/ui/Button'
import { projectsApi } from '@/api/services'
import Modal from '@/components/ui/Modal'
import { Input, Textarea, Select } from '@/components/ui/Input'

export default function ManageProjects() {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProject, setEditingProject] = useState(null)
  const [form, setForm] = useState({ title: '', category: '', location: '', year: '', area: '', description: '' })
  const imagesRef = useRef(null)
  const [imagePreviews, setImagePreviews] = useState([])

  const loadProjects = async () => {
    setLoading(true)
    try {
      const response = await projectsApi.getAll()
      setProjects(response.data || [])
    } catch (error) {
      console.error('[v0] Error loading projects:', error)
      toast.error('Unable to load projects at the moment.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProjects()
  }, [])

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this project?')) return
    setDeleting(id)
    try {
      await projectsApi.delete(id)
      toast.success('Project removed successfully.')
      await loadProjects()
    } catch (error) {
      console.error('[v0] Error deleting project:', error)
      toast.error('Failed to delete project.')
    } finally {
      setDeleting(null)
    }
  }

  const openCreate = () => {
    setEditingProject(null)
    setForm({ title: '', category: '', location: '', year: '', area: '', description: '' })
    if (imagesRef.current) imagesRef.current.value = null
    setImagePreviews([])
    setIsModalOpen(true)
  }

  const openEdit = (project) => {
    setEditingProject(project)
    setForm({
      title: project.title || '',
      category: project.category || '',
      location: project.location || '',
      year: project.year || '',
      area: project.area || '',
      description: project.description || '',
    })
    // Preload existing images (if any) as previews
    const existing = (project.images || project.photos || []).map((p) => ({ src: p, name: '' }))
    setImagePreviews(existing)
    setIsModalOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      // Basic validation
      if (!form.title || form.title.trim().length < 3) {
        toast.error('Title is required (min 3 chars).')
        return
      }
      const data = new FormData()
      data.append('title', form.title)
      data.append('category', form.category)
      data.append('location', form.location)
      data.append('year', form.year)
      data.append('area', form.area)
      data.append('description', form.description)
      const files = imagesRef.current?.files
      if (files && files.length) {
        // Validate files
        for (const file of Array.from(files)) {
          if (!file.type.startsWith('image/')) {
            toast.error('Only image files are allowed.')
            return
          }
          if (file.size > 5 * 1024 * 1024) {
            toast.error('Each image must be smaller than 5MB.')
            return
          }
          data.append('images', file)
        }
      }

      if (editingProject) {
        await projectsApi.update(editingProject._id, data)
        toast.success('Project updated')
      } else {
        await projectsApi.create(data)
        toast.success('Project created')
      }
      setIsModalOpen(false)
      // cleanup previews
      setImagePreviews([])
      await loadProjects()
    } catch (error) {
      console.error('[v0] Error saving project:', error)
      toast.error('Failed to save project')
    }
  }

  const handleImageChange = (e) => {
    const files = e.target.files
    if (!files || !files.length) {
      setImagePreviews([])
      return
    }
    const previews = Array.from(files).slice(0, 8).map((f) => ({ src: URL.createObjectURL(f), name: f.name }))
    // revoke old previews
    setImagePreviews((old) => {
      old.forEach((p) => p.src && p.src.startsWith('blob:') && URL.revokeObjectURL(p.src))
      return previews
    })
  }

  return (
    <Section className="bg-background min-h-[calc(100vh-4rem)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader title="Manage Projects" description="Review your portfolio and remove outdated project entries." />

        <div className="mt-8 overflow-x-auto rounded-3xl border border-border bg-card">
          <div className="flex items-center justify-between p-6 border-b border-border">
            <div className="text-sm text-muted-foreground">Projects list</div>
            <div className="flex items-center gap-2">
              <Button variant="gold" onClick={openCreate}>Add Project</Button>
            </div>
          </div>
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-background/80 text-left text-sm uppercase tracking-[0.12em] text-muted-foreground">
              <tr>
                <th className="px-6 py-4">Title</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Location</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan="4" className="px-6 py-10 text-center text-muted-foreground">Loading projects...</td>
                </tr>
              ) : projects.length > 0 ? (
                projects.map((project) => (
                  <tr key={project._id}>
                    <td className="px-6 py-4 text-foreground font-medium">{project.title}</td>
                    <td className="px-6 py-4 text-muted-foreground">{project.category}</td>
                    <td className="px-6 py-4 text-muted-foreground">{project.location}</td>
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
                <tr>
                  <td colSpan="4" className="px-6 py-10 text-center text-muted-foreground">No projects available.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingProject ? 'Edit Project' : 'Add Project'} size="lg">
          <form onSubmit={handleSubmit} className="p-4 space-y-4">
            <Input id="title" label="Title" value={form.title} onChange={(e) => setForm((s) => ({ ...s, title: e.target.value }))} required />
            <Input id="category" label="Category" value={form.category} onChange={(e) => setForm((s) => ({ ...s, category: e.target.value }))} />
            <div className="grid grid-cols-2 gap-3">
              <Input id="location" label="Location" value={form.location} onChange={(e) => setForm((s) => ({ ...s, location: e.target.value }))} />
              <Input id="year" label="Year" value={form.year} onChange={(e) => setForm((s) => ({ ...s, year: e.target.value }))} />
            </div>
            <Input id="area" label="Area" value={form.area} onChange={(e) => setForm((s) => ({ ...s, area: e.target.value }))} />
            <Textarea id="description" label="Description" value={form.description} onChange={(e) => setForm((s) => ({ ...s, description: e.target.value }))} />
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Images</label>
              <input ref={imagesRef} type="file" accept="image/*" multiple className="w-full" onChange={handleImageChange} />
              {imagePreviews && imagePreviews.length > 0 && (
                <div className="mt-3 grid grid-cols-4 gap-2">
                  {imagePreviews.map((p, i) => (
                    <div key={i} className="h-20 w-full overflow-hidden rounded-lg bg-muted flex items-center justify-center">
                      <img src={p.src} alt={p.name || `preview-${i}`} className="object-cover h-full w-full" />
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="flex items-center justify-end gap-2">
              <Button variant="ghost" onClick={() => { setIsModalOpen(false); setImagePreviews([]) }}>Cancel</Button>
              <Button type="submit" variant="gold">{editingProject ? 'Update' : 'Create'}</Button>
            </div>
          </form>
        </Modal>
      </div>
    </Section>
  )
}
