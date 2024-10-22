"use client";

import { db } from '@/utils/db';
import { MockInterview } from '@/utils/schema';
import { eq } from 'drizzle-orm';
import React, { useEffect, useState } from 'react';
import QuestionSection from './_components/QuestionSection';
import RecordAnswerSection from './_components/RecordAnswerSection';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const StartInterview = ({ params }) => {
    const [loading, setLoading] = useState(true);
    const [interviewData, setInterviewData] = useState(null);
    const [mockInterviewQuestions, setMockInterviewQuestions] = useState([]);
    const [activeQuestion, setActiveQuestion] = useState(0);

    useEffect(() => {
        GetInterviewDetails();
    }, [params.interviewId]);

    const GetInterviewDetails = async () => {
        try {
            const result = await db
                .select()
                .from(MockInterview)
                .where(eq(MockInterview.mockId, params.interviewId));

            console.log("Interview details:", result);

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

    const nextQuestion = () => {
        if (activeQuestion < mockInterviewQuestions.length - 1) {
            setActiveQuestion(activeQuestion + 1);
        }
    };

    const prevQuestion = () => {
        if (activeQuestion > 0) {
            setActiveQuestion(activeQuestion - 1);
        }
    };

    if (loading) {
        return <div>Loading...</div>; // Show a loading state
    }

    if (!interviewData) {
        return <div>Failed to load interview data.</div>; // Handle error case
    }

    return (
        <div className="p-5">
            <h1 className="text-2xl font-bold mb-5">Mock Interview Questions</h1>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-10'>
                <QuestionSection
                    activeQuestion={activeQuestion}
                    setActiveQuestion={setActiveQuestion}
                    questions={mockInterviewQuestions}
                />

                <RecordAnswerSection
                    interviewData={interviewData}
                    activeQuestion={activeQuestion}
                    questions={mockInterviewQuestions}
                />
            </div>

            <div className="flex justify-between mt-10">
                <Button
                    onClick={prevQuestion}
                    disabled={activeQuestion === 0}
                    className={`px-4 py-2 rounded-lg transition-colors duration-300 ${activeQuestion === 0
                        ? 'bg-gray-300 cursor-not-allowed'
                        : 'bg-blue-500 hover:bg-blue-600 text-white'}`}
                >
                    Previous Question
                </Button>
                <Link href={`/dashboard/interview/${params.interviewId}/feedback`}>
                    <Button className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white">
                        End InterView
                    </Button>
                </Link>

                <Button
                    onClick={nextQuestion}
                    disabled={activeQuestion === mockInterviewQuestions.length - 1}
                    className={`px-4 py-2 rounded-lg transition-colors duration-300 ${activeQuestion === mockInterviewQuestions.length - 1
                        ? 'bg-gray-300 cursor-not-allowed'
                        : 'bg-green-500 hover:bg-green-600 text-white'}`}
                >
                    Next Question
                </Button>
            </div>
        </div>
    );
};

export default StartInterview;
