import loadingProgress from "./components/loadingProgress.js";

const DEFAULT_BASE_URL = "http://localhost:5109";

class ApiService {
  constructor(baseUrl = DEFAULT_BASE_URL) {
    this.baseUrl = baseUrl.replace(/\/$/, "");
  }

  buildUrl(endpoint) {
    const normalizedEndpoint = endpoint.startsWith("/")
      ? endpoint
      : `/${endpoint}`;
    return `${this.baseUrl}${normalizedEndpoint}`;
  }

  async readPayload(response) {
    const text = await response.text();

    if (!text) {
      return null;
    }

    try {
      return JSON.parse(text);
    } catch {
      return text;
    }
  }

  unwrapResponse(payload) {
    if (
      payload == null ||
      Array.isArray(payload) ||
      typeof payload !== "object"
    ) {
      return payload;
    }

    if (Object.prototype.hasOwnProperty.call(payload, "data")) {
      return payload.data;
    }

    if (Object.prototype.hasOwnProperty.call(payload, "Data")) {
      return payload.Data;
    }

    return payload;
  }

  getErrorMessage(payload, fallbackMessage) {
    if (payload == null) {
      return fallbackMessage;
    }

    if (typeof payload === "string") {
      return payload;
    }

    const message = payload.message ?? payload.Message;
    if (typeof message === "string" && message.trim()) {
      return message;
    }

    const errors = payload.errors ?? payload.Errors;
    if (Array.isArray(errors) && errors.length) {
      return errors.filter(Boolean).join(" | ");
    }

    return fallbackMessage;
  }

  hasWrappedError(payload) {
    if (
      payload == null ||
      Array.isArray(payload) ||
      typeof payload !== "object"
    ) {
      return false;
    }

    const message = payload.message ?? payload.Message;
    const hasData =
      Object.prototype.hasOwnProperty.call(payload, "data") ||
      Object.prototype.hasOwnProperty.call(payload, "Data");
    const success = payload.success ?? payload.Success;

    return (
      (typeof message === "string" && message.trim() && !hasData) ||
      success === false
    );
  }

  async request(endpoint, method = "GET", body = null) {
    const headers = {
      "Content-Type": "application/json",
    };

    const options = {
      method,
      headers,
    };

    if (body != null) {
      options.body = JSON.stringify(body);
    }

    const loadingToken = loadingProgress.start({
      message: this.getProgressMessage(method),
    });

    try {
      const url = this.buildUrl(endpoint);
      console.log(
        `Requisição: ${method.toUpperCase()} ${url}`,
        body ? { payload: body } : {},
      );

      const response = await fetch(url, options);
      const payload = await this.readPayload(response);

      if (!response.ok || this.hasWrappedError(payload)) {
        throw new Error(
          this.getErrorMessage(
            payload,
            `Erro: ${response.status} - ${response.statusText}`,
          ),
        );
      }

      return this.unwrapResponse(payload);
    } finally {
      loadingProgress.finish(loadingToken);
    }
  }

  getProgressMessage(method) {
    const normalizedMethod = String(method ?? "GET").toUpperCase();

    if (normalizedMethod === "POST") {
      return "Enviando dados...";
    }

    if (normalizedMethod === "PATCH" || normalizedMethod === "PUT") {
      return "Atualizando dados...";
    }

    if (normalizedMethod === "DELETE") {
      return "Removendo dados...";
    }

    return "Carregando dados...";
  }

  // Métodos específicos para cada entidade
  async getClientes() {
    return this.request("/api/v1/clientes");
  }

  async getClienteById(id) {
    return this.request(`/api/v1/clientes/${id}`);
  }

  async createCliente(data) {
    return this.request("/api/v1/clientes", "POST", data);
  }

  async updateCliente(id, data) {
    return this.request(`/api/v1/clientes/${id}`, "PATCH", data);
  }

  async deleteCliente(id) {
    return this.request(`/api/v1/clientes/${id}`, "DELETE");
  }

  async getComandas() {
    return this.request("/api/v1/comandas");
  }

  async getComandaById(id) {
    return this.request(`/api/v1/comandas/${id}`);
  }

  async createComanda() {
    return this.request("/api/v1/comandas", "POST");
  }

  async updateComanda(id, data) {
    return this.request(`/api/v1/comandas/${id}`, "PATCH", data);
  }

  async confirmComanda(id) {
    return this.request(`/api/v1/comandas/${id}/confirmar`, "PATCH");
  }

  async deleteComanda(id) {
    return this.request(`/api/v1/comandas/${id}`, "DELETE");
  }

  async addItemComanda(data) {
    return this.request("/api/v1/comandas/item", "POST", data);
  }

  async getEnderecos() {
    return this.request("/api/v1/enderecos");
  }

  async getEnderecoById(id) {
    return this.request(`/api/v1/enderecos/${id}`);
  }

  async createEndereco(data) {
    return this.request("/api/v1/enderecos", "POST", data);
  }

  async updateEndereco(id, data) {
    return this.request(`/api/v1/enderecos/${id}`, "PATCH", data);
  }

  async deleteEndereco(id) {
    return this.request(`/api/v1/enderecos/${id}`, "DELETE");
  }

  async getProdutos() {
    return this.request("/api/v1/produtos");
  }

  async getProdutoById(id) {
    return this.request(`/api/v1/produtos/${id}`);
  }

  async createProduto(data) {
    return this.request("/api/v1/produtos", "POST", { data });
  }

  async updateProduto(id, data) {
    return this.request(`/api/v1/produtos/${id}`, "PATCH", { data });
  }

  async deleteProduto(id) {
    return this.request(`/api/v1/produtos/${id}`, "DELETE");
  }
}

// Exemplo de uso:
// const api = new ApiService("http://localhost:5109");
// api.getClientes().then(clientes => console.log(clientes));

export default ApiService;
