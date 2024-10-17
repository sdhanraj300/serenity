"use client";
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion } from 'framer-motion'; ``
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormLabel,
    FormItem,
    FormMessage
} from '@/components/ui/form';
import * as React from 'react';
import toast from 'react-hot-toast';
import { slideIn } from '@/utils/motion';
import { useSession } from 'next-auth/react';
import { UploadButton } from '@uploadthing/react';
import { Event } from '@prisma/client';
import { useState, useEffect } from 'react';
import { OurFileRouter } from '../api/uploadthing/core';
const formSchema = z.object({
    name: z.string().min(5, 'Name must be at least 5 characters').max(50, 'Name must be at most 50 characters'),
    description: z.string().min(5, 'Description must be at least 5 characters').max(500, 'Description must be at most 500 characters'),
    type: z.string().min(5, 'Type must be at least 5 characters').max(50, 'Type must be at most 50 characters'),
    date: z.string().refine((date) => (!isNaN(Date.parse(date))), 'Invalid date format'),
    startTime: z.string().regex(/^\d{2}:\d{2}$/, "Time must be in hh:mm format"),
    endTime: z.string().regex(/^\d{2}:\d{2}$/, "Time must be in hh:mm format"),
    location: z.string().min(5, 'Location must be at least 5 characters').max(50, 'Location must be at most 50 characters'),
    additionalNotes: z.string().max(500, 'Additional notes must be at most 500 characters').optional(),
    imageUrl: z.string().default(`https://utfs.io/f/W6SBtRWXE5Y4RkL3yawLgUf0Nm1WvPcMlXAhQ35brGe4FuI6`)
});

export default function EventPage() {
    const { data: session } = useSession();
    const router = useRouter();
    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: '',
            description: '',
            type: '',
            date: '',
            startTime: '',
            endTime: '',
            location: '',
            additionalNotes: '',
            imageUrl: `https://utfs.io/f/W6SBtRWXE5Y4RkL3yawLgUf0Nm1WvPcMlXAhQ35brGe4FuI6`
        }
    });
    const { handleSubmit, formState, setValue } = form;
    const { errors } = formState;
    const [uploadedUrl, setUploadedUrl] = useState('');
    useEffect(() => {
        if (uploadedUrl) {
            setValue('imageUrl', uploadedUrl);
        }
    }, [uploadedUrl, setValue]);
    const onSubmit = async (data: any) => {
        const parsedData: Event = {
            ...data,
            invitationSent: false,
            date: new Date(data.date),
            activities: [],
        };
        console.log(parsedData);
        toast.promise(
            fetch('/api/events', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(parsedData)
            })
                .then((res) => {
                    res.json();
                    router.push('/my-events');
                }),
            {
                loading: 'Creating event...',
                success: 'Event created successfully',
                error: 'Failed to create event'
            }
        );
    };

    if (!session) {
        router.push('/login');
        return null;
    }


    return (
        <motion.div
            variants={slideIn('top', 'spring', 0.5, 0.5)}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="mt-20 items-center justify-center gap-10 w-full flex-col md:flex-row flex"
        >
            <div className="p-6 w-full md:w-[50%] bg-black/40 text-gray-300 shadow-md rounded-[28px]">
                <Form {...form}>
                    <form action="POST" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        {/* Event Name */}
                        <FormField control={form.control} name="name" render={({ field }) => (
                            <FormItem>
                                <FormControl>
                                    <Input {...field} id="name" placeholder="Give Your Event A Name..." className="mt-1 py-8 font-bold bg-black/50 text-2xl md:text-4xl block border-none shadow-sm" />
                                </FormControl>
                                <FormMessage className="text-red-500">{errors.name?.message}</FormMessage>
                            </FormItem>
                        )} />

                        {/* Event Type */}
                        <FormField control={form.control} name="type" render={({ field }) => (
                            <FormItem>
                                <FormControl>
                                    <Input {...field} id="type" placeholder="Type of Your Event..." className="font-bold mt-1 p-2 block w-full border-none bg-black/50 rounded-[5px]" />
                                </FormControl>
                                <FormMessage className="text-red-500">{errors.type?.message}</FormMessage>
                            </FormItem>
                        )} />

                        {/* Description */}
                        <FormField control={form.control} name="description" render={({ field }) => (
                            <FormItem>
                                <FormControl>
                                    <Textarea {...field} id="description" placeholder="A brief description..." className="mt-1 border-none font-bold text-left p-2 block w-full border bg-black/50 rounded-[5px] " />
                                </FormControl>
                                <FormMessage className="text-red-500">{errors.description?.message}</FormMessage>
                            </FormItem>
                        )} />

                        {/* Date */}
                        <FormField control={form.control} name="date" render={({ field }) => (
                            <FormItem>
                                <FormLabel htmlFor="date" className="block font-bold text-gray-300">Pick A Date</FormLabel>
                                <FormControl>
                                    <Input {...field} id="date" type="date" className="mt-1 p-2 !border-none bg-black/50 block w-full rounded-[5px]" />
                                </FormControl>
                                <FormMessage className="text-red-500">{errors.date?.message}</FormMessage>
                            </FormItem>
                        )} />

                        {/* Start Time */}
                        <FormField control={form.control} name="startTime" render={({ field }) => (
                            <FormItem>
                                <FormLabel htmlFor="startTime" className="block text-sm font-bold text-gray-300">Enter the Time of the Event</FormLabel>
                                <FormControl>
                                    <Input {...field} id="startTime" type="time" className="mt-1 p-2 block w-full bg-black/50 text-gray-300 !border-0 !border-none rounded-[5px]" />
                                </FormControl>
                                <FormMessage className="text-red-500">{errors.startTime?.message}</FormMessage>
                            </FormItem>
                        )} />

                        {/* End Time */}
                        <FormField control={form.control} name="endTime" render={({ field }) => (
                            <FormItem>
                                <FormLabel htmlFor="endTime" className="block text-sm font-bold text-gray-300">When Will The Event End?</FormLabel>
                                <FormControl>
                                    <Input {...field} id="endTime" type="time" className="mt-1 p-2 block w-full border-none border-black bg-black !border-0 rounded-[5px]" />
                                </FormControl>
                                <FormDescription className="text-xs text-gray-500">Enter the end time of the event</FormDescription>
                                <FormMessage className="text-red-500">{errors.endTime?.message}</FormMessage>
                            </FormItem>
                        )} />

                        {/* Location */}
                        <FormField control={form.control} name="location" render={({ field }) => (
                            <FormItem>
                                <FormControl>
                                    <Input {...field} id="location" placeholder="Pin Down The Location..." className="mt-1 p-2 font-bold block w-full border-none bg-black/50 rounded-[5px]" />
                                </FormControl>
                                <FormMessage className="text-red-500">{errors.location?.message}</FormMessage>
                            </FormItem>
                        )} />

                        {/* Additional Notes */}
                        <FormField control={form.control} name="additionalNotes" render={({ field }) => (
                            <FormItem>
                                <FormControl>
                                    <Textarea {...field} id="additionalNotes" placeholder="Any Additional Notes?" className="mt-4 p-2 block w-full border-none bg-black/50 font-bold rounded-[5px]" />
                                </FormControl>
                                <FormMessage className="text-red-500">{errors.additionalNotes?.message}</FormMessage>
                            </FormItem>
                        )} />

                        <Button type="submit" className="w-full bg-indigo-600 text-white py-2 px-4 rounded-[5px] hover:bg-indigo-700">
                            Create Event
                        </Button>
                    </form>
                </Form>
            </div>

            {/* Image Section */}
            <div>
                <motion.div className="flex items-center relative">
                    <div className="absolute items-center gap-3 bg-black rounded-[28px] px-4 py-1 flex top-[-40px] right-0 text-gray-300">
                        <p className="font-semibold">Edit Cover Image</p>

                        <UploadButton<OurFileRouter, "imageUploader">
                            className="cursor-pointer ut-button:w-[100px] ut-button:h-[30px] ut-button:bg-gray-900 ut-button:rounded-[28px] ut-allowed-content:hidden ut-label:font-bold"
                            endpoint="imageUploader"
                            onClientUploadComplete={(res) => {
                                if (res && res.length > 0) {
                                    setUploadedUrl(res[0].url);
                                }
                            }}
                            onUploadError={(error: Error) => {
                                alert(`ERROR! ${error.message}`);
                            }}
                        />
                    </div>
                    <Image
                        src={uploadedUrl || 'https://utfs.io/f/W6SBtRWXE5Y4RkL3yawLgUf0Nm1WvPcMlXAhQ35brGe4FuI6'}
                        alt="Create Event"
                        className="rounded-[5px]"
                        width={500}
                        height={500}
                    />
                </motion.div>
            </div>
        </motion.div>
    );
}
