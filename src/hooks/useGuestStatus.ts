import { useQuery } from "@tanstack/react-query";

const useGuestStatus = (eventId: string) => {
  return useQuery({
    queryKey: ["guestStatus", eventId],
    queryFn: async () => {
      const response = await fetch(`/api/events/${eventId}/invite`);
      if (!response.ok) {
        throw new Error("Failed to fetch guest status");
      }
      return response.json();
    },
    enabled: !!eventId,
  });
};

export default useGuestStatus;
