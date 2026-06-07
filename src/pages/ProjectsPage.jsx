import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, MapPin, Play, SlidersHorizontal, X, Images, Sparkles } from 'lucide-react'
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

                {/* ── See All Works card — always shown at end of grid ── */}
                <motion.div
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(filtered.length * 0.05, 0.4) }}
                >
                  <Link to="/gallery" className="block h-full group">
                    <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-charcoal flex flex-col items-center justify-center text-center px-8 border border-gold/20 hover:border-gold/60 transition-all duration-500">
                      {/* Animated background shimmer */}
                      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gold/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      <div className="absolute inset-0 bg-gradient-to-br from-charcoal via-charcoal to-black" />

                      {/* Decorative corner lines */}
                      <div className="absolute top-4 left-4 w-6 h-6 border-t border-l border-gold/30 group-hover:border-gold/70 transition-colors duration-300" />
                      <div className="absolute top-4 right-4 w-6 h-6 border-t border-r border-gold/30 group-hover:border-gold/70 transition-colors duration-300" />
                      <div className="absolute bottom-4 left-4 w-6 h-6 border-b border-l border-gold/30 group-hover:border-gold/70 transition-colors duration-300" />
                      <div className="absolute bottom-4 right-4 w-6 h-6 border-b border-r border-gold/30 group-hover:border-gold/70 transition-colors duration-300" />

                      {/* Content */}
                      <div className="relative z-10 flex flex-col items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-gold/10 border border-gold/30 flex items-center justify-center group-hover:bg-gold/20 group-hover:scale-110 transition-all duration-300">
                          <Images className="w-7 h-7 text-gold" />
                        </div>

                        <div>
                          <div className="flex items-center justify-center gap-1.5 mb-2">
                            <Sparkles className="w-3.5 h-3.5 text-gold/70" />
                            <span className="text-gold/70 text-xs tracking-widest uppercase font-medium">Full Collection</span>
                            <Sparkles className="w-3.5 h-3.5 text-gold/70" />
                          </div>
                          <h3 className="text-2xl font-serif font-bold text-white group-hover:text-gold transition-colors duration-300">
                            Explore Our<br />Complete Works
                          </h3>
                          <p className="mt-2 text-white/50 text-sm leading-relaxed">
                            Every photograph, every detail —<br />the full visual story in one place.
                          </p>
                        </div>

                        <div className="flex items-center gap-2 mt-1 text-gold text-sm font-medium">
                          <span>View Full Gallery</span>
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>

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
  const [activeIdx, setActiveIdx] = useState(0)

  const mediaItems = project.images?.length
    ? project.images.map(normaliseMedia).filter(Boolean)
    : [{ url: FALLBACK, resourceType: 'image' }]

  const current  = mediaItems[activeIdx] || mediaItems[0]
  const isVideo  = current.resourceType === 'video'
  const videoCount = mediaItems.filter((img) => img.resourceType === 'video').length
  const imageCount = mediaItems.filter((img) => img.resourceType === 'image').length

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ delay: Math.min(index * 0.05, 0.3) }}
      className="group rounded-2xl bg-card border border-border overflow-hidden"
    >
      <div className="relative">
        <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-muted">
          {isVideo ? (
            <video
              key={current.url}
              src={current.url}
              muted
              playsInline
              className="w-full h-full object-cover"
            />
          ) : (
            <img
              src={current.url}
              alt={project.title}
              className="w-full h-full object-cover"
              onError={(e) => { e.currentTarget.src = FALLBACK }}
            />
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

          {mediaItems.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); setActiveIdx((i) => (i - 1 + mediaItems.length) % mediaItems.length) }}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/80 transition-colors"
                aria-label="Previous image"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); setActiveIdx((i) => (i + 1) % mediaItems.length) }}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/80 transition-colors"
                aria-label="Next image"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}

          {mediaItems.length > 1 && (
            <span className="absolute top-3 right-3 bg-black/60 text-white text-xs px-2 py-0.5 rounded-full">
              {activeIdx + 1} / {mediaItems.length}
            </span>
          )}
        </div>

        {mediaItems.length > 1 && (
          <div className="flex gap-1.5 mt-3 overflow-x-auto pb-1">
            {mediaItems.map((item, idx) => (
              <button
                key={idx}
                onClick={() => setActiveIdx(idx)}
                className={`flex-shrink-0 w-14 h-12 rounded-md overflow-hidden border-2 transition-all ${idx === activeIdx ? 'border-gold' : 'border-transparent opacity-60 hover:opacity-100'}`}
              >
                {item.resourceType === 'video' ? (
                  <div className="w-full h-full bg-muted flex items-center justify-center">
                    <Play className="w-4 h-4 text-muted-foreground" />
                  </div>
                ) : (
                  <img src={item.url} alt="" className="w-full h-full object-cover" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="p-4">
        <span className="text-sm text-gold font-medium">{project.category}</span>
        <h3 className="mt-2 text-lg font-semibold text-foreground line-clamp-1">
          {project.title}
        </h3>
        {project.location && (
          <p className="mt-2 text-sm text-muted-foreground flex items-center gap-1">
            <MapPin className="w-3 h-3 flex-shrink-0" />
            {project.location}
          </p>
        )}
        {project.description && (
          <p className="mt-3 text-sm text-muted-foreground line-clamp-2 leading-relaxed">
            {project.description}
          </p>
        )}
        <Link
          to={`/projects/${projectId}`}
          className="inline-flex items-center gap-2 mt-4 text-gold text-sm font-medium hover:text-gold-dark"
        >
          View Project <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </motion.div>
  )
}
