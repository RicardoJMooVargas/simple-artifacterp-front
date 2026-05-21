export class RegisterUserRequest {
  constructor({
    userName = "",
    email = "",
    password = "",
    displayName = "",
    userType = 1,
    role = 1,
  } = {}) {
    this.userName = userName;
    this.email = email;
    this.password = password;
    this.displayName = displayName;
    this.userType = userType;
    this.role = role;
  }
}
