export class LoginRequest {
  constructor(data = {}) {
    this.userName = data.userName || "";
    this.password = data.password || "";
  }
}
