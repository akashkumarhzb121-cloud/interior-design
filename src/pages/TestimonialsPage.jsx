import { useEffect, useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Star, ArrowRight, Send, CheckCircle, Upload, X, Film, Image as ImageIcon } from 'lucide-react'
import { Section, SectionHeader } from '@/components/ui/Section'
import { Button } from '@/components/ui/Button'
import { TestimonialCardSkeleton } from '@/components/ui/Skeleton'
import { testimonialsApi } from '@/api/services'
import { useSEO } from '@/hooks/useSEO'
import { cn } from '@/lib/utils'

// ─── Testimonial Card ────────────────────────────────────────────────────────
function TestimonialCard({ testimonial, index }) {
  const [activeMedia, setActiveMedia] = useState(0)
  const mediaItems = [
    ...(testimonial.media || []),
    ...(!testimonial.media?.length && testimonial.image?.url ? [{ url: testimonial.image.url, resourceType: 'image' }] : []),
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4 }}
      className="bg-card border border-border rounded-2xl p-6 flex flex-col gap-4 hover:shadow-lg hover:border-gold/30 transition-all duration-300"
    >
      {/* Stars */}
      <div className="flex gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star key={i} className={cn('w-4 h-4', i < testimonial.rating ? 'fill-gold text-gold' : 'text-muted-foreground/20')} />
        ))}
      </div>

      {/* Media gallery */}
      {mediaItems.length > 0 && (
        <div>
          <div className="w-full h-40 rounded-xl overflow-hidden bg-muted">
            {mediaItems[activeMedia]?.resourceType === 'video' ? (
              <video
                src={mediaItems[activeMedia].url}
                controls
                className="w-full h-full object-cover"
              />
            ) : (
              <img
                src={mediaItems[activeMedia]?.url}
                alt="Review media"
                className="w-full h-full object-cover"
              />
            )}
          </div>
          {mediaItems.length > 1 && (
            <div className="flex gap-1.5 mt-2 flex-wrap">
              {mediaItems.map((m, i) => (
                <button
                  key={i}
                  onClick={() => setActiveMedia(i)}
                  className={cn('w-10 h-10 rounded-md overflow-hidden border-2 transition-all', i === activeMedia ? 'border-gold' : 'border-transparent opacity-60 hover:opacity-100')}
                >
                  {m.resourceType === 'video' ? (
                    <div className="w-full h-full bg-muted flex items-center justify-center">
                      <Film className="w-4 h-4 text-muted-foreground" />
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

      {/* Review text */}
      <p className="text-muted-foreground leading-relaxed text-sm flex-1">"{testimonial.review}"</p>

      {/* Author */}
      <div className="flex items-center gap-3 pt-4 border-t border-border">
        <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center overflow-hidden flex-shrink-0">
          {testimonial.image?.url ? (
            <img src={testimonial.image.url} alt={testimonial.name} className="w-full h-full object-cover" />
          ) : (
            <span className="text-gold font-semibold text-lg">{testimonial.name?.charAt(0)?.toUpperCase() || '?'}</span>
          )}
        </div>
        <div>
          <p className="font-semibold text-foreground text-sm">{testimonial.name}</p>
          <p className="text-xs text-muted-foreground">{testimonial.profession || 'Client'}</p>
        </div>
      </div>
    </motion.div>
  )
}

// ─── Media preview strip (in submit form) ───────────────────────────────────
function MediaPreviewStrip({ previews, onRemove }) {
  if (!previews.length) return null
  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {previews.map((p, i) => (
        <div key={i} className="relative group w-20 h-16 rounded-lg overflow-hidden bg-muted border border-border">
          {p.type === 'video' ? (
            <video src={p.src} className="w-full h-full object-cover" muted />
          ) : (
            <img src={p.src} alt="" className="w-full h-full object-cover" />
          )}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors" />
          <span className="absolute top-0.5 left-0.5 bg-black/60 text-white rounded px-1 py-0 text-[9px] flex items-center gap-0.5">
            {p.type === 'video' ? <Film className="w-2 h-2" /> : <ImageIcon className="w-2 h-2" />}
            {p.type}
          </span>
          <button
            type="button"
            onClick={() => onRemove(i)}
            className="absolute top-0.5 right-0.5 bg-red-500 text-white rounded-full w-3.5 h-3.5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <X className="w-2 h-2" />
          </button>
        </div>
      ))}
    </div>
  )
}

// ─── Submit Form ─────────────────────────────────────────────────────────────
function SubmitTestimonialForm({ onSuccess }) {
  const [form, setForm] = useState({ name: '', profession: '', review: '', rating: 5 })
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [hoverRating, setHoverRating] = useState(0)
  const mediaRef = useRef(null)
  const [mediaPreviews, setMediaPreviews] = useState([])

  const validate = () => {
    const e = {}
    if (!form.name.trim())   e.name   = 'Name is required'
    if (!form.review.trim()) e.review = 'Review is required'
    if (form.review.trim().length > 1000) e.review = 'Review cannot exceed 1000 characters'
    return e
  }

  const handleMediaChange = (e) => {
    const files = Array.from(e.target.files || [])
    if (!files.length) return
    const newPreviews = files.map(f => ({
      src:  URL.createObjectURL(f),
      type: f.type.startsWith('video/') ? 'video' : 'image',
      file: f,
    }))
    setMediaPreviews(prev => [...prev, ...newPreviews])
  }

  const removePreview = (idx) => setMediaPreviews(prev => prev.filter((_, i) => i !== idx))

  const handleSubmit = async (e) => {
    e.preventDefault()
    const e2 = validate()
    if (Object.keys(e2).length) { setErrors(e2); return }

    setSubmitting(true)
    try {
      const formData = new FormData()
      formData.append('name',       form.name.trim())
      formData.append('profession', form.profession.trim())
      formData.append('review',     form.review.trim())
      formData.append('rating',     form.rating)
      for (const p of mediaPreviews) formData.append('media', p.file)

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
    setForm(s => ({ ...s, [field]: e.target.value }))
    setErrors(s => ({ ...s, [field]: '', submit: '' }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {errors.submit && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">{errors.submit}</div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Full Name <span className="text-gold">*</span></label>
          <input
            type="text" value={form.name} onChange={set('name')} placeholder="Your full name"
            className={cn('w-full px-4 py-2.5 rounded-lg border bg-background text-foreground text-sm outline-none transition-colors focus:border-gold', errors.name ? 'border-red-400' : 'border-border')}
          />
          {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Profession / Designation</label>
          <input
            type="text" value={form.profession} onChange={set('profession')} placeholder="e.g. Homeowner, Architect"
            className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm outline-none focus:border-gold transition-colors"
          />
        </div>
      </div>

      {/* Star rating */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">Rating <span className="text-gold">*</span></label>
        <div className="flex items-center gap-1">
          {[1,2,3,4,5].map((star) => (
            <button key={star} type="button" onClick={() => setForm(s => ({ ...s, rating: star }))} onMouseEnter={() => setHoverRating(star)} onMouseLeave={() => setHoverRating(0)} className="p-0.5 transition-transform hover:scale-110">
              <Star className={cn('w-8 h-8 transition-colors', star <= (hoverRating || form.rating) ? 'fill-gold text-gold' : 'text-muted-foreground/30')} />
            </button>
          ))}
          <span className="ml-2 text-sm text-muted-foreground">{['','Poor','Fair','Good','Great','Excellent'][hoverRating || form.rating]}</span>
        </div>
      </div>

      {/* Review textarea */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">Your Review <span className="text-gold">*</span></label>
        <textarea
          value={form.review} onChange={set('review')} rows={4}
          placeholder="Share your experience working with Modplint Interiors..."
          className={cn('w-full px-4 py-2.5 rounded-lg border bg-background text-foreground text-sm outline-none resize-none transition-colors focus:border-gold', errors.review ? 'border-red-400' : 'border-border')}
        />
        <div className="flex justify-between mt-1">
          {errors.review ? <p className="text-red-500 text-xs">{errors.review}</p> : <span />}
          <span className="text-xs text-muted-foreground">{form.review.length}/1000</span>
        </div>
      </div>

      {/* ── MEDIA UPLOAD ─────────────────────────────────────────────── */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Photos & Videos <span className="text-muted-foreground text-xs font-normal">(optional — share before/after shots or project videos)</span>
        </label>
        <label className="block cursor-pointer">
          <div className="border-2 border-dashed border-gold/50 bg-gold/5 hover:bg-gold/10 hover:border-gold rounded-xl p-5 text-center transition-all duration-200 group">
            <div className="flex flex-col items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Upload className="w-5 h-5 text-gold" />
              </div>
              <div>
                <p className="font-medium text-foreground text-sm">Upload Photos or Videos</p>
                <p className="text-xs text-muted-foreground mt-0.5">JPG, PNG, WEBP, MP4, MOV — Multiple files supported</p>
              </div>
            </div>
          </div>
          <input ref={mediaRef} type="file" multiple accept="image/*,video/*" className="hidden" onChange={handleMediaChange} />
        </label>
        <MediaPreviewStrip previews={mediaPreviews} onRemove={removePreview} />
        {mediaPreviews.length > 0 && (
          <p className="text-xs text-muted-foreground mt-1.5">{mediaPreviews.length} file{mediaPreviews.length !== 1 ? 's' : ''} selected · hover to remove</p>
        )}
      </div>

      <Button type="submit" variant="gold" disabled={submitting} className="w-full sm:w-auto">
        {submitting ? 'Submitting...' : <><Send className="w-4 h-4" />Submit Review</>}
      </Button>
    </form>
  )
}

// ─── Success state ────────────────────────────────────────────────────────────
function SubmitSuccess({ onReset }) {
  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-10">
      <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-4">
        <CheckCircle className="w-8 h-8 text-green-600" />
      </div>
      <h3 className="text-xl font-semibold text-foreground">Thank you for your review!</h3>
      <p className="text-muted-foreground mt-2 text-sm">
        Your testimonial (and any media you uploaded) is pending approval. We'll publish it shortly.
      </p>
      <button onClick={onReset} className="mt-6 text-sm text-gold hover:underline">Submit another review</button>
    </motion.div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function TestimonialsPage() {
  const [testimonials, setTestimonials] = useState([])
  const [loading, setLoading]           = useState(true)
  const [submitted, setSubmitted]       = useState(false)

  const fetchTestimonials = async () => {
    setLoading(true)
    try {
      const response = await testimonialsApi.getAll()
      const list = response.data?.data || response.data || []
      setTestimonials(Array.isArray(list) ? list : [])
    } catch {
      setTestimonials([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchTestimonials() }, [])

  const { HelmetComponent } = useSEO({
    title: 'Client Testimonials',
    description: 'Read testimonials from our satisfied clients. Discover what our customers say about our interior design services in Mumbai.',
    keywords: 'testimonials, client reviews, customer feedback, interior design reviews, client testimonials, project reviews',
    canonical: 'https://www.modplintinteriors.com/testimonials',
    ogTitle: 'Client Testimonials | Modplint Interiors',
    ogDescription: 'See what our clients say about our interior design services.',
    ogUrl: 'https://www.modplintinteriors.com/testimonials',
    breadcrumb: [
      { name: 'Home', url: 'https://www.modplintinteriors.com/' },
      { name: 'Testimonials', url: 'https://www.modplintinteriors.com/testimonials' },
    ],
  })

  return (
    <>
      <HelmetComponent />
      {/* Hero */}
      <section className="relative py-24 md:py-32 bg-charcoal overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <img src="https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=1920&q=80" alt="Client testimonials background - modern interior design space" className="w-full h-full object-cover" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl">
            <span className="inline-block px-4 py-2 bg-gold/20 text-gold text-sm font-medium rounded-full mb-6">Client Testimonials</span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-white">Trusted by Homeowners &amp; Businesses</h1>
            <p className="mt-6 text-lg text-white/70 leading-relaxed">Read what our clients have to say about our luxury interior design services.</p>
          </motion.div>
        </div>
      </section>

      {/* Approved testimonials grid */}
      <Section className="bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader badge="Feedback" title="Real Stories From Real Clients" description="Our clients trust us to transform their spaces with thoughtful design and exceptional service." centered />
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => <TestimonialCardSkeleton key={i} />)}
            </div>
          ) : testimonials.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {testimonials.map((t, index) => <TestimonialCard key={t._id || index} testimonial={t} index={index} />)}
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-xl font-semibold text-foreground">No testimonials yet.</p>
              <p className="text-muted-foreground mt-2">Be the first to share your experience below!</p>
            </div>
          )}
        </div>
      </Section>

      {/* Submit Review */}
      <Section className="bg-sand">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader badge="Share Your Experience" title="Leave a Review" description="Worked with us? Share your story — and feel free to upload before/after photos or a video walkthrough. Your review appears after a quick approval." centered />
          <div className="mt-8 bg-card border border-border rounded-3xl p-8 shadow-sm">
            {submitted ? <SubmitSuccess onReset={() => setSubmitted(false)} /> : <SubmitTestimonialForm onSuccess={() => setSubmitted(true)} />}
          </div>
        </div>
      </Section>

      {/* CTA */}
      <Section className="bg-charcoal">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <SectionHeader badge="Get Started" title="Want to Experience Modplint Interiors Yourself?" description="Book a consultation and let us create a luxurious space tailored to your needs." centered className="text-white [&_p]:text-white/70" />
          <Link to="/booking">
            <Button variant="gold" size="xl" className="mt-6">Book Consultation <ArrowRight className="w-5 h-5" /></Button>
          </Link>
        </div>
      </Section>
    </>
  )
}
