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

// improv for home navigation
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
  const parentSection = document.getElementById(parentSectionId);

  const subContents = parentSection.querySelectorAll(".sub-content");
  subContents.forEach((content) => content.classList.remove("active"));

  const subNavTabs = parentSection.querySelectorAll(".sub-nav-tab");
  subNavTabs.forEach((tab) => tab.classList.remove("active"));

  const targetSubContent = document.getElementById(
    `${parentSectionId}-${subSectionId}`
  );
  if (targetSubContent) {
    targetSubContent.classList.add("active");
  }

  const targetTab = parentSection.querySelector(
    `.sub-nav-tab[onclick*="${subSectionId}"]`
  );
  if (targetTab) {
    targetTab.classList.add("active");
  }
}

function createStarfield() {
  console.log("!!Lightweight moving stars active - optimized for performance");
}

// Platform link handlers
function setupPlatformLinks() {
  const platformLinks = document.querySelectorAll(".platform-link");

  platformLinks.forEach((link) => {
    link.addEventListener("click", function (e) {
      e.preventDefault();

      const platform = this.classList[1]; // second class (youtube, twitch, ...)
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

function setupSmoothScrolling() {
  const contentContainer = document.querySelector(".content-container");
  if (contentContainer) {
    contentContainer.style.transition = "all 0.3s ease";
  }
}

// check if mobile
function isMobile() {
  return (
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    ) || window.innerWidth <= 768
  );
}

// Twitch embed with mobile
function loadTwitchEmbed() {
  const container = document.getElementById("twitch-container");
  const placeholder = container.querySelector(".embed-placeholder");
  const mobileMessage = document.getElementById("embed-message");
  const mobileFallback = document.getElementById("mobile-fallback");

  if (isMobile()) {
    mobileMessage.textContent = "📱 Stream may not load on mobile";
    mobileFallback.style.display = "block";

    // Try to load embed anyway, but with timeout
    setTimeout(() => {
      if (placeholder.style.display !== "none") {
        // If embed didn't load, use the fallback
        mobileMessage.textContent = "📱 Mobile streaming not supported";
        mobileFallback.innerHTML = `
                    <p style="color: var(--accent-purple); font-size: 1rem; font-weight: bold;">
                        <a href="https://twitch.tv/pureredattack" target="_blank" 
                           style="color: var(--accent-purple); text-decoration: underline;">
                            Watch on Twitch App →
                        </a>
                    </p>
                `;
      }
    }, 3000);
  }

  mobileMessage.textContent = "Loading stream...";

  try {
    // Create Twitch embed with the right config
    const embed = document.createElement("iframe");

    const hostname = window.location.hostname;
    let parentDomains = [];

    if (
      hostname.includes("github.io") ||
      hostname === "pureredattack.github.io"
    ) {
      parentDomains = ["pureredattack.github.io"];
      // do this for testing
    } else if (hostname === "localhost" || hostname === "127.0.0.1") {
      parentDomains = ["localhost"];
    } else if (
      hostname.startsWith("192.168.") ||
      hostname.startsWith("10.") ||
      hostname.startsWith("172.")
    ) {
      parentDomains = ["localhost"];
    } else {
      parentDomains = [hostname];
    }

    const parentParam = parentDomains
      .map((domain) => `parent=${domain}`)
      .join("&");

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
               style="color: var(--accent-purple); text-decoration: underline;">
                Check Twitch directly →
            </a>
        </p>
    `;
}

// UFO space animation 
function createSpaceAnimation() {
  function createUFO(isChild = false, startX = "-80px", startY = null) {
    const ufo = document.createElement("div");
    ufo.classList.add("space-ufo");
    if (isChild) ufo.classList.add("child-ufo");
    ufo.innerHTML = "🛸";

    const startPositions = ["-80px", "-120px", "-60px"];
    ufo.style.left = startX === "-80px" ? startPositions[Math.floor(Math.random() * startPositions.length)] : startX;
    
    const flightPaths = [
      { top: "3%", description: "very-top", weight: 30 },    
      { top: "8%", description: "top", weight: 35 },         
      { top: "15%", description: "upper", weight: 35 },   
      { top: "22%", description: "mid-upper", weight: 25 },  
      { top: "30%", description: "center-upper", weight: 20 }, 
      { top: "70%", description: "center-lower", weight: 15 },
      { top: "78%", description: "mid-lower", weight: 10 },  
      { top: "85%", description: "lower", weight: 15 },     
      { top: "92%", description: "bottom", weight: 10 },     
      { top: "97%", description: "very-bottom", weight: 5 }  
    ];
    
    if (startY) {
      ufo.style.top = startY;
    } else {
      const weightedPaths = [];
      flightPaths.forEach(path => {
        for (let i = 0; i < path.weight; i++) {
          weightedPaths.push(path);
        }
      });
      const randomPath = weightedPaths[Math.floor(Math.random() * weightedPaths.length)];
      ufo.style.top = randomPath.top;
    }
    
    const baseDuration = isChild ? Math.random() * 8 + 8 : Math.random() * 12 + 18;
    const durationVariation = Math.random() * 6 - 3; // ±3 seconds
    const duration = Math.max(5, baseDuration + durationVariation);
    ufo.style.animationDuration = duration + "s";

    ufo.style.cursor = "pointer";
    ufo.style.pointerEvents = "auto";
    ufo.style.transition = "filter 0.2s ease";

    ufo.isActive = true;

    ufo.addEventListener("mouseenter", function() {
      if (ufo.isActive) {
        ufo.style.filter += " brightness(1.3)";
      }
    });
    
    ufo.addEventListener("mouseleave", function() {
      if (ufo.isActive) {
        ufo.style.filter = ufo.style.filter.replace(" brightness(1.3)", "");
      }
    });

    ufo.addEventListener("click", function(e) {
      if (ufo.isActive) {
        e.preventDefault();
        duplicateUFO(ufo);
      }
    });

    document.body.appendChild(ufo);
    
    if (!isChild) {
      console.log(`UFO launched. Duration: ${duration.toFixed(1)}s`);
    }

    ufo.addEventListener('animationend', function() {
      ufo.isActive = false;
      if (ufo.parentNode) {
        ufo.parentNode.removeChild(ufo);
      }
    });

    setTimeout(() => {
      if (ufo.parentNode && ufo.isActive) {
        ufo.isActive = false;
        ufo.parentNode.removeChild(ufo);
      }
    }, (duration + 2) * 1000); // Extra 2s buffer
    
    return ufo;
  }

  function duplicateUFO(originalUFO) {
    console.log("UFO clicked! Creating mini UFO swarm!");
    
    // Get current position of clicked UFO
    const rect = originalUFO.getBoundingClientRect();
    const currentLeft = rect.left + "px";
    const currentTop = rect.top + "px";
    
    const numChildren = Math.floor(Math.random() * 4) + 3;
    
    for (let i = 0; i < numChildren; i++) {
      setTimeout(() => {
        const angle = (i / numChildren) * Math.PI * 2; // Circular distribution
        const distance = Math.random() * 80 + 40; // 40-120px spread
        
        const spreadX = parseInt(currentLeft) + Math.cos(angle) * distance;
        const spreadY = parseInt(currentTop) + Math.sin(angle) * distance * 0.6; // Less vertical spread
        
        createUFO(true, Math.max(-100, spreadX) + "px", Math.max(0, Math.min(window.innerHeight - 50, spreadY)) + "px");
      }, i * 150); // Faster staggered creation
    }
    
    // Mark original UFO as inactive and remove with fade
    originalUFO.isActive = false;
    originalUFO.style.transition = "opacity 0.3s ease-out";
    originalUFO.style.opacity = "0";
    setTimeout(() => {
      if (originalUFO.parentNode) {
        originalUFO.parentNode.removeChild(originalUFO);
      }
    }, 300);
  }

  function scheduleNextUFO() {
    const delay = Math.random() * 3000 + 12000; // 12-15 seconds
    
    console.log(`🛸 Next UFO scheduled in ${Math.round(delay/1000)}s`);
    
    setTimeout(() => {
      createUFO();
      scheduleNextUFO();
    }, delay);
  }

  console.log("UFO animation system initialized");
  scheduleNextUFO();
}

document.addEventListener("DOMContentLoaded", function () {
  console.log("DOM Content Loaded - Starting initialization");
  
  createStarfield();
  createSpaceAnimation();
  console.log("Forced UFO animation to start");

  setupPlatformLinks();
  setupSmoothScrolling();
  
  const interactiveElements = document.querySelectorAll(
    ".nav-card, .stream-status"
  );
  interactiveElements.forEach((element) => {
    addGlowEffect(element);
  });

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
  
  // Set up shooting star container
  if (!document.querySelector(".shooting-star-container")) {
    const container = document.createElement("div");
    container.className = "shooting-star-container";
    document.body.appendChild(container);
  }

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      const modal = document.getElementById("imageModal");
      if (modal && modal.classList.contains("active")) {
        closeImageModal();
      } else {
        showSection("home");
      }
    }
  });

  window.addEventListener("resize", function () {
    console.log("Resize detected - CSS animations only");
  });

  console.log("Website initialized");
});

function openImageModal(imageSrc, imageAlt) {
  const modal = document.getElementById("imageModal");
  const modalImage = document.getElementById("modalImage");

  modalImage.src = imageSrc;
  modalImage.alt = imageAlt;

  modal.style.display = "block";
  setTimeout(() => {
    modal.classList.add("active");
  }, 10);
}

function closeImageModal() {
  const modal = document.getElementById("imageModal");

  modal.classList.remove("active");

  setTimeout(() => {
    modal.style.display = "none";
  }, 300);
}
// Shooting star event listeners and functions
let shootingStarCounter = 0;

document.addEventListener("keydown", function (event) {
  if (event.key.toLowerCase() === "s") {
    triggerMultipleShootingStar();
  }
});

function triggerShootingStar() {
  const starfield = document.querySelector(".starfield");
  if (!starfield) return;

  starfield.classList.remove(
    "shoot-down-right",
    "shoot-down-left",
    "shoot-up-right",
    "shoot-up-left"
  );

  // Random dir
  const directions = [
    "shoot-down-right",
    "shoot-down-left",
    "shoot-up-right",
    "shoot-up-left",
  ];
  const randomDirection =
    directions[Math.floor(Math.random() * directions.length)];

  starfield.classList.add(randomDirection);

  setTimeout(() => {
    starfield.classList.remove(randomDirection);
  }, 2000);

  console.log(`🌟 Shooting star triggered: ${randomDirection}`);
}

function triggerMultipleShootingStar() {
  const container =
    document.querySelector(".shooting-star-container") || document.body;

  const star = document.createElement("div");
  star.className = "dynamic-shooting-star";
  star.id = `shooting-star-${shootingStarCounter++}`;

  const directions = [
    {
      name: "down-right",
      startTop: "-100px",
      startLeft: "-250px",
      endTop: "calc(100% + 150px)",
      endLeft: "calc(100% + 350px)",
      rotation: "40deg",
    },
    {
      name: "down-left",
      startTop: "-100px",
      startLeft: "calc(100% + 250px)",
      endTop: "calc(100% + 150px)",
      endLeft: "-350px",
      rotation: "140deg",
    },
    {
      name: "up-right",
      startTop: "calc(100% + 100px)",
      startLeft: "-250px",
      endTop: "-150px",
      endLeft: "calc(100% + 350px)",
      rotation: "-40deg",
    },
    {
      name: "up-left",
      startTop: "calc(100% + 100px)",
      startLeft: "calc(100% + 250px)",
      endTop: "-150px",
      endLeft: "-350px",
      rotation: "-140deg",
    },
  ];

  const randomDirection =
    directions[Math.floor(Math.random() * directions.length)];

  star.style.top = randomDirection.startTop;
  star.style.left = randomDirection.startLeft;
  star.style.transform = `rotate(${randomDirection.rotation})`;

  container.appendChild(star);

  setTimeout(() => {
    star.style.transition = "all 2s ease-out";
    star.style.opacity = "1";
    star.style.top = randomDirection.endTop;
    star.style.left = randomDirection.endLeft;

    setTimeout(() => {
      star.style.opacity = "0";
    }, 1600);
  }, 50);

  setTimeout(() => {
    if (star.parentNode) {
      star.parentNode.removeChild(star);
    }
  }, 2500);

  console.log(
    `Shooting star #${shootingStarCounter - 1} triggered: ${
      randomDirection.name
    }`
  );
}

// Missing unload function
function unloadTwitchEmbed() {
  const container = document.getElementById("twitch-container");
  if (container) {
    const existingEmbed = container.querySelector(".twitch-embed");
    if (existingEmbed) {
      existingEmbed.remove();
      console.log("Twitch embed unloaded");
    }
  }
}

function addGlowEffect(element, color = "var(--accent-cyan)") {
  if (!element) return;

  element.addEventListener("mouseenter", function () {
    this.style.transition = "box-shadow 0.3s ease";
    this.style.boxShadow = `0 0 20px ${color}`;
  });

  element.addEventListener("mouseleave", function () {
    this.style.transition = "box-shadow 0.3s ease";
    this.style.boxShadow = "";
  });
}
