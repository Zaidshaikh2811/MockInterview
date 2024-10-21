"use client";

import { db } from '@/utils/db';
import { MockInterview } from '@/utils/schema';
import { eq } from 'drizzle-orm';
import React, { useEffect, useState } from 'react';
import QuestionSection from './_components/QuestionSection';
import RecordAnswerSection from './_components/RecordAnswerSection';
const StartInterview = ({ params }) => {
    const [loading, setLoading] = useState(true);
    const [interviewData, setInterviewData] = useState(null); // Consider initializing as `null` for consistency.
    const [mockInterviewQuestions, setMockInterviewQuestions] = useState([]);
    const [activeQuestion, setActiveQuestion] = useState(0);

    useEffect(() => {
        GetInterviewDetails();
    }, [params.interviewId]); // Add interviewId to ensure it refetches if it changes.

    const GetInterviewDetails = async () => {
        try {
            const result = await db
                .select()
                .from(MockInterview)
                .where(eq(MockInterview.mockId, params.interviewId));


            if (result.length > 0) {
                const jsonMockRes = JSON.parse(result[0].jsonMockResp.trim());


                setMockInterviewQuestions(jsonMockRes);
                setInterviewData(result[0]);
            } else {
                throw new Error("No data found for the interview.");
            }
            setLoading(false);
        } catch (error) {
            console.error("Error fetching interview details:", error);
            setLoading(false);
            setInterviewData(null);
        }
    };

    if (loading) {
        return <div>Loading...</div>; // Show a loading state
    }

    if (!interviewData) {
        return <div>Failed to load interview data.</div>; // Handle error case
    }

    return (
        <div>
            <h1>Mock Interview Questions</h1>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-10'>


                <QuestionSection activeQuestion={activeQuestion} setActiveQuestion={setActiveQuestion} questions={mockInterviewQuestions} />


                <RecordAnswerSection />


            </div>

        </div>
    );
};

export default StartInterview;
