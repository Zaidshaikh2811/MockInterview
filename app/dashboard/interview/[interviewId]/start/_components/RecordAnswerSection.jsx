
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import React, { useEffect, useState } from 'react'
import Webcam from 'react-webcam'
import useSpeechToText from 'react-hook-speech-to-text';
import { Mic } from 'lucide-react';

const RecordAnswerSection = () => {
    const [answers, setAnswers] = useState([]);

    const {
        error,
        interimResult,
        isRecording,
        results,
        startSpeechToText,
        stopSpeechToText,
    } = useSpeechToText({
        continuous: true,
        useLegacyResults: false
    });

    if (error) return <p>Web Speech API is not available in this browser 🤷‍</p>;

    useEffect(() => {
        results.map((result) => {
            setAnswers((prevAnswers) => [...prevAnswers, result.transcript]);
        })

    }, [results])
    console.log(answers)
    return (
        <div className='flex items-center justify-center flex-col'>

            <div className='mt-20 flex flex-col justify-center items-center bg-secondary rounded-lg p-5'>
                <Image src={"/OIP.jpg"}
                    alt="AI Mock Interview Logo"
                    width={200}
                    height={200}
                    className='absolute'
                />
                {/* <Webcam
                    mirrored={true}
                    style={{ zIndex: 10, width: '100%', height: '300px' }} /> */}

            </div>
            <Button variant='outline' className='mt-5' onClick={isRecording ? stopSpeechToText : startSpeechToText}>
                <Mic />
            </Button>
            <h1>Recording: {isRecording.toString()}</h1>
            <button onClick={isRecording ? stopSpeechToText : startSpeechToText}>
                {isRecording ? 'Stop Recording' : 'Start Recording'}
            </button>
            <ul>
                {results.map((result) => (
                    <li key={result.timestamp}>{result.transcript}</li>
                ))}
                {interimResult && <li>{interimResult}</li>}
            </ul>
        </div >
    )
}

export default RecordAnswerSection
