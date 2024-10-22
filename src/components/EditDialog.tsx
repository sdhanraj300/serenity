import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Pencil } from 'lucide-react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { UploadButton } from '@uploadthing/react';
import { OurFileRouter } from '@/app/api/uploadthing/core';
import Image from 'next/image';
import { User } from '@prisma/client';

const hobbies = [
    'Reading', 'Writing', 'Coding', 'Designing', 'Dancing', 'Singing', 'Cooking', 'Travelling',
    'Gaming', 'Photography', 'Sports', 'Painting', 'Crafting', 'Gardening', 'Watching Movies',
    'Listening to Music'
];

// Zod Schema for validation
const formSchema = z.object({
    name: z.string().min(5, { message: 'Name must be at least 5 characters' }),
    bio: z.string().min(10, { message: 'Bio must be at least 10 characters long' }),
    age: z.number().min(13, { message: 'Age must be at least 13' }).max(100, { message: 'Age must be less than 100' }),
    hobbies: z.array(z.string()).min(1, { message: 'Please select at least one hobby' }).max(5, { message: 'You can select up to 5 hobbies' }),
    avatar: z.string().optional().default(''),
});

type FormData = z.infer<typeof formSchema>;

const EditDialog = ({ isOpen, setIsOpen, userData, onSubmit }: { isOpen: boolean; setIsOpen: React.Dispatch<React.SetStateAction<boolean>>, userData: User, onSubmit: (data: FormData) => void }) => {

    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
        watch,
        reset,
    } = useForm<FormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: userData?.name || '',
            bio: userData?.bio || '',
            age: userData?.age || 18,
            hobbies: userData?.hobbies || [],
            avatar: userData?.avatar || '',
        }
    });

    const avatarUrl = watch('avatar');

    const handleCancel = () => {
        reset();
        setIsOpen(false);
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <div className="flex absolute top-4 right-4 hover:underline text-xl font-bold text-gray-200 items-center gap-1 cursor-pointer">
                    <Pencil className="h-6 w-6 font-bold text-gray-200" /> Edit
                </div>
            </DialogTrigger>
            <DialogContent className="!rounded-[28px] mt-10 !border-none text-white md:mx-auto hover:shadow-purple-400 hover:shadow-sm bg-gray-900 transition-all duration-700">
                <DialogHeader>
                    <DialogTitle className="text-2xl text-gray-200 font-semibold">Edit the details you want to edit</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-gray-200 max-h-[75vh] overflow-y-auto p-4">
                    <label htmlFor="avatar">Profile Picture :</label>
                    <div className="h-[100px] w-[100px] overflow-hidden rounded-full">
                    <Image
                        src={avatarUrl}
                        alt="Avatar"
                        width={100}
                        height={100}
                        className="rounded-full object-contain"
                        />
                        </div>
                    <UploadButton<OurFileRouter, 'imageUploader'>
                        endpoint="imageUploader"
                        onClientUploadComplete={(res) => {
                            if (res && res.length > 0) {
                                const uploadedUrl = res[0].url;
                                setValue('avatar', uploadedUrl);
                                console.log('Avatar uploaded:', uploadedUrl);
                            }
                        }}
                        onUploadError={(error: Error) => {
                            alert(`Upload failed: ${error.message}`);
                        }}
                        className="cursor-pointer ut-button:w-[100px] ut-button:h-[30px] ut-button:bg-gray-900 ut-button:rounded-[28px]"
                    />
                    {errors.avatar && <p className="text-red-500">{errors.avatar.message}</p>}

                    <label htmlFor="name">Name :</label>
                    <Input
                        {...register('name')}
                        className="rounded-[28px] w-full border-none bg-black text-gray-300"
                    />
                    {errors.name && <p className="text-red-500">{errors.name.message}</p>}
                    <div className="mt-10">
                        <label htmlFor="bio">Bio: Give yourself a quirky bio</label>
                        <Textarea
                            {...register('bio')}
                            className="rounded-[28px] p-4 w-full border-none bg-black text-gray-300"
                        />
                    </div>
                    {errors.bio && <p className="text-red-500">{errors.bio.message}</p>}
                    <div className="mt-10">
                        <label htmlFor="age">Your Age :</label>
                        <Input
                            type="number"
                            {...register('age', { valueAsNumber: true })}
                            className="rounded-[28px] w-full border-none bg-black text-gray-300"
                        />
                    </div>
                    {errors.age && <p className="text-red-500">{errors.age.message}</p>}

                    <label htmlFor="hobbies">Hobbies :</label>
                    <div className="grid grid-cols-2 gap-2">
                        {hobbies.map((hobby, index) => (
                            <label key={index} className="flex items-center">
                                <input
                                    type="checkbox"
                                    value={hobby}
                                    {...register('hobbies')}
                                    className="mr-2"
                                />
                                {hobby}
                            </label>
                        ))}
                    </div>
                    {errors.hobbies && <p className="text-red-500">{errors.hobbies.message}</p>}

                    {/* Action Buttons Inside Form */}
                    <div className="mt-4 flex justify-between p-4 bg-gray-900">
                        <Button variant="ghost" onClick={handleCancel} className="mr-4 bg-red-600 rounded-[28px] font-bold text-gray-900">
                            Cancel
                        </Button>
                        <Button type="submit" variant="destructive" className="rounded-full font-bold px-8 bg-blue-600 hover:bg-blue-700">
                            Save
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default EditDialog;
