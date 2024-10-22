import React from 'react'
import Header from './_components/Header'
import { Toaster } from "@/components/ui/sonner"

const DashboardLayout = ({ children }) => {
    return (
        <div>
            <Header />
            <div className='mx-5 md:mx-20 lg:mx-36'>

                {children}
            </div>
            <Toaster />
        </div>
    )
}

export default DashboardLayout
