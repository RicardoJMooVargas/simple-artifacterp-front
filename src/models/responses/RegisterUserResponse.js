export class RegisterUserResponse {
  constructor({
    id = "",
    userName = "",
    email = "",
    displayName = "",
    userType = 1,
    role = 1,
    createdAt = null,
  } = {}) {
    this.id = id;
    this.userName = userName;
    this.email = email;
    this.displayName = displayName;
    this.userType = userType;
    this.role = role;
    this.createdAt = createdAt;
  }
}
