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

    if (!isLoaded) {
        return <p>Loading user data...</p>;
    }

    if (!isSignedIn) {
        return <p>No user is signed in.</p>;
    }
    const [interviewList, setInterviewList] = useState([]);


    useEffect(() => {
        GetInterviewList();
    }, [])

    const GetInterviewList = async () => {



        const result = await db
            .select()
            .from(MockInterview)
            .where(eq(MockInterview.createdBy, user?.primaryEmailAddress?.emailAddress))
            .orderBy(desc(MockInterview.id));
        console.log(result);

        setInterviewList(result);
    }

    return (
        <div>
            <h2 className='font-bold text-2xl'>Previous Interviews</h2>
            <div className='grid cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5'>

                {interviewList && interviewList.map((item, index) => (
                    <InterviewItemCard key={index} item={item} router={router} />
                ))}
            </div>

        </div>
    )
}

export default InterviewList
