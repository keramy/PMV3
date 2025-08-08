/**
 * Performance Monitoring for Formula PM V3
 * Construction site-optimized performance tracking
 * Mobile-first with focus on navigation speed and data loading
 */

'use client'

// Performance metrics interface
export interface PerformanceMetrics {
  // Navigation metrics
  navigationTime: number
  routeChangeTime: number
  tabSwitchTime: number
  
  // Data loading metrics
  apiResponseTime: number
  dataRenderTime: number
  imageLoadTime: number
  
  // User interaction metrics
  firstInteractionTime: number
  timeToInteractive: number
  
  // Construction-specific metrics
  drawingViewerLoadTime: number
  excelImportTime: number
  offlineQueueSize: number
  
  // Mobile metrics
  touchResponseTime: number
  scrollPerformance: number
  
  // Network metrics
  connectionType: string
  bandwidth: number
  latency: number
}

// Performance thresholds for construction applications
export const PERFORMANCE_THRESHOLDS = {
  // Navigation (must be < 500ms per CLAUDE.md requirements)
  NAVIGATION_TIME: 500,
  TAB_SWITCH_TIME: 200,
  ROUTE_CHANGE_TIME: 300,
  
  // API responses
  API_RESPONSE_TIME: 2000,
  API_RESPONSE_WARNING: 1000,
  
  // Rendering
  DATA_RENDER_TIME: 1000,
  IMAGE_LOAD_TIME: 3000,
  
  // Interactions (mobile-optimized)
  TOUCH_RESPONSE_TIME: 100,
  TIME_TO_INTERACTIVE: 2000,
  
  // Construction-specific
  DRAWING_VIEWER_LOAD: 3000,
  EXCEL_IMPORT_TIME: 10000,
  
  // Network (construction site conditions)
  SLOW_CONNECTION_THRESHOLD: 1000, // ms latency
  LOW_BANDWIDTH_THRESHOLD: 1, // Mbps
} as const

// Performance monitor class
class PerformanceMonitor {
  private metrics: Partial<PerformanceMetrics> = {}
  private observers: PerformanceObserver[] = []
  private listeners: Array<(metrics: PerformanceMetrics) => void> = []
  private startTime: number = Date.now()
  
  constructor() {
    if (typeof window !== 'undefined') {
      this.initializeMonitoring()
    }
  }
  
  private initializeMonitoring() {
    // Initialize Web Vitals monitoring
    this.initializeWebVitals()
    
    // Monitor navigation performance
    this.initializeNavigationMonitoring()
    
    // Monitor network conditions
    this.initializeNetworkMonitoring()
    
    // Monitor construction-specific performance
    this.initializeConstructionMonitoring()
    
    // Mobile performance monitoring
    this.initializeMobileMonitoring()
  }
  
  private initializeWebVitals() {
    // Monitor Largest Contentful Paint (LCP)
    if ('PerformanceObserver' in window) {
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        const lastEntry = entries[entries.length - 1] as any
        this.updateMetric('dataRenderTime', lastEntry.startTime)
      })
      
      try {
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] })
        this.observers.push(lcpObserver)
      } catch (e) {
        console.warn('LCP observer not supported')
      }
      
      // Monitor First Input Delay (FID)
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        entries.forEach((entry: any) => {
          this.updateMetric('firstInteractionTime', entry.processingStart - entry.startTime)
        })
      })
      
      try {
        fidObserver.observe({ entryTypes: ['first-input'] })
        this.observers.push(fidObserver)
      } catch (e) {
        console.warn('FID observer not supported')
      }
    }
  }
  
  private initializeNavigationMonitoring() {
    // Monitor route changes (Next.js App Router)
    let navigationStart = Date.now()
    
    // Listen for route changes
    const handleRouteChangeStart = () => {
      navigationStart = Date.now()
    }
    
    const handleRouteChangeComplete = () => {
      const navigationTime = Date.now() - navigationStart
      this.updateMetric('navigationTime', navigationTime)
      this.updateMetric('routeChangeTime', navigationTime)
      
      // Check if navigation exceeds threshold
      if (navigationTime > PERFORMANCE_THRESHOLDS.NAVIGATION_TIME) {
        this.reportSlowNavigation(navigationTime)
      }
    }
    
    // For Next.js App Router, we'll track via Performance API
    if ('PerformanceObserver' in window) {
      const navigationObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        entries.forEach((entry: any) => {
          if (entry.entryType === 'navigation') {
            this.updateMetric('navigationTime', entry.loadEventEnd - entry.fetchStart)
          }
        })
      })
      
      try {
        navigationObserver.observe({ entryTypes: ['navigation'] })
        this.observers.push(navigationObserver)
      } catch (e) {
        console.warn('Navigation observer not supported')
      }
    }
  }
  
  private initializeNetworkMonitoring() {
    // @ts-ignore - Network Information API
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection
    
    if (connection) {
      this.updateMetric('connectionType', connection.effectiveType)
      this.updateMetric('bandwidth', connection.downlink)
      
      connection.addEventListener('change', () => {
        this.updateMetric('connectionType', connection.effectiveType)
        this.updateMetric('bandwidth', connection.downlink)
        
        // Report slow connection for construction sites
        if (connection.downlink < PERFORMANCE_THRESHOLDS.LOW_BANDWIDTH_THRESHOLD) {
          this.reportSlowConnection(connection.effectiveType, connection.downlink)
        }
      })
    }
    
    // Monitor latency via ping
    this.measureLatency()
    setInterval(() => this.measureLatency(), 30000) // Every 30 seconds
  }
  
  private async measureLatency() {
    try {
      const start = Date.now()
      await fetch('/api/ping', { method: 'HEAD', cache: 'no-cache' })
      const latency = Date.now() - start
      this.updateMetric('latency', latency)
      
      if (latency > PERFORMANCE_THRESHOLDS.SLOW_CONNECTION_THRESHOLD) {
        this.reportHighLatency(latency)
      }
    } catch (error) {
      console.warn('Latency measurement failed:', error)
    }
  }
  
  private initializeConstructionMonitoring() {
    // Monitor drawing viewer load times
    window.addEventListener('drawingViewerLoad', (event: any) => {
      this.updateMetric('drawingViewerLoadTime', event.detail.loadTime)
    })
    
    // Monitor Excel import performance
    window.addEventListener('excelImportStart', () => {
      this.startTime = Date.now()
    })
    
    window.addEventListener('excelImportComplete', () => {
      const importTime = Date.now() - this.startTime
      this.updateMetric('excelImportTime', importTime)
      
      if (importTime > PERFORMANCE_THRESHOLDS.EXCEL_IMPORT_TIME) {
        this.reportSlowExcelImport(importTime)
      }
    })
    
    // Monitor offline queue size
    this.monitorOfflineQueue()
  }
  
  private initializeMobileMonitoring() {
    // Monitor touch response time
    let touchStart = 0
    
    document.addEventListener('touchstart', () => {
      touchStart = Date.now()
    }, { passive: true })
    
    document.addEventListener('touchend', () => {
      if (touchStart) {
        const responseTime = Date.now() - touchStart
        this.updateMetric('touchResponseTime', responseTime)
        
        if (responseTime > PERFORMANCE_THRESHOLDS.TOUCH_RESPONSE_TIME) {
          this.reportSlowTouchResponse(responseTime)
        }
      }
    }, { passive: true })
    
    // Monitor scroll performance
    let scrollStart = 0
    let scrollCount = 0
    
    document.addEventListener('scroll', () => {
      if (scrollStart === 0) {
        scrollStart = Date.now()
      }
      scrollCount++
    }, { passive: true })
    
    // Calculate scroll FPS every second
    setInterval(() => {
      if (scrollCount > 0) {
        const scrollDuration = Date.now() - scrollStart
        const scrollFPS = (scrollCount / scrollDuration) * 1000
        this.updateMetric('scrollPerformance', scrollFPS)
        
        scrollStart = 0
        scrollCount = 0
      }
    }, 1000)
  }
  
  private monitorOfflineQueue() {
    // Mock implementation - would integrate with actual offline system
    const checkOfflineQueue = () => {
      const queueSize = parseInt(localStorage.getItem('offline-queue-size') || '0')
      this.updateMetric('offlineQueueSize', queueSize)
    }
    
    checkOfflineQueue()
    setInterval(checkOfflineQueue, 5000) // Check every 5 seconds
  }
  
  private updateMetric<K extends keyof PerformanceMetrics>(key: K, value: PerformanceMetrics[K]) {
    this.metrics[key] = value
    this.notifyListeners()
  }
  
  private notifyListeners() {
    this.listeners.forEach(listener => {
      listener(this.metrics as PerformanceMetrics)
    })
  }
  
  // Reporting methods for construction-specific issues
  private reportSlowNavigation(time: number) {
    console.warn(`Slow navigation detected: ${time}ms (threshold: ${PERFORMANCE_THRESHOLDS.NAVIGATION_TIME}ms)`)
    
    // Send to monitoring service in production
    this.sendToMonitoring({
      type: 'slow_navigation',
      value: time,
      threshold: PERFORMANCE_THRESHOLDS.NAVIGATION_TIME,
      context: 'construction_app'
    })
  }
  
  private reportSlowConnection(type: string, bandwidth: number) {
    console.warn(`Slow connection detected: ${type}, ${bandwidth} Mbps`)
    
    this.sendToMonitoring({
      type: 'slow_connection',
      connectionType: type,
      bandwidth,
      context: 'construction_site'
    })
  }
  
  private reportHighLatency(latency: number) {
    console.warn(`High latency detected: ${latency}ms`)
    
    this.sendToMonitoring({
      type: 'high_latency',
      value: latency,
      threshold: PERFORMANCE_THRESHOLDS.SLOW_CONNECTION_THRESHOLD,
      context: 'construction_site'
    })
  }
  
  private reportSlowTouchResponse(time: number) {
    console.warn(`Slow touch response: ${time}ms`)
    
    this.sendToMonitoring({
      type: 'slow_touch_response',
      value: time,
      threshold: PERFORMANCE_THRESHOLDS.TOUCH_RESPONSE_TIME,
      context: 'mobile_construction'
    })
  }
  
  private reportSlowExcelImport(time: number) {
    console.warn(`Slow Excel import: ${time}ms`)
    
    this.sendToMonitoring({
      type: 'slow_excel_import',
      value: time,
      threshold: PERFORMANCE_THRESHOLDS.EXCEL_IMPORT_TIME,
      context: 'construction_data'
    })
  }
  
  private sendToMonitoring(data: any) {
    // In production, send to monitoring service (e.g., Sentry, DataDog)
    if (process.env.NODE_ENV === 'production') {
      // Example: Send to monitoring API
      fetch('/api/monitoring/performance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          timestamp: Date.now(),
          userAgent: navigator.userAgent,
          url: window.location.href
        })
      }).catch(console.error)
    }
  }
  
  // Public API methods
  public getMetrics(): Partial<PerformanceMetrics> {
    return { ...this.metrics }
  }
  
  public onMetricsUpdate(callback: (metrics: PerformanceMetrics) => void) {
    this.listeners.push(callback)
    
    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(callback)
      if (index > -1) {
        this.listeners.splice(index, 1)
      }
    }
  }
  
  public markTabSwitch(tabName: string) {
    const switchTime = Date.now() - this.startTime
    this.updateMetric('tabSwitchTime', switchTime)
    
    if (switchTime > PERFORMANCE_THRESHOLDS.TAB_SWITCH_TIME) {
      this.reportSlowTabSwitch(tabName, switchTime)
    }
    
    this.startTime = Date.now()
  }
  
  private reportSlowTabSwitch(tabName: string, time: number) {
    console.warn(`Slow tab switch to ${tabName}: ${time}ms`)
    
    this.sendToMonitoring({
      type: 'slow_tab_switch',
      tab: tabName,
      value: time,
      threshold: PERFORMANCE_THRESHOLDS.TAB_SWITCH_TIME,
      context: 'project_navigation'
    })
  }
  
  public markAPICall(endpoint: string, duration: number, success: boolean) {
    this.updateMetric('apiResponseTime', duration)
    
    if (duration > PERFORMANCE_THRESHOLDS.API_RESPONSE_WARNING) {
      this.reportSlowAPI(endpoint, duration, success)
    }
  }
  
  private reportSlowAPI(endpoint: string, time: number, success: boolean) {
    const level = time > PERFORMANCE_THRESHOLDS.API_RESPONSE_TIME ? 'error' : 'warning'
    if (level === 'error') {
      console.error(`Slow API call to ${endpoint}: ${time}ms (success: ${success})`)
    } else {
      console.warn(`Slow API call to ${endpoint}: ${time}ms (success: ${success})`)
    }
    
    this.sendToMonitoring({
      type: 'slow_api_call',
      endpoint,
      duration: time,
      success,
      threshold: PERFORMANCE_THRESHOLDS.API_RESPONSE_TIME,
      context: 'construction_api'
    })
  }
  
  public destroy() {
    // Cleanup observers
    this.observers.forEach(observer => observer.disconnect())
    this.observers = []
    this.listeners = []
  }
}

// Singleton instance
let performanceMonitor: PerformanceMonitor | null = null

export function getPerformanceMonitor(): PerformanceMonitor {
  if (typeof window === 'undefined') {
    // Return mock for SSR
    return {
      getMetrics: () => ({}),
      onMetricsUpdate: () => () => {},
      markTabSwitch: () => {},
      markAPICall: () => {},
      destroy: () => {}
    } as any
  }
  
  if (!performanceMonitor) {
    performanceMonitor = new PerformanceMonitor()
  }
  
  return performanceMonitor
}

// Hook for using performance monitoring in React components
export function usePerformanceMonitoring() {
  const monitor = getPerformanceMonitor()
  
  return {
    metrics: monitor.getMetrics(),
    markTabSwitch: monitor.markTabSwitch.bind(monitor),
    markAPICall: monitor.markAPICall.bind(monitor),
    onMetricsUpdate: monitor.onMetricsUpdate.bind(monitor)
  }
}

// Utility for measuring component render performance
export function measureRenderTime<T extends (...args: any[]) => any>(
  componentName: string,
  renderFunction: T
): T {
  return ((...args: Parameters<T>) => {
    const start = performance.now()
    const result = renderFunction(...args)
    const end = performance.now()
    
    const monitor = getPerformanceMonitor()
    monitor.markAPICall(`render:${componentName}`, end - start, true)
    
    return result
  }) as T
}

// Construction-specific performance utilities
export const constructionPerformanceUtils = {
  // Mark drawing viewer events
  markDrawingViewerLoad: (loadTime: number) => {
    window.dispatchEvent(new CustomEvent('drawingViewerLoad', {
      detail: { loadTime }
    }))
  },
  
  // Mark Excel import events
  markExcelImportStart: () => {
    window.dispatchEvent(new CustomEvent('excelImportStart'))
  },
  
  markExcelImportComplete: () => {
    window.dispatchEvent(new CustomEvent('excelImportComplete'))
  },
  
  // Get performance recommendations for construction sites
  getPerformanceRecommendations: (metrics: Partial<PerformanceMetrics>) => {
    const recommendations: string[] = []
    
    if (metrics.connectionType === 'slow-2g' || metrics.connectionType === '2g') {
      recommendations.push('Enable offline mode for better performance in low connectivity areas')
    }
    
    if (metrics.navigationTime && metrics.navigationTime > PERFORMANCE_THRESHOLDS.NAVIGATION_TIME) {
      recommendations.push('Consider reducing data loaded on navigation for faster page switches')
    }
    
    if (metrics.touchResponseTime && metrics.touchResponseTime > PERFORMANCE_THRESHOLDS.TOUCH_RESPONSE_TIME) {
      recommendations.push('Touch interactions may be slow - consider using a device with better touch response')
    }
    
    if (metrics.offlineQueueSize && metrics.offlineQueueSize > 50) {
      recommendations.push('Large offline queue detected - connect to internet to sync data')
    }
    
    return recommendations
  }
}