import React from 'react'
import { Toaster } from "@/components/ui/sonner"

const DashboardLayout = ({ children }) => {
    return (
        <div>

            <div className='mx-5 md:mx-20 lg:mx-36'>

                {children}
            </div>
            <Toaster />
        </div>
    )
}

export default DashboardLayout
