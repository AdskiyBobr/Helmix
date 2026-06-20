const codeLines = [
  'const team = "Helmix";',
  'const mission = "сайт, який продає стиль";',
  '',
  'function buildWebsite(project) {',
  '  return {',
  '    design: "преміальний UI",',
  '    code: "чиста адаптивна верстка",',
  '    motion: "плавні JS-анімації",',
  '    speed: 100,',
  '  };',
  '}',
  '',
  'buildWebsite(mission);'
];

const typedCode = document.querySelector("#typedCode");
let lineIndex = 0;
let charIndex = 0;
let output = "";

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function highlightCode(value) {
  return escapeHtml(value)
    .replace(/("[^"]*")/g, '<span class="token-mint">$1</span>')
    .replace(/\b(100)\b/g, '<span class="token-gold">$1</span>')
    .replace(/\b(const|return)\b/g, '<span class="token-rose">$1</span>')
    .replace(/\b(function|buildWebsite)\b/g, '<span class="token-cyan">$1</span>');
}

function typeCode() {
  if (!typedCode) return;

  const current = codeLines[lineIndex] || "";
  if (charIndex < current.length) {
    output += current[charIndex];
    charIndex += 1;
    typedCode.innerHTML = highlightCode(output);
    window.setTimeout(typeCode, current[charIndex - 1] === " " ? 18 : 34);
    return;
  }

  output += "\n";
  typedCode.innerHTML = highlightCode(output);
  lineIndex += 1;
  charIndex = 0;

  if (lineIndex >= codeLines.length) {
    window.setTimeout(() => {
      lineIndex = 0;
      charIndex = 0;
      output = "";
      if (!document.hidden) typeCode();
    }, 2600);
    return;
  }

  window.setTimeout(typeCode, 220);
}

typeCode();

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.16 }
);

document.querySelectorAll("[data-reveal]").forEach((element) => {
  revealObserver.observe(element);
});

const counters = document.querySelectorAll("[data-count]");
const counterObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;

      const element = entry.target;
      const target = Number(element.dataset.count);
      let value = 0;
      const step = Math.max(1, Math.ceil(target / 44));

      const tick = () => {
        value = Math.min(target, value + step);
        element.textContent = value;
        if (value < target) requestAnimationFrame(tick);
      };

      tick();
      counterObserver.unobserve(element);
    });
  },
  { threshold: 0.8 }
);

counters.forEach((counter) => counterObserver.observe(counter));

const canUsePointerTilt = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

if (canUsePointerTilt) document.querySelectorAll(".tilt-card").forEach((card) => {
  let frame = 0;
  let nextTransform = "";

  card.addEventListener("pointermove", (event) => {
    const rect = card.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const rotateY = (x / rect.width - 0.5) * 8;
    const rotateX = (0.5 - y / rect.height) * 8;
    nextTransform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-6px)`;

    if (frame) return;
    frame = requestAnimationFrame(() => {
      card.style.transform = nextTransform;
      frame = 0;
    });
  });

  card.addEventListener("pointerleave", () => {
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
    card.style.transform = "";
  });
});

const navLinks = [...document.querySelectorAll(".site-nav a")];
const sections = navLinks
  .map((link) => document.querySelector(link.getAttribute("href")))
  .filter(Boolean);

const navObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      navLinks.forEach((link) => {
        link.classList.toggle("active", link.getAttribute("href") === `#${entry.target.id}`);
      });
    });
  },
  { rootMargin: "-40% 0px -50% 0px" }
);

sections.forEach((section) => navObserver.observe(section));

const leadForm = document.querySelector("#leadForm");
const formStatus = document.querySelector("#formStatus");

if (leadForm) {
  leadForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const formData = new FormData(leadForm);
    const name = String(formData.get("name") || "").trim();
    const telegram = String(formData.get("telegram") || "").trim();
    const service = String(formData.get("service") || "").trim();
    const message = String(formData.get("message") || "").trim();

    const text = [
      "Нова заявка Helmix",
      `Ім'я: ${name}`,
      `Telegram: ${telegram}`,
      `Послуга: ${service}`,
      message ? `Задача: ${message}` : ""
    ].filter(Boolean).join("\n");

    try {
      await navigator.clipboard.writeText(text);
      if (formStatus) {
        formStatus.textContent = "Текст заявки скопійовано. Відкриваємо Telegram для відправки.";
      }
    } catch (error) {
      if (formStatus) {
        formStatus.textContent = "Відкриваємо Telegram. Якщо текст не скопіювався, напишіть коротко про задачу вручну.";
      }
    }

    window.open("https://t.me/PalmixPTC", "_blank", "noreferrer");
    leadForm.reset();
  });
}

const canvas = document.querySelector("#ambientCanvas");
const enableAmbientCanvas = false;
const ctx = canvas && enableAmbientCanvas ? canvas.getContext("2d") : null;
let width = 0;
let height = 0;
let particles = [];
let animationFrame = 0;
let lastDraw = 0;
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function resizeCanvas() {
  if (!ctx) return;

  const ratio = Math.min(window.devicePixelRatio || 1, 1.5);
  width = window.innerWidth;
  height = window.innerHeight;
  canvas.width = Math.floor(width * ratio);
  canvas.height = Math.floor(height * ratio);
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);

  const particleCount = width < 700 ? 24 : Math.min(46, Math.floor(width / 30));
  particles = Array.from({ length: particleCount }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    radius: Math.random() * 1.5 + 0.4,
    speed: Math.random() * 0.24 + 0.08,
    drift: Math.random() * 0.34 - 0.17,
    hue: Math.random() > 0.55 ? "159, 246, 208" : "245, 216, 118"
  }));
}

function drawParticles(timestamp = 0) {
  if (!ctx) return;

  if (document.hidden || prefersReducedMotion) {
    animationFrame = 0;
    return;
  }

  if (timestamp - lastDraw < 33) {
    animationFrame = requestAnimationFrame(drawParticles);
    return;
  }

  lastDraw = timestamp;
  ctx.clearRect(0, 0, width, height);
  ctx.shadowBlur = 0;

  particles.forEach((particle, index) => {
    particle.y -= particle.speed;
    particle.x += particle.drift;

    if (particle.y < -10) particle.y = height + 10;
    if (particle.x < -10) particle.x = width + 10;
    if (particle.x > width + 10) particle.x = -10;

    ctx.beginPath();
    ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${particle.hue}, 0.42)`;
    ctx.fill();

    const maxConnections = Math.min(particles.length, index + 7);
    for (let next = index + 1; next < maxConnections; next += 1) {
      const other = particles[next];
      const distance = Math.hypot(particle.x - other.x, particle.y - other.y);
      if (distance < 105) {
        ctx.beginPath();
        ctx.moveTo(particle.x, particle.y);
        ctx.lineTo(other.x, other.y);
        ctx.strokeStyle = `rgba(255, 248, 232, ${0.07 * (1 - distance / 105)})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }
  });

  animationFrame = requestAnimationFrame(drawParticles);
}

let resizeTimer = 0;
window.addEventListener("resize", () => {
  if (!ctx) return;

  window.clearTimeout(resizeTimer);
  resizeTimer = window.setTimeout(resizeCanvas, 160);
}, { passive: true });

document.addEventListener("visibilitychange", () => {
  if (ctx && !document.hidden && !animationFrame && !prefersReducedMotion) {
    lastDraw = 0;
    animationFrame = requestAnimationFrame(drawParticles);
    if (typedCode && lineIndex >= codeLines.length) typeCode();
  }
});

if (ctx) resizeCanvas();
if (ctx && !prefersReducedMotion) {
  animationFrame = requestAnimationFrame(drawParticles);
}
