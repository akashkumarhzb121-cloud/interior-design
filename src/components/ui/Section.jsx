import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

export function Section({ children, className, ...props }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.6 }}
      className={cn('py-16 md:py-24', className)}
      {...props}
    >
      {children}
    </motion.section>
  )
}

export function SectionHeader({
  badge,
  title,
  description,
  centered = false,
  className,
}) {
  return (
    <div
      className={cn(
        'max-w-3xl mb-12',
        centered && 'mx-auto text-center',
        className
      )}
    >
      {badge && (
        <motion.span
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="inline-block px-4 py-1.5 bg-gold/10 text-gold text-sm font-medium rounded-full mb-4"
        >
          {badge}
        </motion.span>
      )}
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.1 }}
        className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-balance"
      >
        {title}
      </motion.h2>
      {description && (
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="mt-4 text-muted-foreground text-lg leading-relaxed"
        >
          {description}
        </motion.p>
      )}
    </div>
  )
}
