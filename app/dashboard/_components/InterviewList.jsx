"use client"

import { db } from '@/utils/db';
import { MockInterview } from '@/utils/schema';
import { desc, eq, ilike, and } from 'drizzle-orm';
import React, { useEffect, useState } from 'react'
import InterviewItemCard from './InterviewItemCard'
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { Search, Filter, ChevronLeft, ChevronRight, Calendar, Briefcase } from 'lucide-react';

const PAGE_SIZE = 6;
const TABS = ['Static', 'Dynamic'];

const InterviewList = () => {
    const router = useRouter();
    const { user, isLoaded, isSignedIn } = useUser();

    const [interviewList, setInterviewList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(false);
    const [selectedTab, setSelectedTab] = useState('Static');

    // Debounce for search
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
            setPage(1);
        }, 500);
        return () => clearTimeout(handler);
    }, [searchTerm]);

    // Trigger fetch
    useEffect(() => {
        if (isLoaded && isSignedIn) {
            GetInterviewList();
        }
    }, [isLoaded, isSignedIn, debouncedSearchTerm, page, selectedTab]);

    const GetInterviewList = async () => {
        setLoading(true);
        try {
            const filters = [
                eq(MockInterview.createdBy, user?.primaryEmailAddress?.emailAddress)
            ];

            if (debouncedSearchTerm.trim() !== '') {
                filters.push(ilike(MockInterview.jobPosition, `%${debouncedSearchTerm.trim()}%`));
            }

            if (selectedTab) {
                filters.push(eq(MockInterview.type, selectedTab));
            }

            const result = await db
                .select()
                .from(MockInterview)
                .where(and(...filters))
                .orderBy(desc(MockInterview.id))
                .limit(PAGE_SIZE + 1)
                .offset((page - 1) * PAGE_SIZE);

            setHasMore(result.length > PAGE_SIZE);
            setInterviewList(result.slice(0, PAGE_SIZE));
        } catch (error) {
            console.error("Failed to fetch interview list:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleTabChange = (tab) => {
        setSelectedTab(tab);
        setPage(1);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="h-8 w-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                        <Calendar className="h-5 w-5 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">Interview History</h2>
                </div>
                <div className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                    {interviewList.length} interviews
                </div>
            </div>

            {/* Filters and Search */}
            <div className="space-y-4">
                {/* Tab Filter */}
                <div className="flex items-center gap-2 flex-wrap">
                    <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                        <Filter className="h-4 w-4" />
                        Filter by:
                    </div>
                    <div className="flex gap-2">
                        {TABS.map((tab) => (
                            <button
                                key={tab}
                                onClick={() => handleTabChange(tab)}
                                className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${selectedTab === tab
                                    ? 'bg-blue-600 text-white shadow-md'
                                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                                    }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Search Bar */}
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search by job position..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                        className="block w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm"
                    />
                </div>
            </div>

            {/* Content */}
            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <div className="text-center space-y-4">
                        <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
                        <p className="text-gray-500 font-medium">Loading your interviews...</p>
                    </div>
                </div>
            ) : (
                <>
                    {/* Interview Grid */}
                    {interviewList.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {interviewList.map((item, index) => (
                                <div key={index} className="group">
                                    <InterviewItemCard item={item} router={router} />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 space-y-4">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                                <Briefcase className="h-8 w-8 text-gray-400" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">No interviews found</h3>
                                <p className="text-gray-500 max-w-md mx-auto">
                                    {searchTerm ?
                                        `No interviews match "${searchTerm}". Try adjusting your search.` :
                                        "You haven't created any interviews yet. Start by creating your first mock interview!"
                                    }
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Pagination */}
                    {interviewList.length > 0 && (
                        <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                            <button
                                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                                disabled={!hasMore}
                                onClick={() => setPage(prev => prev + 1)}
                            >
                                Next
                                <ChevronRight className="h-4 w-4" />
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default InterviewList;