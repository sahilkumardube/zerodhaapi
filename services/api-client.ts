"use client";

import axios from "axios";

export const api = axios.create({
  baseURL: "/api",
  timeout: 20000,
});

api.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(new Error(error?.response?.data?.error ?? error.message)),
);
