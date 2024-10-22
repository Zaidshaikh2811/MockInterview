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




const AddNewInterview = () => {
    const router = useRouter()
    const { user } = useUser()

    const [openDialog, setOpenDialog] = useState(false)
    const [jobRole, setJobRole] = useState("")
    const [jobDescription, setJobDescription] = useState("")
    const [experience, setExperience] = useState("")
    const [loading, setLoading] = useState(false)
    const [jsonResp, setJsonResp] = useState([])



    const onSubmitForm = async (e) => {

        e.preventDefault()
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


            const mockJsonResponse = (result.response.text()).replace('```json', '').replace('```', '').replace("**Remember:** These are just example questions and answers. Be prepared to discuss your own experiences, projects, and learning goals in detail. Adapt the answers to reflect your individual skills and personality.", "")
            setJsonResp(mockJsonResponse)

            if (mockJsonResponse) {

                const resp = await db.insert(MockInterview).values({
                    mockId: uuidv4(),
                    jsonMockResp: mockJsonResponse,
                    jobPosition: jobRole,
                    jobDesc: jobDescription,
                    jobExperience: experience,
                    createdAt: moment().format('DD-MM-YYYY'),
                    createdBy: user?.primaryEmailAddress?.emailAddress

                }).returning({ mockId: MockInterview.mockId })
                if (resp) {

                    setOpenDialog(false)
                    router.push(`/dashboard/interview/${resp[0]?.mockId}`)
                }

            } else {
                console.log("No response")
            }
        } catch (error) {
            console.log(error)
        }
        finally {
            setJobRole("")
            setJobDescription("")
            setExperience("")
            setLoading(false)
        }
    }

    return (
        <div>
            <div className='p-10 border  rounded-lg bg-secondary hover:scale-105
            hover:shadow-md ease-in-out duration-300 cursor-pointer' onClick={() => setOpenDialog(true)}>
                <h2 className='font-bold text-2xl text-center'>+ Add New Interview</h2>
            </div>
            <Dialog open={openDialog} onOpenChange={setOpenDialog}>
                <DialogContent className="max-w-2xl p-6 bg-white rounded-lg shadow-lg">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-semibold text-gray-800 mb-2">
                            Add New Interview
                        </DialogTitle>
                        <DialogDescription>
                            <div>
                                <p className='text-gray-500 mb-6'>
                                    Please provide details about the job position and your experience.
                                </p>


                                <form onSubmit={onSubmitForm}>
                                    <div className='space-y-5'>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Job Role / Position</label>
                                            <Input
                                                required
                                                value={jobRole}
                                                onChange={(e) => setJobRole(e.target.value)}
                                                placeholder="e.g. Frontend Developer, Software Engineer"
                                                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Job Description</label>
                                            <Textarea
                                                required
                                                value={jobDescription}
                                                onChange={(e) => setJobDescription(e.target.value)}
                                                placeholder="Brief description of the role or job responsibilities"
                                                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                                rows={4}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Years of Experience</label>
                                            <Input
                                                required
                                                value={experience}
                                                onChange={(e) => setExperience(e.target.value)}
                                                placeholder="e.g. 3, 5, 10"
                                                type="number"
                                                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                            />
                                        </div>

                                    </div>
                                    <div className='flex justify-end gap-4 mt-10'>
                                        <Button
                                            onClick={() => setOpenDialog(false)}
                                            variant='destructive'
                                            className="hover:text-red-600 border-red-600 hover:bg-red-50 py-2 px-4 rounded-lg transition-all">
                                            Cancel
                                        </Button>
                                        <Button
                                            type="submit"
                                            disabled={loading}
                                            className="disabled:opacity-65 bg-primary text-white py-2 px-4 rounded-lg hover:bg-primary-dark transition-all">
                                            {loading ? "Loading..." : "Submit"}
                                        </Button>
                                    </div>
                                </form>
                            </div>
                        </DialogDescription>
                    </DialogHeader>
                </DialogContent>
            </Dialog>



        </div >
    )
}

export default AddNewInterview
