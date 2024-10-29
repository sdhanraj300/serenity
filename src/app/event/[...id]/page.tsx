"use client";
import React, { useEffect } from 'react';
import useEventData from '@/hooks/useEventData';
import { useSession } from 'next-auth/react';
import toast from 'react-hot-toast';
import { useParams, useRouter } from 'next/navigation';
import { FidgetSpinner } from 'react-loader-spinner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Clock, MapPin, Users } from 'lucide-react';
import { formatDate } from '@/app/my-events/[...id]/page';
import Image from 'next/image';
import useGuestStatus from '@/hooks/useGuestStatus';
import { Comment, Guest } from '@prisma/client';
import { Input } from '@/components/ui/input';
import { UploadButton } from '@uploadthing/react';
import { OurFileRouter } from '@/app/api/uploadthing/core';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import useComment from '@/hooks/useComment';

const formSchema = z.object({
    comment: z.string().min(5, { message: 'Comment must be at least 5 characters' }).optional().default(''),
    imageUrl: z.string().optional().default(''),
});

type FormData = z.infer<typeof formSchema>;

const EventPage = () => {
    const { data: session } = useSession();
    const [guestRSVPStatus, setGuestRSVPStatus] = React.useState({ status: '', id: '' });
    const router = useRouter();
    const { id } = useParams();
    const { data: guestStatus } = useGuestStatus(id[0]);
    const { data: eventData, isError, isLoading, error } = useEventData(id[0]);

    React.useMemo(() => {
        if (guestStatus?.guests && session?.user?.email) {
            const currentGuest = guestStatus.guests.find(
                (guest: Guest) => guest.email === session?.user?.email
            );

            if (currentGuest && currentGuest.status !== guestRSVPStatus.status) {
                setGuestRSVPStatus({ status: currentGuest.status, id: currentGuest.id });
            }
        }
    }, [guestStatus, session?.user?.email, guestRSVPStatus.status]);

    useEffect(() => {
        if (guestRSVPStatus?.status === 'PENDING') {
            toast.error('RSVP Now to interact with this event');
            router.push(`/rsvp/${id[0]}/${guestRSVPStatus.id}`);
        }
    }, [guestRSVPStatus, router, id]);

    const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<FormData>({
        resolver: zodResolver(formSchema),
        defaultValues: { comment: '', imageUrl: '' },
    });

    const mutation = useComment(id[0]);



    const onSubmit = (data: FormData) => {
        const dataWithEventId = {
            comment: data.comment || null,
            imageUrl: data.imageUrl || null,
            gifUrl: null,
            eventId: id[0],
            userName: session?.user?.name!,
            userId: session?.user?.id,
        };
        setValue('comment', '');
        setValue('imageUrl', '');
        mutation.mutate(dataWithEventId);
    };
    if (guestRSVPStatus.status === 'DECLINED') {
        return (
            <div className='mt-20'>
                <h1 className="text-3xl font-bold text-center mt-20">You have declined this event</h1>
            </div>
        );
    }
    if (isLoading) {
        return <div className="flex justify-center items-center h-screen"><FidgetSpinner visible height="80" width="80" ariaLabel="fidget-spinner-loading" /></div>;
    }

    if (isError) {
        toast.error(error.message);
    }

    if (!session) {
        toast.error('You need to be logged in to view this page');
        router.push('/login');
    }

    const imgUrl = watch('imageUrl');
    const event = eventData?.event;

    return (
        <motion.div className="mt-20 mx-4 bg-black max-w-5xl rounded-[28px] md:mx-auto min-h-screen"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
        >
            <Card className="shadow-lg text-gray-300 sm:flex md:block flex-col w-full items-center justify-center rounded-xl">
                <CardHeader className="text-center">
                    <CardTitle className="text-3xl font-bold">{event?.name}</CardTitle>
                    <p className="text-sm text-gray-400">{event?.type}</p>
                </CardHeader>
                <CardContent className="gap-10 md:justify-between">
                    <div className="flex justify-between md:flex-row flex-col w-full">
                        <div className="flex flex-col gap-4">
                            <div className="flex items-center gap-4 mt-4">
                                <Calendar className="h-6 w-6 text-green-500" />
                                <span className="text-lg">{formatDate(event?.date!)}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Clock className="h-6 w-6 text-violet-500" />
                                <span className="text-lg">{event?.startTime} - {event?.endTime}</span>
                            </div>
                            <div className="flex items-center mt-4 gap-2">
                                <MapPin className="h-6 w-6 text-red-600" />
                                <span className="text-lg">{event?.location}</span>
                            </div>
                            <div className="mt-4">
                                <div className="flex items-center gap-2">
                                    <Users className="h-6 w-6 text-blue-500" />
                                    <span className="text-lg">{event?.guestList.length} Guests</span>
                                </div>
                            </div>
                            {event?.description && (
                                <div className="mt-4">
                                    <h2 className="text-lg font-bold">Description</h2>
                                    <p className="text-sm">{event?.description}</p>
                                </div>
                            )}
                            {event?.additionalNotes && (
                                <div className="mt-4">
                                    <h2 className="text-lg font-bold">Additional Notes</h2>
                                    <p className="text-sm text-red-600">*{event?.additionalNotes}</p>
                                </div>
                            )}
                        </div>
                        <motion.div className="hover:scale-105 transition-all duration-300 ease-in-out">
                            <Image className="rounded-[28px]" src={event?.coverImage!} alt="event image" width={400} height={400} />
                        </motion.div>
                    </div>
                    <div className="mt-10 space-y-4">
                        {guestStatus?.guests.map((guest: Guest) => (
                            <div key={guest.id} className="flex justify-between w-1/2 items-center gap-4">
                                <span>{guest.email}</span>
                                <p className={`text-lg ${guest.status === "ACCEPTED" ? 'text-green-600' : guest.status === "DECLINED" ? 'text-red-600' : 'text-yellow-600'}`}>
                                    {guest.status}
                                </p>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
            <h1 className='font-bold text-3xl ml-20 mt-3'>Comments!</h1>
            <div className="mt-4">
                {event?.comments.length > 0 && (
                    <div className="mt-4 overflow-y-auto max-h-[600px]">
                        {event.comments.map((comment: Comment) => (
                            <Card
                                key={comment.id}
                                className="mb-4 pt-3 rounded-[28px] bg-[#310202] text-gray-300 flex md:w-1/2"
                            >
                                <CardHeader>
                                    <CardTitle className="w-10 h-10 flex items-center justify-center rounded-[28px] bg-red-500 font-bold">
                                        {comment.userName.charAt(0)}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="ml-[-30px]">
                                        <div className="flex flex-col">
                                            {comment.imageUrl && (
                                                <Image
                                                    src={comment.imageUrl}
                                                    alt="comment image"
                                                    width={200}
                                                    height={200}
                                                    className="rounded-[18px]"
                                                />
                                            )}
                                            <p className="mt-8">{comment.comment}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
            <div className="mt-8 p-4">
                {imgUrl && <Image src={imgUrl} alt="reaction image" width={100} height={100} className="mb-4" />}
                <UploadButton<OurFileRouter, 'imageUploader'>
                    endpoint="imageUploader"
                    onClientUploadComplete={(res) => {
                        if (res) {
                            setValue('imageUrl', res[0].url);
                        }
                    }}
                    onUploadError={(error: Error) => alert(`Upload failed: ${error.message}`)}
                    className="cursor-pointer ut-button:w-[100px] ut-button:h-[30px] ut-button:bg-gray-900 ut-button:rounded-[28px] mb-4"
                />
                <div className="bg-gray-900 rounded-[28px] flex items-center gap-2">
                    <Input
                        className="!border-none w-full"
                        placeholder="Comment"
                        {...register('comment')}
                    />
                    <Button
                        onClick={handleSubmit(onSubmit)}
                        className="px-10 bg-blue-600 hover:bg-blue-700 text-white rounded-[28px]"
                    >
                        Post
                    </Button>
                </div>
                {errors.comment && <p className="text-red-500 mt-2">{errors.comment.message}</p>}
            </div>
        </motion.div>
    );
};

export default EventPage;
