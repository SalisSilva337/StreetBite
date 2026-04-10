import "../../Styles/components/loadingProgress.css";

const COMPONENT_ROOT_ID = "sbLoadingProgress";
const DEFAULT_MESSAGE = "Carregando dados...";

const REVEAL_DELAY_MS = 140;
const MIN_VISIBLE_MS = 420;
const COMPLETE_HIDE_DELAY_MS = 180;
const AUTO_PROGRESS_INTERVAL_MS = 110;
const MAX_AUTO_PROGRESS = 94;
const INITIAL_PROGRESS = 8;

class LoadingProgress {
  constructor() {
    this.tokens = new Set();
    this.progressValue = 0;
    this.isVisible = false;
    this.visibleAt = 0;
    this.autoProgressInterval = null;
    this.revealTimer = null;
    this.hideTimer = null;
    this.root = null;
    this.label = null;
    this.percentage = null;
    this.bar = null;
  }

  ensureReady() {
    if (!document.body) return false;
    this.ensureRoot();
    return this.root != null;
  }

  ensureRoot() {
    const existing = document.getElementById(COMPONENT_ROOT_ID);
    if (existing) {
      this.root = existing;
      this.label = existing.querySelector(".sbLoadingProgress__message");
      this.percentage = existing.querySelector(
        ".sbLoadingProgress__percentage",
      );
      this.bar = existing.querySelector(".sbLoadingProgress__bar");
      return;
    }

    const root = document.createElement("section");
    root.id = COMPONENT_ROOT_ID;
    root.className = "sbLoadingProgress";
    root.setAttribute("aria-hidden", "true");
    root.innerHTML = `
      <div class="sbLoadingProgress__track" aria-hidden="true">
        <div class="sbLoadingProgress__bar"></div>
      </div>
      <div class="sbLoadingProgress__toast" role="status" aria-live="polite" aria-atomic="true">
        <span class="sbLoadingProgress__spinner" aria-hidden="true"></span>
        <div class="sbLoadingProgress__text">
          <span class="sbLoadingProgress__title">StreetBite</span>
          <span class="sbLoadingProgress__message">${DEFAULT_MESSAGE}</span>
        </div>
        <span class="sbLoadingProgress__percentage">0%</span>
      </div>
    `;

    document.body.appendChild(root);

    this.root = root;
    this.label = root.querySelector(".sbLoadingProgress__message");
    this.percentage = root.querySelector(".sbLoadingProgress__percentage");
    this.bar = root.querySelector(".sbLoadingProgress__bar");
  }

  start(options = {}) {
    if (!this.ensureReady()) return null;

    const token = Symbol("sb-loading-progress");
    this.tokens.add(token);
    this.setMessage(options.message ?? DEFAULT_MESSAGE);

    this.clearHideTimer();

    if (this.tokens.size === 1) {
      this.progressValue = INITIAL_PROGRESS;
      this.renderProgress();
      this.startAutoProgress();
      this.scheduleReveal();
    }

    return token;
  }

  finish(token) {
    if (token == null || !this.tokens.has(token)) return;

    this.tokens.delete(token);

    if (this.tokens.size > 0) return;

    this.completeAndHide();
  }

  setProgress(value) {
    if (!this.ensureReady()) return;

    const numericValue = Number(value);
    if (!Number.isFinite(numericValue)) return;

    const normalizedValue = Math.max(0, Math.min(100, numericValue));
    this.progressValue = Math.max(this.progressValue, normalizedValue);
    this.renderProgress();
  }

  setMessage(message) {
    if (!this.ensureReady() || !this.label) return;
    this.label.textContent = message || DEFAULT_MESSAGE;
  }

  async withProgress(taskOrPromise, options = {}) {
    const token = this.start(options);

    try {
      const task =
        typeof taskOrPromise === "function" ? taskOrPromise() : taskOrPromise;
      return await Promise.resolve(task);
    } finally {
      this.finish(token);
    }
  }

  scheduleReveal() {
    this.clearRevealTimer();

    this.revealTimer = window.setTimeout(() => {
      this.revealTimer = null;
      if (this.tokens.size === 0 || this.isVisible || !this.root) return;

      this.isVisible = true;
      this.visibleAt = performance.now();
      this.root.classList.add("is-visible");
      this.root.setAttribute("aria-hidden", "false");
      document.body.setAttribute("aria-busy", "true");
    }, REVEAL_DELAY_MS);
  }

  startAutoProgress() {
    this.stopAutoProgress();

    this.autoProgressInterval = window.setInterval(() => {
      if (this.tokens.size === 0 || this.progressValue >= MAX_AUTO_PROGRESS) {
        return;
      }

      const distanceToCap = MAX_AUTO_PROGRESS - this.progressValue;
      const nextStep = Math.max(0.3, distanceToCap * 0.08);
      this.progressValue = Math.min(
        MAX_AUTO_PROGRESS,
        this.progressValue + nextStep,
      );
      this.renderProgress();
    }, AUTO_PROGRESS_INTERVAL_MS);
  }

  stopAutoProgress() {
    if (!this.autoProgressInterval) return;
    window.clearInterval(this.autoProgressInterval);
    this.autoProgressInterval = null;
  }

  completeAndHide() {
    this.stopAutoProgress();

    if (this.revealTimer && !this.isVisible) {
      this.clearRevealTimer();
      this.reset();
      return;
    }

    this.progressValue = 100;
    this.renderProgress();

    const now = performance.now();
    const visibleDuration = this.isVisible ? now - this.visibleAt : 0;
    const remainingVisibleMs = Math.max(MIN_VISIBLE_MS - visibleDuration, 0);
    const delayToHide = remainingVisibleMs + COMPLETE_HIDE_DELAY_MS;

    this.hideTimer = window.setTimeout(() => {
      this.hideTimer = null;

      if (this.tokens.size > 0) return;
      if (!this.root) return;

      this.root.classList.remove("is-visible");
      this.root.setAttribute("aria-hidden", "true");
      this.isVisible = false;
      document.body.removeAttribute("aria-busy");
      this.reset();
    }, delayToHide);
  }

  reset() {
    this.progressValue = 0;
    this.renderProgress();
    this.setMessage(DEFAULT_MESSAGE);
  }

  renderProgress() {
    if (!this.bar || !this.percentage) return;

    const rounded = Math.round(this.progressValue);
    this.bar.style.width = `${this.progressValue}%`;
    this.percentage.textContent = `${rounded}%`;
  }

  clearRevealTimer() {
    if (!this.revealTimer) return;
    window.clearTimeout(this.revealTimer);
    this.revealTimer = null;
  }

  clearHideTimer() {
    if (!this.hideTimer) return;
    window.clearTimeout(this.hideTimer);
    this.hideTimer = null;
  }
}

const loadingProgress = new LoadingProgress();

export default loadingProgress;
