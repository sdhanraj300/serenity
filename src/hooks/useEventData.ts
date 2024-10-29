import { Event } from "@prisma/client";
import { useQuery } from "@tanstack/react-query";

const useEventData = (eventId: string) => {
  return useQuery({
    queryKey: ["eventData", eventId],
    queryFn: async () => {
      const response = await fetch(`/api/events/${eventId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch event");
      }
      return response.json();
    },
    enabled: !!eventId,
    retry: 1,
    staleTime: 5 * 60 * 1000,
  });
};

export default useEventData;
