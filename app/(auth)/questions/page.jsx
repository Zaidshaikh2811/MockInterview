"use client"
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';



const Questions = () => {
    const [question, setQuestion] = useState('');
    const [email, setEmail] = useState('');
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        // Handle form submission logic here
        setSubmitted(true);
    };

    return (
        <div className="min-h-screen bg-gradient-to-t from-primary to-blue-500 flex items-center justify-center p-8">
            <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-lg">
                <h1 className="text-2xl font-bold text-primary mb-4">Ask a Question</h1>
                <p className="text-gray-600 mb-6">
                    Have any questions regarding the interview? Fill out the form below, and we'll get back to you!
                </p>

                {!submitted ? (
                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <label htmlFor="question" className="block text-gray-700 font-medium mb-2">
                                Your Question
                            </label>
                            <textarea
                                id="question"
                                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                                rows="5"
                                value={question}
                                onChange={(e) => setQuestion(e.target.value)}
                                required
                                placeholder="Type your question here..."
                            />
                        </div>

                        <div className="mb-4">
                            <label htmlFor="email" className="block text-gray-700 font-medium mb-2">
                                Your Email
                            </label>
                            <input
                                id="email"
                                type="email"
                                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                placeholder="Enter your email address"
                            />
                        </div>

                        <Button type="submit" className="w-full mt-4">
                            Submit
                        </Button>
                    </form>
                ) : (
                    <div className="text-center">
                        <h2 className="text-xl text-primary font-bold mb-2">Thank You!</h2>
                        <p className="text-gray-600">Your question has been submitted. We will get back to you shortly.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Questions;
