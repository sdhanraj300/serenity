"use client";
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Calendar, Clock, MapPin, Pencil, Trash, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import toast from 'react-hot-toast';
import Papa from 'papaparse';
import { Event, Guest } from '@prisma/client';
import geminiFn from '@/hooks/geminiFn';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
export const formatDate = (dateString: Date) => {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
};
const EventDetailsPage = () => {
    const session = useSession();
    const router = useRouter();
    const { data: user } = session;
    const [isOpen, setIsOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [event, setEvent] = useState<Event | null>(null);
    const [loading, setLoading] = useState(true);
    const [eventData, setEventData] = useState({
        id: '',
        name: '',
        description: '',
        type: '',
        date: '',
        startTime: '',
        endTime: '',
        guestList: [] as string[],
        location: '',
        additionalNotes: '',
        userId: '',
        invitationSent: false,
        coverImage: '',
        activities: [] as string[],
    });
    const [guestStatus, setGuestStatus] = useState([]);
    const { id: eventId } = useParams();
    const [ideas, setIdeas] = useState([""]);
    const [ideasPrompt, setIdeasPrompt] = useState('Write a theme and we will suggest you something great.');
    useEffect(() => {
        async function fetchGuestStatus() {
            try {
                const response = await fetch(`/api/events/${eventId}/invite`);
                if (!response.ok) {
                    throw new Error('Failed to fetch guest status');
                }
                const data = await response.json();
                console.log('Guest status from data:', data.guests);
                setGuestStatus(data.guests);
            } catch (err) {
                console.error('Error fetching guest status:', err);
            }
        }
        fetchGuestStatus();
    }, [eventId]);

    useEffect(() => {
        const fetchEventDetails = async () => {
            if (!eventId) return;

            toast.promise(
                fetch(`/api/events/${eventId}`).then(res => {
                    if (!res.ok) throw new Error('Failed to fetch event');
                    return res.json();
                }),
                {
                    loading: 'Loading event details...',
                    success: (data) => {
                        setEvent(data.event);
                        console.log('Event data:', data.event);
                        setEventData(data.event);
                        setLoading(false);
                        return 'Event details loaded!';
                    },
                    error: 'Failed to load event details'
                }
            );
        };

        fetchEventDetails();
    }, [eventId]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setEventData(prev => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSave = async () => {
        if (eventData.date === '') {
            toast.error('Please select a date');
            return;
        }
        const updatedEventData = {
            ...eventData,
            name: eventData?.name || event?.name,
            description: eventData?.description || event?.description,
            date: new Date(eventData.date).toISOString() || event?.date,
            startTime: eventData?.startTime || event?.startTime,
            endTime: eventData?.endTime || event?.endTime,
            location: eventData?.location || event?.location,
            additionalNotes: eventData?.additionalNotes || event?.additionalNotes,
            type: eventData?.type || event?.type,
            guestList: eventData?.guestList,
        };
        toast.promise(
            fetch(`/api/events/${eventId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedEventData),
            }).then(res => {
                if (!res.ok) throw new Error('Failed to update event');
                return res.json();
            }),
            {
                loading: 'Updating event...',
                success: () => {
                    router.push('/my-events');
                    return 'Event updated successfully!';
                },
                error: 'Failed to update event'
            }
        );
    };

    const handleDelete = async () => {
        if (event?.invitationSent === true) {
            toast.error('You cannot delete an event after sending invites');
            return;
        }
        toast.promise(
            fetch(`/api/events/${eventId}`, {
                method: 'DELETE',
            }).then(res => {
                if (!res.ok) throw new Error('Failed to delete event');
                return res.json();
            }),
            {
                loading: 'Deleting event...',
                success: () => {
                    router.push('/my-events');
                    return 'Event deleted successfully!';
                },
                error: 'Failed to delete event'
            }
        );
    };
    const isValidEmail = (email: string) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(String(email).toLowerCase());
    };
    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        Papa.parse(file, {
            header: true,
            complete: (results) => {
                const validEmails = results.data.map((row: any) => row.email).filter((email: string) => isValidEmail(email));
                const inValidEmails = results.data.map((row: any) => row.email).filter((email: string) => !isValidEmail(email));
                if (validEmails.length === 0) {
                    toast.error('No valid emails found in the CSV file');
                    return;
                }
                setEventData(prev => ({
                    ...prev,
                    guestList: [...new Set([...(prev.guestList || []), ...validEmails])]
                }));
                if (inValidEmails.length > 1) {
                    toast.error('Invalid emails found in the CSV file');
                }
                toast.success('Emails added successfully');
            }
        }
        );
    }
    const handleKeyPress = (e: any) => {
        if (e.key === 'Enter') {
            const newEmails = inputValue.split(',').map(email => email.trim()).filter(email => email);
            setEventData(prev => ({
                ...prev,
                guestList: [
                    ...new Set([...prev.guestList, ...newEmails])
                ]
            }));
        }
    };
    const [inputValue, setInputValue] = useState('');

    const handleInputChange2 = (e: any) => {
        setInputValue(e.target.value);
    };
    const handleRemoveGuest = (index: number) => {
        if (event?.invitationSent === true) {
            toast.error('You cannot remove guests after sending invites');
            return;
        }
        setEventData(prev => ({
            ...prev,
            guestList: prev.guestList.filter((_, i) => i !== index)
        }));
    }
    if (loading) return <div>Loading...</div>;
    if (!event) return <div>No event found</div>;

    
    const handleInvite = async () => {
        try {
            if (eventData.guestList.length === 0) {
                toast.error('Please add guests to invite');
                return;
            }

            const finalEventId = Array.isArray(eventId) ? eventId[0] : eventId;
            const emailData = {
                guestList: eventData.guestList,
                eventId: finalEventId,
            };
            const emailPromise = fetch(`/api/events/${finalEventId}/invite`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(emailData),
            }).then(res => {
                if (!res.ok) throw new Error('Failed to send email');
                return res.json();
            });

            const updatePromise = fetch(`/api/events/${finalEventId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ invitationSent: true }),
            }).then(res => {
                if (!res.ok) throw new Error('Failed to update event status');
                router.push('/my-events');
                return res.json();
            });
            toast.promise(
                Promise.all([emailPromise, updatePromise]),
                {
                    loading: 'Sending invites...',
                    success: 'Invites sent successfully!',
                    error: 'Failed to send invites'
                }
            );
            await Promise.all([emailPromise, updatePromise]);

        } catch (error) {
            console.error('Error in handleInvite:', error);
            toast.error('An error occurred while sending invites');
        }
    };
    const handleGenerateIdeas = async () => {
        const ideasPromise = geminiFn(ideasPrompt, eventData.type);
        toast.promise(
            ideasPromise,
            {
                loading: 'Generating ideas...',
                success: 'Ideas generated successfully!',
                error: 'Failed to generate ideas'
            }
        );
        try {
            const ideas = await ideasPromise;
            if (ideas) {
                setIdeas(ideas);
            }
        } catch (error) {
            console.error('Error generating ideas:', error);
        }
    };
    const handleIdeasSave = async () => {
        console.log('Ideas to save:', ideas);
        const updatedEventData = {
            ...eventData,
            activities: ideas,
        };
        toast.promise(
            fetch(`/api/events/${eventId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedEventData),
            }).then(res => {
                if (!res.ok) throw new Error('Failed to update event');
                return res.json();
            }),
            {
                loading: 'Updating event...',
                success: () => {
                    router.push('/my-events');
                    return 'Event updated successfully!';
                },
                error: 'Failed to update event'
            }
        );
    }
    if (!user) {
        toast.error('Please login to view this page');
        router.push('/login');
        return null;
    }
    return (
        <div className="p-6 relative max-w-5xl rounded-[28px] transition-all duration-700 bg-black mx-auto mt-20">
            <div className="absolute right-5 hover:scale-105 hover:underline">
                <Dialog open={isOpen} onOpenChange={setIsOpen}>
                    <DialogTrigger asChild>
                        <div className="flex font-bold text-gray-200 items-center gap-1 cursor-pointer">
                            <Pencil className="h-6 w-6 font-bold text-gray-200" /> Edit
                        </div>
                    </DialogTrigger>
                    <DialogContent className="!rounded-[28px] !border-none text-white p-6 max-w-lg mx-auto hover:shadow-purple-400 hover:shadow-sm bg-black transition-all duration-700">
                        <DialogHeader>
                            <DialogTitle className="text-2xl text-gray-200 font-semibold">Edit the details you want to edit</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                            <Input
                                name="name"
                                value={eventData.name}
                                onChange={handleInputChange}
                                placeholder={event.name}
                                className="rounded-[28px] full w-full border-none bg-gray-900 text-gray-300"
                            />
                            <Textarea
                                name="description"
                                value={eventData.description}
                                onChange={handleInputChange}
                                placeholder={event.description}
                                className="rounded-[28px] p-4 w-full border-none bg-gray-900 text-gray-300"
                            />
                            <Input
                                name="date"
                                type="date"
                                value={eventData.date}
                                onChange={handleInputChange}
                                className="rounded-[28px] p-4 w-full bg-gray-900 text-gray-300"
                            />
                            <Input
                                name="startTime"
                                type="time"
                                value={eventData.startTime}
                                onChange={handleInputChange}
                                className="rounded-[28px] p-4 w-full border-none bg-gray-900 text-gray-300"
                            />
                            <Input
                                name="endTime"
                                type="time"
                                value={eventData.endTime}
                                onChange={handleInputChange}
                                className="rounded-[28px] p-4 w-full border-none bg-gray-900 text-white"
                            />
                            <Input
                                name="location"
                                value={eventData.location}
                                onChange={handleInputChange}
                                placeholder={event.location}
                                className="rounded-[28px] p-4 w-full border-none bg-gray-900 text-gray-300"
                            />
                            <Input
                                name="additionalNotes"
                                value={eventData.additionalNotes}
                                onChange={handleInputChange}
                                placeholder={event.additionalNotes}
                                className="rounded-[28px] p-4 w-full border-none bg-gray-900 text-gray-300"
                            />
                        </div>
                        <div className="mt-4 flex justify-between">
                            <Button
                                variant="ghost"
                                onClick={() => setIsOpen(false)}
                                className="mr-4 bg-red-600 rounded-[28px] font-bold text-gray-900"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleSave}
                                variant="destructive"
                                className="rounded-full font-bold px-8 bg-blue-600 hover:bg-blue-700"
                            >
                                Save
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            <Card className="shadow-lg text-gray-300 rounded-xl">
                <CardHeader className="text-center">
                    <CardTitle className="text-3xl font-bold">{event.name}</CardTitle>
                    <p className="text-sm text-gray-400">{event.type}</p>
                </CardHeader>
                <CardContent className="flex justify-between">
                    <div className="flex flex-col justify-evenly">
                        <div className="flex flex-col gap-4 justify-evenly sm:flex-col">
                            <div className="flex items-center gap-4">
                                <Calendar className="h-6 w-6 text-green-500" />
                                <span className="text-lg">{formatDate(event.date)}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Clock className="h-6 w-6 text-violet-500" />
                                <span className="text-lg">
                                    {event.startTime} - {event.endTime}
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <MapPin className="h-6 w-6 text-red-600" />
                            <span className="text-lg">{event.location}</span>
                        </div>

                        <div className="flex flex-col gap-2">
                            <div className="flex flex-row gap-2">
                                <Users className="h-6 w-6 text-blue-500" />
                                <span className="text-lg">{eventData.guestList.length} guests</span>
                            </div>
                            <h1 className='font-bold text-2xl'>Guests :</h1>
                            <div className='flex justify-between'>
                                {
                                    event.invitationSent ? <div className="flex flex-col gap-3">
                                        {guestStatus?.length > 0 ? (
                                            guestStatus.map((guest: Guest, index) => (
                                                <div key={index} className='flex justify-between items-center space-x-6'>
                                                    <p>{guest.email}</p>
                                                    <>
                                                        {guest?.status === "ACCEPTED" ? (
                                                            <p className='text-green-600'>Accepted</p>
                                                        ) : guest?.status === "DECLINED" ? (
                                                            <p className='text-red-600'>Declined</p>
                                                        ) : (
                                                            <p className='text-yellow-600'>Pending</p>
                                                        )}
                                                    </>
                                                </div>
                                            ))
                                        ) : (
                                            ""
                                        )}
                                    </div> :


                                        <div className="">
                                            {eventData.guestList.map((guest, index) => (
                                                <div key={index} className="justify-between items-center text-gray-400 mb-2">
                                                    <span>
                                                        {guest}
                                                    </span>
                                                    {
                                                        guestStatus.length ? "" :
                                                            <Button
                                                                onClick={() => handleRemoveGuest(index)}
                                                                className='text-red-600 hover:scale-105 transition-all duration-300 hover:underline hover:text-red-800'
                                                            >
                                                                Remove
                                                                <Trash className='h-5 w-5 ml-2' />
                                                            </Button>
                                                    }
                                                </div>
                                            ))}
                                        </div>
                                }
                            </div>
                            <div>
                                <Dialog>
                                    {
                                        event.invitationSent ? "" :
                                            <DialogTrigger asChild>
                                                <Button
                                                    variant="default"
                                                    className="rounded-full text-white font-bold bg-blue-600 hover:bg-blue-700"
                                                >
                                                    Add Guests
                                                </Button>
                                            </DialogTrigger>
                                    }
                                    <DialogContent className="bg-black text-gray-300 p-6 max-w-lg mx-auto !rounded-[28px] border-none shadow-lg">
                                        <DialogHeader>
                                            <DialogTitle className="text-2xl font-semibold">
                                                Add Guests manually or upload a CSV file
                                            </DialogTitle>
                                        </DialogHeader>
                                        <div className="space-y-4">
                                            <Input
                                                type="file"
                                                accept=".csv"
                                                onChange={handleFileUpload}
                                                className="rounded-[28px] !border-none w-full bg-gray-900 text-gray-300"
                                            />
                                            <Textarea
                                                onChange={handleInputChange2}
                                                value={inputValue}
                                                onKeyDown={handleKeyPress}
                                                placeholder="Enter email addresses separated by commas"
                                                className="rounded-[28px] !border-none p-4 w-full bg-gray-900 text-gray-300"
                                            />
                                            <span className='text-red-600 font-bold'>*Press Enter after entering emails manually <br /> and then click Add Button</span>
                                        </div>
                                        <div className="mt-4 flex justify-between">
                                            <Button variant="destructive" className="mr-4 text-gray-900 font-bold hover:bg-red-800 bg-red-600 rounded-[28px]">
                                                Cancel
                                            </Button>
                                            <Button
                                                onClick={() => {
                                                    handleSave();
                                                    setIsOpen(false);
                                                }}
                                                variant="destructive"
                                                className="rounded-full text-white font-bold bg-blue-600 hover:bg-blue-700"
                                            >
                                                Add Guests
                                            </Button>
                                        </div>
                                    </DialogContent>
                                </Dialog>
                            </div>
                        </div>

                        <div className="text-lg mt-5">
                            <p> <span className='font-bold'>Description</span> : {event.description}</p>
                        </div>
                        <div className="">
                            <p className="text-red-400"><span className='font-bold'>*Additional Notes :</span>{event.additionalNotes}</p>
                        </div>
                        {
                            event.invitationSent ? "" :
                                <div className="">
                                    <Button onClick={handleInvite} className='rounded-full bg-green-400 text-black hover:bg-green-500 font-bold transition-all duration-300 hover:scale-105 '>Invite These Guests</Button>
                                </div>
                        }
                    </div>
                    <div className="">
                        <Image src={event.coverImage} className='rounded-[28px] hover:scale-105 transition-all duration-300' height={400} width={400} alt='cover image' />
                    </div>
                </CardContent>
            </Card>

            <div className="text-gray-300 mt-10">
                {
                    eventData.activities.length === 0 ?
                        <div className="">
                            <h2 className="text-2xl font-semibold">
                                Write a theme and we will suggest you something great.
                            </h2>
                            <div className="flex">
                                <div className="flex md:w-1/2">
                                    <Input
                                        type="text"
                                        placeholder='Put in the theme or some ideas.'
                                        onChange={(e) => setIdeasPrompt(e.target.value)}
                                        className="mt-4 bg-gray-900 w-full text-gray-300 rounded-[28px]"
                                    />
                                    <Button onClick={handleGenerateIdeas} className='items-center text-center mt-4 font-bold ml-4 justify-center hover:bg-purple-500 bg-purple-700 rounded-[28px]'>Suggest</Button>
                                </div>

                                {
                                    ideas?.length <= 1 ? "" :
                                        <div className="flex">
                                            <Button onClick={() => setIdeas([])} className='items-center text-center mt-4 font-bold ml-4 justify-center hover:bg-red-500 bg-red-700 rounded-[28px]'>Clear</Button>
                                            <Button onClick={() => handleIdeasSave()} className='items-center text-center mt-4 text-gray-900 font-bold ml-4 justify-center hover:bg-green-700 bg-green-600 rounded-[28px]'>Keep It</Button>
                                        </div>
                                }
                            </div>
                        </div> : ""
                }
                <p>
                    {
                        eventData.activities.length === 0 ? "" :
                            <div className="text-sm font-semibold mt-4">
                                Your Ideas:
                                {eventData.activities.map((idea, index) => (
                                    <div key={index} className="text-gray-400 mt-4">
                                        {idea}
                                    </div>
                                ))}
                            </div>
                    }
                    {ideas && ideas?.map((idea, index) => (
                        <div key={index} className="text-gray-400 mt-4">
                            {idea}
                        </div>
                    ))}
                </p>
                <Button
                    onClick={() => {
                        handleSave();
                        setIsOpen(false);
                    }
                    }
                    variant="default"
                    className="mt-4 mr-2 font-bold text-white hover:scale-105 rounded-full bg-blue-600 hover:bg-blue-700"
                >
                    Save Changes
                </Button>

                <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                    <DialogTrigger asChild>
                        <Button
                            variant="destructive"
                            className="mt-4 bg-red-600 rounded-full hover:bg-red-700"
                        >
                            Delete
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-black text-white p-6 !border-none !rounded-[28px] max-w-lg mx-auto shadow-lg">
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-semibold">
                                Are You Sure You Want to Delete?
                            </DialogTitle>
                            <DialogDescription className="mt-2 text-gray-400">
                                This action cannot be undone. This will permanently delete the event.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="mt-4 flex justify-between">
                            <Button onClick={() => setIsDeleteOpen(!isDeleteOpen)} variant="ghost" className="mr-4 hover:bg-green-700 bg-green-600 rounded-[28px] text-gray-900">
                                Cancel
                            </Button>
                            <Button
                                onClick={handleDelete}
                                variant="destructive"
                                className="rounded-full bg-red-600 hover:bg-red-700"
                            >
                                Delete
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        </div >
    );
};

export default EventDetailsPage;