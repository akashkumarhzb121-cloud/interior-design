import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

export function LoadingSpinner({ size = 'md', className }) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className={cn('flex items-center justify-center', className)}>
      <div
        className={cn(
          'border-2 border-primary/30 border-t-primary rounded-full animate-spin',
          sizeClasses[size]
        )}
      />
    </div>
  );
}

export function PageLoader() {
  return (
    <div className="fixed inset-0 bg-background z-50 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center"
      >
        <div className="relative w-20 h-20 mx-auto mb-4">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
            className="absolute inset-0 border-4 border-primary/20 border-t-primary rounded-full"
          />
        </div>
        <p className="text-muted-foreground animate-pulse">Loading...</p>
      </motion.div>
    </div>
  );
}

export function ContentLoader({ rows = 3 }) {
  return (
    <div className="space-y-4 animate-pulse">
      {[...Array(rows)].map((_, i) => (
        <div key={i} className="space-y-2">
          <div className="h-4 bg-secondary rounded w-3/4" />
          <div className="h-4 bg-secondary rounded w-1/2" />
        </div>
      ))}
    </div>
  );
}

export function CardLoader() {
  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden animate-pulse">
      <div className="h-48 bg-secondary" />
      <div className="p-6 space-y-3">
        <div className="h-4 bg-secondary rounded w-3/4" />
        <div className="h-4 bg-secondary rounded w-1/2" />
        <div className="h-4 bg-secondary rounded w-5/6" />
      </div>
    </div>
  );
}

export function TableLoader({ rows = 5 }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border">
            {[...Array(4)].map((_, i) => (
              <th key={i} className="py-4 px-6">
                <div className="h-4 bg-secondary rounded w-20 animate-pulse" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {[...Array(rows)].map((_, i) => (
            <tr key={i} className="border-b border-border">
              {[...Array(4)].map((_, j) => (
                <td key={j} className="py-4 px-6">
                  <div className="h-4 bg-secondary rounded animate-pulse" style={{ width: `${60 + Math.random() * 40}%` }} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
