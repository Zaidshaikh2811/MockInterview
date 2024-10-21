import { Lightbulb, Volume2 } from 'lucide-react';
import React from 'react';

const QuestionSection = ({ questions, activeQuestion, setActiveQuestion }) => {

    const textToSpeech = (text) => {
        if ('speechSynthesis' in window) {
            const speech = new SpeechSynthesisUtterance();
            speech.lang = "en-US";
            speech.text = text;
            speech.volume = 1;
            speech.rate = 1;
            speech.pitch = 1;
            window.speechSynthesis.speak(speech);
        }
        else {
            alert("Your browser does not support speech synthesis");
        }
    }

    return (
        <div className="p-4 border-2 border-gray-100 rounded-md">
            <div className="flex flex-wrap">
                {questions.map((item, index) => (
                    <div
                        key={index}
                        className={`flex items-center justify-center mr-5 mb-4 w-16 h-16 border rounded-full shadow-sm cursor-pointer transition-transform transform hover:scale-105 ${activeQuestion === index ? 'bg-primary text-white font-bold' : 'bg-gray-200 text-black'
                            }`}
                        onClick={() => setActiveQuestion(index)}
                    >
                        <p className="text-lg">{index + 1}</p>
                    </div>
                ))}
            </div>
            <h2 className='my-5'>
                {questions[activeQuestion]?.Question && <p className="text-lg font-bold">{questions[activeQuestion]?.Question}</p>}
            </h2>
            <Volume2 onClick={() => textToSpeech(questions[activeQuestion]?.Question)} />
            <div className='border rounded-lg p-5 bg-blue-100'>
                <h2 className='flex gap-2 text-primary'>
                    <Lightbulb />
                    <strong>Note:</strong>
                </h2>
                <p>
                    Click on each record to answer the questions. At the end, we will provide you with feedback, including the correct answers for each question.
                </p>
                <p>
                    This will allow you to compare your responses and improve your interviewing skills. Good luck!
                </p>
            </div>
        </div>
    );
};

export default QuestionSection;
