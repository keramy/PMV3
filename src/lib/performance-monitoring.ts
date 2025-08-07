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
          if (entry.entryType === 'navigation') {\n            this.updateMetric('navigationTime', entry.loadEventEnd - entry.fetchStart)\n          }\n        })\n      })\n      \n      try {\n        navigationObserver.observe({ entryTypes: ['navigation'] })\n        this.observers.push(navigationObserver)\n      } catch (e) {\n        console.warn('Navigation observer not supported')\n      }\n    }\n  }\n  \n  private initializeNetworkMonitoring() {\n    // @ts-ignore - Network Information API\n    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection\n    \n    if (connection) {\n      this.updateMetric('connectionType', connection.effectiveType)\n      this.updateMetric('bandwidth', connection.downlink)\n      \n      connection.addEventListener('change', () => {\n        this.updateMetric('connectionType', connection.effectiveType)\n        this.updateMetric('bandwidth', connection.downlink)\n        \n        // Report slow connection for construction sites\n        if (connection.downlink < PERFORMANCE_THRESHOLDS.LOW_BANDWIDTH_THRESHOLD) {\n          this.reportSlowConnection(connection.effectiveType, connection.downlink)\n        }\n      })\n    }\n    \n    // Monitor latency via ping\n    this.measureLatency()\n    setInterval(() => this.measureLatency(), 30000) // Every 30 seconds\n  }\n  \n  private async measureLatency() {\n    try {\n      const start = Date.now()\n      await fetch('/api/ping', { method: 'HEAD', cache: 'no-cache' })\n      const latency = Date.now() - start\n      this.updateMetric('latency', latency)\n      \n      if (latency > PERFORMANCE_THRESHOLDS.SLOW_CONNECTION_THRESHOLD) {\n        this.reportHighLatency(latency)\n      }\n    } catch (error) {\n      console.warn('Latency measurement failed:', error)\n    }\n  }\n  \n  private initializeConstructionMonitoring() {\n    // Monitor drawing viewer load times\n    window.addEventListener('drawingViewerLoad', (event: any) => {\n      this.updateMetric('drawingViewerLoadTime', event.detail.loadTime)\n    })\n    \n    // Monitor Excel import performance\n    window.addEventListener('excelImportStart', () => {\n      this.startTime = Date.now()\n    })\n    \n    window.addEventListener('excelImportComplete', () => {\n      const importTime = Date.now() - this.startTime\n      this.updateMetric('excelImportTime', importTime)\n      \n      if (importTime > PERFORMANCE_THRESHOLDS.EXCEL_IMPORT_TIME) {\n        this.reportSlowExcelImport(importTime)\n      }\n    })\n    \n    // Monitor offline queue size\n    this.monitorOfflineQueue()\n  }\n  \n  private initializeMobileMonitoring() {\n    // Monitor touch response time\n    let touchStart = 0\n    \n    document.addEventListener('touchstart', () => {\n      touchStart = Date.now()\n    }, { passive: true })\n    \n    document.addEventListener('touchend', () => {\n      if (touchStart) {\n        const responseTime = Date.now() - touchStart\n        this.updateMetric('touchResponseTime', responseTime)\n        \n        if (responseTime > PERFORMANCE_THRESHOLDS.TOUCH_RESPONSE_TIME) {\n          this.reportSlowTouchResponse(responseTime)\n        }\n      }\n    }, { passive: true })\n    \n    // Monitor scroll performance\n    let scrollStart = 0\n    let scrollCount = 0\n    \n    document.addEventListener('scroll', () => {\n      if (scrollStart === 0) {\n        scrollStart = Date.now()\n      }\n      scrollCount++\n    }, { passive: true })\n    \n    // Calculate scroll FPS every second\n    setInterval(() => {\n      if (scrollCount > 0) {\n        const scrollDuration = Date.now() - scrollStart\n        const scrollFPS = (scrollCount / scrollDuration) * 1000\n        this.updateMetric('scrollPerformance', scrollFPS)\n        \n        scrollStart = 0\n        scrollCount = 0\n      }\n    }, 1000)\n  }\n  \n  private monitorOfflineQueue() {\n    // Mock implementation - would integrate with actual offline system\n    const checkOfflineQueue = () => {\n      const queueSize = parseInt(localStorage.getItem('offline-queue-size') || '0')\n      this.updateMetric('offlineQueueSize', queueSize)\n    }\n    \n    checkOfflineQueue()\n    setInterval(checkOfflineQueue, 5000) // Check every 5 seconds\n  }\n  \n  private updateMetric(key: keyof PerformanceMetrics, value: any) {\n    this.metrics[key] = value\n    this.notifyListeners()\n  }\n  \n  private notifyListeners() {\n    this.listeners.forEach(listener => {\n      listener(this.metrics as PerformanceMetrics)\n    })\n  }\n  \n  // Reporting methods for construction-specific issues\n  private reportSlowNavigation(time: number) {\n    console.warn(`Slow navigation detected: ${time}ms (threshold: ${PERFORMANCE_THRESHOLDS.NAVIGATION_TIME}ms)`)\n    \n    // Send to monitoring service in production\n    this.sendToMonitoring({\n      type: 'slow_navigation',\n      value: time,\n      threshold: PERFORMANCE_THRESHOLDS.NAVIGATION_TIME,\n      context: 'construction_app'\n    })\n  }\n  \n  private reportSlowConnection(type: string, bandwidth: number) {\n    console.warn(`Slow connection detected: ${type}, ${bandwidth} Mbps`)\n    \n    this.sendToMonitoring({\n      type: 'slow_connection',\n      connectionType: type,\n      bandwidth,\n      context: 'construction_site'\n    })\n  }\n  \n  private reportHighLatency(latency: number) {\n    console.warn(`High latency detected: ${latency}ms`)\n    \n    this.sendToMonitoring({\n      type: 'high_latency',\n      value: latency,\n      threshold: PERFORMANCE_THRESHOLDS.SLOW_CONNECTION_THRESHOLD,\n      context: 'construction_site'\n    })\n  }\n  \n  private reportSlowTouchResponse(time: number) {\n    console.warn(`Slow touch response: ${time}ms`)\n    \n    this.sendToMonitoring({\n      type: 'slow_touch_response',\n      value: time,\n      threshold: PERFORMANCE_THRESHOLDS.TOUCH_RESPONSE_TIME,\n      context: 'mobile_construction'\n    })\n  }\n  \n  private reportSlowExcelImport(time: number) {\n    console.warn(`Slow Excel import: ${time}ms`)\n    \n    this.sendToMonitoring({\n      type: 'slow_excel_import',\n      value: time,\n      threshold: PERFORMANCE_THRESHOLDS.EXCEL_IMPORT_TIME,\n      context: 'construction_data'\n    })\n  }\n  \n  private sendToMonitoring(data: any) {\n    // In production, send to monitoring service (e.g., Sentry, DataDog)\n    if (process.env.NODE_ENV === 'production') {\n      // Example: Send to monitoring API\n      fetch('/api/monitoring/performance', {\n        method: 'POST',\n        headers: { 'Content-Type': 'application/json' },\n        body: JSON.stringify({\n          ...data,\n          timestamp: Date.now(),\n          userAgent: navigator.userAgent,\n          url: window.location.href\n        })\n      }).catch(console.error)\n    }\n  }\n  \n  // Public API methods\n  public getMetrics(): Partial<PerformanceMetrics> {\n    return { ...this.metrics }\n  }\n  \n  public onMetricsUpdate(callback: (metrics: PerformanceMetrics) => void) {\n    this.listeners.push(callback)\n    \n    // Return unsubscribe function\n    return () => {\n      const index = this.listeners.indexOf(callback)\n      if (index > -1) {\n        this.listeners.splice(index, 1)\n      }\n    }\n  }\n  \n  public markTabSwitch(tabName: string) {\n    const switchTime = Date.now() - this.startTime\n    this.updateMetric('tabSwitchTime', switchTime)\n    \n    if (switchTime > PERFORMANCE_THRESHOLDS.TAB_SWITCH_TIME) {\n      this.reportSlowTabSwitch(tabName, switchTime)\n    }\n    \n    this.startTime = Date.now()\n  }\n  \n  private reportSlowTabSwitch(tabName: string, time: number) {\n    console.warn(`Slow tab switch to ${tabName}: ${time}ms`)\n    \n    this.sendToMonitoring({\n      type: 'slow_tab_switch',\n      tab: tabName,\n      value: time,\n      threshold: PERFORMANCE_THRESHOLDS.TAB_SWITCH_TIME,\n      context: 'project_navigation'\n    })\n  }\n  \n  public markAPICall(endpoint: string, duration: number, success: boolean) {\n    this.updateMetric('apiResponseTime', duration)\n    \n    if (duration > PERFORMANCE_THRESHOLDS.API_RESPONSE_WARNING) {\n      this.reportSlowAPI(endpoint, duration, success)\n    }\n  }\n  \n  private reportSlowAPI(endpoint: string, time: number, success: boolean) {\n    const level = time > PERFORMANCE_THRESHOLDS.API_RESPONSE_TIME ? 'error' : 'warning'\n    console[level](`Slow API call to ${endpoint}: ${time}ms (success: ${success})`)\n    \n    this.sendToMonitoring({\n      type: 'slow_api_call',\n      endpoint,\n      duration: time,\n      success,\n      threshold: PERFORMANCE_THRESHOLDS.API_RESPONSE_TIME,\n      context: 'construction_api'\n    })\n  }\n  \n  public destroy() {\n    // Cleanup observers\n    this.observers.forEach(observer => observer.disconnect())\n    this.observers = []\n    this.listeners = []\n  }\n}\n\n// Singleton instance\nlet performanceMonitor: PerformanceMonitor | null = null\n\nexport function getPerformanceMonitor(): PerformanceMonitor {\n  if (typeof window === 'undefined') {\n    // Return mock for SSR\n    return {\n      getMetrics: () => ({}),\n      onMetricsUpdate: () => () => {},\n      markTabSwitch: () => {},\n      markAPICall: () => {},\n      destroy: () => {}\n    } as any\n  }\n  \n  if (!performanceMonitor) {\n    performanceMonitor = new PerformanceMonitor()\n  }\n  \n  return performanceMonitor\n}\n\n// Hook for using performance monitoring in React components\nexport function usePerformanceMonitoring() {\n  const monitor = getPerformanceMonitor()\n  \n  return {\n    metrics: monitor.getMetrics(),\n    markTabSwitch: monitor.markTabSwitch.bind(monitor),\n    markAPICall: monitor.markAPICall.bind(monitor),\n    onMetricsUpdate: monitor.onMetricsUpdate.bind(monitor)\n  }\n}\n\n// Utility for measuring component render performance\nexport function measureRenderTime<T extends (...args: any[]) => any>(\n  componentName: string,\n  renderFunction: T\n): T {\n  return ((...args: Parameters<T>) => {\n    const start = performance.now()\n    const result = renderFunction(...args)\n    const end = performance.now()\n    \n    const monitor = getPerformanceMonitor()\n    monitor.markAPICall(`render:${componentName}`, end - start, true)\n    \n    return result\n  }) as T\n}\n\n// Construction-specific performance utilities\nexport const constructionPerformanceUtils = {\n  // Mark drawing viewer events\n  markDrawingViewerLoad: (loadTime: number) => {\n    window.dispatchEvent(new CustomEvent('drawingViewerLoad', {\n      detail: { loadTime }\n    }))\n  },\n  \n  // Mark Excel import events\n  markExcelImportStart: () => {\n    window.dispatchEvent(new CustomEvent('excelImportStart'))\n  },\n  \n  markExcelImportComplete: () => {\n    window.dispatchEvent(new CustomEvent('excelImportComplete'))\n  },\n  \n  // Get performance recommendations for construction sites\n  getPerformanceRecommendations: (metrics: Partial<PerformanceMetrics>) => {\n    const recommendations: string[] = []\n    \n    if (metrics.connectionType === 'slow-2g' || metrics.connectionType === '2g') {\n      recommendations.push('Enable offline mode for better performance in low connectivity areas')\n    }\n    \n    if (metrics.navigationTime && metrics.navigationTime > PERFORMANCE_THRESHOLDS.NAVIGATION_TIME) {\n      recommendations.push('Consider reducing data loaded on navigation for faster page switches')\n    }\n    \n    if (metrics.touchResponseTime && metrics.touchResponseTime > PERFORMANCE_THRESHOLDS.TOUCH_RESPONSE_TIME) {\n      recommendations.push('Touch interactions may be slow - consider using a device with better touch response')\n    }\n    \n    if (metrics.offlineQueueSize && metrics.offlineQueueSize > 50) {\n      recommendations.push('Large offline queue detected - connect to internet to sync data')\n    }\n    \n    return recommendations\n  }\n}"