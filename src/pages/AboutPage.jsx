import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowRight, Award, Users, Target, Heart } from 'lucide-react'
import { Section, SectionHeader } from '@/components/ui/Section'
import { Button } from '@/components/ui/Button'

const team = [
  {
    name: 'Aisha Sharma',
    role: 'Founder & Principal Designer',
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&q=80',
    bio: 'With 20+ years in luxury interior design, Aisha brings her vision of timeless elegance to every project.',
  },
  {
    name: 'Vikram Mehta',
    role: 'Creative Director',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80',
    bio: 'Vikram leads our design team with his innovative approach to contemporary living spaces.',
  },
  {
    name: 'Priya Kapoor',
    role: 'Senior Interior Designer',
    image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&q=80',
    bio: 'Specializing in residential design, Priya creates warm, inviting spaces for families across Mumbai.',
  },
  {
    name: 'Raj Malhotra',
    role: 'Project Manager',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&q=80',
    bio: 'Raj ensures every project is delivered on time and exceeds client expectations.',
  },
]

const values = [
  { icon: Award, title: 'Excellence', description: 'We pursue perfection in every detail, from concept to completion.' },
  { icon: Heart, title: 'Passion', description: 'Our love for design drives us to create extraordinary spaces.' },
  { icon: Users, title: 'Collaboration', description: 'We work closely with clients to bring their vision to life.' },
  { icon: Target, title: 'Precision', description: 'Every measurement, material, and finish is carefully considered.' },
]

const milestones = [
  { year: '2010', title: 'Founded in Mumbai', description: 'Started our journey in Andheri West' },
  { year: '2014', title: 'First Design Award', description: 'Recognized for excellence in residential design' },
  { year: '2017', title: 'Expanded Services', description: 'Added commercial and hospitality design' },
  { year: '2020', title: '200th Project', description: 'Celebrated our milestone during the pandemic' },
  { year: '2024', title: 'Industry Leader', description: 'Named among Mumbai top design studios' },
]

export default function AboutPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative py-24 md:py-32 bg-charcoal overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <img src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1920&q=80" alt="" className="w-full h-full object-cover" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl">
            <span className="inline-block px-4 py-2 bg-gold/20 text-gold text-sm font-medium rounded-full mb-6">About Us</span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-white">Crafting Luxury Spaces Since 2010</h1>
            <p className="mt-6 text-lg text-white/70 leading-relaxed">
              {"Luxe Interiors is Mumbai's premier interior design studio, transforming residential and commercial spaces into extraordinary experiences."}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Story Section */}
      <Section className="bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <SectionHeader badge="Our Story" title="Where Vision Meets Craftsmanship" className="mb-6" />
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>Founded in 2010 by Aisha Sharma, Luxe Interiors began with a simple vision: to bring world-class interior design to Mumbai.</p>
                <p>Our approach combines contemporary aesthetics with timeless elegance, creating spaces that are both beautiful and functional.</p>
                <p>Today, with a team of 25+ talented designers and craftsmen, we continue to push boundaries.</p>
              </div>
              <div className="mt-8 grid grid-cols-3 gap-6">
                <div><div className="text-3xl font-serif font-bold text-gold">250+</div><div className="text-sm text-muted-foreground">Projects</div></div>
                <div><div className="text-3xl font-serif font-bold text-gold">15+</div><div className="text-sm text-muted-foreground">Years</div></div>
                <div><div className="text-3xl font-serif font-bold text-gold">25+</div><div className="text-sm text-muted-foreground">Team Members</div></div>
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="relative">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div className="aspect-[3/4] rounded-2xl overflow-hidden"><img src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&q=80" alt="Interior design" className="w-full h-full object-cover" /></div>
                  <div className="aspect-square rounded-2xl overflow-hidden"><img src="https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=600&q=80" alt="Interior design" className="w-full h-full object-cover" /></div>
                </div>
                <div className="pt-8 sm:pt-0">
                  <div className="aspect-[3/4] rounded-2xl overflow-hidden"><img src="https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=600&q=80" alt="Interior design" className="w-full h-full object-cover" /></div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </Section>

      {/* Values Section */}
      <Section className="bg-sand">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader badge="Our Values" title="What Drives Us" description="The principles that guide every project we undertake." centered />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <motion.div key={value.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1 }} className="p-6 rounded-2xl bg-card border border-border text-center">
                <div className="w-14 h-14 mx-auto rounded-xl bg-gold/10 flex items-center justify-center mb-4"><value.icon className="w-7 h-7 text-gold" /></div>
                <h3 className="text-lg font-serif font-semibold">{value.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      {/* Timeline Section */}
      <Section className="bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader badge="Our Journey" title="Milestones" centered />
          <div className="relative">
            <div className="absolute left-1/2 top-0 bottom-0 w-px bg-border -translate-x-1/2 hidden md:block" />
            <div className="space-y-8">
              {milestones.map((milestone, index) => (
                <motion.div key={milestone.year} initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className={`relative flex flex-col md:flex-row items-center gap-4 ${index % 2 === 0 ? 'md:flex-row-reverse' : ''}`}>
                  <div className="flex-1 text-center md:text-left">
                    <div className={index % 2 === 0 ? 'md:text-right' : ''}>
                      <span className="text-gold font-serif font-bold text-2xl">{milestone.year}</span>
                      <h3 className="text-lg font-semibold mt-1">{milestone.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{milestone.description}</p>
                    </div>
                  </div>
                  <div className="relative z-10 w-4 h-4 rounded-full bg-gold border-4 border-background" />
                  <div className="flex-1 hidden md:block" />
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* Team Section */}
      <Section className="bg-charcoal">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader badge="Meet the Team" title="The Creative Minds Behind Luxe" description="Our talented team brings decades of combined experience to every project." centered className="text-white [&_p]:text-white/70" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <motion.div key={member.name} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1 }} className="group">
                <div className="relative aspect-[3/4] rounded-2xl overflow-hidden mb-4">
                  <img src={member.image} alt={member.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <h3 className="text-lg font-semibold text-white">{member.name}</h3>
                <p className="text-gold text-sm">{member.role}</p>
                <p className="mt-2 text-white/60 text-sm">{member.bio}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      {/* CTA Section */}
      <Section className="bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <SectionHeader badge="Join Our Journey" title="Ready to Work With Us?" description="Let us help you create a space that reflects your unique style." centered />
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/booking"><Button variant="gold" size="xl">Book a Consultation<ArrowRight className="w-5 h-5" /></Button></Link>
            <Link to="/projects"><Button variant="outline" size="xl">View Our Work</Button></Link>
          </div>
        </div>
      </Section>
    </>
  )
}
