"use client"

import { db } from '@/utils/db';
import { MockInterview } from '@/utils/schema';

import { desc, eq } from 'drizzle-orm';
import React, { useEffect, useState } from 'react'
import InterviewItemCard from './InterviewItemCard'
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';

const InterviewList = () => {
    const router = useRouter()
    const { user, isLoaded, isSignedIn } = useUser();

    const [interviewList, setInterviewList] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isLoaded && isSignedIn) {
            GetInterviewList();
        }
    }, [isLoaded, isSignedIn]);

    const GetInterviewList = async () => {
        setLoading(true);
        try {
            const result = await db
                .select()
                .from(MockInterview)
                .where(eq(MockInterview.createdBy, user?.primaryEmailAddress?.emailAddress))
                .orderBy(desc(MockInterview.id));

            setInterviewList(result);
        } catch (error) {
            console.error("Failed to fetch interview list:", error);
        } finally {
            setLoading(false);
        }
    }

    if (!isLoaded) {
        return <p>Loading user data...</p>;
    }

    if (!isSignedIn) {
        return <p>No user is signed in.</p>;
    }

    return (
        <div>
            <h2 className='font-bold text-2xl mb-4'>Previous Interviews</h2>

            {loading ? (
                <p className="text-muted-foreground">Loading interviews...</p>
            ) : (
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5'>
                    {interviewList.length > 0 ? (
                        interviewList.map((item, index) => (
                            <InterviewItemCard key={index} item={item} router={router} />
                        ))
                    ) : (
                        <p className="text-muted-foreground">No interviews found.</p>
                    )}
                </div>
            )}
        </div>
    )
}

export default InterviewList
