import { useMutation } from "@tanstack/react-query";
import { loginUser, registerUser, logoutUser } from "@/lib/api/auth";
import { useAuth } from "@/providers/AuthProvider";
import { UserRole } from "@/types/auth";

export function useLoginMutation() {
  const { login } = useAuth();

  return useMutation({
    mutationFn: (credentials: { email: string; password: string }) =>
      loginUser(credentials),
    onSuccess: (data) => {
      login(data.accessToken, data.user);
    },
  });
}

export function useRegisterMutation() {
  const { login } = useAuth();

  return useMutation({
    mutationFn: (payload: {
      name: string;
      email: string;
      password: string;
      phone: string;
      role: UserRole;
    }) => registerUser(payload),
    onSuccess: (data) => {
      login(data.accessToken, data.user);
    },
  });
}

export function useLogoutMutation() {
  const { logout } = useAuth();

  return useMutation({
    mutationFn: logoutUser,
    onSettled: () => {
      logout();
    },
  });
}
