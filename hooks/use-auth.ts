import { getUserInfo, isUserAuthenticated, signOut as signOutService } from "@/services/database";
import useQueryCacheKeys from "@/utils/use-query-cache-keys";
import { useMutation, useQuery } from "@tanstack/react-query";

export const useAuth = () => {
  const { data: userInfo, isLoading: isUserInfoLoading } = useQuery({
    queryKey: ["userInfo"],
    queryFn: () => getUserInfo(),
  });
  const { mutateAsync: signOut, isPending: isSigningOut } = useMutation({
    mutationFn: () => signOutService(),
  });

 

  return { userInfo, isUserInfoLoading, signOut, isSigningOut };
};

export const useIsAuthenticated = () => {
  const { data: isAuthenticated, isLoading: isAuthenticatedLoading } = useQuery(
    {
      queryKey: useQueryCacheKeys.isUserAuthenticated(),
      queryFn: () => isUserAuthenticated(),
    }
  );

  return {isAuthenticated, isAuthenticatedLoading}
}
