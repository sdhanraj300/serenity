import { useQuery } from "@tanstack/react-query";

const useGuestRSVPStatus = (guestId: string) => {
  return useQuery({
    queryKey: ["guestRSVPStatus", guestId],
    queryFn: async () => {
      const response = await fetch(`/api/guests/${guestId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch guest status");
      }
      return response.json();
    },
    enabled: !!guestId,
  });
};

export default useGuestRSVPStatus;
