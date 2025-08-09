// Layout Manager - Include Header and Footer
class LayoutManager {
  static async loadComponent(elementId, componentPath) {
    try {
      const response = await fetch(componentPath);
      if (!response.ok) {
        throw new Error(`Failed to load ${componentPath}`);
      }
      const html = await response.text();
      const element = document.getElementById(elementId);
      if (element) {
        element.innerHTML = html;
      }
    } catch (error) {
      console.error("Error loading component:", error);
    }
  }

  static async init() {
    // Load header and footer
    await Promise.all([
      this.loadComponent("header-placeholder", "includes/header.html"),
      this.loadComponent("footer-placeholder", "includes/footer.html"),
    ]);

    // Wait a bit for DOM to be ready, then initialize navigation
    setTimeout(() => {
      this.initNavigation();
    }, 100);
  }

  static initNavigation() {
    console.log('Initializing navigation...');
    
    // Mobile menu toggle - using hamburger button like in main page
    const hamburger = document.getElementById("hamburger");
    const navOverlay = document.getElementById("nav-overlay");
    const navCloseBtn = document.getElementById("nav-close-btn");

    // Force hamburger visibility on mobile using CSS class
    const updateHamburgerVisibility = () => {
      if (hamburger) {
        const isMobile = window.innerWidth <= 991;
        if (isMobile) {
          hamburger.style.display = 'flex';
          hamburger.style.flexDirection = 'column';
          hamburger.style.justifyContent = 'center';
          hamburger.style.alignItems = 'center';
        } else {
          hamburger.style.display = 'none';
        }
        console.log('Mobile check:', isMobile, 'Hamburger display:', hamburger.style.display);
      }
    };
    
    // Initial setup
    updateHamburgerVisibility();
    
    if (hamburger) {
      hamburger.addEventListener("click", () => {
        console.log('Hamburger clicked');
        if (navOverlay) {
          navOverlay.classList.add("active");
          document.body.style.overflow = "hidden";
        }
      });
    }

    if (navCloseBtn && navOverlay) {
      navCloseBtn.addEventListener("click", () => {
        navOverlay.classList.remove("active");
        document.body.style.overflow = "";
      });
    }

    // Close mobile menu when clicking outside
    if (navOverlay) {
      navOverlay.addEventListener("click", (e) => {
        if (e.target === navOverlay) {
          navOverlay.classList.remove("active");
          document.body.style.overflow = "";
        }
      });
    }

    // Handle window resize to show/hide hamburger
    window.addEventListener("resize", updateHamburgerVisibility);

    // Dropdown functionality
    const dropdownToggles = document.querySelectorAll(".dropdown-toggle");
    dropdownToggles.forEach((toggle) => {
      toggle.addEventListener("click", (e) => {
        e.preventDefault();
        const dropdown = toggle.parentElement;
        dropdown.classList.toggle("active");
      });
    });

    // Header scroll effect
    const header = document.getElementById("header");
    if (header) {
      // Ensure header starts transparent
      header.classList.remove("scrolled");

      window.addEventListener("scroll", () => {
        if (window.scrollY > 200) {
          header.classList.add("scrolled");
        } else {
          header.classList.remove("scrolled");
        }
      });

      // Also check on page load to ensure correct state
      if (window.scrollY > 200) {
        header.classList.add("scrolled");
      } else {
        header.classList.remove("scrolled");
      }
    }

    // Smooth scrolling for anchor links
    const anchorLinks = document.querySelectorAll('a[href^="#"]');
    anchorLinks.forEach((link) => {
      link.addEventListener("click", (e) => {
        const href = link.getAttribute("href");
        if (href !== "#" && href.length > 1) {
          const target = document.querySelector(href);
          if (target) {
            e.preventDefault();
            const headerHeight = header ? header.offsetHeight : 0;
            const targetPosition = target.offsetTop - headerHeight;

            window.scrollTo({
              top: targetPosition,
              behavior: "smooth",
            });

            // Close mobile menu if open
            if (navOverlay && navOverlay.classList.contains("active")) {
              navOverlay.classList.remove("active");
              document.body.style.overflow = "";
            }
          }
        }
      });
    });
  }
}

// Initialize layout when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  LayoutManager.init();
});
