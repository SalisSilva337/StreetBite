import ApiService from "./service.js";
import { getEnumByValue, PAYMENT_METHOD_OPTIONS } from "./enumMappings.js";

const api = new ApiService();

const weeklyProfitElement = document.querySelector(
  "[data-dashboard-weekly-profit]",
);
const weeklyOrdersElement = document.querySelector(
  "[data-dashboard-weekly-orders]",
);
const averageTicketElement = document.querySelector(
  "[data-dashboard-average-ticket]",
);
const dashboardOrdersElement = document.querySelector(
  "[data-dashboard-orders]",
);
const dashboardSummaryElement = document.querySelector(
  "[data-dashboard-summary]",
);
const dashboardRangeElement = document.querySelector("[data-dashboard-range]");
const latestOrderElement = document.querySelector(
  "[data-dashboard-latest-order]",
);
const topOrderElement = document.querySelector("[data-dashboard-top-order]");
const paymentCountElement = document.querySelector(
  "[data-dashboard-payment-count]",
);

function formatCurrency(value) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(Number(value ?? 0));
}

function formatDateTime(value) {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
}

function normalizeOrderDate(order) {
  return new Date(order?.pedidoCriadoEm ?? order?.PedidoCriadoEm ?? 0);
}

function resolveOrderTotal(order) {
  return Number(order?.subtotal ?? order?.Subtotal ?? 0);
}

function resolveOrderCode(order) {
  return String(order?.codigoDoPedido ?? order?.CodigoDoPedido ?? "").trim();
}

function resolveCustomerName(order) {
  return (
    String(order?.clienteNome ?? order?.ClienteNome ?? "Cliente").trim() ||
    "Cliente"
  );
}

function resolvePaymentLabel(order) {
  const paymentValue = order?.metodoDePagamento ?? order?.MetodoDePagamento;
  return (
    getEnumByValue(PAYMENT_METHOD_OPTIONS, paymentValue)?.getDescription() ??
    "Pagamento não informado"
  );
}

function renderOrderCard(order) {
  const card = document.createElement("article");
  card.className = "dashboard-orderCard";

  const header = document.createElement("div");
  header.className = "dashboard-orderCardHeader";

  const customer = document.createElement("strong");
  customer.textContent = resolveCustomerName(order);

  const code = document.createElement("span");
  code.textContent = resolveOrderCode(order) || "Sem código";

  header.appendChild(customer);
  header.appendChild(code);

  const meta = document.createElement("div");
  meta.className = "dashboard-orderCardMeta";

  const date = document.createElement("span");
  date.textContent = formatDateTime(
    order?.pedidoCriadoEm ?? order?.PedidoCriadoEm,
  );

  const payment = document.createElement("span");
  payment.textContent = resolvePaymentLabel(order);

  meta.appendChild(date);
  meta.appendChild(payment);

  const footer = document.createElement("div");
  footer.className = "dashboard-orderCardFooter";

  const total = document.createElement("strong");
  total.textContent = formatCurrency(resolveOrderTotal(order));

  const status = document.createElement("span");
  status.textContent = String(order?.status ?? order?.Status ?? "Aberto");

  footer.appendChild(total);
  footer.appendChild(status);

  card.appendChild(header);
  card.appendChild(meta);
  card.appendChild(footer);

  return card;
}

function renderEmptyState(container, message) {
  container.innerHTML = "";
  const emptyState = document.createElement("div");
  emptyState.className = "dashboard-emptyState";
  emptyState.textContent = message;
  container.appendChild(emptyState);
}

async function initializeDashboard() {
  if (!dashboardOrdersElement) {
    return;
  }

  try {
    const data = await api.getComandas();
    const orders = Array.isArray(data) ? data : [];
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - 7);

    const weeklyOrders = orders.filter((order) => {
      const orderDate = normalizeOrderDate(order);
      return !Number.isNaN(orderDate.getTime()) && orderDate >= weekStart;
    });

    const weeklyProfit = weeklyOrders.reduce(
      (sum, order) => sum + resolveOrderTotal(order),
      0,
    );

    const averageTicket = weeklyOrders.length
      ? weeklyProfit / weeklyOrders.length
      : 0;

    if (weeklyProfitElement) {
      weeklyProfitElement.textContent = formatCurrency(weeklyProfit);
    }

    if (weeklyOrdersElement) {
      weeklyOrdersElement.textContent = String(weeklyOrders.length);
    }

    if (averageTicketElement) {
      averageTicketElement.textContent = formatCurrency(averageTicket);
    }

    if (dashboardRangeElement) {
      dashboardRangeElement.textContent = "Últimos 7 dias";
    }

    if (dashboardSummaryElement) {
      dashboardSummaryElement.textContent = weeklyOrders.length
        ? `${weeklyOrders.length} pedido(s) registrado(s) no período.`
        : "Nenhum pedido foi registrado nos últimos 7 dias.";
    }

    if (latestOrderElement) {
      const latestOrder = orders
        .slice()
        .sort(
          (left, right) => normalizeOrderDate(right) - normalizeOrderDate(left),
        )[0];

      latestOrderElement.textContent = latestOrder
        ? `${resolveCustomerName(latestOrder)} · ${resolveOrderCode(latestOrder) || "Sem código"}`
        : "Sem pedidos ainda";
    }

    if (topOrderElement) {
      const topOrder = weeklyOrders
        .slice()
        .sort(
          (left, right) => resolveOrderTotal(right) - resolveOrderTotal(left),
        )[0];

      topOrderElement.textContent = topOrder
        ? `${resolveCustomerName(topOrder)} · ${formatCurrency(resolveOrderTotal(topOrder))}`
        : "Sem pedidos ainda";
    }

    if (paymentCountElement) {
      paymentCountElement.textContent = String(weeklyOrders.length);
    }

    dashboardOrdersElement.innerHTML = "";

    const recentOrders = orders
      .slice()
      .sort(
        (left, right) => normalizeOrderDate(right) - normalizeOrderDate(left),
      )
      .slice(0, 5);

    if (!recentOrders.length) {
      renderEmptyState(
        dashboardOrdersElement,
        "Nenhum pedido recente encontrado.",
      );
      return;
    }

    recentOrders.forEach((order) => {
      dashboardOrdersElement.appendChild(renderOrderCard(order));
    });
  } catch (error) {
    console.error("Erro ao montar dashboard:", error);
    renderEmptyState(
      dashboardOrdersElement,
      error.message || "Não foi possível carregar os dados da dashboard.",
    );
  }
}

initializeDashboard();
