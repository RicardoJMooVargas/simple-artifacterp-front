export class UserResponse {
  constructor(data = {}) {
    this.id = data.id || "";
    this.userName = data.userName || "";
    this.email = data.email || "";
    this.displayName = data.displayName || "";
    this.userType = data.userType || 3;
    this.role = data.role || 3;
    this.createdAt = data.createdAt || "";
  }
}
