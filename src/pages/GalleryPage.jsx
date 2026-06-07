import { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Play, ArrowLeft, ZoomIn, ChevronLeft, ChevronRight, Images } from 'lucide-react'
import { projectsApi } from '@/api/services'

function normaliseMedia(img) {
  if (!img) return null
  const url = typeof img === 'string' ? img : img.url
  if (!url) return null
  return { url, resourceType: img.resourceType || 'image' }
}

// ─── Lightbox ────────────────────────────────────────────────────────────────
function Lightbox({ items, startIndex, onClose }) {
  const [current, setCurrent] = useState(startIndex)

  const prev = useCallback(() => setCurrent(i => (i - 1 + items.length) % items.length), [items.length])
  const next = useCallback(() => setCurrent(i => (i + 1) % items.length), [items.length])

  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape')     onClose()
      if (e.key === 'ArrowLeft')  prev()
      if (e.key === 'ArrowRight') next()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose, prev, next])

  const item = items[current]

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
      onClick={onClose}
    >
      {/* Close */}
      <button
        onClick={onClose}
        className="absolute top-5 right-5 z-20 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
      >
        <X className="w-5 h-5 text-white" />
      </button>

      {/* Counter */}
      <span className="absolute top-5 left-5 z-20 text-white/60 text-sm font-medium tabular-nums">
        {current + 1} / {items.length}
      </span>

      {/* Prev */}
      {items.length > 1 && (
        <button
          onClick={(e) => { e.stopPropagation(); prev() }}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
        >
          <ChevronLeft className="w-6 h-6 text-white" />
        </button>
      )}

      {/* Media */}
      <div
        className="max-w-5xl max-h-[85vh] w-full px-16 flex items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.18 }}
            className="w-full"
          >
            {item.resourceType === 'video' ? (
              <video
                src={item.url}
                controls
                autoPlay
                playsInline
                className="max-h-[80vh] w-full object-contain rounded-xl"
              />
            ) : (
              <img
                src={item.url}
                alt=""
                className="max-h-[80vh] w-full object-contain rounded-xl"
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Next */}
      {items.length > 1 && (
        <button
          onClick={(e) => { e.stopPropagation(); next() }}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
        >
          <ChevronRight className="w-6 h-6 text-white" />
        </button>
      )}

      {/* Thumbnail filmstrip */}
      {items.length > 1 && (
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2 px-4 overflow-x-auto max-w-[90vw] pb-1">
          {items.map((it, i) => (
            <button
              key={i}
              onClick={(e) => { e.stopPropagation(); setCurrent(i) }}
              className={`flex-shrink-0 w-12 h-9 rounded-md overflow-hidden border-2 transition-all ${
                i === current ? 'border-gold scale-110' : 'border-white/20 opacity-50 hover:opacity-80'
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

// ─── Masonry Grid ─────────────────────────────────────────────────────────────
function MasonryGrid({ items, onItemClick }) {
  // Split into 3 columns for visual masonry feel
  const cols = [[], [], []]
  items.forEach((item, i) => cols[i % 3].push({ ...item, globalIdx: i }))

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
      {cols.map((col, colIdx) => (
        <div key={colIdx} className="flex flex-col gap-3 md:gap-4">
          {col.map((item) => {
            // Vary aspect ratios for masonry feel
            const aspectClass =
              item.globalIdx % 5 === 0 ? 'aspect-square' :
              item.globalIdx % 7 === 0 ? 'aspect-[3/4]' :
              item.globalIdx % 4 === 0 ? 'aspect-[4/3]' :
              'aspect-[3/4]'

            return (
              <motion.div
                key={item.globalIdx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.4, delay: (item.globalIdx % 6) * 0.05 }}
                onClick={() => onItemClick(item.globalIdx)}
                className={`relative ${aspectClass} rounded-xl overflow-hidden cursor-pointer group bg-muted`}
              >
                {item.resourceType === 'video' ? (
                  <>
                    <video
                      src={item.url}
                      muted
                      playsInline
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30 group-hover:scale-110 transition-transform">
                        <Play className="w-5 h-5 text-white fill-white ml-0.5" />
                      </div>
                    </div>
                    <span className="absolute top-2 left-2 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Play className="w-2.5 h-2.5 fill-white" /> Video
                    </span>
                  </>
                ) : (
                  <>
                    <img
                      src={item.url}
                      alt={item.projectTitle || ''}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition-colors flex items-center justify-center">
                      <ZoomIn className="w-7 h-7 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg" />
                    </div>
                  </>
                )}

                {/* Project name tooltip on hover */}
                {item.projectTitle && (
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent px-3 pb-2 pt-6 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                    <p className="text-white text-xs font-medium truncate">{item.projectTitle}</p>
                  </div>
                )}
              </motion.div>
            )
          })}
        </div>
      ))}
    </div>
  )
}

// ─── Filter pill ──────────────────────────────────────────────────────────────
function Pill({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
        active
          ? 'bg-gold text-charcoal shadow-sm'
          : 'bg-muted text-muted-foreground hover:bg-muted/80'
      }`}
    >
      {label}
    </button>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function GalleryPage() {
  const [allItems,   setAllItems]   = useState([])  // flat list of all media
  const [filtered,   setFiltered]   = useState([])
  const [loading,    setLoading]    = useState(true)
  const [filter,     setFilter]     = useState('All') // All | Images | Videos
  const [lightboxIdx, setLightboxIdx] = useState(null)

  useEffect(() => {
    ;(async () => {
      try {
        const res = await projectsApi.getAll()
        const projects = res.data?.data || res.data || []

        // Flatten every image/video from every project into one list
        const flat = []
        projects.forEach((project) => {
          ;(project.images || []).forEach((img) => {
            const m = normaliseMedia(img)
            if (m) flat.push({ ...m, projectTitle: project.title, projectId: project._id || project.id })
          })
        })
        setAllItems(flat)
        setFiltered(flat)
      } catch (err) {
        console.error('[GalleryPage]', err)
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  useEffect(() => {
    if (filter === 'Images') setFiltered(allItems.filter(i => i.resourceType !== 'video'))
    else if (filter === 'Videos') setFiltered(allItems.filter(i => i.resourceType === 'video'))
    else setFiltered(allItems)
  }, [filter, allItems])

  const imageCount = allItems.filter(i => i.resourceType !== 'video').length
  const videoCount = allItems.filter(i => i.resourceType === 'video').length

  return (
    <>
      {/* Hero */}
      <section className="relative pt-28 pb-14 bg-charcoal overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-gold via-transparent to-transparent" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            to="/projects"
            className="inline-flex items-center gap-2 text-white/50 hover:text-white/80 text-sm mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Projects
          </Link>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gold/20 flex items-center justify-center">
                <Images className="w-5 h-5 text-gold" />
              </div>
              <span className="text-gold text-sm font-medium tracking-widest uppercase">Full Collection</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-white leading-tight">
              Our Complete Works
            </h1>
            <p className="mt-4 text-white/60 text-lg max-w-xl">
              Every project, every detail — the full visual story of Modplint Interiors.
            </p>

            {!loading && (
              <div className="mt-6 flex flex-wrap gap-4 text-sm text-white/50">
                <span>{imageCount} photographs</span>
                {videoCount > 0 && <span>· {videoCount} videos</span>}
                <span>· {allItems.length} total</span>
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* Filter bar */}
      <div className="sticky top-0 z-30 bg-background/95 backdrop-blur border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center gap-2 overflow-x-auto">
          <Pill label={`All (${allItems.length})`}     active={filter === 'All'}    onClick={() => setFilter('All')} />
          <Pill label={`Images (${imageCount})`}       active={filter === 'Images'} onClick={() => setFilter('Images')} />
          {videoCount > 0 && (
            <Pill label={`Videos (${videoCount})`}     active={filter === 'Videos'} onClick={() => setFilter('Videos')} />
          )}
        </div>
      </div>

      {/* Gallery */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className={`rounded-xl bg-muted animate-pulse ${i % 4 === 0 ? 'aspect-square' : 'aspect-[3/4]'}`} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-32 text-center">
            <p className="text-muted-foreground text-lg">No media found.</p>
            <button onClick={() => setFilter('All')} className="mt-3 text-gold hover:underline text-sm">
              Show all
            </button>
          </div>
        ) : (
          <MasonryGrid items={filtered} onItemClick={setLightboxIdx} />
        )}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxIdx !== null && (
          <Lightbox
            items={filtered}
            startIndex={lightboxIdx}
            onClose={() => setLightboxIdx(null)}
          />
        )}
      </AnimatePresence>
    </>
  )
}
