"use client"

import { db } from '@/utils/db';
import { MockInterview } from '@/utils/schema';
import { desc, eq, ilike, and } from 'drizzle-orm';
import React, { useEffect, useState } from 'react'
import InterviewItemCard from './InterviewItemCard'
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';

const PAGE_SIZE = 6;

const TABS = ['Static', 'Dynamic']; // Can also fetch dynamically

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
        <div>
            <h2 className='font-bold text-2xl mb-4'>Previous Interviews</h2>


            <div className="flex gap-2 mb-4 flex-wrap">
                {TABS.map((tab) => (
                    <button
                        key={tab}
                        onClick={() => handleTabChange(tab)}
                        className={`px-4 py-2 rounded ${selectedTab === tab
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 text-gray-800'
                            }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* Search */}
            <input
                type="text"
                placeholder="Search by job position..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="border p-2 mb-4 w-full md:w-1/2 rounded"
            />

            {/* Interview List */}
            {loading ? (
                <p className="text-muted-foreground">Loading interviews...</p>
            ) : (
                <>
                    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5'>
                        {interviewList.length > 0 ? (
                            interviewList.map((item, index) => (
                                <InterviewItemCard key={index} item={item} router={router} />
                            ))
                        ) : (
                            <p className="text-muted-foreground">No interviews found.</p>
                        )}
                    </div>

                    {/* Pagination */}
                    <div className="flex items-center justify-between mt-6">
                        <button
                            className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
                            disabled={page === 1}
                            onClick={() => setPage(prev => prev - 1)}
                        >
                            Previous
                        </button>

                        <span>Page {page}</span>

                        <button
                            className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
                            disabled={!hasMore}
                            onClick={() => setPage(prev => prev + 1)}
                        >
                            Next
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};

export default InterviewList;
