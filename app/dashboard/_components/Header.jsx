"use client";

import { UserButton } from '@clerk/nextjs';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import React, { useState } from 'react';
import { FaBars, FaTimes } from 'react-icons/fa'; // Icons for menu

const Header = () => {
    const path = usePathname();
    const [isOpen, setIsOpen] = useState(false);

    // Function to check if the current path matches the link
    const isActive = (href) => (path === href ? 'text-primary font-bold' : '');

    // Toggle sidenav state
    const toggleSidenav = () => setIsOpen(!isOpen);

    return (
        <div className="flex items-center justify-between p-4 bg-secondary shadow-md">
            {/* Logo */}
            <Image
                src={"/logoipsum-245.svg"}
                alt="AI MOCK Interview Logo"
                width={60}
                height={60}
            />

            {/* Hamburger menu for md and smaller screens */}
            <button
                className="block md:hidden text-primary text-2xl"
                onClick={toggleSidenav}
            >
                {isOpen ? <FaTimes /> : <FaBars />}
            </button>

            {/* Navbar links */}
            <ul
                className={`fixed top-0 left-0 h-full min-w- bg-secondary z-50 transform ${isOpen ? 'translate-x-0' : '-translate-x-full'
                    } transition-transform duration-300 ease-in-out md:static md:flex md:gap-6 md:translate-x-0 min-w-[300px]`}
            >
                <li className="flex items-center justify-between p-4 md:hidden">
                    {/* Close button inside sidenav */}
                    <Image
                        src={"/logoipsum-245.svg"}
                        alt="AI MOCK Interview Logo"
                        width={60}
                        height={60}
                    />
                    <button onClick={toggleSidenav}>
                        <FaTimes className="text-primary text-2xl" />
                    </button>
                </li>
                <li
                    className={`p-4 md:p-0 cursor-pointer transition-transform duration-300 ease-in-out hover:scale-105 ${isActive('/dashboard')}`}
                >
                    <Link href="/dashboard">DashBoard</Link>
                </li>
                <li
                    className={`p-4 md:p-0 cursor-pointer transition-transform duration-300 ease-in-out hover:scale-105 ${isActive('/questions')}`}
                >
                    <Link href="/questions">Questions</Link>
                </li>
                <li
                    className={`p-4 md:p-0 cursor-pointer transition-transform duration-300 ease-in-out hover:scale-105 ${isActive('/upgrade')}`}
                >
                    <Link href="/upgrade">Upgrade</Link>
                </li>
                <li
                    className={`p-4 md:p-0 cursor-pointer transition-transform duration-300 ease-in-out hover:scale-105 ${isActive('/how-it-works')}`}
                >
                    <Link href="/how-it-works">How It Works</Link>
                </li>
            </ul>

            {/* User button always visible */}
            <div className="hidden md:block">
                <UserButton />
            </div>

            {/* Sidenav overlay for mobile */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black opacity-50 z-40"
                    onClick={toggleSidenav}
                ></div>
            )}
        </div>
    );
};

export default Header;
