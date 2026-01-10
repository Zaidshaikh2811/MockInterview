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
import { ChevronDown, ChevronUp, Trophy, Home, Star } from 'lucide-react';

export const metadata = {
    title: 'Interview Feedback - AI Interview Pro',
    description: 'Review your AI-powered mock interview feedback with detailed insights and ratings to help you improve.',
};

const Feedback = ({ params }) => {
    const router = useRouter()
    const [feedbackList, setFeedbackList] = useState([]);
    const [openItems, setOpenItems] = useState({});

    const getFeedback = async () => {
        const result = await db
            .select()
            .from(UserAnswer)
            .where(eq(UserAnswer.mockIdRed, params.interviewId))
            .orderBy(UserAnswer.id);
        console.log("Feedback:", result);

        setFeedbackList(result);
    };

    useEffect(() => {
        getFeedback();
    }, []);

    const toggleItem = (index) => {
        setOpenItems(prev => ({
            ...prev,
            [index]: !prev[index]
        }));
    };

    const getRatingColor = (rating) => {
        if (rating >= 8) return 'text-green-600 bg-green-100';
        if (rating >= 6) return 'text-yellow-600 bg-yellow-100';
        return 'text-red-600 bg-red-100';
    };

    const getOverallRating = () => {
        if (feedbackList.length === 0) return 0;
        const totalRating = feedbackList.reduce((sum, feedback) => sum + (feedback.rating || 0), 0);
        return Math.round(totalRating / feedbackList.length);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Header Section */}
                <div className="text-center mb-8">
                    <div className="flex justify-center mb-4">
                        <Trophy className="w-16 h-16 text-yellow-500" />
                    </div>
                    <h1 className="text-4xl font-bold text-gray-800 mb-2">
                        Congratulations!
                    </h1>
                    <p className="text-xl text-gray-600 mb-6">
                        Here's your interview feedback
                    </p>

                    {/* Overall Rating Card */}
                    <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-100">
                        <div className="flex items-center justify-center gap-4">
                            <div className="flex items-center gap-2">
                                <Star className="w-8 h-8 text-yellow-500 fill-current" />
                                <span className="text-2xl font-bold text-gray-800">
                                    Overall Rating:
                                </span>
                            </div>
                            <div className={`px-6 py-3 rounded-full text-2xl font-bold ${getRatingColor(getOverallRating())}`}>
                                {getOverallRating()}/10
                            </div>
                        </div>
                    </div>
                </div>

                {/* Instructions */}
                <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-8 rounded-r-lg">
                    <p className="text-blue-800 font-medium">
                        📋 Below are your interview questions with detailed feedback and correct answers
                    </p>
                </div>

                {/* Feedback List */}
                <div className="space-y-4 mb-8">
                    {feedbackList && feedbackList.map((feedback, index) => (
                        <div key={index} className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden transition-all duration-200 hover:shadow-lg">
                            <Collapsible
                                open={openItems[index]}
                                onOpenChange={() => toggleItem(index)}
                            >
                                <CollapsibleTrigger className="w-full">
                                    <div className="flex items-center justify-between p-6 hover:bg-gray-50 transition-colors">
                                        <div className="flex items-start gap-4 text-left flex-1">
                                            <div className="bg-blue-100 text-blue-800 rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">
                                                {index + 1}
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                                                    {feedback.question}
                                                </h3>
                                                <div className="flex items-center gap-3">
                                                    <span className="text-sm text-gray-600">Rating:</span>
                                                    <span className={`px-3 py-1 rounded-full text-sm font-bold ${getRatingColor(feedback.rating)}`}>
                                                        {feedback.rating}/10
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="ml-4">
                                            {openItems[index] ? (
                                                <ChevronUp className="w-5 h-5 text-gray-500" />
                                            ) : (
                                                <ChevronDown className="w-5 h-5 text-gray-500" />
                                            )}
                                        </div>
                                    </div>
                                </CollapsibleTrigger>

                                <CollapsibleContent>
                                    <div className="px-6 pb-6 space-y-6 border-t border-gray-100 pt-6">
                                        {/* User's Answer */}
                                        <div className="bg-blue-50 rounded-lg p-4">
                                            <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                                Your Answer:
                                            </h4>
                                            <p className="text-blue-800 leading-relaxed">
                                                {feedback.userAns}
                                            </p>
                                        </div>

                                        {/* Correct Answer */}
                                        <div className="bg-green-50 rounded-lg p-4">
                                            <h4 className="font-semibold text-green-900 mb-2 flex items-center gap-2">
                                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                                Correct Answer:
                                            </h4>
                                            <p className="text-green-800 leading-relaxed">
                                                {feedback.correctAns}
                                            </p>
                                        </div>

                                        {/* Feedback */}
                                        <div className="bg-purple-50 rounded-lg p-4">
                                            <h4 className="font-semibold text-purple-900 mb-2 flex items-center gap-2">
                                                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                                                Feedback for Improvement:
                                            </h4>
                                            <p className="text-purple-800 leading-relaxed">
                                                {feedback.feedback}
                                            </p>
                                        </div>
                                    </div>
                                </CollapsibleContent>
                            </Collapsible>
                        </div>
                    ))}
                </div>

                {/* Home Button */}
                <div className="text-center">
                    <Button
                        onClick={() => router.push("/")}
                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-full text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2 mx-auto"
                    >
                        <Home className="w-5 h-5" />
                        Go Home
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default Feedback;