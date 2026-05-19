const header = document.querySelector("[data-header]");
const nav = document.querySelector("[data-nav]");
const navToggle = document.querySelector("[data-nav-toggle]");
const lightbox = document.querySelector("[data-lightbox]");
const lightboxImage = document.querySelector("[data-lightbox-image]");
const lightboxCaption = document.querySelector("[data-lightbox-caption]");
const lightboxClose = document.querySelector("[data-lightbox-close]");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const scrollProgress = document.createElement("span");

if (header) {
  scrollProgress.className = "scroll-progress";
  scrollProgress.setAttribute("aria-hidden", "true");
  header.append(scrollProgress);
}

const setHeaderState = () => {
  if (!header) return;
  header.classList.toggle("is-scrolled", window.scrollY > 12);
};

const setFloatingCtaState = () => {
  document.body.classList.toggle("show-floating", window.scrollY > 520);
};

const setScrollEffects = () => {
  const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
  const progress = scrollableHeight > 0 ? window.scrollY / scrollableHeight : 0;

  scrollProgress.style.transform = `scaleX(${Math.min(Math.max(progress, 0), 1)})`;

  if (!reduceMotion) {
    const heroShift = Math.min(window.scrollY * 0.12, 74);
    document.documentElement.style.setProperty("--hero-shift", `${heroShift}px`);
  }
};

setHeaderState();
setFloatingCtaState();
setScrollEffects();
window.addEventListener(
  "scroll",
  () => {
    setHeaderState();
    setFloatingCtaState();
    setScrollEffects();
  },
  { passive: true }
);

window.addEventListener("resize", setScrollEffects, { passive: true });

if (nav && navToggle) {
  navToggle.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("is-open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
    document.body.classList.toggle("nav-open", isOpen);
  });

  nav.addEventListener("click", (event) => {
    if (!(event.target instanceof HTMLAnchorElement)) return;
    nav.classList.remove("is-open");
    navToggle.setAttribute("aria-expanded", "false");
    document.body.classList.remove("nav-open");
  });
}

if (lightbox && lightboxImage && lightboxCaption && lightboxClose) {
  document.querySelectorAll("[data-gallery] .gallery-item").forEach((item) => {
    item.addEventListener("click", () => {
      const image = item.querySelector("img");
      const fullImage = item.getAttribute("data-full");
      const caption = item.getAttribute("data-caption") || image?.alt || "";

      lightboxImage.src = fullImage || image?.src || "";
      lightboxImage.alt = caption;
      lightboxCaption.textContent = caption;

      if (typeof lightbox.showModal === "function") {
        lightbox.showModal();
      }
    });
  });

  lightboxClose.addEventListener("click", () => lightbox.close());

  lightbox.addEventListener("click", (event) => {
    if (event.target === lightbox) {
      lightbox.close();
    }
  });

  lightbox.addEventListener("close", () => {
    lightboxImage.src = "";
  });
}

const animateNumber = (element) => {
  if (element.dataset.counted === "true") return;

  const original = element.textContent.trim();
  const match = original.match(/^(\d+)(\+?)$/);
  if (!match || reduceMotion) return;

  element.dataset.counted = "true";

  const target = Number(match[1]);
  const suffix = match[2] || "";
  const padLength = match[1].startsWith("0") ? match[1].length : 0;
  const startTime = performance.now();
  const duration = 950;

  const tick = (time) => {
    const progress = Math.min((time - startTime) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const value = Math.round(target * eased);
    const display = padLength ? String(value).padStart(padLength, "0") : String(value);

    element.textContent = `${display}${suffix}`;

    if (progress < 1) {
      requestAnimationFrame(tick);
    } else {
      element.textContent = original;
    }
  };

  element.textContent = padLength ? "0".repeat(padLength) : "0";
  requestAnimationFrame(tick);
};

const setupScrollAnimations = () => {
  const groups = [
    [".intro .section-kicker, .intro h2", "left", 0, 110],
    [".intro__copy > p", "right", 80, 90],
    [".metrics > div", "zoom", 170, 100],
    [".services .section-heading > *", "up", 0, 95],
    [".service-card", "card", 80, 85],
    [".process .section-heading > *", "left", 0, 95],
    [".process-grid article", "card", 120, 120],
    [".gallery .section-heading > *", "up", 0, 95],
    [".gallery-item", "gallery", 90, 65],
    [".cta-section__media", "left", 0, 90],
    [".cta-section__content > *", "right", 80, 90],
    [".site-footer > *", "up", 0, 70]
  ];

  if (reduceMotion || !("IntersectionObserver" in window)) {
    document.querySelectorAll("[data-animate]").forEach((element) => {
      element.classList.add("is-visible");
    });
    return;
  }

  document.body.classList.add("motion-ready");

  groups.forEach(([selector, animation, baseDelay, step]) => {
    document.querySelectorAll(selector).forEach((element, index) => {
      element.dataset.animate = animation;
      element.style.setProperty("--reveal-delay", `${baseDelay + index * step}ms`);
    });
  });

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      });
    },
    {
      rootMargin: "0px 0px -12% 0px",
      threshold: 0.16
    }
  );

  document.querySelectorAll("[data-animate]").forEach((element) => {
    revealObserver.observe(element);
  });

  const numberObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        animateNumber(entry.target);
        numberObserver.unobserve(entry.target);
      });
    },
    {
      rootMargin: "0px 0px -18% 0px",
      threshold: 0.5
    }
  );

  document.querySelectorAll(".metrics strong").forEach((number) => {
    numberObserver.observe(number);
  });
};

setupScrollAnimations();
