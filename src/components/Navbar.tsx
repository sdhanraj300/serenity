"use client"
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { LogOut, Menu, X } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import toast from 'react-hot-toast';

const Navbar = () => {
    const path = usePathname();
    const session = useSession();
    useEffect(() => {
        if (session.data) {
            setIsLoggedIn(true);
        }
    }, [session.data]);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const isActiveRoute = (item: string) => {
        const itemPath = item === 'Home' ? '/' : `/${item.toLowerCase()}`;
        return path === itemPath;
    };
    const router = useRouter();
    const handleSignout = async () => {
        toast.promise(
            signOut(),
            {
                loading: 'Signing out...',
                success: 'Logged out successfully',
                error: 'Failed to sign out',
            }
        );
        setIsLoggedIn(false);
    };
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };
    return (
        <nav className="flex justify-between items-center px-6 md:px-10 py-4 w-full fixed top-0 backdrop-blur-md shadow-sm z-50 bg-black bg-opacity-10">
            {/* Logo Section */}
            <div className="transition-transform hover:scale-105">
                <button
                    onClick={() => router.push('/')}
                    className="block"
                >
                    <h1 className="text-3xl font-semibold italic text-white">Serenity</h1>
                </button>
            </div>

            {/* Mobile Menu Button */}

            {/* Mobile Menu */}
            <div className="md:hidden">
                <button onClick={toggleMobileMenu} className="absolute top-5 r-2 items-center justify-center flex z-[999] text-white">
                    {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>
            {isMobileMenuOpen && (
                <div className="fixed top-1 pb-10 rounded-[16px] left-0 bg-black w-full z-50 flex flex-col justify-center items-center md:hidden">
                    <ul className="space-y-6 text-center">
                        {['Home', 'About', 'My Events', 'Create Event'].map((item) => (
                            <li key={item} className="text-xl text-white">
                                <button
                                    onClick={() => {
                                        toggleMobileMenu(); // Close menu on click
                                        if (item === 'My Events') {
                                            if (!isLoggedIn) {
                                                toast.error('Please sign in to view your events');
                                                router.push('/login');
                                                return;
                                            }
                                            router.push('/my-events');
                                            return;
                                        }
                                        if (item === 'Create Event') {
                                            if (!isLoggedIn) {
                                                toast.error('Please sign in to create an event');
                                                router.push('/login');
                                                return;
                                            }
                                            router.push('/create-event');
                                            return;
                                        }
                                        router.push(item === 'Home' ? '/' : `/${item.toLowerCase()}`);
                                    }}
                                    className={`px-2 py-2 transition-colors duration-200 ${isActiveRoute(item) ? 'text-purple-500 font-medium' : 'text-gray-300 hover:text-gray-400'}`}
                                >
                                    {item}
                                </button>
                            </li>
                        ))}
                        <li className="mt-4">
                            {isLoggedIn ? (
                                <Button
                                    variant="destructive"
                                    onClick={() => {
                                        setIsMobileMenuOpen(false);
                                        handleSignout();
                                    }}
                                    className="px-4 py-2 font-semibold rounded-full transition-all duration-200 hover:bg-red-600 flex items-center gap-2"
                                >
                                    Sign Out
                                    <LogOut size={16} />
                                </Button>
                            ) : (
                                <Button
                                    onClick={() => {
                                        setIsMobileMenuOpen(false);
                                        router.push('/login');
                                    }}
                                    variant="default"
                                    className="px-4 py-2 font-semibold rounded-full bg-purple-600 text-white hover:bg-purple-700 transition-colors duration-200"
                                >
                                    Sign In
                                </Button>
                            )}
                        </li>
                    </ul>
                </div>
            )}

            {/* Desktop Menu */}
            <ul className="hidden md:flex font-bold items-center space-x-2 md:space-x-6">
                {['Home', 'About' , 'My Events', 'Create Event'].map((item) => (
                    <li key={item} className="relative group">
                        <button
                            onClick={() => {
                                if (item === 'My Events') {
                                    if (!isLoggedIn) {
                                        toast.error('Please sign in to view your events');
                                        router.push('/login');
                                        return;
                                    }
                                    router.push('/my-events');
                                    return;
                                }
                                if (item === 'Create Event') {
                                    if (!isLoggedIn) {
                                        toast.error('Please sign in to create an event');
                                        router.push('/login');
                                        return;
                                    }
                                    router.push('/create-event');
                                    return;
                                }
                                router.push(item === 'Home' ? '/' : `/${item.toLowerCase()}`);
                            }}
                            className={`px-2 py-2 transition-colors duration-200 ${isActiveRoute(item) ? 'text-white font-medium' : 'text-gray-200 hover:text-gray-300'}`}
                        >
                            {item}
                        </button>
                        <div className={`absolute inset-x-0 bottom-0 h-0.5 bg-purple-600 transition-transform duration-200 ${isActiveRoute(item) ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}`} />
                    </li>
                ))}
                <li>
                    {isLoggedIn ? (
                        <Button
                            variant="destructive"
                            onClick={() => {
                                setIsLoggedIn(false);
                                handleSignout();
                            }}
                            className="px-4 py-2 font-semibold rounded-full transition-all duration-200 hover:bg-red-600 flex items-center gap-2"
                        >
                            Sign Out
                            <LogOut size={16} />
                        </Button>
                    ) : (
                        <Button
                            onClick={() => router.push('/login')}
                            variant="default"
                            className="px-4 py-2 font-semibold rounded-full bg-purple-600 text-white hover:bg-purple-700 transition-colors duration-200"
                        >
                            Sign In
                        </Button>
                    )}
                </li>
            </ul>
        </nav>
    );
};

export default Navbar;