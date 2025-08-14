# Formula PM V3 - Component Development Guidelines

## 🎨 Professional Gray Palette Integration

This document provides specific guidance for implementing the professional gray palette system in Formula PM V3 components.

## 📋 Quick Reference

### Color Mapping Table
| Old Gray | New Gray | Usage | Contrast | Example |
|----------|----------|-------|----------|---------|
| `gray-50` | `gray-100` | Backgrounds, subtle areas | 1.2:1 | Page backgrounds |
| `gray-100` | `gray-200` | Hover states, cards | 2.9:1 | Card hover effects |
| `gray-200` | `gray-400` | Primary borders | 4.5:1 | Form borders, card borders |
| `gray-300` | `gray-400` | Input borders | 4.5:1 | Text input borders |
| `gray-400` | `gray-600` | Icons, disabled states | 7.8:1 | Search icons, disabled text |
| `gray-500` | `gray-700` | Metadata, helper text | 10.2:1 | Dates, timestamps |
| `gray-600` | `gray-800` | Secondary text | 15.3:1 | Descriptions, labels |
| `gray-700` | `gray-800` | Headers, labels | 15.3:1 | Table headers, form labels |
| `gray-800` | `gray-900` | Primary text | 21:1 | Headings, important text |
| `gray-900` | `gray-900` | Keep unchanged | 21:1 | Critical text |

## 🏗️ Component-Specific Guidelines

### Cards and Containers
```tsx
// ✅ Correct Implementation
<Card className="bg-white border-gray-400 hover:shadow-lg transition-shadow">
  <CardHeader>
    <CardTitle className="text-gray-900">Primary Title</CardTitle>
    <p className="text-gray-800">Secondary description</p>
  </CardHeader>
  <CardContent>
    <p className="text-gray-700">Supporting metadata</p>
  </CardContent>
</Card>

// ❌ Avoid
<Card className="bg-white border-gray-200"> // Border too light
  <CardTitle className="text-gray-600">Title</CardTitle> // Text too light
</Card>
```

### Tables
```tsx
// ✅ Correct Implementation
<Table>
  <TableHeader>
    <TableRow className="bg-gray-100 border-b border-gray-400">
      <TableHead className="font-bold text-gray-800 py-4">Header</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow className="hover:bg-gray-200 transition-colors">
      <TableCell className="text-gray-900">Primary Data</TableCell>
      <TableCell className="text-gray-800">Secondary Data</TableCell>
      <TableCell className="text-gray-700">Metadata</TableCell>
    </TableRow>
  </TableBody>
</Table>

// ❌ Avoid
<TableRow className="hover:bg-gray-50"> // Hover too subtle
  <TableCell className="text-gray-600">Data</TableCell> // Text too light
</TableRow>
```

### Forms
```tsx
// ✅ Correct Implementation
<div className="space-y-4">
  <div className="space-y-2">
    <label className="text-gray-800 font-medium">Field Label</label>
    <input 
      className="border-gray-400 focus:border-blue-500 focus:ring-blue-500"
      placeholder="Enter value..."
    />
    <p className="text-gray-700 text-sm">Helper text or instructions</p>
  </div>
</div>

// ❌ Avoid
<label className="text-gray-600">Label</label> // Too light
<input className="border-gray-200" /> // Border too light
<p className="text-gray-500">Helper</p> // Helper text too light
```

### Navigation
```tsx
// ✅ Correct Implementation
<nav className="space-y-1">
  <a className="text-gray-800 hover:bg-gray-200 hover:text-gray-900 px-3 py-2 rounded-md block">
    Navigation Item
  </a>
  <a className="bg-gray-100 text-gray-900 px-3 py-2 rounded-md block">
    Active Item
  </a>
</nav>

// ❌ Avoid
<nav>
  <a className="text-gray-600 hover:bg-gray-50">Nav Item</a> // Too light
</nav>
```

### Buttons
```tsx
// ✅ Correct Implementation
<Button variant="outline" className="border-gray-400 text-gray-800 hover:bg-gray-200">
  Secondary Button
</Button>

<Button variant="ghost" className="text-gray-800 hover:bg-gray-200">
  Ghost Button
</Button>

// ❌ Avoid
<Button className="border-gray-200 text-gray-600"> // Too light
```

### Search and Filters
```tsx
// ✅ Correct Implementation
<div className="relative">
  <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-600" />
  <input 
    className="pl-12 h-12 border-gray-400 focus:border-blue-500 rounded-lg"
    placeholder="Search projects..."
  />
</div>

// Filter dropdowns
<div className="p-3 hover:bg-gray-200 transition-colors cursor-pointer">
  <label className="text-gray-800 font-medium">Filter Option</label>
  <p className="text-gray-700 text-sm">Description</p>
</div>

// ❌ Avoid
<Search className="text-gray-400" /> // Icon too light
<input className="border-gray-200" /> // Border too light
```

### Status and Badges
```tsx
// ✅ Correct Implementation - Preserve functional colors
<Badge className="bg-green-100 text-green-800 border-green-200">
  Approved
</Badge>
<Badge className="bg-orange-100 text-orange-800 border-orange-200">
  Pending
</Badge>

// Default/neutral badges
<Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-400">
  Default Status
</Badge>

// ❌ Avoid changing functional colors
<Badge className="bg-gray-100 text-gray-800">Approved</Badge> // Loses meaning
```

## 🎯 Construction Industry Patterns

### Project Status Cards
```tsx
// ✅ Construction-focused implementation
<Card className="bg-white border-gray-400">
  <CardHeader className="pb-3">
    <div className="flex items-center justify-between">
      <CardTitle className="text-gray-900">Project Progress</CardTitle>
      <Badge className="bg-blue-100 text-blue-800">In Progress</Badge>
    </div>
  </CardHeader>
  <CardContent>
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-gray-800">Completion</span>
        <span className="text-gray-900 font-medium">65%</span>
      </div>
      <Progress value={65} className="h-2" />
      <p className="text-gray-700 text-sm">Last updated 2 hours ago</p>
    </div>
  </CardContent>
</Card>
```

### Trade Category Filters
```tsx
// ✅ Preserve construction category colors
const categoryColors = {
  'construction': 'bg-blue-100 text-blue-800 border-blue-200',
  'mechanical': 'bg-blue-100 text-blue-800 border-blue-200', 
  'electrical': 'bg-yellow-100 text-yellow-800 border-yellow-200',
  'plumbing': 'bg-teal-100 text-teal-800 border-teal-200',
  'hvac': 'bg-blue-100 text-blue-800 border-blue-200',
  'fire-safety': 'bg-red-100 text-red-800 border-red-200',
  'millwork': 'bg-amber-100 text-amber-800 border-amber-200',
  // Fallback for uncategorized
  'default': 'bg-gray-200 text-gray-800 border-gray-400'
}

// In filter components
<div className="space-y-2">
  <label className="text-gray-800 font-medium">Trade Category</label>
  {categories.map(category => (
    <div key={category} className="flex items-center space-x-3 p-2 hover:bg-gray-200 rounded">
      <Checkbox />
      <Badge className={categoryColors[category] || categoryColors.default}>
        {category}
      </Badge>
      <span className="text-gray-700">{count}</span>
    </div>
  ))}
</div>
```

### Timeline and Progress Indicators
```tsx
// ✅ Timeline with proper text hierarchy
<div className="space-y-4">
  {timeline.map(item => (
    <div key={item.id} className="flex items-start gap-3 p-3 border-l-2 border-gray-400">
      <div className="flex-shrink-0">
        <div className="w-2 h-2 bg-blue-500 rounded-full -ml-1"></div>
      </div>
      <div className="flex-1 space-y-1">
        <h4 className="text-gray-900 font-medium">{item.title}</h4>
        <p className="text-gray-800">{item.description}</p>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-gray-700">{item.assignee}</span>
          <span className="text-gray-700">•</span>
          <span className="text-gray-700">{item.date}</span>
        </div>
      </div>
    </div>
  ))}
</div>
```

## 🔧 Migration Checklist

When updating existing components:

### Text Elements
- [ ] Replace `text-gray-500` with `text-gray-700` (metadata)
- [ ] Replace `text-gray-600` with `text-gray-800` (secondary text)
- [ ] Replace `text-gray-700` with `text-gray-800` (headers/labels)
- [ ] Keep `text-gray-900` for primary text
- [ ] Verify all text meets contrast requirements

### Backgrounds and Borders
- [ ] Replace `bg-gray-50` with `bg-gray-100` (page backgrounds)
- [ ] Replace `hover:bg-gray-50` with `hover:bg-gray-200` (hover states)
- [ ] Replace `border-gray-200` with `border-gray-400` (primary borders)
- [ ] Replace `border-gray-300` with `border-gray-400` (form borders)

### Icons and Interactive Elements
- [ ] Replace `text-gray-400` with `text-gray-600` (icons)
- [ ] Update disabled states to use `text-gray-600`
- [ ] Ensure button hover states use `hover:bg-gray-200`
- [ ] Check focus states use appropriate contrast

### Preserve Functional Colors
- [ ] Keep all status colors (green, blue, orange, red, yellow)
- [ ] Keep all construction category colors
- [ ] Keep all priority indicators
- [ ] Keep all progress indicators and charts

## 🚀 Testing Guidelines

### Visual Testing
1. **Contrast Check**: Verify text meets WCAG AA/AAA standards
2. **Hover States**: Test all interactive elements have visible hover effects
3. **Mobile Testing**: Ensure 44px minimum touch targets
4. **Dark Mode**: Check dark mode compatibility if implemented

### Functional Testing
1. **Status Recognition**: Verify status colors remain distinguishable
2. **Category Filtering**: Test construction category filters work correctly
3. **Form Validation**: Ensure form errors are clearly visible
4. **Loading States**: Check loading indicators have appropriate contrast

## 📚 Examples and References

### Live Examples
- UI Preview Dashboard: `http://localhost:3002/ui-preview`
- Project Workspace: `http://localhost:3002/ui-preview/projects/proj-001`
- Scope Management: Expandable table with filters
- Shop Drawings: "Whose Turn" system
- Material Specs: PM approval workflow

### Code References
- Base patterns: `UI-PATTERNS.md`
- Implementation examples: `src/app/ui-preview/components/`
- Component library: `src/components/`

---

**Last Updated**: August 2025
**Status**: Professional Gray Palette System Active
**Next Review**: Before Phase 3 - API & Feature Development