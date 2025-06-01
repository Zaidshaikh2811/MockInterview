"use client"

import React, { useState } from 'react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "../../../components/ui/dialog"
import { Button } from '../../../components/ui/button'
import { Input } from '../../../components/ui/input'
import { Textarea } from '../../../components/ui/textarea'
import { chatSession } from "../../../utils/GeminiAiModel"
import { db } from '@/utils/db'
import { MockInterview } from '@/utils/schema'
import { v4 as uuidv4 } from 'uuid'
import { useUser } from '@clerk/nextjs'
import moment from 'moment'
import { useRouter } from 'next/navigation'
import { Plus, Sparkles, Zap, Clock, AlertCircle } from 'lucide-react'

const AddNewInterview = () => {
    const router = useRouter()
    const { user } = useUser()

    const [openDialog, setOpenDialog] = useState(false)
    const [jobRole, setJobRole] = useState("")
    const [jobDescription, setJobDescription] = useState("")
    const [experience, setExperience] = useState("")
    const [loading, setLoading] = useState(false)
    const [jsonResp, setJsonResp] = useState([])
    const [interviewMode, setInterviewMode] = useState("Dynamic")
    const [errorMsg, setErrorMsg] = useState("")

    const dynamicQuestionGenerate = async (e) => {
        e.preventDefault();
        try {
            console.log("DynamicQuestionGenerate function called")
            router.push(`/dashboard/dynamic?jobRole=${encodeURIComponent(jobRole)}&jobDescription=${encodeURIComponent(jobDescription)}&experience=${encodeURIComponent(experience)}`)
        } catch (err) {
            console.error(err)
        }
    }

    const onSubmitForm = async (e) => {
        e.preventDefault()
        setErrorMsg("")
        if (!jobRole || !jobDescription || !experience) {
            setErrorMsg("Please fill out all fields.")
            return
        }

        if (interviewMode === "Dynamic") {
            router.push(`/dashboard/dynamic?jobRole=${encodeURIComponent(jobRole)}&jobDescription=${encodeURIComponent(jobDescription)}&experience=${encodeURIComponent(experience)}`)
            return
        }

        try {
            setLoading(true)

            const InputPrompt = `Job Position: ${jobRole}, Job Description: ${jobDescription}, Experience: ${experience}.
Please provide only an array of interview questions and answers in JSON format.
Ensure that the response contains no additional information, explanations, or comments.
Format the output strictly as follows:
[
    {
        "Question": "Your question here",
        "Answer": "Your answer here"
    },
    ...
]`;

            const result = await chatSession.sendMessage(InputPrompt)
            const rawText = result.response.text()
                .replace('```json', '')
                .replace('```', '')
                .replace(/(\*\*.*?\*\*)/g, '') // Remove markdown bold text
                .trim()

            if (!rawText.startsWith('[')) {
                throw new Error("Unexpected response format from AI.")
            }

            const resp = await db.insert(MockInterview).values({
                mockId: uuidv4(),
                jsonMockResp: rawText,
                jobPosition: jobRole,
                jobDesc: jobDescription,
                jobExperience: experience,
                createdAt: moment().format('DD-MM-YYYY'),
                createdBy: user?.primaryEmailAddress?.emailAddress,
                type: interviewMode
            }).returning({ mockId: MockInterview.mockId })

            setOpenDialog(false)
            router.push(`/dashboard/interview/${resp[0]?.mockId}`)
        } catch (error) {
            console.error(error)
            setErrorMsg("An error occurred while generating the interview. Please try again.")
        } finally {
            setJobRole("")
            setJobDescription("")
            setExperience("")
            setLoading(false)
        }
    }

    return (
        <>
            {/* Trigger Card */}
            <div
                className='p-8 border-2 border-dashed border-blue-200 hover:border-blue-400 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 transition-all duration-300 cursor-pointer group hover:shadow-lg'
                onClick={() => setOpenDialog(true)}
            >
                <div className='text-center'>
                    <div className='h-16 w-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300'>
                        <Plus className='h-8 w-8 text-white' />
                    </div>
                    <h3 className='font-bold text-xl text-gray-900 mb-2 group-hover:text-blue-700 transition-colors'>
                        Create New Interview
                    </h3>
                    <p className='text-gray-600 text-sm'>
                        Start your AI-powered mock interview
                    </p>
                </div>
            </div>

            {/* Enhanced Dialog */}
            <Dialog open={openDialog} onOpenChange={setOpenDialog}>
                <DialogContent className="w-[90%] h-[90vh] overflow-y-scroll max-w-xs sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl 2xl:max-w-3xl p-0 bg-white rounded-2xl shadow-2xl border-0 ">
                    {/* Header with gradient */}
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-white">
                        <DialogHeader>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="h-10 w-10 bg-white/20 rounded-lg flex items-center justify-center">
                                    <Sparkles className="h-6 w-6" />
                                </div>
                                <DialogTitle className="text-3xl font-bold">
                                    Create New Interview
                                </DialogTitle>
                            </div>
                            <p className="text-blue-100 text-lg">
                                Let's set up your personalized mock interview experience
                            </p>
                        </DialogHeader>
                    </div>

                    {/* Content */}
                    <div className="p-8">
                        <form onSubmit={onSubmitForm} className="space-y-8">
                            {/* Interview Mode Selection */}
                            <div className="space-y-4">
                                <label className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                    <Zap className="h-5 w-5 text-blue-600" />
                                    Choose Interview Mode
                                </label>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div
                                        className={`p-6 rounded-xl border-2 cursor-pointer transition-all duration-300 ${interviewMode === "Static"
                                            ? "border-blue-500 bg-blue-50 shadow-md"
                                            : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                                            }`}
                                        onClick={() => setInterviewMode("Static")}
                                    >
                                        <div className="flex items-center gap-3 mb-3">
                                            <input
                                                type="radio"
                                                value="Static"
                                                checked={interviewMode === "Static"}
                                                onChange={() => setInterviewMode("Static")}
                                                className="w-4 h-4 text-blue-600"
                                            />
                                            <div className="h-8 w-8 bg-green-100 rounded-lg flex items-center justify-center">
                                                <Clock className="h-4 w-4 text-green-600" />
                                            </div>
                                            <h3 className="font-semibold text-gray-900">Static Mode</h3>
                                        </div>
                                        <p className="text-sm text-gray-600 ml-7">
                                            Pre-generated questions with consistent format
                                        </p>
                                    </div>

                                    <div
                                        className={`p-6 rounded-xl border-2 cursor-pointer transition-all duration-300 ${interviewMode === "Dynamic"
                                            ? "border-blue-500 bg-blue-50 shadow-md"
                                            : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                                            }`}
                                        onClick={() => setInterviewMode("Dynamic")}
                                    >
                                        <div className="flex items-center gap-3 mb-3">
                                            <input
                                                type="radio"
                                                value="Dynamic"
                                                checked={interviewMode === "Dynamic"}
                                                onChange={() => setInterviewMode("Dynamic")}
                                                className="w-4 h-4 text-blue-600"
                                            />
                                            <div className="h-8 w-8 bg-purple-100 rounded-lg flex items-center justify-center">
                                                <Sparkles className="h-4 w-4 text-purple-600" />
                                            </div>
                                            <h3 className="font-semibold text-gray-900">Dynamic Mode</h3>
                                        </div>
                                        <p className="text-sm text-gray-600 ml-7">
                                            AI-powered adaptive questioning based on responses
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Form Fields */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-gray-700">
                                        Job Role / Position
                                    </label>
                                    <Input
                                        required
                                        value={jobRole}
                                        onChange={(e) => setJobRole(e.target.value)}
                                        placeholder="e.g. Frontend Developer, Software Engineer"
                                        className="h-12 border-2 border-gray-200 focus:border-blue-500 rounded-lg transition-colors"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-gray-700">
                                        Years of Experience
                                    </label>
                                    <Input
                                        required
                                        value={experience}
                                        onChange={(e) => setExperience(e.target.value)}
                                        placeholder="e.g. 3, 5, 10"
                                        type="number"
                                        className="h-12 border-2 border-gray-200 focus:border-blue-500 rounded-lg transition-colors"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-gray-700">
                                    Job Description
                                </label>
                                <Textarea
                                    required
                                    value={jobDescription}
                                    onChange={(e) => setJobDescription(e.target.value)}
                                    placeholder="Brief description of the role, key responsibilities, and required skills..."
                                    className="min-h-[120px] border-2 border-gray-200 focus:border-blue-500 rounded-lg transition-colors resize-none"
                                />
                            </div>

                            {/* Error Message */}
                            {errorMsg && (
                                <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg">
                                    <AlertCircle className="h-5 w-5 text-red-500" />
                                    <p className="text-red-700 text-sm font-medium">{errorMsg}</p>
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
                                <Button
                                    type="button"
                                    onClick={() => setOpenDialog(false)}
                                    variant="outline"
                                    className="flex-1 h-12 border-2 border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold rounded-lg transition-all"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50"
                                >
                                    {loading ? (
                                        <div className="flex items-center gap-2">
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            Creating Interview...
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            <Sparkles className="h-4 w-4" />
                                            Create Interview
                                        </div>
                                    )}
                                </Button>
                            </div>
                        </form>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    )
}

export default AddNewInterview