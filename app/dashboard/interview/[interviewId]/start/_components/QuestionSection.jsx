import { Lightbulb, Volume2 } from "lucide-react";

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
        } else {
            alert("Your browser does not support speech synthesis");
        }
    };

    return (
        <div className="p-6 border-2 border-gray-200 rounded-lg bg-white shadow-sm">
            {/* Question Numbers Grid */}
            <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Questions</h3>
                <div className="grid grid-cols-5 gap-3">
                    {questions.map((item, index) => (
                        <div
                            key={index}
                            className={`
                                flex items-center justify-center 
                                w-12 h-12 
                                border-2 rounded-full 
                                cursor-pointer 
                                transition-all duration-200 
                                transform hover:scale-110 hover:shadow-md
                                ${activeQuestion === index
                                    ? 'bg-blue-500 border-blue-500 text-white font-bold shadow-lg'
                                    : 'bg-gray-50 border-gray-300 text-gray-700 hover:bg-gray-100 hover:border-gray-400'
                                }
                            `}
                            onClick={() => setActiveQuestion(index)}
                        >
                            <span className="text-sm font-medium">{index + 1}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Current Question Display */}
            <div className="mb-6">
                <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-semibold text-gray-800">
                        Question {activeQuestion + 1} of {questions.length}
                    </h3>
                    {questions[activeQuestion]?.Question && (
                        <button
                            onClick={() => textToSpeech(questions[activeQuestion]?.Question)}
                            className="flex items-center justify-center w-10 h-10 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-full transition-colors duration-200 cursor-pointer"
                            title="Listen to question"
                        >
                            <Volume2 size={18} />
                        </button>
                    )}
                </div>

                {questions[activeQuestion]?.Question && (
                    <div className="p-4 bg-gray-50 rounded-lg border-l-4 border-blue-500">
                        <p className="text-lg text-gray-800 leading-relaxed">
                            {questions[activeQuestion]?.Question}
                        </p>
                    </div>
                )}
            </div>

            {/* Instructions Note */}
            <div className="border border-blue-200 rounded-lg p-5 bg-gradient-to-r from-blue-50 to-indigo-50">
                <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">
                        <Lightbulb className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                        <h4 className="font-semibold text-blue-800 mb-2">Instructions</h4>
                        <div className="space-y-2 text-sm text-blue-700">
                            <p>
                                Click on each question number above to navigate between questions.
                                Use the record button to answer each question with your voice.
                            </p>
                            <p>
                                At the end of the interview, you'll receive detailed feedback
                                including correct answers to help improve your interviewing skills.
                            </p>
                            <p className="font-medium">
                                Good luck with your mock interview! 🎯
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default QuestionSection;