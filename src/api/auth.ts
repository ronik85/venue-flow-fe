import api from "./axios";
import type { AxiosResponse } from "axios";
import type { LoginResponse } from "../types";

export const register = (
  email: string,
  password: string,
): Promise<AxiosResponse> => api.post("/auth/register", { email, password });

export const login = (
  email: string,
  password: string,
): Promise<AxiosResponse<LoginResponse>> =>
  api.post("/auth/login", { email, password });
