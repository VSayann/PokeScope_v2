import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";

export function useAuth() {
    const [location] = useLocation();
  const queryClient = useQueryClient();

  const { data: user, isLoading } = useQuery<{ id: number; email: string; username?: string; profileImageUrl?: string } | undefined>({
    queryKey: ["user"],
    enabled: location !== "/login" && location !== "/register",
    retry: false,
    queryFn: async () => {
      const res = await fetch("/api/auth/user", { credentials: "include" });
      if (!res.ok) return undefined;
      return res.json();
    },
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    refresh: () => queryClient.invalidateQueries({ queryKey: ["user"] }),
  };
}
