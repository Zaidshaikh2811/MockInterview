"use client";

import { UserButton } from '@clerk/nextjs';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
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
                    DashBoard
                </li>
                <li className={`cursor-pointer transition-transform duration-300 ease-in-out hover:scale-105 ${isActive('/questions')}`}>
                    Questions
                </li>
                <li className={`cursor-pointer transition-transform duration-300 ease-in-out hover:scale-105 ${isActive('/upgrade')}`}>
                    Upgrade
                </li>
                <li className={`cursor-pointer transition-transform duration-300 ease-in-out hover:scale-105 ${isActive('/how-it-works')}`}>
                    How It Works
                </li>
            </ul>

            <UserButton />
        </div>
    );
};

export default Header;
