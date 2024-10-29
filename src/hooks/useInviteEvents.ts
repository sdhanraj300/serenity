import { useQuery } from "@tanstack/react-query";

const useInvitedEvents = (userEmail: string) => {
  return useQuery({
    queryKey: ["invitedEvents", userEmail],
    queryFn: async () => {
      const response = await fetch(`/api/events/invited/${userEmail}`);
      if (!response.ok) {
        throw new Error("Failed to fetch invited events");
      }
      return response.json();
    },
    enabled: !!userEmail,
  });
};

export default useInvitedEvents;
