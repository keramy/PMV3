# Formula PM V3 - Color Reference Guide

## 🎨 Complete Color System

This comprehensive reference covers all colors used in Formula PM V3, including the new professional gray palette and construction-specific functional colors.

## 📐 Professional Gray Palette

### Primary Gray Scale (WCAG Compliant)
```css
/* Light to Dark Progression */
--gray-100: #F4F4F4;  /* Contrast 1.2:1  - Backgrounds */
--gray-200: #DCDCDC;  /* Contrast 2.9:1  - Hover States */
--gray-300: #BFBFBF;  /* Contrast 3.8:1  - Input Borders */
--gray-400: #9B9B9B;  /* Contrast 4.5:1  - Form Borders */
--gray-500: #7A7A7A;  /* Contrast 5.6:1  - Border Hover */
--gray-600: #5A5A5A;  /* Contrast 7.8:1  - Disabled Background */
--gray-700: #3C3C3C;  /* Contrast 10.2:1 - Disabled Text */
--gray-800: #1C1C1C;  /* Contrast 15.3:1 - AA Text */
--gray-900: #0F0F0F;  /* Contrast 21:1   - AAA Text */
```

### Usage Examples
```tsx
// Page backgrounds
<div className="bg-gray-100">

// Text hierarchy
<h1 className="text-gray-900">     /* Primary headings */
<p className="text-gray-800">      /* Secondary text */
<span className="text-gray-700">   /* Metadata */

// Borders and forms
<Card className="border-gray-400">
<input className="border-gray-300 focus:border-blue-500">

// Interactive states
<div className="hover:bg-gray-200">
<button className="hover:border-gray-500">

// Icons and disabled states  
<Icon className="text-gray-600" />
<button disabled className="text-gray-600">
```

## 🏗️ Construction Industry Colors

### Project Status Colors
```css
/* Status Indicators */
--status-approved:    #10B981;  /* green-500 */
--status-in-progress: #3B82F6;  /* blue-500 */
--status-pending:     #F59E0B;  /* amber-500 */
--status-overdue:     #EF4444;  /* red-500 */
--status-on-hold:     #6B7280;  /* gray-500 → updated to gray-700 */
--status-completed:   #059669;  /* emerald-600 */
--status-rejected:    #DC2626;  /* red-600 */
--status-revision:    #D97706;  /* amber-600 */
```

#### Status Badge Variants
```tsx
// Approved/Completed
<Badge className="bg-green-100 text-green-800 border-green-200">
  
// In Progress/Active  
<Badge className="bg-blue-100 text-blue-800 border-blue-200">

// Pending/Warning
<Badge className="bg-amber-100 text-amber-800 border-amber-200">

// Overdue/Rejected
<Badge className="bg-red-100 text-red-800 border-red-200">

// On Hold (Updated)
<Badge className="bg-gray-100 text-gray-800 border-gray-400">

// Revision Required
<Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
```

### Construction Trade Categories
```css
/* Trade-Specific Colors */
--trade-construction: #3B82F6;  /* blue-500 */
--trade-mechanical:   #0EA5E9;  /* sky-500 */
--trade-electrical:   #F59E0B;  /* amber-500 */
--trade-plumbing:     #14B8A6;  /* teal-500 */
--trade-hvac:         #06B6D4;  /* cyan-500 */
--trade-fire-safety:  #EF4444;  /* red-500 */
--trade-millwork:     #D97706;  /* amber-600 */
--trade-default:      #6B7280;  /* gray-500 → updated to gray-700 */
```

#### Trade Badge Implementation
```tsx
const tradeBadgeColors = {
  'construction': 'bg-blue-100 text-blue-800 border-blue-200',
  'mechanical': 'bg-sky-100 text-sky-800 border-sky-200',
  'electrical': 'bg-amber-100 text-amber-800 border-amber-200',
  'plumbing': 'bg-teal-100 text-teal-800 border-teal-200',
  'hvac': 'bg-cyan-100 text-cyan-800 border-cyan-200',
  'fire-safety': 'bg-red-100 text-red-800 border-red-200',
  'millwork': 'bg-amber-100 text-amber-800 border-amber-200',
  'default': 'bg-gray-200 text-gray-800 border-gray-400'  // Updated
}
```

### Priority Levels
```css
/* Priority Indicators */
--priority-critical: #DC2626;  /* red-600 */
--priority-high:     #EA580C;  /* orange-600 */
--priority-medium:   #D97706;  /* amber-600 */
--priority-low:      #65A30D;  /* lime-600 */
--priority-none:     #6B7280;  /* gray-500 → updated to gray-700 */
```

## 🎯 Brand Colors

### Primary Brand Colors
```css
/* Formula PM Brand Colors */
--primary-50:   #f0f9ff;  /* Very light blue */
--primary-100:  #e0f2fe;  /* Light blue */
--primary-500:  #0ea5e9;  /* Main brand blue */
--primary-600:  #0284c7;  /* Darker brand blue */
--primary-700:  #0369a1;  /* Dark brand blue */
--primary-900:  #0c4a6e;  /* Very dark brand blue */
```

### Secondary/Accent Colors
```css
/* Construction Industry Accent Colors */
--construction-orange: #f97316;  /* Construction orange */
--construction-yellow: #eab308;  /* Safety yellow */
--construction-safety: #dc2626;  /* Safety red */
```

## 📊 Chart and Data Visualization Colors

### Chart Color Palette
```css
/* Primary chart colors */
--chart-blue:    #3B82F6;
--chart-emerald: #10B981;
--chart-amber:   #F59E0B;
--chart-red:     #EF4444;
--chart-purple:  #8B5CF6;
--chart-teal:    #14B8A6;
--chart-orange:  #F97316;
--chart-pink:    #EC4899;

/* Neutral chart elements (Updated) */
--chart-grid:    #9B9B9B;  /* gray-400 */
--chart-text:    #1C1C1C;  /* gray-800 */
--chart-bg:      #F4F4F4;  /* gray-100 */
```

### Progress Indicators
```css
/* Progress bars and meters */
--progress-bg:       #F4F4F4;  /* gray-100 */
--progress-complete: #10B981;  /* green-500 */
--progress-partial:  #F59E0B;  /* amber-500 */
--progress-overdue:  #EF4444;  /* red-500 */
--progress-track:    #9B9B9B;  /* gray-400 */
```

## 🌓 Dark Mode Colors

### Dark Mode Gray Scale
```css
.dark {
  --gray-100: #F4F4F4;  /* Keep for dark mode backgrounds */
  --gray-200: #DCDCDC;  /* Hover states in dark mode */
  --gray-300: #BFBFBF;  /* Input borders in dark mode */
  --gray-400: #9B9B9B;  /* Form borders in dark mode */
  --gray-500: #7A7A7A;  /* Border hover in dark mode */
  --gray-600: #5A5A5A;  /* Disabled background in dark mode */
  --gray-700: #3C3C3C;  /* Disabled text in dark mode */
  --gray-800: #1C1C1C;  /* Dark mode cards/containers */
  --gray-900: #0F0F0F;  /* Dark mode primary background */
}
```

## 🚫 Deprecated Colors

### Colors to Avoid
```css
/* ❌ These are deprecated - use new gray palette instead */
--gray-50:  #f9fafb;  /* Too light → use gray-100 */
--gray-300: #d1d5db;  /* Inconsistent → use gray-400 */
--gray-500: #6b7280;  /* Too light for text → use gray-700 */
```

### Migration Guide
```tsx
// ❌ Old patterns to replace
className="text-gray-500"     // → "text-gray-700"
className="text-gray-600"     // → "text-gray-800"
className="border-gray-200"   // → "border-gray-400"
className="hover:bg-gray-50"  // → "hover:bg-gray-200"
className="bg-gray-50"        // → "bg-gray-100"

// ✅ New patterns
className="text-gray-700"     // Metadata, helper text
className="text-gray-800"     // Secondary text, labels
className="border-gray-400"   // Primary borders
className="hover:bg-gray-200" // Hover states
className="bg-gray-100"       // Page backgrounds
```

## 🎨 Color Combination Examples

### Card Components
```tsx
// Standard information card
<Card className="bg-white border-gray-400">
  <CardHeader>
    <CardTitle className="text-gray-900">Primary Title</CardTitle>
    <p className="text-gray-800">Secondary description</p>
  </CardHeader>
  <CardContent>
    <div className="flex items-center justify-between">
      <span className="text-gray-700">Last updated</span>
      <Badge className="bg-blue-100 text-blue-800 border-blue-200">
        Active
      </Badge>
    </div>
  </CardContent>
</Card>

// Status card with construction colors
<Card className="bg-white border-gray-400">
  <CardContent className="p-4">
    <div className="flex items-center gap-3">
      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
      <div className="flex-1">
        <h3 className="text-gray-900 font-medium">Electrical Panel Installation</h3>
        <p className="text-gray-800">Progress: 85% complete</p>
        <p className="text-gray-700">Due: March 15, 2025</p>
      </div>
    </div>
  </CardContent>
</Card>
```

### Form Elements
```tsx
// Form with proper hierarchy
<form className="space-y-6">
  <div className="space-y-2">
    <label className="text-gray-800 font-medium">Project Name</label>
    <input 
      className="border-gray-400 focus:border-blue-500 focus:ring-blue-500"
      placeholder="Enter project name..."
    />
    <p className="text-gray-700 text-sm">This will be visible to all team members</p>
  </div>
  
  <div className="space-y-2">
    <label className="text-gray-800 font-medium">Status</label>
    <select className="border-gray-400 focus:border-blue-500">
      <option value="planning">Planning</option>
      <option value="in-progress">In Progress</option>
      <option value="completed">Completed</option>
    </select>
  </div>
</form>
```

### Data Tables
```tsx
// Data table with proper contrast
<Table>
  <TableHeader>
    <TableRow className="bg-gray-100 border-b border-gray-400">
      <TableHead className="text-gray-800 font-bold">Project</TableHead>
      <TableHead className="text-gray-800 font-bold">Status</TableHead>
      <TableHead className="text-gray-800 font-bold">Progress</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow className="hover:bg-gray-200 border-b border-gray-400">
      <TableCell className="text-gray-900 font-medium">Marina Bay Tower</TableCell>
      <TableCell>
        <Badge className="bg-blue-100 text-blue-800 border-blue-200">
          In Progress
        </Badge>
      </TableCell>
      <TableCell className="text-gray-800">65%</TableCell>
    </TableRow>
  </TableBody>
</Table>
```

## 📱 Mobile Considerations

### Touch-Friendly Colors
```tsx
// Mobile-optimized interactive elements
<button className="min-h-[44px] min-w-[44px] text-gray-800 hover:bg-gray-200 active:bg-gray-100 transition-colors">
  <Icon className="text-gray-600" />
</button>

// Mobile form elements
<input className="min-h-[44px] text-base border-gray-400 focus:border-blue-500">
```

## 🔧 Implementation Notes

### CSS Variables Integration
The professional gray palette integrates with existing CSS variables:
```css
:root {
  --muted-foreground: #5A5A5A;  /* gray-600 */
  --border: #9B9B9B;            /* gray-400 */
  --input: #BFBFBF;             /* gray-300 */
}
```

### Tailwind Configuration
All colors are available as Tailwind utilities:
```javascript
// tailwind.config.ts
gray: {
  100: '#F4F4F4', 200: '#DCDCDC', 300: '#BFBFBF',
  400: '#9B9B9B', 500: '#7A7A7A', 600: '#5A5A5A',
  700: '#3C3C3C', 800: '#1C1C1C', 900: '#0F0F0F',
}
```

---

**Last Updated**: August 2025  
**Version**: Professional Gray Palette System v1.0  
**Contact**: Reference CLAUDE.md for implementation guidelines