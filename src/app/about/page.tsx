"use client"
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'
import { motion } from 'framer-motion'
import img from '@/assets/party.gif'
const page = () => {
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
    const heading = " Hi! I'm Dhanraj. Like a normal person, I also love to party with friends and family."
    return (
        <motion.div
            className='mt-20 min-h-screen p-4 md:p-10 flex flex-col items-center justify-center md:flex-row gap-8'
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
        >
            <motion.div
                className="text-center md:text-left max-w-md"
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7, ease: "easeInOut" }}
            >
                <motion.p
                    className="text-3xl md:text-2xl lg:text-4xl font-bold bg-gradient-to-r from-purple-500 to-pink-700 bg-clip-text text-transparent"
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
                <p className="text-gray-400 text-xl font-bold mb-4">
                    But I always forget to invite my friends and family to my party. So I decided to create a web app where I can create an event and invite my friends and family.
                    This web app helped me to host a successful party, and I hope it will help you too.
                    I hope you will enjoy this web app.
                </p>
                <span className="text-gray-200 font-semibold">You can reach me on</span>
                <Link href="https://www.linkedin.com/in/dhanraj-acharya-7b7b3b1b4/">
                    <span className="text-blue-600 ml-2 underline font-bold italic hover:text-blue-800 transition duration-300">LinkedIn</span>
                </Link>
                <span className="text-gray-200 ml-2">and on</span>
                <Link href="https://www.instagram.com/dhanrajxsingh">
                    <span className="text-pink-600 ml-2 underline font-bold hover:text-pink-800 italic transition duration-300">Insta</span>
                </Link>
            </motion.div>
            <motion.div
                className="w-full md:w-1/2 flex justify-center md:justify-end"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.7, ease: "easeInOut" }}
            >
                <Image src={img} alt="party" className="rounded-[28px] shadow-md w-[500px] h-auto" />
            </motion.div>
        </motion.div>
    )
}

export default page
