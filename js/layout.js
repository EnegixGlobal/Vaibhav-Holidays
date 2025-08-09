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

        // Fix navigation links after loading header
        if (elementId === "header-placeholder") {
          this.fixNavigationLinks();
        }
      }
    } catch (error) {
      console.error("Error loading component:", error);
    }
  }

  static fixNavigationLinks() {
    // Determine context
    const path = window.location.pathname || "";
    const isHomepage = /(?:^|\/)index\.html$/.test(path) || /\/$/.test(path);
    const inSubdir = /\/(?:iti)\//.test(path);

    // Helper to prefix paths correctly from subdirectories
    const prefix = inSubdir ? "../" : "";

    // 1) Convert in-page anchors to index anchors when not on homepage
    const anchorTargets = [
      "about",
      "gallery",
      "tariff",
      "contact",
      "home",
      "itinerary",
    ];
    anchorTargets.forEach((id) => {
      const selector = `a[href="#${id}"]`;
      document.querySelectorAll(selector).forEach((a) => {
        if (!isHomepage) {
          a.setAttribute("href", `${prefix}index.html#${id}`);
        }
      });
    });

    // 2) Handle any legacy About Us links that point to about.html -> map appropriately
    document.querySelectorAll('a[href="about.html"]').forEach((a) => {
      a.setAttribute(
        "href",
        isHomepage ? "#about" : `${prefix}index.html#about`
      );
    });

    // 3) Wire itinerary links declared via data-nav-href
    document.querySelectorAll("a[data-nav-href]").forEach((a) => {
      const target = a.getAttribute("data-nav-href");
      if (target) {
        a.setAttribute("href", `${prefix}${target}`);
      }
    });

    // 4) Fix image src paths inside header/footer when on subpages
    if (inSubdir) {
      const container = document;
      container
        .querySelectorAll("#header-placeholder img, #footer-placeholder img")
        .forEach((img) => {
          const src = img.getAttribute("src") || "";
          if (src.startsWith("images/")) {
            img.setAttribute("src", `${prefix}${src}`);
          }
        });
    }
  }

  static async init() {
    // Compute include paths relative to current location
    const path = window.location.pathname || "";
    const inSubdir = /\/(?:iti)\//.test(path);
    const prefix = inSubdir ? "../" : "";

    // Ensure core site CSS is present (for header/footer styling)
    const addStylesheet = (id, href, isAbsolute = false) => {
      if (document.getElementById(id)) return;
      const link = document.createElement("link");
      link.id = id;
      link.rel = "stylesheet";
      link.href = isAbsolute ? href : `${prefix}${href}`;
      document.head.appendChild(link);
    };

    // Local site styles for header/footer
    addStylesheet("vh-style", "css/style.css");
    addStylesheet("vh-responsive", "css/responsive.css");

    // Helpful: icons + fonts used by header/footer (only if not already present)
    addStylesheet(
      "vh-fa",
      "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css",
      true
    );
    addStylesheet(
      "vh-fonts",
      "https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap",
      true
    );

    // Ensure placeholders exist
    if (!document.getElementById("header-placeholder")) {
      const headerDiv = document.createElement("div");
      headerDiv.id = "header-placeholder";
      document.body.insertBefore(headerDiv, document.body.firstChild);
    }
    if (!document.getElementById("footer-placeholder")) {
      const footerDiv = document.createElement("div");
      footerDiv.id = "footer-placeholder";
      document.body.appendChild(footerDiv);
    }

    // Load header and footer
    await Promise.all([
      this.loadComponent("header-placeholder", `${prefix}includes/header.html`),
      this.loadComponent("footer-placeholder", `${prefix}includes/footer.html`),
    ]);

    // Ensure links and asset paths are corrected after both components are present
    this.fixNavigationLinks();

    // Wait a bit for DOM to be ready, then initialize navigation
    setTimeout(() => {
      this.initNavigation();
    }, 100);
  }

  static initNavigation() {
    console.log("Initializing navigation...");

    // Mobile menu toggle - using hamburger button like in main page
    const hamburger = document.getElementById("hamburger");
    const navOverlay = document.getElementById("nav-overlay");
    const navCloseBtn = document.getElementById("nav-close-btn");

    // Force hamburger visibility on mobile using CSS class
    const updateHamburgerVisibility = () => {
      if (hamburger) {
        const isMobile = window.innerWidth <= 991;
        if (isMobile) {
          hamburger.style.display = "flex";
          hamburger.style.flexDirection = "column";
          hamburger.style.justifyContent = "center";
          hamburger.style.alignItems = "center";
        } else {
          hamburger.style.display = "none";
        }
        console.log(
          "Mobile check:",
          isMobile,
          "Hamburger display:",
          hamburger.style.display
        );
      }
    };

    // Initial setup
    updateHamburgerVisibility();

    if (hamburger) {
      hamburger.addEventListener("click", () => {
        console.log("Hamburger clicked");
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

    // Close mobile menu when clicking navigation links
    const navLinks = document.querySelectorAll(".nav-overlay .nav-link");
    navLinks.forEach((link) => {
      link.addEventListener("click", (e) => {
        // If it's a regular link (not dropdown toggle), close the menu
        if (!link.classList.contains("dropdown-toggle")) {
          if (navOverlay) {
            navOverlay.classList.remove("active");
            document.body.style.overflow = "";
          }
        }
      });
    });

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

// Expose for coordination with other scripts
if (typeof window !== "undefined") {
  window.LayoutManager = LayoutManager;
}

// Initialize layout when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  LayoutManager.init();
});
