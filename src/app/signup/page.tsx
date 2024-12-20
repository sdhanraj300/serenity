'use client'
import { useState } from 'react'
import { signIn, useSession } from 'next-auth/react'
import { redirect, useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from 'next/link'
import toast from 'react-hot-toast'
import img from '@/assets/Rectangle.png'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { slideIn } from '@/utils/motion'
export default function Page() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [name, setName] = useState('')
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const router = useRouter()
    const session = useSession();

    if (session.data) {
        redirect('/');
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMessage(null);
        const signUpPromise = fetch("/api/auth/signup", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ email, password, name }),
        });
        toast.promise(
            signUpPromise,
            {
                loading: 'Signing up...',
                success: () => {
                    return 'User created successfully';
                },
                error: (err) => {
                    return `Failed to sign up: ${err}`;
                },
            }
        );
        try {
            const res = await signUpPromise;
            if (!res.ok) {
                const errorData = await res.json();
                setErrorMessage(errorData.error || 'Authentication failed');
                return;
            }
            router.push('/login');
        } catch (error) {
            console.error('An error occurred:', error);
            setErrorMessage('Something went wrong, please try again later.');
        }
        finally {
            setEmail('');
            setPassword('');
            setName('');
        }
    }

    const handleGoogleSignIn = () => {
        toast.promise(
            signIn('google', { callbackUrl: '/' }),
            {
                loading: 'Signing in with Google...',
                success: () => {
                    return 'Signed in with Google successfully';
                },
                error: (err) => {
                    return `Failed to sign in with Google: ${err}`;
                },
            }
        );
    }

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="min-h-screen mt-20 md:mx-10 mx-4 rounded-[28px] flex shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] border border-white/20 backdrop-blur-lg h-full items-center bg-black justify-center md:p-8">
            <motion.div
                variants={slideIn('left', 'spring', 0.1, 0.1)}
                className="hidden md:block relative">
                <Image src={img} className='rounded-[28px] w-[500px]' alt="rectangle" />
                <div className="absolute inset-0 flex items-center justify-center">
                    <p className="italic text-5xl font-bold text-white">Serenity</p>
                </div>
            </motion.div>
            <div className="w-full max-w-2xl  p-12 rounded-[28px]">
                <h3 className="text-3xl font-bold text-center text-white mb-10">Sign Up to your account</h3>
                <form onSubmit={handleSubmit} method='POST' className="space-y-8">
                    <div className="space-y-6">
                        <div>
                            <Label htmlFor="name" className="text-white text-lg mb-2 block">Name</Label>
                            <Input
                                name='name'
                                type="text"
                                placeholder="Name"
                                id="name"
                                className="w-full h-14 text-lg px-5 mt-2 bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:ring-2 focus:ring-white/50 focus:border-transparent rounded-[28px]"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </div>
                        <div>
                            <Label htmlFor="email" className="text-white text-lg mb-2 block">Email</Label>
                            <Input
                                name='email'
                                type="email"
                                placeholder="Email"
                                id="email"
                                className="w-full h-14 text-lg px-5 mt-2 bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:ring-2 focus:ring-white/50 focus:border-transparent rounded-[28px]"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div>
                            <Label htmlFor="password" className="text-white text-lg mb-2 block">Password</Label>
                            <Input
                                name='password'
                                type="password"
                                placeholder="Password"
                                id="password"
                                className="w-full h-14 text-lg px-5 mt-2 bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:ring-2 focus:ring-white/50 focus:border-transparent rounded-[28px]"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    {errorMessage && (
                        <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-[28px]text-white text-lg">
                            {errorMessage}
                        </div>
                    )}

                    <div className="flex items-center gap-2 md:justify-between pt-4">
                        <Button
                            type="submit"
                            className="px-8 py-6 text-lg bg-green-400 hover:bg-green-700 text-gray-900 font-semibold rounded-[28px] transition-all duration-300 backdrop-blur-sm"
                        >
                            Sign Up
                        </Button>
                        <Link href="/login">
                            <p className="text-white text-lg">Already have an account? <span className='underline'>Login</span> </p>
                        </Link>
                    </div>
                </form>

                <div className="mt-10">
                    <Button
                        onClick={handleGoogleSignIn}
                        className="w-full px-8 py-6 text-lg rounded-[28px] bg-blue-500 hover:bg-blue-700 text-white rounded-[28px]transition-all duration-300 backdrop-blur-sm"
                    >
                        Sign in with Google
                    </Button>
                </div>
            </div>
        </motion.div>
    )
}