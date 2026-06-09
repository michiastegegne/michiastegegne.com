const reveals = document.querySelectorAll(".reveal");
const parallaxNodes = document.querySelectorAll("[data-depth]");
const body = document.body;
const heroVideo = document.getElementById("heroVideo");
const briefBuilder = document.getElementById("briefBuilder");
const briefMailLink = document.getElementById("briefMailLink");
const workFilter = document.querySelector(".work-filter");
const projectRows = document.querySelectorAll("[data-project]");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const canUseParallax = window.matchMedia("(pointer: fine)").matches && !prefersReducedMotion.matches;

if ("IntersectionObserver" in window && !prefersReducedMotion.matches) {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    {
      rootMargin: "0px 0px -8% 0px",
      threshold: 0.14,
    },
  );

  reveals.forEach((node) => revealObserver.observe(node));
} else {
  reveals.forEach((node) => node.classList.add("in-view"));
}

const setPointer = (x, y) => {
  body.style.setProperty("--pointer-x", `${x}px`);
  body.style.setProperty("--pointer-y", `${y}px`);

  const xRatio = (x / window.innerWidth - 0.5) * 2;
  const yRatio = (y / window.innerHeight - 0.5) * 2;

  parallaxNodes.forEach((node) => {
    const depth = Number(node.dataset.depth || 0);
    node.style.translate = `${xRatio * depth}px ${yRatio * depth}px`;
  });
};

if (canUseParallax) {
  let pointerFrame = 0;
  let pointerX = window.innerWidth / 2;
  let pointerY = window.innerHeight / 2;

  window.addEventListener(
    "pointermove",
    (event) => {
      pointerX = event.clientX;
      pointerY = event.clientY;

      if (pointerFrame) {
        return;
      }

      pointerFrame = window.requestAnimationFrame(() => {
        setPointer(pointerX, pointerY);
        pointerFrame = 0;
      });
    },
    { passive: true },
  );
}

window.addEventListener("load", () => {
  setPointer(window.innerWidth / 2, window.innerHeight / 2);
});

if (heroVideo) {
  const markReady = () => {
    body.dataset.video = "ready";
  };

  const markMissing = () => {
    if (body.dataset.video !== "ready") {
      body.dataset.video = "missing";
    }
  };

  heroVideo.addEventListener("canplay", markReady, { once: true });
  heroVideo.addEventListener("loadeddata", markReady, { once: true });
  heroVideo.addEventListener("error", markMissing, { once: true });

  const playbackAttempt = heroVideo.play?.();
  if (playbackAttempt?.catch) {
    playbackAttempt.catch(markMissing);
  }

  window.setTimeout(() => {
    if (heroVideo.readyState >= 2) {
      markReady();
    } else {
      markMissing();
    }
  }, 1800);
}

if (workFilter && projectRows.length) {
  const filterButtons = workFilter.querySelectorAll("button[data-filter]");

  workFilter.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-filter]");

    if (!button) {
      return;
    }

    const activeFilter = button.dataset.filter;

    filterButtons.forEach((filterButton) => {
      const isActive = filterButton === button;
      filterButton.classList.toggle("is-active", isActive);
      filterButton.setAttribute("aria-pressed", String(isActive));
    });

    projectRows.forEach((row) => {
      const categories = (row.dataset.category || "").split(" ");
      const shouldShow = activeFilter === "all" || categories.includes(activeFilter);
      row.hidden = !shouldShow;
    });
  });
}

if (briefBuilder && briefMailLink) {
  const updateBriefMail = () => {
    const data = new FormData(briefBuilder);
    const projectType = data.get("projectType") || "Film / Video";
    const platform = data.get("platform") || "";
    const timeline = data.get("timeline") || "";
    const budget = data.get("budget") || "";
    const goal = data.get("goal") || "";
    const lines = [
      `Projektart: ${projectType}`,
      `Plattform: ${platform}`,
      `Timing: ${timeline}`,
      `Budgetrahmen: ${budget}`,
      "",
      "Ziel / Idee:",
      goal,
    ];
    const subject = `Projektanfrage: ${projectType}`;
    briefMailLink.href = `mailto:hello@michiastegegne.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines.join("\n"))}`;
  };

  briefBuilder.addEventListener("input", updateBriefMail);
  briefBuilder.addEventListener("change", updateBriefMail);
  briefBuilder.addEventListener("submit", (event) => {
    event.preventDefault();
    updateBriefMail();
    window.location.href = briefMailLink.href;
  });
  updateBriefMail();
}
