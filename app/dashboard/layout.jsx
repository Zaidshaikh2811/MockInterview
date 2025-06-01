import React from 'react'
import { Toaster } from "@/components/ui/sonner"

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
