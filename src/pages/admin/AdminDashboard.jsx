import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  LayoutDashboard, FolderKanban, Wrench, MessageSquareQuote,
  Mail, Calendar, TrendingUp, Clock, CheckCircle, AlertCircle,
} from 'lucide-react'
import { Section, SectionHeader } from '@/components/ui/Section'
import { Button } from '@/components/ui/Button'
import { projectsApi, servicesApi, testimonialsApi, contactApi, bookingsApi } from '@/api/services'

export default function AdminDashboard() {
  const [counts,   setCounts]   = useState({ projects: 0, services: 0, testimonials: 0, inquiries: 0, bookings: 0 })
  const [pending,  setPending]  = useState({ testimonials: 0, inquiries: 0, bookings: 0 })
  const [recent,   setRecent]   = useState({ inquiries: [], bookings: [] })
  const [loading,  setLoading]  = useState(true)

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

        // FIX: backend wraps arrays as { success, data: [...] }
        // axios gives response.data = { success, data: [...] }
        // so the actual array is at response.data.data, NOT response.data
        const projects     = projectsRes.data?.data     || projectsRes.data     || []
        const services     = servicesRes.data?.data     || servicesRes.data     || []
        const testimonials = testimonialsRes.data?.data || testimonialsRes.data || []
        const contacts     = contactsRes.data?.data     || contactsRes.data     || []
        const bookings     = bookingsRes.data?.data     || bookingsRes.data     || []

        const projectsArr     = Array.isArray(projects)     ? projects     : []
        const servicesArr     = Array.isArray(services)     ? services     : []
        const testimonialsArr = Array.isArray(testimonials) ? testimonials : []
        const contactsArr     = Array.isArray(contacts)     ? contacts     : []
        const bookingsArr     = Array.isArray(bookings)     ? bookings     : []

        // Total counts
        setCounts({
          projects:     projectsArr.length,
          services:     servicesArr.length,
          testimonials: testimonialsArr.length,
          inquiries:    contactsArr.length,
          bookings:     bookingsArr.length,
        })

        // Pending / action-needed counts
        setPending({
          testimonials: testimonialsArr.filter((t) => !t.isApproved).length,
          inquiries:    contactsArr.filter((c) => c.status === 'new').length,
          bookings:     bookingsArr.filter((b) => b.status === 'pending').length,
        })

        // Recent 3 of each for activity feed
        setRecent({
          inquiries: contactsArr.slice(0, 3),
          bookings:  bookingsArr.slice(0, 3),
        })
      } catch (error) {
        console.error('[Dashboard] Failed to load stats:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchCounts()
  }, [])

  const cards = [
    {
      key:   'projects',
      label: 'Total Projects',
      icon:  FolderKanban,
      color: 'bg-gold/10 text-gold',
      path:  '/admin/projects',
      badge: null,
    },
    {
      key:   'services',
      label: 'Services',
      icon:  Wrench,
      color: 'bg-blue-500/10 text-blue-500',
      path:  '/admin/services',
      badge: null,
    },
    {
      key:   'testimonials',
      label: 'Testimonials',
      icon:  MessageSquareQuote,
      color: 'bg-purple-500/10 text-purple-500',
      path:  '/admin/testimonials',
      badge: pending.testimonials,
      badgeLabel: 'pending approval',
    },
    {
      key:   'inquiries',
      label: 'Contact Inquiries',
      icon:  Mail,
      color: 'bg-orange-500/10 text-orange-500',
      path:  '/admin/inquiries',
      badge: pending.inquiries,
      badgeLabel: 'new',
    },
    {
      key:   'bookings',
      label: 'Bookings',
      icon:  Calendar,
      color: 'bg-green-500/10 text-green-500',
      path:  '/admin/bookings',
      badge: pending.bookings,
      badgeLabel: 'pending',
    },
  ]

  return (
    <Section className="bg-background min-h-[calc(100vh-4rem)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          title="Admin Dashboard"
          description="Overview of your website activity and quick access to all management sections."
        />

        {/* Stat cards */}
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3 mt-10">
          {cards.map((card) => {
            const Icon = card.icon
            return (
              <Link
                key={card.key}
                to={card.path}
                className="group relative block rounded-3xl border border-border bg-card p-8 hover:border-gold/50 hover:shadow-lg transition-all"
              >
                {/* Action-needed badge */}
                {!loading && card.badge > 0 && (
                  <span className="absolute top-5 right-5 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">
                    <AlertCircle className="w-3 h-3" />
                    {card.badge} {card.badgeLabel}
                  </span>
                )}

                <div className={card.color + ' inline-flex p-3 rounded-2xl mb-5'}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className="text-sm text-muted-foreground">{card.label}</div>
                <div className="mt-2 text-4xl font-serif font-bold text-foreground">
                  {loading ? (
                    <span className="inline-block w-12 h-9 rounded-lg bg-muted animate-pulse" />
                  ) : (
                    counts[card.key]
                  )}
                </div>
                <div className="mt-3 text-sm text-gold group-hover:underline">
                  Manage →
                </div>
              </Link>
            )
          })}
        </div>

        {/* Action needed alert */}
        {!loading && (pending.testimonials + pending.inquiries + pending.bookings) > 0 && (
          <div className="mt-8 p-5 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-amber-900 text-sm">Action needed</p>
              <div className="mt-1 text-sm text-amber-800 space-y-0.5">
                {pending.inquiries    > 0 && <p>• {pending.inquiries} new contact {pending.inquiries === 1 ? 'inquiry' : 'inquiries'} waiting</p>}
                {pending.bookings     > 0 && <p>• {pending.bookings} booking {pending.bookings === 1 ? 'request' : 'requests'} pending</p>}
                {pending.testimonials > 0 && <p>• {pending.testimonials} testimonial {pending.testimonials === 1 ? 'submission' : 'submissions'} awaiting approval</p>}
              </div>
            </div>
          </div>
        )}

        {/* Recent activity */}
        <div className="mt-8 grid md:grid-cols-2 gap-6">
          {/* Recent inquiries */}
          <div className="rounded-3xl border border-border bg-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <Mail className="w-4 h-4 text-orange-500" /> Recent Inquiries
              </h3>
              <Link to="/admin/inquiries" className="text-xs text-gold hover:underline">View all</Link>
            </div>
            {loading ? (
              <div className="space-y-3">
                {[1,2,3].map((i) => <div key={i} className="h-10 rounded-lg bg-muted animate-pulse" />)}
              </div>
            ) : recent.inquiries.length > 0 ? (
              <div className="space-y-3">
                {recent.inquiries.map((c) => (
                  <div key={c._id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                    <div>
                      <p className="text-sm font-medium text-foreground">{c.name}</p>
                      <p className="text-xs text-muted-foreground">{c.email}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      c.status === 'new'     ? 'bg-yellow-100 text-yellow-800' :
                      c.status === 'replied' ? 'bg-green-100 text-green-800'  :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {c.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground py-4 text-center">No inquiries yet.</p>
            )}
          </div>

          {/* Recent bookings */}
          <div className="rounded-3xl border border-border bg-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <Calendar className="w-4 h-4 text-green-500" /> Recent Bookings
              </h3>
              <Link to="/admin/bookings" className="text-xs text-gold hover:underline">View all</Link>
            </div>
            {loading ? (
              <div className="space-y-3">
                {[1,2,3].map((i) => <div key={i} className="h-10 rounded-lg bg-muted animate-pulse" />)}
              </div>
            ) : recent.bookings.length > 0 ? (
              <div className="space-y-3">
                {recent.bookings.map((b) => (
                  <div key={b._id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                    <div>
                      <p className="text-sm font-medium text-foreground">{b.name || b.clientName}</p>
                      <p className="text-xs text-muted-foreground">{b.service || b.serviceType || 'Consultation'}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      b.status === 'pending'   ? 'bg-yellow-100 text-yellow-800' :
                      b.status === 'confirmed' ? 'bg-green-100 text-green-800'  :
                      b.status === 'cancelled' ? 'bg-red-100 text-red-700'      :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {b.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground py-4 text-center">No bookings yet.</p>
            )}
          </div>
        </div>

        {/* Quick actions */}
        <div className="mt-8 p-8 rounded-3xl border border-border bg-card">
          <div className="flex items-center gap-2 mb-5">
            <TrendingUp className="w-5 h-5 text-gold" />
            <h3 className="font-semibold text-foreground">Quick Actions</h3>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button asChild variant="gold">
              <Link to="/admin/projects">+ Add Project</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/admin/services">+ Add Service</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/admin/testimonials">Review Testimonials</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/admin/inquiries">View Inquiries</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/admin/bookings">View Bookings</Link>
            </Button>
          </div>
        </div>
      </div>
    </Section>
  )
}
