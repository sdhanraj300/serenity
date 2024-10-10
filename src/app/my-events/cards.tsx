"use client"
import React, { useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Clock, MapPin, Users } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useMotionValue, motion, useMotionTemplate } from 'framer-motion';
import Link from 'next/link';

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

const Cards = ({ event }: { event: Event }) => {
    const router = useRouter();
    const offsetX = useMotionValue(-100);
    const offsetY = useMotionValue(-100);
    const maskImage = useMotionTemplate`radial-gradient(100px 100px at ${offsetX}px ${offsetY}px, black, transparent)`;
    const border = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const updateMousePosition = (e: MouseEvent) => {
            if (!border.current) return;
            const rect = border.current.getBoundingClientRect();
            offsetX.set(e.clientX - rect.left);
            offsetY.set(e.clientY - rect.top);
            console.log(offsetX.get(), offsetY.get());
        }

        const borderElement = border.current;
        if (borderElement) {
            borderElement.addEventListener('mousemove', updateMousePosition);
        }

        return () => {
            if (borderElement) {
                borderElement.removeEventListener('mousemove', updateMousePosition);
            }
        }
    }, [offsetX, offsetY]);

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <Link href={`/my-events/${event.id}`}
            key={event.id}
            className="relative border hover:scale-105 transition-all duration-700 cursor-pointer bg-black border-white/10 px-5 py-10 text-center rounded-xl sm:flex-1"
        >
            <motion.div
                className="absolute inset-0 border-4 border-red-600 rounded-xl"
                style={{
                    WebkitMaskImage: maskImage,
                    maskImage,
                }}
                ref={border}
            ></motion.div>
            <div className="cursor-pointer" >
                <Card >
                    <CardHeader>
                        <CardTitle className="text-xl font-semibold">{event.name}</CardTitle>
                        <p className="text-sm text-gray-500">{event.type}</p>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-gray-500" />
                                <span className="text-sm">{formatDate(event.date)}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-gray-500" />
                                <span className="text-sm">{event.startTime} - {event.endTime}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-gray-500" />
                                <span className="text-sm">{event.location}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Users className="h-4 w-4 text-gray-500" />
                                <span className="text-sm">{event.guestList.length} guests</span>
                            </div>
                            <p className="text-sm text-gray-600 mt-2">{event.description}</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </Link>
    );
}

export default Cards;
