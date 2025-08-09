const header = document.getElementById("header");
const hamburger = document.getElementById("hamburger");
const navOverlay = document.getElementById("nav-overlay");
const navMenu = document.getElementById("nav-menu");
const slides = document.querySelectorAll(".slide");
const indicators = document.querySelectorAll(".indicator");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const dropdownToggles = document.querySelectorAll(".dropdown-toggle");

let currentSlide = 0;
let slideInterval;

document.addEventListener("DOMContentLoaded", function () {
  initializeSlider();
  initializeNavigation();
  initializeScrollEffect();
  initializeDropdowns();

  window.addEventListener("resize", function () {
    if (window.innerWidth > 768) {
      navOverlay.classList.remove("active");
      document.body.style.overflow = "";
    }
  });
});

function initializeScrollEffect() {
  window.addEventListener("scroll", function () {
    if (window.scrollY > 100) {
      header.classList.add("scrolled");
    } else {
      header.classList.remove("scrolled");
    }
  });
}

function initializeNavigation() {
  const navCloseBtn = document.getElementById("nav-close-btn");

  hamburger.addEventListener("click", function () {
    const isActive = navOverlay.classList.toggle("active");
    hamburger.classList.toggle("active");
    document.body.style.overflow = isActive ? "hidden" : "";
    updateAriaAttributes();
  });

  // Close button functionality
  navCloseBtn.addEventListener("click", function () {
    navOverlay.classList.remove("active");
    hamburger.classList.remove("active");
    document.body.style.overflow = "";
    updateAriaAttributes();
  });

  document.querySelectorAll(".nav-link").forEach((link) => {
    link.addEventListener("click", function (e) {
      // Don't close menu if this is a dropdown toggle
      if (this.classList.contains("dropdown-toggle")) {
        return;
      }

      navOverlay.classList.remove("active");
      hamburger.classList.remove("active");
      document.body.style.overflow = "";
      updateAriaAttributes();
    });
  });

  document.addEventListener("click", function (e) {
    if (!navOverlay.contains(e.target) && !hamburger.contains(e.target)) {
      navOverlay.classList.remove("active");
      hamburger.classList.remove("active");
      document.body.style.overflow = "";
      updateAriaAttributes();
    }
  });
}

function initializeDropdowns() {
  dropdownToggles.forEach((toggle) => {
    toggle.addEventListener("click", function (e) {
      e.preventDefault();
      const dropdown = this.closest(".dropdown");
      const isActive = dropdown.classList.toggle("active");
      toggle.setAttribute("aria-expanded", isActive);

      dropdownToggles.forEach((otherToggle) => {
        if (otherToggle !== this) {
          otherToggle.closest(".dropdown").classList.remove("active");
          otherToggle.setAttribute("aria-expanded", "false");
        }
      });
    });
  });
}

function initializeSlider() {
  startAutoSlide();
  prevBtn.addEventListener("click", previousSlide);
  nextBtn.addEventListener("click", nextSlide);

  indicators.forEach((indicator, index) => {
    indicator.addEventListener("click", () => goToSlide(index));
  });

  const heroSection = document.querySelector(".hero-section");

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

  document.addEventListener("keydown", function (e) {
    if (e.key === "ArrowLeft") {
      previousSlide();
    } else if (e.key === "ArrowRight") {
      nextSlide();
    }
  });
}

function goToSlide(index) {
  slides.forEach((slide) => slide.classList.remove("active"));
  indicators.forEach((indicator) => indicator.classList.remove("active"));

  slides[index].classList.add("active");
  indicators[index].classList.add("active");

  currentSlide = index;
  updateAriaAttributes();
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
  stopAutoSlide();
  slideInterval = setInterval(nextSlide, 3500);
}

function stopAutoSlide() {
  if (slideInterval) {
    clearInterval(slideInterval);
  }
}

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

document
  .querySelectorAll(".hero-title, .hero-subtitle, .cta-button")
  .forEach((el) => {
    observer.observe(el);
  });

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

document.querySelectorAll("img[data-src]").forEach((img) => {
  imageObserver.observe(img);
});

function preloadImages() {
  slides.forEach((slide, index) => {
    const img = slide.querySelector("img");
    if (img && !img.complete) {
      const preloadImg = new Image();
      preloadImg.src = img.src;
    }
  });
}

preloadImages();

window.addEventListener("load", function () {
  document.body.classList.add("loaded");

  setTimeout(() => {
    document.querySelector(".hero-title").style.animationDelay = "0s";
    document.querySelector(".hero-subtitle").style.animationDelay = "0.2s";
    document.querySelector(".cta-button").style.animationDelay = "0.4s";
  }, 100);
});

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

document.querySelectorAll("img").forEach((img) => {
  img.addEventListener("error", function () {
    console.warn("Failed to load image:", this.src);
  });
});

document.addEventListener("keydown", function (e) {
  if (e.key === "Escape") {
    navOverlay.classList.remove("active");
    hamburger.classList.remove("active");
    document.body.style.overflow = "";
    updateAriaAttributes();
  }
});

hamburger.addEventListener("keydown", function (e) {
  if (e.key === "Enter" || e.key === " ") {
    e.preventDefault();
    this.click();
  }
});

function updateAriaAttributes() {
  hamburger.setAttribute(
    "aria-expanded",
    navOverlay.classList.contains("active")
  );
  indicators.forEach((indicator, index) => {
    indicator.setAttribute("aria-label", `Go to slide ${index + 1}`);
    indicator.setAttribute("aria-pressed", index === currentSlide);
  });
}

const originalGoToSlide = goToSlide;
goToSlide = function (index) {
  originalGoToSlide(index);
  updateAriaAttributes();
};

updateAriaAttributes();

// Gallery Lightbox Functionality
let currentGalleryIndex = 0;
const galleryItems = document.querySelectorAll(
  ".gallery-item, .itinerary-item"
);
const lightbox = document.getElementById("lightbox");
const lightboxImage = document.getElementById("lightbox-image");
const lightboxTitle = document.getElementById("lightbox-title");
const lightboxClose = document.querySelector(".lightbox-close");
const lightboxPrev = document.getElementById("lightbox-prev");
const lightboxNext = document.getElementById("lightbox-next");

// Function to detect mobile devices
function isMobileDevice() {
  return (
    window.innerWidth <= 768 ||
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    )
  );
}

// Initialize gallery
function initializeGallery() {
  galleryItems.forEach((item, index) => {
    // Only add lightbox functionality if not mobile
    if (!isMobileDevice()) {
      item.addEventListener("click", () => {
        currentGalleryIndex = index;
        openLightbox();
      });

      // Make gallery items keyboard accessible
      item.setAttribute("tabindex", "0");
      item.setAttribute("role", "button");
      item.setAttribute("aria-label", `View ${item.dataset.title} in lightbox`);

      item.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          currentGalleryIndex = index;
          openLightbox();
        }
      });
    } else {
      // For mobile, remove any cursor pointer styles and interactive attributes
      item.style.cursor = "default";
      item.removeAttribute("tabindex");
      item.removeAttribute("role");
      item.removeAttribute("aria-label");
    }
  });
}

function openLightbox() {
  const currentItem = galleryItems[currentGalleryIndex];
  const imageSrc = currentItem.dataset.image;
  const imageTitle = currentItem.dataset.title;

  lightboxImage.src = imageSrc;
  lightboxImage.alt = imageTitle;
  lightboxTitle.textContent = imageTitle;

  lightbox.style.display = "block";
  document.body.style.overflow = "hidden";

  // Focus management
  lightboxClose.focus();
}

function closeLightbox() {
  lightbox.style.display = "none";
  document.body.style.overflow = "";

  // Return focus to the gallery item that was clicked
  galleryItems[currentGalleryIndex].focus();
}

function showPrevImage() {
  currentGalleryIndex =
    (currentGalleryIndex - 1 + galleryItems.length) % galleryItems.length;
  updateLightboxImage();
}

function showNextImage() {
  currentGalleryIndex = (currentGalleryIndex + 1) % galleryItems.length;
  updateLightboxImage();
}

function updateLightboxImage() {
  const currentItem = galleryItems[currentGalleryIndex];
  const imageSrc = currentItem.dataset.image;
  const imageTitle = currentItem.dataset.title;

  lightboxImage.src = imageSrc;
  lightboxImage.alt = imageTitle;
  lightboxTitle.textContent = imageTitle;
}

// Event listeners for lightbox (only on non-mobile)
if (!isMobileDevice()) {
  lightboxClose.addEventListener("click", closeLightbox);
  lightboxPrev.addEventListener("click", showPrevImage);
  lightboxNext.addEventListener("click", showNextImage);

  // Close lightbox when clicking outside the image
  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox) {
      closeLightbox();
    }
  });

  // Keyboard navigation
  document.addEventListener("keydown", (e) => {
    if (lightbox.style.display === "block") {
      switch (e.key) {
        case "Escape":
          closeLightbox();
          break;
        case "ArrowLeft":
          showPrevImage();
          break;
        case "ArrowRight":
          showNextImage();
          break;
      }
    }
  });
}

// Initialize gallery when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  initializeGallery();
});

// Re-initialize gallery on window resize to handle device orientation changes
window.addEventListener("resize", () => {
  // Close lightbox if it's open and device becomes mobile
  if (isMobileDevice() && lightbox.style.display === "block") {
    closeLightbox();
  }

  // Re-initialize gallery with new device detection
  initializeGallery();
});

// Testimonials Auto-Slider Functionality
let currentTestimonial = 0;
let testimonialInterval;
let testimonialItems;
let testimonialTrack;

function initializeTestimonials() {
  // Refresh the testimonial elements
  testimonialItems = document.querySelectorAll(".testimonial-item");
  testimonialTrack = document.getElementById("testimonialTrack");

  if (testimonialItems.length === 0) {
    console.log("No testimonial items found");
    return;
  }

  console.log(
    "Initializing testimonials with",
    testimonialItems.length,
    "items"
  );

  // Show first testimonial
  showTestimonial(0);

  // Start auto-sliding
  startTestimonialSlider();
}

function showTestimonial(index) {
  // Remove active class from all testimonials
  testimonialItems.forEach((item) => item.classList.remove("active"));

  // Add active class to current testimonial
  if (testimonialItems[index]) {
    testimonialItems[index].classList.add("active");
  }

  // Update transform position
  const translateX = -index * 100;
  testimonialTrack.style.transform = `translateX(${translateX}%)`;
}

function nextTestimonial() {
  currentTestimonial = (currentTestimonial + 1) % testimonialItems.length;
  showTestimonial(currentTestimonial);
}

function startTestimonialSlider() {
  // Clear any existing interval
  if (testimonialInterval) {
    clearInterval(testimonialInterval);
  }

  // Start new interval for auto-sliding every 4 seconds
  testimonialInterval = setInterval(nextTestimonial, 4000);
}

// Initialize testimonials when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  initializeTestimonials();
});
