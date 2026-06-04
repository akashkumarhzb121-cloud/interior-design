import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Check, Home, Building2, Paintbrush, Sofa, Lightbulb, HardHat, ChevronLeft, ChevronRight, Play, Image as ImageIcon } from 'lucide-react'
import { Section, SectionHeader } from '@/components/ui/Section'
import { Button } from '@/components/ui/Button'
import { ServiceCardSkeleton } from '@/components/ui/Skeleton'
import { servicesApi } from '@/api/services'
import { cn } from '@/lib/utils'
import PayButton from '@/components/PayButton'

const iconMap = { home: Home, building: Building2, paintbrush: Paintbrush, sofa: Sofa, lightbulb: Lightbulb, hardhat: HardHat }

const defaultServices = [
  { _id: '1', title: 'Residential Design',    description: 'Transform your home into a sanctuary of comfort and style.',      icon: 'home',      features: ['Space planning & layout', 'Furniture selection', 'Color consultation', 'Custom millwork', 'Lighting design'] },
  { _id: '2', title: 'Commercial Spaces',     description: 'Create inspiring workplaces that boost productivity.',             icon: 'building',  features: ['Office design', 'Retail interiors', 'Restaurant design', 'Brand integration', 'Employee wellness focus'] },
  { _id: '3', title: 'Renovation & Remodeling', description: 'Breathe new life into existing spaces.',                       icon: 'hardhat',   features: ['Kitchen renovation', 'Bathroom remodeling', 'Structural changes', 'Modern updates', 'Historical restoration'] },
  { _id: '4', title: 'Interior Styling',      description: 'Add the finishing touches that make a space truly feel like home.', icon: 'sofa',    features: ['Accessories & art', 'Textile selection', 'Plant styling', 'Seasonal updates', 'Move-in styling'] },
  { _id: '5', title: 'Design Consultation',   description: 'Expert guidance for your DIY endeavors.',                         icon: 'lightbulb', features: ['2-hour sessions', 'Design direction', 'Shopping lists', 'Layout plans', 'Color palettes'] },
  { _id: '6', title: 'Custom Furniture',      description: 'Create one-of-a-kind pieces tailored to your exact specifications.', icon: 'paintbrush', features: ['Custom design', 'Material selection', 'Artisan craftsmanship', 'Perfect fit', 'Unique pieces'] },
]

const process = [
  { step: '01', title: 'Discovery',           description: 'We begin with an in-depth consultation to understand your vision.' },
  { step: '02', title: 'Concept Development', description: 'Our designers create initial concepts and mood boards.' },
  { step: '03', title: 'Design Refinement',   description: 'We refine the designs based on your feedback.' },
  { step: '04', title: 'Implementation',      description: 'Our project managers oversee the execution.' },
  { step: '05', title: 'Styling & Handover',  description: 'We add the finishing touches and hand over your transformed space.' },
]

const pricingPlans = [
  { title: 'Consultation', price: '₹1,000', amount: 1000,  period: 'per session',  description: 'Perfect for quick guidance',     features: ['2-hour session', 'Design recommendations', 'Shopping list', 'Color palette', 'Layout suggestions'],                                       highlighted: false },
  { title: 'Full Service', price: '₹600',   amount: 600,   period: 'per sq. ft.',  description: 'Complete design and execution',  features: ['Complete design concept', '3D visualizations', 'Material procurement', 'Project management', 'Installation & styling'],                 highlighted: true  },
  { title: 'E-Design',     price: '₹15,000', amount: 15000, period: 'per room',    description: 'Remote design services',          features: ['Online consultation', 'Design board', 'Furniture plan', 'Shopping links', 'Email support'],                                            highlighted: false },
]

// ── Resolves a service's media into a clean array
// FIX: checks media[] first (new uploads), then legacy image field
function resolveMedia(service) {
  if (service.media && service.media.length > 0) return service.media
  if (service.image?.url) return [{ url: service.image.url, resourceType: 'image' }]
  return []
}

// ── Small media gallery strip used in each ServiceCard
function MediaGallery({ mediaItems }) {
  const [active, setActive] = useState(0)
  if (!mediaItems.length) return null

  const current = mediaItems[active]
  const isVideo = current.resourceType === 'video'

  return (
    <div className="mb-5">
      {/* Main preview */}
      <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-muted">
        {isVideo ? (
          <video
            key={current.url}
            src={current.url}
            controls
            playsInline
            className="w-full h-full object-cover"
          />
        ) : (
          <img
            src={current.url}
            alt=""
            className="w-full h-full object-cover transition-opacity duration-300"
            onError={(e) => { e.target.style.display = 'none' }}
          />
        )}
        {/* Video badge */}
        {isVideo && (
          <span className="absolute top-2 left-2 flex items-center gap-1 bg-black/70 text-white text-xs px-2 py-0.5 rounded-full">
            <Play className="w-2.5 h-2.5 fill-white" /> Video
          </span>
        )}
        {/* Nav arrows when multiple files */}
        {mediaItems.length > 1 && (
          <>
            <button
              onClick={(e) => { e.stopPropagation(); setActive(i => (i - 1 + mediaItems.length) % mediaItems.length) }}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 bg-black/50 hover:bg-black/80 text-white rounded-full flex items-center justify-center transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); setActive(i => (i + 1) % mediaItems.length) }}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 bg-black/50 hover:bg-black/80 text-white rounded-full flex items-center justify-center transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </>
        )}
        {/* Count badge */}
        {mediaItems.length > 1 && (
          <span className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-0.5 rounded-full">
            {active + 1} / {mediaItems.length}
          </span>
        )}
      </div>

      {/* Thumbnail strip */}
      {mediaItems.length > 1 && (
        <div className="flex gap-1.5 mt-2 overflow-x-auto pb-1">
          {mediaItems.map((m, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={cn(
                'flex-shrink-0 w-12 h-10 rounded-md overflow-hidden border-2 transition-all',
                i === active ? 'border-gold' : 'border-transparent opacity-60 hover:opacity-100'
              )}
            >
              {m.resourceType === 'video' ? (
                <div className="w-full h-full bg-muted flex items-center justify-center">
                  <Play className="w-3 h-3 text-muted-foreground fill-current" />
                </div>
              ) : (
                <img src={m.url} alt="" className="w-full h-full object-cover" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default function ServicesPage() {
  const [services, setServices] = useState([])
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await servicesApi.getAll()
        // FIX: backend wraps the array as { success, data: [...] }
        // Previously this used response.data?.length which is always truthy
        // (it's an object, not an array), so the condition never fell back
        // to defaultServices but also never correctly extracted the array.
        const list = response.data?.data || response.data || []
        setServices(Array.isArray(list) && list.length ? list : defaultServices)
      } catch (error) {
        console.log('[ServicesPage] fetch error:', error)
        setServices(defaultServices)
      } finally {
        setLoading(false)
      }
    }
    fetchServices()
  }, [])

  return (
    <>
      {/* Hero */}
      <section className="relative py-24 md:py-32 bg-charcoal overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <img src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1920&q=80" alt="" className="w-full h-full object-cover" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl">
            <span className="inline-block px-4 py-2 bg-gold/20 text-gold text-sm font-medium rounded-full mb-6">Our Services</span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-white">Comprehensive Design Solutions</h1>
            <p className="mt-6 text-lg text-white/70 leading-relaxed">From concept to completion, we offer a full range of interior design services.</p>
          </motion.div>
        </div>
      </section>

      {/* Services grid */}
      <Section className="bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader badge="What We Offer" title="Our Design Services" description="Explore our comprehensive range of interior design services." centered />
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {Array.from({ length: 6 }).map((_, i) => <ServiceCardSkeleton key={i} />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {services.map((service, index) => <ServiceCard key={service._id} service={service} index={index} />)}
            </div>
          )}
        </div>
      </Section>

      {/* Process */}
      <Section className="bg-sand">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader badge="How We Work" title="Our Design Process" description="A proven methodology that ensures exceptional results." centered />
          <div className="relative">
            <div className="absolute top-8 left-0 right-0 h-0.5 bg-border hidden lg:block" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8">
              {process.map((step, index) => (
                <motion.div key={step.step} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1 }} className="relative text-center">
                  <div className="relative z-10 w-16 h-16 mx-auto bg-gold text-charcoal rounded-full flex items-center justify-center text-xl font-bold mb-4">{step.step}</div>
                  <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* Pricing */}
      <Section className="bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader badge="Investment" title="Flexible Pricing Options" description="We offer transparent pricing tailored to your project scope." centered />
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {pricingPlans.map((plan, index) => (
              <motion.div
                key={plan.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className={cn('relative p-8 rounded-2xl border', plan.highlighted ? 'bg-charcoal text-white border-gold' : 'bg-card border-border')}
              >
                {plan.highlighted && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-gold text-charcoal text-xs font-semibold rounded-full">Most Popular</span>
                )}
                <h3 className="text-xl font-serif font-semibold">{plan.title}</h3>
                <div className="mt-4">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className={plan.highlighted ? 'text-white/70' : 'text-muted-foreground'}> {plan.period}</span>
                </div>
                <p className={cn('mt-3 text-sm', plan.highlighted ? 'text-white/70' : 'text-muted-foreground')}>{plan.description}</p>
                <ul className="mt-6 space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm">
                      <Check className="w-5 h-5 flex-shrink-0 text-gold" />{feature}
                    </li>
                  ))}
                </ul>
                <div className="mt-8">
                  <PayButton serviceName={plan.title} amount={plan.amount} priceDisplay={plan.price} variant={plan.highlighted ? 'gold' : 'outline'} />
                </div>
              </motion.div>
            ))}
          </div>
          <p className="text-center text-muted-foreground text-sm mt-8">* Prices are indicative and may vary based on project complexity.</p>
        </div>
      </Section>

      {/* CTA */}
      <Section className="bg-charcoal">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <span className="inline-block px-4 py-2 bg-gold/20 text-gold text-sm font-medium rounded-full mb-6">Ready to Start?</span>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-white">{"Let's Discuss Your Project"}</h2>
            <p className="mt-4 text-lg text-white/70 max-w-2xl mx-auto">Book a free consultation with our expert designers.</p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/booking"><Button variant="gold" size="xl">Book Free Consultation<ArrowRight className="w-5 h-5" /></Button></Link>
              <Link to="/projects"><Button variant="outline" size="xl" className="border-white/30 text-white hover:bg-white/10">View Our Work</Button></Link>
            </div>
          </motion.div>
        </div>
      </Section>
    </>
  )
}

// ── Service card with real images/videos from admin uploads ─────────────────
// FIX: this ServiceCard properly renders media[] and image fields.
// The old ServicesPage.jsx had a ServiceCard with NO media rendering at all —
// it only showed an icon, never the uploaded images/videos.
function ServiceCard({ service, index }) {
  const IconComponent = iconMap[service.icon?.toLowerCase()] || Paintbrush
  const mediaItems    = resolveMedia(service)
  const hasMedia      = mediaItems.length > 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      className="group rounded-2xl bg-card border border-border hover:border-gold/50 hover:shadow-lg transition-all overflow-hidden"
    >
      {/* ── Media gallery (images + videos uploaded in admin) ── */}
      {hasMedia ? (
        <div className="p-4 pb-0">
          <MediaGallery mediaItems={mediaItems} />
        </div>
      ) : (
        // No media uploaded — show icon banner
        <div className="w-full h-44 bg-gradient-to-br from-gold/10 to-gold/5 flex items-center justify-center">
          <div className="w-16 h-16 rounded-2xl bg-gold/20 flex items-center justify-center">
            <IconComponent className="w-8 h-8 text-gold" />
          </div>
        </div>
      )}

      <div className="p-6">
        {/* Icon row — shown only when media is present */}
        {hasMedia && (
          <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center mb-3 group-hover:bg-gold/20 transition-colors">
            <IconComponent className="w-5 h-5 text-gold" />
          </div>
        )}

        <h3 className="text-xl font-serif font-semibold group-hover:text-gold transition-colors">{service.title}</h3>
        <p className="mt-2 text-muted-foreground text-sm leading-relaxed">{service.description}</p>

        {service.features && service.features.length > 0 && (
          <ul className="mt-4 space-y-2">
            {service.features.map((feature, i) => (
              <li key={i} className="text-sm flex items-center gap-2">
                <Check className="w-4 h-4 text-gold flex-shrink-0" />
                <span className="text-muted-foreground">{feature}</span>
              </li>
            ))}
          </ul>
        )}

        {/* Media count badge */}
        {mediaItems.length > 1 && (
          <div className="mt-3 flex items-center gap-1.5">
            <ImageIcon className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">{mediaItems.length} files</span>
          </div>
        )}
      </div>
    </motion.div>
  )
}
