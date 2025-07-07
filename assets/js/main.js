// Navigation functions
function showSection(sectionId) {
  // Hide all content sections
  const sections = document.querySelectorAll(".content-section");
  sections.forEach((section) => {
    section.classList.remove("active");
  });

  // Hide main navigation
  const mainNav = document.getElementById("home");
  if (mainNav) {
    mainNav.style.display = "none";
  }

  // Show selected section
  const targetSection = document.getElementById(sectionId);
  if (targetSection) {
    if (sectionId === "home") {
      mainNav.style.display = "block";
      // When returning to home, unload Twitch embed to free memory
      unloadTwitchEmbed();
    } else {
      targetSection.classList.add("active");
      // Load Twitch embed when stream section is viewed
      if (sectionId === "stream") {
        loadTwitchEmbed();
      } else {
        // When going to non-stream sections, unload embed
        unloadTwitchEmbed();
      }
      // make sure about section always shows bio sub-section by default
      if (sectionId === "about") {
        // Hide all sub-content
        const subContents = targetSection.querySelectorAll(".sub-content");
        subContents.forEach((content) => content.classList.remove("active"));
        // Remove active class from all tabs
        const subNavTabs = targetSection.querySelectorAll(".sub-nav-tab");
        subNavTabs.forEach((tab) => tab.classList.remove("active"));
        // Show bio sub-content and activate its tab
        const bioContent = document.getElementById("about-bio");
        if (bioContent) bioContent.classList.add("active");
        const bioTab = targetSection.querySelector(
          '.sub-nav-tab[onclick*="bio"]'
        );
        if (bioTab) bioTab.classList.add("active");
      }
    }
  }
}

// Fix for home navigation - add this to existing showSection function
function showHome() {
  // Hide all sections
  document.querySelectorAll(".content-section").forEach((section) => {
    section.classList.remove("active");
  });

  // Show main nav
  document.querySelector(".main-nav").style.display = "block";

  // Clean up any existing embed
  const container = document.getElementById("twitch-container");
  const existingEmbed = container.querySelector(".twitch-embed");
  if (existingEmbed) {
    existingEmbed.remove();
    // Reset placeholder
    const placeholder = container.querySelector(".embed-placeholder");
    if (placeholder) {
      placeholder.style.display = "flex";
      const message = document.getElementById("embed-message");
      const fallback = document.getElementById("mobile-fallback");
      if (message) message.textContent = '📺 Click "WATCH STREAM" to load';
      if (fallback) fallback.style.display = "none";
    }
  }
}

// Sub-section navigation
function showSubSection(parentSectionId, subSectionId) {
  // Get the parent section
  const parentSection = document.getElementById(parentSectionId);

  // Hide all sub-content in the parent section
  const subContents = parentSection.querySelectorAll(".sub-content");
  subContents.forEach((content) => content.classList.remove("active"));

  // Remove active class from all tabs
  const subNavTabs = parentSection.querySelectorAll(".sub-nav-tab");
  subNavTabs.forEach((tab) => tab.classList.remove("active"));

  // Show the selected sub-content and activate the corresponding tab
  const targetSubContent = document.getElementById(
    `${parentSectionId}-${subSectionId}`
  );
  if (targetSubContent) {
    targetSubContent.classList.add("active");
  }

  // Activate the clicked tab
  const targetTab = parentSection.querySelector(
    `.sub-nav-tab[onclick*="${subSectionId}"]`
  );
  if (targetTab) {
    targetTab.classList.add("active");
  }
}

// Starfield is now lightweight moving CSS - minimal GPU usage
function createStarfield() {
  console.log(
    "⭐ Lightweight moving starfield active - optimized for performance"
  );
}

// Platform link handlers
function setupPlatformLinks() {
  const platformLinks = document.querySelectorAll(".platform-link");

  platformLinks.forEach((link) => {
    link.addEventListener("click", function (e) {
      e.preventDefault();

      // Get platform type from class
      const platform = this.classList[1]; // Gets the second class (youtube, twitch, etc.)

      // Placeholder URLs - replace with actual social media links
      const urls = {
        youtube: "https://youtube.com/@pureredattack",
        twitch: "https://twitch.tv/pureredattack",
        twitter: "https://twitter.com/pureredattack",
        tiktok: "https://tiktok.com/@pureredattack_",
      };

      if (urls[platform]) {
        window.open(urls[platform], "_blank");
      }
    });
  });
}

// Smooth scrolling for better UX
function setupSmoothScrolling() {
  // Add smooth transitions when switching sections
  const contentContainer = document.querySelector(".content-container");
  if (contentContainer) {
    contentContainer.style.transition = "all 0.3s ease";
  }
}

// Mobile detection and Twitch embed handling
function isMobile() {
  return (
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    ) || window.innerWidth <= 768
  );
}

// Enhanced Twitch embed with mobile fallback
function loadTwitchEmbed() {
  const container = document.getElementById("twitch-container");
  const placeholder = container.querySelector(".embed-placeholder");
  const mobileMessage = document.getElementById("embed-message");
  const mobileFallback = document.getElementById("mobile-fallback");

  if (isMobile()) {
    // Show mobile fallback immediately
    mobileMessage.textContent = "📱 Stream may not load on mobile";
    mobileFallback.style.display = "block";

    // Try to load embed anyway, but with timeout
    setTimeout(() => {
      if (placeholder.style.display !== "none") {
        // If embed didn't load, emphasize the fallback
        mobileMessage.textContent = "📱 Mobile streaming not supported";
        mobileFallback.innerHTML = `
                    <p style="color: var(--accent-cyan); font-size: 1rem; font-weight: bold;">
                        <a href="https://twitch.tv/pureredattack" target="_blank" 
                           style="color: var(--accent-cyan); text-decoration: underline;">
                            🎮 Watch on Twitch App →
                        </a>
                    </p>
                `;
      }
    }, 3000);
  }

  // Standard embed loading
  mobileMessage.textContent = "📺 Loading stream...";

  try {
    // Create Twitch embed with proper configuration
    const embed = document.createElement("iframe");

    // Get the current domain for parent parameter
    const hostname = window.location.hostname;
    let parentDomains = [];

    // Force correct domain for GitHub Pages
    if (
      hostname.includes("github.io") ||
      hostname === "pureredattack.github.io"
    ) {
      parentDomains = ["pureredattack.github.io"];
    } else if (hostname === "localhost" || hostname === "127.0.0.1") {
      parentDomains = ["localhost"];
    } else if (
      hostname.startsWith("192.168.") ||
      hostname.startsWith("10.") ||
      hostname.startsWith("172.")
    ) {
      // For local development, use localhost instead of IP
      parentDomains = ["localhost"];
    } else {
      parentDomains = [hostname];
    }

    // Create parent parameter string
    const parentParam = parentDomains
      .map((domain) => `parent=${domain}`)
      .join("&");

    // Construct proper Twitch embed URL
    embed.src = `https://player.twitch.tv/?channel=pureredattack&${parentParam}&muted=false&autoplay=false`;
    embed.className = "twitch-embed";
    embed.allowfullscreen = true;
    embed.allow = "autoplay; fullscreen";
    embed.frameBorder = "0";
    embed.scrolling = "no";

    console.log("Twitch embed URL:", embed.src); // Debug log

    // Add error handling
    embed.onerror = () => {
      console.error("Twitch embed failed to load");
      showEmbedError();
    };

    embed.onload = () => {
      console.log("Twitch embed loaded successfully");
      // Give it a moment to initialize
      setTimeout(() => {
        placeholder.style.display = "none";
      }, 1000);
    };

    container.appendChild(embed);
  } catch (error) {
    console.error("Twitch embed error:", error);
    showEmbedError();
  }
}

function showEmbedError() {
  const mobileMessage = document.getElementById("embed-message");
  const mobileFallback = document.getElementById("mobile-fallback");

  mobileMessage.textContent = "❌ Stream unavailable";
  mobileFallback.style.display = "block";
  mobileFallback.innerHTML = `
        <p style="color: var(--text-secondary);">
            Stream might be offline or unavailable.<br>
            <a href="https://twitch.tv/pureredattack" target="_blank" 
               style="color: var(--accent-cyan); text-decoration: underline;">
                Check Twitch directly →
            </a>
        </p>
    `;
}

// Simple space animation - floating UFOs
function createSpaceAnimation() {
  function createUFO() {
    const ufo = document.createElement("div");
    ufo.classList.add("space-ufo");
    ufo.innerHTML = "🛸";

    // Random starting position (off-screen left)
    ufo.style.left = "-50px";
    ufo.style.top = Math.random() * 80 + 10 + "%";

    // Random animation duration (slower)
    const duration = Math.random() * 20 + 30; // 30-50 seconds
    ufo.style.animationDuration = duration + "s";

    document.body.appendChild(ufo);

    // Remove UFO after animation completes
    setTimeout(() => {
      if (ufo.parentNode) {
        ufo.parentNode.removeChild(ufo);
      }
    }, duration * 1000);
  }

  // Create UFO occasionally (every 15-45 seconds)
  function scheduleNextUFO() {
    const delay = Math.random() * 30000 + 15000; // 15-45 seconds
    setTimeout(() => {
      createUFO();
      scheduleNextUFO();
    }, delay);
  }

  // Start the animation cycle
  scheduleNextUFO();
}

// Initialize everything when DOM is loaded
document.addEventListener("DOMContentLoaded", function () {
  // Check for reduced motion preference
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  // Create animated background elements only if user doesn't prefer reduced motion
  if (!prefersReducedMotion) {
    createStarfield();
    // CSS background animations are now handling the space theme
  } else {
    // For users who prefer reduced motion, use a simpler background
    console.log("Reduced motion detected - simplified animations");
  }

  // Setup platform links
  setupPlatformLinks();

  // Setup smooth scrolling
  setupSmoothScrolling();

  // Add keyboard navigation
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      // Check if modal is open first
      const modal = document.getElementById("imageModal");
      if (modal && modal.classList.contains("active")) {
        closeImageModal();
      } else {
        showSection("home");
      }
    }
  });

  // Add resize handler for responsive adjustments
  window.addEventListener("resize", function () {
    // No longer need particle cleanup since we removed them
    console.log("Resize detected - CSS animations only");
  });

  console.log("🚀 Pureredattack website initialized successfully!");
});

// Utility function to add glow effect on hover (fixed)
function addGlowEffect(element, color = "var(--accent-cyan)") {
  if (!element) return; // Safety check

  element.addEventListener("mouseenter", function () {
    this.style.transition = "box-shadow 0.3s ease";
    this.style.boxShadow = `0 0 20px ${color}`;
  });

  element.addEventListener("mouseleave", function () {
    this.style.transition = "box-shadow 0.3s ease";
    this.style.boxShadow = "";
  });
}

// Add glow effects to interactive elements
document.addEventListener("DOMContentLoaded", function () {
  const interactiveElements = document.querySelectorAll(
    ".nav-card, .stream-status"
  );
  interactiveElements.forEach((element) => {
    addGlowEffect(element);
  });

  // Add platform-specific glow effects
  const platformLinks = document.querySelectorAll(".platform-link");
  platformLinks.forEach((link) => {
    const platform = link.classList[1];
    let glowColor;

    switch (platform) {
      case "youtube":
        glowColor = "#ff0000";
        break;
      case "twitch":
        glowColor = "#9146ff";
        break;
      case "twitter":
        glowColor = "#1da1f2";
        break;
      case "tiktok":
        glowColor = "#ff0050";
        break;
      default:
        glowColor = "var(--accent-cyan)";
    }

    addGlowEffect(link, glowColor);
  });

  // Prevent any accidental clicks on background elements from redirecting home
  document.addEventListener("click", function (e) {
    // Only allow clicks on specific interactive elements
    if (
      !e.target.closest(
        ".nav-card, .stream-status, .platform-link, .back-button, .sub-nav-tab, .content-section"
      )
    ) {
      e.stopPropagation();
    }
  });
});

// Image modal functions
function openImageModal(imageSrc, imageAlt) {
  const modal = document.getElementById("imageModal");
  const modalImage = document.getElementById("modalImage");

  modalImage.src = imageSrc;
  modalImage.alt = imageAlt;

  modal.style.display = "block";
  // Small delay to ensure display is set before opacity transition
  setTimeout(() => {
    modal.classList.add("active");
  }, 10);

  // Keep body scroll enabled for modal scrolling
  // document.body.style.overflow = 'hidden'; // Removed this line
}

function closeImageModal() {
  const modal = document.getElementById("imageModal");

  modal.classList.remove("active");

  // Wait for transition to complete before hiding
  setTimeout(() => {
    modal.style.display = "none";
    // document.body.style.overflow = 'auto'; // Removed this line
  }, 300);
}
