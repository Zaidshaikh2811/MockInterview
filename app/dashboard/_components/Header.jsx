"use client"

import React, { useState, useEffect } from 'react';
import { Menu, X, Zap, BarChart3, Crown, HelpCircle, User, ChevronDown } from 'lucide-react';
import { useClerk } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const Header = () => {
    const { user, signOut } = useClerk();
    const router = useRouter();
    const [path, setPath] = useState('/dashboard'); // Mock current path
    const [isOpen, setIsOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);

    // Mock scroll effect
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Function to check if the current path matches the link
    const isActive = (href) => path === href;

    // Toggle sidenav state
    const toggleSidenav = () => setIsOpen(!isOpen);

    // Handle sign out
    const handleSignOut = async () => {
        await signOut();
        router.push('/sign-in');
    };

    // Navigation items with protection status
    const navItems = [
        { href: '/dashboard', label: 'Dashboard', icon: <BarChart3 className="w-4 h-4" />, protected: true },
        { href: '/questions', label: 'Questions', icon: <HelpCircle className="w-4 h-4" />, protected: true },
        { href: '/upgrade', label: 'Upgrade', icon: <Crown className="w-4 h-4" />, protected: false },
        { href: '/how-it-works', label: 'How It Works', icon: <Zap className="w-4 h-4" />, protected: false },
    ];

    // Filter navigation items based on authentication status
    const filteredNavItems = navItems.filter(item => !item.protected || user);

    return (
        <>
            {/* Header */}
            <header
                className={`sticky top-0 z-50 transition-all duration-300 ${isScrolled
                    ? 'bg-white/80 backdrop-blur-xl border-b border-gray-200/20 shadow-lg'
                    : 'bg-white/60 backdrop-blur-sm'
                    }`}
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo */}
                        <div className="flex items-center space-x-3 group cursor-pointer">
                            <div className="relative">
                                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110">
                                    <Zap className="w-6 h-6 text-white" />
                                </div>
                                <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-br from-green-400 to-emerald-400 rounded-full animate-pulse"></div>
                            </div>
                            <div className="hidden sm:block">
                                <h1 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-blue-900 bg-clip-text text-transparent">
                                    AI Interview Pro
                                </h1>
                            </div>
                        </div>

                        {/* Desktop Navigation */}
                        <nav className="hidden md:flex items-center space-x-1">
                            {filteredNavItems.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={(e) => {
                                        if (item.protected && !user) {
                                            e.preventDefault();
                                            router.push('/sign-in');
                                        } else {
                                            setPath(item.href);
                                        }
                                    }}
                                    className={`group relative flex items-center space-x-2 px-4 py-2 rounded-xl font-medium transition-all duration-200 hover:scale-105 ${isActive(item.href)
                                        ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg shadow-blue-500/25'
                                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50/80'
                                        }`}
                                >
                                    <span className={`transition-colors duration-200 ${isActive(item.href) ? 'text-white' : 'text-gray-500 group-hover:text-blue-500'
                                        }`}>
                                        {item.icon}
                                    </span>
                                    <span>{item.label}</span>

                                    {/* Active indicator */}
                                    {isActive(item.href) && (
                                        <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-white rounded-full"></div>
                                    )}
                                </Link>
                            ))}
                        </nav>

                        {/* Right side - User Menu & Mobile Toggle */}
                        <div className="flex items-center space-x-4">
                            {/* User Menu - Desktop */}
                            {user ? (
                                <div className="hidden md:block relative">
                                    <button
                                        onClick={() => setShowUserMenu(!showUserMenu)}
                                        className="flex items-center space-x-2 p-2 rounded-xl bg-gray-50/80 hover:bg-gray-100/80 transition-all duration-200 hover:scale-105"
                                    >
                                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center shadow-sm">
                                            {user.imageUrl ? (
                                                <img 
                                                    src={user.imageUrl} 
                                                    alt={user.fullName || 'User'} 
                                                    className="w-8 h-8 rounded-lg object-cover"
                                                />
                                            ) : (
                                                <User className="w-4 h-4 text-white" />
                                            )}
                                        </div>
                                        <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${showUserMenu ? 'rotate-180' : ''}`} />
                                    </button>

                                    {/* User Dropdown */}
                                    {showUserMenu && (
                                        <div className="absolute right-0 top-12 w-48 bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200/20 py-2 z-50">
                                            <div className="px-4 py-3 border-b border-gray-100">
                                                <p className="text-sm font-medium text-gray-900">{user.fullName || user.username}</p>
                                                <p className="text-xs text-gray-500">{user.primaryEmailAddress?.emailAddress}</p>
                                            </div>
                                            <Link href="/dashboard" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200">
                                                Profile Settings
                                            </Link>
                                            <Link href="/upgrade" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200">
                                                Billing
                                            </Link>
                                            <hr className="my-1 border-gray-100" />
                                            <button 
                                                onClick={handleSignOut}
                                                className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-200"
                                            >
                                                Sign Out
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="hidden md:block">
                                    <Link 
                                        href="/sign-in"
                                        className="px-4 py-2 rounded-xl font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50/80 transition-all duration-200"
                                    >
                                        Sign In
                                    </Link>
                                    <Link 
                                        href="/sign-up"
                                        className="px-4 py-2 rounded-xl font-medium bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-md hover:shadow-lg transition-all duration-200"
                                    >
                                        Sign Up
                                    </Link>
                                </div>
                            )}

                            {/* Mobile menu button */}
                            <button
                                onClick={toggleSidenav}
                                className="md:hidden relative p-2 rounded-xl bg-gray-50/80 hover:bg-gray-100/80 transition-all duration-200 hover:scale-105"
                            >
                                <div className={`w-6 h-6 flex items-center justify-center transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
                                    {isOpen ? <X className="w-5 h-5 text-gray-700" /> : <Menu className="w-5 h-5 text-gray-700" />}
                                </div>
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Mobile Sidebar */}
            <div
                className={`fixed inset-0 z-50 md:hidden transition-opacity duration-300 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
                    }`}
            >
                {/* Backdrop */}
                <div
                    className="absolute inset-0 bg-black/20 backdrop-blur-sm"
                    onClick={toggleSidenav}
                ></div>

                {/* Sidebar */}
                <div
                    className={`absolute left-0 top-0 h-full w-80 max-w-[85vw] bg-white/95 backdrop-blur-xl shadow-2xl transform transition-transform duration-300 ease-out ${isOpen ? 'translate-x-0' : '-translate-x-full'
                        }`}
                >
                    {/* Sidebar Header */}
                    <div className="flex items-center justify-between p-6 border-b border-gray-100">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                                <Zap className="w-6 h-6 text-white" />
                            </div>
                            <h2 className="text-lg font-bold bg-gradient-to-r from-gray-900 to-blue-900 bg-clip-text text-transparent">
                                AI Interview Pro
                            </h2>
                        </div>
                        <button
                            onClick={toggleSidenav}
                            className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                        >
                            <X className="w-5 h-5 text-gray-500" />
                        </button>
                    </div>

                    {/* Navigation Links */}
                    <nav className="px-4 py-6 space-y-2">
                        {filteredNavItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={(e) => {
                                    if (item.protected && !user) {
                                        e.preventDefault();
                                        router.push('/sign-in');
                                    } else {
                                        setPath(item.href);
                                        setIsOpen(false);
                                    }
                                }}
                                className={`group flex items-center space-x-3 p-4 rounded-xl transition-all duration-200 hover:scale-105 ${isActive(item.href)
                                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg shadow-blue-500/25'
                                    : 'text-gray-700 hover:bg-gray-50'
                                    }`}
                            >
                                <span className={`transition-colors duration-200 ${isActive(item.href) ? 'text-white' : 'text-gray-500 group-hover:text-blue-500'
                                    }`}>
                                    {item.icon}
                                </span>
                                <span className="font-medium">{item.label}</span>

                                {isActive(item.href) && (
                                    <div className="ml-auto w-2 h-2 bg-white rounded-full"></div>
                                )}
                            </Link>
                        ))}
                    </nav>

                    {/* User Section - Mobile */}
                    <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-gray-100 bg-gradient-to-r from-gray-50 to-blue-50">
                        {user ? (
                            <div className="flex items-center space-x-3 p-4 bg-white/80 rounded-xl shadow-sm">
                                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center shadow-sm">
                                    {user.imageUrl ? (
                                        <img 
                                            src={user.imageUrl} 
                                            alt={user.fullName || 'User'} 
                                            className="w-10 h-10 rounded-lg object-cover"
                                        />
                                    ) : (
                                        <User className="w-5 h-5 text-white" />
                                    )}
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-gray-900">{user.fullName || user.username}</p>
                                    <p className="text-xs text-gray-500">{user.primaryEmailAddress?.emailAddress}</p>
                                </div>
                                <button 
                                    onClick={handleSignOut}
                                    className="p-2 hover:bg-red-100 rounded-lg transition-colors duration-200 text-red-500"
                                >
                                    <ChevronDown className="w-4 h-4" />
                                </button>
                            </div>
                        ) : (
                            <div className="flex flex-col space-y-2">
                                <Link 
                                    href="/sign-in"
                                    className="w-full py-3 text-center rounded-xl font-medium text-gray-700 bg-white hover:bg-gray-50 transition-all duration-200"
                                >
                                    Sign In
                                </Link>
                                <Link 
                                    href="/sign-up"
                                    className="w-full py-3 text-center rounded-xl font-medium bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-md hover:shadow-lg transition-all duration-200"
                                >
                                    Sign Up
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Click outside to close user menu */}
            {showUserMenu && (
                <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowUserMenu(false)}
                ></div>
            )}
        </>
    );
};

export default Header;