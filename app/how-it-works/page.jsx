import React from 'react';

const HowItWorks = () => {
    return (
        <div className="p-6 md:p-10 bg-[#4845D2] text-white">
            <h1 className="text-3xl font-bold text-center mb-6">How It Works</h1>
            <p className="text-center mb-8 text-lg">
                Discover the seamless flow of our AI Interview system and how we generate questions using the Gemini API.
            </p>

            {/* System Flow Section */}
            <section className="mb-10">
                <h2 className="text-2xl font-bold mb-4">System Flow</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gray-800 rounded-lg p-4">
                        <h3 className="font-semibold mb-2">1. User Input</h3>
                        <p>Users provide their preferences and requirements for the interview questions, including job role, experience level, and topics.</p>
                    </div>
                    <div className="bg-gray-800 rounded-lg p-4">
                        <h3 className="font-semibold mb-2">2. API Call</h3>
                        <p>The system makes a request to the Gemini API, which analyzes the input and generates relevant interview questions.</p>
                    </div>
                    <div className="bg-gray-800 rounded-lg p-4">
                        <h3 className="font-semibold mb-2">3. Questions Retrieval</h3>
                        <p>Upon receiving a response, the system retrieves the generated questions, answers, and suggested ratings for each question.</p>
                    </div>
                    <div className="bg-gray-800 rounded-lg p-4">
                        <h3 className="font-semibold mb-2">4. User Feedback</h3>
                        <p>Users can review the questions, provide their answers, and receive instant feedback and ratings based on their responses.</p>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="mb-10">
                <h2 className="text-2xl font-bold mb-4">Key Features</h2>
                <ul className="list-disc pl-6">
                    <li className="mb-2">💬 AI-generated interview questions tailored to user specifications.</li>
                    <li className="mb-2">⭐ Instant feedback and ratings on user responses.</li>
                    <li className="mb-2">📊 Comprehensive analytics to track progress over time.</li>
                    <li className="mb-2">🔄 Continuous learning model that improves question quality with usage.</li>
                </ul>
            </section>

            {/* Gemini API Section */}
            <section>
                <h2 className="text-2xl font-bold mb-4">Gemini API Integration</h2>
                <p>
                    Our system leverages the power of the <strong>Gemini API</strong> to provide dynamic interview questions.
                    The API uses advanced algorithms to analyze user inputs and generate questions that are relevant to the current job market and industry trends.
                    This allows users to prepare effectively for their interviews with questions that reflect real-world scenarios.
                </p>
            </section>
        </div>
    );
};

export default HowItWorks;
