"use client";
import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { FidgetSpinner } from "react-loader-spinner";
import { Calendar, Edit, Shell, SquareArrowOutUpRight, TreePalm, UserIcon } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import EditDialog from "@/components/EditDialog";
import { User } from "@prisma/client";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import useUserData from "@/hooks/useUserData";
import useInvitedEvents from "@/hooks/useInviteEvents";

const AccountPage = () => {
    const { data: session, status } = useSession();
    const router = useRouter();
    const userId = session?.user?.id;
    const userEmail = session?.user?.email;
    const { data: userData, isError: isUserError, isLoading: isUserLoading, error: userError, refetch } = useUserData(userId!);
    const { data: invitedEvents, isError: isInvitedEventsError, isLoading: isInvitedEventsLoading, error: inviteDataError } = useInvitedEvents(userEmail!);
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
            toast.dismiss();
            toast.success("Profile updated successfully!");
            refetch();
        },
        onError: (error) => {
            toast.dismiss();
            toast.error("Failed to update profile. Please try again.");
            console.error("Error updating profile:", error);
        },
        onMutate: () => {
            toast.loading("Updating profile...");
        },
    });

    const [isOpen, setIsOpen] = useState(false);

    const onSubmit = (data: Partial<User>) => {
        mutation.mutate(data);
        setIsOpen(false);
    };

    const motionVariants = {
        hidden: { opacity: 0, y: 100 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
    };
    const fadeIn = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { duration: 0.5, ease: "easeOut" } } };
    const slideIn = { hidden: { x: -200, opacity: 0 }, visible: { x: 0, opacity: 1, transition: { duration: 0.7 } } };

    if (status === "loading") return null;
    if (!session) {
        toast.error("Please login to view this page");
        router.push("/login");
        return null;
    }

    if (isUserLoading || isInvitedEventsLoading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <FidgetSpinner visible={true} height="80" width="80" ariaLabel="fidget-spinner-loading" />
            </div>
        );
    }

    if (isInvitedEventsError || isUserError) {
        return (
            <div className="flex justify-center items-center h-screen">
                <p className="text-red-500">Error:
                    {isInvitedEventsError ? inviteDataError.message : userError?.message}
                </p>
            </div>
        );
    }

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={motionVariants}
            className="bg-black/50 relative mt-20 mx-4 px-4 flex h-full pb-10 flex-col items-center pt-20 min-h-screen max-w-5xl md:mx-auto text-white rounded-[28px]"
        >
            <motion.div variants={fadeIn} className="flex flex-col gap-10 items-center justify-center mb-10">
                <motion.div
                    className="w-[150px] h-[150px] rounded-full overflow-hidden relative"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                >
                    <Image src={userData?.avatar || "/default-avatar.png"} alt="User Avatar" width={150} height={150} className="rounded-full object-cover" />
                </motion.div>
                <motion.div initial="hidden" animate="visible" variants={slideIn}>
                    <Button className="bg-blue-600 text-white rounded-[28px] hover:bg-blue-500 flex items-center gap-2" onClick={() => setIsOpen(true)}>
                        <Edit size={24} />
                        Edit Profile
                    </Button>
                </motion.div>
            </motion.div>

            <motion.div className="flex flex-col w-full max-w-3xl gap-8" initial="hidden" animate="visible" variants={fadeIn}>
                <div className="hover:shadow-violet-400 shadow-sm transition-all duration-700 p-6 rounded-[28px] bg-black opacity-90">
                    <p className="text-4xl font-bold flex gap-2 items-center">
                        <UserIcon size={32} className="inline-block" />
                        {userData?.name || "User Name"}
                    </p>
                </div>

                <div className="hover:shadow-violet-400 shadow-sm transition-all duration-700 p-6 rounded-[28px] bg-[#000000] opacity-90">
                    <p className="text-xl flex gap-2 font-bold">
                        <Shell size={24} />
                        Bio
                    </p>
                    <p className="text-gray-200 text-md font-normal">{userData?.bio || "Bio not set"}</p>
                </div>

                <div className="hover:shadow-violet-400 shadow-sm transition-all duration-700 p-6 rounded-[28px] bg-black opacity-90">
                    <p className="text-2xl font-bold flex items-center gap-2">
                        <Calendar size={24} className="inline-block" />
                        {userData?.age ? `${userData?.age} years old` : "Age not set"}
                    </p>
                </div>

                {userData?.hobbies?.length > 0 && (
                    <div className="hover:shadow-violet-400 shadow-sm transition-all duration-700 p-6 rounded-[28px] bg-black opacity-90">
                        <p className="text-xl font-bold flex gap-2 items-center">
                            <TreePalm size={24} className="inline-block" />
                            Hobbies
                        </p>
                        <ul className="list-disc list-inside text-gray-200">
                            {userData?.hobbies.map((hobby: string) => (
                                <li key={hobby}>{hobby}</li>
                            ))}
                        </ul>
                    </div>
                )}

                {userData?.events?.length > 0 && (
                    <div className="hover:shadow-violet-400 shadow-sm transition-all duration-700 p-6 rounded-[28px] bg-black opacity-90">
                        <p className="text-xl font-bold flex gap-2 items-center">
                            <Calendar size={24} className="inline-block" />
                            Hosted Parties
                        </p>
                        <ul className="list-inside list-none text-gray-200">
                            {userData?.events.map(({ id, name }: { id: string, name: string }) => (
                                <li key={id} className="hover:underline flex gap-3 w-1/3 cursor-pointer justify-between">
                                    <Link href={`/my-events/${id}`}>
                                        {name}
                                    </Link>
                                    <SquareArrowOutUpRight />
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
                {invitedEvents ? (
                    <div className="hover:shadow-violet-400 shadow-sm transition-all duration-700 p-6 rounded-[28px] bg-black opacity-90">
                        <p className="text-xl font-bold flex gap-2 items-center">
                            <Calendar size={24} className="inline-block" />
                            Invited Parties
                        </p>
                        <ul className="list-inside list-none text-gray-200">
                            {Array.isArray(invitedEvents) && invitedEvents.length > 0 ? (
                                invitedEvents.map(({ id, eventId, eventName }: { id: string, eventId: string, eventName: string }) => (
                                    <li key={id}>
                                        <Link href={`event/${eventId}`} className="hover:underline flex justify-between md:justify-between md:w-1/2">
                                            {eventName}
                                            <SquareArrowOutUpRight />
                                        </Link>
                                    </li>
                                ))
                            ) : (
                                <li className="text-gray-400">
                                    <Link href={`/event/${invitedEvents?.eventId}`}>{invitedEvents?.eventName}</Link>
                                </li>
                            )}
                        </ul>
                    </div>
                ) : <p>No parties found</p>}

            </motion.div>

            <EditDialog userData={userData} isOpen={isOpen} setIsOpen={setIsOpen} onSubmit={onSubmit} />
        </motion.div>
    );
};

export default AccountPage;
