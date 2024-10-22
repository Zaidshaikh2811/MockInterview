import { Button } from '@/components/ui/button';
import { db } from '@/utils/db';
import { chatSession } from '@/utils/GeminiAiModel';
import { UserAnswer } from '@/utils/schema';
import { useUser } from '@clerk/nextjs';
import { Mic, MicOff } from 'lucide-react';
import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';

let recognition = null;

const RecordAnswerSection = ({ interviewData, questions, activeQuestion }) => {
    const { user } = useUser();
    const [answers, setAnswers] = useState([]);
    const [text, setText] = useState("");
    const [isListening, setIsListening] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (typeof window !== 'undefined' && "webkitSpeechRecognition" in window && !recognition) {
            recognition = new window.webkitSpeechRecognition();
            recognition.lang = "en-US";
            recognition.continuous = true;

            recognition.onresult = (event) => {
                const currentTranscript = Array.from(event.results)
                    .map((result) => result[0].transcript)
                    .join("");
                setText(currentTranscript);
            };

            recognition.onend = () => {
                if (isListening) {
                    console.log('Recognition ended.');
                    setIsListening(false);
                }
            };

            recognition.onerror = (event) => {
                console.error("Speech recognition error detected:", event.error);
                setIsListening(false);
                toast.error("Speech recognition error: " + event.error);
            };
        }
    }, [isListening]);

    const startListening = () => {
        setText("");
        setIsListening(true);
        if (recognition) recognition.start();
    };

    const stopListening = () => {
        if (recognition) recognition.stop();
        setIsListening(false);
        // Append the latest transcription to the answers list
        setAnswers([text]);
    };

    const updateUserAnswer = async () => {
        setLoading(true);

        if (text?.length < 10) {
            toast.error("Answer too short to store.");
            setLoading(false);
            return;
        }

        try {
            if (!isListening && text) {
                const feedbackPrompt = `Question: ${questions[activeQuestion]?.Question}, User Answer: ${text}. Please give a rating and feedback in 3 to 5 lines in JSON format.`;

                const result = await chatSession.sendMessage(feedbackPrompt);
                const responseText = result.response.text().replace('```json', '').replace('```', '');
                const mockJsonResp = JSON.parse(responseText);

                // Insert answer and feedback into the database
                const resp = await db.insert(UserAnswer).values({
                    mockIdRed: interviewData.mockId,
                    question: questions[activeQuestion]?.Question,
                    correctAns: questions[activeQuestion]?.Answer,
                    userAns: text,
                    feedback: mockJsonResp?.feedback,
                    rating: mockJsonResp?.rating,
                    userEmail: user?.primaryEmailAddress?.emailAddress,
                    createdAt: new Date().toISOString(),
                });

                if (resp) {
                    toast.success("Answer stored successfully with feedback.");
                }
            }
        } catch (error) {
            console.error("Error while storing the answer:", error);
            toast.error("Error while storing the answer.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className='flex items-center justify-center flex-col'>
            <div className='my-20 flex flex-col justify-center items-center bg-secondary rounded-lg p-5'>
                <Image src={"/OIP.jpg"}
                    alt="AI Mock Interview Logo"
                    width={200}
                    height={200}
                    className='absolute'
                />
            </div>

            <div className='mt-20'>
                {isListening ? (
                    <Button
                        onClick={stopListening}
                        disabled={loading}
                        className="disabled:opacity-65 flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors duration-300"
                    >
                        <MicOff className="w-5 h-5" />
                        {loading ? "Saving..." : "Stop Listening"}
                    </Button>
                ) : (
                    <Button
                        onClick={startListening}
                        disabled={loading}
                        className="disabled:opacity-65 flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors duration-300"
                    >
                        {loading ? "Saving..." : (
                            <>
                                <Mic className="w-5 h-5" />
                                Start Listening
                            </>
                        )}
                    </Button>
                )}
            </div>

            <div className='mt-4 flex flex-col items-center'>
                <h2 className='font-bold text-2xl'>Saved Answers</h2>
                <div className='border p-4 mt-2 rounded-lg w-full'>
                    {answers.length > 0 ? (
                        answers.map((answer, index) => (
                            <p key={index} className='text-gray-700 mb-2'>{answer}</p>
                        ))
                    ) : (
                        <p className='text-gray-500'>No answers saved yet.</p>
                    )}
                </div>
            </div>

            <div className='mt-4 flex justify-between w-full max-w-md'>
                <Button disabled={loading} className="disabled:opacity-65" onClick={updateUserAnswer}>
                    {loading ? "Saving..." : "Store Answer"}
                </Button>
            </div>
        </div>
    );
};

export default RecordAnswerSection;
