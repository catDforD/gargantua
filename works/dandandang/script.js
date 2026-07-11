const items = [...document.querySelectorAll(".photo")].map((figure) => {
  const image = figure.querySelector("img");
  const number = figure.querySelector("span")?.textContent ?? "";
  const title = figure.querySelector("strong")?.textContent ?? "";
  const caption = figure.querySelector("em")?.textContent ?? "";

  return {
    src: image.getAttribute("src"),
    alt: image.getAttribute("alt"),
    label: `${number} ${title} | ${caption}`,
  };
});

const lightbox = document.querySelector(".lightbox");
const lightboxImage = lightbox.querySelector("img");
const lightboxCaption = lightbox.querySelector("figcaption");
const closeButton = lightbox.querySelector(".lightbox__close");
const prevButton = lightbox.querySelector(".lightbox__nav--prev");
const nextButton = lightbox.querySelector(".lightbox__nav--next");
const musicPlayer = document.querySelector(".music-player");
const musicToggle = document.querySelector(".music-toggle");
const musicIcon = document.querySelector(".music-toggle__icon");
const siteHeader = document.querySelector(".site-header");
const hero = document.querySelector(".hero");
let currentIndex = 0;
let musicFadeTimer;
let lastTrigger;
let scrollFrame;

function showImage(index) {
  currentIndex = (index + items.length) % items.length;
  const item = items[currentIndex];
  lightboxImage.src = item.src;
  lightboxImage.alt = item.alt;
  lightboxCaption.textContent = item.label;
}

function openLightbox(index, trigger) {
  showImage(index);
  lastTrigger = trigger;
  lightbox.classList.add("is-open");
  lightbox.setAttribute("aria-hidden", "false");
  document.body.classList.add("has-lightbox");
  closeButton.focus();
}

function closeLightbox() {
  if (!lightbox.classList.contains("is-open")) return;

  lightbox.classList.remove("is-open");
  lightbox.setAttribute("aria-hidden", "true");
  document.body.classList.remove("has-lightbox");
  lastTrigger?.focus();
}

document.querySelectorAll(".photo__button").forEach((button, index) => {
  button.addEventListener("click", () => {
    openLightbox(index, button);
  });
});

closeButton.addEventListener("click", closeLightbox);
prevButton.addEventListener("click", () => showImage(currentIndex - 1));
nextButton.addEventListener("click", () => showImage(currentIndex + 1));

function setMusicState(isPlaying) {
  musicToggle.classList.toggle("is-playing", isPlaying);
  musicToggle.setAttribute("aria-pressed", String(isPlaying));
  musicToggle.setAttribute("aria-label", isPlaying ? "暂停背景音乐" : "播放背景音乐");
  musicToggle.setAttribute("title", isPlaying ? "暂停背景音乐" : "播放背景音乐");
  musicIcon.textContent = isPlaying ? "Ⅱ" : "♪";
}

function fadeMusic(targetVolume, onComplete) {
  window.clearInterval(musicFadeTimer);

  const startVolume = musicPlayer.volume;
  const steps = 14;
  let step = 0;

  musicFadeTimer = window.setInterval(() => {
    step += 1;
    musicPlayer.volume = startVolume + (targetVolume - startVolume) * (step / steps);

    if (step >= steps) {
      window.clearInterval(musicFadeTimer);
      musicPlayer.volume = targetVolume;
      onComplete?.();
    }
  }, 32);
}

if (musicPlayer && musicToggle && musicIcon) {
  musicPlayer.volume = 0;

  musicToggle.addEventListener("click", async () => {
    if (musicPlayer.paused) {
      try {
        musicPlayer.volume = 0;
        await musicPlayer.play();
        setMusicState(true);
        fadeMusic(0.34);
      } catch {
        setMusicState(false);
      }
      return;
    }

    fadeMusic(0, () => {
      musicPlayer.pause();
      setMusicState(false);
    });
  });
}

lightbox.addEventListener("click", (event) => {
  if (event.target === lightbox) {
    closeLightbox();
  }
});

window.addEventListener("keydown", (event) => {
  if (!lightbox.classList.contains("is-open")) return;

  if (event.key === "Escape") closeLightbox();
  if (event.key === "ArrowLeft") showImage(currentIndex - 1);
  if (event.key === "ArrowRight") showImage(currentIndex + 1);

  if (event.key === "Tab") {
    const controls = [closeButton, prevButton, nextButton];
    const currentControl = controls.indexOf(document.activeElement);
    const direction = event.shiftKey ? -1 : 1;
    const nextControl = (currentControl + direction + controls.length) % controls.length;

    event.preventDefault();
    controls[nextControl].focus();
  }
});

function updateScrollEffects() {
  const scrollable = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
  const progress = Math.min(1, window.scrollY / scrollable);

  document.documentElement.style.setProperty("--reading-progress", progress.toFixed(4));
  siteHeader?.classList.toggle("is-scrolled", window.scrollY > window.innerHeight * 0.5);

  if (hero && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    const shift = Math.min(36, window.scrollY * 0.035);
    hero.style.setProperty("--hero-shift", `${shift}px`);
  }

  scrollFrame = undefined;
}

function requestScrollUpdate() {
  if (scrollFrame) return;
  scrollFrame = window.requestAnimationFrame(updateScrollEffects);
}

window.addEventListener("scroll", requestScrollUpdate, { passive: true });
window.addEventListener("resize", requestScrollUpdate);
updateScrollEffects();

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const revealTargets = [
  document.querySelector(".story-intro"),
  ...document.querySelectorAll(".chapter-heading, .photo, .story-end > *"),
].filter(Boolean);

if ("IntersectionObserver" in window && !reducedMotion) {
  document.documentElement.classList.add("has-reveal");

  revealTargets.forEach((element) => {
    if (element.matches(".photo") && element.parentElement?.matches(".photo-pair")) {
      const siblingIndex = [...element.parentElement.children].indexOf(element);
      element.style.setProperty("--reveal-delay", `${siblingIndex * 90}ms`);
    }
  });

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      });
    },
    { rootMargin: "0px 0px -8%", threshold: 0.08 },
  );

  revealTargets.forEach((element) => revealObserver.observe(element));
} else {
  revealTargets.forEach((element) => element.classList.add("is-visible"));
}
