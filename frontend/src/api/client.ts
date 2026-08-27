/**
 * Base API client. In demo mode (default, no Python backend running yet)
 * every domain service short-circuits to the mock layer. Flip
 * VITE_USE_MOCKS=false once the backend is live and every service in
 * this directory will route through `request` / `openEventStream`
 * instead — no component code changes required.
 */

const env = (import.meta as unknown as { env: Record<string, string | undefined> }).env;

export const apiConfig = {
  useMocks: env.VITE_USE_MOCKS !== "false",
  baseUrl: env.VITE_API_BASE_URL ?? "/api",
  wsBaseUrl: env.VITE_WS_BASE_URL ?? (env.VITE_API_BASE_URL ?? "/api").replace(/^http/, "ws"),
};

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${apiConfig.baseUrl}${path}`, {
    credentials: "include",
    ...options,
    headers: { "Content-Type": "application/json", ...options.headers },
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new ApiError(res.status, body || res.statusText);
  }
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

/** Opens a real-time event stream for a run. Production implementation
 * uses a WebSocket; swap for EventSource here if the backend prefers SSE. */
export function openEventStream(path: string, onMessage: (raw: string) => void, onError?: (err: Event) => void): () => void {
  const socket = new WebSocket(`${apiConfig.wsBaseUrl}${path}`);
  socket.onmessage = (msg) => onMessage(msg.data);
  if (onError) socket.onerror = onError;
  return () => socket.close();
}

export function simulateLatency(minMs = 220, maxMs = 520): Promise<void> {
  const ms = minMs + Math.random() * (maxMs - minMs);
  return new Promise((resolve) => setTimeout(resolve, ms));
}
