const reveals = document.querySelectorAll(".reveal");
const parallaxNodes = document.querySelectorAll("[data-depth]");
const body = document.body;
const heroVideo = document.getElementById("heroVideo");

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
    threshold: 0.18,
  },
);

reveals.forEach((node) => revealObserver.observe(node));

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

window.addEventListener("pointermove", (event) => {
  setPointer(event.clientX, event.clientY);
});

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

  window.setTimeout(() => {
    if (heroVideo.readyState >= 2) {
      markReady();
    } else {
      markMissing();
    }
  }, 1800);
}
