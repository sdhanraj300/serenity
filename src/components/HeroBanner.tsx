import React from 'react';
import { Button } from './ui/button';
import Image from 'next/image';
import { FaArrowRight } from 'react-icons/fa';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import image1 from '../assets/image1.webp';
import image2 from '../assets/image2.webp';
import image3 from '../assets/image3.webp';
import image4 from '../assets/image4.webp';
import image5 from '../assets/image5.webp';

const HeroBanner = () => {
    const { data: session } = useSession();
    const router = useRouter();

    const handleClick = () => {
        if (session) {
            router.push('/create-event');
        } else {
            router.push('/signup');
        }
    };

    const heading = "Discover the world of beautiful";
    const heading2 = "events and experiences";

    const sentence = {
        hidden: { opacity: 1 },
        visible: {
            opacity: 1,
            transition: {
                duration: 1,
                ease: "easeOut",
                delay: 0.5,
                when: "beforeChildren",
                staggerChildren: 0.05,
            },
        },
    };

    const letter = {
        hidden: { opacity: 0, y: 50 },
        visible: {
            opacity: 1,
            y: 0,
        },
    };

    return (
    <motion.div
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={{
                hidden: {
                    opacity: 0,
                    y: 100,
                    scale: 0.8,
                },
                visible: {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    transition: {
                        duration: 0.8,
                        ease: "easeOut",
                        when: "beforeChildren",
                        staggerChildren: 0.08,
                    },
                },
                exit: {
                    opacity: 0,
                    y: -100,
                    scale: 0.8,
                    transition: {
                        duration: 0.6,
                    },
                },
            }}
            className='flex w-full mt-20 flex-col min-h-screen items-center justify-center text-white'
        >
            <div className="flex flex-col items-center justify-center text-center space-y-6 p-4">
                <motion.h1
                    className='text-5xl md:text-6xl lg:text-7xl italic font-bold'
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8 }}
                >
                    Serenity
                </motion.h1>
                <motion.p
                    className="text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-purple-500 to-pink-700 bg-clip-text text-transparent"
                    variants={sentence}
                    initial="hidden"
                    animate="visible"
                >
                    {heading.split("").map((char, index) => (
                        <motion.span key={char + "-" + index} variants={letter}>
                            {char}
                        </motion.span>
                    ))}
                </motion.p>
                <motion.p
                    className="text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-purple-500 to-pink-700 bg-clip-text text-transparent"
                    variants={sentence}
                    initial="hidden"
                    animate="visible"
                >
                    {heading2.split("").map((char, index) => (
                        <motion.span key={char + "-" + index} variants={letter}>
                            {char}
                        </motion.span>
                    ))}
                </motion.p>
            </div>

            <motion.div
                variants={sentence}
                initial="hidden"
                animate="visible"
                className="flex flex-col lg:flex-row items-center justify-between space-y-10 lg:space-x-10 lg:space-y-0 mt-10"
            >
                <div className="relative">
                    <motion.div
                        variants={{
                            hidden: { opacity: 0, x: -50 },
                            visible: { opacity: 1, x: 0 },
                        }}
                    >
                        <Image
                            src={image1}
                            className='hover:scale-105 duration-700 transition-all w-full lg:w-[400px] rounded-[28px]'
                            alt='party'
                        />
                    </motion.div>
                    <motion.p
                        className='hover:scale-105 absolute text-xl lg:text-2xl font-bold top-4 left-4 text-white bg-black p-2 rounded-[28px]'
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                    >
                        Host A Great House Party
                    </motion.p>
                </div>

                <div className="flex flex-col space-y-4 items-center justify-center lg:max-w-md text-center px-4">
                    <motion.p
                        className="text-lg lg:text-2xl font-extralight text-gray-300"
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                    >
                        Set up your event in minutes and invite your friends and family for an unforgettable experience.
                    </motion.p>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                    >
                        <Button
                            onClick={handleClick}
                            className='bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 text-gray-800 py-6 lg:py-6 px-10 lg:px-10 text-2xl lg:text-2xl font-bold rounded-[28px] hover:scale-105 hover:shadow-sm transition-all duration-300'
                        >
                            Get Started
                            <FaArrowRight className='ml-2' />
                        </Button>
                    </motion.div>
                </div>

                <div className="relative">
                    <Image
                        src={image2}
                        className='hover:scale-105 duration-700 transition-all w-full lg:w-[400px] rounded-[28px]'
                        alt='party'
                    />
                    <motion.p
                        className='absolute text-xl lg:text-2xl font-bold top-4 left-4 text-white bg-black p-2 rounded-[28px]'
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                    >
                        Throw a Thrilling Birthday Party
                    </motion.p>
                </div>
            </motion.div>

            {/* Extra Section with More Events */}
            <motion.h1
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className='text-3xl lg:text-4xl font-bold mt-10 text-center'
            >
                And Many More Nights To Remember!
            </motion.h1>

            <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ amount: 0.2 }}
                variants={{
                    hidden: { opacity: 0, y: 50 },
                    visible: {
                        opacity: 1,
                        y: 0,
                        transition: {
                            duration: 1,
                            ease: "easeOut",
                            delay: 0.5,
                            when: "beforeChildren",
                            staggerChildren: 0.2,
                        },
                    },
                }}
                className="flex flex-col lg:flex-row justify-between items-center mt-10 space-y-10 lg:space-x-10 lg:space-y-0"
            >
                {[image3, image4, image5].map((image, idx) => (
                    <div className="relative" key={idx}>
                        <motion.div
                            variants={{
                                hidden: { opacity: 0, scale: 0.8 },
                                visible: { opacity: 1, scale: 1, transition: { duration: 0.5 } },
                            }}
                        >
                            <Image
                                src={image}
                                className="w-full lg:w-[300px] hover:scale-105 transition-all duration-500 rounded-[28px]"
                                alt='party'
                            />
                            <p className='absolute text-xl font-bold top-2 left-2 text-white bg-black p-2 rounded-[28px]'>
                                {idx === 0 ? 'A Get Together Party' : idx === 1 ? 'A Night with Closed Ones' : 'A Great Anniversary Party'}
                            </p>
                        </motion.div>
                    </div>
                ))}
            </motion.div>
        </motion.div>
    );
};

export default HeroBanner;
