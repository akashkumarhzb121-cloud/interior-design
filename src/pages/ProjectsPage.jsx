import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Search, MapPin, ArrowRight, Filter, X, AlertCircle } from 'lucide-react'
import { Section, SectionHeader } from '@/components/ui/Section'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { ProjectCardSkeleton } from '@/components/ui/Skeleton'
import { projectsApi } from '@/api/services'
import { cn } from '@/lib/utils'

const categories = ['All', 'Residential', 'Commercial', 'Hospitality', 'Office', 'Retail']

// Helper: safely extract URL string from image entry
// Backend stores images as { url, publicId } objects, not plain strings
function getImageUrl(img, fallback = 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=600&q=80') {
  if (!img) return fallback
  if (typeof img === 'string') return img   // plain string (legacy)
  if (img.url) return img.url               // object { url, publicId }
  return fallback
}

export default function ProjectsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [projects, setProjects] = useState([])
  const [filteredProjects, setFilteredProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState(searchParams.get('category') || 'All')
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setError(null)
        const response = await projectsApi.getAll()
        // FIX: backend wraps data as { success, data: [...] }
        // axios gives response.data = { success, data: [...] }
        // so the array lives at response.data.data
        const list = response.data?.data || response.data || []
        setProjects(Array.isArray(list) ? list : [])
        setFilteredProjects(Array.isArray(list) ? list : [])
      } catch (error) {
        console.error('[ProjectsPage] Error fetching projects:', error)
        setError('Failed to load projects. Please try again.')
      } finally {
        setLoading(false)
      }
    }
    fetchProjects()
  }, [])

  useEffect(() => {
    let filtered = [...projects]
    if (activeCategory !== 'All') {
      filtered = filtered.filter(
        (project) => project.category?.toLowerCase() === activeCategory.toLowerCase()
      )
    }
    if (searchQuery) {
      filtered = filtered.filter(
        (project) =>
          project.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          project.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          project.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }
    setFilteredProjects(filtered)
  }, [projects, activeCategory, searchQuery])

  const handleCategoryChange = (category) => {
    setActiveCategory(category)
    if (category === 'All') {
      searchParams.delete('category')
    } else {
      searchParams.set('category', category)
    }
    setSearchParams(searchParams)
  }

  return (
    <>
      {/* Hero */}
      <section className="relative min-h-[60vh] sm:min-h-[64vh] md:min-h-[70vh] lg:min-h-[75vh] overflow-hidden bg-charcoal">
        <div className="absolute inset-0 opacity-20">
          <img
            src="https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=1920&q=80"
            alt=""
            className="w-full h-full object-cover"
          />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-28 lg:py-32">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl">
            <span className="inline-block px-4 py-2 bg-gold/20 text-gold text-sm font-medium rounded-full mb-6">
              Our Portfolio
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-white">
              Explore Our Projects
            </h1>
            <p className="mt-6 text-lg text-white/70 leading-relaxed">
              Discover our collection of stunning interior design projects across Mumbai.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Filter bar */}
      <Section className="bg-background py-8 lg:sticky lg:top-20 z-20 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <div className="hidden lg:flex items-center gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => handleCategoryChange(category)}
                  className={cn(
                    'px-4 py-2 rounded-full text-sm font-medium transition-colors',
                    activeCategory === category
                      ? 'bg-gold text-charcoal'
                      : 'bg-secondary text-foreground hover:bg-gold/20'
                  )}
                >
                  {category}
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden flex items-center gap-2 px-4 py-2 bg-secondary rounded-lg"
            >
              <Filter className="w-4 h-4" />Filters
            </button>
            <div className="relative w-full lg:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-10"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              )}
            </div>
          </div>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="lg:hidden mt-4 flex flex-wrap gap-2"
            >
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => { handleCategoryChange(category); setShowFilters(false) }}
                  className={cn(
                    'px-4 py-2 rounded-full text-sm font-medium transition-colors',
                    activeCategory === category
                      ? 'bg-gold text-charcoal'
                      : 'bg-secondary text-foreground hover:bg-gold/20'
                  )}
                >
                  {category}
                </button>
              ))}
            </motion.div>
          )}
        </div>
      </Section>

      {/* Projects grid */}
      <Section className="bg-background pt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {error ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 mx-auto bg-destructive/10 rounded-full flex items-center justify-center mb-4">
                <AlertCircle className="w-8 h-8 text-destructive" />
              </div>
              <h3 className="text-xl font-semibold">Something went wrong</h3>
              <p className="text-muted-foreground mt-2">{error}</p>
              <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
                Try Again
              </Button>
            </div>
          ) : (
            <>
              <div className="mb-8">
                <p className="text-muted-foreground">
                  Showing{' '}
                  <span className="text-foreground font-medium">{filteredProjects.length}</span>{' '}
                  project{filteredProjects.length !== 1 ? 's' : ''}
                  {activeCategory !== 'All' && (
                    <> in <span className="text-gold">{activeCategory}</span></>
                  )}
                </p>
              </div>

              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {Array.from({ length: 9 }).map((_, i) => <ProjectCardSkeleton key={i} />)}
                </div>
              ) : filteredProjects.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {filteredProjects.map((project, index) => (
                    <ProjectCard
                      key={project._id || project.id || index}
                      project={project}
                      index={index}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <div className="w-20 h-20 mx-auto bg-secondary rounded-full flex items-center justify-center mb-4">
                    <Search className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold">No projects found</h3>
                  <p className="text-muted-foreground mt-2">
                    Try adjusting your search or filter criteria
                  </p>
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => { setSearchQuery(''); handleCategoryChange('All') }}
                  >
                    Clear Filters
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </Section>

      {/* CTA */}
      <Section className="bg-sand">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <SectionHeader
            badge="Start Your Project"
            title="Have a Space to Transform?"
            description="Let us bring your vision to life. Book a free consultation with our expert designers."
            centered
          />
          <Link to="/booking">
            <Button variant="gold" size="xl">
              Book Consultation<ArrowRight className="w-5 h-5" />
            </Button>
          </Link>
        </div>
      </Section>
    </>
  )
}

function ProjectCard({ project, index }) {
  const projectId = project._id || project.id

  // FIX: images are stored as objects {url, publicId} not plain strings
  const imageUrl = getImageUrl(project.images?.[0])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05 }}
      className="group"
    >
      <Link to={projectId ? `/projects/${projectId}` : '/projects'}>
        <div className="relative aspect-[4/3] rounded-xl overflow-hidden">
          <img
            src={imageUrl}
            alt={project.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <span className="inline-block px-3 py-1 bg-gold/90 text-charcoal text-xs font-medium rounded-full mb-2">
              {project.category}
            </span>
            <h3 className="text-xl font-serif font-semibold text-white group-hover:text-gold transition-colors">
              {project.title}
            </h3>
            {project.location && (
              <p className="mt-1 text-white/80 text-sm flex items-center gap-1">
                <MapPin className="w-3 h-3" />{project.location}
              </p>
            )}
          </div>
          <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="w-10 h-10 bg-gold rounded-full flex items-center justify-center">
              <ArrowRight className="w-5 h-5 text-charcoal" />
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
