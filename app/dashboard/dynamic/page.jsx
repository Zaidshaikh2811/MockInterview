"use client"
import React, { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
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
        toast.success("Interview ended.")
        router.push(`/dashboard/interview/${mockId}/feedback`)
    }

    return (
        <div className="max-w-2xl mx-auto p-4 space-y-6">
            <h2 className="text-xl font-bold">Dynamic Interview</h2>
            {loading && !currentQuestion && (
                <div className="text-center text-muted-foreground py-10">
                    <p className="animate-pulse text-lg">Loading your interview questions...</p>
                </div>
            )}
            {!loading && previousQA.map((qa, index) => (
                <div key={index} className="bg-muted p-3 rounded-md text-sm">
                    <p><strong>Q{index + 1}:</strong> {qa.question}</p>
                    <p><strong>Your Answer:</strong> {qa.userAnswer}</p>
                    {/* <p><strong>Correct Answer:</strong> {qa.correctAnswer}</p>
                    <p><strong>Feedback:</strong> {qa.feedback}</p>
                    <p><strong>Rating:</strong> {qa.rating}/10</p> */}
                </div>
            ))}

            {!loading && currentQuestion && (
                <div className="space-y-3">
                    <div>
                        <p className="font-medium">Current Question:</p>
                        <p className="text-lg">{currentQuestion}</p>
                    </div>

                    <Textarea
                        value={userAnswer}
                        onChange={(e) => setUserAnswer(e.target.value)}
                        placeholder="Type your answer..."
                        className="mt-1"
                    />

                    <div className="flex gap-2 mt-2">
                        <Button
                            onClick={handleSubmitAnswer}
                            disabled={loading || !userAnswer.trim()}
                        >
                            {loading ? "Submitting..." : "Submit Answer"}
                        </Button>

                        <Button
                            variant="destructive"
                            onClick={handleEndInterview}
                            disabled={!mockId}
                        >
                            End Interview
                        </Button>
                    </div>
                </div>
            )}
        </div>
    )
}

export default DynamicInterview
