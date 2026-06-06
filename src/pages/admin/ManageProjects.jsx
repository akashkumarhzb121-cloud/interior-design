import { useEffect, useState, useRef } from 'react'
import toast from 'react-hot-toast'
import { Section, SectionHeader } from '@/components/ui/Section'
import { Button } from '@/components/ui/Button'
import { projectsApi } from '@/api/services'
import Modal from '@/components/ui/Modal'
import { Input, Textarea } from '@/components/ui/Input'
import { X, Film, Image as ImageIcon, Upload, Star, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

const CATEGORIES = ['Residential', 'Commercial', 'Office', 'Hospitality', 'Retail', 'Other']

// ─────────────────────────────────────────────────────────────────────────────
// compressImage
//
// Compresses an image File in the browser using Canvas before uploading.
// Cloudinary free plan has a 10 MB per-file limit. Phone camera photos are
// often 10–20 MB. This shrinks them to under 8 MB while keeping good quality.
//
// Videos are returned as-is (canvas can't compress video).
// ─────────────────────────────────────────────────────────────────────────────
function compressImage(file, { maxWidth = 2400, maxHeight = 2400, quality = 0.82, maxSizeMB = 8 } = {}) {
  // Skip non-images — return the file unchanged
  if (!file.type.startsWith('image/')) return Promise.resolve(file)
  // Skip if already small enough
  if (file.size <= maxSizeMB * 1024 * 1024) return Promise.resolve(file)

  return new Promise((resolve, reject) => {
    const img = new Image()
    const objectUrl = URL.createObjectURL(file)

    img.onload = () => {
      URL.revokeObjectURL(objectUrl)
      let { width, height } = img

      // Scale down proportionally if needed
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height)
        width  = Math.round(width  * ratio)
        height = Math.round(height * ratio)
      }

      const canvas = document.createElement('canvas')
      canvas.width  = width
      canvas.height = height
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0, width, height)

      // Use jpeg for compression (even for png — saves 60–80% size)
      // Keep original name but change extension hint via File type
      canvas.toBlob(
        (blob) => {
          if (!blob) { reject(new Error('Canvas compression failed')); return }
          const compressed = new File([blob], file.name.replace(/\.[^.]+$/, '.jpg'), {
            type: 'image/jpeg',
            lastModified: Date.now(),
          })
          resolve(compressed)
        },
        'image/jpeg',
        quality,
      )
    }

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      // If we can't load/compress, just use original
      resolve(file)
    }

    img.src = objectUrl
  })
}

// ── Preview strip shown inside the modal ────────────────────────────────────
function MediaPreviewStrip({ previews, onRemove }) {
  if (!previews.length) return null
  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {previews.map((p, i) => (
        <div key={i} className="relative group w-24 h-20 rounded-lg overflow-hidden bg-muted border border-border">
          {p.type === 'video' ? (
            <video src={p.src} className="w-full h-full object-cover" muted />
          ) : (
            <img src={p.src} alt={p.name || ''} className="w-full h-full object-cover" />
          )}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors" />
          {/* Upload progress overlay */}
          {p.uploading && (
            <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center">
              <Loader2 className="w-4 h-4 text-white animate-spin" />
              {p.progress != null && (
                <span className="text-white text-[10px] mt-1">{p.progress}%</span>
              )}
            </div>
          )}
          {/* Compressing overlay */}
          {p.compressing && (
            <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center">
              <Loader2 className="w-4 h-4 text-white animate-spin" />
              <span className="text-white text-[10px] mt-1">Compressing…</span>
            </div>
          )}
          {/* Type badge */}
          <span className="absolute top-1 left-1 bg-black/60 text-white rounded px-1 py-0.5 text-[10px] flex items-center gap-0.5">
            {p.type === 'video' ? <Film className="w-2.5 h-2.5" /> : <ImageIcon className="w-2.5 h-2.5" />}
            {p.type}
          </span>
          {/* Remove button */}
          {onRemove && !p.uploading && !p.compressing && (
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

// ─────────────────────────────────────────────────────────────────────────────
// uploadToCloudinaryDirect
//
// Uploads a single File directly from the browser to Cloudinary using a
// signed signature from our backend. Returns { url, publicId, resourceType }.
//
// WHY: Vercel Hobby has a 4.5 MB request-body limit. Files go straight to
// Cloudinary — they never touch Vercel — so the limit is never hit.
// ─────────────────────────────────────────────────────────────────────────────
async function uploadToCloudinaryDirect(file, signature, timestamp, folder, cloudName, apiKey, onProgress) {
  const formData = new FormData()
  formData.append('file',      file)
  formData.append('api_key',   apiKey)
  formData.append('timestamp', timestamp)
  formData.append('signature', signature)
  formData.append('folder',    folder)
  // resource_type must NOT be in signed params — it goes in the URL only

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()

    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress(Math.round((e.loaded / e.total) * 100))
      }
    })

    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        const result = JSON.parse(xhr.responseText)
        resolve({
          url:          result.secure_url,
          publicId:     result.public_id,
          resourceType: result.resource_type,
        })
      } else {
        let errMsg = `Cloudinary upload failed (${xhr.status})`
        try {
          const errData = JSON.parse(xhr.responseText)
          if (errData?.error?.message) errMsg = errData.error.message
        } catch {}
        reject(new Error(errMsg))
      }
    })

    xhr.addEventListener('error', () => reject(new Error('Network error during upload')))
    xhr.addEventListener('abort', () => reject(new Error('Upload aborted')))

    // 'auto' resource_type handles both images and videos
    xhr.open('POST', `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`)
    xhr.send(formData)
  })
}

export default function ManageProjects() {
  const [projects,  setProjects]  = useState([])
  const [loading,   setLoading]   = useState(true)
  const [deleting,  setDeleting]  = useState(null)
  const [isModalOpen,    setIsModalOpen]    = useState(false)
  const [editingProject, setEditingProject] = useState(null)
  const [submitting, setSubmitting] = useState(false)
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
    const existing = (project.images || []).map(img => ({
      src:      typeof img === 'string' ? img : img.url,
      type:     (typeof img === 'object' && img.resourceType) ? img.resourceType : 'image',
      name:     '',
      existing: true,
      publicId: typeof img === 'string' ? null : img.publicId,
      imageObj: typeof img === 'object' ? img : { url: img, publicId: null, resourceType: 'image' },
    }))
    setMediaPreviews(existing)
    setIsModalOpen(true)
  }

  // ── When files are selected: add previews immediately, compress in background
  const handleMediaChange = async (e) => {
    const files = Array.from(e.target.files || [])
    if (!files.length) return
    if (mediaRef.current) mediaRef.current.value = null // allow re-selecting same file

    // ── Video size check ──────────────────────────────────────────────────
    // Cloudinary free plan limit is 10 MB per file. Canvas cannot compress
    // video, so we reject oversized videos upfront with a clear message.
    const VIDEO_MAX_MB = 9
    const oversizedVideos = files.filter(
      f => f.type.startsWith('video/') && f.size > VIDEO_MAX_MB * 1024 * 1024
    )
    if (oversizedVideos.length) {
      const names = oversizedVideos.map(f => `${f.name} (${(f.size / 1024 / 1024).toFixed(1)} MB)`).join(', ')
      toast.error(
        `Video too large: ${names}. Max size is ${VIDEO_MAX_MB} MB. Please trim or compress the video before uploading.`,
        { duration: 6000 }
      )
      // Still allow the non-oversized files from the same selection to proceed
      const validFiles = files.filter(f => {
        if (f.type.startsWith('video/') && f.size > VIDEO_MAX_MB * 1024 * 1024) return false
        return true
      })
      if (!validFiles.length) return
      // Recurse with only valid files via a DataTransfer trick
      const dt = new DataTransfer()
      validFiles.forEach(f => dt.items.add(f))
      const syntheticEvent = { target: { files: dt.files }, preventDefault: () => {} }
      return handleMediaChange(syntheticEvent)
    }

    // Add previews instantly so user sees thumbnails right away
    const initialPreviews = files.map(f => ({
      src:         URL.createObjectURL(f),
      type:        f.type.startsWith('video/') ? 'video' : 'image',
      name:        f.name,
      file:        f,           // original — will be replaced with compressed below
      compressing: f.type.startsWith('image/') && f.size > 8 * 1024 * 1024,
    }))
    setMediaPreviews(prev => [...prev, ...initialPreviews])

    // Compress large images in the background, update the file reference when done
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      if (!file.type.startsWith('image/') || file.size <= 8 * 1024 * 1024) continue

      try {
        const compressed = await compressImage(file)
        const previewSrc = URL.createObjectURL(compressed)

        setMediaPreviews(prev => {
          // Find the preview we added for this file (match by original file reference)
          const targetIdx = prev.findIndex(p => p.file === file)
          if (targetIdx === -1) return prev
          const updated = [...prev]
          updated[targetIdx] = {
            ...updated[targetIdx],
            file:        compressed,
            src:         previewSrc,
            compressing: false,
          }
          return updated
        })
      } catch {
        // Compression failed — just use original, Cloudinary will reject if too big
        setMediaPreviews(prev => {
          const targetIdx = prev.findIndex(p => p.file === file)
          if (targetIdx === -1) return prev
          const updated = [...prev]
          updated[targetIdx] = { ...updated[targetIdx], compressing: false }
          return updated
        })
      }
    }
  }

  const removePreview = (idx) => setMediaPreviews(prev => prev.filter((_, i) => i !== idx))

  const isCompressing = mediaPreviews.some(p => p.compressing)
  const isUploading   = mediaPreviews.some(p => p.uploading)

  // ── Main submit ──────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.title.trim() || form.title.trim().length < 3) { toast.error('Title is required (min 3 chars).'); return }
    if (!form.description.trim()) { toast.error('Description is required.'); return }
    if (isCompressing) { toast.error('Please wait — images are still being compressed.'); return }

    setSubmitting(true)
    const toastId = toast.loading('Preparing upload…')

    try {
      // Step 1 — get a signed Cloudinary upload signature from our backend
      const sigRes = await projectsApi.getUploadSignature()
      const { signature, timestamp, folder, cloudName, apiKey } = sigRes.data?.data || sigRes.data

      // Step 2 — upload each NEW file directly to Cloudinary (never touches Vercel)
      const newFilePreviews = mediaPreviews.filter(p => p.file)
      const uploadedImages  = []

      for (let i = 0; i < newFilePreviews.length; i++) {
        const preview = newFilePreviews[i]
        const fileIdx = mediaPreviews.findIndex(p => p === preview)

        setMediaPreviews(prev => prev.map((p, idx) =>
          idx === fileIdx ? { ...p, uploading: true, progress: 0 } : p
        ))

        toast.loading(`Uploading file ${i + 1} of ${newFilePreviews.length}…`, { id: toastId })

        const result = await uploadToCloudinaryDirect(
          preview.file,
          signature, timestamp, folder, cloudName, apiKey,
          (pct) => {
            setMediaPreviews(prev => prev.map((p, idx) =>
              idx === fileIdx ? { ...p, progress: pct } : p
            ))
          }
        )

        uploadedImages.push(result)

        setMediaPreviews(prev => prev.map((p, idx) =>
          idx === fileIdx ? { ...p, uploading: false, progress: null } : p
        ))
      }

      // Step 3 — send only JSON (metadata + Cloudinary URLs) to our backend
      toast.loading('Saving project…', { id: toastId })

      const metadata = {
        title:       form.title.trim(),
        category:    form.category,
        location:    form.location,
        description: form.description.trim(),
        featured:    form.featured,
        ...(form.budget         && { budget:         form.budget }),
        ...(form.completionDate && { completionDate: form.completionDate }),
      }

      if (editingProject) {
        const keepImages     = mediaPreviews.filter(p => p.existing).map(p => p.imageObj)
        const keptPublicIds  = keepImages.map(img => img.publicId).filter(Boolean)
        const allOriginalIds = (editingProject.images || []).map(img => img.publicId).filter(Boolean)
        const removeImages   = allOriginalIds.filter(id => !keptPublicIds.includes(id))

        await projectsApi.updateWithUrls(editingProject._id, {
          ...metadata, images: uploadedImages, keepImages, removeImages,
        })
        toast.success('Project updated.', { id: toastId })
      } else {
        await projectsApi.createWithUrls({ ...metadata, images: uploadedImages })
        toast.success('Project created.', { id: toastId })
      }

      setIsModalOpen(false)
      setMediaPreviews([])
      await loadProjects()
    } catch (error) {
      const msg = error?.response?.data?.message || error?.message || 'Failed to save project.'
      toast.error(msg, { id: toastId })
    } finally {
      setSubmitting(false)
    }
  }

  const getPreviewUrl = (project) => {
    const firstImage = (project.images || []).find(img => !img.resourceType || img.resourceType === 'image')
    return firstImage?.url || null
  }

  return (
    <Section className="bg-background min-h-[calc(100vh-4rem)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          title="Manage Projects"
          description="Add, edit, and remove portfolio projects. Images are auto-compressed before upload."
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
                  const previewUrl = getPreviewUrl(project)
                  const totalFiles = project.images?.length || 0
                  const videoCount = (project.images || []).filter(i => i.resourceType === 'video').length
                  const imageCount = totalFiles - videoCount
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
                              <span className="bg-gold/20 text-gold text-xs px-2 py-0.5 rounded-full">{imageCount} img</span>
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
                          <Button variant="destructive" size="sm"
                            onClick={() => handleDelete(project._id)}
                            disabled={deleting === project._id}>
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
          onClose={() => { if (!submitting && !isUploading && !isCompressing) { setIsModalOpen(false); setMediaPreviews([]) } }}
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

            <Input
              id="location" label="Location"
              value={form.location}
              onChange={(e) => setForm(s => ({ ...s, location: e.target.value }))}
            />

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
                <span className="text-muted-foreground text-xs font-normal">(images auto-compressed · videos max 9 MB)</span>
              </label>

              <label className={cn('block', (submitting || isUploading) ? 'cursor-not-allowed opacity-60' : 'cursor-pointer')}>
                <div className="border-2 border-dashed border-gold/60 bg-gold/5 hover:bg-gold/10 hover:border-gold rounded-xl p-6 text-center transition-all duration-200 group">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Upload className="w-5 h-5 text-gold" />
                    </div>
                    <p className="font-semibold text-foreground text-sm">Click to upload Images &amp; Videos</p>
                    <p className="text-xs text-muted-foreground">JPG · PNG · WEBP · MP4 · MOV · AVI — Images auto-compressed · Videos max 9 MB</p>
                  </div>
                </div>
                <input
                  ref={mediaRef}
                  type="file" multiple accept="image/*,video/*"
                  className="hidden"
                  disabled={submitting || isUploading}
                  onChange={handleMediaChange}
                />
              </label>

              <MediaPreviewStrip
                previews={mediaPreviews}
                onRemove={submitting || isUploading ? null : removePreview}
              />

              {mediaPreviews.length > 0 && (
                <p className="text-xs text-muted-foreground mt-2">
                  {mediaPreviews.length} file{mediaPreviews.length !== 1 ? 's' : ''} — hover to remove
                  {isCompressing && <span className="text-gold ml-2">· Compressing large images…</span>}
                </p>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                variant="ghost" type="button"
                disabled={submitting || isUploading || isCompressing}
                onClick={() => { setIsModalOpen(false); setMediaPreviews([]) }}
              >
                Cancel
              </Button>
              <Button type="submit" variant="gold" disabled={submitting || isUploading || isCompressing}>
                {isCompressing
                  ? 'Compressing…'
                  : submitting
                    ? (isUploading ? 'Uploading…' : 'Saving…')
                    : editingProject ? 'Update Project' : 'Create Project'}
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </Section>
  )
}
