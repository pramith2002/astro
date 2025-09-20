
// =======================
// Core Configuration
// =======================
const CONFIG = {
  scroll: {
    headerOffset: 90,
    smoothBehavior: "smooth",
    throttleDelay: 16,
  },
  animation: {
    fadeInDelay: 0.2,
    intersectionThreshold: 0.1,
  },
  carousel: {
    autoPlayInterval: 4000,
    swipeThreshold: 50,
  },
};

// =======================
// Utility Functions
// =======================
const Utils = {
  throttle(func, limit) {
    let inThrottle;
    return function (...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  },

  debounce(func, wait) {
    let timeout;
    return function (...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  },

  getItemsToShow() {
    if (window.innerWidth < 576) return 1;
    if (window.innerWidth < 992) return 2;
    return 3;
  },

  smoothScrollTo(target, offset = CONFIG.scroll.headerOffset) {
    if (!target) return;

    const targetPosition =
      target.getBoundingClientRect().top + window.pageYOffset - offset;
    window.scrollTo({
      top: Math.max(0, targetPosition),
      behavior: CONFIG.scroll.smoothBehavior,
    });
  },

  // Device performance detection
  isLowPerformanceDevice() {
    const canvas = document.createElement("canvas");
    const gl =
      canvas.getContext("webgl") || canvas.getContext("experimental-webgl");

    if (!gl) return true;

    const renderer = gl.getParameter(gl.RENDERER);
    const vendor = gl.getParameter(gl.VENDOR);

    // Basic performance heuristics
    const isMobile = /Mobi|Android/i.test(navigator.userAgent);
    const isLowEndGPU = /Mali|PowerVR|Adreno 3|Adreno 4/i.test(renderer);
    const hasLimitedMemory =
      navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4;

    return isMobile && (isLowEndGPU || hasLimitedMemory);
  },
};

// =======================
// Mobile Navigation Module
// =======================
const MobileNav = {
  init() {
    this.menuBtn = document.querySelector(".mobile-menu-btn");
    this.navMenu = document.querySelector("nav ul");
    this.navLinks = document.querySelectorAll("nav ul li a");

    if (this.menuBtn && this.navMenu) {
      this.bindEvents();
    }
  },

  bindEvents() {
    this.menuBtn.addEventListener("click", () => this.toggleMenu());

    // Close menu when clicking outside
    document.addEventListener("click", (e) => {
      if (!e.target.closest("nav") && !e.target.closest(".mobile-menu-btn")) {
        this.closeMenu();
      }
    });

    // Close menu when clicking a menu link
    this.navLinks.forEach((link) => {
      link.addEventListener("click", () => this.closeMenu());
    });
  },

  toggleMenu() {
    this.navMenu.classList.toggle("show");
  },

  closeMenu() {
    this.navMenu.classList.remove("show");
  },
};

// =======================
// Smooth Scrolling Module
// =======================
const SmoothScroll = {
  init() {
    this.bindEvents();
    this.handleInitialHash();
  },

  bindEvents() {
    const links = document.querySelectorAll('a[href^="/#"], a[href^="#"]');

    links.forEach((link) => {
      link.addEventListener("click", (e) => this.handleLinkClick(e, link));
    });
  },

  handleLinkClick(e, link) {
    const href = link.getAttribute("href");
    const targetId = href.split("#")[1];
    const isHomePage = window.location.pathname === "/";

    if (window.location.hash === href || (isHomePage && targetId)) {
      e.preventDefault();
      MobileNav.closeMenu();

      const target = document.getElementById(targetId);
      if (target) {
        Utils.smoothScrollTo(target);
      }
    }
  },

  handleInitialHash() {
    if (window.location.hash) {
      const targetId = window.location.hash.substring(1);
      const target = document.getElementById(targetId);

      if (target) {
        setTimeout(() => Utils.smoothScrollTo(target), 300);
      }
    }
  },
};

// =======================
// Animation Observer Module
// =======================
const AnimationObserver = {
  init() {
    this.createObserver();
    this.observeElements();
  },

  createObserver() {
    this.observer = new IntersectionObserver(
      (entries) => this.handleIntersection(entries),
      {
        root: null,
        rootMargin: "0px",
        threshold: CONFIG.animation.intersectionThreshold,
      }
    );
  },

  handleIntersection(entries) {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.style.animation = `fadeInUp 1s ease forwards`;
        this.observer.unobserve(entry.target);
      }
    });
  },

  observeElements() {
    document.querySelectorAll("section, .card").forEach((element) => {
      element.style.opacity = "0";
      this.observer.observe(element);
    });
  },
};

// =======================
// Lightbox Module
// =======================
const Lightbox = {
  init() {
    this.images = document.querySelectorAll(".gallery-item img");
    if (this.images.length === 0) return;

    this.currentIndex = 0;
    this.createLightbox();
    this.bindEvents();
  },

  createLightbox() {
    this.lightbox = document.createElement("div");
    this.lightbox.classList.add("lightbox");
    this.lightbox.innerHTML = `
            <span class="close">&times;</span>
            <span class="arrow left">&#10094;</span>
            <img src="" alt="Full Image">
            <span class="arrow right">&#10095;</span>
        `;
    document.body.appendChild(this.lightbox);
    this.lightboxImg = this.lightbox.querySelector("img");
  },

  bindEvents() {
    // Image click events
    this.images.forEach((img, index) => {
      img.addEventListener("click", () => this.showImage(index));
    });

    // Lightbox controls
    this.lightbox
      .querySelector(".close")
      .addEventListener("click", () => this.hide());
    this.lightbox
      .querySelector(".arrow.left")
      .addEventListener("click", () => this.previous());
    this.lightbox
      .querySelector(".arrow.right")
      .addEventListener("click", () => this.next());

    // Click outside to close
    this.lightbox.addEventListener("click", (e) => {
      if (e.target === this.lightbox) this.hide();
    });

    // Keyboard navigation
    document.addEventListener("keydown", (e) => this.handleKeydown(e));
  },

  showImage(index) {
    this.currentIndex = index;
    const fullSrc = this.images[index].dataset.full || this.images[index].src;

    this.lightboxImg.style.opacity = "0";
    setTimeout(() => {
      this.lightboxImg.src = fullSrc;
      this.lightboxImg.onload = () => {
        this.lightboxImg.style.opacity = "1";
      };
    }, 200);

    this.lightbox.classList.add("show");
  },

  hide() {
    this.lightbox.classList.remove("show");
  },

  next() {
    this.currentIndex = (this.currentIndex + 1) % this.images.length;
    this.showImage(this.currentIndex);
  },

  previous() {
    this.currentIndex =
      (this.currentIndex - 1 + this.images.length) % this.images.length;
    this.showImage(this.currentIndex);
  },

  handleKeydown(e) {
    if (!this.lightbox.classList.contains("show")) return;

    switch (e.key) {
      case "Escape":
        this.hide();
        break;
      case "ArrowLeft":
        this.previous();
        break;
      case "ArrowRight":
        this.next();
        break;
    }
  },
};

// =======================
// Carousel Module
// =======================
const Carousel = {
  init() {
    this.initGalleryCarousel();
    this.initChaptersCarousel();
    this.initServicesCarousel();
  },

  initGalleryCarousel() {
    const section = document.querySelector("#index-gallery");
    if (!section) return;

    this.createCarouselInstance(section, ".carousel");
  },

  initChaptersCarousel() {
    const section = document.querySelector("#chapters");
    if (!section) return;

    this.createCarouselInstance(
      section,
      ".chapters-carousel",
      ".chapters-carousel-item"
    );
  },

  initServicesCarousel() {
    const section = document.querySelector("#services");
    if (!section) return;

    this.createCarouselInstance(
      section,
      ".services-carousel",
      ".services-carousel-item"
    );
  },

  createCarouselInstance(
    section,
    carouselSelector,
    itemSelector = ".carousel-item"
  ) {
    const carousel = section.querySelector(carouselSelector);
    const items = section.querySelectorAll(itemSelector);
    const prevBtn = section.querySelector(
      ".prev-btn, .chapters-carousel-btn.prev-btn"
    );
    const nextBtn = section.querySelector(
      ".next-btn, .chapters-carousel-btn.next-btn"
    );
    const dotsContainer = section.querySelector(
      ".carousel-dots, .chapters-carousel-dots"
    );

    if (!carousel || !items.length) return;

    const instance = new CarouselInstance(
      carousel,
      items,
      prevBtn,
      nextBtn,
      dotsContainer
    );
    instance.init();
  },
};

// =======================
// Carousel Instance Class
// =======================
class CarouselInstance {
  constructor(carousel, items, prevBtn, nextBtn, dotsContainer) {
    this.carousel = carousel;
    this.items = items;
    this.prevBtn = prevBtn;
    this.nextBtn = nextBtn;
    this.dotsContainer = dotsContainer;
    this.currentIndex = 0;
    this.itemsToShow = Utils.getItemsToShow();
    this.autoPlayInterval = null;
    this.touchStartX = 0;
    this.touchEndX = 0;
  }

  init() {
    this.updateItemsToShow();
    this.createDots();
    this.bindEvents();
    this.updateCarousel();
    this.startAutoPlay();
  }

  updateItemsToShow() {
    this.itemsToShow = Utils.getItemsToShow();
    this.items.forEach((item) => {
      item.style.flex = `0 0 calc(100% / ${this.itemsToShow})`;
    });
  }

  createDots() {
    if (!this.dotsContainer) return;

    this.dotsContainer.innerHTML = "";
    const totalSlides = Math.max(1, this.items.length - this.itemsToShow + 1);

    for (let i = 0; i < totalSlides; i++) {
      const dot = document.createElement("span");
      dot.classList.add("dot", "chapters-dot");
      if (i === this.currentIndex) dot.classList.add("active");
      dot.setAttribute("data-index", i);
      this.dotsContainer.appendChild(dot);

      dot.addEventListener("click", () => {
        this.currentIndex = parseInt(dot.getAttribute("data-index"));
        this.updateCarousel();
        this.resetAutoPlay();
      });
    }
  }

  bindEvents() {
    // Navigation buttons
    if (this.prevBtn) {
      this.prevBtn.addEventListener("click", () => this.previous());
    }
    if (this.nextBtn) {
      this.nextBtn.addEventListener("click", () => this.next());
    }

    // Touch/swipe events
    this.carousel.addEventListener("touchstart", (e) =>
      this.handleTouchStart(e)
    );
    this.carousel.addEventListener("touchend", (e) => this.handleTouchEnd(e));

    // Pause autoplay on hover
    this.carousel.addEventListener("mouseenter", () => this.stopAutoPlay());
    this.carousel.addEventListener("mouseleave", () => this.startAutoPlay());

    // Resize handler
    window.addEventListener(
      "resize",
      Utils.debounce(() => this.handleResize(), 250)
    );
  }

  updateCarousel() {
    const translateX = -this.currentIndex * (100 / this.itemsToShow);
    this.carousel.style.transform = `translateX(${translateX}%)`;

    // Update dots
    if (this.dotsContainer) {
      this.dotsContainer
        .querySelectorAll(".dot, .chapters-dot")
        .forEach((dot, index) => {
          dot.classList.toggle("active", index === this.currentIndex);
        });
    }

    // Update button visibility
    const maxIndex = Math.max(0, this.items.length - this.itemsToShow);
    if (this.prevBtn) {
      this.prevBtn.style.visibility =
        this.currentIndex === 0 ? "hidden" : "visible";
    }
    if (this.nextBtn) {
      this.nextBtn.style.visibility =
        this.currentIndex === maxIndex ? "hidden" : "visible";
    }
  }

  next() {
    const maxIndex = Math.max(0, this.items.length - this.itemsToShow);
    if (this.currentIndex < maxIndex) {
      this.currentIndex++;
      this.updateCarousel();
      this.resetAutoPlay();
    }
  }

  previous() {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      this.updateCarousel();
      this.resetAutoPlay();
    }
  }

  startAutoPlay() {
    this.autoPlayInterval = setInterval(() => {
      const maxIndex = Math.max(0, this.items.length - this.itemsToShow);
      if (this.currentIndex < maxIndex) {
        this.currentIndex++;
      } else {
        this.currentIndex = 0;
      }
      this.updateCarousel();
    }, CONFIG.carousel.autoPlayInterval);
  }

  stopAutoPlay() {
    if (this.autoPlayInterval) {
      clearInterval(this.autoPlayInterval);
      this.autoPlayInterval = null;
    }
  }

  resetAutoPlay() {
    this.stopAutoPlay();
    this.startAutoPlay();
  }

  handleTouchStart(e) {
    this.touchStartX = e.changedTouches[0].screenX;
    this.stopAutoPlay();
  }

  handleTouchEnd(e) {
    this.touchEndX = e.changedTouches[0].screenX;
    this.handleSwipe();
    this.resetAutoPlay();
  }

  handleSwipe() {
    const diff = this.touchStartX - this.touchEndX;

    if (Math.abs(diff) < CONFIG.carousel.swipeThreshold) return;

    if (diff > 0) {
      this.next();
    } else {
      this.previous();
    }
  }

  handleResize() {
    const oldItemsToShow = this.itemsToShow;
    this.updateItemsToShow();

    if (oldItemsToShow !== this.itemsToShow) {
      this.createDots();
      const maxIndex = Math.max(0, this.items.length - this.itemsToShow);
      if (this.currentIndex > maxIndex) {
        this.currentIndex = maxIndex;
      }
      this.updateCarousel();
      this.resetAutoPlay();
    }
  }
}

// =======================
// Typing Effect Module
// =======================
const TypingEffect = {
  init() {
    const typingElement = document.getElementById("typing-text");
    if (!typingElement) return;

    const text =
      "Unlock the ancient wisdom written on palm leaves centuries ago. Reveal your true purpose and navigate life's journey with clarity.";
    this.startTyping(typingElement, text);
  },

  startTyping(element, text) {
    let i = 0;
    const typeWriter = () => {
      if (i < text.length) {
        element.innerHTML =
          text.substring(0, i + 1) + '<span class="cursor"></span>';
        i++;
        requestAnimationFrame(() => {
          setTimeout(typeWriter, 30);
        });
      } else {
        element.textContent = text;
      }
    };
    setTimeout(typeWriter, 50);
  },
};

// Set index custom properties so CSS can compute angles
document.querySelectorAll(".circle.outer .item").forEach((el, i) => {
  el.style.setProperty("--i", i);
});
document.querySelectorAll(".circle.inner .item").forEach((el, i) => {
  el.style.setProperty("--i", i);
});

// =======================
// Main Application
// =======================
const App = {
  init() {
    document.addEventListener("DOMContentLoaded", () => {
      this.initializeModules();
    });
  },

  initializeModules() {
    try {
      // Initialize core modules first
      MobileNav.init();
      SmoothScroll.init();
      AnimationObserver.init();
      Lightbox.init();
      Carousel.init();
      TypingEffect.init();
      console.log("Application initialized successfully");
    } catch (error) {
      console.error("Error initializing application:", error);
    }
  },
};

// Start the application
App.init();

// Export for potential use in other modules
window.NadiApp = {
  CONFIG,
  Utils,
  MobileNav,
  SmoothScroll,
  AnimationObserver,
  Lightbox,
  Carousel,
  TypingEffect,
  App,
};
