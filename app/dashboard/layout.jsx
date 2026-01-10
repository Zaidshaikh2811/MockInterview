import React from 'react'
import { Toaster } from "@/components/ui/sonner"

export const metadata = {
    title: 'Dashboard - AI Interviewer',
    description: 'Your personalized dashboard for managing AI-powered mock interviews.',
}

const DashboardLayout = ({ children }) => {
    return (
        <div>

            <div className=' '>

                {children}
            </div>
            <Toaster />
        </div>
    )
}

export default DashboardLayout
