import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Star, ArrowRight, Send, CheckCircle } from 'lucide-react'
import { Section, SectionHeader } from '@/components/ui/Section'
import { Button } from '@/components/ui/Button'
import { TestimonialCardSkeleton } from '@/components/ui/Skeleton'
import { testimonialsApi } from '@/api/services'
import { cn } from '@/lib/utils'

// ─── Submit Form ────────────────────────────────────────────────────────────
function SubmitTestimonialForm({ onSuccess }) {
  const [form, setForm] = useState({ name: '', profession: '', review: '', rating: 5 })
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [hoverRating, setHoverRating] = useState(0)

  const validate = () => {
    const e = {}
    if (!form.name.trim())   e.name   = 'Name is required'
    if (!form.review.trim()) e.review = 'Review is required'
    if (form.review.trim().length > 1000) e.review = 'Review cannot exceed 1000 characters'
    return e
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const e2 = validate()
    if (Object.keys(e2).length) { setErrors(e2); return }

    setSubmitting(true)
    try {
      // Send as JSON — no file upload from this form
      // testimonialRoutes accepts multipart (for image) but also works without it
      const formData = new FormData()
      formData.append('name',       form.name.trim())
      formData.append('profession', form.profession.trim())
      formData.append('review',     form.review.trim())
      formData.append('rating',     form.rating)

      await testimonialsApi.create(formData)
      onSuccess()
    } catch (err) {
      const msg = err?.response?.data?.message || 'Something went wrong. Please try again.'
      setErrors({ submit: msg })
    } finally {
      setSubmitting(false)
    }
  }

  const set = (field) => (e) => {
    setForm((s) => ({ ...s, [field]: e.target.value }))
    setErrors((s) => ({ ...s, [field]: '', submit: '' }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {errors.submit && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
          {errors.submit}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">
            Full Name <span className="text-gold">*</span>
          </label>
          <input
            type="text"
            value={form.name}
            onChange={set('name')}
            placeholder="Your full name"
            className={cn(
              'w-full px-4 py-2.5 rounded-lg border bg-background text-foreground text-sm outline-none transition-colors focus:border-gold',
              errors.name ? 'border-red-400' : 'border-border'
            )}
          />
          {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">
            Profession / Designation
          </label>
          <input
            type="text"
            value={form.profession}
            onChange={set('profession')}
            placeholder="e.g. Homeowner, Architect"
            className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm outline-none focus:border-gold transition-colors"
          />
        </div>
      </div>

      {/* Star rating picker */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Rating <span className="text-gold">*</span>
        </label>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setForm((s) => ({ ...s, rating: star }))}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              className="p-0.5 transition-transform hover:scale-110"
            >
              <Star
                className={cn(
                  'w-8 h-8 transition-colors',
                  star <= (hoverRating || form.rating)
                    ? 'fill-gold text-gold'
                    : 'text-muted-foreground/30'
                )}
              />
            </button>
          ))}
          <span className="ml-2 text-sm text-muted-foreground">
            {['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent'][hoverRating || form.rating]}
          </span>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">
          Your Review <span className="text-gold">*</span>
        </label>
        <textarea
          value={form.review}
          onChange={set('review')}
          rows={4}
          placeholder="Share your experience working with Modplint Interiors..."
          className={cn(
            'w-full px-4 py-2.5 rounded-lg border bg-background text-foreground text-sm outline-none resize-none transition-colors focus:border-gold',
            errors.review ? 'border-red-400' : 'border-border'
          )}
        />
        <div className="flex justify-between mt-1">
          {errors.review
            ? <p className="text-red-500 text-xs">{errors.review}</p>
            : <span />
          }
          <span className="text-xs text-muted-foreground">{form.review.length}/1000</span>
        </div>
      </div>

      <Button type="submit" variant="gold" disabled={submitting} className="w-full sm:w-auto">
        {submitting
          ? 'Submitting...'
          : <><Send className="w-4 h-4" />Submit Review</>
        }
      </Button>
    </form>
  )
}

// ─── Success state after submission ─────────────────────────────────────────
function SubmitSuccess({ onReset }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center py-10"
    >
      <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-4">
        <CheckCircle className="w-8 h-8 text-green-600" />
      </div>
      <h3 className="text-xl font-semibold text-foreground">Thank you for your review!</h3>
      <p className="mt-2 text-muted-foreground text-sm max-w-sm mx-auto">
        Your testimonial has been submitted and is pending approval. It will appear here once our team reviews it.
      </p>
      <button
        onClick={onReset}
        className="mt-5 text-sm text-gold underline underline-offset-2 hover:opacity-80"
      >
        Submit another review
      </button>
    </motion.div>
  )
}

// ─── Testimonial Card ────────────────────────────────────────────────────────
function TestimonialCard({ testimonial, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: (index % 6) * 0.07 }}
      className="p-8 rounded-3xl bg-card border border-border shadow-sm h-full flex flex-col"
    >
      {/* Stars */}
      <div className="flex gap-1 mb-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={cn('w-5 h-5', i < (testimonial.rating || 5) ? 'fill-gold text-gold' : 'text-muted-foreground/20')}
          />
        ))}
      </div>

      {/* FIX: DB field is `review`, not `content` or `message` */}
      <p className="text-muted-foreground leading-relaxed flex-1">
        {testimonial.review || ''}
      </p>

      {/* Author */}
      <div className="flex items-center gap-4 mt-6 pt-6 border-t border-border">
        <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center overflow-hidden flex-shrink-0">
          {/* FIX: image is an object {url, publicId}, not a plain string */}
          {testimonial.image?.url ? (
            <img
              src={testimonial.image.url}
              alt={testimonial.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-gold font-semibold text-lg">
              {testimonial.name?.charAt(0)?.toUpperCase() || '?'}
            </span>
          )}
        </div>
        <div>
          <p className="font-semibold text-foreground">{testimonial.name}</p>
          {/* FIX: DB field is `profession`, not `designation` or `company` */}
          <p className="text-sm text-muted-foreground">{testimonial.profession || 'Client'}</p>
        </div>
      </div>
    </motion.div>
  )
}

// ─── Page ────────────────────────────────────────────────────────────────────
export default function TestimonialsPage() {
  const [testimonials, setTestimonials] = useState([])
  const [loading, setLoading]           = useState(true)
  const [submitted, setSubmitted]       = useState(false)

  const fetchTestimonials = async () => {
    setLoading(true)
    try {
      const response = await testimonialsApi.getAll()
      // FIX: backend wraps data as { success, data: [...] }
      // axios response is response.data = { success, data: [...] }
      // so the array is at response.data.data
      const list = response.data?.data || response.data || []
      setTestimonials(Array.isArray(list) ? list : [])
    } catch (error) {
      console.error('[Testimonials] Fetch error:', error)
      setTestimonials([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchTestimonials() }, [])

  return (
    <>
      {/* Hero */}
      <section className="relative py-24 md:py-32 bg-charcoal overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <img
            src="https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=1920&q=80"
            alt=""
            className="w-full h-full object-cover"
          />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl">
            <span className="inline-block px-4 py-2 bg-gold/20 text-gold text-sm font-medium rounded-full mb-6">
              Client Testimonials
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-white">
              Trusted by Homeowners &amp; Businesses
            </h1>
            <p className="mt-6 text-lg text-white/70 leading-relaxed">
              Read what our clients have to say about our luxury interior design services.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Approved testimonials grid */}
      <Section className="bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            badge="Feedback"
            title="Real Stories From Real Clients"
            description="Our clients trust us to transform their spaces with thoughtful design and exceptional service."
            centered
          />

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => <TestimonialCardSkeleton key={i} />)}
            </div>
          ) : testimonials.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {testimonials.map((t, index) => (
                <TestimonialCard key={t._id || index} testimonial={t} index={index} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-xl font-semibold text-foreground">No testimonials yet.</p>
              <p className="text-muted-foreground mt-2">Be the first to share your experience below!</p>
            </div>
          )}
        </div>
      </Section>

      {/* ─── Submit Your Review section ───────────────────────────────────── */}
      <Section className="bg-sand">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            badge="Share Your Experience"
            title="Leave a Review"
            description="Worked with us? We'd love to hear about your experience. Your review will appear after a quick approval."
            centered
          />

          <div className="mt-8 bg-card border border-border rounded-3xl p-8 shadow-sm">
            {submitted ? (
              <SubmitSuccess onReset={() => setSubmitted(false)} />
            ) : (
              <SubmitTestimonialForm onSuccess={() => setSubmitted(true)} />
            )}
          </div>
        </div>
      </Section>

      {/* CTA */}
      <Section className="bg-charcoal">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <SectionHeader
            badge="Get Started"
            title="Want to Experience Modplint Interiors Yourself?"
            description="Book a consultation and let us create a luxurious space tailored to your needs."
            centered
            className="text-white [&_p]:text-white/70"
          />
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
