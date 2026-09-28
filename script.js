const $ = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];

/* preload */
window.addEventListener("load", () => {
  setTimeout(() => $("#preloader").classList.add("hide"), 1550);
});

$("#year").textContent = new Date().getFullYear();

/* reveal */
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add("show");
    revealObserver.unobserve(entry.target);
  });
}, { threshold: .12 });

$$(".reveal").forEach((el, i) => {
  el.style.transitionDelay = `${(i % 4) * 70}ms`;
  revealObserver.observe(el);
});

/* contact title */
const contactTitle = $(".contact-title");
const contactObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) contactTitle.classList.add("show");
  });
}, { threshold: .4 });
contactObserver.observe(contactTitle);

/* cursor */
const cursor = $(".cursor");
let tx = innerWidth / 2, ty = innerHeight / 2;
let cx = tx, cy = ty;

window.addEventListener("mousemove", e => {
  tx = e.clientX;
  ty = e.clientY;
});

function moveCursor() {
  cx += (tx - cx) * .16;
  cy += (ty - cy) * .16;
  cursor.style.transform = `translate(${cx}px, ${cy}px) translate(-50%, -50%)`;
  requestAnimationFrame(moveCursor);
}
moveCursor();

$$("a, button, .proof-item, .result-tab").forEach(el => {
  el.addEventListener("mouseenter", () => cursor.classList.add("active"));
  el.addEventListener("mouseleave", () => cursor.classList.remove("active"));
});

/* magnetic */
$$(".magnetic").forEach(el => {
  el.addEventListener("mousemove", e => {
    const r = el.getBoundingClientRect();
    const x = e.clientX - r.left - r.width / 2;
    const y = e.clientY - r.top - r.height / 2;
    el.style.transform = `translate(${x * .13}px, ${y * .13}px)`;
  });
  el.addEventListener("mouseleave", () => el.style.transform = "");
});

/* email copy */
const emailWrap = $(".contact-email");
const emailLink = emailWrap?.querySelector("[data-email]");
const emailCopy = $(".email-copy");

if (emailWrap && emailLink && emailCopy) {
  const email = emailLink.dataset.email;
  let copyTimer;

  emailCopy.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(email);
    } catch {
      const input = document.createElement("input");
      input.value = email;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      input.remove();
    }

    clearTimeout(copyTimer);
    emailCopy.textContent = "Скопировано";
    emailCopy.classList.add("is-copied", "is-visible");
    copyTimer = setTimeout(() => {
      emailCopy.textContent = "Скопировать";
      emailCopy.classList.remove("is-copied", "is-visible");
    }, 1600);
  });
}

/* split type */
const hero = $(".hero");
const titleLines = $$(".hero-line i");

hero.addEventListener("mousemove", e => {
  const rx = e.clientX / innerWidth - .5;
  const ry = e.clientY / innerHeight - .5;

  titleLines.forEach((line, i) => {
    const power = 10 + i * 5;
    line.style.setProperty("--split-x", `${rx * power}px`);
    line.style.setProperty("--split-y", `${ry * power}px`);
  });
});

hero.addEventListener("mouseleave", () => {
  titleLines.forEach(line => {
    line.style.setProperty("--split-x", "0px");
    line.style.setProperty("--split-y", "0px");
  });
});

/* hero grid */
const heroGrid = $("#heroGrid");
for (let i = 0; i < 100; i++) {
  heroGrid.appendChild(document.createElement("span"));
}
const heroCells = [...heroGrid.children];

hero.addEventListener("mousemove", e => {
  heroCells.forEach(cell => {
    const r = cell.getBoundingClientRect();
    const dist = Math.hypot(e.clientX - (r.left + r.width / 2), e.clientY - (r.top + r.height / 2));
    const force = Math.max(0, 1 - dist / 260);
    cell.style.transform = `translateY(${-force * 30}px) rotate(${force * 10}deg)`;
    cell.style.opacity = .55 + force * .45;
  });
});

/* proof colors */
$$(".proof-item").forEach(item => {
  item.style.setProperty("--item-color", item.dataset.color);
});

/* result tabs — полезный блок вместо декоративных ячеек */
const resultTabs = $$(".result-tab");
const resultPanels = $$(".result-panel");

function setResultPanel(panelId) {
  resultTabs.forEach(tab => {
    const active = tab.dataset.panel === panelId;
    tab.classList.toggle("is-active", active);
    tab.setAttribute("aria-selected", String(active));
    tab.tabIndex = active ? 0 : -1;
  });

  resultPanels.forEach(panel => {
    const active = panel.id === `panel-${panelId}`;
    panel.classList.toggle("is-active", active);
    panel.hidden = !active;
  });
}

resultTabs.forEach((tab, index) => {
  tab.addEventListener("click", () => setResultPanel(tab.dataset.panel));
  tab.addEventListener("keydown", event => {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    let next = index;
    if (event.key === "ArrowRight") next = (index + 1) % resultTabs.length;
    if (event.key === "ArrowLeft") next = (index - 1 + resultTabs.length) % resultTabs.length;
    if (event.key === "Home") next = 0;
    if (event.key === "End") next = resultTabs.length - 1;
    setResultPanel(resultTabs[next].dataset.panel);
    resultTabs[next].focus();
  });
});

/* contact grid */
const contactGrid = $("#contactGrid");
for (let i = 0; i < 140; i++) {
  contactGrid.appendChild(document.createElement("span"));
}
const contactCells = [...contactGrid.children];

$(".contact").addEventListener("mousemove", e => {
  contactCells.forEach(cell => {
    const r = cell.getBoundingClientRect();
    const dist = Math.hypot(e.clientX - (r.left + r.width / 2), e.clientY - (r.top + r.height / 2));
    const force = Math.max(0, 1 - dist / 180);
    cell.style.transform = `scale(${1 + force * .35})`;
    cell.style.background = force > .6 ? "#bbff3f" : "transparent";
  });
});

/* FAQ accordion — один открытый */
$$(".faq details").forEach(item => {
  item.addEventListener("toggle", () => {
    if (!item.open) return;
    $$(".faq details").forEach(other => {
      if (other !== item) other.open = false;
    });
  });
});

/* reduced motion */
if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
  $$(".reveal").forEach(el => el.classList.add("show"));
  contactTitle.classList.add("show");
  document.documentElement.style.scrollBehavior = "auto";
}
