import { Button } from '@/components/ui/button';
import { db } from '@/utils/db';
import { chatSession } from '@/utils/GeminiAiModel';
import { UserAnswer } from '@/utils/schema';
import { useUser } from '@clerk/nextjs';
import { Mic, MicOff, Save, AlertCircle, CheckCircle2, Edit3, Type, Keyboard } from 'lucide-react';
import Image from 'next/image';
import React, { useEffect, useState, useRef } from 'react';
import { toast } from 'sonner';

let recognition = null;

const RecordAnswerSection = ({ interviewData, questions, activeQuestion }) => {
    const { user } = useUser();
    const [answers, setAnswers] = useState([]);
    const [text, setText] = useState("");
    const [isListening, setIsListening] = useState(false);
    const [loading, setLoading] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const [liveTranscript, setLiveTranscript] = useState("");
    const textareaRef = useRef(null);

    useEffect(() => {
        if (typeof window !== 'undefined' && "webkitSpeechRecognition" in window && !recognition) {
            recognition = new window.webkitSpeechRecognition();
            recognition.lang = "en-US";
            recognition.continuous = true;
            recognition.interimResults = true; // Enable interim results for live streaming

            recognition.onresult = (event) => {
                let interimTranscript = '';
                let finalTranscript = '';

                for (let i = event.resultIndex; i < event.results.length; i++) {
                    const transcript = event.results[i][0].transcript;
                    if (event.results[i].isFinal) {
                        finalTranscript += transcript;
                    } else {
                        interimTranscript += transcript;
                    }
                }

                // Update live transcript for streaming effect
                setLiveTranscript(interimTranscript);

                // Update final text
                if (finalTranscript) {
                    setText(prev => prev + finalTranscript);
                    setLiveTranscript(''); // Clear interim results
                }
            };

            recognition.onend = () => {
                if (isListening) {
                    console.log('Recognition ended.');
                    setIsListening(false);
                    setLiveTranscript('');
                }
            };

            recognition.onerror = (event) => {
                console.error("Speech recognition error detected:", event.error);
                setIsListening(false);
                setLiveTranscript('');
                toast.error("Speech recognition error: " + event.error);
            };
        }
    }, [isListening]);

    const startListening = () => {
        if (isTyping) {
            setIsTyping(false);
        }
        setText("");
        setLiveTranscript("");
        setIsListening(true);
        if (recognition) recognition.start();
    };

    const stopListening = () => {
        if (recognition) recognition.stop();
        setIsListening(false);
        setLiveTranscript('');
        // Append the final transcription to the answers list
        if (text.trim()) {
            setAnswers([text.trim()]);
        }
    };

    const toggleTypingMode = () => {
        if (isListening) {
            stopListening();
        }
        setIsTyping(!isTyping);
        if (!isTyping) {
            // Focus on textarea when switching to typing mode
            setTimeout(() => {
                if (textareaRef.current) {
                    textareaRef.current.focus();
                }
            }, 100);
        }
    };

    const handleTextChange = (e) => {
        setText(e.target.value);
        if (e.target.value.trim()) {
            setAnswers([e.target.value.trim()]);
        } else {
            setAnswers([]);
        }
    };

    const updateUserAnswer = async () => {
        setLoading(true);

        if (text?.length < 10) {
            toast.error("Answer too short to store.");
            setLoading(false);
            return;
        }

        try {
            if (text.trim()) {
                const feedbackPrompt = `Question: ${questions[activeQuestion]?.Question}, User Answer: ${text}. Please give a rating and feedback in 3 to 5 lines in JSON format.`;

                const result = await chatSession.sendMessage(feedbackPrompt);
                const responseText = result.response.text().replace('```json', '').replace('```', '');
                const mockJsonResp = JSON.parse(responseText);
                console.log(mockJsonResp);

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
                    setText(""); // Clear the text after successful save
                    setAnswers([]);
                    setIsTyping(false);
                }
            }
        } catch (error) {
            console.error("Error while storing the answer:", error);
            toast.error("Error while storing the answer.");
        } finally {
            setLoading(false);
        }
    };

    const clearAnswer = () => {
        setText("");
        setAnswers([]);
        setLiveTranscript("");
        if (isListening) {
            stopListening();
        }
    };

    return (
        <div className="flex flex-col items-center justify-start p-6 bg-white border-2 border-gray-200 rounded-lg shadow-sm h-full">
            {/* AI Interviewer Section */}
            <div className="mb-8 w-full max-w-md">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">
                    AI Interviewer
                </h3>
                <div className="relative flex justify-center items-center bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl p-8 shadow-inner">
                    <div className={`absolute inset-0 rounded-xl transition-all duration-300 ${isListening ? 'animate-pulse bg-green-100' : isTyping ? 'bg-blue-100' : ''
                        }`}></div>
                    <Image
                        src="/OIP.jpg"
                        alt="AI Mock Interview Assistant"
                        width={150}
                        height={150}
                        className="relative z-10 rounded-full shadow-lg"
                    />
                    {isListening && (
                        <div className="absolute top-2 right-2 z-20">
                            <div className="flex items-center gap-1 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                                Listening
                            </div>
                        </div>
                    )}
                    {isTyping && (
                        <div className="absolute top-2 right-2 z-20">
                            <div className="flex items-center gap-1 bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                                <Keyboard className="w-3 h-3" />
                                Typing
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Input Mode Toggle */}
            <div className="mb-6 w-full max-w-md">
                <h4 className="text-md font-medium text-gray-700 mb-3 text-center">
                    Choose Input Method
                </h4>
                <div className="flex gap-3 justify-center">
                    {!isTyping ? (
                        <>
                            {isListening ? (
                                <Button
                                    onClick={stopListening}
                                    disabled={loading}
                                    className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 shadow-md disabled:opacity-50"
                                >
                                    <MicOff className="w-5 h-5" />
                                    Stop Recording
                                </Button>
                            ) : (
                                <Button
                                    onClick={startListening}
                                    disabled={loading}
                                    className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 shadow-md disabled:opacity-50"
                                >
                                    <Mic className="w-5 h-5" />
                                    Start Recording
                                </Button>
                            )}
                            <Button
                                onClick={toggleTypingMode}
                                disabled={loading}
                                className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 shadow-md disabled:opacity-50"
                            >
                                <Type className="w-5 h-5" />
                                Type Answer
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button
                                onClick={toggleTypingMode}
                                disabled={loading}
                                className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 shadow-md disabled:opacity-50"
                            >
                                <Mic className="w-5 h-5" />
                                Switch to Voice
                            </Button>
                            <Button
                                onClick={clearAnswer}
                                disabled={loading}
                                className="flex items-center gap-2 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 shadow-md disabled:opacity-50"
                            >
                                Clear
                            </Button>
                        </>
                    )}
                </div>
            </div>

            {/* Live Transcription / Text Input */}
            <div className="mb-6 w-full">
                <h4 className="text-md font-medium text-gray-700 mb-2 flex items-center gap-2">
                    {isTyping ? (
                        <>
                            <Edit3 className="w-4 h-4 text-blue-500" />
                            Type Your Answer
                        </>
                    ) : (
                        <>
                            <AlertCircle className="w-4 h-4 text-blue-500" />
                            {isListening ? "Live Transcription" : "Transcribed Text"}
                        </>
                    )}
                </h4>

                {isTyping ? (
                    <textarea
                        ref={textareaRef}
                        value={text}
                        onChange={handleTextChange}
                        placeholder="Type your answer here... You can also edit any transcribed text."
                        className="w-full h-32 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm leading-relaxed"
                        disabled={loading}
                    />
                ) : (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 min-h-[120px] max-h-40 overflow-y-auto">
                        <div className="text-gray-800 text-sm leading-relaxed">
                            {text && (
                                <span className="text-gray-900">{text}</span>
                            )}
                            {liveTranscript && (
                                <span className="text-blue-600 animate-pulse bg-blue-100 px-1 rounded">
                                    {liveTranscript}
                                </span>
                            )}
                            {!text && !liveTranscript && !isListening && (
                                <span className="text-gray-500 italic">
                                    Start recording to see your speech transcribed here in real-time...
                                </span>
                            )}
                            {!text && !liveTranscript && isListening && (
                                <span className="text-blue-500 italic animate-pulse">
                                    Listening... Start speaking to see transcription
                                </span>
                            )}
                        </div>
                        {text && !isTyping && (
                            <div className="mt-3 pt-3 border-t border-blue-200">
                                <Button
                                    onClick={toggleTypingMode}
                                    className="flex items-center gap-2 text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-1 rounded-md transition-colors duration-200"
                                >
                                    <Edit3 className="w-3 h-3" />
                                    Edit Text
                                </Button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Preview Answer Section */}
            {answers.length > 0 && (
                <div className="mb-6 w-full">
                    <h4 className="text-md font-medium text-gray-700 mb-3 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        Answer Preview
                    </h4>
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 max-h-32 overflow-y-auto">
                        <p className="text-gray-800 text-sm leading-relaxed">
                            {answers[0]}
                        </p>
                    </div>
                </div>
            )}

            {/* Save Answer Button */}
            <div className="w-full max-w-md">
                <Button
                    onClick={updateUserAnswer}
                    disabled={loading || !text || text.length < 10}
                    className="w-full flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Save className="w-5 h-5" />
                    {loading ? (
                        <span className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            Saving Answer...
                        </span>
                    ) : (
                        "Save Answer"
                    )}
                </Button>
                {text && text.length < 10 && (
                    <p className="text-xs text-orange-600 mt-2 text-center">
                        Answer should be at least 10 characters long
                    </p>
                )}
            </div>

            {/* Usage Tips */}
            <div className="mt-6 w-full max-w-md">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <div className="flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                        <div className="text-xs text-yellow-800">
                            <p className="font-medium mb-1">Usage Tips:</p>
                            <ul className="space-y-1 text-xs">
                                <li>• <strong>Voice:</strong> Speak clearly, see text appear in real-time</li>
                                <li>• <strong>Type:</strong> Switch to typing mode to edit or type directly</li>
                                <li>• <strong>Edit:</strong> Click "Edit Text" to modify transcribed speech</li>
                                <li>• Minimum 10 characters required to save</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RecordAnswerSection;