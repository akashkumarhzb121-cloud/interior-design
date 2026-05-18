import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Check, Home, Building2, Paintbrush, Sofa, Lightbulb, HardHat } from 'lucide-react'
import { Section, SectionHeader } from '@/components/ui/Section'
import { Button } from '@/components/ui/Button'
import { ServiceCardSkeleton } from '@/components/ui/Skeleton'
import { servicesApi } from '@/api/services'
import { cn } from '@/lib/utils'

const iconMap = { home: Home, building: Building2, paintbrush: Paintbrush, sofa: Sofa, lightbulb: Lightbulb, hardhat: HardHat }

const defaultServices = [
  { _id: '1', title: 'Residential Design', description: 'Transform your home into a sanctuary of comfort and style.', icon: 'home', features: ['Space planning & layout', 'Furniture selection', 'Color consultation', 'Custom millwork', 'Lighting design'] },
  { _id: '2', title: 'Commercial Spaces', description: 'Create inspiring workplaces that boost productivity.', icon: 'building', features: ['Office design', 'Retail interiors', 'Restaurant design', 'Brand integration', 'Employee wellness focus'] },
  { _id: '3', title: 'Renovation & Remodeling', description: 'Breathe new life into existing spaces.', icon: 'hardhat', features: ['Kitchen renovation', 'Bathroom remodeling', 'Structural changes', 'Modern updates', 'Historical restoration'] },
  { _id: '4', title: 'Interior Styling', description: 'Add the finishing touches that make a space truly feel like home.', icon: 'sofa', features: ['Accessories & art', 'Textile selection', 'Plant styling', 'Seasonal updates', 'Move-in styling'] },
  { _id: '5', title: 'Design Consultation', description: 'Expert guidance for your DIY endeavors.', icon: 'lightbulb', features: ['2-hour sessions', 'Design direction', 'Shopping lists', 'Layout plans', 'Color palettes'] },
  { _id: '6', title: 'Custom Furniture', description: 'Create one-of-a-kind pieces tailored to your exact specifications.', icon: 'paintbrush', features: ['Custom design', 'Material selection', 'Artisan craftsmanship', 'Perfect fit', 'Unique pieces'] },
]

const process = [
  { step: '01', title: 'Discovery', description: 'We begin with an in-depth consultation to understand your vision.' },
  { step: '02', title: 'Concept Development', description: 'Our designers create initial concepts and mood boards.' },
  { step: '03', title: 'Design Refinement', description: 'We refine the designs based on your feedback.' },
  { step: '04', title: 'Implementation', description: 'Our project managers oversee the execution.' },
  { step: '05', title: 'Styling & Handover', description: 'We add the finishing touches and hand over your beautifully transformed space.' },
]

export default function ServicesPage() {
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await servicesApi.getAll()
        setServices(response.data?.length ? response.data : defaultServices)
      } catch (error) {
        console.log('[v0] Error fetching services:', error)
        setServices(defaultServices)
      } finally {
        setLoading(false)
      }
    }
    fetchServices()
  }, [])

  return (
    <>
      <section className="relative py-24 md:py-32 bg-charcoal overflow-hidden">
        <div className="absolute inset-0 opacity-20"><img src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1920&q=80" alt="" className="w-full h-full object-cover" /></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl">
            <span className="inline-block px-4 py-2 bg-gold/20 text-gold text-sm font-medium rounded-full mb-6">Our Services</span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-white">Comprehensive Design Solutions</h1>
            <p className="mt-6 text-lg text-white/70 leading-relaxed">From concept to completion, we offer a full range of interior design services.</p>
          </motion.div>
        </div>
      </section>

      <Section className="bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader badge="What We Offer" title="Our Design Services" description="Explore our comprehensive range of interior design services." centered />
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">{Array.from({ length: 6 }).map((_, i) => <ServiceCardSkeleton key={i} />)}</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {services.map((service, index) => <ServiceCard key={service._id} service={service} index={index} />)}
            </div>
          )}
        </div>
      </Section>

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

      <Section className="bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader badge="Investment" title="Flexible Pricing Options" description="We offer transparent pricing tailored to your project scope." centered />
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              { title: 'Consultation', price: '₹5,000', period: 'per session', description: 'Perfect for quick guidance', features: ['2-hour session', 'Design recommendations', 'Shopping list', 'Color palette', 'Layout suggestions'], highlighted: false },
              { title: 'Full Service', price: '₹800', period: 'per sq. ft.', description: 'Complete design and execution', features: ['Complete design concept', '3D visualizations', 'Material procurement', 'Project management', 'Installation & styling'], highlighted: true },
              { title: 'E-Design', price: '₹25,000', period: 'per room', description: 'Remote design services', features: ['Online consultation', 'Design board', 'Furniture plan', 'Shopping links', 'Email support'], highlighted: false },
            ].map((plan, index) => (
              <motion.div key={plan.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1 }} className={cn('relative p-8 rounded-2xl border', plan.highlighted ? 'bg-charcoal text-white border-gold' : 'bg-card border-border')}>
                {plan.highlighted && <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-gold text-charcoal text-xs font-semibold rounded-full">Most Popular</span>}
                <h3 className="text-xl font-serif font-semibold">{plan.title}</h3>
                <div className="mt-4"><span className="text-4xl font-bold">{plan.price}</span><span className={plan.highlighted ? 'text-white/70' : 'text-muted-foreground'}> {plan.period}</span></div>
                <p className={cn('mt-3 text-sm', plan.highlighted ? 'text-white/70' : 'text-muted-foreground')}>{plan.description}</p>
                <ul className="mt-6 space-y-3">{plan.features.map((feature) => <li key={feature} className="flex items-center gap-2 text-sm"><Check className="w-5 h-5 flex-shrink-0 text-gold" />{feature}</li>)}</ul>
                <Link to="/booking" className="block mt-8"><Button variant={plan.highlighted ? 'gold' : 'outline'} className="w-full">Get Started<ArrowRight className="w-4 h-4" /></Button></Link>
              </motion.div>
            ))}
          </div>
          <p className="text-center text-muted-foreground text-sm mt-8">* Prices are indicative and may vary based on project complexity.</p>
        </div>
      </Section>

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

function ServiceCard({ service, index }) {
  const IconComponent = iconMap[service.icon?.toLowerCase()] || Paintbrush
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1 }} className="group p-8 rounded-2xl bg-card border border-border hover:border-gold/50 hover:shadow-lg transition-all">
      <div className="w-14 h-14 rounded-xl bg-gold/10 flex items-center justify-center mb-6 group-hover:bg-gold/20 transition-colors"><IconComponent className="w-7 h-7 text-gold" /></div>
      <h3 className="text-xl font-serif font-semibold group-hover:text-gold transition-colors">{service.title}</h3>
      <p className="mt-3 text-muted-foreground text-sm leading-relaxed">{service.description}</p>
      {service.features && service.features.length > 0 && (
        <ul className="mt-6 space-y-2">
          {service.features.map((feature, i) => <li key={i} className="text-sm flex items-center gap-2"><Check className="w-4 h-4 text-gold flex-shrink-0" /><span className="text-muted-foreground">{feature}</span></li>)}
        </ul>
      )}
    </motion.div>
  )
}
