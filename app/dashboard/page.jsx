import { UserButton } from '@clerk/nextjs'
import React from 'react'
import AddNewInterview from './_components/AddNewInterview'

const Dashboard = () => {

    return (
        <div className='p-10'>
            <h2 className='font-bold text-2xl'>DashBoard</h2>
            <h2 className='text-gray-500 mt-2'>
                Create and start your AI Mock Interview
            </h2>
            <div className="grid grid-vols-1 md:grid-cols-3 my-5">

                <AddNewInterview />
            </div>

        </div>
    )
}

export default Dashboard
