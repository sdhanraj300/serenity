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
    additionalNotes: string;
    userId: string;
}

const EventDetailsPage = () => {
    const [isOpen, setIsOpen] = useState(false);
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
    });
    const [forceUpdate, setForceUpdate] = useState(0);

    const { id: eventId } = useParams();
    const router = useRouter();

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

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

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
        console.log("eventData:", eventData);
        console.log("event", event);
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
        console.log("updatedEventData:", updatedEventData);
        toast.promise(
            fetch(`/api/events/${eventId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedEventData),
            }).then(res => {
                if (!res.ok) throw new Error('Failed to update event');
                console.log("res:", res);
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
        // console.log(eventData);
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
                    console.log('Invalid emails:', inValidEmails);
                }
                console.log('Valid emails:', validEmails);
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
            // setInputValue('');
        }
    };
    const [inputValue, setInputValue] = useState('');

    const handleInputChange2 = (e: any) => {
        setInputValue(e.target.value);
    };
    const handleRemoveGuest = (index: number) => {
        setEventData(prev => ({
            ...prev,
            guestList: prev.guestList.filter((_, i) => i !== index)
        }));
        setForceUpdate(forceUpdate + 1);
        console.log(eventData);
    }
    useEffect(() => {
        console.log("Guest List Updated", eventData.guestList);
    }, [eventData.guestList]);
    if (loading) return <div>Loading...</div>;
    if (!event) return <div>No event found</div>;
    const handleInvite = async () => {
        if (eventData.guestList.length === 0) {
            toast.error('Please add guests to invite');
            return;
        }
        const finalEventId = Array.isArray(eventId) ? eventId[0] : eventId;
        const emailData = {
            guestList: eventData.guestList,
            eventId: finalEventId,
        }
        console.log(emailData);
        toast.promise(
            fetch(`/api/events/${eventId}/invite`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(emailData),
            }).then(res => {
                if (!res.ok) throw new Error('Failed to send email');
                return res.json();
            }),
            {
                loading: 'Sending emails...',
                success: () => {
                    return 'Emails sent successfully!';
                },
                error: 'Failed to send emails'
            }
        );
    }
    return (
        <div className="p-6 relative max-w-5xl rounded-xl hover:shadow-md hover:shadow-white transition-all duration-700 bg-black mx-auto mt-20">
            {/* Edit Button */}
            <div className="absolute right-5 hover:scale-105 hover:underline">
                <Dialog open={isOpen} onOpenChange={setIsOpen}>
                    <DialogTrigger asChild>
                        <div className="flex items-center gap-1 cursor-pointer">
                            <Pencil className="h-6 w-6 text-gray-500" /> Edit
                        </div>
                    </DialogTrigger>
                    <DialogContent className="!border-purple-400 !rounded-2xl text-white p-6 max-w-lg mx-auto hover:shadow-purple-400 hover:shadow-sm bg-black transition-all duration-700">
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-semibold">Edit the details you want to edit</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                            <Input
                                name="name"
                                value={eventData.name}
                                onChange={handleInputChange}
                                placeholder={event.name}
                                className="rounded-full w-full bg-gray-900 text-gray-300"
                            />
                            <Textarea
                                name="description"
                                value={eventData.description}
                                onChange={handleInputChange}
                                placeholder={event.description}
                                className="rounded-full p-4 w-full bg-gray-900 text-gray-300"
                            />
                            <Input
                                name="date"
                                type="date"
                                value={eventData.date}
                                onChange={handleInputChange}
                                className="rounded-full p-4 w-full bg-gray-900 text-gray-300"
                            />
                            <Input
                                name="startTime"
                                type="time"
                                value={eventData.startTime}
                                onChange={handleInputChange}
                                className="rounded-full p-4 w-full bg-gray-900 text-gray-300"
                            />
                            <Input
                                name="endTime"
                                type="time"
                                value={eventData.endTime}
                                onChange={handleInputChange}
                                className="rounded-full p-4 w-full bg-gray-900 text-white"
                            />
                            <Input
                                name="location"
                                value={eventData.location}
                                onChange={handleInputChange}
                                placeholder={event.location}
                                className="rounded-full p-4 w-full bg-gray-900 text-gray-300"
                            />
                            <Input
                                name="additionalNotes"
                                value={eventData.additionalNotes}
                                onChange={handleInputChange}
                                placeholder={event.additionalNotes}
                                className="rounded-full p-4 w-full bg-gray-900 text-gray-300"
                            />
                        </div>
                        <div className="mt-4 flex justify-between">
                            <Button
                                variant="ghost"
                                onClick={() => setIsOpen(false)}
                                className="mr-4 text-gray-400"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleSave}
                                variant="destructive"
                                className="rounded-full bg-blue-600 hover:bg-blue-700"
                            >
                                Save
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Event Details Card */}
            <Card className="shadow-lg text-gray-300 rounded-xl">
                <CardHeader className="text-center">
                    <CardTitle className="text-3xl font-bold">{event.name}</CardTitle>
                    <p className="text-sm text-gray-400">{event.type}</p>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
                        <div className="flex items-center gap-2">
                            <Calendar className="h-6 w-6 text-gray-500" />
                            <span className="text-lg">{formatDate(event.date)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Clock className="h-6 w-6 text-gray-500" />
                            <span className="text-lg">
                                {event.startTime} - {event.endTime}
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <MapPin className="h-6 w-6 text-gray-500" />
                        <span className="text-lg">{event.location}</span>
                    </div>

                    <div className="flex flex-col gap-2">
                        <div className="flex flex-row">
                            <Users className="h-6 w-6 text-gray-500" />
                            <span className="text-lg">{eventData.guestList.length} guests</span>
                        </div>
                        <div>
                            {eventData.guestList.map((guest, index) => (
                                <div key={index} className="flex justify-between items-center text-gray-400">
                                    <span>
                                        {index === event.guestList.length - 1 ? guest : `${guest}, `}
                                    </span>
                                    <Button
                                        onClick={() => handleRemoveGuest(index)}
                                        className='text-red-600 hover:scale-105 transition-all duration-300 hover:underline hover:text-red-800'>
                                        Remove
                                        <Trash className='h-5 w-5' />
                                    </Button>
                                </div>
                            ))}
                        </div>
                        <div>
                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button
                                        variant="default"
                                        className="rounded-full bg-blue-600 hover:bg-blue-700"
                                    >
                                        Add Guests
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="bg-black text-white p-6 max-w-lg mx-auto rounded-lg shadow-lg">
                                    <DialogHeader>
                                        <DialogTitle className="text-2xl font-semibold">
                                            Add Guests
                                        </DialogTitle>
                                    </DialogHeader>
                                    <div className="space-y-4">
                                        <Input
                                            type="file"
                                            accept=".csv"
                                            onChange={handleFileUpload}
                                            className="rounded-full w-full bg-gray-900 text-gray-300"
                                        />
                                        <Textarea
                                            onChange={handleInputChange2}
                                            value={inputValue}
                                            onKeyDown={handleKeyPress}
                                            placeholder="Enter email addresses separated by commas"
                                            className="rounded-full p-4 w-full bg-gray-900 text-gray-300"
                                        />
                                        <span>Press Enter after entering emails manually and then click Add Button</span>
                                    </div>
                                    <div className="mt-4 flex justify-between">
                                        <Button variant="ghost" className="mr-4 text-gray-400">
                                            Cancel
                                        </Button>
                                        <Button
                                            onClick={() => {
                                                handleSave();
                                                setIsOpen(false);
                                            }}
                                            variant="destructive"
                                            className="rounded-full bg-blue-600 hover:bg-blue-700"
                                        >
                                            Add
                                        </Button>
                                    </div>
                                </DialogContent>
                            </Dialog>
                        </div>
                    </div>

                    <div className="text-lg">
                        <p>{event.description}</p>
                    </div>
                    <div className="">
                        <p className="text-gray-400">{event.additionalNotes}</p>
                    </div>
                    <div className="">
                        <Button onClick={handleInvite} className='rounded-full bg-green-400 text-gray-900 hover:bg-green-500 transition-all duration-300 hover:scale-105 '>Invite These Guests</Button>
                    </div>
                </CardContent>
            </Card>

            {/* Theme Suggestion Section */}
            <div className="text-gray-300 mt-10">
                <h2 className="text-2xl font-semibold">
                    Write a theme and we will suggest you something great.
                </h2>
                <Textarea
                    placeholder="Enter theme"
                    className="w-full h-28 mt-4 bg-gray-700 text-gray-300 !rounded-full p-5"
                />
                <Button
                    onClick={() => {
                        handleSave();
                        setIsOpen(false);
                    }
                    }
                    variant="default"
                    className="mt-4 mr-2 rounded-full bg-blue-600 hover:bg-blue-700"
                >
                    Submit
                </Button>

                {/* Delete Dialog */}
                <Dialog>
                    <DialogTrigger asChild>
                        <Button
                            variant="destructive"
                            className="mt-4 bg-red-600 rounded-full hover:bg-red-700"
                        >
                            Delete
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-black text-white p-6 max-w-lg mx-auto rounded-lg shadow-lg">
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-semibold">
                                Are You Sure You Want to Delete?
                            </DialogTitle>
                            <DialogDescription className="mt-2 text-gray-400">
                                This action cannot be undone. This will permanently delete the event.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="mt-4 flex justify-between">
                            <Button variant="ghost" className="mr-4 text-gray-400">
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
        </div>
    );
};

export default EventDetailsPage;