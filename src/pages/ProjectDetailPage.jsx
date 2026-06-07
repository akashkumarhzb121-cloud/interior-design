import { useEffect, useState, useCallback } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Thumbs, Pagination } from 'swiper/modules'
import {
  ArrowLeft, ArrowRight, MapPin, Calendar,
  ChevronLeft, ChevronRight, X, Play, Maximize2,
} from 'lucide-react'
import { Section, SectionHeader } from '@/components/ui/Section'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import { projectsApi } from '@/api/services'

import 'swiper/css'
import 'swiper/css/thumbs'
import 'swiper/css/pagination'

function normaliseMedia(img) {
  if (!img) return null
  const url = typeof img === 'string' ? img : img.url
  if (!url) return null
  return { url, resourceType: img.resourceType || 'image' }
}

const FALLBACK_IMAGES = [
  'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=1200&q=80',
  'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&q=80',
  'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=1200&q=80',
]

// ─────────────────────────────────────────────────────────────────────────────
// Lightbox — built as a plain fixed overlay, NOT using Modal component.
//
// WHY: The Modal component renders a Swiper with navigation={true} inside it.
// On mobile, Swiper's navigation tries to attach to CSS class selectors
// (.swiper-prev / .swiper-next) which collide with the main gallery's nav
// buttons that share the same class names. This caused the lightbox to
// immediately close on mobile and redirect to /admin/login (the ProtectedRoute
// catches the unmounted navigation event).
//
// This standalone overlay avoids all of that:
// - No shared CSS class names with the main gallery
// - No Modal portal that interferes with touch event propagation
// - Keyboard navigation via useEffect (Escape / arrows)
// - Locks body scroll while open
// ─────────────────────────────────────────────────────────────────────────────
function Lightbox({ items, startIndex, onClose }) {
  const [current, setCurrent] = useState(startIndex)

  const prev = useCallback(() => setCurrent(i => (i - 1 + items.length) % items.length), [items.length])
  const next = useCallback(() => setCurrent(i => (i + 1) % items.length), [items.length])

  // Keyboard nav + body scroll lock
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    const handler = (e) => {
      if (e.key === 'Escape')     onClose()
      if (e.key === 'ArrowLeft')  prev()
      if (e.key === 'ArrowRight') next()
    }
    window.addEventListener('keydown', handler)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', handler)
    }
  }, [onClose, prev, next])

  const item = items[current]

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      // Clicking the dark backdrop closes the lightbox
      className="fixed inset-0 z-[100] bg-black/95 flex flex-col"
      onClick={onClose}
    >
      {/* Top bar */}
      <div
        className="flex items-center justify-between px-4 py-3 flex-shrink-0"
        onClick={(e) => e.stopPropagation()}
      >
        <span className="text-white/50 text-sm tabular-nums">
          {current + 1} / {items.length}
        </span>
        <button
          onClick={onClose}
          className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
        >
          <X className="w-5 h-5 text-white" />
        </button>
      </div>

      {/* Main image/video area */}
      <div
        className="flex-1 flex items-center justify-center relative px-2 min-h-0"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Prev button */}
        {items.length > 1 && (
          <button
            onClick={prev}
            className="absolute left-2 z-10 w-10 h-10 rounded-full bg-white/10 hover:bg-white/25 flex items-center justify-center transition-colors flex-shrink-0"
          >
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>
        )}

        {/* Media */}
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="w-full h-full flex items-center justify-center px-12"
          >
            {item.resourceType === 'video' ? (
              <video
                src={item.url}
                controls
                autoPlay
                playsInline
                className="max-w-full max-h-full rounded-lg object-contain"
                style={{ maxHeight: 'calc(100vh - 140px)' }}
              />
            ) : (
              <img
                src={item.url}
                alt=""
                className="max-w-full max-h-full rounded-lg object-contain select-none"
                style={{ maxHeight: 'calc(100vh - 140px)' }}
                draggable={false}
              />
            )}
          </motion.div>
        </AnimatePresence>

        {/* Next button */}
        {items.length > 1 && (
          <button
            onClick={next}
            className="absolute right-2 z-10 w-10 h-10 rounded-full bg-white/10 hover:bg-white/25 flex items-center justify-center transition-colors flex-shrink-0"
          >
            <ChevronRight className="w-6 h-6 text-white" />
          </button>
        )}
      </div>

      {/* Thumbnail filmstrip */}
      {items.length > 1 && (
        <div
          className="flex gap-2 px-4 py-3 overflow-x-auto flex-shrink-0 justify-center"
          onClick={(e) => e.stopPropagation()}
        >
          {items.map((it, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`flex-shrink-0 w-12 h-9 rounded overflow-hidden border-2 transition-all ${
                i === current
                  ? 'border-gold scale-110'
                  : 'border-white/20 opacity-50 hover:opacity-80'
              }`}
            >
              {it.resourceType === 'video' ? (
                <div className="w-full h-full bg-white/10 flex items-center justify-center">
                  <Play className="w-3 h-3 text-white fill-white" />
                </div>
              ) : (
                <img src={it.url} alt="" className="w-full h-full object-cover" />
              )}
            </button>
          ))}
        </div>
      )}
    </motion.div>
  )
}

export default function ProjectDetailPage() {
  const { id }     = useParams()
  const navigate   = useNavigate()
  const [project,         setProject]         = useState(null)
  const [relatedProjects, setRelatedProjects] = useState([])
  const [loading,         setLoading]         = useState(true)
  const [thumbsSwiper,    setThumbsSwiper]    = useState(null)
  const [lightboxOpen,    setLightboxOpen]    = useState(false)
  const [lightboxIndex,   setLightboxIndex]   = useState(0)

  useEffect(() => {
    const fetchProject = async () => {
      if (!id) return
      setLoading(true)
      try {
        const [projectRes, allProjectsRes] = await Promise.all([
          projectsApi.getById(id),
          projectsApi.getAll(),
        ])
        const projectData = projectRes.data?.data || projectRes.data
        setProject(projectData)

        const allProjects = allProjectsRes.data?.data || allProjectsRes.data || []
        const related = allProjects
          .filter((p) => (p._id || p.id) !== id && p.category === projectData?.category)
          .slice(0, 3)
        setRelatedProjects(related)
      } catch (error) {
        console.log('[ProjectDetail] fetch error:', error)
        navigate('/projects')
      } finally {
        setLoading(false)
      }
    }
    fetchProject()
  }, [id, navigate])

  // Open lightbox — index is into mediaItems (all media), lightbox shows all media
  const openLightbox = (index) => {
    setLightboxIndex(index)
    setLightboxOpen(true)
  }

  if (loading) {
    return (
      <div className="min-h-screen pt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Skeleton className="h-8 w-32 mb-8" />
          <Skeleton className="aspect-[16/9] w-full rounded-2xl mb-8" />
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-32 w-full" />
            </div>
            <div className="space-y-4"><Skeleton className="h-48 w-full rounded-xl" /></div>
          </div>
        </div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="min-h-screen pt-24 pb-16 bg-background flex items-center justify-center px-4">
        <div className="max-w-xl text-center">
          <p className="text-lg text-muted-foreground mb-6">We could not load that project right now.</p>
          <Link to="/projects"><Button variant="outline">Back to Projects</Button></Link>
        </div>
      </div>
    )
  }

  const mediaItems = project.images?.length
    ? project.images.map(normaliseMedia).filter(Boolean)
    : FALLBACK_IMAGES.map((url) => ({ url, resourceType: 'image' }))

  return (
    <>
      <div className="min-h-screen pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="mb-8">
            <Link to="/projects" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-4 h-4" />Back to Projects
            </Link>
          </motion.div>

          {/* ── Main gallery swiper ── */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <div className="relative">
              <Swiper
                modules={[Thumbs, Pagination]}
                thumbs={{ swiper: thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null }}
                pagination={{ clickable: true }}
                className="aspect-[16/9] min-h-[220px] rounded-2xl overflow-hidden"
              >
                {mediaItems.map((item, index) => (
                  <SwiperSlide key={index}>
                    {item.resourceType === 'video' ? (
                      <div className="w-full h-full bg-black flex items-center justify-center relative">
                        <video
                          src={item.url}
                          controls
                          playsInline
                          className="w-full h-full object-contain"
                        />
                        <span className="absolute top-3 left-3 flex items-center gap-1 bg-black/70 text-white text-xs px-2 py-0.5 rounded-full pointer-events-none">
                          <Play className="w-2.5 h-2.5 fill-white" /> Video
                        </span>
                      </div>
                    ) : (
                      // ── Image slide: use <button> not <div> so tap works on mobile ──
                      // A <div onClick> on mobile requires a 300ms tap delay and is
                      // sometimes swallowed by Swiper's touch handler.
                      // A <button> is a native interactive element — tap fires instantly.
                      <button
                        type="button"
                        className="w-full h-full block relative group focus:outline-none"
                        onClick={() => openLightbox(index)}
                        aria-label={`View image ${index + 1} fullscreen`}
                      >
                        <img
                          src={item.url}
                          alt={`${project.title} - ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                        {/* Expand hint — desktop hover only */}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors hidden md:flex items-center justify-center">
                          <Maximize2 className="w-10 h-10 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        {/* Mobile tap hint pill */}
                        <span className="absolute bottom-3 right-3 md:hidden flex items-center gap-1 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
                          <Maximize2 className="w-3 h-3" /> Tap to expand
                        </span>
                      </button>
                    )}
                  </SwiperSlide>
                ))}

                {/* Nav arrows — unique class names, no conflict with other Swipers */}
                {mediaItems.length > 1 && (
                  <>
                    <button
                      className="main-gallery-prev absolute left-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-colors shadow-md"
                      onClick={(e) => { e.stopPropagation(); e.currentTarget.closest('.swiper')?.swiper?.slidePrev() }}
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      className="main-gallery-next absolute right-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-colors shadow-md"
                      onClick={(e) => { e.stopPropagation(); e.currentTarget.closest('.swiper')?.swiper?.slideNext() }}
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </>
                )}
              </Swiper>
            </div>

            {/* Thumbnail strip */}
            {mediaItems.length > 1 && (
              <Swiper
                modules={[Thumbs]}
                onSwiper={setThumbsSwiper}
                spaceBetween={10}
                watchSlidesProgress
                className="mt-3"
                breakpoints={{
                  0:    { slidesPerView: 4 },
                  480:  { slidesPerView: 5 },
                  640:  { slidesPerView: 6 },
                  1024: { slidesPerView: 8 },
                }}
              >
                {mediaItems.map((item, index) => (
                  <SwiperSlide key={index}>
                    <div className="aspect-video rounded-lg overflow-hidden cursor-pointer border-2 border-transparent [.swiper-slide-thumb-active_&]:border-gold transition-colors bg-muted">
                      {item.resourceType === 'video' ? (
                        <div className="w-full h-full flex flex-col items-center justify-center gap-1">
                          <Play className="w-4 h-4 text-muted-foreground fill-current" />
                          <span className="text-[9px] text-muted-foreground">Video</span>
                        </div>
                      ) : (
                        <img src={item.url} alt="" className="w-full h-full object-cover" />
                      )}
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            )}

            {mediaItems.length > 1 && (
              <p className="mt-2 text-xs text-muted-foreground">
                {mediaItems.length} files — {mediaItems.filter(m => m.resourceType === 'image').length} images
                {mediaItems.filter(m => m.resourceType === 'video').length > 0 &&
                  ` · ${mediaItems.filter(m => m.resourceType === 'video').length} videos`}
                <span className="ml-2 hidden md:inline text-muted-foreground/60">· Click any image to expand</span>
              </p>
            )}
          </motion.div>

          {/* Project info */}
          <div className="grid lg:grid-cols-3 gap-8">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="lg:col-span-2">
              <span className="inline-block px-4 py-1.5 bg-gold/10 text-gold text-sm font-medium rounded-full mb-4">{project.category}</span>
              <h1 className="text-3xl md:text-4xl font-serif font-bold">{project.title}</h1>
              <div className="flex flex-wrap items-center gap-4 mt-4 text-muted-foreground">
                {project.location && <span className="flex items-center gap-1"><MapPin className="w-4 h-4" />{project.location}</span>}
                {project.completionDate && <span className="flex items-center gap-1"><Calendar className="w-4 h-4" />{new Date(project.completionDate).getFullYear()}</span>}
              </div>
              <div className="mt-8 prose prose-lg max-w-none">
                <p className="text-muted-foreground leading-relaxed">
                  {project.description || 'This stunning project showcases our commitment to luxury and attention to detail.'}
                </p>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <div className="bg-card border border-border rounded-2xl p-6 lg:sticky lg:top-28">
                <h3 className="text-lg font-semibold mb-4">Project Details</h3>
                <dl className="space-y-4">
                  <div className="flex justify-between py-2 border-b border-border">
                    <dt className="text-muted-foreground">Category</dt>
                    <dd className="font-medium">{project.category}</dd>
                  </div>
                  {project.location && (
                    <div className="flex justify-between py-2 border-b border-border">
                      <dt className="text-muted-foreground">Location</dt>
                      <dd className="font-medium">{project.location}</dd>
                    </div>
                  )}
                  {project.completionDate && (
                    <div className="flex justify-between py-2 border-b border-border">
                      <dt className="text-muted-foreground">Year</dt>
                      <dd className="font-medium">{new Date(project.completionDate).getFullYear()}</dd>
                    </div>
                  )}
                  {mediaItems.length > 0 && (
                    <div className="flex justify-between py-2 border-b border-border">
                      <dt className="text-muted-foreground">Media</dt>
                      <dd className="font-medium">{mediaItems.length} file{mediaItems.length !== 1 ? 's' : ''}</dd>
                    </div>
                  )}
                </dl>
                <Link to="/booking" className="block mt-6">
                  <Button variant="gold" className="w-full">Start Your Project <ArrowRight className="w-4 h-4" /></Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Related projects */}
      {relatedProjects.length > 0 && (
        <Section className="bg-sand">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionHeader badge="More Projects" title="Related Projects" description="Explore more of our work in this category." />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {relatedProjects.map((rel, index) => {
                const relId    = rel._id || rel.id
                const relMedia = normaliseMedia(rel.images?.[0])
                return (
                  <motion.div key={relId} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1 }} className="group">
                    <Link to={`/projects/${relId}`}>
                      <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-muted">
                        {relMedia?.resourceType === 'video' ? (
                          <video src={relMedia.url} className="w-full h-full object-cover" muted />
                        ) : (
                          <img src={relMedia?.url || FALLBACK_IMAGES[0]} alt={rel.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        <div className="absolute bottom-4 left-4 right-4">
                          <h3 className="text-lg font-semibold text-white group-hover:text-gold transition-colors">{rel.title}</h3>
                          {rel.location && <p className="text-white/70 text-sm flex items-center gap-1 mt-1"><MapPin className="w-3 h-3" />{rel.location}</p>}
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </Section>
      )}

      {/* ── Lightbox — standalone fixed overlay, not Modal component ── */}
      <AnimatePresence>
        {lightboxOpen && (
          <Lightbox
            items={mediaItems}
            startIndex={lightboxIndex}
            onClose={() => setLightboxOpen(false)}
          />
        )}
      </AnimatePresence>
    </>
  )
}
