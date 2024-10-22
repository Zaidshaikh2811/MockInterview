import { Button } from '@/components/ui/button';
import React from 'react';

const InterviewItemCard = ({ item, router }) => {
    return (
        <div className="border border-gray-300 shadow-lg rounded-lg p-5 bg-white transition-transform transform hover:scale-105 hover:shadow-xl duration-300   md:max-w-full">

            <h2 className="font-bold text-lg text-primary ">{item?.jobPosition}</h2>
            <p className="text-gray-600  text-sm md:text-base">{item?.jobDesc}</p>
            <h2 className="text-sm text-gray-500 ">
                <strong>Created At:</strong> {item?.createdAt}
            </h2>

            <div className="flex justify-between items-center mt-4 space-x-4">
                <Button
                    className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors duration-300 w-full md:w-auto"
                    onClick={() => router.push(`/dashboard/interview/${item?.mockId}/feedback`)}
                >
                    Feedback
                </Button>
                <Button
                    className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors duration-300 w-full md:w-auto"
                    onClick={() => router.push(`/dashboard/interview/${item?.mockId}`)}
                >
                    Start
                </Button>
            </div>
        </div>
    );
};

export default InterviewItemCard;
