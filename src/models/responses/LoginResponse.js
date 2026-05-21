export class LoginResponse {
  constructor(data = {}) {
    this.token = data.token || "";
    this.user = data.user || {};
    this.role = data.role ?? 3;
    this.expiresAt = data.expiresAt || null;
  }
}
