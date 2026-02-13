import { useState } from "react";
import { RoleContext} from "./role-context";
import type {   Role } from "./role-context";

export const RoleProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [role, setRole] = useState<Role>("Customer");

  return (
    <RoleContext.Provider value={{ role, setRole }}>
      {children}
    </RoleContext.Provider>
  );
};