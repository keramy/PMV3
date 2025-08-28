# TypeScript Compliance Guide
## For AI Assistants Working on Formula PM V3

### 🎯 **Current Status**
- **TypeScript Compliance**: ✅ **100% COMPLETE**
- **Total Errors**: **0** (down from 204)
- **Last Updated**: August 2025
- **Compliance Date**: August 26, 2025

---

## 🔧 **Critical Commands**

### **Verification Command**
```bash
npm run type-check
# Should output: ✅ No TypeScript errors found
```

### **Error Detection Command**
```bash
npx tsc --noEmit 2>&1 | grep -E "error TS[0-9]+" | wc -l
# Should output: 0
```

---

## 📋 **Mandatory Rules for AI Assistants**

### **Rule 1: NEVER Break TypeScript Compliance**
- **Before ANY code changes**: Run `npx tsc --noEmit` 
- **After ANY code changes**: Run `npx tsc --noEmit` to verify 0 errors
- **If errors introduced**: MUST fix immediately using documented patterns

### **Rule 2: Use Established Patterns**
Reference: [`/docs/typescript-patterns.md`](./typescript-patterns.md)

**For Database Fields:**
```typescript
// ✅ ALWAYS use null coalescing for nullable database fields
formatCurrency(item.total_cost || 0)           // number | null
getCategoryColor(item.category || '')          // string | null  
new Date(item.created_at || new Date())        // string | null (dates)
```

**For Exception Handling:**
```typescript
// ✅ ALWAYS use type guards for error handling
} catch (error) {
  console.log(error instanceof Error ? error.message : 'Unknown error')
}
```

**For Array Filtering:**
```typescript
// ✅ ALWAYS filter nulls and type assert
const categories = Array.from(new Set(items.map(item => item.category).filter(Boolean))) as string[]
```

### **Rule 3: Form/Database Type Conversion**
```typescript
// ✅ Database to Form (null → empty string)
<Input defaultValue={dbItem.description || ''} />

// ✅ Form to Database (empty string → null)
const apiData = { description: formData.description || null }
```

### **Rule 4: Component Props Safety**
```typescript
// ✅ ALWAYS provide non-null defaults for UI components
<UserCard 
  name={user.name || 'Anonymous'}
  email={user.email || ''}
  avatar={user.avatar_url || undefined}
/>
```

---

## 🚨 **Common Error Prevention**

### **Database Integration**
```typescript
// ❌ NEVER do this
const total = items.reduce((sum, item) => sum + item.cost, 0)  // item.cost might be null

// ✅ ALWAYS do this
const total = items.reduce((sum, item) => sum + (item.cost || 0), 0)
```

### **String Operations**
```typescript
// ❌ NEVER do this
const preview = item.description.substring(0, 50)  // description might be null

// ✅ ALWAYS do this  
const preview = (item.description || '').substring(0, 50)
```

### **Date Operations**
```typescript
// ❌ NEVER do this
const formatted = new Date(item.created_at).toLocaleDateString()  // created_at might be null

// ✅ ALWAYS do this
const formatted = new Date(item.created_at || new Date()).toLocaleDateString()
```

---

## 🛠️ **Development Workflow**

### **For New Features**
1. **Design with types first**: Define interfaces with correct null/undefined
2. **Code with patterns**: Use established null safety patterns
3. **Verify immediately**: Run `npx tsc --noEmit` after implementation
4. **Fix any errors**: Apply documented patterns to resolve

### **For Bug Fixes**
1. **Check before changes**: Ensure starting from 0 errors
2. **Apply fix with type safety**: Use null coalescing where needed
3. **Verify after changes**: Confirm still 0 errors
4. **Document new patterns**: If new pattern needed, update docs

### **For Refactoring**
1. **Maintain type safety**: Never remove null checks or type guards
2. **Improve patterns**: Can enhance existing patterns but not break them
3. **Test thoroughly**: Run full type check after major changes
4. **Update docs**: Document any pattern improvements

---

## 📊 **Quality Gates**

### **Commit Requirements**
- [ ] `npx tsc --noEmit` returns 0 errors
- [ ] All database fields properly null-safe
- [ ] All form inputs properly typed
- [ ] All error handling uses type guards
- [ ] All array operations filter nulls

### **Pull Request Requirements**
- [ ] TypeScript compliance maintained
- [ ] No new type safety issues introduced
- [ ] Follows established patterns
- [ ] Updates documentation if new patterns added

---

## 🎯 **Success Metrics to Maintain**

### **Zero Tolerance Policy**
- **Production Code Errors**: 0 (must remain 0)
- **Test Code Errors**: 0 (must remain 0) 
- **Build Success Rate**: 100%
- **Type Safety Coverage**: 100%

### **Performance Indicators**
- `npm run type-check` completes in < 10 seconds
- No TypeScript compilation warnings
- Perfect IDE IntelliSense accuracy
- Zero runtime null/undefined errors

---

## 🔄 **Pattern Evolution**

### **When to Update Patterns**
- **New TypeScript version**: Review and update patterns
- **New dependencies**: Ensure type compatibility
- **New features**: Extend patterns to cover new use cases
- **Performance improvements**: Optimize while maintaining safety

### **How to Update This Guide**
1. **Test new patterns**: Verify they maintain 0 error state
2. **Document thoroughly**: Update both pattern docs and this guide
3. **Review with team**: Ensure consistency with project goals
4. **Update examples**: Keep examples current with actual codebase

---

## ✅ **Quick Reference Checklist**

### **Before Writing Any Code**
- [ ] Review relevant patterns in `typescript-patterns.md`
- [ ] Understand nullable fields in the data model
- [ ] Plan null safety strategy for the component/function

### **While Writing Code**
- [ ] Apply null coalescing to all nullable database fields
- [ ] Use type guards for all error handling
- [ ] Convert between null/undefined based on context
- [ ] Test type safety as you code

### **After Writing Code**
- [ ] Run `npx tsc --noEmit` to verify 0 errors
- [ ] Test the functionality to ensure defaults work correctly
- [ ] Review code for any missed null safety opportunities
- [ ] Update patterns documentation if new patterns were needed

---

**Remember: TypeScript compliance is not optional - it's a fundamental requirement for maintaining the professional quality and reliability of Formula PM V3.**