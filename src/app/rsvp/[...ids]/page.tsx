"use client";
import { useParams, useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { Event, Guest } from '@prisma/client'
import { Check, Clock, Notebook, Pin, X } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
function convertTo12HourFormat(time: string) {
  const [hours, minutes] = time.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const adjustedHours = hours % 12 || 12;
  return `${adjustedHours}:${minutes.toString().padStart(2, '0')} ${period}`;
}
const Page = () => {
  const router = useRouter();
  const [event, setEvent] = useState<Event>();
  const [guest, setGuest] = useState<Guest>();
  const { ids } = useParams();
  const eventId = ids[0];
  const guestId = ids[1];
  useEffect(() => {
    const fetchEventDetails = async () => {
      if (!eventId) return;
      toast.promise(
        fetch(`/api/events/${eventId}`)
          .then((res) => res.json())
          .then((data) => {
            setEvent({
              ...data.event,
              date: new Date(data.event.date),
            });
          }),
        {
          loading: 'Loading event details...',
          success: 'Event details loaded!',
          error: 'Failed to load event details',
        }
      )
    };

    const fetchGuestDetails = async () => {
      if (!guestId) return;
      const res = await fetch(`/api/guests/${guestId}`);
      const data = await res.json();
      setGuest(data.guest);
    };

    if (eventId && guestId) {
      fetchEventDetails();
      fetchGuestDetails();
    }
  }, [eventId, guestId]);
  const handleClick = async (response: string) => {
    toast.promise(
      fetch(`/api/guests/${guestId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ response }),
      })
        .then((res) => res.json())
        .then(() => {
          router.push(`/`);
        }),
      {
        loading: 'Updating response...',
        success: 'Response updated!',
        error: 'Failed to update response',
      }
    );
  }
  if (!event) return <div>Loading...</div>;
  if (guest?.status === 'ACCEPTED') {
    return (
      <div className='flex min-h-screen flex-col items-center justify-center mt-20 gap-10'>
        <h1 className='text-4xl text-green-600 font-bold'>You Have Already Accepted The Invitation!</h1>
        <Image src={event.coverImage} height={500} width={500} className='mt-10' alt='party' />
      </div>
    );
  }
  if (guest?.status === 'DECLINED') {
    return (
      <div className='flex flex-col min-h-screen items-center mt-20 justify-center gap-10'>
        <h1 className='text-4xl text-red-600 font-bold'>You Have Already Declined The Invitation!</h1>
        <Image src={event.coverImage} height={500} width={500} className='mt-10' alt='party' />
      </div>
    );
  }
  return (
    <motion.div
      className='mt-20 flex md:flex-row min-h-screen flex-col mx-4 items-center justify-center gap-40'
      initial={{ opacity: 0, y: -20 }}  // Animation starts off-screen
      animate={{ opacity: 1, y: 0 }}     // Animation brings it back to normal
      transition={{ duration: 0.5 }}
    >
      <div className="mt-10 flex flex-col gap-10">
        <h1 className='text-2xl italic'>Congrats You Have Made It On The List!</h1>
        <h1 className='text-5xl text-gray-400 font-bold'>{event.name}</h1>
        <span className='text-3xl font-bold flex justify-center items-center gap-3'>
          <Clock className='h-5 w-5 text-red-600' />
          {event.date.toLocaleDateString()} -
          {convertTo12HourFormat(event.startTime)} to {convertTo12HourFormat(event.endTime)}
        </span>
        <span className='flex items-center text-xl font-bold gap-3'>
          <Pin className='h-5 w-5 text-red-600' /><p>
            {event.location}
          </p>
        </span>
        <span className='text-wrap flex items-center gap-2 text-xl font-bold'>
          <Notebook className='h-5 w-5 text-red-600' />
          {event.description}</span>
        <span>{event.additionalNotes}</span>
      </div>
      <div className="">
        <Image src={event.coverImage} className='mt-10' height={500} width={500} alt='party' />
        <div className="flex justify-center items-center gap-10 mt-10 flex-wrap">
          <Button onClick={() => handleClick("Yes")} className='flex bg-black flex-col w-40 h-40 hover:bg-gray-700 transition-all duration-300 rounded-full'>
            <span className='rounded-full'>
              <Check className="text-gray-300 h-15 w-15" />
            </span>
            <p className='text-xl font-bold'>Going</p>
          </Button>
          <Button onClick={() => handleClick("Not")} className='flex bg-black flex-col w-40 h-40 hover:bg-gray-700 transition-all duration-300 rounded-full'>
            <span className='rounded-full w-15 h-15'>
              <X className="text-gray-300" />
            </span>
            <p className='text-xl font-bold'>Can&apos;t Go</p>
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default Page;
