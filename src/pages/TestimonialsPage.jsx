import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Star, ArrowRight } from 'lucide-react'
import { Section, SectionHeader } from '@/components/ui/Section'
import { Button } from '@/components/ui/Button'
import { TestimonialCardSkeleton } from '@/components/ui/Skeleton'
import { testimonialsApi } from '@/api/services'
import { cn } from '@/lib/utils'

export default function TestimonialsPage() {
  const [testimonials, setTestimonials] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const response = await testimonialsApi.getAll()
        setTestimonials(response.data || [])
      } catch (error) {
        console.log('[v0] Error fetching testimonials:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchTestimonials()
  }, [])

  return (
    <>
      <section className="relative py-24 md:py-32 bg-charcoal overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <img src="https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=1920&q=80" alt="" className="w-full h-full object-cover" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl">
            <span className="inline-block px-4 py-2 bg-gold/20 text-gold text-sm font-medium rounded-full mb-6">Client Testimonials</span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-white">Trusted by Homeowners & Businesses</h1>
            <p className="mt-6 text-lg text-white/70 leading-relaxed">Read what our clients have to say about our luxury interior design services.</p>
          </motion.div>
        </div>
      </section>

      <Section className="bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader badge="Feedback" title="Real Stories From Real Clients" description="Our clients trust us to transform their spaces with thoughtful design and exceptional service." centered />

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <TestimonialCardSkeleton key={i} />
              ))}
            </div>
          ) : testimonials.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {testimonials.map((testimonial, index) => (
                <TestimonialCard key={testimonial._id || index} testimonial={testimonial} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <h2 className="text-2xl font-semibold">No testimonials available yet.</h2>
              <p className="text-muted-foreground mt-2">Check back soon to see our latest client stories.</p>
            </div>
          )}
        </div>
      </Section>

      <Section className="bg-sand">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <SectionHeader badge="Get Started" title="Want to Experience Luxe Interiors Yourself?" description="Book a consultation and let us create a luxurious space tailored to your needs." centered />
          <Link to="/booking">
            <Button variant="gold" size="xl" className="mt-6">
              Book Consultation
              <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>
        </div>
      </Section>
    </>
  )
}

function TestimonialCard({ testimonial }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="p-8 rounded-3xl bg-card border border-border shadow-sm">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-14 h-14 rounded-full bg-gold/10 flex items-center justify-center text-gold text-xl font-semibold">
          {testimonial.name?.charAt(0) || 'L'}
        </div>
        <div>
          <p className="font-semibold text-foreground">{testimonial.name || 'Client'}</p>
          <p className="text-sm text-muted-foreground">{testimonial.designation || testimonial.company || 'Homeowner'}</p>
        </div>
      </div>
      <div className="flex gap-1 mb-4 text-gold">
        {Array.from({ length: 5 }).map((_, index) => (
          <Star key={index} className={cn('w-5 h-5', index < (testimonial.rating || 5) ? 'text-gold' : 'text-white/20')} />
        ))}
      </div>
      <p className="text-muted-foreground leading-relaxed">{testimonial.content || testimonial.message || 'A beautifully designed space with exceptional attention to detail.'}</p>
    </motion.div>
  )
}
