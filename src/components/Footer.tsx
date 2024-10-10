"use client"
import React from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
const Footer = () => {
    const footerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                duration: 1,
                ease: "easeOut",
                delay: 0.5,
                when: "beforeChildren",
                staggerChildren: 0.05
            }
        }
    }
    const links = [
        "Contact",
        "Terms and Conditions",
        "Privacy Policy",
    ]
    return (
        <motion.div className='mt-5'>
            <hr className="border-gray-400 mx-5" />
            <motion.footer
                initial="hidden"
                animate="visible"
                variants={footerVariants}
                className="bg-transparent flex justify-between mx-10 text-gray-300 text-center py-4"
            >
                <div className="">
                    <p>&copy; 2024 Serenity. All rights reserved.</p>
                </div>
                <div className="flex justify-between relative group gap-4 ">
                    {links.map((link, index) => (
                        <div key={index} className="relative group">
                            <Link key={index} href="#" className="text-gray-300 hover:text-white">{link}</Link>
                            <div className={`absolute inset-x-0 bottom-0 h-0.5 bg-purple-600 transition-transform duration-200 scale-x-0 hover:scale-x-100 group-hover:scale-x-100'}`}
                            />
                        </div>
                    ))}
                </div>
                <div className="">
                    <p className='text-clip'>Made with love by Dhanraj 💖</p>
                </div>
            </motion.footer>
        </motion.div>
    )
}

export default Footer
