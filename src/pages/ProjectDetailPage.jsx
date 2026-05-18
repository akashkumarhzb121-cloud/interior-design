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
        const [projectRes, allProjectsRes] = await Promise.all([projectsApi.getById(id), projectsApi.getAll()])
        setProject(projectRes.data)
        const related = (allProjectsRes.data || []).filter((p) => p._id !== id && p.category === projectRes.data?.category).slice(0, 3)
        setRelatedProjects(related)
      } catch (error) {
        console.log('[v0] Error fetching project:', error)
        navigate('/projects')
      } finally {
        setLoading(false)
      }
    }
    fetchProject()
  }, [id, navigate])

  const openLightbox = (index) => { setLightboxIndex(index); setLightboxOpen(true); }

  if (loading) {
    return (
      <div className="min-h-screen pt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Skeleton className="h-8 w-32 mb-8" />
          <Skeleton className="aspect-[16/9] w-full rounded-2xl mb-8" />
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4"><Skeleton className="h-10 w-3/4" /><Skeleton className="h-6 w-1/2" /><Skeleton className="h-32 w-full" /></div>
            <div className="space-y-4"><Skeleton className="h-48 w-full rounded-xl" /></div>
          </div>
        </div>
      </div>
    )
  }

  if (!project) return null

  const images = project.images?.length ? project.images : [
    'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=1200&q=80',
    'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&q=80',
    'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=1200&q=80',
  ]

  return (
    <>
      <div className="min-h-screen pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="mb-8">
            <Link to="/projects" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"><ArrowLeft className="w-4 h-4" />Back to Projects</Link>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <Swiper modules={[Navigation, Thumbs, Pagination]} navigation={{ prevEl: '.swiper-button-prev-custom', nextEl: '.swiper-button-next-custom' }} thumbs={{ swiper: thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null }} pagination={{ clickable: true }} className="aspect-[16/9] rounded-2xl overflow-hidden">
              {images.map((image, index) => (
                <SwiperSlide key={index}>
                  <div className="w-full h-full bg-cover bg-center cursor-pointer relative group" style={{ backgroundImage: `url(${image})` }} onClick={() => openLightbox(index)}>
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center"><Maximize className="w-10 h-10 text-white opacity-0 group-hover:opacity-100 transition-opacity" /></div>
                  </div>
                </SwiperSlide>
              ))}
              <button className="swiper-button-prev-custom absolute left-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-colors"><ChevronLeft className="w-6 h-6" /></button>
              <button className="swiper-button-next-custom absolute right-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-colors"><ChevronRight className="w-6 h-6" /></button>
            </Swiper>

            {images.length > 1 && (
              <Swiper modules={[Thumbs]} onSwiper={setThumbsSwiper} spaceBetween={12} slidesPerView={6} watchSlidesProgress className="mt-4" breakpoints={{ 0: { slidesPerView: 3 }, 640: { slidesPerView: 4 }, 768: { slidesPerView: 5 }, 1024: { slidesPerView: 6 } }}>
                {images.map((image, index) => (
                  <SwiperSlide key={index}>
                    <div className="aspect-video rounded-lg overflow-hidden cursor-pointer border-2 border-transparent hover:border-gold transition-colors" style={{ backgroundImage: `url(${image})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
                  </SwiperSlide>
                ))}
              </Swiper>
            )}
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-8">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="lg:col-span-2">
              <span className="inline-block px-4 py-1.5 bg-gold/10 text-gold text-sm font-medium rounded-full mb-4">{project.category}</span>
              <h1 className="text-3xl md:text-4xl font-serif font-bold">{project.title}</h1>
              <div className="flex flex-wrap items-center gap-4 mt-4 text-muted-foreground">
                <span className="flex items-center gap-1"><MapPin className="w-4 h-4" />{project.location}</span>
                {project.year && <span className="flex items-center gap-1"><Calendar className="w-4 h-4" />{project.year}</span>}
                {project.area && <span className="flex items-center gap-1"><Maximize className="w-4 h-4" />{project.area}</span>}
              </div>
              <div className="mt-8 prose prose-lg max-w-none">
                <p className="text-muted-foreground leading-relaxed">{project.description || 'This stunning project showcases our commitment to luxury and attention to detail.'}</p>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <div className="bg-card border border-border rounded-2xl p-6 sticky top-28">
                <h3 className="text-lg font-semibold mb-4">Project Details</h3>
                <dl className="space-y-4">
                  <div className="flex justify-between py-2 border-b border-border"><dt className="text-muted-foreground">Category</dt><dd className="font-medium">{project.category}</dd></div>
                  <div className="flex justify-between py-2 border-b border-border"><dt className="text-muted-foreground">Location</dt><dd className="font-medium">{project.location}</dd></div>
                  {project.area && <div className="flex justify-between py-2 border-b border-border"><dt className="text-muted-foreground">Area</dt><dd className="font-medium">{project.area}</dd></div>}
                  {project.year && <div className="flex justify-between py-2 border-b border-border"><dt className="text-muted-foreground">Year</dt><dd className="font-medium">{project.year}</dd></div>}
                </dl>
                <Link to="/booking" className="block mt-6"><Button variant="gold" className="w-full">Start Your Project<ArrowRight className="w-4 h-4" /></Button></Link>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {relatedProjects.length > 0 && (
        <Section className="bg-sand">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionHeader badge="More Projects" title="Related Projects" description="Explore more of our work in this category." />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {relatedProjects.map((relatedProject, index) => (
                <motion.div key={relatedProject._id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1 }} className="group">
                  <Link to={`/projects/${relatedProject._id}`}>
                    <div className="relative aspect-[4/3] rounded-xl overflow-hidden">
                      <img src={relatedProject.images?.[0] || 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=600&q=80'} alt={relatedProject.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <div className="absolute bottom-4 left-4 right-4">
                        <h3 className="text-lg font-semibold text-white group-hover:text-gold transition-colors">{relatedProject.title}</h3>
                        <p className="text-white/70 text-sm flex items-center gap-1 mt-1"><MapPin className="w-3 h-3" />{relatedProject.location}</p>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </Section>
      )}

      <Modal isOpen={lightboxOpen} onClose={() => setLightboxOpen(false)} size="full">
        <div className="relative h-[90vh] bg-black flex items-center justify-center">
          <button onClick={() => setLightboxOpen(false)} className="absolute top-4 right-4 z-20 p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors"><X className="w-6 h-6 text-white" /></button>
          <Swiper modules={[Navigation, Pagination]} navigation pagination={{ clickable: true }} initialSlide={lightboxIndex} className="w-full h-full">
            {images.map((image, index) => (
              <SwiperSlide key={index} className="flex items-center justify-center"><img src={image} alt={`${project.title} - Image ${index + 1}`} className="max-w-full max-h-full object-contain" /></SwiperSlide>
            ))}
          </Swiper>
        </div>
      </Modal>
    </>
  )
}
