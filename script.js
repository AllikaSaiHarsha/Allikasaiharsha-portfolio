(() => {
  "use strict";
  const $ = (q) => document.querySelector(q);
  const $$ = (q) => Array.from(document.querySelectorAll(q));
  const readSetting = (key) => {
    try {
      return localStorage.getItem(key);
    } catch (e) {
      return null;
    }
  };
  const saveSetting = (key, value) => {
    try {
      localStorage.setItem(key, value);
    } catch (e) {
      /* Preferences remain active for this visit if storage is restricted. */
    }
  };
  const themeButton = $("#theme-toggle");
  function setTheme(theme) {
    document.documentElement.dataset.theme = theme;
    $("#theme-icon").setAttribute("href", theme === "dark" ? "#sun" : "#moon");
    themeButton.setAttribute(
      "aria-label",
      theme === "dark" ? "Switch to light theme" : "Switch to dark theme",
    );
    themeButton.title =
      theme === "dark" ? "Switch to light theme" : "Switch to dark theme";
  }
  setTheme(readSetting("sh-portfolio-theme") === "dark" ? "dark" : "light");
  themeButton.addEventListener("click", () => {
    const theme =
      document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    setTheme(theme);
    saveSetting("sh-portfolio-theme", theme);
  });
  const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  let manualMotion = readSetting("sh-portfolio-motion");
  const heroWord = $("#hero-word"),
    typewriter = heroWord.closest(".typewriter");
  const heroSentences = [
    { text: "I build the\nwhole picture.", accent: "whole" },
    { text: "I connect\nevery layer.", accent: "every layer." },
    { text: "I turn ideas\ninto reality.", accent: "into reality." },
  ];
  const typewriterTiming = { hold: 2200, delete: 35, pause: 450, type: 70 };
  let sentenceIndex = 0,
    letterCount = heroSentences[0].text.length,
    typewriterPhase = "hold",
    typewriterTimer = null;
  function renderHeroSentence() {
    const sentence = heroSentences[sentenceIndex];
    const visible = sentence.text.slice(0, letterCount);
    const accentStart = sentence.text.indexOf(sentence.accent);
    heroWord.replaceChildren();
    heroWord.append(document.createTextNode(visible.slice(0, accentStart)));
    if (visible.length > accentStart) {
      const accent = document.createElement("em");
      accent.textContent = visible.slice(
        accentStart,
        accentStart + sentence.accent.length,
      );
      heroWord.append(accent);
      if (visible.length > accentStart + sentence.accent.length)
        heroWord.append(
          document.createTextNode(
            visible.slice(accentStart + sentence.accent.length),
          ),
        );
    }
  }
  function scheduleTypewriter(delay) {
    clearTimeout(typewriterTimer);
    typewriterTimer = null;
    if (document.body.dataset.motion !== "off" && !document.hidden)
      typewriterTimer = setTimeout(stepTypewriter, delay);
  }
  function stepTypewriter() {
    if (document.body.dataset.motion === "off" || document.hidden) return;
    if (typewriterPhase === "hold") typewriterPhase = "delete";
    if (typewriterPhase === "delete") {
      letterCount = Math.max(0, letterCount - 1);
      renderHeroSentence();
      if (letterCount === 0) {
        sentenceIndex = (sentenceIndex + 1) % heroSentences.length;
        typewriterPhase = "type";
        scheduleTypewriter(typewriterTiming.pause);
      } else scheduleTypewriter(typewriterTiming.delete);
    } else {
      letterCount = Math.min(
        heroSentences[sentenceIndex].text.length,
        letterCount + 1,
      );
      renderHeroSentence();
      if (letterCount === heroSentences[sentenceIndex].text.length) {
        typewriterPhase = "hold";
        scheduleTypewriter(typewriterTiming.hold);
      } else scheduleTypewriter(typewriterTiming.type);
    }
  }
  function syncTypewriter() {
    clearTimeout(typewriterTimer);
    typewriterTimer = null;
    const off = document.body.dataset.motion === "off";
    typewriter.classList.toggle("is-running", !off && !document.hidden);
    if (off) {
      sentenceIndex = 0;
      letterCount = heroSentences[0].text.length;
      typewriterPhase = "hold";
      renderHeroSentence();
      return;
    }
    const delay =
      typewriterPhase === "hold"
        ? typewriterTiming.hold
        : typewriterPhase === "delete"
          ? typewriterTiming.delete
          : letterCount === 0
            ? typewriterTiming.pause
            : typewriterTiming.type;
    scheduleTypewriter(delay);
  }
  document.addEventListener("visibilitychange", syncTypewriter);

  function applyMotion() {
    const off = motionQuery.matches || manualMotion === "off";
    document.body.dataset.motion = off ? "off" : "on";
    const b = $("#motion-toggle");
    b.textContent = motionQuery.matches
      ? "Motion: reduced (system)"
      : off
        ? "Motion: off"
        : "Motion: on";
    b.setAttribute("aria-pressed", String(off));
    b.disabled = motionQuery.matches;
    b.title = motionQuery.matches
      ? "Your system requests reduced motion"
      : "Toggle decorative animation";
    syncTypewriter();
  }
  applyMotion();
  if (motionQuery.addEventListener)
    motionQuery.addEventListener("change", applyMotion);
  $("#motion-toggle").addEventListener("click", () => {
    manualMotion = document.body.dataset.motion === "off" ? "on" : "off";
    saveSetting("sh-portfolio-motion", manualMotion);
    applyMotion();
  });
  const menuButton = $("#menu-toggle"),
    nav = $("#navigation");
  function closeMenu() {
    nav.classList.remove("open");
    menuButton.setAttribute("aria-expanded", "false");
    menuButton.setAttribute("aria-label", "Open navigation");
    $("#menu-icon").setAttribute("href", "#menu");
  }
  menuButton.addEventListener("click", () => {
    const open = !nav.classList.contains("open");
    nav.classList.toggle("open", open);
    menuButton.setAttribute("aria-expanded", String(open));
    menuButton.setAttribute(
      "aria-label",
      open ? "Close navigation" : "Open navigation",
    );
    $("#menu-icon").setAttribute("href", open ? "#close" : "#menu");
  });
  nav
    .querySelectorAll("a")
    .forEach((a) => a.addEventListener("click", closeMenu));
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && nav.classList.contains("open")) {
      closeMenu();
      menuButton.focus();
    }
  });
  document.addEventListener("click", (e) => {
    if (!e.target.closest(".site-header")) closeMenu();
  });
  window.addEventListener(
    "resize",
    () => {
      if (window.innerWidth > 600) closeMenu();
    },
    { passive: true },
  );
  const tabs = $$("[data-tab]");
  function selectTab(tab, focus = false) {
    tabs.forEach((t) => {
      const active = t === tab;
      t.setAttribute("aria-selected", String(active));
      t.tabIndex = active ? 0 : -1;
      document.getElementById(t.getAttribute("aria-controls")).hidden = !active;
    });
    if (focus) tab.focus();
  }
  tabs.forEach((tab, index) => {
    tab.addEventListener("click", () => selectTab(tab));
    tab.addEventListener("keydown", (e) => {
      let next = index;
      if (e.key === "ArrowRight") next = (index + 1) % tabs.length;
      else if (e.key === "ArrowLeft")
        next = (index - 1 + tabs.length) % tabs.length;
      else if (e.key === "Home") next = 0;
      else if (e.key === "End") next = tabs.length - 1;
      else return;
      e.preventDefault();
      selectTab(tabs[next], true);
    });
  });
  const cases = {
    mobile: {
      category: "01 / MOBILE APPLICATION",
      title: "The field companion.",
      intro:
        "A React Native and Expo application designed for on-site packaging inspections, with a camera-first workflow and connected results.",
      tags: ["React Native", "Expo", "TypeScript", "EAS"],
      features: [
        "Native camera and gallery input through expo-image-picker.",
        "Tactile interactions with expo-haptics.",
        "Inspection results presented as declaration-level status checks.",
        "Expo EAS over-the-air updates for the preview channel.",
      ],
      connection:
        "The mobile client sends packaging images to the FastAPI vision service. The documented ecosystem connects mobile inspection results with the web dashboard.",
      url: "https://github.com/AllikaSaiHarsha/legal-metrology-app",
    },
    vision: {
      category: "02 / AI VISION BACKEND",
      title: "The vision engine.",
      intro:
        "A Python FastAPI service for extracting packaging-label information with Google Gemini multimodal vision.",
      tags: ["Python", "FastAPI", "Gemini", "Pillow"],
      features: [
        "Original image dimensions read with Pillow.",
        "Declaration text extraction with normalized spatial bounding boxes.",
        "Structured JSON responses for downstream interfaces.",
        "Model and API-key fallback handling in the analysis pipeline.",
      ],
      connection:
        "This shared service provides the interpretation layer for mobile and web clients. It converts an image into data that interfaces can display and reviewers can inspect.",
      url: "https://github.com/AllikaSaiHarsha/legal-metrology-backend",
    },
    web: {
      category: "03 / WEB COMMAND DASHBOARD",
      title: "The command center.",
      intro:
        "A Next.js workspace that brings packaging scans, inspection history, access control, and reporting into one web interface.",
      tags: ["Next.js", "React", "Tailwind CSS", "Prisma", "PostgreSQL"],
      features: [
        "NextAuth.js authentication and role-based access.",
        "Scan and inspection records backed by Prisma and PostgreSQL.",
        "Dashboard visualizations and spatial label overlays.",
        "PDF report generation with jsPDF tooling.",
      ],
      connection:
        "The web layer connects the vision workflow with persistent records and administrative review. The hosted application is available behind a sign-in screen.",
      url: "https://github.com/AllikaSaiHarsha/legal-metrology-web",
    },
  };
  const dialog = $("#case-dialog");
  let lastTrigger = null;
  function openCase(key, trigger) {
    const item = cases[key];
    if (!item) return;
    lastTrigger = trigger;
    $("#case-category").textContent = item.category;
    $("#case-title").textContent = item.title;
    $("#case-intro").textContent = item.intro;
    $("#case-connection").textContent = item.connection;
    $("#case-source").href = item.url;
    $("#case-live").hidden = key !== "web";
    $("#case-tags").replaceChildren(
      ...item.tags.map((text) => {
        const el = document.createElement("span");
        el.className = "chip";
        el.textContent = text;
        return el;
      }),
    );
    $("#case-features").replaceChildren(
      ...item.features.map((text) => {
        const el = document.createElement("li");
        el.textContent = text;
        return el;
      }),
    );
    dialog.showModal();
    dialog.scrollTop = 0;
    document.body.classList.add("locked");
    $("#close-dialog").focus();
  }
  $$("[data-case]").forEach((button) =>
    button.addEventListener("click", () =>
      openCase(button.dataset.case, button),
    ),
  );
  $("#close-dialog").addEventListener("click", () => dialog.close());
  dialog.addEventListener("click", (e) => {
    if (e.target === dialog) {
      const rect = dialog.getBoundingClientRect();
      if (
        e.clientX < rect.left ||
        e.clientX > rect.right ||
        e.clientY < rect.top ||
        e.clientY > rect.bottom
      )
        dialog.close();
    }
  });
  dialog.addEventListener("close", () => {
    document.body.classList.remove("locked");
    if (lastTrigger) lastTrigger.focus();
  });
  let toastTimer;
  function notify(text) {
    const toast = $("#toast");
    toast.textContent = text;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("show"), 3500);
  }
  $("#copy-profile").addEventListener("click", async () => {
    const url = "https://github.com/AllikaSaiHarsha";
    try {
      if (!navigator.clipboard) throw new Error("Clipboard unavailable");
      await navigator.clipboard.writeText(url);
      notify("GitHub profile link copied.");
      $("#copy-fallback").classList.remove("visible");
    } catch (e) {
      const fallback = $("#copy-fallback");
      fallback.classList.add("visible");
      fallback.focus();
      const range = document.createRange();
      range.selectNodeContents(fallback);
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
      notify(
        "Clipboard access is unavailable. Select and copy the link shown below.",
      );
    }
  });
  $("#year").textContent = new Date().getFullYear();
  let ticking = false;
  function updateProgress() {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const value = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
    $("#reading-progress").style.transform = "scaleX(" + value + ")";
    ticking = false;
  }
  window.addEventListener(
    "scroll",
    () => {
      if (!ticking) {
        requestAnimationFrame(updateProgress);
        ticking = true;
      }
    },
    { passive: true },
  );
  window.addEventListener("resize", updateProgress, { passive: true });
  updateProgress();
  if ("IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            if (document.body.dataset.motion !== "off")
              entry.target.classList.add("revealed");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 },
    );
    $$("[data-reveal]").forEach((el) => revealObserver.observe(el));
    const sections = $$("main section[id]").filter((el) => el.id !== "home");
    const activeObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            nav.querySelectorAll("a").forEach((a) => {
              const active = a.getAttribute("href") === "#" + entry.target.id;
              a.classList.toggle("active", active);
              if (active) a.setAttribute("aria-current", "location");
              else a.removeAttribute("aria-current");
            });
          }
        });
      },
      { rootMargin: "-18% 0px -60% 0px", threshold: 0 },
    );
    sections.forEach((el) => activeObserver.observe(el));
  }
})();
