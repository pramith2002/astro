class ChapterNavigation {
  constructor() {
    this.config = {
      throttleDelay: 16,
      bufferDistance: 20,
      viewportOffset: 100,
    };

    this.elements = {
      header: null,
      chapterIndex: null,
      chapters: null,
      indexItems: null,
    };

    this.state = {
      headerHeight: 0,
      indexHeight: 0,
      lastActiveChapter: "",
      ticking: false,
    };
  }

  init() {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => this.setup());
    } else {
      this.setup();
    }
  }

  setup() {
    try {
      this.cacheElements();
      this.updateMeasurements();
      this.bindEvents();
      this.updateActiveChapter();

      console.log("📖 Chapter Navigation initialized");
    } catch (error) {
      console.error("❌ Chapter Navigation setup failed:", error);
    }
  }

  cacheElements() {
    this.elements.header = document.querySelector("header");
    this.elements.chapterIndex = document.querySelector(".chapter-index");
    this.elements.chapters = document.querySelectorAll(".chapter-row");
    this.elements.indexItems = document.querySelectorAll(".index-item");

    if (!this.elements.chapters.length || !this.elements.indexItems.length) {
      throw new Error("Required chapter elements not found");
    }
  }

  updateMeasurements() {
    this.state.headerHeight = this.elements.header
      ? this.elements.header.offsetHeight
      : 0;
    this.state.indexHeight = this.elements.chapterIndex
      ? this.elements.chapterIndex.offsetHeight
      : 0;
  }

  bindEvents() {

    document.addEventListener("click", (e) => this.handleAnchorClick(e));
    window.addEventListener(
      "scroll",
      this.throttle(() => this.handleScroll(), this.config.throttleDelay),
      {
        passive: true,
      }
    );
    window.addEventListener(
      "resize",
      this.throttle(() => this.handleResize(), 250)
    );
  }

  handleAnchorClick(e) {
    const anchor = e.target.closest('a[href^="#"]');
    if (!anchor) return;

    e.preventDefault();

    const targetId = anchor.getAttribute("href");
    if (targetId === "#") return;

    const targetElement = document.querySelector(targetId);
    if (!targetElement) return;

    this.scrollToChapter(targetElement);
  }

  scrollToChapter(targetElement) {
    const offset =
      this.state.headerHeight +
      this.state.indexHeight +
      this.config.bufferDistance;
    const targetPosition =
      targetElement.getBoundingClientRect().top + window.pageYOffset - offset;

    window.scrollTo({
      top: Math.max(0, targetPosition),
      behavior: "smooth",
    });
  }

  handleScroll() {
    if (!this.state.ticking) {
      requestAnimationFrame(() => this.updateActiveChapter());
      this.state.ticking = true;
    }
  }

  handleResize() {
    this.updateMeasurements();
  }

  updateActiveChapter() {
    if (!this.elements.chapters.length || !this.elements.indexItems.length) {
      this.state.ticking = false;
      return;
    }

    const scrollY = window.pageYOffset;
    const viewportTop =
      scrollY +
      this.state.headerHeight +
      this.state.indexHeight +
      this.config.viewportOffset;

    let currentChapter = "";
    let closestDistance = Infinity;


    this.elements.chapters.forEach((chapter) => {
      const chapterTop = chapter.getBoundingClientRect().top + scrollY;
      const distance = Math.abs(viewportTop - chapterTop);

      if (chapterTop <= viewportTop && distance < closestDistance) {
        closestDistance = distance;
        currentChapter = chapter.id;
      }
    });

    if (currentChapter && currentChapter !== this.state.lastActiveChapter) {
      this.updateIndexHighlight(currentChapter);
      this.state.lastActiveChapter = currentChapter;
    }

    this.state.ticking = false;
  }

  updateIndexHighlight(activeChapterId) {
    let activeIndexItem = null;


    this.elements.indexItems.forEach((item) => {
      const wasActive = item.classList.contains("active");
      const link = item.querySelector("a");
      const shouldBeActive =
        link && link.getAttribute("href") === "#" + activeChapterId;

      if (shouldBeActive !== wasActive) {
        item.classList.toggle("active", shouldBeActive);

        if (shouldBeActive) {
          activeIndexItem = item;
        }
      }
    });


    if (activeIndexItem && this.elements.chapterIndex) {
      this.scrollIndexToActiveItem(activeIndexItem);
    }
  }

  scrollIndexToActiveItem(activeItem) {
    const indexRect = this.elements.chapterIndex.getBoundingClientRect();
    const itemRect = activeItem.getBoundingClientRect();

    const isVisible =
      itemRect.left >= indexRect.left && itemRect.right <= indexRect.right;

    if (!isVisible) {
      activeItem.scrollIntoView({
        behavior: "smooth",
        inline: "center",
        block: "nearest",
      });
    }
  }


  throttle(func, limit) {
    let inThrottle;
    return function (...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  }

  scrollToChapterById(chapterId) {
    const chapter = document.getElementById(chapterId);
    if (chapter) {
      this.scrollToChapter(chapter);
    }
  }

  getCurrentChapter() {
    return this.state.lastActiveChapter;
  }

  getChapterProgress() {
    if (!this.elements.chapters.length) return 0;

    const currentIndex = Array.from(this.elements.chapters).findIndex(
      (chapter) => chapter.id === this.state.lastActiveChapter
    );

    return currentIndex >= 0
      ? ((currentIndex + 1) / this.elements.chapters.length) * 100
      : 0;
  }
}


const chapterNav = new ChapterNavigation();
chapterNav.init();

window.ChapterNavigation = chapterNav;
