import { cn } from '@/lib/utils'

export function Skeleton({ className }) {
  return (
    <div
      className={cn('animate-pulse rounded-lg bg-muted', className)}
    />
  )
}

export function ProjectCardSkeleton() {
  return (
    <div className="group">
      <Skeleton className="aspect-[4/3] w-full rounded-xl" />
      <div className="mt-4 space-y-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    </div>
  )
}

export function ServiceCardSkeleton() {
  return (
    <div className="p-8 rounded-2xl border border-border">
      <Skeleton className="w-16 h-16 rounded-xl" />
      <Skeleton className="mt-6 h-6 w-1/2" />
      <Skeleton className="mt-4 h-4 w-full" />
      <Skeleton className="mt-2 h-4 w-3/4" />
      <div className="mt-6 space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    </div>
  )
}

export function TestimonialCardSkeleton() {
  return (
    <div className="p-8 rounded-2xl bg-card border border-border">
      <div className="flex items-center gap-4">
        <Skeleton className="w-14 h-14 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
      <div className="mt-6 space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    </div>
  )
}

export function TableRowSkeleton({ columns = 5 }) {
  return (
    <tr>
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className="p-4">
          <Skeleton className="h-5 w-full" />
        </td>
      ))}
    </tr>
  )
}
