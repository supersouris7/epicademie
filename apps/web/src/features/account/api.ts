import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api, type Login, type Me, type Signup, type StudentSignup } from '@questeo/shared';
import { request } from '../../shared/api/client.ts';

/** Session de l'appareil : compte connecté (401 si aucun, jamais retenté). */
export const meKey = ['me'] as const;

export const useMe = () =>
  useQuery({ queryKey: meKey, queryFn: () => request(api.me), retry: false, staleTime: 60_000 });

export const signup = (input: Signup) => request(api.signup, { body: input });
export const login = (input: Login) => request(api.login, { body: input });
export const signupStudent = (input: StudentSignup) => request(api.signupStudent, { body: input });
export const recoverStudent = (code: string) => request(api.recoverStudent, { body: { code } });
export const renewStudentRecovery = () => request(api.renewStudentRecovery);
export const createInvite = () => request(api.createInvite);
export const joinFamily = (code: string) => request(api.joinFamily, { body: { code } });
export const logout = () => request(api.logout);
export const confirmParent = (password: string) => request(api.confirmParent, { body: { password } });
export const unlockParentPin = (pin: string) => request(api.unlockParentPin, { body: { pin } });
export const setParentPin = (password: string, pin: string) => request(api.setParentPin, { body: { password, pin } });
export const lockParent = () => request(api.lockParent);
export const forgotPassword = (email: string) => request(api.forgotPassword, { body: { email } });
export const resetPassword = (token: string, password: string) =>
  request(api.resetPassword, { body: { token, password } });

/** Met à jour la session en cache après connexion, inscription ou déverrouillage parent. */
export function useSetMe() {
  const qc = useQueryClient();
  return (me: Me | null) => {
    if (me) qc.setQueryData(meKey, me);
    else qc.removeQueries();
  };
}
