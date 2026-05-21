import { ApiService } from "./ApiService";
import { LoginRequest } from "../models/requests/LoginRequest";
import { RegisterUserRequest } from "../models/requests/RegisterUserRequest";

export const AuthService = {
  async login(userName, password) {
    const request = new LoginRequest({ userName, password });

    try {
      const response = await ApiService.request("systemManagerLogin", {
        body: request,
      });

      return {
        success: true,
        data: response,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  },

  async register({ userName, email, password, displayName, userType, role }) {
    const request = new RegisterUserRequest({
      userName,
      email,
      password,
      displayName,
      userType,
      role,
    });

    try {
      const response = await ApiService.request("systemManagerRegister", {
        body: request,
      });

      return {
        success: true,
        data: response,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  },

  async getUsers() {
    try {
      const response = await ApiService.request("systemManagerUsers");
      return response;
    } catch (error) {
      throw new Error(error.message || "Error al obtener usuarios");
    }
  },
};
