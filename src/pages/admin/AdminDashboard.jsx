import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { LayoutDashboard, FolderKanban, Wrench, MessageSquareQuote, Mail, Calendar } from 'lucide-react'
import { Section, SectionHeader } from '@/components/ui/Section'
import { Button } from '@/components/ui/Button'
import { projectsApi, servicesApi, testimonialsApi, contactApi, bookingsApi } from '@/api/services'

const dashboardCards = [
  { key: 'projects', label: 'Projects', icon: FolderKanban, color: 'bg-gold/10 text-gold', path: '/admin/projects' },
  { key: 'services', label: 'Services', icon: Wrench, color: 'bg-secondary/10 text-secondary', path: '/admin/services' },
  { key: 'testimonials', label: 'Testimonials', icon: MessageSquareQuote, color: 'bg-primary/10 text-primary', path: '/admin/testimonials' },
  { key: 'inquiries', label: 'Contact Inquiries', icon: Mail, color: 'bg-charcoal/10 text-foreground', path: '/admin/inquiries' },
  { key: 'bookings', label: 'Bookings', icon: Calendar, color: 'bg-sand/10 text-gold', path: '/admin/bookings' },
]

export default function AdminDashboard() {
  const [counts, setCounts] = useState({ projects: 0, services: 0, testimonials: 0, inquiries: 0, bookings: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const [projectsRes, servicesRes, testimonialsRes, contactsRes, bookingsRes] = await Promise.all([
          projectsApi.getAll(),
          servicesApi.getAll(),
          testimonialsApi.getAll(),
          contactApi.getAll(),
          bookingsApi.getAll(),
        ])

        setCounts({
          projects: projectsRes.data?.length || 0,
          services: servicesRes.data?.length || 0,
          testimonials: testimonialsRes.data?.length || 0,
          inquiries: contactsRes.data?.length || 0,
          bookings: bookingsRes.data?.length || 0,
        })
      } catch (error) {
        console.error('[v0] Failed to load admin stats:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchCounts()
  }, [])

  return (
    <Section className="bg-background min-h-[calc(100vh-4rem)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader title="Admin Dashboard" description="Quick access to project, service, testimonial, inquiry and booking management." />

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3 mt-10">
          {dashboardCards.map((card) => {
            const Icon = card.icon
            return (
              <Link key={card.key} to={card.path} className="group block rounded-3xl border border-border bg-card p-8 hover:border-gold/50 hover:shadow-lg transition-all">
                <div className={card.color + ' inline-flex p-3 rounded-2xl mb-5'}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className="text-sm text-muted-foreground">{card.label}</div>
                <div className="mt-4 text-4xl font-serif font-bold text-foreground">{loading ? '...' : counts[card.key]}</div>
                <div className="mt-3 text-sm text-gold">Manage {card.label.toLowerCase()}</div>
              </Link>
            )
          })}
        </div>

        <div className="mt-12 p-8 rounded-3xl border border-border bg-card">
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <LayoutDashboard className="w-5 h-5" />
            <span>Designed to help you manage your interior design data quickly and safely.</span>
          </div>
          <div className="mt-6 text-sm leading-relaxed text-foreground">
            Use the admin sidebar to review new inquiries, bookings, and update projects, services, or testimonials.
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild>
              <Link to="/admin/projects" className="w-full sm:w-auto">View Projects</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/admin/services" className="w-full sm:w-auto">Manage Services</Link>
            </Button>
          </div>
        </div>
      </div>
    </Section>
  )
}
