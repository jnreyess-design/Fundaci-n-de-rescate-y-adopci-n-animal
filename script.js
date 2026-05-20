/**
 * script.js — Rescate & Adopta
 * Funcionalidades: menú móvil, navegación activa, scroll suave,
 * validación de formulario, animaciones al scroll y contador de impacto.
 */

// ─── 1. DOM READY ────────────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  initMobileMenu();
  initSmoothScroll();
  initActiveNav();
  initScrollReveal();
  initContactForm();
  initCounters();
  initHeaderScroll();
});

// ─── 2. MENÚ MÓVIL ───────────────────────────────────────────────────────────
/**
 * Abre y cierra el menú hamburguesa en pantallas pequeñas.
 * Actualiza aria-expanded para accesibilidad.
 */
function initMobileMenu() {
  const toggle = document.querySelector(".menu-toggle");
  const nav    = document.querySelector(".main-nav");
  if (!toggle || !nav) return;

  toggle.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("active");
    toggle.setAttribute("aria-expanded", isOpen);
    toggle.setAttribute("aria-label", isOpen ? "Cerrar menú" : "Abrir menú");
  });

  // Cierra el menú al hacer clic en un enlace (mejor UX en móvil)
  nav.querySelectorAll(".nav-link").forEach(link => {
    link.addEventListener("click", () => {
      nav.classList.remove("active");
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-label", "Abrir menú");
    });
  });

  // Cierra el menú al hacer clic fuera de él
  document.addEventListener("click", (e) => {
    if (!nav.contains(e.target) && !toggle.contains(e.target)) {
      nav.classList.remove("active");
      toggle.setAttribute("aria-expanded", "false");
    }
  });
}

// ─── 3. SCROLL SUAVE ─────────────────────────────────────────────────────────
/**
 * Intercepta todos los enlaces internos (#sección) y realiza
 * un scroll suave con compensación por el header sticky.
 */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener("click", function (e) {
      const href = this.getAttribute("href");
      if (href === "#") return; // enlaces vacíos
      const target = document.querySelector(href);
      if (!target) return;

      e.preventDefault();
      const headerH = document.querySelector(".site-header")?.offsetHeight ?? 70;
      const top = target.getBoundingClientRect().top + window.scrollY - headerH - 12;

      window.scrollTo({ top, behavior: "smooth" });
    });
  });
}

// ─── 4. NAVEGACIÓN ACTIVA ────────────────────────────────────────────────────
/**
 * Resalta el enlace de navegación correspondiente a la sección
 * visible en pantalla usando IntersectionObserver.
 */
function initActiveNav() {
  const sections = document.querySelectorAll("section[id]");
  const navLinks = document.querySelectorAll(".nav-link");
  if (!sections.length || !navLinks.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          navLinks.forEach(link => {
            link.classList.toggle(
              "active",
              link.getAttribute("href") === `#${entry.target.id}`
            );
          });
        }
      });
    },
    { rootMargin: "-30% 0px -60% 0px" }
  );

  sections.forEach(sec => observer.observe(sec));
}

// ─── 5. HEADER AL SCROLL ─────────────────────────────────────────────────────
/**
 * Añade la clase .scrolled al header cuando el usuario desplaza
 * más de 60px, para aplicar sombra más pronunciada.
 */
function initHeaderScroll() {
  const header = document.querySelector(".site-header");
  if (!header) return;

  const onScroll = () => {
    header.classList.toggle("scrolled", window.scrollY > 60);
  };

  window.addEventListener("scroll", onScroll, { passive: true });
}

// ─── 6. ANIMACIONES AL SCROLL (SCROLL REVEAL) ────────────────────────────────
/**
 * Agrega la clase .visible a elementos con [data-reveal] cuando
 * entran en el viewport. El CSS maneja la transición de opacidad/traslado.
 * También aplica automáticamente a tarjetas y beneficios.
 */
function initScrollReveal() {
  // Seleccionamos elementos que queremos animar
  const targets = document.querySelectorAll(
    ".pet-card, .bio-card, .benefit, .section-title, .section-desc, .hero-text, .hero-image, [data-reveal]"
  );

  targets.forEach((el, i) => {
    el.classList.add("reveal");
    // Escalonamos las tarjetas dentro de un mismo grid
    if (el.closest(".cards, .grid, .benefits")) {
      el.style.transitionDelay = `${(i % 3) * 80}ms`;
    }
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target); // una sola vez
        }
      });
    },
    { threshold: 0.12 }
  );

  targets.forEach(el => observer.observe(el));
}

// ─── 7. VALIDACIÓN Y ENVÍO DEL FORMULARIO ────────────────────────────────────
/**
 * Valida los campos del formulario de contacto en tiempo real
 * y al enviar. Muestra mensajes de error accesibles.
 * Simula un envío exitoso con feedback visual.
 */
function initContactForm() {
  const form = document.getElementById("contactForm");
  if (!form) return;

  const fields = {
    name:    { el: form.querySelector("#name"),    validate: v => v.trim().length >= 2,    msg: "Por favor ingresa tu nombre (mín. 2 caracteres)." },
    email:   { el: form.querySelector("#email"),   validate: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), msg: "Ingresa un correo electrónico válido." },
    message: { el: form.querySelector("#message"), validate: v => v.trim().length >= 10,   msg: "El mensaje debe tener al menos 10 caracteres." },
  };

  // Validación en tiempo real al salir del campo (blur)
  Object.values(fields).forEach(({ el, validate, msg }) => {
    if (!el) return;
    el.addEventListener("blur", () => showFieldError(el, validate(el.value) ? "" : msg));
    el.addEventListener("input", () => {
      if (el.classList.contains("invalid")) {
        showFieldError(el, validate(el.value) ? "" : msg);
      }
    });
  });

  // Envío del formulario
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    let valid = true;

    Object.values(fields).forEach(({ el, validate, msg }) => {
      if (!el) return;
      const ok = validate(el.value);
      showFieldError(el, ok ? "" : msg);
      if (!ok) valid = false;
    });

    if (!valid) return;

    // Simula envío (aquí conectarías tu backend o servicio de email)
    submitForm(form);
  });
}

/**
 * Muestra u oculta un mensaje de error bajo un campo.
 * @param {HTMLElement} el   - El input o textarea
 * @param {string}      msg  - Mensaje de error (vacío = sin error)
 */
function showFieldError(el, msg) {
  const errorEl = el.parentElement.querySelector(".error");
  if (!errorEl) return;
  errorEl.textContent = msg;
  el.classList.toggle("invalid", !!msg);
  el.setAttribute("aria-invalid", !!msg);
}

/**
 * Simula el envío del formulario con feedback visual.
 * @param {HTMLFormElement} form
 */
function submitForm(form) {
  const btn = form.querySelector("button[type='submit']");
  const originalText = btn.textContent;

  // Estado de carga
  btn.disabled = true;
  btn.textContent = "Enviando…";
  btn.classList.add("loading");

  // Simulamos latencia de red (1.5 s)
  setTimeout(() => {
    btn.textContent = "¡Mensaje enviado! ✓";
    btn.classList.remove("loading");
    btn.classList.add("success");
    form.reset();

    // Restauramos el botón después de 3 s
    setTimeout(() => {
      btn.disabled = false;
      btn.textContent = originalText;
      btn.classList.remove("success");
    }, 3000);
  }, 1500);
}

// ─── 8. CONTADORES DE IMPACTO ─────────────────────────────────────────────────
/**
 * Anima contadores numéricos cuando la sección de impacto entra en vista.
 * Los elementos deben tener data-count="número".
 * Ejemplo: <span class="counter" data-count="350">0</span>
 */
function initCounters() {
  const counters = document.querySelectorAll(".counter[data-count]");
  if (!counters.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.5 }
  );

  counters.forEach(c => observer.observe(c));
}

/**
 * Incrementa un contador numéricamente hasta su valor objetivo.
 * @param {HTMLElement} el - Elemento con data-count
 */
function animateCounter(el) {
  const target   = parseInt(el.dataset.count, 10);
  const duration = 1800; // ms
  const start    = performance.now();

  const step = (now) => {
    const progress = Math.min((now - start) / duration, 1);
    // Ease out cubic
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.floor(eased * target).toLocaleString("es");
    if (progress < 1) requestAnimationFrame(step);
    else el.textContent = target.toLocaleString("es");
  };

  requestAnimationFrame(step);
}

// ─── 9. UTILIDADES ───────────────────────────────────────────────────────────

/**
 * Debounce: evita llamadas excesivas a una función en eventos
 * de alta frecuencia (scroll, resize).
 * @param {Function} fn
 * @param {number}   delay
 */
function debounce(fn, delay = 150) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}
