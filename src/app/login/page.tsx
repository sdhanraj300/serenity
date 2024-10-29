'use client'
import { useState } from 'react'
import { signIn, useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import toast from 'react-hot-toast'
import Link from 'next/link'
import img from '@/assets/Rectangle.png'
import Image from 'next/image'
import { animate, motion } from 'framer-motion'
import { slideIn } from '@/utils/motion'
export default function Page() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const router = useRouter()
    const session = useSession();
    if (session.data) {
        router.push('/');
    }
    console.log(session);
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMessage('');
        const loginPromise = signIn("credentials", {
            redirect: false,
            email,
            password,
        });

        toast.promise(
            loginPromise,
            {
                loading: 'Logging in...',
                success: (data) => {
                    if (data?.error) throw new Error(data.error);
                    return 'Logged in successfully';
                },
                error: (err) => {
                    setErrorMessage("Invalid credentials. Please try again.");
                    return `Failed to log in: invalid credentials`;
                }
            }
        );

        try {
            const result = await loginPromise;

            if (result?.error) {
                throw new Error(result.error);
            } else {
                router.push('/');
            }
        } catch (error) {
            console.error("Login error:", error);
        } finally {
            setEmail('');
            setPassword('');
        }
    };
    const handleGoogleSignIn = () => {
        toast.promise(
            signIn('google', { callbackUrl: '/' }),
            {
                loading: 'Signing in with Google...',
                success: () => {
                    return 'Logged in successfully';
                },
                error: (err) => {
                    return `Failed to sign in with Google: ${err}`;
                },
            }
        );
        signIn('google', { callbackUrl: '/' });
    }
    return (
        <motion.div
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="overflow-hidden min-h-screen mt-20 mx-4 md:mx-10 gap-10 md:px-20 rounded-[28px] flex shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] border border-white/20 backdrop-blur-lg h-full  items-center bg-black justify-center p-8"
        >
            <div className="w-full max-w-2xl">
                <h3 className="text-3xl font-bold text-center text-white mb-10">Login to your account</h3>
                <form onSubmit={handleSubmit} method='POST' className="space-y-8">
                    <div className="space-y-6">
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
                        <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-[28px] text-white text-lg">
                            {errorMessage}
                        </div>
                    )}

                    <div className="flex items-center gap-2 justify-between pt-4">
                        <Button
                            type="submit"
                            className="px-8 py-6 text-lg bg-green-400 hover:bg-green-700 text-gray-900 font-bold rounded-[28px] transition-all duration-300 backdrop-blur-sm"
                        >
                            Sign In
                        </Button>
                        <Link href="/signup">
                            <p className="text-white text-lg">Don&apos;t have an account? <span className='underline'> Sign up</span></p>
                        </Link>
                    </div>
                </form>

                <div className="mt-10">
                    <Button
                        onClick={handleGoogleSignIn}
                        className="w-full px-8 py-6 text-lg bg-blue-500 hover:bg-blue-700 text-white font-bold rounded-[28px] transition-all duration-300 backdrop-blur-sm"
                    >
                        Sign in with Google
                    </Button>
                </div>
            </div>

            <motion.div
                variants={slideIn('right', 'spring', 0.1, 0.1)}
                className="hidden md:block relative"
            >
                <Image src={img} alt="login" className="w-[600px] rounded-[28px]" />
                <div className="absolute inset-0 flex items-center justify-center">
                    <p className="italic text-5xl font-bold text-white">Serenity</p>
                </div>
            </motion.div>
        </motion.div>
    );
}
