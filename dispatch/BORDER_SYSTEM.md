# Border System Design

## Overview
The border system provides **semantic, purpose-driven borders** with consistent visual hierarchy across the application. Each border variant serves a specific design intent, replacing the previous universal `border border-border` approach.

## Border Variants

### `divider`
**Purpose:** Low-contrast separators and dividing lines  
**Visual Weight:** Minimal (40% opacity)  
**Use Cases:**
- Separating sections within a container
- Dividing list items
- Subtle visual breaks between related content
- Internal panel dividers

**Example:**
```tsx
<div className={borderVariants({ variant: 'divider' })}>
  Divider content
</div>
```

---

### `default`
**Purpose:** Standard borders for most components (cards, panels)  
**Visual Weight:** Medium (full opacity)  
**Use Cases:**
- Card and panel containers
- Major content sections
- Primary component boundaries

**Example:**
```tsx
<div className={cn('bg-card rounded p-4', borderVariants({ variant: 'default' }))}>
  Card content
</div>
```

---

### `emphasis`
**Purpose:** Thick, prominent borders for important containers  
**Visual Weight:** High (2px border)  
**Use Cases:**
- Main Panel component (the emphasized container)
- Key focal points
- High-importance sections

**Example:**
```tsx
<Panel border="emphasis">
  Important content
</Panel>
```

---

### `strongEmphasis`
**Purpose:** Thickest border for the most prominent elements  
**Visual Weight:** Very High (4px border)  
**Use Cases:**
- Critical alerts or warnings
- Primary action containers
- Maximum visual prominence

**Example:**
```tsx
<div className={borderVariants({ variant: 'strongEmphasis' })}>
  Critical content
</div>
```

---

### `active`
**Purpose:** Indicates interactive or selected state  
**Visual Weight:** High (2px, accent color)  
**Use Cases:**
- Active/selected states
- Focus states
- Currently active elements

**Example:**
```tsx
<button className={borderVariants({ variant: 'active' })}>
  Active button
</button>
```

---

### `interactive`
**Purpose:** Interactive elements with hover state transitions  
**Visual Weight:** Medium with transition  
**Use Cases:**
- Buttons with hover effects
- Clickable cards
- Interactive components

**Example:**
```tsx
<div className={borderVariants({ variant: 'interactive' })}>
  Hover me
</div>
```

---

### `error`
**Purpose:** Indicates error or destructive state  
**Visual Weight:** Medium (destructive color)  
**Use Cases:**
- Error messages
- Invalid inputs
- Destructive actions
- Warning states

**Example:**
```tsx
<div className={borderVariants({ variant: 'error' })}>
  Error content
</div>
```

---

### `success`
**Purpose:** Indicates successful or valid state  
**Visual Weight:** Medium (success color)  
**Use Cases:**
- Success messages
- Valid states
- Confirmed actions

**Example:**
```tsx
<div className={borderVariants({ variant: 'success' })}>
  Success content
</div>
```

---

### `ring`
**Purpose:** Outline-style focus indicator (accessibility)  
**Visual Weight:** High (2px, ring color)  
**Use Cases:**
- Focus indicators
- Keyboard navigation states
- Accessibility focus rings

**Example:**
```tsx
<input className={borderVariants({ variant: 'ring' })} />
```

---

### `none`
**Purpose:** Explicitly remove borders  
**Visual Weight:** None  
**Use Cases:**
- Elements that should not have borders
- Transparent sections
- Clean, borderless layouts

**Example:**
```tsx
<div className={borderVariants({ variant: 'none' })}>
  No border
</div>
```

---

## Usage Patterns

### Using borderVariants directly
```tsx
import { borderVariants } from '@/lib/borderVariants'
import { cn } from '@/lib/utils'

export function MyComponent() {
  return (
    <div className={cn('p-4 rounded', borderVariants({ variant: 'default' }))}>
      Content
    </div>
  )
}
```

### Using with Panel component
```tsx
<Panel border="emphasis">
  This panel has a thicker emphasis border
</Panel>
```

### Combining multiple border uses
```tsx
<div className={cn('flex flex-col gap-4', borderVariants({ variant: 'default' }))}>
  <div className={borderVariants({ variant: 'divider' })}>Item 1</div>
  <div className={borderVariants({ variant: 'divider' })}>Item 2</div>
</div>
```

---

## Color Reference

Borders use these semantic colors defined in `/app/globals.css`:

- **Default:** `--border` (#3a3a3a)
- **Accent:** `--accent` (#d4c5a9)
- **Destructive:** `--destructive` (#c97373)
- **Success:** `--success` (#7a9d6d)
- **Ring:** `--ring` (#d4c5a9)

---

## Migration Guide

### Before (Anti-pattern)
```tsx
// Universal, non-semantic approach
<div className="border border-border rounded p-4">
  <div className="border border-border rounded">
    <div className="border border-border">Content</div>
  </div>
</div>
```

### After (Semantic approach)
```tsx
import { borderVariants } from '@/lib/borderVariants'

<Panel border="emphasis">
  <div className={cn('rounded p-4', borderVariants({ variant: 'default' }))}>
    <div className={borderVariants({ variant: 'divider' })}>Content</div>
  </div>
</Panel>
```

---

## Benefits

✅ **Semantic meaning** - Each border has a clear purpose  
✅ **Consistent hierarchy** - Visual weight indicates importance  
✅ **Easy maintenance** - Update borders globally without touching every component  
✅ **Accessibility** - Clear focus and interactive states  
✅ **Scalability** - New components follow established patterns  
✅ **Flexibility** - Mix and match variants as needed  

---

## Customization

To modify border styles globally, update the `borderVariants` in `/lib/borderVariants.ts`:

```tsx
export const borderVariants = cva('', {
  variants: {
    variant: {
      divider: 'border border-border/40',        // Edit this line
      default: 'border border-border',           // Or this
      // ... etc
    },
  },
})
```

Changes will automatically apply throughout the application.
