import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { BackendRole, DisplayRole, Role } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatRole(role?: string | null): string {
  if (!role) return "";
  switch (role) {
    case "FLEET_MANAGER":
      return "Fleet Manager";
    case "DISPATCHER":
      return "Dispatcher";
    case "SAFETY_OFFICER":
      return "Safety Officer";
    case "FINANCIAL_ANALYST":
      return "Financial Analyst";
    default:
      return role;
  }
}

export function toBackendRole(role?: string | null): BackendRole {
  switch (role) {
    case "Fleet Manager":
    case "FLEET_MANAGER":
      return "FLEET_MANAGER";
    case "Dispatcher":
    case "DISPATCHER":
      return "DISPATCHER";
    case "Safety Officer":
    case "SAFETY_OFFICER":
      return "SAFETY_OFFICER";
    case "Financial Analyst":
    case "FINANCIAL_ANALYST":
      return "FINANCIAL_ANALYST";
    default:
      return "FLEET_MANAGER";
  }
}
