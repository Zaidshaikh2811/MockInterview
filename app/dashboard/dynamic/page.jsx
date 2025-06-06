"use client"
import React, { useEffect, useState, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import { AlertCircle, CheckCircle2, MessageSquare, Clock, User, Briefcase, FileText, Mic, MicOff, Edit, Save } from "lucide-react"
import { chatSession } from '@/utils/GeminiAiModel'
import { toast } from 'sonner'
import { db } from '@/utils/db'
import { MockInterview, UserAnswer } from '@/utils/schema'
import { useUser } from '@clerk/nextjs'
import { v4 as uuidv4 } from 'uuid'
import moment from 'moment'

const DynamicInterview = () => {
    const { user } = useUser()
    const router = useRouter()
    const searchParams = useSearchParams()

    const jobRole = searchParams.get("jobRole")
    const jobDescription = searchParams.get("jobDescription")
    const experience = searchParams.get("experience")

    const [currentQuestion, setCurrentQuestion] = useState("")
    const [previousQA, setPreviousQA] = useState([])
    const [userAnswer, setUserAnswer] = useState("")
    const [loading, setLoading] = useState(false)
    const [mockId, setMockId] = useState(null)

    // Speech recognition states
    const [isListening, setIsListening] = useState(false)
    const [speechSupported, setSpeechSupported] = useState(false)
    const [transcription, setTranscription] = useState("")
    const recognitionRef = useRef(null)

    // Edit mode for previous answers
    const [editingIndex, setEditingIndex] = useState(null)
    const [editedAnswer, setEditedAnswer] = useState("")

    // Check if speech recognition is supported
    useEffect(() => {
        if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
            setSpeechSupported(true)
        } else {
            setSpeechSupported(false)
        }
    }, [])

    // Initialize speech recognition
    useEffect(() => {
        if (speechSupported) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
            recognitionRef.current = new SpeechRecognition()
            recognitionRef.current.continuous = true
            recognitionRef.current.interimResults = true

            recognitionRef.current.onresult = (event) => {
                let transcript = ""
                for (let i = 0; i < event.results.length; i++) {
                    transcript += event.results[i][0].transcript
                }
                setTranscription(transcript)
                setUserAnswer(transcript)
            }

            recognitionRef.current.onerror = (event) => {
                console.error("Speech recognition error", event.error)
                setIsListening(false)
                toast.error("Speech recognition error: " + event.error)
            }

            recognitionRef.current.onend = () => {
                if (isListening) {
                    recognitionRef.current.start()
                }
            }
        }

        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.stop()
            }
        }
    }, [speechSupported, isListening])

    const toggleListening = () => {
        if (isListening) {
            recognitionRef.current.stop()
            setIsListening(false)
        } else {
            setTranscription("")
            recognitionRef.current.start()
            setIsListening(true)
        }
    }

    // Utility to extract JSON from AI response
    const parseJsonResponse = (text) => {
        try {
            const clean = text.replace(/```json|```/g, '')
            return JSON.parse(clean)
        } catch (e) {
            toast.error("Failed to parse AI response.")
            return null
        }
    }

    // Store interview session
    const storeMockInterviewSession = async () => {
        try {
            const mockJsonResponse = {
                jobRole,
                jobDescription,
                experience
            }

            const result = await db.insert(MockInterview).values({
                mockId: uuidv4(),
                jsonMockResp: mockJsonResponse,
                jobPosition: jobRole,
                jobDesc: jobDescription,
                jobExperience: experience,
                createdAt: moment().format('DD-MM-YYYY'),
                createdBy: user?.primaryEmailAddress?.emailAddress,
                type: "Dynamic",
            }).returning({
                mockId: MockInterview.mockId
            })
            console.log("Mock interview session created:", result);

            if (result.length > 0) {
                setMockId(result[0].mockId)
                console.log("Interview session created:", result[0].mockId)
            }
        } catch (error) {
            console.error("Error storing mock session:", error)
        }
    }

    // Load first question and interview session
    useEffect(() => {
        const init = async () => {
            if (jobRole && jobDescription && experience) {
                await storeMockInterviewSession()
                await fetchInitialQuestion()
            }
        }
        init()
    }, [jobRole, jobDescription, experience])

    const fetchInitialQuestion = async () => {
        setLoading(true)
        const prompt = `
        I want to conduct a dynamic mock interview for the following:

        - Job Role: ${jobRole}
        - Job Description: ${jobDescription}
        - Years of Experience: ${experience}

        Begin the interview by asking the first question only. Do not include answers or explanations.

        Format:
        {
          "Question": "Your first interview question here"
        }
        `
        try {
            const result = await chatSession.sendMessage(prompt)
            const parsed = parseJsonResponse(await result.response.text())
            if (parsed?.Question) setCurrentQuestion(parsed.Question)
        } catch (err) {
            console.error("Error fetching question:", err)
            toast.error("Could not fetch the first question.")
        } finally {
            setLoading(false)
        }
    }

    const handleSubmitAnswer = async () => {
        if (!mockId) return toast.error("Session not initialized.")
        if (userAnswer.trim().length < 10) return toast.error("Answer too short.")

        setLoading(true)

        // Stop speech recognition if active
        if (isListening) {
            recognitionRef.current.stop()
            setIsListening(false)
        }

        const feedbackPrompt = `
        You are evaluating a candidate in a mock interview.

        Question: ${currentQuestion}
        User Answer: ${userAnswer}

        Please return a JSON object with:
        - "rating": number,
        - "feedback": string,
        - "correctAnswer": string

        Format:
        {
          "rating": number,
          "feedback": "string",
          "correctAnswer": "string"
        }
        `

        try {
            const feedbackResult = await chatSession.sendMessage(feedbackPrompt)
            const parsed = parseJsonResponse(await feedbackResult.response.text())

            if (!parsed) return

            const { rating, feedback, correctAnswer } = parsed

            await db.insert(UserAnswer).values({
                mockIdRed: mockId,
                question: currentQuestion,
                correctAns: correctAnswer,
                userAns: userAnswer,
                feedback,
                rating,
                userEmail: user?.primaryEmailAddress?.emailAddress,
                createdAt: new Date().toISOString(),
            })

            setPreviousQA(prev => [...prev, {
                question: currentQuestion,
                userAnswer,
                correctAnswer,
                feedback,
                rating
            }])

            toast.success("Answer submitted.")
            setTranscription("")
            setUserAnswer("")

            await fetchNextQuestion()
        } catch (error) {
            console.error("Submit error:", error)
            toast.error("Failed to submit answer.")
        } finally {
            setLoading(false)
        }
    }

    const fetchNextQuestion = async () => {
        const prompt = `
        Based on this interview flow:

        - Job Role: ${jobRole}
        - Job Description: ${jobDescription}
        - Experience: ${experience}

        Candidate was asked: "${currentQuestion}"
        Candidate's Answer: "${userAnswer}"

        Provide the next follow-up question only.

        Format:
        {
          "Question": "Your next follow-up question here"
        }
        `
        try {
            const result = await chatSession.sendMessage(prompt)
            const parsed = parseJsonResponse(await result.response.text())
            if (parsed?.Question) {
                setCurrentQuestion(parsed.Question)
                setUserAnswer("")
            }
        } catch (err) {
            console.error("Error fetching next question:", err)
            toast.error("Could not fetch the next question.")
        }
    }

    const handleEndInterview = () => {
        // Stop speech recognition if active
        if (isListening && recognitionRef.current) {
            recognitionRef.current.stop()
            setIsListening(false)
        }

        toast.success("Interview ended.")
        router.push(`/dashboard/interview/${mockId}/feedback`)
    }

    const getProgressValue = () => {
        return Math.min((previousQA.length / 5) * 100, 100) // Assume max 5 questions for progress
    }

    // Edit previous answer
    const handleEditAnswer = (index) => {
        setEditingIndex(index)
        setEditedAnswer(previousQA[index].userAnswer)
    }

    const handleSaveEdit = async (index) => {
        if (editedAnswer.trim().length < 10) {
            toast.error("Answer too short.")
            return
        }

        setLoading(true)

        const questionToEdit = previousQA[index].question

        const feedbackPrompt = `
        You are evaluating a candidate in a mock interview.

        Question: ${questionToEdit}
        User Answer: ${editedAnswer}

        Please return a JSON object with:
        - "rating": number,
        - "feedback": string,
        - "correctAnswer": string

        Format:
        {
          "rating": number,
          "feedback": "string",
          "correctAnswer": "string"
        }
        `

        try {
            const feedbackResult = await chatSession.sendMessage(feedbackPrompt)
            const parsed = parseJsonResponse(await feedbackResult.response.text())

            if (!parsed) return

            const { rating, feedback, correctAnswer } = parsed

            // Update in database
            await db.update(UserAnswer)
                .set({
                    userAns: editedAnswer,
                    feedback,
                    rating
                })
                .where(
                    and(
                        eq(UserAnswer.mockIdRed, mockId),
                        eq(UserAnswer.question, questionToEdit),
                        eq(UserAnswer.userEmail, user?.primaryEmailAddress?.emailAddress)
                    )
                )

            // Update in local state
            const updatedQA = [...previousQA]
            updatedQA[index] = {
                ...updatedQA[index],
                userAnswer: editedAnswer,
                feedback,
                rating
            }
            setPreviousQA(updatedQA)

            setEditingIndex(null)
            setEditedAnswer("")
            toast.success("Answer updated successfully")

        } catch (error) {
            console.error("Edit error:", error)
            toast.error("Failed to update answer.")
        } finally {
            setLoading(false)
        }
    }

    const handleCancelEdit = () => {
        setEditingIndex(null)
        setEditedAnswer("")
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4">
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Header Section */}
                <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                    <CardHeader className="pb-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                                    Dynamic Interview Session
                                </CardTitle>
                                <CardDescription className="text-base mt-2">
                                    AI-powered adaptive interview experience
                                </CardDescription>
                            </div>
                            <Badge variant="secondary" className="bg-blue-100 text-blue-700 px-3 py-1">
                                Question {previousQA.length + 1}
                            </Badge>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Briefcase className="w-4 h-4 text-blue-500" />
                                <span className="font-medium">Role:</span> {jobRole}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <User className="w-4 h-4 text-green-500" />
                                <span className="font-medium">Experience:</span> {experience} years
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Clock className="w-4 h-4 text-orange-500" />
                                <span className="font-medium">Progress:</span> {previousQA.length} answered
                            </div>
                        </div>

                        {previousQA.length > 0 && (
                            <div className="mt-4">
                                <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
                                    <span>Interview Progress</span>
                                    <span>{Math.round(getProgressValue())}% Complete</span>
                                </div>
                                <Progress value={getProgressValue()} className="h-2" />
                            </div>
                        )}
                    </CardHeader>
                </Card>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Previous Q&A Section */}
                    <div className="lg:col-span-1">
                        <Card className="h-fit border-0 shadow-md bg-white/80 backdrop-blur-sm">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <MessageSquare className="w-5 h-5 text-blue-500" />
                                    Previous Questions
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {previousQA.length === 0 ? (
                                    <p className="text-sm text-muted-foreground text-center py-4">
                                        No questions answered yet
                                    </p>
                                ) : (
                                    <ScrollArea className="h-[400px] pr-4">
                                        <div className="space-y-4">
                                            {previousQA.map((qa, index) => (
                                                <div key={index} className="border-l-4 border-blue-200 pl-4 pb-4">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <div className="flex items-center gap-2">
                                                            <Badge variant="outline" className="text-xs">
                                                                Q{index + 1}
                                                            </Badge>
                                                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                                                        </div>
                                                        {editingIndex !== index && (
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleEditAnswer(index)}
                                                                className="h-6 p-1"
                                                            >
                                                                <Edit className="w-3.5 h-3.5 text-gray-500" />
                                                            </Button>
                                                        )}
                                                    </div>
                                                    <p className="text-sm font-medium text-gray-700 mb-2">
                                                        {qa.question}
                                                    </p>

                                                    {editingIndex === index ? (
                                                        <div className="space-y-2">
                                                            <Textarea
                                                                value={editedAnswer}
                                                                onChange={(e) => setEditedAnswer(e.target.value)}
                                                                className="text-xs min-h-[80px] resize-none"
                                                            />
                                                            <div className="flex justify-end gap-2">
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={handleCancelEdit}
                                                                    className="h-6 text-xs"
                                                                >
                                                                    Cancel
                                                                </Button>
                                                                <Button
                                                                    variant="default"
                                                                    size="sm"
                                                                    onClick={() => handleSaveEdit(index)}
                                                                    className="h-6 text-xs bg-blue-500"
                                                                    disabled={loading || editedAnswer.trim().length < 10}
                                                                >
                                                                    <Save className="w-3.5 h-3.5 mr-1" /> Save
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <p className="text-xs text-muted-foreground bg-gray-50 p-2 rounded">
                                                            {qa.userAnswer.substring(0, 100)}
                                                            {qa.userAnswer.length > 100 && "..."}
                                                        </p>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </ScrollArea>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Current Question Section */}
                    <div className="lg:col-span-2">
                        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                            <CardContent className="p-6">
                                {loading && !currentQuestion ? (
                                    <div className="text-center py-12">
                                        <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                                        <p className="text-lg font-medium text-gray-700">Loading your interview questions...</p>
                                        <p className="text-sm text-muted-foreground mt-2">Preparing personalized questions based on your profile</p>
                                    </div>
                                ) : currentQuestion ? (
                                    <div className="space-y-6">
                                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-100">
                                            <div className="flex items-start gap-3">
                                                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                                                    <MessageSquare className="w-4 h-4 text-white" />
                                                </div>
                                                <div className="flex-1">
                                                    <h3 className="font-semibold text-gray-800 mb-2">
                                                        Current Question #{previousQA.length + 1}
                                                    </h3>
                                                    <p className="text-lg leading-relaxed text-gray-700">
                                                        {currentQuestion}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <div>
                                                <div className="flex justify-between items-center mb-2">
                                                    <label className="block text-sm font-medium text-gray-700">
                                                        Your Answer
                                                    </label>
                                                    {speechSupported && (
                                                        <Button
                                                            variant={isListening ? "destructive" : "outline"}
                                                            size="sm"
                                                            onClick={toggleListening}
                                                            className={`flex items-center gap-2 ${isListening ? "bg-red-100 text-red-600 border-red-200" : "border-blue-200 text-blue-600"}`}
                                                            disabled={loading}
                                                        >
                                                            {isListening ? (
                                                                <>
                                                                    <MicOff className="w-4 h-4" />
                                                                    Stop Recording
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <Mic className="w-4 h-4" />
                                                                    Answer with Voice
                                                                </>
                                                            )}
                                                        </Button>
                                                    )}
                                                </div>

                                                {isListening && (
                                                    <div className="bg-red-50 text-red-800 p-2 rounded-md mb-3 text-sm flex items-center">
                                                        <div className="animate-pulse w-2 h-2 bg-red-600 rounded-full mr-2"></div>
                                                        Recording your answer... Speak clearly.
                                                    </div>
                                                )}

                                                <Textarea
                                                    value={userAnswer}
                                                    onChange={(e) => setUserAnswer(e.target.value)}
                                                    placeholder="Take your time to provide a detailed answer..."
                                                    className="min-h-[120px] resize-none border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                                                />
                                                <div className="flex justify-between items-center mt-2">
                                                    <p className="text-xs text-muted-foreground">
                                                        Minimum 10 characters required
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {userAnswer.length} characters
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex gap-3 pt-4">
                                                <Button
                                                    onClick={handleSubmitAnswer}
                                                    disabled={loading || userAnswer.trim().length < 10}
                                                    className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md"
                                                    size="lg"
                                                >
                                                    {loading ? (
                                                        <>
                                                            <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                                                            Submitting...
                                                        </>
                                                    ) : (
                                                        "Submit Answer"
                                                    )}
                                                </Button>

                                                <Button
                                                    variant="destructive"
                                                    onClick={handleEndInterview}
                                                    disabled={!mockId}
                                                    className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
                                                    size="lg"
                                                >
                                                    End Interview
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ) : null}
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Job Description Card */}
                {jobDescription && (
                    <Card className="border-0 shadow-md bg-white/80 backdrop-blur-sm">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <FileText className="w-5 h-5 text-indigo-500" />
                                Job Description Reference
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="bg-gray-50 p-4 rounded-lg border">
                                <p className="text-sm text-gray-700 leading-relaxed">
                                    {jobDescription}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    )
}

export default DynamicInterview

