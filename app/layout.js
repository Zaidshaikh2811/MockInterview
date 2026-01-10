import localFont from "next/font/local";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import Header from "./dashboard/_components/Header";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata = {
  title: "AI Interview Pro",
  description:
    "AI Interview Pro leverages the Gemini API to generate interview questions and provide instant feedback, helping you ace your next job interview with confidence.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <ClerkProvider>

        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <Header />
          {children}
        </body>
      </ClerkProvider>
    </html>
  );
}
