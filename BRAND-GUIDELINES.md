# Formula PM V3 - Brand Guidelines

## 🎨 Brand Identity

Formula PM V3 is a professional construction project management platform that combines powerful functionality with clean, accessible design. Our brand reflects the precision, efficiency, and reliability required in the construction industry.

## 📐 Logo System

### Primary Logo Assets
- **F Icon**: `/public/logos/logo-f.png` - The geometric "F" symbol
- **Formula Text**: `/public/logos/logo-formula.png` - The company name in professional typography

### Logo Variants

#### **1. Full Logo (F + Formula)**
```tsx
<Logo variant="full" size="md" />
<LogoFull size="lg" />
```
**Usage**: Primary branding, desktop headers, marketing materials, login pages

#### **2. Icon Only (F Symbol)**
```tsx
<Logo variant="icon" size="sm" />
<LogoIcon size="md" />
```
**Usage**: Favicons, mobile headers, collapsed navigation, app icons, loading states

#### **3. Text Only (Formula)**
```tsx
<Logo variant="text" size="md" />
<LogoText size="lg" />
```
**Usage**: Email signatures, document headers, minimal branding contexts

#### **4. Auto Responsive**
```tsx
<Logo variant="auto" size="md" />
```
**Usage**: Navigation headers (icon on mobile, full on desktop)

### Size Guidelines

| Size | Icon Dimensions | Text Height | Use Case |
|------|----------------|-------------|----------|
| `xs` | 16x16px | 12px | Inline elements, small UI |
| `sm` | 24x24px | 16px | Compact headers, sidebar |
| `md` | 32x32px | 24px | Standard navigation |
| `lg` | 48x48px | 32px | Page headers, cards |
| `xl` | 64x64px | 48px | Login screens, splash |

### Logo Spacing
- **Minimum clear space**: 1x the height of the "F" icon on all sides
- **Minimum size**: Never smaller than 16x16px for the icon
- **Maximum size**: No limit, but maintain aspect ratio

## 🎯 Brand Colors

### Primary Palette
```css
/* Construction Industry Blue */
--primary-50:   #f0f9ff;
--primary-100:  #e0f2fe;
--primary-500:  #0ea5e9;  /* Main brand blue */
--primary-600:  #0284c7;
--primary-700:  #0369a1;
--primary-900:  #0c4a6e;
```

### Professional Gray System
```css
/* WCAG-Compliant Gray Palette */
--gray-100: #F4F4F4;  /* Backgrounds */
--gray-200: #DCDCDC;  /* Hover states */
--gray-300: #BFBFBF;  /* Input borders */
--gray-400: #9B9B9B;  /* Form borders */
--gray-500: #7A7A7A;  /* Border hover */
--gray-600: #5A5A5A;  /* Icons */
--gray-700: #3C3C3C;  /* Metadata text */
--gray-800: #1C1C1C;  /* Secondary text */
--gray-900: #0F0F0F;  /* Primary text */
```

### Construction Accent Colors
```css
--construction-orange: #f97316;  /* Safety/Warning */
--construction-yellow: #eab308;  /* Caution/Attention */
--construction-safety: #dc2626;  /* Safety/Critical */
```

## 📱 Brand Application

### Website/App Header
```tsx
// Desktop: Full branding
<header className="flex items-center gap-3">
  <Logo variant="full" size="md" />
  <span className="text-gray-700 text-sm">V3</span>
</header>

// Mobile: Compact branding
<header className="flex items-center">
  <Logo variant="icon" size="md" />
</header>
```

### Loading States
```tsx
// Branded loading with logo animation
<LogoLoading size="lg" />

// Custom loading with message
<FormulaLoading 
  message="Loading Formula PM..."
  description="Preparing your construction dashboard"
/>
```

### Authentication Pages
```tsx
// Login/Signup header
<div className="text-center mb-8">
  <LogoBrand size="xl" showVersion={true} />
  <p className="text-gray-700 mt-2">
    Construction Project Management Platform
  </p>
</div>
```

### Sidebar Navigation
```tsx
// Expanded sidebar
<div className="flex items-center gap-2">
  <Logo variant="full" size="sm" />
  <span className="text-gray-700 text-xs">V3</span>
</div>

// Collapsed sidebar
<LogoIcon size="sm" />
```

## 🌐 Web/App Icons

### Favicon Implementation
```html
<!-- Standard favicon -->
<link rel="icon" type="image/png" href="/favicon.png" />

<!-- Apple touch icons -->
<link rel="apple-touch-icon" href="/logos/logo-f.png" />

<!-- PWA manifest -->
<link rel="manifest" href="/manifest.json" />
```

### PWA Icons
- **192x192**: Home screen icon
- **512x512**: Splash screen icon  
- **Maskable**: Icon with safe area padding

### Social Media
- **Open Graph**: Use full "Formula" logo for sharing
- **Twitter Cards**: Use F icon for compact display
- **LinkedIn**: Full branding with tagline

## ✅ Do's and Don'ts

### ✅ Do
- Use the logo on clean, uncluttered backgrounds
- Maintain proper contrast ratios (minimum 4.5:1)
- Scale proportionally - never stretch or distort
- Use appropriate size for context (mobile vs desktop)
- Apply consistent spacing around logo
- Use semantic HTML for accessibility

### ❌ Don't
- Place logo on busy or low-contrast backgrounds  
- Add effects, shadows, or outlines to the logo
- Use outdated or unofficial logo versions
- Rotate or skew the logo elements
- Use logos smaller than minimum size requirements
- Mix different logo variants in same context

## 📝 Typography Integration

### Logo Pairing
```tsx
// With version number
<div className="flex items-center gap-2">
  <Logo variant="full" size="md" />
  <Badge variant="outline" className="text-xs">V3</Badge>
</div>

// With tagline
<div className="text-center">
  <LogoFull size="lg" />
  <p className="text-gray-700 mt-2 text-sm">
    Built for Construction Excellence
  </p>
</div>
```

### Text Hierarchy
When using logo with text:
1. **Primary**: Logo + company name
2. **Secondary**: Product version (V3)
3. **Tertiary**: Tagline or description

## 🎯 Construction Industry Context

### Professional Standards
- Logo reflects engineering precision with geometric design
- Color palette suits construction site visibility requirements
- Touch targets meet 44px minimum for work gloves
- High contrast ensures readability in outdoor conditions

### Mobile Optimization
- Icon-only variant for space-constrained mobile interfaces
- Responsive logo switching based on screen size
- PWA-ready for construction site app usage
- Offline-capable branding elements

## 📊 Implementation Examples

### Navigation Components
```tsx
// MainNav.tsx
<Logo variant="auto" size="md" />

// ProjectSidebar.tsx (expanded)
<Logo variant="full" size="sm" />

// ProjectSidebar.tsx (collapsed)
<LogoIcon size="sm" />

// UI Preview Sidebar
<Logo variant="full" size="sm" />
```

### Loading Components
```tsx
// App-wide loading
<FormulaLoading message="Initializing Formula PM..." />

// Feature loading
<ConstructionLoading icon={LogoIcon} message="Loading projects..." />

// Simple spinner with branding
<LoadingSpinner message="Loading..." />
```

### Error States
```tsx
// With logo context
<div className="text-center">
  <LogoIcon size="lg" className="opacity-50 mb-4" />
  <h3>Something went wrong</h3>
  <p>Please try refreshing Formula PM</p>
</div>
```

## 📁 File Organization

```
public/
├── logos/
│   ├── logo-f.png          # F icon (primary)
│   └── logo-formula.png    # Formula text
├── favicon.png             # Browser favicon
└── manifest.json           # PWA configuration

src/components/ui/
└── logo.tsx                # Logo component system
```

## 🔄 Version Control

- **Current Version**: V1.0 (August 2025)
- **Logo Assets**: Stored in `/public/logos/`
- **Component**: `/src/components/ui/logo.tsx`
- **Documentation**: This file + `UI-PATTERNS.md`

## 📞 Brand Contact

For questions about brand usage or requests for additional assets:
- **Reference**: `CLAUDE.md` for project context
- **Implementation**: `UI-PATTERNS.md` for technical usage
- **Components**: `/src/components/ui/logo.tsx`

---

**Last Updated**: August 2025  
**Version**: Brand Guidelines V1.0  
**Status**: Logo System Active & Implemented