"use client"

import React, { useState } from 'react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { chatSession } from '@/utils/GeminiAiModel'

const AddNewInterview = () => {
    const [openDialog, setOpenDialog] = useState(false)
    const [jobRole, setJobRole] = useState("")
    const [jobDescription, setJobDescription] = useState("")
    const [experience, setExperience] = useState("")



    const onSubmitForm = async (e) => {
        e.preventDefault()
        const InputPrompt = `Job Position: ${jobRole}, Job Description: ${jobDescription}, Experience: ${experience} , 
        depending on this information give me ${process.env.numberOfQuestions} interview 
        question with answer in JSON format.give Question and Answered as field in JSON.`


        const result = await chatSession.sendMessage(InputPrompt)
        const mockJsonResponse = (result.response.text()).replace('```json', '').replace('```', '')
        console.log(JSON.parse(mockJsonResponse))
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
                                            type="submit"
                                            className="bg-primary text-white py-2 px-4 rounded-lg hover:bg-primary-dark transition-all">
                                            Start Interview
                                        </Button>
                                        <Button
                                            onClick={() => setOpenDialog(false)}
                                            variant='destructive'
                                            className="hover:text-red-600 border-red-600 hover:bg-red-50 py-2 px-4 rounded-lg transition-all">
                                            Cancel
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
