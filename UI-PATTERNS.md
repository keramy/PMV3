# Formula PM V3 - UI Pattern Guidelines

## 🎨 Professional Gray Palette System

### Color Palette Definition
```css
/* Professional Gray Palette - WCAG Compliant */
gray-100: #F4F4F4  /* Background - Contrast 1.2:1 */
gray-200: #DCDCDC  /* Hover State - Contrast 2.9:1 */
gray-300: #BFBFBF  /* Input Border - Contrast 3.8:1 */
gray-400: #9B9B9B  /* Form Border - Contrast 4.5:1 */
gray-500: #7A7A7A  /* Border Hover - Contrast 5.6:1 */
gray-600: #5A5A5A  /* Disabled Background - Contrast 7.8:1 */
gray-700: #3C3C3C  /* Disabled Text - Contrast 10.2:1 */
gray-800: #1C1C1C  /* AA Text - Contrast 15.3:1 */
gray-900: #0F0F0F  /* AAA Text - Contrast 21:1 */
```

## 📐 Usage Guidelines

### Text Hierarchy
```tsx
// Primary Text (Headings, Critical Information)
<h1 className="text-gray-900">Project Title</h1>
<h2 className="text-gray-900">Section Heading</h2>

// Secondary Text (Content, Labels)
<p className="text-gray-800">Project description</p>
<label className="text-gray-800">Form Label</label>
<th className="text-gray-800">Table Header</th>

// Metadata Text (Dates, Supporting Info)
<span className="text-gray-700">Last updated 2 hours ago</span>
<div className="text-gray-700">Project details</div>

// Icons and Disabled States
<Icon className="text-gray-600" />
<button disabled className="text-gray-600">Disabled Button</button>
```

### Backgrounds and Containers
```tsx
// Page Backgrounds
<div className="bg-gray-100 min-h-full">

// Card Backgrounds (always white)
<Card className="bg-white border-gray-400">

// Hover States
<div className="hover:bg-gray-200 transition-colors">

// Column Headers in Tables
<div className="bg-gray-100 border-gray-400">
```

### Borders and Form Elements
```tsx
// Form Borders (primary border color)
<input className="border-gray-400 focus:border-blue-500" />

// Input Borders (lighter for inputs)
<input className="border-gray-300 focus:border-blue-500" />

// Card and Container Borders
<Card className="border-gray-400">

// Table Borders
<Table className="border-gray-400">
  <TableRow className="border-b border-gray-400">
```

### Interactive States
```tsx
// Button Hover States
<Button className="hover:bg-gray-200 hover:border-gray-500">

// Row Hover States  
<TableRow className="hover:bg-gray-200 transition-colors">

// Border Hover States
<div className="border-gray-400 hover:border-gray-500">
```

## 🔧 Component Patterns

### Cards
```tsx
// Standard card pattern
<Card className="bg-white border-gray-400 shadow-md hover:shadow-lg transition-shadow">
  <CardHeader>
    <CardTitle className="text-gray-900">Card Title</CardTitle>
    <p className="text-gray-800">Card description</p>
  </CardHeader>
  <CardContent>
    <p className="text-gray-700">Supporting information</p>
  </CardContent>
</Card>
```

### Tables
```tsx
// Table header pattern
<TableHeader>
  <TableRow className="bg-gray-100 border-b border-gray-400">
    <TableHead className="font-bold text-gray-800 py-4">Column Header</TableHead>
  </TableRow>
</TableHeader>

// Table row pattern
<TableRow className="hover:bg-gray-200 transition-colors">
  <TableCell className="text-gray-900">Primary Data</TableCell>
  <TableCell className="text-gray-800">Secondary Data</TableCell>
  <TableCell className="text-gray-700">Metadata</TableCell>
</TableRow>
```

### Forms
```tsx
// Form input pattern
<div className="space-y-2">
  <label className="text-gray-800 font-medium">Field Label</label>
  <input 
    className="border-gray-400 focus:border-blue-500 focus:ring-blue-500"
    placeholder="Enter value..."
  />
  <p className="text-gray-700 text-sm">Helper text</p>
</div>

// Search input pattern
<div className="relative">
  <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-600" />
  <input 
    className="pl-12 h-12 border-gray-400 focus:border-blue-500 rounded-lg"
    placeholder="Search..."
  />
</div>
```

### Buttons
```tsx
// Primary button (preserve existing colors)
<Button className="bg-blue-600 hover:bg-blue-700 text-white">

// Secondary button
<Button variant="outline" className="border-gray-400 text-gray-800 hover:bg-gray-200">

// Ghost button
<Button variant="ghost" className="text-gray-800 hover:bg-gray-200">
```

### Navigation
```tsx
// Navigation items
<nav className="space-y-1">
  <a className="text-gray-800 hover:bg-gray-200 hover:text-gray-900">
    Navigation Item
  </a>
  <a className="text-gray-700" aria-current="page">
    Active Item
  </a>
</nav>

// Breadcrumbs
<div className="flex items-center gap-2 text-sm text-gray-700">
  <span>Formula PM</span>
  <ChevronRight className="h-4 w-4" />
  <span>Projects</span>
  <ChevronRight className="h-4 w-4" />
  <span className="font-medium text-gray-900">Current Page</span>
</div>
```

### Badges and Status
```tsx
// Status badges (preserve existing colors for statuses)
<Badge className="bg-green-100 text-green-800 border-green-200">Approved</Badge>
<Badge className="bg-orange-100 text-orange-800 border-orange-200">Pending</Badge>

// Default badge
<Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-400">
  Default
</Badge>
```

## 🚫 What NOT to Use

### Avoid These Patterns
```tsx
// ❌ Don't use old light grays for text
<span className="text-gray-500">Hard to read</span>
<span className="text-gray-600">Still too light</span>

// ❌ Don't use light borders for cards
<Card className="border-gray-200">  // Too light

// ❌ Don't use light gray backgrounds for hover
<div className="hover:bg-gray-50">  // Too subtle

// ❌ Don't use inconsistent gray shades
<div className="border-gray-300 text-gray-600">  // Mismatched hierarchy
```

## 🏗️ Construction Industry Colors

### Preserve These Functional Colors
```tsx
// Status Colors (keep existing)
- Green: Completed/Approved states
- Blue: In Progress/Active states  
- Orange: Pending/Warning states
- Red: Overdue/Rejected states
- Yellow: Revision Required states

// Construction Categories (keep existing)
- Construction: Blue variants
- Mechanical: Blue shades
- Electrical: Yellow/amber shades
- Plumbing: Teal shades
- HVAC: Blue variants
- Fire & Safety: Red shades
- Millwork: Amber shades
```

## 📱 Mobile Considerations

### Touch Targets
```tsx
// Minimum 44px touch targets
<Button className="min-h-[44px] min-w-[44px]">

// Mobile-optimized input
<input className="mobile-input min-h-[44px] text-base">
```

### Responsive Text
```tsx
// Use appropriate text sizes for mobile
<h1 className="text-xl sm:text-2xl lg:text-3xl text-gray-900">
<p className="text-sm sm:text-base text-gray-800">
```

## 🎯 Implementation Checklist

When creating new components:

- [ ] Use `text-gray-900` for primary headings
- [ ] Use `text-gray-800` for secondary text and labels
- [ ] Use `text-gray-700` for metadata and supporting information
- [ ] Use `border-gray-400` for card and form borders
- [ ] Use `hover:bg-gray-200` for hover states
- [ ] Use `bg-gray-100` for page backgrounds
- [ ] Preserve all functional status colors
- [ ] Test contrast ratios meet WCAG guidelines
- [ ] Ensure 44px minimum touch targets on mobile
- [ ] Use semantic HTML elements

## 📚 Examples Reference

See implemented patterns in:
- `src/app/ui-preview/components/` - All UI preview components
- `src/app/ui-preview/projects/[id]/components/` - Project workspace components
- `src/components/application/` - Base component library

---

**Last Updated**: August 2025
**Status**: Professional Gray Palette System Active
**Contact**: Reference this document for all new component development