import { createContext, useContext } from 'react';
import { can, type AdminPermission, type AdminRole } from '@epicademie/shared';

/** Rôle de la personne connectée (fourni par la garde) ; le serveur reste seul juge des droits. */
export const RoleContext = createContext<AdminRole>('lecture');

export function useCan(): (permission: AdminPermission) => boolean {
  const role = useContext(RoleContext);
  return (permission) => can(role, permission);
}
