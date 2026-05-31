import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Thumbs, Pagination } from 'swiper/modules'
import { ArrowLeft, ArrowRight, MapPin, Calendar, Maximize, ChevronLeft, ChevronRight, X } from 'lucide-react'
import { Section, SectionHeader } from '@/components/ui/Section'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import Modal from '@/components/ui/Modal'
import { projectsApi } from '@/api/services'

import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/thumbs'
import 'swiper/css/pagination'

// Helper: always extract a usable URL string from an image entry
// Backend stores images as { url, publicId } objects, not plain strings
function getImageUrl(img, fallback = 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=1200&q=80') {
  if (!img) return fallback
  if (typeof img === 'string') return img        // plain string (legacy)
  if (img.url) return img.url                    // object { url, publicId }
  return fallback
}

export default function ProjectDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [project, setProject] = useState(null)
  const [relatedProjects, setRelatedProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [thumbsSwiper, setThumbsSwiper] = useState(null)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)

  useEffect(() => {
    const fetchProject = async () => {
      if (!id) return
      setLoading(true)
      try {
        const [projectRes, allProjectsRes] = await Promise.all([
          projectsApi.getById(id),
          projectsApi.getAll(),
        ])

        // FIX: getById returns { success, data: project } → unwrap
        const projectData = projectRes.data?.data || projectRes.data
        setProject(projectData)

        // FIX: getAll returns { success, data: [...] } → unwrap
        const allProjects = allProjectsRes.data?.data || allProjectsRes.data || []
        const related = allProjects
          .filter((p) => (p._id || p.id) !== id && p.category === projectData?.category)
          .slice(0, 3)
        setRelatedProjects(related)
      } catch (error) {
        console.log('[ProjectDetail] Error fetching project:', error)
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
          <p className="text-lg text-muted-foreground mb-6">
            We could not load that project right now.
          </p>
          <Link to="/projects">
            <Button variant="outline" className="mx-auto">Back to Projects</Button>
          </Link>
        </div>
      </div>
    )
  }

  // FIX: map each image entry to a plain URL string using the helper
  const imageUrls = project.images?.length
    ? project.images.map((img) => getImageUrl(img))
    : [
        'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=1200&q=80',
        'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&q=80',
        'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=1200&q=80',
      ]

  return (
    <>
      <div className="min-h-screen pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="mb-8">
            <Link
              to="/projects"
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />Back to Projects
            </Link>
          </motion.div>

          {/* Main image gallery */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <Swiper
              modules={[Navigation, Thumbs, Pagination]}
              navigation={{ prevEl: '.swiper-button-prev-custom', nextEl: '.swiper-button-next-custom' }}
              thumbs={{ swiper: thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null }}
              pagination={{ clickable: true }}
              className="aspect-[16/9] min-h-[260px] rounded-2xl overflow-hidden"
            >
              {imageUrls.map((url, index) => (
                <SwiperSlide key={index}>
                  {/* FIX: use plain url string (not image object) for backgroundImage */}
                  <div
                    className="w-full h-full bg-cover bg-center cursor-pointer relative group"
                    style={{ backgroundImage: `url(${url})` }}
                    onClick={() => openLightbox(index)}
                  >
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                      <Maximize className="w-10 h-10 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                </SwiperSlide>
              ))}
              <button className="swiper-button-prev-custom absolute left-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-colors">
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button className="swiper-button-next-custom absolute right-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-colors">
                <ChevronRight className="w-6 h-6" />
              </button>
            </Swiper>

            {/* Thumbnail strip */}
            {imageUrls.length > 1 && (
              <Swiper
                modules={[Thumbs]}
                onSwiper={setThumbsSwiper}
                spaceBetween={12}
                slidesPerView={6}
                watchSlidesProgress
                className="mt-4"
                breakpoints={{
                  0:    { slidesPerView: 3 },
                  640:  { slidesPerView: 4 },
                  768:  { slidesPerView: 5 },
                  1024: { slidesPerView: 6 },
                }}
              >
                {imageUrls.map((url, index) => (
                  <SwiperSlide key={index}>
                    {/* FIX: use plain url string for thumbnails */}
                    <div
                      className="aspect-video rounded-lg overflow-hidden cursor-pointer border-2 border-transparent hover:border-gold transition-colors"
                      style={{ backgroundImage: `url(${url})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
                    />
                  </SwiperSlide>
                ))}
              </Swiper>
            )}
          </motion.div>

          {/* Project info */}
          <div className="grid lg:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="lg:col-span-2"
            >
              <span className="inline-block px-4 py-1.5 bg-gold/10 text-gold text-sm font-medium rounded-full mb-4">
                {project.category}
              </span>
              <h1 className="text-3xl md:text-4xl font-serif font-bold">{project.title}</h1>
              <div className="flex flex-wrap items-center gap-4 mt-4 text-muted-foreground">
                {project.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />{project.location}
                  </span>
                )}
                {project.completionDate && (
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {new Date(project.completionDate).getFullYear()}
                  </span>
                )}
              </div>
              <div className="mt-8 prose prose-lg max-w-none">
                <p className="text-muted-foreground leading-relaxed">
                  {project.description || 'This stunning project showcases our commitment to luxury and attention to detail.'}
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
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
                  {project.budget && (
                    <div className="flex justify-between py-2 border-b border-border">
                      <dt className="text-muted-foreground">Budget</dt>
                      <dd className="font-medium">₹{Number(project.budget).toLocaleString('en-IN')}</dd>
                    </div>
                  )}
                  {project.completionDate && (
                    <div className="flex justify-between py-2 border-b border-border">
                      <dt className="text-muted-foreground">Year</dt>
                      <dd className="font-medium">{new Date(project.completionDate).getFullYear()}</dd>
                    </div>
                  )}
                </dl>
                <Link to="/booking" className="block mt-6">
                  <Button variant="gold" className="w-full">
                    Start Your Project<ArrowRight className="w-4 h-4" />
                  </Button>
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
                const relId = rel._id || rel.id
                // FIX: related project images are also objects
                const relImageUrl = getImageUrl(rel.images?.[0])
                return (
                  <motion.div
                    key={relId}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="group"
                  >
                    <Link to={`/projects/${relId}`}>
                      <div className="relative aspect-[4/3] rounded-xl overflow-hidden">
                        <img
                          src={relImageUrl}
                          alt={rel.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        <div className="absolute bottom-4 left-4 right-4">
                          <h3 className="text-lg font-semibold text-white group-hover:text-gold transition-colors">
                            {rel.title}
                          </h3>
                          {rel.location && (
                            <p className="text-white/70 text-sm flex items-center gap-1 mt-1">
                              <MapPin className="w-3 h-3" />{rel.location}
                            </p>
                          )}
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

      {/* Lightbox */}
      <Modal isOpen={lightboxOpen} onClose={() => setLightboxOpen(false)} size="full">
        <div className="relative h-[90vh] bg-black flex items-center justify-center">
          <button
            onClick={() => setLightboxOpen(false)}
            className="absolute top-4 right-4 z-20 p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
          >
            <X className="w-6 h-6 text-white" />
          </button>
          <Swiper
            modules={[Navigation, Pagination]}
            navigation
            pagination={{ clickable: true }}
            initialSlide={lightboxIndex}
            className="w-full h-full"
          >
            {imageUrls.map((url, index) => (
              <SwiperSlide key={index} className="flex items-center justify-center">
                {/* FIX: use plain url string for lightbox */}
                <img
                  src={url}
                  alt={`${project.title} - Image ${index + 1}`}
                  className="max-w-full max-h-full object-contain"
                />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </Modal>
    </>
  )
}
