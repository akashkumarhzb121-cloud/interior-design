import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, useScroll, useTransform } from 'framer-motion'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay, EffectFade, Pagination } from 'swiper/modules'
import { ArrowRight, Play, Star, MapPin, Award, Users, Home as HomeIcon } from 'lucide-react'
import { Section, SectionHeader } from '@/components/ui/Section'
import { Button } from '@/components/ui/Button'
import { ProjectCardSkeleton, ServiceCardSkeleton, TestimonialCardSkeleton } from '@/components/ui/Skeleton'
import { projectsApi, servicesApi, testimonialsApi } from '@/api/services'
import { cn } from '@/lib/utils'

import 'swiper/css'
import 'swiper/css/effect-fade'
import 'swiper/css/pagination'

const heroImages = [
  'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=1920&q=80',
  'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1920&q=80',
  'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=1920&q=80',
]

const stats = [
  { icon: HomeIcon, value: '30+', label: 'Projects Completed' },
  { icon: Users,    value: '25+', label: 'Happy Clients' },
  { icon: Award,    value: '8.3/10',   label: 'Performance Achieved' },
  { icon: MapPin,   value: '20+',  label: 'Locations in Mumbai' },
]

// Fallback images per service index when no image is uploaded yet
const FALLBACK_SERVICE_IMAGES = [
  'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=800&q=80',
  'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800&q=80',
  'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=80',
  'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=800&q=80',
]

export default function HomePage() {
  const [projects,     setProjects]     = useState([])
  const [services,     setServices]     = useState([])
  const [testimonials, setTestimonials] = useState([])
  const [loading,      setLoading]      = useState(true)

  const { scrollYProgress } = useScroll()
  const heroOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0])
  const heroScale   = useTransform(scrollYProgress, [0, 0.2], [1, 1.1])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [projectsRes, servicesRes, testimonialsRes] = await Promise.all([
          projectsApi.getAll(),
          servicesApi.getAll(),
          testimonialsApi.getAll(),
        ])
        const projectsArr     = projectsRes.data?.data     || projectsRes.data     || []
        const servicesArr     = servicesRes.data?.data      || servicesRes.data      || []
        const testimonialsArr = testimonialsRes.data?.data  || testimonialsRes.data  || []

        setProjects(    Array.isArray(projectsArr)     ? projectsArr.slice(0, 6)   : [])
        setServices(    Array.isArray(servicesArr)     ? servicesArr.slice(0, 4)   : [])
        setTestimonials(Array.isArray(testimonialsArr) ? testimonialsArr            : [])
      } catch (error) {
        console.log('[HomePage] fetch error:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  return (
    <>
      {/* ── Hero ── */}
      <section className="relative min-h-[70vh] sm:min-h-[75vh] md:min-h-[80vh] lg:min-h-[90vh] overflow-hidden">
        <motion.div style={{ opacity: heroOpacity, scale: heroScale }} className="absolute inset-0">
          <Swiper
            modules={[Autoplay, EffectFade, Pagination]}
            effect="fade"
            autoplay={{ delay: 5000, disableOnInteraction: false }}
            pagination={{ clickable: true }}
            loop
            className="h-full w-full"
          >
            {heroImages.map((image, index) => (
              <SwiperSlide key={index}>
                <div className="h-full w-full bg-cover bg-center" style={{ backgroundImage: `url(${image})` }}>
                  <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </motion.div>

        <div className="relative z-10 h-full flex items-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="max-w-3xl"
            >
              <span className="inline-block px-4 py-2 bg-gold/20 backdrop-blur text-gold text-sm font-medium rounded-full mb-6">
                Premium Interior Design in Mumbai
              </span>
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-serif font-bold text-white leading-tight">
                Transform Your Space Into a{' '}
                <span className="text-gold">Masterpiece</span>
              </h1>
              <p className="mt-6 text-lg md:text-xl text-white/80 max-w-xl leading-relaxed">
                Experience luxury living with our bespoke interior design solutions.
                From concept to completion, we create spaces that inspire.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <Link to="/booking">
                  <Button variant="gold" size="xl" className="w-full sm:w-auto">
                    Book Free Consultation
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                </Link>
                <Link to="/projects">
                  <Button variant="outline" size="xl" className="w-full sm:w-auto bg-white/10 border-white/30 text-white hover:bg-white/20">
                    <Play className="w-5 h-5" />
                    View Our Work
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
        >
          <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
            <motion.div animate={{ y: [0, 12, 0] }} transition={{ duration: 1.5, repeat: Infinity }} className="w-1.5 h-1.5 bg-gold rounded-full mt-2" />
          </div>
        </motion.div>
      </section>

      {/* ── Stats ── */}
      <Section className="bg-charcoal py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="w-14 h-14 mx-auto bg-gold/10 rounded-xl flex items-center justify-center mb-4">
                  <stat.icon className="w-7 h-7 text-gold" />
                </div>
                <div className="text-3xl md:text-4xl font-serif font-bold text-white">{stat.value}</div>
                <div className="mt-1 text-sm text-white/60">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      {/* ── Featured Projects ── */}
      <Section className="bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
            <SectionHeader
              badge="Our Portfolio"
              title="Featured Projects"
              description="Discover our latest interior design transformations across Mumbai's most prestigious addresses."
              className="mb-0"
            />
            <Link to="/projects" className="flex-shrink-0">
              <Button variant="outline" className="group">
                View All Projects
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {loading
              ? Array.from({ length: 6 }).map((_, i) => <ProjectCardSkeleton key={i} />)
              : projects.map((project, index) => (
                  <ProjectCard key={project._id || project.id || index} project={project} index={index} />
                ))}
          </div>
        </div>
      </Section>

      {/* ── Services ── REDESIGNED with real images ── */}
      <Section className="bg-charcoal overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            badge="What We Offer"
            title="Our Services"
            description="Comprehensive interior design services tailored to transform your vision into reality."
            centered
            className="text-white [&_p]:text-white/70"
          />

          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {loading
              ? Array.from({ length: 4 }).map((_, i) => <ServiceCardSkeleton key={i} />)
              : services.map((service, index) => (
                  <ServiceCard key={service._id} service={service} index={index} />
                ))}
          </div>

          <div className="mt-12 text-center">
            <Link to="/services">
              <Button variant="gold" size="lg">
                Explore All Services
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </Section>

      {/* ── Why Choose Us ── */}
      <Section className="bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <SectionHeader
                badge="Why Modplint Interiors"
                title="Creating Timeless Spaces Since 2024"
                description="With years of experience, we've established ourselves as Mumbai's premier interior design studio, blending contemporary aesthetics with timeless elegance."
                className="mb-8"
              />
              <div className="space-y-6">
                {[
                  { title: 'Design Solutions',          desc: 'Every project is unique, crafted to reflect your personality and lifestyle.' },
                  { title: 'End-to-End Service',        desc: 'From concept development to final installation, we handle everything.' },
                  { title: 'Premium Materials',         desc: 'We source only the finest materials from trusted suppliers worldwide.' },
                  { title: 'On-Time Delivery',          desc: 'We respect your time and deliver projects within the agreed timeline.' },
                ].map((item, index) => (
                  <motion.div
                    key={item.title}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="flex gap-4"
                  >
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center">
                      <div className="w-3 h-3 rounded-full bg-gold" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{item.title}</h3>
                      <p className="text-muted-foreground text-sm mt-1">{item.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="aspect-[4/5] rounded-2xl overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=800&q=80"
                  alt="Luxury interior design"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-gold text-charcoal p-6 rounded-2xl shadow-xl">
                <div className="text-4xl font-serif font-bold">2+</div>
                <div className="text-sm font-medium">Years of Excellence</div>
              </div>
            </motion.div>
          </div>
        </div>
      </Section>

      {/* ── Testimonials ── */}
      <Section className="bg-charcoal">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            badge="Client Stories"
            title="What Our Clients Say"
            description="Hear from homeowners and businesses who trusted us with their spaces."
            centered
            className="text-white [&_p]:text-white/70"
          />
          {loading ? (
            <div className="grid md:grid-cols-3 gap-6">
              {Array.from({ length: 3 }).map((_, i) => <TestimonialCardSkeleton key={i} />)}
            </div>
          ) : testimonials.length === 0 ? (
            <p className="text-center text-white/50 py-12">No testimonials yet.</p>
          ) : (
            <Swiper
              modules={[Autoplay, Pagination]}
              autoplay={{ delay: 4000, disableOnInteraction: false }}
              pagination={{ clickable: true }}
              spaceBetween={24}
              slidesPerView={1}
              breakpoints={{ 768: { slidesPerView: 2 }, 1024: { slidesPerView: 3 } }}
              className="pb-12"
            >
              {testimonials.map((testimonial) => (
                <SwiperSlide key={testimonial._id}>
                  <TestimonialCard testimonial={testimonial} />
                </SwiperSlide>
              ))}
            </Swiper>
          )}
        </div>
      </Section>

      {/* ── CTA ── */}
      <Section className="bg-gradient-to-br from-gold/20 via-background to-gold/10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <span className="inline-block px-4 py-2 bg-gold/10 text-gold text-sm font-medium rounded-full mb-6">
              Start Your Journey
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold">
              Ready to Create Your Dream Space?
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Book a free consultation with our expert designers and let's bring your vision to life.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/booking">
                <Button variant="gold" size="xl">
                  Schedule Consultation <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <Link to="/contact">
                <Button variant="outline" size="xl">Contact Us</Button>
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
  const FALLBACK   = 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=600&q=80'

  // Find first image (skip videos for the thumbnail)
  const firstImg   = images.find(img => !img.resourceType || img.resourceType === 'image')
  const firstVideo = images.find(img => img.resourceType === 'video')
  const previewUrl = firstImg?.url || firstVideo?.url || (typeof images[0] === 'string' ? images[0] : FALLBACK)
  const isVideo    = !firstImg && !!firstVideo

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      className="group"
    >
      <Link to={projectId ? `/projects/${projectId}` : '/projects'}>
        <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-muted">
          {isVideo ? (
            <video src={previewUrl} muted className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
          ) : (
            <img
              src={previewUrl}
              alt={project.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              onError={(e) => { e.target.src = FALLBACK }}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          {images.length > 1 && (
            <span className="absolute top-3 right-3 bg-black/60 text-white text-xs px-2 py-0.5 rounded-full">
              +{images.length - 1} more
            </span>
          )}
          <div className="absolute bottom-4 left-4 right-4 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all">
            <span className="inline-flex items-center gap-2 text-white text-sm font-medium">
              View Project <ArrowRight className="w-4 h-4" />
            </span>
          </div>
        </div>
        <div className="mt-4">
          <span className="text-sm text-gold font-medium">{project.category}</span>
          <h3 className="mt-1 text-lg font-semibold group-hover:text-gold transition-colors">{project.title}</h3>
          <p className="mt-1 text-sm text-muted-foreground flex items-center gap-1">
            <MapPin className="w-3 h-3" />{project.location}
          </p>
        </div>
      </Link>
    </motion.div>
  )
}

// ─── Service Card — shows all uploaded images/videos with gallery ─────────────
function ServiceCard({ service, index }) {
  const [activeIdx, setActiveIdx] = useState(0)

  // Build media list: prefer media[], fall back to legacy image field, then unsplash
  const mediaItems = (() => {
    if (service.media && service.media.length > 0) return service.media
    if (service.image?.url) return [{ url: service.image.url, resourceType: 'image' }]
    return [{ url: FALLBACK_SERVICE_IMAGES[index % FALLBACK_SERVICE_IMAGES.length], resourceType: 'image' }]
  })()

  const current  = mediaItems[activeIdx] || mediaItems[0]
  const isVideo  = current?.resourceType === 'video'
  const fallback = FALLBACK_SERVICE_IMAGES[index % FALLBACK_SERVICE_IMAGES.length]

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      className="group relative overflow-hidden rounded-2xl cursor-pointer"
    >
      <Link to="/services">
        <div className="relative aspect-[3/4] overflow-hidden bg-charcoal">
          {/* ── Active media: image or video ── */}
          {isVideo ? (
            <video
              key={current.url}
              src={current.url}
              muted
              loop
              playsInline
              autoPlay
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          ) : (
            <img
              key={current.url}
              src={current.url}
              alt={service.title}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              onError={(e) => { e.target.src = fallback }}
            />
          )}

          {/* ── Thumbnail dots for multiple files ── */}
          {mediaItems.length > 1 && (
            <div className="absolute top-3 left-0 right-0 flex justify-center gap-1.5 z-10">
              {mediaItems.map((_, i) => (
                <button
                  key={i}
                  onClick={(e) => { e.preventDefault(); setActiveIdx(i) }}
                  className={cn(
                    'w-1.5 h-1.5 rounded-full transition-all duration-200',
                    i === activeIdx ? 'bg-gold scale-125' : 'bg-white/50 hover:bg-white/80'
                  )}
                />
              ))}
            </div>
          )}

          {/* Dark gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent transition-all duration-500" />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-500" />

          {/* Gold sweep line */}
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-gold to-transparent transform -translate-x-full group-hover:translate-x-0 transition-transform duration-700" />

          {/* Bottom content */}
          <div className="absolute bottom-0 left-0 right-0 p-5">
            <div className="mb-3 inline-flex items-center gap-1.5">
              <span className="w-5 h-px bg-gold" />
              <span className="text-gold text-xs font-medium tracking-widest uppercase">
                {String(index + 1).padStart(2, '0')}
              </span>
              {mediaItems.length > 1 && (
                <span className="ml-1 text-white/50 text-[10px]">{mediaItems.length} files</span>
              )}
            </div>

            <h3 className="text-white text-xl font-serif font-bold leading-tight group-hover:text-gold transition-colors duration-300">
              {service.title}
            </h3>

            <div className="overflow-hidden max-h-0 group-hover:max-h-32 transition-all duration-500 ease-in-out">
              <p className="text-white/75 text-sm leading-relaxed mt-2 line-clamp-3">
                {service.description}
              </p>
              {service.features && service.features.length > 0 && (
                <ul className="mt-3 space-y-1">
                  {service.features.slice(0, 2).map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-xs text-white/60">
                      <div className="w-1 h-1 rounded-full bg-gold flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="mt-3 flex items-center gap-2 text-gold text-sm font-medium opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
              <span>Learn More</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

// ─── Testimonial Card ─────────────────────────────────────────────────────────
// FIX: now renders testimonial.media[] (uploaded photos/videos) in addition to
//      the legacy testimonial.image field. Previously only the avatar used
//      image.url — uploaded media was completely invisible on the home page.
function TestimonialCard({ testimonial }) {
  const [activeMedia, setActiveMedia] = useState(0)

  // Combine new media[] array with legacy single image field
  const mediaItems = [
    ...(testimonial.media || []),
    ...(!testimonial.media?.length && testimonial.image?.url
      ? [{ url: testimonial.image.url, resourceType: 'image' }]
      : []),
  ]

  // Avatar: prefer first image in media[], fall back to legacy image.url
  const avatarUrl =
    testimonial.image?.url ||
    mediaItems.find(m => m.resourceType === 'image')?.url ||
    null

  return (
    <div className="p-8 rounded-2xl bg-white/5 backdrop-blur border border-white/10 h-full flex flex-col">
      <div className="flex items-center gap-1 mb-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star key={i} className={cn('w-5 h-5', i < testimonial.rating ? 'fill-gold text-gold' : 'text-white/20')} />
        ))}
      </div>

      {/* ── Media gallery — shows uploaded photos/videos ── */}
      {mediaItems.length > 0 && (
        <div className="mb-4">
          <div className="w-full h-40 rounded-xl overflow-hidden bg-white/10">
            {mediaItems[activeMedia]?.resourceType === 'video' ? (
              <video
                src={mediaItems[activeMedia].url}
                controls
                playsInline
                className="w-full h-full object-cover"
              />
            ) : (
              <img
                src={mediaItems[activeMedia]?.url}
                alt="Review media"
                className="w-full h-full object-cover"
                onError={(e) => { e.target.style.display = 'none' }}
              />
            )}
          </div>
          {mediaItems.length > 1 && (
            <div className="flex gap-1.5 mt-2 flex-wrap">
              {mediaItems.map((m, i) => (
                <button
                  key={i}
                  onClick={() => setActiveMedia(i)}
                  className={cn(
                    'w-8 h-8 rounded-md overflow-hidden border-2 transition-all',
                    i === activeMedia ? 'border-gold' : 'border-white/20 opacity-60 hover:opacity-100'
                  )}
                >
                  {m.resourceType === 'video' ? (
                    <div className="w-full h-full bg-white/10 flex items-center justify-center">
                      <Play className="w-3 h-3 text-white fill-current" />
                    </div>
                  ) : (
                    <img src={m.url} alt="" className="w-full h-full object-cover" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <p className="text-white/80 leading-relaxed flex-1">{testimonial.review}</p>

      <div className="mt-6 flex items-center gap-4">
        <div className="w-12 h-12 rounded-full overflow-hidden bg-gold/20 flex-shrink-0">
          {avatarUrl ? (
            <img src={avatarUrl} alt={testimonial.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gold font-semibold text-lg">
              {testimonial.name?.charAt(0)}
            </div>
          )}
        </div>
        <div>
          <div className="font-semibold text-white">{testimonial.name}</div>
          <div className="text-sm text-white/60">{testimonial.profession}</div>
        </div>
      </div>
    </div>
  )
}