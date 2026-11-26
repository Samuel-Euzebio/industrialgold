const menu = document.querySelector(".menu");
const navigation = document.querySelector("#navegacao");
const mobile = window.matchMedia("(max-width: 51rem)");
const menuIcon = menu.querySelector("use");

function setMenu(open, returnFocus = false) {
  navigation.classList.toggle("open", open);
  menu.setAttribute("aria-expanded", String(open));
  menu.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
  menuIcon.setAttribute("href", open ? "#x" : "#menu");
  if (returnFocus) menu.focus();
}

menu.addEventListener("click", () => setMenu(!navigation.classList.contains("open")));
navigation.addEventListener("click", (event) => {
  const link = event.target.closest("a");
  if (!link || !mobile.matches) return;
  const destination = link.hash && document.getElementById(link.hash.slice(1));
  setMenu(false, !destination);
  if (destination) {
    destination.setAttribute("tabindex", "-1");
    destination.focus({ preventScroll: true });
  }
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && navigation.classList.contains("open")) setMenu(false, true);
});
document.addEventListener("click", (event) => {
  if (!event.target.closest(".nav") && navigation.classList.contains("open")) setMenu(false);
});
mobile.addEventListener("change", () => setMenu(false));

const tablist = document.querySelector(".sector-tabs");
const tabs = [...tablist.querySelectorAll("button")];
const panels = tabs.map((tab) => document.getElementById(tab.getAttribute("aria-controls")));

function selectSector(index, moveFocus = false) {
  if (tablist.dataset.ready && tabs[index].getAttribute("aria-selected") === "true") {
    if (moveFocus) tabs[index].focus();
    return;
  }
  tabs.forEach((tab, position) => {
    const active = position === index;
    tab.setAttribute("aria-selected", String(active));
    tab.tabIndex = active ? 0 : -1;
    panels[position].hidden = !active;
  });
  if (moveFocus) tabs[index].focus();
}

tablist.setAttribute("role", "tablist");
tabs.forEach((tab, index) => {
  tab.setAttribute("role", "tab");
  panels[index].setAttribute("role", "tabpanel");
  panels[index].tabIndex = 0;
  tab.addEventListener("click", () => selectSector(index));
});
tablist.addEventListener("keydown", (event) => {
  const index = tabs.indexOf(event.target);
  if (index < 0) return;
  const nextIndex = {
    ArrowRight: (index + 1) % tabs.length,
    ArrowDown: (index + 1) % tabs.length,
    ArrowLeft: (index + tabs.length - 1) % tabs.length,
    ArrowUp: (index + tabs.length - 1) % tabs.length,
    Home: 0,
    End: tabs.length - 1
  }[event.key];
  if (nextIndex === undefined) return;
  event.preventDefault();
  selectSector(nextIndex, true);
});
selectSector(0);
tablist.dataset.ready = "true";
document.documentElement.classList.add("enhanced");

if ("IntersectionObserver" in window && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
  const reveal = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        reveal.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  document.querySelectorAll(".reveal").forEach((section) => {
    if (section.getBoundingClientRect().top < innerHeight) section.classList.add("visible");
    else reveal.observe(section);
  });
  document.documentElement.classList.add("motion");
}

const hero = document.querySelector(".hero");
const heroVisual = document.querySelector(".hero-visual");
const layeredMotion = matchMedia("(min-width: 56.01rem) and (prefers-reduced-motion: no-preference)");
let frame = 0;

function updateHeroOffset() {
  frame = 0;
  const bounds = hero.getBoundingClientRect();
  const offset = layeredMotion.matches ? Math.min(22, Math.max(0, -bounds.top) * 0.085) : 0;
  heroVisual.style.setProperty("--hero-offset", offset + "px");
}

window.addEventListener("scroll", () => {
  if (layeredMotion.matches && !frame && hero.getBoundingClientRect().bottom > 0) {
    frame = requestAnimationFrame(updateHeroOffset);
  }
}, { passive: true });
layeredMotion.addEventListener("change", updateHeroOffset);
updateHeroOffset();

document.querySelectorAll("[data-sector]").forEach((link) => {
  link.addEventListener("click", () => {
    const index = tabs.findIndex((tab) => tab.id === link.dataset.sector);
    if (index >= 0) {
      selectSector(index);
      tabs[index].focus({ preventScroll: true });
    }
  });
});
