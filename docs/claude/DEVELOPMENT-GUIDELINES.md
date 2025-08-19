# Development Guidelines - Formula PM V3

## 🎯 Core Development Principles

### Code Quality Standards
- **Function Length**: Max 50 lines per function
- **File Length**: Prefer multiple small files over large ones
- **Type Safety**: Full TypeScript coverage, no `any` types
- **No Comments**: Code should be self-documenting
- **Performance**: Sub-500ms page navigation target

## 📁 Project Structure

```
/src/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   ├── projects/          # Project pages
│   └── (auth)/            # Auth group routes
├── components/            # React components
│   ├── ui/               # Base UI components (Shadcn)
│   └── [feature]/        # Feature-specific components
├── hooks/                 # Custom React hooks
├── lib/                   # Utilities and helpers
│   ├── api/              # API utilities
│   ├── supabase/         # Database clients
│   └── validation/       # Zod schemas
├── types/                 # TypeScript definitions
└── providers/            # React context providers
```

## 🔧 Development Workflow

### Starting Development
```bash
# Install dependencies
npm install

# Set up environment
cp .env.local.template .env.local
# Fill in Supabase credentials

# Start dev server
npm run dev  # Runs on http://localhost:3002
```

### Before Committing
```bash
# Type check
npm run type-check

# Build check
npm run build

# Run any lint/format commands if configured
```

## 💻 Coding Patterns

### Component Pattern
```typescript
// ✅ GOOD - Clear, typed, single responsibility
interface ProjectCardProps {
  project: Project
  onSelect?: (id: string) => void
}

export function ProjectCard({ project, onSelect }: ProjectCardProps) {
  return (
    <Card onClick={() => onSelect?.(project.id)}>
      <CardHeader>
        <CardTitle>{project.name}</CardTitle>
      </CardHeader>
    </Card>
  )
}

// ❌ BAD - Too many responsibilities, unclear props
export function ProjectComponent(props: any) {
  // 200+ lines of mixed logic
}
```

### Hook Pattern
```typescript
// ✅ GOOD - Focused, reusable, typed
export function useProjectData(projectId: string) {
  const { profile } = useAuth()
  
  return useQuery({
    queryKey: ['project', projectId],
    queryFn: () => fetchProject(projectId, profile?.id),
    enabled: !!profile?.id && !!projectId,
  })
}
```

### API Route Pattern
```typescript
// ✅ GOOD - Using centralized middleware
export const GET = apiMiddleware.permissions(
  ['view_projects'],
  async (user, request) => {
    const data = await getProjects(user.id)
    return NextResponse.json({ data })
  }
)
```

## 🎨 UI/UX Guidelines

### Mobile-First Design
- Touch targets: Min 44px for construction site use
- Responsive breakpoints: Mobile → Tablet → Desktop
- Offline-first: Handle network failures gracefully
- Loading states: Always show loading indicators

### Component Library
Using Shadcn/ui components - don't reinvent:
- `Button`, `Card`, `Dialog`, `Input`, etc.
- Customize via Tailwind classes
- Keep consistent with design system

### Color System
Professional gray palette defined in Tailwind config:
```typescript
gray: {
  100: '#F4F4F4', // Backgrounds
  200: '#DCDCDC', // Hover states  
  400: '#9B9B9B', // Borders
  700: '#3C3C3C', // Secondary text
  900: '#0F0F0F', // Primary text
}
```

## 🧪 Testing Approach

### What to Test
- Critical user flows (login, project creation)
- API route handlers
- Complex business logic
- Permission checking
- Data transformations

### Test File Location
```
/src/
├── hooks/
│   ├── useAuth.ts
│   └── __tests__/
│       └── useAuth.test.ts
```

## 🚀 Performance Guidelines

### Data Fetching
- Use React Query for caching
- Implement pagination for lists
- Prefetch on hover when possible
- Use optimistic updates for better UX

### Code Splitting
- Lazy load heavy components
- Use dynamic imports for large libraries
- Split by route automatically (Next.js)

### Database Queries
- Always limit query results
- Use proper indexes
- Avoid N+1 queries
- Cache expensive operations

## 🔒 Security Best Practices

### API Security
- Always authenticate requests
- Check permissions at route level
- Validate all inputs with Zod
- Never expose sensitive data
- Use RLS as defense in depth

### Client Security
- Never store sensitive data in localStorage
- Clear data on logout
- Validate permissions before showing UI
- Handle auth errors gracefully

## 📝 Git Workflow

### Branch Naming
```
feature/add-task-comments
fix/auth-redirect-loop
chore/update-dependencies
```

### Commit Messages
```
feat: Add task comment functionality
fix: Resolve auth redirect loop
chore: Update React Query to v5
```

## 🐛 Debugging Tips

### Common Issues
1. **Auth loops**: Check middleware and RLS policies
2. **Type errors**: Regenerate database types
3. **API 403**: Verify user permissions
4. **Slow queries**: Check database indexes

### Debug Tools
- `/auth-debug` - Auth testing page
- Browser DevTools Network tab
- Supabase dashboard logs
- `console.log` with descriptive prefixes

## 📚 Key Dependencies

```json
{
  "next": "15.x",           // Framework
  "react": "18.x",          // UI library
  "@supabase/supabase-js": "2.x", // Database
  "@tanstack/react-query": "5.x", // Data fetching
  "zod": "3.x",            // Validation
  "tailwindcss": "3.x",    // Styling
  "@radix-ui/*": "*"       // Shadcn components
}
```

---
*Last Updated: December 2024*