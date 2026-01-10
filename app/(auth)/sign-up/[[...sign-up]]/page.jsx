import { SignUp } from '@clerk/nextjs'

export const metadata = {
    title: 'Sign Up - AI Interview Pro',
    description: 'Create your account on AI Interview Pro and start preparing for your interviews with AI-powered mock interviews and real-time feedback.',
};

export default function Page() {
    return <SignUp />
}