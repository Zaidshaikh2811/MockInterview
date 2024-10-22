
import { Button } from "../components/ui/button";
import Image from "next/image";
import Link from "next/link";

export default function Home() {

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero Section */}
      <section className="grid grid-cols-1 md:grid-cols-2 items-center justify-center text-center py-24 bg-gradient-to-b from-primary to-blue-600 text-white">
        <div className="max-w-3xl px-4">
          <h1 className="text-5xl md:text-6xl font-extrabold mb-6 leading-tight">
            Boost Your Interview Skills with AI Insights
          </h1>
          <p className="text-lg md:text-xl mb-10 font-light">
            Leverage cutting-edge AI to get real-time feedback and ace your interviews.
          </p>
          <Link href={"/dashboard"}>
            <Button className="bg-white text-primary px-8 py-4 rounded-full shadow-lg font-semibold hover:bg-gray-100 transition-all duration-200">
              Get Started
            </Button>
          </Link>
        </div>
        <div className="mt-12">
          <Image
            src="/undraw_interview_re_e5jn.svg"
            alt="AI Interview"
            width={600}
            height={400}
            className="rounded-2xl shadow-md"
          />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-10">
          <div className="text-center p-6 rounded-lg shadow-sm hover:shadow-lg transition-shadow duration-200">
            <h3 className="text-xl font-semibold mb-4 text-primary">Real-Time Feedback</h3>
            <p className="text-gray-600 text-sm">
              Receive immediate AI-driven feedback to fine-tune your answers and boost confidence.
            </p>
          </div>
          <div className="text-center p-6 rounded-lg shadow-sm hover:shadow-lg transition-shadow duration-200">
            <h3 className="text-xl font-semibold mb-4 text-primary">Tailored Mock Interviews</h3>
            <p className="text-gray-600 text-sm">
              Practice with AI-curated questions specific to your industry and position.
            </p>
          </div>
          <div className="text-center p-6 rounded-lg shadow-sm hover:shadow-lg transition-shadow duration-200">
            <h3 className="text-xl font-semibold mb-4 text-primary">Analytics & Insights</h3>
            <p className="text-gray-600 text-sm">
              Track your progress, monitor improvements, and identify key areas to focus on.
            </p>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-24 bg-gradient-to-r from-primary to-blue-500 text-white text-center">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Elevate Your Interview Game?
          </h2>
          <p className="text-lg font-light mb-10">
            Sign up now and get access to AI-driven interview simulations and feedback!
          </p>
          <Link href={"/dashboard"}>
            <Button className="bg-white text-primary px-8 py-4 rounded-full shadow-lg font-semibold hover:bg-gray-100 transition-all duration-200">
              Join Today
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 text-center text-gray-600 bg-gray-100">
        <p>© 2024 AI Interview. All rights reserved.</p>
      </footer>
    </div>
  );
}
