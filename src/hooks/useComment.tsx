import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

interface CommentSubmission {
    comment: string | null;
    imageUrl: string | null;
    userName: string | null;
    gifUrl: string | null;
    eventId: string;
    userId: string | undefined;
}

const useComment = (eventId: string) => {
    const queryClient = useQueryClient();

    return useMutation<Comment, unknown, CommentSubmission>({
        mutationFn: async (data) => {
            const response = await fetch(`/api/comment/${eventId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                throw new Error("Failed to add comment");
            }

            return response.json(); // Ensure this matches your expected return type
        },
        onSuccess: (data) => { // You can access returned data here
            toast.dismiss();
            toast.success("Comment added successfully!");
            queryClient.invalidateQueries({ queryKey: ['eventData', eventId] });
        },
        onError: (error) => {
            toast.dismiss();
            toast.error("Failed to add comment. Please try again.");
            console.error("Error adding comment:", error);
        },
        onMutate: () => {
            toast.loading("Adding Comment...");
        },
    });
}

export default useComment;
