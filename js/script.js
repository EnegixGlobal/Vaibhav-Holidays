// DOM Elements
const header = document.getElementById("header");
const hamburger = document.getElementById("hamburger");
const navMenu = document.getElementById("nav-menu");
const slides = document.querySelectorAll(".slide");
const indicators = document.querySelectorAll(".indicator");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const dropdownToggles = document.querySelectorAll(".dropdown-toggle");

// Variables
let currentSlide = 0;
let slideInterval;

// Initialize
document.addEventListener("DOMContentLoaded", function () {
  initializeSlider();
  initializeNavigation();
  initializeScrollEffect();
  initializeDropdowns();

  // Handle window resize
  window.addEventListener("resize", function () {
    // Recalculate dropdown positions on resize
    const dropdowns = document.querySelectorAll(".dropdown");
    dropdowns.forEach((dropdown) => {
      const menu = dropdown.querySelector(".dropdown-menu");
      if (menu) {
        menu.classList.remove("align-right");
      }
    });
  });
});

// Header scroll effect
function initializeScrollEffect() {
  window.addEventListener("scroll", function () {
    if (window.scrollY > 100) {
      header.classList.add("scrolled");
    } else {
      header.classList.remove("scrolled");
    }
  });
}

// Mobile Navigation
function initializeNavigation() {
  hamburger.addEventListener("click", function () {
    hamburger.classList.toggle("active");
    navMenu.classList.toggle("active");
    document.body.style.overflow = navMenu.classList.contains("active")
      ? "hidden"
      : "";
  });

  // Close mobile menu when clicking on a link (but not dropdown toggles)
  document
    .querySelectorAll(".nav-link:not(.dropdown-toggle)")
    .forEach((link) => {
      link.addEventListener("click", function () {
        hamburger.classList.remove("active");
        navMenu.classList.remove("active");
        document.body.style.overflow = "";
      });
    });

  // Close mobile menu when clicking outside
  document.addEventListener("click", function (e) {
    if (!navMenu.contains(e.target) && !hamburger.contains(e.target)) {
      hamburger.classList.remove("active");
      navMenu.classList.remove("active");
      document.body.style.overflow = "";
    }
  });
}

// Dropdown functionality
function initializeDropdowns() {
  // Add hover listeners for desktop dropdowns
  const dropdowns = document.querySelectorAll(".dropdown");

  dropdowns.forEach((dropdown) => {
    const menu = dropdown.querySelector(".dropdown-menu");

    dropdown.addEventListener("mouseenter", function () {
      if (window.innerWidth > 768) {
        // Check if dropdown would go off-screen
        const rect = dropdown.getBoundingClientRect();
        const menuWidth = 500; // min-width of dropdown
        const viewportWidth = window.innerWidth;

        // If dropdown would extend beyond right edge of viewport
        if (rect.left + menuWidth > viewportWidth) {
          menu.classList.add("align-right");
        } else {
          menu.classList.remove("align-right");
        }
      }
    });
  });

  dropdownToggles.forEach((toggle) => {
    toggle.addEventListener("click", function (e) {
      e.preventDefault();

      // For mobile devices
      if (window.innerWidth <= 768) {
        const dropdown = this.closest(".dropdown");
        dropdown.classList.toggle("active");

        // Close other dropdowns
        dropdownToggles.forEach((otherToggle) => {
          if (otherToggle !== this) {
            otherToggle.closest(".dropdown").classList.remove("active");
          }
        });
      }
    });
  });
}

// Slider functionality
function initializeSlider() {
  // Auto slide
  startAutoSlide();

  // Manual navigation
  prevBtn.addEventListener("click", previousSlide);
  nextBtn.addEventListener("click", nextSlide);

  // Indicator navigation
  indicators.forEach((indicator, index) => {
    indicator.addEventListener("click", () => goToSlide(index));
  });

  // Pause auto-slide on hover
  const heroSection = document.querySelector(".hero-section");
  heroSection.addEventListener("mouseenter", stopAutoSlide);
  heroSection.addEventListener("mouseleave", startAutoSlide);

  // Touch/swipe support
  let startX = 0;
  let endX = 0;

  heroSection.addEventListener("touchstart", function (e) {
    startX = e.touches[0].clientX;
  });

  heroSection.addEventListener("touchmove", function (e) {
    endX = e.touches[0].clientX;
  });

  heroSection.addEventListener("touchend", function () {
    if (startX - endX > 50) {
      nextSlide();
    } else if (endX - startX > 50) {
      previousSlide();
    }
  });

  // Keyboard navigation
  document.addEventListener("keydown", function (e) {
    if (e.key === "ArrowLeft") {
      previousSlide();
    } else if (e.key === "ArrowRight") {
      nextSlide();
    }
  });
}

function goToSlide(index) {
  // Remove active class from all slides and indicators
  slides.forEach((slide) => slide.classList.remove("active"));
  indicators.forEach((indicator) => indicator.classList.remove("active"));

  // Add active class to current slide and indicator
  slides[index].classList.add("active");
  indicators[index].classList.add("active");

  currentSlide = index;
}

function nextSlide() {
  const nextIndex = (currentSlide + 1) % slides.length;
  goToSlide(nextIndex);
}

function previousSlide() {
  const prevIndex = (currentSlide - 1 + slides.length) % slides.length;
  goToSlide(prevIndex);
}

function startAutoSlide() {
  stopAutoSlide(); // Clear any existing interval
  slideInterval = setInterval(nextSlide, 5000); // Change slide every 5 seconds
}

function stopAutoSlide() {
  if (slideInterval) {
    clearInterval(slideInterval);
  }
}

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute("href"));
    if (target) {
      const headerHeight = header.offsetHeight;
      const targetPosition = target.offsetTop - headerHeight;

      window.scrollTo({
        top: targetPosition,
        behavior: "smooth",
      });
    }
  });
});

// Intersection Observer for animations
const observerOptions = {
  threshold: 0.1,
  rootMargin: "0px 0px -50px 0px",
};

const observer = new IntersectionObserver(function (entries) {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.style.animationPlayState = "running";
    }
  });
}, observerOptions);

// Observe elements for animations
document
  .querySelectorAll(".hero-title, .hero-subtitle, .cta-button")
  .forEach((el) => {
    observer.observe(el);
  });

// Lazy loading for images
const imageObserver = new IntersectionObserver(function (entries) {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      const img = entry.target;
      if (img.dataset.src) {
        img.src = img.dataset.src;
        img.removeAttribute("data-src");
        imageObserver.unobserve(img);
      }
    }
  });
});

// Apply lazy loading to images (if you add data-src attributes)
document.querySelectorAll("img[data-src]").forEach((img) => {
  imageObserver.observe(img);
});

// Resize handler
window.addEventListener("resize", function () {
  // Close mobile menu on resize
  if (window.innerWidth > 768) {
    hamburger.classList.remove("active");
    navMenu.classList.remove("active");
    document.body.style.overflow = "";

    // Close all mobile dropdowns
    document.querySelectorAll(".dropdown").forEach((dropdown) => {
      dropdown.classList.remove("active");
    });
  }
});

// Preload next slide image
function preloadImages() {
  slides.forEach((slide, index) => {
    const img = slide.querySelector("img");
    if (img && !img.complete) {
      const preloadImg = new Image();
      preloadImg.src = img.src;
    }
  });
}

// Call preload function
preloadImages();

// Add loading state management
window.addEventListener("load", function () {
  document.body.classList.add("loaded");

  // Start animations after page load
  setTimeout(() => {
    document.querySelector(".hero-title").style.animationDelay = "0s";
    document.querySelector(".hero-subtitle").style.animationDelay = "0.2s";
    document.querySelector(".cta-button").style.animationDelay = "0.4s";
  }, 100);
});

// Performance optimization: Throttle scroll events
function throttle(func, limit) {
  let inThrottle;
  return function () {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

// Apply throttling to scroll event
window.addEventListener(
  "scroll",
  throttle(function () {
    if (window.scrollY > 100) {
      header.classList.add("scrolled");
    } else {
      header.classList.remove("scrolled");
    }
  }, 100)
);

// Error handling for images
document.querySelectorAll("img").forEach((img) => {
  img.addEventListener("error", function () {
    console.warn("Failed to load image:", this.src);
    // You can add a fallback image here
    // this.src = 'images/placeholder.jpg';
  });
});

// Accessibility improvements
document.addEventListener("keydown", function (e) {
  // ESC key closes mobile menu
  if (e.key === "Escape") {
    hamburger.classList.remove("active");
    navMenu.classList.remove("active");
    document.body.style.overflow = "";

    // Close dropdowns
    document.querySelectorAll(".dropdown").forEach((dropdown) => {
      dropdown.classList.remove("active");
    });
  }
});

// Focus management for accessibility
hamburger.addEventListener("keydown", function (e) {
  if (e.key === "Enter" || e.key === " ") {
    e.preventDefault();
    this.click();
  }
});

// Add ARIA attributes dynamically
function updateAriaAttributes() {
  hamburger.setAttribute("aria-expanded", navMenu.classList.contains("active"));

  indicators.forEach((indicator, index) => {
    indicator.setAttribute("aria-label", `Go to slide ${index + 1}`);
    indicator.setAttribute("aria-pressed", index === currentSlide);
  });
}

// Update ARIA attributes on state changes
const originalGoToSlide = goToSlide;
goToSlide = function (index) {
  originalGoToSlide(index);
  updateAriaAttributes();
};

// Initialize ARIA attributes
updateAriaAttributes();
