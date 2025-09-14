const PerformanceConfig = {
  // Core performance settings
  settings: {
    // Throttle delays (in milliseconds)
    scrollThrottle: 16,
    resizeThrottle: 250,
    searchThrottle: 300, 

    // Animation settings
    animationDuration: 300,
    transitionDuration: 200,

    // Intersection Observer settings
    intersectionThreshold: 0.1,
    intersectionRootMargin: "50px",

    // Image loading settings
    lazyLoadMargin: "200px",

    // Carousel settings
    autoPlayInterval: 4000,
    swipeThreshold: 50,

    // Lightbox settings
    lightboxTransition: 300,

    // Scroll behavior
    smoothScrollOffset: 90,
    chapterScrollOffset: 180,
  },

  // Performance monitoring
  monitor: {
    // Track performance metrics
    trackMetrics: true,

    // Console logging for development
    logPerformance: false,

    // Metrics to track
    metrics: {
      loadTime: 0,
      firstContentfulPaint: 0,
      largestContentfulPaint: 0,
      cumulativeLayoutShift: 0,
      firstInputDelay: 0,
    },
  },

  // Optimization flags
  optimizations: {
    // Enable/disable features for performance
    enableAnimations: true,
    enableParticles: true,
    enableAutoPlay: true,
    enableLazyLoading: true,
    enablePrefetch: true,

    // Browser-specific optimizations
    useRequestAnimationFrame: true,
    usePassiveListeners: true,
    useWillChange: true,

    // Memory management
    cleanupTimers: true,
    removeUnusedListeners: true,
  },

  // Device-specific settings
  device: {
    // Detect and adjust for device capabilities
    isLowEndDevice: false,
    isMobile: false,
    isTablet: false,

    // Performance thresholds
    lowEndThreshold: {
      memory: 1000,
      cores: 2,
      connection: "slow-2g",
    },
  },

  // Initialize performance monitoring
  init() {
    this.detectDevice();
    this.setupPerformanceObserver();
    this.optimizeForDevice();

    if (this.monitor.logPerformance) {
      console.log("🚀 Performance Config initialized", this.settings);
    }
  },

  // Detect device capabilities
  detectDevice() {
    // Screen size detection
    const width = window.innerWidth;
    this.device.isMobile = width < 768;
    this.device.isTablet = width >= 768 && width < 1024;

    // Memory detection (if available)
    if ("memory" in performance) {
      const memory = performance.memory.jsHeapSizeLimit / (1024 * 1024);
      this.device.isLowEndDevice = memory < this.device.lowEndThreshold.memory;
    }

    // Connection detection
    if ("connection" in navigator) {
      const connection = navigator.connection;
      this.device.isLowEndDevice =
        this.device.isLowEndDevice ||
        connection.effectiveType === "slow-2g" ||
        connection.effectiveType === "2g";
    }

    // Hardware cores detection
    if ("hardwareConcurrency" in navigator) {
      this.device.isLowEndDevice =
        this.device.isLowEndDevice ||
        navigator.hardwareConcurrency < this.device.lowEndThreshold.cores;
    }
  },

  // Setup performance observer
  setupPerformanceObserver() {
    if (!this.monitor.trackMetrics || !("PerformanceObserver" in window))
      return;

    try {
      // Observe paint timings
      const paintObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.name === "first-contentful-paint") {
            this.monitor.metrics.firstContentfulPaint = entry.startTime;
          }
        });
      });
      paintObserver.observe({ entryTypes: ["paint"] });

      // Observe largest contentful paint
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        this.monitor.metrics.largestContentfulPaint = lastEntry.startTime;
      });
      lcpObserver.observe({ entryTypes: ["largest-contentful-paint"] });

      // Observe cumulative layout shift
      const clsObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (!entry.hadRecentInput) {
            this.monitor.metrics.cumulativeLayoutShift += entry.value;
          }
        });
      });
      clsObserver.observe({ entryTypes: ["layout-shift"] });

      // Observe first input delay
      const fidObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          this.monitor.metrics.firstInputDelay =
            entry.processingStart - entry.startTime;
        });
      });
      fidObserver.observe({ entryTypes: ["first-input"] });
    } catch (error) {
      console.warn("Performance Observer setup failed:", error);
    }
  },

  // Optimize settings based on device
  optimizeForDevice() {
    if (this.device.isLowEndDevice) {
      // Reduce animations and effects for low-end devices
      this.optimizations.enableAnimations = false;
      this.optimizations.enableParticles = false;
      this.optimizations.enableAutoPlay = false;

      // Increase throttle delays
      this.settings.scrollThrottle = 32; 
      this.settings.resizeThrottle = 500;

      // Reduce transition durations
      this.settings.animationDuration = 150;
      this.settings.transitionDuration = 100;

      if (this.monitor.logPerformance) {
        console.log("📱 Optimized for low-end device");
      }
    }

    if (this.device.isMobile) {
      // Mobile-specific optimizations
      this.settings.autoPlayInterval = 5000; 
      this.settings.swipeThreshold = 30; 

      if (this.monitor.logPerformance) {
        console.log("📱 Mobile optimizations applied");
      }
    }
  },

  // Get optimized settings
  getSettings() {
    return { ...this.settings };
  },

  // Get performance metrics
  getMetrics() {
    // Add load time
    this.monitor.metrics.loadTime = performance.now();

    return { ...this.monitor.metrics };
  },

  // Update setting dynamically
  updateSetting(key, value) {
    if (key in this.settings) {
      this.settings[key] = value;

      if (this.monitor.logPerformance) {
        console.log(`⚙️ Updated ${key} to ${value}`);
      }
    }
  },

  // Check if feature should be enabled
  shouldEnable(feature) {
    return this.optimizations[feature] !== false;
  },

  // Throttle function factory
  createThrottle(delay = this.settings.scrollThrottle) {
    let inThrottle;
    return function (func) {
      return function (...args) {
        if (!inThrottle) {
          func.apply(this, args);
          inThrottle = true;
          setTimeout(() => (inThrottle = false), delay);
        }
      };
    };
  },

  // Debounce function factory
  createDebounce(delay = this.settings.resizeThrottle) {
    let timeout;
    return function (func) {
      return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), delay);
      };
    };
  },

 
  cleanup() {
    if (this.monitor.logPerformance) {
      console.log("🧹 Performance cleanup completed");
    }
  },

  // Log performance summary
  logSummary() {
    if (!this.monitor.logPerformance) return;

    const metrics = this.getMetrics();
    console.group("📊 Performance Summary");
    console.log("Load Time:", `${metrics.loadTime.toFixed(2)}ms`);
    console.log(
      "First Contentful Paint:",
      `${metrics.firstContentfulPaint.toFixed(2)}ms`
    );
    console.log(
      "Largest Contentful Paint:",
      `${metrics.largestContentfulPaint.toFixed(2)}ms`
    );
    console.log(
      "Cumulative Layout Shift:",
      metrics.cumulativeLayoutShift.toFixed(4)
    );
    console.log(
      "First Input Delay:",
      `${metrics.firstInputDelay.toFixed(2)}ms`
    );
    console.log(
      "Device Type:",
      this.device.isMobile
        ? "Mobile"
        : this.device.isTablet
        ? "Tablet"
        : "Desktop"
    );
    console.log("Low-end Device:", this.device.isLowEndDevice);
    console.groupEnd();
  },
};

// Auto-initialize
document.addEventListener("DOMContentLoaded", () => {
  PerformanceConfig.init();
});

// Log summary on load complete
window.addEventListener("load", () => {
  setTimeout(() => {
    PerformanceConfig.logSummary();
  }, 1000);
});

// Cleanup on page unload
window.addEventListener("beforeunload", () => {
  PerformanceConfig.cleanup();
});

// Export for global use
window.PerformanceConfig = PerformanceConfig;

export default PerformanceConfig;
