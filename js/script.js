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
