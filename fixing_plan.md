### **TypeScript Error Resolution Plan for Formula PM v3**

#### **1. Overview**

A type-check (`tsc --noEmit`) of the codebase has revealed numerous TypeScript errors. These errors span from critical, application-breaking logic flaws to code quality issues. This document provides a prioritized plan to resolve these errors systematically. The agent should address the priorities in order. After completing each major step, run `npm run type-check` to validate the fixes.

---

#### **2. Priority 1: Critical - Broken Database Logic**

*   **File:** `src/lib/api/database.ts`
*   **Problem:** The code is attempting to call Supabase client methods (e.g., `.from()`, `.rpc()`) on a `Promise` that resolves to the client, rather than on the client instance itself. This is because of a missing `await`.
*   **Example Error:** `error TS2339: Property 'from' does not exist on type 'Promise<SupabaseClient<...>>'`
*   **Action:** In all functions within this file, locate where the Supabase client is initialized. Ensure that you `await` the client creation before using it.
*   **Example Fix:**
    *   **Change this:** `const supabase = createSupabaseClient();`
    *   **To this:** `const supabase = await createSupabaseClient();`

---

#### **3. Priority 2: System-Wide - Permission Type Mismatches**

*   **Files:** `src/lib/dev/mock-user.ts`, `src/lib/api/middleware.ts`, `src/lib/database/queries.ts`
*   **Problem:** Plain strings (e.g., `"view_projects"`) and `string[]` are being assigned to the `Permission` and `Permission[]` types, which are more specific. This indicates the strings do not match the allowed values defined in the `Permission` type union.
*   **Example Errors:**
    *   `error TS2322: Type '"view_projects"' is not assignable to type 'Permission'.`
    *   `error TS2820: Type '"approve_shop_drawings"' is not assignable to type 'Permission'. Did you mean '"approve_drawings"'?`
*   **Action:**
    1.  First, inspect the `Permission` type definition, likely located in `src/types/auth.ts` or a similar file, to understand the exact string literals that are permitted.
    2.  In `src/lib/dev/mock-user.ts`, correct all the string literals in the mock permissions to match the valid `Permission` types. Pay attention to compiler suggestions for typos.
    3.  In `src/lib/api/middleware.ts` and `src/lib/database/queries.ts`, ensure that any arrays being cast or assigned to `Permission[]` are correctly typed and validated against the `Permission` type union.

---

#### **4. Priority 3: Data Integrity - Component & Data Model Drift**

*   **Files:** `src/components/tables/scope-table.tsx`, `src/hooks/useScopeItems.ts`
*   **Problem:** Components are attempting to access properties that do not exist on their corresponding data types (e.g., `ScopeItem`, `ScopeListResponse`). This points to a desynchronization between the frontend components and the backend API/database schema.
*   **Example Errors:**
    *   `error TS2339: Property 'actual_cost' does not exist on type 'ScopeItem'.`
    *   `error TS2551: Property 'subcontractor_id' does not exist on type 'ScopeItem'. Did you mean 'subcontractor'?`
    *   `error TS2339: Property 'pagination' does not exist on type 'ScopeListResponse'.`
*   **Action:**
    1.  Examine the type definitions in `src/types/scope.ts`, `src/types/api-responses.ts`, and `src/types/database.ts` to determine the correct shape of the data.
    2.  Refactor the components (`scope-table.tsx`) to use the correct properties available on the types. For example, if `subcontractor_id` is gone, you may need to use `subcontractor.id` if it's a nested object.
    3.  If data is truly missing from the API response, you may need to adjust the Supabase query that fetches the data to include the necessary fields or joins.

---

#### **5. Priority 4: Code Quality - Implicit 'any' Types**

*   **Files:** `src/components/shop-drawings/ShopDrawingsTable.tsx`, `src/components/tables/shop-drawings-table.tsx`, `src/components/tables/tasks-list.tsx`
*   **Problem:** Many function parameters are missing type annotations, causing them to default to the `any` type.
*   **Example Error:** `error TS7006: Parameter 'd' implicitly has an 'any' type.`
*   **Action:**
    1.  Go through the files listed and identify all parameters flagged with this error.
    2.  Add the correct TypeScript types. You can infer the type from the context. For example, if you are mapping over an array of `ShopDrawing` objects, the parameter type will be `ShopDrawing`.

---

#### **6. Priority 5: Cleanup - Stale Test Files**

*   **Files:** `src/lib/database/__tests__/queries.test.backup.ts`, `src/lib/database/__tests__/queries.test.complex.ts`
*   **Problem:** These test files are attempting to import functions that have been renamed, moved, or deleted, causing a cascade of import errors.
*   **Example Error:** `error TS2305: Module '"../queries"' has no exported member 'getProjectDetails'.`
*   **Action:**
    *   **Option A (Fix):** Update the test files to import from the correct locations and use the updated function names and APIs.
    *   **Option B (Disable):** If these tests are obsolete, rename them with a `.bak` extension (e.g., `queries.test.backup.ts.bak`) to exclude them from the TypeScript compilation process. This is a temporary measure to clear the errors and can be revisited later.
