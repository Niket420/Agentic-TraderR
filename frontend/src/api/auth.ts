import { apiConfig, request, simulateLatency } from "./client";
import type { AuthCredentials, AuthUser } from "@/types/auth";

/**
 * Auth is fully mocked in demo mode — any email/password combination
 * succeeds, and the frontend never persists the password, only the
 * returned profile. A real deployment points this at the Python
 * backend's session endpoints, which own credential verification.
 *
 *   POST /auth/login
 *   POST /auth/signup
 *   POST /auth/logout
 */
export const authApi = {
  async login({ email }: AuthCredentials): Promise<AuthUser> {
    if (apiConfig.useMocks) {
      await simulateLatency(400, 800);
      return { email, name: email.split("@")[0] };
    }
    return request<AuthUser>("/auth/login", { method: "POST", body: JSON.stringify({ email }) });
  },

  async signup({ email, name }: AuthCredentials): Promise<AuthUser> {
    if (apiConfig.useMocks) {
      await simulateLatency(400, 800);
      return { email, name: name?.trim() || email.split("@")[0] };
    }
    return request<AuthUser>("/auth/signup", { method: "POST", body: JSON.stringify({ email, name }) });
  },

  async logout(): Promise<void> {
    if (apiConfig.useMocks) {
      await simulateLatency(150, 300);
      return;
    }
    await request<void>("/auth/logout", { method: "POST" });
  },
};
