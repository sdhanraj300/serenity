"use client";
import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { FidgetSpinner } from "react-loader-spinner";
import { Calendar, Edit, TreePalm, UserIcon } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import EditDialog from "@/components/EditDialog";
import { User } from "@prisma/client";
import toast from "react-hot-toast";

const AccountPage = () => {
    const { data: session } = useSession();
    const userId = session?.user?.id;
    const [isOpen, setIsOpen] = useState(false);

    const { data: userData, isError, isLoading, error, refetch } = useQuery({
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

    const mutation = useMutation({
        mutationFn: async (data: Partial<User>) => {
            const response = await fetch(`/api/user/${userId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                throw new Error("Failed to update user");
            }
            return response.json();
        },
        onSuccess: () => {
            toast.success("Profile updated successfully!");
            refetch();
        },
        onError: () => {
            toast.error("Failed to update profile. Please try again.");
        },
    });

    const onSubmit = (data: Partial<User>) => {
        mutation.mutate(data);
        setIsOpen(false);
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <FidgetSpinner
                    visible={true}
                    height="80"
                    width="80"
                    ariaLabel="fidget-spinner-loading"
                />
            </div>
        );
    }

    if (isError) {
        return (
            <div className="flex justify-center items-center h-screen">
                <p className="text-red-500">Error: {error.message}</p>
            </div>
        );
    }

    return (
        <div className="bg-black relative mt-20 flex gap-20 flex-col items-center pt-20 min-h-screen max-w-5xl mx-auto text-white rounded-[28px]">
            <div className="flex flex-col gap-10 items-center justify-center">
                <div className="w-[150px] h-[150px] rounded-full overflow-hidden relative">
                    <Image
                        src={userData?.avatar || "/default-avatar.png"}
                        alt="User Avatar"
                        width={150}
                        height={150}
                        className="rounded-full object-cover"
                    />
                </div>
                <div className="">
                    <Button
                        className="bg-blue-600 text-white rounded-[28px] hover:bg-blue-500 flex items-center gap-2"
                        onClick={() => setIsOpen(true)}
                    >
                        <Edit size={24} />
                        Edit Profile
                    </Button>
                </div>
            </div>
            <div className="text-left">
                <p className="text-4xl font-bold items-center justify-center gap-2 flex">
                    <UserIcon size={32} className="inline-block" />
                    {userData?.name || "User Name"}</p>
                <p className="text-2xl items-center flex gap-2">
                    <Calendar size={24} className="inline-block" />
                    {userData?.age ? `${userData?.age} ` : "Age not set"}</p>
                {userData?.hobbies?.length > 0 && (
                    <div className="mt-4">
                        <p className="text-xl font-bold flex gap-2 items-center">
                            <TreePalm size={24} className="inline-block" />
                            Hobbies</p>
                        <ul className="list-disc list-inside">
                            {userData?.hobbies.map((hobby: string) => (
                                <li key={hobby}>{hobby}</li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>


            <EditDialog
                userData={userData}
                isOpen={isOpen}
                setIsOpen={setIsOpen}
                onSubmit={onSubmit}
            />
        </div>
    );
};

export default AccountPage;
