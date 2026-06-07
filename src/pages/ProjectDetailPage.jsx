import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Thumbs, Pagination } from 'swiper/modules'
import { ArrowLeft, ArrowRight, MapPin, Calendar, Maximize, ChevronLeft, ChevronRight, X, Play } from 'lucide-react'
import { Section, SectionHeader } from '@/components/ui/Section'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import { projectsApi } from '@/api/services'

import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/thumbs'
import 'swiper/css/pagination'

function normaliseMedia(img) {
  if (!img) return null
  const url = typeof img === 'string' ? img : img.url
  if (!url) return null
  const resourceType = img.resourceType || 'image'
  return { url, resourceType }
}

const FALLBACK_IMAGES = [
  'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=1200&q=80',
  'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&q=80',
  'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=1200&q=80',
]

// ─── Standalone lightbox overlay (replaces Modal+Swiper which caused redirect) ─
// FIX: The old Modal contained a <Swiper navigation> which searched the DOM for
// .swiper-prev / .swiper-next and found the MAIN gallery's buttons instead.
// On mobile this caused a wrong navigation event → modal unmounted → /admin/login.
// This plain fixed div has zero dependency on Swiper — no conflict possible.
function Lightbox({ items, startIndex, onClose }) {
  const [current, setCurrent] = useState(startIndex)
  const total = items.length

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') setCurrent(i => (i - 1 + total) % total)
      if (e.key === 'ArrowRight') setCurrent(i => (i + 1) % total)
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKey)
    }
  }, [onClose, total])

  const item = items[current]

  return (
    <div
      className="fixed inset-0 z-[9999] bg-black/95 flex flex-col"
      onClick={onClose}
    >
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-3" onClick={e => e.stopPropagation()}>
        <span className="text-white/50 text-sm">{current + 1} / {total}</span>
        <button
          onClick={onClose}
          className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center"
        >
          <X className="w-5 h-5 text-white" />
        </button>
      </div>

      {/* Media */}
      <div
        className="flex-1 flex items-center justify-center relative min-h-0 px-14"
        onClick={e => e.stopPropagation()}
      >
        {total > 1 && (
          <button
            onClick={() => setCurrent(i => (i - 1 + total) % total)}
            className="absolute left-2 z-10 w-10 h-10 rounded-full bg-white/10 hover:bg-white/25 flex items-center justify-center"
          >
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>
        )}

        {item.resourceType === 'video' ? (
          <video
            src={item.url}
            controls autoPlay playsInline
            className="max-w-full max-h-full rounded-lg object-contain"
            style={{ maxHeight: 'calc(100vh - 160px)' }}
          />
        ) : (
          <img
            src={item.url}
            alt=""
            className="max-w-full max-h-full rounded-lg object-contain select-none"
            style={{ maxHeight: 'calc(100vh - 160px)' }}
            draggable={false}
          />
        )}

        {total > 1 && (
          <button
            onClick={() => setCurrent(i => (i + 1) % total)}
            className="absolute right-2 z-10 w-10 h-10 rounded-full bg-white/10 hover:bg-white/25 flex items-center justify-center"
          >
            <ChevronRight className="w-6 h-6 text-white" />
          </button>
        )}
      </div>

      {/* Thumbnails */}
      {total > 1 && (
        <div
          className="flex gap-2 px-4 py-3 overflow-x-auto justify-center"
          onClick={e => e.stopPropagation()}
        >
          {items.map((it, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`flex-shrink-0 w-12 h-9 rounded overflow-hidden border-2 transition-all ${
                i === current ? 'border-gold scale-110' : 'border-white/20 opacity-50 hover:opacity-80'
              }`}
            >
              {it.resourceType === 'video'
                ? <div className="w-full h-full bg-white/10 flex items-center justify-center"><Play className="w-3 h-3 text-white fill-white" /></div>
                : <img src={it.url} alt="" className="w-full h-full object-cover" />
              }
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default function ProjectDetailPage() {
  const { id }       = useParams()
  const navigate     = useNavigate()
  const [project, setProject]               = useState(null)
  const [relatedProjects, setRelatedProjects] = useState([])
  const [loading, setLoading]               = useState(true)
  const [thumbsSwiper, setThumbsSwiper]     = useState(null)
  const [lightboxOpen, setLightboxOpen]     = useState(false)
  const [lightboxIndex, setLightboxIndex]   = useState(0)

  useEffect(() => {
    const fetchProject = async () => {
      if (!id) return
      setLoading(true)
      try {
        const [projectRes, allProjectsRes] = await Promise.all([
          projectsApi.getById(id),
          projectsApi.getAll(),
        ])
        const projectData  = projectRes.data?.data || projectRes.data
        setProject(projectData)

        const allProjects = allProjectsRes.data?.data || allProjectsRes.data || []
        const related     = allProjects
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

  const openLightbox = (index) => { setLightboxIndex(index); setLightboxOpen(true) }

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

          {/* ── Main media gallery ── */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <Swiper
              modules={[Navigation, Thumbs, Pagination]}
              navigation={{ prevEl: '.swiper-prev', nextEl: '.swiper-next' }}
              thumbs={{ swiper: thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null }}
              pagination={{ clickable: true }}
              className="aspect-[16/9] min-h-[260px] rounded-2xl overflow-hidden"
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
                    // FIX: changed from <div onClick> to <button onClick>
                    // On mobile, <div> tap events are swallowed by Swiper's touch
                    // handler. <button> is natively interactive — tap fires every time.
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
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center pointer-events-none">
                        <Maximize className="w-10 h-10 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </button>
                  )}
                </SwiperSlide>
              ))}
              <button className="swiper-prev absolute left-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-colors">
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button className="swiper-next absolute right-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-colors">
                <ChevronRight className="w-6 h-6" />
              </button>
            </Swiper>

            {/* Thumbnail strip */}
            {mediaItems.length > 1 && (
              <Swiper
                modules={[Thumbs]}
                onSwiper={setThumbsSwiper}
                spaceBetween={12}
                slidesPerView={6}
                watchSlidesProgress
                className="mt-4"
                breakpoints={{ 0: { slidesPerView: 3 }, 640: { slidesPerView: 4 }, 768: { slidesPerView: 5 }, 1024: { slidesPerView: 6 } }}
              >
                {mediaItems.map((item, index) => (
                  <SwiperSlide key={index}>
                    <div className="aspect-video rounded-lg overflow-hidden cursor-pointer border-2 border-transparent hover:border-gold transition-colors bg-muted">
                      {item.resourceType === 'video' ? (
                        <div className="w-full h-full flex flex-col items-center justify-center gap-1">
                          <Play className="w-5 h-5 text-muted-foreground fill-current" />
                          <span className="text-[10px] text-muted-foreground">Video</span>
                        </div>
                      ) : (
                        <div
                          className="w-full h-full bg-cover bg-center"
                          style={{ backgroundImage: `url(${item.url})` }}
                        />
                      )}
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            )}

            {mediaItems.length > 1 && (
              <p className="mt-2 text-xs text-muted-foreground">
                {mediaItems.length} files — {mediaItems.filter(m => m.resourceType === 'image').length} images · {mediaItems.filter(m => m.resourceType === 'video').length} videos
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
                  <Button variant="gold" className="w-full">Start Your Project<ArrowRight className="w-4 h-4" /></Button>
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

      {/* FIX: Replaced <Modal> + <Swiper navigation> with a plain fixed overlay.
          The old Modal had <Swiper navigation> which searched the whole DOM for
          .swiper-prev and .swiper-next, found the main gallery's buttons,
          caused a wrong Swiper event on mobile → modal unmounted → /admin/login.
          This Lightbox component is just a div — no Swiper, no conflict. */}
      {lightboxOpen && (
        <Lightbox
          items={mediaItems}
          startIndex={lightboxIndex}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </>
  )
}
