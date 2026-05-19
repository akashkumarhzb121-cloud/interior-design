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
  { icon: HomeIcon, value: '250+', label: 'Projects Completed' },
  { icon: Users, value: '180+', label: 'Happy Clients' },
  { icon: Award, value: '15+', label: 'Design Awards' },
  { icon: MapPin, value: '50+', label: 'Locations in Mumbai' },
]

export default function HomePage() {
  const [projects, setProjects] = useState([])
  const [services, setServices] = useState([])
  const [testimonials, setTestimonials] = useState([])
  const [loading, setLoading] = useState(true)

  const { scrollYProgress } = useScroll()
  const heroOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0])
  const heroScale = useTransform(scrollYProgress, [0, 0.2], [1, 1.1])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [projectsRes, servicesRes, testimonialsRes] = await Promise.all([
          projectsApi.getAll(),
          servicesApi.getAll(),
          testimonialsApi.getAll(),
        ])
        setProjects(projectsRes.data?.slice(0, 6) || [])
        setServices(servicesRes.data?.slice(0, 4) || [])
        setTestimonials(testimonialsRes.data || [])
      } catch (error) {
        console.log('[v0] Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  return (
    <>
      {/* Hero Section */}
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
                <div
                  className="h-full w-full bg-cover bg-center"
                  style={{ backgroundImage: `url(${image})` }}
                >
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

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
        >
          <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-1.5 h-1.5 bg-gold rounded-full mt-2"
            />
          </div>
        </motion.div>
      </section>

      {/* Stats Section */}
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
                <div className="text-3xl md:text-4xl font-serif font-bold text-white">
                  {stat.value}
                </div>
                <div className="mt-1 text-sm text-white/60">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      {/* Featured Projects */}
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
              ? Array.from({ length: 6 }).map((_, i) => (
                  <ProjectCardSkeleton key={i} />
                ))
              : projects.map((project, index) => (
                  <ProjectCard key={project._id || project.id || index} project={project} index={index} />
                ))}
          </div>
        </div>
      </Section>

      {/* Services Section */}
      <Section className="bg-sand">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            badge="What We Offer"
            title="Our Services"
            description="Comprehensive interior design services tailored to transform your vision into reality."
            centered
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {loading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <ServiceCardSkeleton key={i} />
                ))
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

      {/* Why Choose Us */}
      <Section className="bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <SectionHeader
                badge="Why Luxe Interiors"
                title="Creating Timeless Spaces Since 2010"
                description="With over a decade of experience, we've established ourselves as Mumbai's premier interior design studio, blending contemporary aesthetics with timeless elegance."
                className="mb-8"
              />
              <div className="space-y-6">
                {[
                  { title: 'Bespoke Design Solutions', desc: 'Every project is unique, crafted to reflect your personality and lifestyle.' },
                  { title: 'End-to-End Service', desc: 'From concept development to final installation, we handle everything.' },
                  { title: 'Premium Materials', desc: 'We source only the finest materials from trusted suppliers worldwide.' },
                  { title: 'On-Time Delivery', desc: 'We respect your time and deliver projects within the agreed timeline.' },
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
                <div className="text-4xl font-serif font-bold">15+</div>
                <div className="text-sm font-medium">Years of Excellence</div>
              </div>
            </motion.div>
          </div>
        </div>
      </Section>

      {/* Testimonials */}
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
              {Array.from({ length: 3 }).map((_, i) => (
                <TestimonialCardSkeleton key={i} />
              ))}
            </div>
          ) : (
            <Swiper
              modules={[Autoplay, Pagination]}
              autoplay={{ delay: 4000, disableOnInteraction: false }}
              pagination={{ clickable: true }}
              spaceBetween={24}
              slidesPerView={1}
              breakpoints={{
                768: { slidesPerView: 2 },
                1024: { slidesPerView: 3 },
              }}
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

      {/* CTA Section */}
      <Section className="bg-gradient-to-br from-gold/20 via-background to-gold/10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="inline-block px-4 py-2 bg-gold/10 text-gold text-sm font-medium rounded-full mb-6">
              Start Your Journey
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold">
              Ready to Create Your Dream Space?
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              {"Book a free consultation with our expert designers and let's bring your vision to life."}
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/booking">
                <Button variant="gold" size="xl">
                  Schedule Consultation
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <Link to="/contact">
                <Button variant="outline" size="xl">
                  Contact Us
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </Section>
    </>
  )
}

function ProjectCard({ project, index }) {
  const projectId = project._id || project.id

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      className="group"
    >
      <Link to={projectId ? `/projects/${projectId}` : '/projects'}>
        <div className="relative aspect-[4/3] rounded-xl overflow-hidden">
          <img
            src={project.images?.[0] || 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=600&q=80'}
            alt={project.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="absolute bottom-4 left-4 right-4 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all">
            <span className="inline-flex items-center gap-2 text-white text-sm font-medium">
              View Project <ArrowRight className="w-4 h-4" />
            </span>
          </div>
        </div>
        <div className="mt-4">
          <span className="text-sm text-gold font-medium">{project.category}</span>
          <h3 className="mt-1 text-lg font-semibold group-hover:text-gold transition-colors">
            {project.title}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            {project.location}
          </p>
        </div>
      </Link>
    </motion.div>
  )
}

function ServiceCard({ service, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      className={cn(
        'group p-8 rounded-2xl bg-card border border-border hover:border-gold/50 transition-colors',
        index === 0 && 'md:col-span-2 lg:col-span-1'
      )}
    >
      <div className="w-14 h-14 rounded-xl bg-gold/10 flex items-center justify-center text-gold text-2xl mb-6">
        {getServiceIcon(service.icon)}
      </div>
      <h3 className="text-xl font-serif font-semibold group-hover:text-gold transition-colors">
        {service.title}
      </h3>
      <p className="mt-3 text-muted-foreground text-sm leading-relaxed">
        {service.description}
      </p>
      {service.features && service.features.length > 0 && (
        <ul className="mt-4 space-y-2">
          {service.features.slice(0, 3).map((feature, i) => (
            <li key={i} className="text-sm text-muted-foreground flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-gold" />
              {feature}
            </li>
          ))}
        </ul>
      )}
    </motion.div>
  )
}

function TestimonialCard({ testimonial }) {
  return (
    <div className="p-8 rounded-2xl bg-white/5 backdrop-blur border border-white/10 h-full">
      <div className="flex items-center gap-1 mb-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={cn(
              'w-5 h-5',
              i < testimonial.rating ? 'fill-gold text-gold' : 'text-white/20'
            )}
          />
        ))}
      </div>
      <p className="text-white/80 leading-relaxed">{testimonial.content}</p>
      <div className="mt-6 flex items-center gap-4">
        <div className="w-12 h-12 rounded-full overflow-hidden bg-gold/20">
          {testimonial.image ? (
            <img
              src={testimonial.image}
              alt={testimonial.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gold font-semibold">
              {testimonial.name.charAt(0)}
            </div>
          )}
        </div>
        <div>
          <div className="font-semibold text-white">{testimonial.name}</div>
          <div className="text-sm text-white/60">
            {testimonial.designation}
            {testimonial.company && `, ${testimonial.company}`}
          </div>
        </div>
      </div>
    </div>
  )
}

function getServiceIcon(iconName) {
  const icons = {
    home: '🏠',
    building: '🏢',
    paintbrush: '🎨',
    sofa: '🛋️',
    default: '✨',
  }
  return icons[iconName?.toLowerCase()] || icons.default
}