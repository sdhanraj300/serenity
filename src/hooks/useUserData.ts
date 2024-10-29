
import { useQuery } from "@tanstack/react-query";
const useUserData = (userId: string) => {
  return useQuery({
    queryKey: ["user", userId],
    queryFn: async () => {
      const response = await fetch(`/api/user/${userId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch user");
      }
      return response.json();
    },
    enabled: !!userId,
  });
};

export default useUserData;
