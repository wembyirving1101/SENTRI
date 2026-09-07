# Centralized Typography System

This document describes the centralized typography system used throughout the Sentricol application.

## Overview

The application uses a centralized typography system defined in `app/globals.css`. This ensures consistent font usage across all components without requiring font-family declarations in individual components.

## Font Variables

All fonts are defined as CSS custom properties in the root `:root` selector:

```css
--font-body: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', sans-serif;
--font-mono: 'Courier New', Courier, monospace;
```

### Font Stack Explanation

#### `--font-body` (Default Font)
- `-apple-system`: macOS and iOS
- `BlinkMacSystemFont`: Fallback for older Safari
- `'Segoe UI'`: Windows
- `'Helvetica Neue'`: Fallback for older systems
- `sans-serif`: Final fallback

This stack provides native system fonts, ensuring optimal readability and performance.

#### `--font-mono` (Monospace Font)
Used for code, technical content, and data display:
- `'Courier New'`: Primary monospace font
- `Courier`: Fallback
- `monospace`: Final fallback

## Usage in Components

### Default Behavior
All text elements automatically inherit `--font-body` through the base layer CSS:

```tsx
// No font-family needed - inherits from body
<p>This uses the body font automatically</p>
<h1>Headers also use the body font</h1>
<button>Buttons too</button>
```

### Using the Body Font Explicitly
If you need to explicitly reference the body font:

```tsx
<div style={{ fontFamily: 'var(--font-body)' }}>
  Custom font application
</div>
```

### Using Monospace Font
For code or technical content:

```tsx
// Using Tailwind class
<code className="font-mono">const x = 10;</code>

// Or using style
<pre style={{ fontFamily: 'var(--font-mono)' }}>
  Code block
</pre>
```

### Custom UI Fonts
For special UI needs, use the `.ui-font` class:

```tsx
<span className="ui-font">Special UI text</span>
```

## Tailwind Integration

The fonts are integrated into Tailwind's theme configuration:

```css
@theme inline {
  --font-body: var(--font-body);
  --font-mono: var(--font-mono);
}
```

This allows using Tailwind's font utilities if needed:

```tsx
<p className="font-mono">Monospace text</p>
```

## Modifying Fonts

To change the application's default font globally:

1. Edit the CSS variable in `app/globals.css`:

```css
:root {
  --font-body: 'Your New Font', sans-serif;
}
```

2. The change will automatically apply to the entire application.
3. No component modifications are needed.

## Best Practices

1. **Don't hardcode fonts** - Use CSS variables instead
2. **Avoid font-family in components** - Let inheritance handle it
3. **Use semantic elements** - Proper HTML ensures correct font inheritance
4. **Test across browsers** - System fonts render differently on different platforms
5. **Keep the font stack** - Don't remove fallbacks; they ensure cross-platform consistency

## Inheritance Chain

```
HTML Element
    ↓
:root CSS variables (--font-body, --font-mono)
    ↓
@layer base { html, body { font-family: var(--font-body); } }
    ↓
Child elements inherit automatically
    ↓
Result: Consistent typography throughout the app
```

## Performance Benefits

- **No custom font downloads**: Uses system fonts
- **Faster page load**: No web font requests
- **Native rendering**: Optimized for each OS
- **Better readability**: OS-optimized fonts
- **Smaller CSS**: No font-family declarations in components

## Future Enhancements

If you want to use custom fonts (like Google Fonts):

1. Add font imports to `app/globals.css`:
```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap');
```

2. Update the font variable:
```css
--font-body: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
```

3. The rest of the application remains unchanged - all components automatically use the new font.
