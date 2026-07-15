(function () {
  const phone = "77762222684";
  const header = document.querySelector("[data-header]");
  const progress = document.querySelector(".scroll-progress");
  const menuToggle = document.querySelector("[data-menu-toggle]");
  const mobileMenu = document.querySelector("[data-mobile-menu]");
  const navLinks = document.querySelectorAll(".main-nav a");
  const sections = [...navLinks].map((link) => document.querySelector(link.getAttribute("href"))).filter(Boolean);
  const statusEl = document.querySelector("[data-open-status]");
  const todayHoursEl = document.querySelector("[data-today-hours]");
  const tabButtons = document.querySelectorAll("[data-message]");
  const orderLink = document.querySelector("[data-whatsapp-order]");

  function setHeaderState() {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    header.classList.toggle("is-scrolled", scrollTop > 24);

    const max = document.documentElement.scrollHeight - window.innerHeight;
    const percent = max > 0 ? (scrollTop / max) * 100 : 0;
    progress.style.width = `${percent}%`;
  }

  function closeMobileMenu() {
    document.body.classList.remove("menu-open");
    mobileMenu.classList.remove("is-open");
    menuToggle.setAttribute("aria-expanded", "false");
  }

  function buildWhatsAppLink(message) {
    return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  }

  function getZharkentTimeParts() {
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: "Asia/Almaty",
      weekday: "short",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23"
    });

    const parts = formatter.formatToParts(new Date());
    const map = Object.fromEntries(parts.map((part) => [part.type, part.value]));
    return {
      weekday: map.weekday,
      minutes: Number(map.hour) * 60 + Number(map.minute)
    };
  }

  function getHoursForDay(weekday) {
    if (weekday === "Fri") {
      return { label: "17:00–23:00", open: 17 * 60, close: 23 * 60 };
    }

    return { label: "10:00–23:00", open: 10 * 60, close: 23 * 60 };
  }

  function updateOpenStatus() {
    if (!statusEl || !todayHoursEl) return;

    const now = getZharkentTimeParts();
    const hours = getHoursForDay(now.weekday);
    const isOpen = now.minutes >= hours.open && now.minutes < hours.close;

    todayHoursEl.textContent = hours.label;
    statusEl.textContent = isOpen ? "Открыто сейчас" : `Сейчас закрыто · ${hours.label}`;
    statusEl.classList.toggle("is-closed", !isOpen);
  }

  function updateActiveNav() {
    const current = sections
      .map((section) => ({
        id: section.id,
        top: Math.abs(section.getBoundingClientRect().top - 120)
      }))
      .sort((a, b) => a.top - b.top)[0];

    navLinks.forEach((link) => {
      link.classList.toggle("is-active", link.getAttribute("href") === `#${current?.id}`);
    });
  }

  function initReveal() {
    const revealItems = document.querySelectorAll(".reveal");

    if (!("IntersectionObserver" in window)) {
      revealItems.forEach((item) => item.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.16, rootMargin: "0px 0px -60px 0px" });

    revealItems.forEach((item) => observer.observe(item));
  }

  menuToggle?.addEventListener("click", () => {
    const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
    document.body.classList.toggle("menu-open", !isOpen);
    mobileMenu.classList.toggle("is-open", !isOpen);
    menuToggle.setAttribute("aria-expanded", String(!isOpen));
  });

  mobileMenu?.addEventListener("click", (event) => {
    if (event.target.closest("a")) {
      closeMobileMenu();
    }
  });

  tabButtons.forEach((button) => {
    button.addEventListener("click", () => {
      tabButtons.forEach((item) => {
        item.classList.remove("is-active");
        item.setAttribute("aria-pressed", "false");
      });

      button.classList.add("is-active");
      button.setAttribute("aria-pressed", "true");
      orderLink.href = buildWhatsAppLink(button.dataset.message);
    });
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeMobileMenu();
    }
  });

  window.addEventListener("scroll", () => {
    setHeaderState();
    updateActiveNav();
  }, { passive: true });

  window.addEventListener("resize", setHeaderState);

  setHeaderState();
  updateActiveNav();
  updateOpenStatus();
  initReveal();
})();
