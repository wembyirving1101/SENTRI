import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from './utils'

/**
 * Semantic border variants for consistent visual hierarchy
 * Each variant serves a specific purpose in the design system
 */
export const borderVariants = cva('border', {
  variants: {
    variant: {
      // Subtle divider - low visual weight for separators and dividing lines
      divider: 'border-border/40',
      
      // Default/primary - standard borders for most components (cards, panels)
      default: 'border-border',
      
      // Emphasis - thicker, more prominent borders for important containers (2px)
      emphasis: 'border-2 border-border',
      
      // Strong emphasis - thickest border for the most prominent elements (4px)
      strongEmphasis: 'border-4 border-border',
      
      // Active/focus - indicates interactive or selected state
      active: 'border-2 border-accent',
      
      // Interactive - subtle interactive state with transition
      interactive: 'border-border hover:border-accent/80 transition-colors duration-200',
      
      // Error/danger - indicates error or destructive state
      error: 'border-destructive',
      
      // Success - indicates successful or valid state
      success: 'border-success',
      
      // Ring/focus - outline-style focus indicator
      ring: 'border-2 border-ring',
      
      // None - explicitly no border
      none: 'border-0',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
})

export type BorderVariant = VariantProps<typeof borderVariants>['variant']

/**
 * Helper function to combine border variants with additional classes
 */
export function getBorderClass(variant?: BorderVariant, additionalClasses?: string) {
  return cn(borderVariants({ variant }), additionalClasses)
}
