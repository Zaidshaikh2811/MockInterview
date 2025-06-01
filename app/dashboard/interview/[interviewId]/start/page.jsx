"use client";

import { db } from '@/utils/db';
import { MockInterview } from '@/utils/schema';
import { eq } from 'drizzle-orm';
import React, { useEffect, useState } from 'react';
import QuestionSection from './_components/QuestionSection';
import RecordAnswerSection from './_components/RecordAnswerSection';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Square, Clock, User, Briefcase, AlertTriangle } from 'lucide-react';

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

    const getProgressPercentage = () => {
        return ((activeQuestion + 1) / mockInterviewQuestions.length) * 100;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <h2 className="text-xl font-semibold text-gray-700 mb-2">Loading Interview</h2>
                    <p className="text-gray-500">Preparing your mock interview session...</p>
                </div>
            </div>
        );
    }

    if (!interviewData) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center">
                <div className="text-center bg-white p-8 rounded-lg shadow-lg max-w-md">
                    <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-gray-800 mb-2">Interview Not Found</h2>
                    <p className="text-gray-600 mb-4">Failed to load interview data. Please try again.</p>
                    <Link href="/dashboard">
                        <Button className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg">
                            Back to Dashboard
                        </Button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
            {/* Header Section */}
            <div className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 mb-1">
                                Mock Interview Session
                            </h1>
                            {interviewData && (
                                <div className="flex items-center gap-4 text-sm text-gray-600">
                                    <div className="flex items-center gap-1">
                                        <Briefcase className="w-4 h-4" />
                                        <span>{interviewData.jobPosition}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <User className="w-4 h-4" />
                                        <span>{interviewData.jobExperience} Years Experience</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Clock className="w-4 h-4" />
                                        <span>{mockInterviewQuestions.length} Questions</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Progress Indicator */}
                        <div className="text-right">
                            <div className="text-sm font-medium text-gray-700 mb-1">
                                Question {activeQuestion + 1} of {mockInterviewQuestions.length}
                            </div>
                            <div className="w-48 bg-gray-200 rounded-full h-2">
                                <div
                                    className="bg-blue-500 h-2 rounded-full transition-all duration-300 ease-out"
                                    style={{ width: `${getProgressPercentage()}%` }}
                                ></div>
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                                {Math.round(getProgressPercentage())}% Complete
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-6 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Question Section */}
                    <div className="order-1 lg:order-1">
                        <QuestionSection
                            activeQuestion={activeQuestion}
                            setActiveQuestion={setActiveQuestion}
                            questions={mockInterviewQuestions}
                        />
                    </div>

                    {/* Answer Section */}
                    <div className="order-2 lg:order-2">
                        <RecordAnswerSection
                            interviewData={interviewData}
                            activeQuestion={activeQuestion}
                            questions={mockInterviewQuestions}
                        />
                    </div>
                </div>

                {/* Navigation Controls */}
                <div className="mt-12 bg-white rounded-lg shadow-sm border p-6">
                    <div className="flex items-center justify-between">
                        {/* Previous Button */}
                        <Button
                            onClick={prevQuestion}
                            disabled={activeQuestion === 0}
                            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 ${activeQuestion === 0
                                ? 'bg-gray-200 text-gray-400 cursor-not-allowed hover:scale-100'
                                : 'bg-blue-500 hover:bg-blue-600 text-white shadow-md hover:shadow-lg'
                                }`}
                        >
                            <ChevronLeft className="w-5 h-5" />
                            Previous Question
                        </Button>

                        {/* Center Info */}
                        <div className="text-center">
                            <div className="text-sm text-gray-600 mb-1">Current Progress</div>
                            <div className="flex items-center gap-2">
                                {Array.from({ length: mockInterviewQuestions.length }, (_, i) => (
                                    <div
                                        key={i}
                                        className={`w-3 h-3 rounded-full transition-all duration-300 ${i === activeQuestion
                                            ? 'bg-blue-500 scale-125'
                                            : i < activeQuestion
                                                ? 'bg-green-500'
                                                : 'bg-gray-300'
                                            }`}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* End Interview Button */}
                        <Link href={`/dashboard/interview/${params.interviewId}/feedback`}>
                            <Button className="flex items-center gap-2 px-6 py-3 rounded-lg font-medium bg-red-500 hover:bg-red-600 text-white transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg">
                                <Square className="w-5 h-5" />
                                End Interview
                            </Button>
                        </Link>

                        {/* Next Button */}
                        <Button
                            onClick={nextQuestion}
                            disabled={activeQuestion === mockInterviewQuestions.length - 1}
                            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 ${activeQuestion === mockInterviewQuestions.length - 1
                                ? 'bg-gray-200 text-gray-400 cursor-not-allowed hover:scale-100'
                                : 'bg-green-500 hover:bg-green-600 text-white shadow-md hover:shadow-lg'
                                }`}
                        >
                            Next Question
                            <ChevronRight className="w-5 h-5" />
                        </Button>
                    </div>

                    {/* Additional Info */}
                    <div className="mt-4 pt-4 border-t border-gray-100">
                        <div className="flex items-center justify-center gap-6 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                                <span>Current Question</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                <span>Completed</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
                                <span>Remaining</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tips Section */}
                <div className="mt-8 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-yellow-800 mb-3 flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5" />
                        Interview Tips
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-yellow-700">
                        <div className="flex items-start gap-2">
                            <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                            <div>
                                <strong>Take Your Time:</strong> Think before answering and speak at a comfortable pace.
                            </div>
                        </div>
                        <div className="flex items-start gap-2">
                            <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                            <div>
                                <strong>Be Specific:</strong> Use concrete examples and quantify your achievements when possible.
                            </div>
                        </div>
                        <div className="flex items-start gap-2">
                            <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                            <div>
                                <strong>Stay Positive:</strong> Focus on learning experiences and growth opportunities.
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StartInterview;