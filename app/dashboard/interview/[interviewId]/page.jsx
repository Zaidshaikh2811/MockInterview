"use client";

import { Button } from '@/components/ui/button';
import { db } from '@/utils/db';
import { MockInterview } from '@/utils/schema';
import { eq } from 'drizzle-orm';
import { WebcamIcon } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import Webcam from 'react-webcam';
import Head from 'next/head';
import { useRouter } from 'next/navigation';

const Interview = ({ params }) => {
    const router = useRouter();
    const [interviewDetails, setInterviewDetails] = useState([]);
    const [webCamEnabled, setWebCamEnabled] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        GetInterviewDetails();
    }, []);

    const GetInterviewDetails = async () => {
        try {
            const result = await db
                .select()
                .from(MockInterview)
                .where(eq(MockInterview.mockId, params.interviewId));

            console.log("Interview details:", result);

            setInterviewDetails(result);
            setLoading(false); // Interview details are loaded
        } catch (error) {
            console.error("Error fetching interview details:", error);
            setLoading(false); // Handle failure to load interview
            setInterviewDetails(null); // Set to null if there's an error
        }
    };

    const interviewTitle = interviewDetails[0]?.jobPosition || "AI Mock Interview";

    return (
        <>
            {/* Add SEO metadata */}
            <Head>
                <title>{interviewTitle} | AI Mock Interview</title>
                <meta
                    name="description"
                    content={`Join the AI Mock Interview for ${interviewTitle} and practice your interview skills. Gain experience with real-time feedback and improve your chances of landing the job.`}
                />
                <meta
                    name="keywords"
                    content="AI mock interview, interview practice, job interview, mock interview, interview preparation"
                />
                <meta property="og:title" content={`${interviewTitle} | AI Mock Interview`} />
                <meta
                    property="og:description"
                    content={`Get started with an AI-powered mock interview for ${interviewTitle}. Practice your skills and get instant feedback.`}
                />
                <meta property="og:image" content="/mock-interview-thumbnail.png" />
                <meta property="og:type" content="website" />
                <meta name="robots" content="index, follow" />
            </Head>

            <h1 className="font-bold text-xl sm:text-2xl lg:text-3xl text-center">{interviewTitle}</h1>
            <div className="p-6 sm:p-10 my-6 sm:my-10 space-y-8">

                {loading ? (
                    <div className="flex justify-center items-center">
                        <div className="loader"></div>
                        <p className="ml-4 text-sm sm:text-base">Loading interview details...</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Display interview details */}
                        {interviewDetails ? (
                            <div className="bg-gray-100 p-4 sm:p-6 rounded-md shadow-md">
                                <h2 className="text-lg sm:text-xl font-semibold">
                                    Job Role: {interviewDetails[0].jobPosition || "N/A"}
                                </h2>
                                <p className="text-gray-700 text-sm sm:text-base">
                                    Description: {interviewDetails[0].jobDesc || "No description provided."}
                                </p>
                                <p className="text-sm sm:text-base">
                                    Experience: {interviewDetails[0].jobExperience || "N/A"}
                                </p>

                                <div className="bg-yellow-100 border-l-4 border-yellow-400 p-4 sm:p-6 rounded-lg shadow-lg mt-6">
                                    <h3 className="text-lg sm:text-xl font-bold text-yellow-800 mb-2">
                                        Important Information
                                    </h3>
                                    <p className="text-sm sm:text-base text-gray-800 leading-relaxed">
                                        During the mock interview, enabling your webcam allows for better interaction while answering the questions. However, rest assured,
                                        <span className="font-semibold"> we do not store any video or audio recordings</span> as part of our strict privacy and security policy.
                                    </p>
                                    <p className="text-sm sm:text-base text-gray-800 leading-relaxed mt-4">
                                        Your webcam and microphone are used solely for the duration of the interview. No data is kept once the session ends, ensuring your privacy is fully protected.
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <p className="text-red-500 text-sm sm:text-base">Failed to load interview details. Please try again later.</p>
                        )}

                        {/* Webcam and Button Section */}
                        <div className="w-full flex flex-col items-center lg:items-start">
                            {webCamEnabled ? (
                                <Webcam
                                    onUserMedia={() => setWebCamEnabled(true)}
                                    onUserMediaError={() => setWebCamEnabled(false)}
                                    mirrored={true}
                                    style={{
                                        height: 300,
                                        width: 300,
                                        maxWidth: '100%',
                                    }}
                                    className="rounded-md border-2 border-gray-300 shadow-md"
                                />
                            ) : (
                                <div className="flex flex-col items-center">
                                    <WebcamIcon
                                        className="h-48 w-48 sm:h-72 sm:w-72 text-gray-400 p-4 sm:p-10 bg-secondary rounded-md border-2 border-gray-300"
                                        aria-label="Webcam not enabled"
                                    />
                                    <Button
                                        onClick={() => setWebCamEnabled(true)}
                                        className="mt-4 bg-white text-primary hover:text-purple-600 hover:bg-white text-sm sm:text-base"
                                        aria-label="Enable Webcam and Microphone"
                                    >
                                        Enable Webcam and Microphone
                                    </Button>
                                </div>
                            )}
                            <Button
                                className="mt-6 w-full bg-primary text-white text-sm sm:text-base"
                                onClick={() => router.push(`/dashboard/interview/${params.interviewId}/start`)}
                            >
                                Start Interview
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default Interview;
