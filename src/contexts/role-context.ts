import { createContext } from "react";

export type Role = "Customer" | "Admin";

export type RoleContextType = {
  role: Role;
  setRole: (role: Role) => void;
};

export const RoleContext =
  createContext<RoleContextType | null>(null);
