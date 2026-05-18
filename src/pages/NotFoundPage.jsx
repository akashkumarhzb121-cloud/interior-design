import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Home, Compass } from 'lucide-react'

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-24">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl w-full text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gold text-charcoal mx-auto mb-8">
          <Compass className="w-10 h-10" />
        </div>
        <h1 className="text-6xl font-serif font-bold text-foreground">404</h1>
        <p className="mt-4 text-lg text-muted-foreground">We couldn't find the page you're looking for.</p>
        <Link to="/" className="inline-flex items-center gap-2 mt-8 px-6 py-3 bg-gold text-charcoal rounded-full font-semibold hover:bg-gold-dark transition-colors">
          <Home className="w-4 h-4" /> Return Home
        </Link>
      </motion.div>
    </div>
  )
}
