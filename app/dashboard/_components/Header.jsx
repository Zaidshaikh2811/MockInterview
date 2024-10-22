"use client";

import { UserButton } from '@clerk/nextjs';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import Link from 'next/link'; // Import the Link component
import React from 'react';

const Header = () => {
    const path = usePathname();

    // Function to check if the current path matches the link
    const isActive = (href) => path === href ? 'text-primary font-bold' : '';

    return (
        <div className='flex p-4 items-center justify-between bg-secondary shadow-md'>
            <Image
                src={"/logoipsum-245.svg"}
                alt="AI MOCK Interview Logo"
                width={60}
                height={60}
            />
            <ul className='flex gap-6'>
                <li className={`cursor-pointer transition-transform duration-300 ease-in-out hover:scale-105 ${isActive('/dashboard')}`}>
                    <Link href="/dashboard">DashBoard</Link> {/* Added Link */}
                </li>
                <li className={`cursor-pointer transition-transform duration-300 ease-in-out hover:scale-105 ${isActive('/questions')}`}>
                    <Link href="/questions">Questions</Link> {/* Added Link */}
                </li>
                <li className={`cursor-pointer transition-transform duration-300 ease-in-out hover:scale-105 ${isActive('/upgrade')}`}>
                    <Link href="/upgrade">Upgrade</Link> {/* Added Link */}
                </li>
                <li className={`cursor-pointer transition-transform duration-300 ease-in-out hover:scale-105 ${isActive('/how-it-works')}`}>
                    <Link href="/how-it-works">How It Works</Link> {/* Added Link */}
                </li>
            </ul>

            <UserButton />
        </div>
    );
};

export default Header;
