// --- Gestion du menu mobile ---
const burger = document.querySelector(".burger");
const navLinks = document.querySelector(".nav-links");
const links = document.querySelectorAll(".nav-links a");

if (burger && navLinks) {
  burger.addEventListener("click", () => {
    const isOpen = navLinks.classList.toggle("open");
    burger.classList.toggle("active", isOpen);
    burger.setAttribute("aria-expanded", isOpen);
  });

  links.forEach((link) => {
    link.addEventListener("click", () => {
      navLinks.classList.remove("open");
      burger.classList.remove("active");
      burger.setAttribute("aria-expanded", "false");
    });
  });
}

// Nettoyage de l'ancienne clé localStorage si elle était présente
localStorage.removeItem("theme");

// --- Cartes détachées et réinsertion dynamique dans le rail ---
const track = document.querySelector(".projects-track");
let activeOverlay = null;
let currentSourceCard = null;
let isClosing = false;

function onCardEnter(e) {
  const card = e.currentTarget;
  if (isClosing || activeOverlay) return;

  currentSourceCard = card;

  const startRect = card.getBoundingClientRect();

  const clone = card.cloneNode(true);
  clone.className = "card-detached-overlay";
  clone.classList.remove("is-active-clone");

  clone.style.top = `${startRect.top}px`;
  clone.style.left = `${startRect.left}px`;
  clone.style.width = `${startRect.width}px`;
  clone.style.height = `${startRect.height}px`;

  document.body.appendChild(clone);
  activeOverlay = clone;

  card.classList.add("is-active-clone");

  const targetWidth = Math.min(360, window.innerWidth * 0.9);
  const targetHeight = startRect.height + 60;
  const targetLeft = (window.innerWidth - targetWidth) / 2;
  const targetTop = (window.innerHeight - targetHeight) / 2;

  requestAnimationFrame(() => {
    clone.style.top = `${targetTop}px`;
    clone.style.left = `${targetLeft}px`;
    clone.style.width = `${targetWidth}px`;
    clone.style.height = `${targetHeight}px`;
  });

  clone.addEventListener("mouseleave", onCloneLeave);
}

function onCloneLeave() {
  if (isClosing || !currentSourceCard || !activeOverlay) return;
  isClosing = true;

  const clone = activeOverlay;
  const card = currentSourceCard;

  const allCards = Array.from(track.querySelectorAll(".card"));
  const centerScreenX = window.innerWidth / 2;

  let insertBeforeCard = null;
  for (const c of allCards) {
    if (c === card) continue;
    const rect = c.getBoundingClientRect();
    const cardCenter = rect.left + rect.width / 2;
    if (cardCenter > centerScreenX) {
      insertBeforeCard = c;
      break;
    }
  }

  if (insertBeforeCard) {
    track.insertBefore(card, insertBeforeCard);
  } else {
    track.appendChild(card);
  }

  const targetRect = card.getBoundingClientRect();

  clone.style.top = `${targetRect.top}px`;
  clone.style.left = `${targetRect.left}px`;
  clone.style.width = `${targetRect.width}px`;
  clone.style.height = `${targetRect.height}px`;
  clone.style.opacity = "0.7";

  const onTransitionEnd = (e) => {
    if (e.propertyName === "left" || e.propertyName === "top") {
      clone.removeEventListener("transitionend", onTransitionEnd);
      clone.remove();
      card.classList.remove("is-active-clone");
      activeOverlay = null;
      currentSourceCard = null;
      isClosing = false;
    }
  };

  clone.addEventListener("transitionend", onTransitionEnd);
}

if (track) {
  document.querySelectorAll(".projects-track .card").forEach((card) => {
    card.addEventListener("mouseenter", onCardEnter);
  });
}
