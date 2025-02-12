import { getUserInfo, signOut as signOutService } from "@/services/database";
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
