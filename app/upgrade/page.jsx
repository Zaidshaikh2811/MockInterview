import React from 'react';

const UpgradePlan = () => {
    const plans = [
        {
            name: 'Basic Plan',
            price: '$10/month',
            features: [
                'Access to basic features',
                'Email support',
                'Community access',
            ],
        },
        {
            name: 'Pro Plan',
            price: '$20/month',
            features: [
                'All Basic features',
                'Priority support',
                'Weekly webinars',
            ],
        },
        {
            name: 'Premium Plan',
            price: '$30/month',
            features: [
                'All Pro features',
                'Personalized coaching',
                'Access to exclusive content',
            ],
        },
    ];

    return (
        <div className="h-screen p-6 md:p-10 bg-[#4845D2] text-white">
            <h1 className="text-3xl font-bold text-center mb-6">Upgrade Your Membership</h1>
            <p className="text-center mb-8 text-lg">Choose a plan that suits your needs and unlock the full potential of our platform!</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {plans.map((plan) => (
                    <div key={plan.name} className="border border-gray-300 rounded-lg shadow-lg p-6 bg-gray-800 transition-transform transform hover:scale-105">
                        <h2 className="text-2xl font-bold mb-2">{plan.name}</h2>
                        <p className="text-xl font-semibold mb-4">{plan.price}</p>
                        <ul className="mb-4">
                            {plan.features.map((feature, index) => (
                                <li key={index} className="flex items-center mb-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                                    {feature}
                                </li>
                            ))}
                        </ul>
                        <button className="w-full bg-primary text-white font-bold py-2 rounded hover:bg-opacity-80 transition duration-300">
                            Choose Plan
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default UpgradePlan;
