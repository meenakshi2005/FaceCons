export const BASE_URL =
  "https://554e-103-177-178-121.ngrok-free.app";

type RequestOptions = {
  method?: string;
  body?: any;
  headers?: Record<string, string>;
};

export async function api<T = any>(path: string, options: RequestOptions = {}): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 20000);

  try {
    const headers: Record<string, string> = {
      Accept: "application/json",
      ...(options.headers || {}),
    };

    let body = options.body;
    if (body !== undefined && body !== null && !(body instanceof FormData)) {
      headers["Content-Type"] = "application/json";
      body = JSON.stringify(body);
    }

    const response = await fetch(`${BASE_URL}${path}`, {
      method: options.method || "GET",
      headers,
      body,
      signal: controller.signal,
    });

    const contentType = response.headers.get("content-type") || "";
    const data = contentType.includes("application/json")
      ? await response.json()
      : await response.text();

    if (!response.ok) {
      const message =
        typeof data === "object" && data?.error
          ? data.error
          : `Request failed (${response.status})`;
      throw new Error(message);
    }
    return data as T;
  } finally {
    clearTimeout(timer);
  }
}

export const photoUrl = (guestId: string, timestamp?: number | string) =>
  `${BASE_URL}/guests/${encodeURIComponent(guestId)}/photo${timestamp ? `?t=${timestamp}` : ""}`;

export const employeePhotoUrl = (employeeId: string) =>
  `${BASE_URL}/employees/${encodeURIComponent(employeeId)}/photo`;

export const guestsApi = {
  list: (status?: string) => api(`/guests${status ? `?status=${status}` : ""}`),
  search: (q: string) => api(`/guests/search?q=${encodeURIComponent(q)}`),
  get: (id: string) => api(`/guests/${id}`),
  addDetails: (id: string, body: { name: string; phone: string }) =>
    api(`/guests`, { method: "POST", body: { guest_id: id, ...body } }),
  manual: (name: string, phone: string) =>
    api(`/guests/manual`, { method: "POST", body: { name, phone } }),
  merge: (id: string, body: { existing_guest_id: string; force: boolean; phone: string }) =>
    api(`/guests/${id}/merge`, { method: "POST", body }),
  optIn: (id: string, body?: { phone?: string; name?: string }) =>
    api(`/guests/${id}/opt-in`, { method: "POST", body }),
  verifyOtp: (id: string, otp: string) =>
    api(`/guests/${id}/verify-otp`, { method: "POST", body: { otp } }),
  optOut: (id: string) => api(`/guests/${id}/opt-out`, { method: "POST" }),
  remove: (id: string) => api(`/guests/${id}`, { method: "DELETE" }),
  history: (id: string, query = "") => api(`/guests/${id}/history${query}`),
  visits: (id: string, query = "") => api(`/guests/${id}/visits${query}`),
  visitsByPhone: (phone: string, query = "") =>
    api(`/guests/phone/${encodeURIComponent(phone)}/visits${query}`),
  photo: (id: string) => photoUrl(id),
  replacePhoto: (id: string, body: FormData) =>
    api(`/guests/${id}/photo`, { method: "PUT", body }),
};

export const tablesApi = {
  arrivals: (minutes = 60, limit = 50) =>
    api(`/waiter/arrivals?minutes=${minutes}&limit=${limit}`),
  engage: (table: string | number, body: any) =>
    api(`/tables/${encodeURIComponent(String(table))}/engage`, { method: "POST", body }),
  current: (table: string | number) =>
    api(`/tables/${encodeURIComponent(String(table))}/current`),
  all: () => api(`/tables`),
  active: () => api(`/tables/active`),
  release: (table: string | number, body?: any) =>
    api(`/tables/${encodeURIComponent(String(table))}/release`, { method: "POST", body: body || {} }),
  releaseGuest: (guest_id: string) =>
    api(`/guests/${guest_id}/release`, { method: "POST" }),
  report: (table: string | number, query = "") =>
    api(`/tables/${encodeURIComponent(String(table))}/report${query}`),
  reportAll: (query = "") => api(`/tables/report${query}`),
  scanOccupancy: (table_id: string, extraData: any = {}) =>
    api(`/tables/scan`, { method: "POST", body: { table_id, action: "occupy", ...extraData } }),
};

export const ordersApi = {
  create: (body: any) => api(`/orders`, { method: "POST", body }),
};

export const employeesApi = {
  list: () => api(`/employees`),
  createJson: (body: any) => api(`/employees`, { method: "POST", body }),
  update: (id: string, body: any) =>
    api(`/employees/${id}`, { method: "PUT", body }),
  remove: (id: string) => api(`/employees/${id}`, { method: "DELETE" }),
  photo: (id: string) => employeePhotoUrl(id),
};

export const scannerApi = {
  run: () => api(`/scan/run`, { method: "POST" }),
  webhook: (filename?: string) =>
    api(`/webhook/new-photo`, { method: "POST", body: filename ? { filename } : {} }),
  health: () => api(`/health`),
};

export const posApi = {
  sync: () => api(`/integrations/pos/sync`, { method: "POST" }),
};

export const devApi = {
  seed: (body: any) => api(`/dev/seed-dummy`, { method: "POST", body }),
  clear: () => api(`/dev/dummy`, { method: "DELETE" }),
};
