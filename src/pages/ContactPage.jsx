import { useState } from 'react'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { MapPin, Phone, Mail, Clock, Send, MessageSquare } from 'lucide-react'
import { Section, SectionHeader } from '@/components/ui/Section'
import { Button } from '@/components/ui/Button'
import { Input, Textarea } from '@/components/ui/Input'
import { contactApi } from '@/api/services'

const contactInfo = [
  { icon: MapPin, title: 'Visit Us', details: ['Modplint Interiors Studio', 'Oshiwara, Andheri West', 'Mumbai, Maharashtra 400102'] },
  { icon: Phone, title: 'Call Us', details: ['+91 8104648421',] },
  { icon: Mail, title: 'Email Us', details: ['modplintinteriors@gmail.com', 'modplint@gmail.com'] },
  { icon: Clock, title: 'Working Hours', details: ['Mon - Fri: 10:00 AM - 6:00 PM', 'Sat: 10:00 AM - 4:00 PM', 'Sun: Closed'] },
]

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { register, handleSubmit, reset, formState: { errors } } = useForm()

  const onSubmit = async (data) => {
    setIsSubmitting(true)
    try {
      await contactApi.submit(data)
      toast.success('Message sent successfully! We will get back to you soon.')
      reset()
    } catch (error) {
      console.log('[v0] Error submitting contact form:', error)
      toast.error('Failed to send message. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <section className="relative py-24 md:py-32 bg-charcoal overflow-hidden">
        <div className="absolute inset-0 opacity-20"><img src="https://images.unsplash.com/photo-1497366216548-37526070297c?w=1920&q=80" alt="" className="w-full h-full object-cover" /></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl">
            <span className="inline-block px-4 py-2 bg-gold/20 text-gold text-sm font-medium rounded-full mb-6">Contact Us</span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-white">{"Let's Start a Conversation"}</h1>
            <p className="mt-6 text-lg text-white/70 leading-relaxed">Have a question or ready to start your project? We would love to hear from you.</p>
          </motion.div>
        </div>
      </section>

      <Section className="bg-background py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {contactInfo.map((info, index) => (
              <motion.div key={info.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1 }} className="p-6 rounded-2xl bg-card border border-border hover:border-gold/50 transition-colors">
                <div className="w-12 h-12 rounded-xl bg-gold/10 flex items-center justify-center mb-4"><info.icon className="w-6 h-6 text-gold" /></div>
                <h3 className="font-semibold mb-2">{info.title}</h3>
                <div className="space-y-1">{info.details.map((detail, i) => <p key={i} className="text-sm text-muted-foreground">{detail}</p>)}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      <Section className="bg-sand pt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12">
            <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-gold/10 flex items-center justify-center"><MessageSquare className="w-6 h-6 text-gold" /></div>
                <div><h2 className="text-2xl font-serif font-bold">Send Us a Message</h2><p className="text-muted-foreground text-sm">We typically respond within 24 hours</p></div>
              </div>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-6">
                  <Input id="name" label="Full Name" placeholder="Raj Kumar" error={errors.name?.message} {...register('name', { required: 'Name is required' })} />
                  <Input id="email" type="email" label="Email Address" placeholder="raj@gmail.com" error={errors.email?.message} {...register('email', { required: 'Email is required', pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: 'Invalid email address' } })} />
                </div>
                <div className="grid sm:grid-cols-2 gap-6">
                  <Input id="phone" type="tel" label="Phone Number" placeholder="+91 98765 43210" error={errors.phone?.message} {...register('phone', { required: 'Phone number is required' })} />
                  <Input id="subject" label="Subject" placeholder="Project Inquiry" error={errors.subject?.message} {...register('subject', { required: 'Subject is required' })} />
                </div>
                <Textarea id="message" label="Your Message" placeholder="Tell us about your project..." error={errors.message?.message} className="min-h-[150px]" {...register('message', { required: 'Message is required' })} />
                <Button type="submit" variant="gold" size="lg" disabled={isSubmitting} className="w-full sm:w-auto">
                  {isSubmitting ? (<><div className="w-5 h-5 border-2 border-charcoal/30 border-t-charcoal rounded-full animate-spin" />Sending...</>) : (<><Send className="w-5 h-5" />Send Message</>)}
                </Button>
              </form>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="relative">
              <div className="lg:sticky lg:top-28">
                <div className="aspect-[4/3] lg:aspect-[5/4] lg:h-[500px] rounded-2xl overflow-hidden border border-border">
                  <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3769.459982890668!2d72.82656507520098!3d19.135952982074716!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be7b63aceef0c69%3A0x2aa80cf2287dfa3b!2sOshiwara%2C%20Andheri%20West%2C%20Mumbai%2C%20Maharashtra!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin" width="100%" height="100%" style={{ border: 0 }} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade" title="Luxe Interiors Location" />
                </div>
                <div className="mt-4 p-4 bg-card rounded-xl border border-border">
                  <p className="text-sm text-muted-foreground"><strong className="text-foreground">Getting Here:</strong> We are located in Oshiwara, easily accessible from the Western Express Highway.</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </Section>

      <Section className="bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader badge="FAQs" title="Frequently Asked Questions" description="Quick answers to common questions about our services." centered />
          <div className="space-y-4">
            {[
              { q: 'What areas in Mumbai do you serve?', a: 'We serve all areas of Mumbai and MMR region, including Bandra, Juhu, Powai, Andheri, Worli, Lower Parel, Navi Mumbai, and Thane.' },
              { q: 'How long does a typical project take?', a: 'Project timelines vary based on scope. A single room typically takes 4-6 weeks, while a complete home renovation may take 3-6 months.' },
              { q: 'Do you offer virtual consultations?', a: 'Yes! We offer both in-person and virtual consultations via video call for clients who prefer remote discussions.' },
              { q: 'What is included in your design fee?', a: 'Our design fee includes concept development, space planning, 3D visualizations, material specifications, and project coordination.' },
              { q: 'Can you work with my existing furniture?', a: 'Absolutely! We love incorporating existing pieces that have sentimental value or complement the new design direction.' },
            ].map((faq, index) => (
              <motion.div key={index} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.05 }} className="p-6 rounded-xl bg-card border border-border">
                <h3 className="font-semibold text-lg">{faq.q}</h3>
                <p className="mt-2 text-muted-foreground">{faq.a}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </Section>
    </>
  )
}