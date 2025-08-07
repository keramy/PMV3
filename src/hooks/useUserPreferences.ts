/**
 * User Preferences Hook for Formula PM V3
 * Manages user customization settings with localStorage and API sync
 * Optimized for construction workflows and mobile-first usage
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from './useAuth'

// User preference types
export interface UserPreferences {
  pinnedTabs: Record<string, string[]> // projectId -> tabIds[]
  navigationLayout: 'tabs' | 'sidebar' | 'mobile-bottom'
  defaultDashboard: 'overview' | 'projects' | 'tasks'
  notifications: {
    email: boolean
    push: boolean
    desktop: boolean
    categories: string[]
  }
  appearance: {
    theme: 'light' | 'dark' | 'system'
    density: 'comfortable' | 'compact' | 'spacious'
    colorScheme: 'blue' | 'construction' | 'professional'
  }
  constructionSettings: {
    defaultMeasurementUnit: 'imperial' | 'metric'
    showCostsByDefault: boolean
    quickActionButtons: string[]
    mobileOptimizations: boolean
  }
  accessibility: {
    highContrast: boolean
    reducedMotion: boolean
    largeText: boolean
    screenReaderOptimized: boolean
  }
}

// Default preferences optimized for construction workflows
const getDefaultPreferences = (): UserPreferences => ({
  pinnedTabs: {},
  navigationLayout: 'tabs',
  defaultDashboard: 'projects',
  notifications: {
    email: true,
    push: true,
    desktop: false,
    categories: ['tasks', 'approvals', 'deadlines']
  },
  appearance: {
    theme: 'system',
    density: 'comfortable',
    colorScheme: 'construction'
  },
  constructionSettings: {
    defaultMeasurementUnit: 'imperial',
    showCostsByDefault: false,
    quickActionButtons: ['create_task', 'add_scope_item', 'upload_drawing'],
    mobileOptimizations: true
  },
  accessibility: {
    highContrast: false,
    reducedMotion: false,
    largeText: false,
    screenReaderOptimized: false
  }
})

// localStorage key generator
const getStorageKey = (userId?: string) => 
  `formula-pm-preferences${userId ? `-${userId}` : ''}`

// API sync functions (placeholder for future implementation)
const syncPreferencesToServer = async (preferences: UserPreferences, userId: string) => {
  // TODO: Implement API call to save preferences
  console.log('Syncing preferences to server:', { preferences, userId })
}

const fetchPreferencesFromServer = async (userId: string): Promise<UserPreferences | null> => {
  // TODO: Implement API call to fetch preferences
  console.log('Fetching preferences from server:', userId)
  return null
}

export function useUserPreferences() {
  const { user, profile } = useAuth()
  const [preferences, setPreferences] = useState<UserPreferences>(getDefaultPreferences())
  const [isLoading, setIsLoading] = useState(true)
  const [lastSynced, setLastSynced] = useState<Date | null>(null)

  // Load preferences on mount
  useEffect(() => {
    const loadPreferences = async () => {
      try {
        setIsLoading(true)
        
        // Try to load from server first if authenticated
        if (user?.id && profile) {
          try {
            const serverPrefs = await fetchPreferencesFromServer(user.id)
            if (serverPrefs) {
              setPreferences(serverPrefs)
              setLastSynced(new Date())
              // Update localStorage with server data
              localStorage.setItem(getStorageKey(user.id), JSON.stringify(serverPrefs))
              return
            }
          } catch (error) {
            console.warn('Failed to load preferences from server:', error)
          }
        }
        
        // Fallback to localStorage
        const storageKey = getStorageKey(user?.id)
        const stored = localStorage.getItem(storageKey)
        
        if (stored) {
          try {
            const parsedPrefs = JSON.parse(stored)
            // Merge with defaults to ensure all keys exist
            setPreferences({ ...getDefaultPreferences(), ...parsedPrefs })
          } catch (error) {
            console.warn('Failed to parse stored preferences:', error)
            setPreferences(getDefaultPreferences())
          }
        } else {
          setPreferences(getDefaultPreferences())
        }
      } finally {
        setIsLoading(false)
      }
    }

    loadPreferences()
  }, [user?.id, profile])

  // Save preferences with debouncing and sync
  const updatePreferences = useCallback(
    async (updates: Partial<UserPreferences>) => {
      const newPreferences = { ...preferences, ...updates }
      setPreferences(newPreferences)

      // Save to localStorage immediately
      const storageKey = getStorageKey(user?.id)
      localStorage.setItem(storageKey, JSON.stringify(newPreferences))

      // Sync to server if authenticated (debounced)
      if (user?.id && profile) {
        try {
          await syncPreferencesToServer(newPreferences, user.id)
          setLastSynced(new Date())
        } catch (error) {
          console.warn('Failed to sync preferences to server:', error)
        }
      }
    },
    [preferences, user?.id, profile]
  )

  // Specific helper functions for common operations
  const updatePinnedTabs = useCallback(
    (projectId: string, tabIds: string[]) => {
      updatePreferences({
        pinnedTabs: {
          ...preferences.pinnedTabs,
          [projectId]: tabIds
        }
      })
    },
    [preferences.pinnedTabs, updatePreferences]
  )

  const togglePinnedTab = useCallback(
    (projectId: string, tabId: string) => {
      const currentPinned = preferences.pinnedTabs[projectId] || []
      const newPinned = currentPinned.includes(tabId)
        ? currentPinned.filter(id => id !== tabId)
        : [...currentPinned, tabId]
      
      updatePinnedTabs(projectId, newPinned)
    },
    [preferences.pinnedTabs, updatePinnedTabs]
  )

  const updateAppearance = useCallback(
    (appearanceUpdates: Partial<UserPreferences['appearance']>) => {
      updatePreferences({
        appearance: {
          ...preferences.appearance,
          ...appearanceUpdates
        }
      })
    },
    [preferences.appearance, updatePreferences]
  )

  const updateConstructionSettings = useCallback(
    (settingsUpdates: Partial<UserPreferences['constructionSettings']>) => {
      updatePreferences({
        constructionSettings: {
          ...preferences.constructionSettings,
          ...settingsUpdates
        }
      })
    },
    [preferences.constructionSettings, updatePreferences]
  )

  const updateNotifications = useCallback(
    (notificationUpdates: Partial<UserPreferences['notifications']>) => {
      updatePreferences({
        notifications: {
          ...preferences.notifications,
          ...notificationUpdates
        }
      })
    },
    [preferences.notifications, updatePreferences]
  )

  const updateAccessibility = useCallback(
    (accessibilityUpdates: Partial<UserPreferences['accessibility']>) => {
      updatePreferences({
        accessibility: {
          ...preferences.accessibility,
          ...accessibilityUpdates
        }
      })
    },
    [preferences.accessibility, updatePreferences]
  )

  // Reset to defaults
  const resetPreferences = useCallback(() => {
    const defaults = getDefaultPreferences()
    updatePreferences(defaults)
  }, [updatePreferences])

  // Export/Import for backup/restore
  const exportPreferences = useCallback(() => {
    return JSON.stringify(preferences, null, 2)
  }, [preferences])

  const importPreferences = useCallback(
    (preferencesJson: string) => {
      try {
        const importedPrefs = JSON.parse(preferencesJson)
        // Validate structure and merge with defaults
        const validatedPrefs = { ...getDefaultPreferences(), ...importedPrefs }
        updatePreferences(validatedPrefs)
        return true
      } catch (error) {
        console.error('Failed to import preferences:', error)
        return false
      }
    },
    [updatePreferences]
  )

  // Construction-specific helpers
  const getPinnedTabs = useCallback(
    (projectId: string): string[] => {
      return preferences.pinnedTabs[projectId] || []
    },
    [preferences.pinnedTabs]
  )

  const isTabPinned = useCallback(
    (projectId: string, tabId: string): boolean => {
      return getPinnedTabs(projectId).includes(tabId)
    },
    [getPinnedTabs]
  )

  // Theme and appearance helpers
  const isDarkMode = preferences.appearance.theme === 'dark' || 
    (preferences.appearance.theme === 'system' && 
     typeof window !== 'undefined' && 
     window.matchMedia('(prefers-color-scheme: dark)').matches)

  const shouldReduceMotion = preferences.accessibility.reducedMotion ||
    (typeof window !== 'undefined' && 
     window.matchMedia('(prefers-reduced-motion: reduce)').matches)

  return {
    // State
    preferences,
    isLoading,
    lastSynced,
    
    // General updates
    updatePreferences,
    resetPreferences,
    
    // Specific updates
    updatePinnedTabs,
    togglePinnedTab,
    updateAppearance,
    updateConstructionSettings,
    updateNotifications,
    updateAccessibility,
    
    // Helpers
    getPinnedTabs,
    isTabPinned,
    
    // Export/Import
    exportPreferences,
    importPreferences,
    
    // Computed values
    isDarkMode,
    shouldReduceMotion,
    isMobileOptimized: preferences.constructionSettings.mobileOptimizations,
    showCostsByDefault: preferences.constructionSettings.showCostsByDefault,
    defaultMeasurementUnit: preferences.constructionSettings.defaultMeasurementUnit,
  }
}