import "../../Styles/components/snackbar.css";

const COMPONENT_ROOT_ID = "sbSnackbarRoot";
const DEFAULT_DURATION_MS = 4200;
const EXIT_ANIMATION_MS = 220;
const MAX_VISIBLE_SNACKBARS = 4;

const TYPE_ICONS = {
  success: "OK",
  error: "ER",
  warning: "WR",
  info: "IN",
};

class SnackbarManager {
  constructor() {
    this.root = null;
    this.queue = [];
    this.visible = new Map();
    this.sequence = 0;
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
      return;
    }

    const root = document.createElement("section");
    root.id = COMPONENT_ROOT_ID;
    root.className = "sbSnackbarRoot";
    root.setAttribute("aria-label", "Notificacoes");
    document.body.appendChild(root);
    this.root = root;
  }

  show(options) {
    if (!this.ensureReady()) return null;

    const normalized = this.normalizeOptions(options);
    if (!normalized.message) return null;

    const notification = {
      id: ++this.sequence,
      ...normalized,
    };

    if (this.visible.size >= MAX_VISIBLE_SNACKBARS) {
      this.queue.push(notification);
      return notification.id;
    }

    this.mountNotification(notification);
    return notification.id;
  }

  success(messageOrOptions) {
    return this.show(this.withType(messageOrOptions, "success"));
  }

  error(messageOrOptions) {
    return this.show(this.withType(messageOrOptions, "error"));
  }

  warning(messageOrOptions) {
    return this.show(this.withType(messageOrOptions, "warning"));
  }

  info(messageOrOptions) {
    return this.show(this.withType(messageOrOptions, "info"));
  }

  dismiss(id) {
    const active = this.visible.get(id);
    if (!active) return;

    const { element, timeoutId } = active;
    if (timeoutId) {
      window.clearTimeout(timeoutId);
    }

    element.classList.add("is-leaving");

    window.setTimeout(() => {
      element.remove();
      this.visible.delete(id);
      this.flushQueue();
    }, EXIT_ANIMATION_MS);
  }

  flushQueue() {
    while (this.queue.length > 0 && this.visible.size < MAX_VISIBLE_SNACKBARS) {
      const next = this.queue.shift();
      this.mountNotification(next);
    }
  }

  mountNotification(notification) {
    const element = document.createElement("article");
    element.className = `sbSnackbar sbSnackbar--${notification.type}`;
    element.setAttribute(
      "role",
      notification.type === "error" ? "alert" : "status",
    );
    element.setAttribute("aria-live", "polite");
    element.dataset.id = String(notification.id);
    element.innerHTML = `
      <div class="sbSnackbar__accent" aria-hidden="true"></div>
      <div class="sbSnackbar__icon" aria-hidden="true">${TYPE_ICONS[notification.type]}</div>
      <div class="sbSnackbar__body">
        <p class="sbSnackbar__message"></p>
      </div>
      <button class="sbSnackbar__close" type="button" aria-label="Fechar notificacao">Fechar</button>
    `;

    const messageElement = element.querySelector(".sbSnackbar__message");
    const closeButton = element.querySelector(".sbSnackbar__close");

    if (messageElement) {
      messageElement.textContent = notification.message;
    }

    closeButton?.addEventListener("click", () => {
      this.dismiss(notification.id);
    });

    if (notification.actionLabel && typeof notification.action === "function") {
      const actionButton = document.createElement("button");
      actionButton.type = "button";
      actionButton.className = "sbSnackbar__action";
      actionButton.textContent = notification.actionLabel;
      actionButton.addEventListener("click", () => {
        notification.action();
        this.dismiss(notification.id);
      });
      element.querySelector(".sbSnackbar__body")?.appendChild(actionButton);
    }

    this.root.appendChild(element);

    let timeoutId = null;
    if (notification.duration > 0) {
      timeoutId = window.setTimeout(() => {
        this.dismiss(notification.id);
      }, notification.duration);
    }

    this.visible.set(notification.id, {
      element,
      timeoutId,
    });
  }

  normalizeOptions(options) {
    if (typeof options === "string") {
      return {
        message: options,
        type: "info",
        duration: DEFAULT_DURATION_MS,
      };
    }

    const message = String(options?.message ?? "").trim();
    const allowedTypes = new Set(["success", "error", "warning", "info"]);
    const type = allowedTypes.has(options?.type) ? options.type : "info";
    const duration =
      Number.isFinite(options?.duration) && options.duration >= 0
        ? Number(options.duration)
        : DEFAULT_DURATION_MS;

    return {
      message,
      type,
      duration,
      actionLabel: options?.actionLabel,
      action: options?.action,
    };
  }

  withType(messageOrOptions, type) {
    if (typeof messageOrOptions === "string") {
      return { message: messageOrOptions, type };
    }

    return {
      ...(messageOrOptions ?? {}),
      type,
    };
  }
}

const snackbar = new SnackbarManager();

if (typeof window !== "undefined") {
  window.StreetBiteSnackbar = snackbar;
  window.showSnackbar = (messageOrOptions, type = "info") => {
    if (typeof messageOrOptions === "string") {
      return snackbar.show({ message: messageOrOptions, type });
    }
    return snackbar.show(messageOrOptions);
  };
}

export default snackbar;
