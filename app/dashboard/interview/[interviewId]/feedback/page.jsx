"use client"
import { db } from '@/utils/db';
import { UserAnswer } from '@/utils/schema';
import { eq } from 'drizzle-orm';
import React, { useEffect, useState } from 'react';

import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

const Feedback = ({ params }) => {
    const router = useRouter()
    const [feedbackList, setFeedbackList] = useState([]);

    const getFeedback = async () => {
        const result = await db
            .select()
            .from(UserAnswer)
            .where(eq(UserAnswer.mockIdRed, params.interviewId))  // Use the correct column name (mockIdRed)
            .orderBy(UserAnswer.id);
        console.log("Feedback:", result);

        setFeedbackList(result);
    };

    useEffect(() => {
        getFeedback();
    }, []);

    return (
        <div className='p-4 md:p-8 lg:p-12'>
            <h2 className='text-xl md:text-3xl font-bold text-green-500 mb-4'>Congratulations</h2>
            <h2 className='text-lg md:text-2xl font-bold mb-2'>Here's the interview feedback</h2>
            <h2 className='text-base md:text-lg text-primary my-3'>
                Your Overall Interview Rating: <strong>7/10</strong>
            </h2>

            <h2 className='text-lg md:text-2xl font-bold mb-2'>
                Below are the interview questions with correct answers
            </h2>
            <p className='text-sm md:text-base text-gray-500 mb-6'>
                Your answer and feedback for improvement:
            </p>

            <div className='space-y-4'>
                {feedbackList && feedbackList.map((feedback, index) => (
                    <Collapsible key={index} className='border rounded-lg p-4 shadow-md'>
                        <CollapsibleTrigger className='text-sm md:text-lg font-semibold text-gray-800'>
                            {feedback.question}
                        </CollapsibleTrigger>
                        <CollapsibleContent className='mt-2 text-gray-600 space-y-3'>
                            {/* Rating Section */}
                            <p className="text-base md:text-lg font-semibold text-yellow-600">
                                Rating: <strong>{feedback.rating}/10</strong>
                            </p>

                            {/* User's Answer */}
                            <p className='text-sm md:text-base'>
                                <strong className='text-blue-600'>Your Answer:</strong>
                                <span className='text-gray-700'> {feedback.userAns}</span>
                            </p>

                            {/* Correct Answer */}
                            <p className='text-sm md:text-base'>
                                <strong className='text-green-600'>Correct Answer:</strong>
                                <span className='text-gray-700'> {feedback.correctAns}</span>
                            </p>

                            {/* Feedback Section */}
                            <p className='text-sm md:text-base'>
                                <strong className='text-red-600'>Feedback:</strong>
                                <span className='text-gray-700'> {feedback.feedback}</span>
                            </p>
                        </CollapsibleContent>
                    </Collapsible>
                ))}
            </div>
            <Button className='mt-4' variant='outline' onCLick={() => router.push("/")}>Go Home</Button>
        </div>
    );
};

export default Feedback;
