import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, MapPin, Play, SlidersHorizontal, X } from 'lucide-react'
import { Section, SectionHeader } from '@/components/ui/Section'
import { Button } from '@/components/ui/Button'
import { ProjectCardSkeleton } from '@/components/ui/Skeleton'
import { projectsApi } from '@/api/services'
import { cn } from '@/lib/utils'

// All categories from the Project model enum
const CATEGORIES = ['All', 'Residential', 'Commercial', 'Office', 'Hospitality', 'Retail', 'Other']

const FALLBACK = 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=800&q=80'

// Normalise one entry from project.images[] → { url, resourceType }
function normaliseMedia(img) {
  if (!img) return null
  const url = typeof img === 'string' ? img : img.url
  if (!url) return null
  return { url, resourceType: img.resourceType || 'image' }
}

export default function ProjectsPage() {
  const [projects,       setProjects]       = useState([])
  const [filtered,       setFiltered]       = useState([])
  const [loading,        setLoading]        = useState(true)
  const [activeCategory, setActiveCategory] = useState('All')
  const [searchQuery,    setSearchQuery]    = useState('')

  useEffect(() => {
    ;(async () => {
      try {
        // ── FIX: This file previously contained the entire ServicesPage code.
        // It imported servicesApi and never called projectsApi at all, so the
        // /projects page always showed services content instead of projects.
        // Now it correctly calls projectsApi.getAll() which hits GET /api/projects
        // with no pagination params — the backend returns all documents at once.
        const response = await projectsApi.getAll()
        const list = response.data?.data || response.data || []
        setProjects(Array.isArray(list) ? list : [])
      } catch (err) {
        console.error('[ProjectsPage] fetch error:', err)
        setProjects([])
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  // Re-filter whenever projects, category or search changes
  useEffect(() => {
    let result = [...projects]
    if (activeCategory !== 'All') {
      result = result.filter((p) => p.category === activeCategory)
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter(
        (p) =>
          p.title?.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q) ||
          p.location?.toLowerCase().includes(q) ||
          (p.tags || []).some((t) => t.toLowerCase().includes(q)),
      )
    }
    setFiltered(result)
  }, [projects, activeCategory, searchQuery])

  return (
    <>
      {/* ── Hero ── */}
      <section className="relative py-24 md:py-32 bg-charcoal overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <img
            src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1920&q=80"
            alt=""
            className="w-full h-full object-cover"
          />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl">
            <span className="inline-block px-4 py-2 bg-gold/20 text-gold text-sm font-medium rounded-full mb-6">
              Our Portfolio
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-white">
              Our Design Projects
            </h1>
            <p className="mt-6 text-lg text-white/70 leading-relaxed max-w-xl">
              Explore our portfolio of bespoke interior design projects across Mumbai.
              Every space tells a story of craftsmanship and vision.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── Filters bar ── */}
      <div className="sticky top-0 z-30 bg-background/95 backdrop-blur border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            {/* Category pills */}
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={cn(
                    'px-4 py-1.5 rounded-full text-sm font-medium transition-all',
                    activeCategory === cat
                      ? 'bg-gold text-charcoal shadow-sm'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80',
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
            {/* Search */}
            <div className="relative w-full sm:w-64">
              <SlidersHorizontal className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <input
                type="text"
                placeholder="Search projects…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-9 py-2 rounded-full border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-gold/30"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Projects Grid ── */}
      <Section className="bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Result count */}
          {!loading && (
            <p className="text-sm text-muted-foreground mb-6">
              {filtered.length} project{filtered.length !== 1 ? 's' : ''}
              {activeCategory !== 'All' && ` in ${activeCategory}`}
              {searchQuery && ` matching "${searchQuery}"`}
            </p>
          )}

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {Array.from({ length: 6 }).map((_, i) => <ProjectCardSkeleton key={i} />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-24 text-center">
              <p className="text-lg text-muted-foreground">
                {projects.length === 0
                  ? 'No projects added yet. Check back soon!'
                  : 'No projects match your current filters.'}
              </p>
              {(activeCategory !== 'All' || searchQuery) && (
                <button
                  onClick={() => { setActiveCategory('All'); setSearchQuery('') }}
                  className="mt-4 text-gold hover:underline text-sm"
                >
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filtered.map((project, index) => (
                  <ProjectCard key={project._id} project={project} index={index} />
                ))}
              </div>
            </AnimatePresence>
          )}
        </div>
      </Section>

      {/* ── CTA ── */}
      <Section className="bg-charcoal">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <span className="inline-block px-4 py-2 bg-gold/20 text-gold text-sm font-medium rounded-full mb-6">
              Start Your Project
            </span>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-white">
              Ready to Transform Your Space?
            </h2>
            <p className="mt-4 text-lg text-white/70 max-w-2xl mx-auto">
              Let our expert designers create your dream interior.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/booking">
                <Button variant="gold" size="xl">
                  Book Consultation <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <Link to="/contact">
                <Button variant="outline" size="xl" className="border-white/30 text-white hover:bg-white/10">
                  Get in Touch
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </Section>
    </>
  )
}

// ─── Project Card ─────────────────────────────────────────────────────────────
function ProjectCard({ project, index }) {
  const projectId  = project._id || project.id
  const images     = project.images || []

  // First image for thumbnail; fall back to first video if no image exists
  const firstImg   = images.find((img) => !img.resourceType || img.resourceType === 'image')
  const firstVideo = images.find((img) => img.resourceType === 'video')
  const previewItem = firstImg
    ? normaliseMedia(firstImg)
    : firstVideo
    ? normaliseMedia(firstVideo)
    : null

  const previewUrl = previewItem?.url || FALLBACK
  const isVideo    = previewItem?.resourceType === 'video'

  const videoCount = images.filter((img) => img.resourceType === 'video').length
  const imageCount = images.filter((img) => !img.resourceType || img.resourceType === 'image').length

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ delay: Math.min(index * 0.05, 0.3) }}
      className="group"
    >
      <Link to={`/projects/${projectId}`}>
        {/* Thumbnail */}
        <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-muted">
          {isVideo ? (
            <video
              src={previewUrl}
              muted
              playsInline
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
          ) : (
            <img
              src={previewUrl}
              alt={project.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              onError={(e) => { e.currentTarget.src = FALLBACK }}
            />
          )}

          {/* Dark overlay on hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Video badge */}
          {isVideo && (
            <span className="absolute top-3 left-3 flex items-center gap-1 bg-black/60 text-white text-xs px-2 py-0.5 rounded-full">
              <Play className="w-2.5 h-2.5 fill-white" /> Video
            </span>
          )}

          {/* Media count badges */}
          <div className="absolute top-3 right-3 flex gap-1">
            {imageCount > 0 && images.length > 1 && (
              <span className="bg-black/60 text-white text-xs px-2 py-0.5 rounded-full">
                {imageCount} img
              </span>
            )}
            {videoCount > 0 && (
              <span className="bg-black/60 text-white text-xs px-2 py-0.5 rounded-full flex items-center gap-0.5">
                <Play className="w-2.5 h-2.5 fill-white" /> {videoCount}
              </span>
            )}
          </div>

          {/* Hover CTA */}
          <div className="absolute bottom-4 left-4 right-4 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
            <span className="inline-flex items-center gap-2 text-white text-sm font-medium">
              View Project <ArrowRight className="w-4 h-4" />
            </span>
          </div>
        </div>

        {/* Info */}
        <div className="mt-4">
          <span className="text-sm text-gold font-medium">{project.category}</span>
          <h3 className="mt-1 text-lg font-semibold group-hover:text-gold transition-colors line-clamp-1">
            {project.title}
          </h3>
          {project.location && (
            <p className="mt-1 text-sm text-muted-foreground flex items-center gap-1">
              <MapPin className="w-3 h-3 flex-shrink-0" />
              {project.location}
            </p>
          )}
          {project.description && (
            <p className="mt-2 text-sm text-muted-foreground line-clamp-2 leading-relaxed">
              {project.description}
            </p>
          )}
        </div>
      </Link>
    </motion.div>
  )
}
