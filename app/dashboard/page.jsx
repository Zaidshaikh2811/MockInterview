"use client"

import React, { useEffect, useState } from 'react'
import AddNewInterview from './_components/AddNewInterview'
import InterviewList from './_components/InterviewList'
import { Plus, TrendingUp, Users, Target } from 'lucide-react'
import { useUser } from '@clerk/nextjs'
import { getInterviewStatistics } from '@/utils/statistics'

const Dashboard = () => {
    const { user, isLoaded, isSignedIn } = useUser();
    const [stats, setStats] = useState({
        successRate: 0,
        completedInterviews: 0,
        averageScore: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadStatistics() {
            if (isLoaded && isSignedIn) {
                try {
                    const userEmail = user?.primaryEmailAddress?.emailAddress;
                    const statistics = await getInterviewStatistics(userEmail);
                    setStats(statistics);
                } catch (error) {
                    console.error('Error loading statistics:', error);
                } finally {
                    setLoading(false);
                }
            }
        }

        loadStatistics();
    }, [isLoaded, isSignedIn, user]);

    return (
        <div className='min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50'>
            {/* Header Section */}
            <div className='px-4 sm:px-6 lg:px-10 pt-8 pb-4'>
                <div className='w-[80vw] mx-auto'>
                    {/* Welcome Header */}
                    <div className='mb-8'>
                        <div className='flex items-center gap-3 mb-2'>
                            <div className='h-8 w-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center'>
                                <Target className='h-5 w-5 text-white' />
                            </div>
                            <h1 className='text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent'>
                                Dashboard
                            </h1>
                        </div>
                        <p className='text-gray-600 text-lg max-w-2xl'>
                            Create and start your AI-powered mock interviews to ace your next job opportunity
                        </p>
                    </div>

                    {/* Stats Cards */}
                    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8'>
                        <div className='bg-white/70 backdrop-blur-sm border border-white/50 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300'>
                            <div className='flex items-center gap-4'>
                                <div className='h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center'>
                                    <TrendingUp className='h-6 w-6 text-blue-600' />
                                </div>
                                <div>
                                    <p className='text-sm font-medium text-gray-600'>Success Rate</p>
                                    <p className='text-2xl font-bold text-gray-900'>{loading ? '...' : `${stats.successRate}%`}</p>
                                </div>
                            </div>
                        </div>

                        <div className='bg-white/70 backdrop-blur-sm border border-white/50 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300'>
                            <div className='flex items-center gap-4'>
                                <div className='h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center'>
                                    <Users className='h-6 w-6 text-green-600' />
                                </div>
                                <div>
                                    <p className='text-sm font-medium text-gray-600'>Interviews Completed</p>
                                    <p className='text-2xl font-bold text-gray-900'>{loading ? '...' : stats.completedInterviews}</p>
                                </div>
                            </div>
                        </div>

                        <div className='bg-white/70 backdrop-blur-sm border border-white/50 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300 sm:col-span-2 lg:col-span-1'>
                            <div className='flex items-center gap-4'>
                                <div className='h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center'>
                                    <Target className='h-6 w-6 text-purple-600' />
                                </div>
                                <div>
                                    <p className='text-sm font-medium text-gray-600'>Avg. Score</p>
                                    <p className='text-2xl font-bold text-gray-900'>{loading ? '...' : `${stats.averageScore}/10`}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions Section */}
                    <div className='mb-8'>
                        <div className='flex items-center justify-between mb-4'>
                            <h2 className='text-xl font-semibold text-gray-900'>Quick Actions</h2>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {/* Enhanced AddNewInterview Component */}
                            <div className='bg-white/70 backdrop-blur-sm border border-white/50 rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-[1.02]'>
                                <AddNewInterview />
                            </div>

                            {/* Additional Quick Action Cards */}
                            <div className='bg-white/70 backdrop-blur-sm border border-white/50 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer group'>
                                <div className='text-center'>
                                    <div className='h-12 w-12 bg-gradient-to-r from-orange-400 to-pink-400 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300'>
                                        <TrendingUp className='h-6 w-6 text-white' />
                                    </div>
                                    <h3 className='font-semibold text-gray-900 mb-1'>View Analytics</h3>
                                    <p className='text-sm text-gray-600'>Track your progress</p>
                                </div>
                            </div>

                            <div className='bg-white/70 backdrop-blur-sm border border-white/50 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer group'>
                                <div className='text-center'>
                                    <div className='h-12 w-12 bg-gradient-to-r from-green-400 to-teal-400 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300'>
                                        <Users className='h-6 w-6 text-white' />
                                    </div>
                                    <h3 className='font-semibold text-gray-900 mb-1'>Practice Tips</h3>
                                    <p className='text-sm text-gray-600'>Improve your skills</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Interview List Section */}
                    <div>
                        <InterviewList />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Dashboard