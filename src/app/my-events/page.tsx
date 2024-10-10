"use client";
import React, { useEffect, useRef, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import Cards from './cards';
interface Event {
    id: string;
    name: string;
    description: string;
    type: string;
    date: string;
    startTime: string;
    endTime: string;
    guestList: string[];
    location: string;
}

const Page = () => {
    const session = useSession();
    const { data: user, status } = session;
    const id = user?.user?.id;
    const router = useRouter();
    const [eventData, setEventData] = useState<Event[]>([]);
    const [error, setError] = useState<string | null>(null);
    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const promise = fetch(`/api/auth/userEvents/${id}`).then(async res => {
                    if (!res.ok) {
                        throw new Error('Failed to fetch events');
                    }
                    const data = await res.json();
                    setEventData(data.events);
                    return data.events;
                });

                toast.promise(
                    promise,
                    {
                        loading: 'Loading events...',
                        success: 'Events loaded',
                        error: 'Failed to load events'
                    }
                );
            } catch (err: any) {
                console.error(err);
                setError(err.message);
            }
        };

        if (id) {
            fetchEvents();
        }
    }, [id]);
    if (status === 'unauthenticated') {
        router.push('/login');
        return null;
    }


    return (
        <div className="p-6 max-w-7xl mt-20 mx-auto">
            <h1 className="text-3xl font-bold mb-6">My Events</h1>
            {eventData.length === 0 && <div>No events found.</div>}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {eventData.map((event) => (
                    <Cards event={event} key={event.id}/>
                ))}
            </div>
        </div>
    );
}

export default Page;
