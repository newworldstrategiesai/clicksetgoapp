'use client';

import { useState, useEffect } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Tooltip } from "@/components/ui/Tooltip";
import { Button } from "@/components/ui/Home/button";
import Link from "next/link";

interface HomeProps {
  userId: string;
  fullName: string;
}

export function Home({userId }: HomeProps) {
  const [showTrainingSubmenu, setShowTrainingSubmenu] = useState(false);
  const [showPerformanceSubmenu, setShowPerformanceSubmenu] = useState(false);
  const [showAIProfileSubmenu, setShowAIProfileSubmenu] = useState(false);
  const [fullName, setFullName] = useState("User");

  

  return (
    <div className="flex h-screen">
  <aside className="bg-gray-900 text-white flex flex-col items-center lg:items-start w-16 lg:w-64 lg:hover:w-64 space-y-4 py-6 transition-all duration-200 ease-in-out">
    <nav className="flex-1 flex flex-col items-center lg:items-start space-y-6">
      <Tooltip content="Home">
        <Link href="#" className="w-full flex justify-center lg:justify-start py-2 px-2 lg:px-4">
          <HomeIcon className="w-6 h-6" />
          <span className="hidden lg:inline ml-4">Home</span>
        </Link>
      </Tooltip>
      <Tooltip content="Conversations">
        <Link href="/dialer" className="w-full flex justify-center lg:justify-start py-2 px-2 lg:px-4">
          <MessageCircleIcon className="w-6 h-6" />
          <span className="hidden lg:inline ml-4">Conversations</span>
        </Link>
      </Tooltip>
      <Tooltip content="Performance">
        <button
          className="w-full flex justify-center lg:justify-start py-2 px-2 lg:px-4"
          onClick={() => setShowPerformanceSubmenu(!showPerformanceSubmenu)}
        >
          <BarChartIcon className="w-6 h-6" />
          <span className="hidden lg:inline ml-4">Performance</span>
        </button>
      </Tooltip>
      {showPerformanceSubmenu && (
        <div className="space-y-2 ml-0 lg:ml-4 w-full">
          <Tooltip content="Topics">
            <Link href="#" className="flex items-center space-x-2 text-gray-400 hover:text-white px-2 lg:px-4">
              <DatabaseIcon className="w-4 h-4" />
              <span className="hidden lg:inline">Topics</span>
            </Link>
          </Tooltip>
          <Tooltip content="Reports">
            <Link href="#" className="flex items-center space-x-2 text-gray-400 hover:text-white px-2 lg:px-4">
              <BookIcon className="w-4 h-4" />
              <span className="hidden lg:inline">Reports</span>
            </Link>
          </Tooltip>
          <Tooltip content="CSAT Setup">
            <Link href="#" className="flex items-center space-x-2 text-gray-400 hover:text-white px-2 lg:px-4">
              <RepeatIcon className="w-4 h-4" />
              <span className="hidden lg:inline">CSAT Setup</span>
            </Link>
          </Tooltip>
        </div>
      )}
      <Tooltip content="Training">
        <button
          className="w-full flex justify-center lg:justify-start py-2 px-2 lg:px-4"
          onClick={() => setShowTrainingSubmenu(!showTrainingSubmenu)}
        >
          <BookOpenIcon className="w-6 h-6" />
          <span className="hidden lg:inline ml-4">Training</span>
        </button>
      </Tooltip>
      {showTrainingSubmenu && (
        <div className="space-y-2 ml-0 lg:ml-4 w-full">
          <Tooltip content="Guidance">
            <Link href="/guidance" className="flex items-center space-x-2 text-gray-400 hover:text-white px-2 lg:px-4">
              <BookIcon className="w-4 h-4" />
              <span className="hidden lg:inline">Guidance</span>
            </Link>
          </Tooltip>
          <Tooltip content="Knowledge">
            <Link href="/knowledge" className="flex items-center space-x-2 text-gray-400 hover:text-white px-2 lg:px-4">
              <DatabaseIcon className="w-4 h-4" />
              <span className="hidden lg:inline">Knowledge</span>
            </Link>
          </Tooltip>
          <Tooltip content="Processes">
            <Link href="#" className="flex items-center space-x-2 text-gray-400 hover:text-white px-2 lg:px-4">
              <RepeatIcon className="w-4 h-4" />
              <span className="hidden lg:inline">Processes</span>
            </Link>
          </Tooltip>
        </div>
      )}
      <Tooltip content="Agents">
        <button
          className="w-full flex justify-center lg:justify-start py-2 px-2 lg:px-4"
          onClick={() => setShowAIProfileSubmenu(!showAIProfileSubmenu)}
        >
          <UserIcon className="w-6 h-6" />
          <span className="hidden lg:inline ml-4">AI Agent profile</span>
        </button>
      </Tooltip>
      {showAIProfileSubmenu && (
        <div className="space-y-2 ml-0 lg:ml-4 w-full">
          <Tooltip content="Persona">
            <Link href="/customization/persona" className="flex items-center space-x-2 text-gray-400 hover:text-white px-2 lg:px-4">
              <UserIcon className="w-4 h-4" />
              <span className="hidden lg:inline">Persona</span>
            </Link>
          </Tooltip>
          <Tooltip content="Greeting">
            <Link href="customization/greeting" className="flex items-center space-x-2 text-gray-400 hover:text-white px-2 lg:px-4">
              <BookOpenIcon className="w-4 h-4" />
              <span className="hidden lg:inline">Greeting</span>
            </Link>
          </Tooltip>
          <Tooltip content="Handoffs">
            <Link href="customization/handoffs" className="flex items-center space-x-2 text-gray-400 hover:text-white px-2 lg:px-4">
              <RepeatIcon className="w-4 h-4" />
              <span className="hidden lg:inline">Handoffs</span>
            </Link>
          </Tooltip>
          <Tooltip content="Languages">
            <Link href="customization/languages" className="flex items-center space-x-2 text-gray-400 hover:text-white px-2 lg:px-4">
              <DatabaseIcon className="w-4 h-4" />
              <span className="hidden lg:inline">Languages</span>
            </Link>
          </Tooltip>
          <Tooltip content="Variables">
            <Link href="#" className="flex items-center space-x-2 text-gray-400 hover:text-white px-2 lg:px-4">
              <LayersIcon className="w-4 h-4" />
              <span className="hidden lg:inline">Variables</span>
            </Link>
          </Tooltip>
        </div>
      )}
      <Tooltip content="Channels">
        <Link href="#" className="w-full flex justify-center lg:justify-start py-2 px-2 lg:px-4">
          <LayersIcon className="w-6 h-6" />
          <span className="hidden lg:inline ml-4">Channels</span>
        </Link>
      </Tooltip>
      <Tooltip content="Platform">
        <Link href="#" className="w-full flex justify-center lg:justify-start py-2 px-2 lg:px-4">
          <LayoutGridIcon className="w-6 h-6" />
          <span className="hidden lg:inline ml-4">Platform</span>
        </Link>
      </Tooltip>
    </nav>
    <div className="px-4 py-6 space-y-4 w-full">
      <Button variant="default" className="w-full bg-purple-600">
        Sub
      </Button>
      <div className="text-xs text-gray-400 hidden lg:block">Trial ends: September 4, 2024</div>
      <div className="flex items-center space-x-2 w-full">
        <Avatar>
          <AvatarImage src="/placeholder-user.jpg" alt={fullName} />
          <AvatarFallback>{fullName.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="hidden lg:block">
          <Link href="/account" className="text-sm font-medium hover:underline">
            {fullName}
          </Link>
        </div>
      </div>
    </div>
  </aside>
  <main className="flex-1 bg-gradient-to-br from-purple-50 to-purple-100 p-8">
        <header className="mb-8 pt-8">
          <h1 className="text-2xl font-bold text-gray-800">Welcome, {fullName}!</h1>
          <p className="text-gray-600">
            Start onboarding your AI Agent below, or{" "}
            <Link href="#" className="text-blue-500" prefetch={false}>
              take a quick tour
            </Link>{" "}
            to get oriented.
          </p>
        </header>
        <div className="flex flex-col lg:flex-row space-y-4 lg:space-y-0 lg:space-x-8">
          <div className="lg:w-1/2 bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Avatar>
                  <AvatarImage src="/placeholder-user.jpg" alt="Chloe" />
                  <AvatarFallback>C</AvatarFallback>
                </Avatar>
                <span className="text-lg font-semibold">Chloe</span>
              </div>
              <MoveHorizontalIcon className="w-5 h-5" />
            </div>
            <div className="space-y-4">
              <div className="flex items-start space-x-2">
                <div className="flex-shrink-0">
                  <Avatar>
                    <AvatarImage src="/placeholder-user.jpg" alt="Chloe" />
                    <AvatarFallback>C</AvatarFallback>
                  </Avatar>
                </div>
                <div className="bg-blue-500 text-white rounded-lg p-3">
                  <p>Hey there! I'm an automated assistant. I'm here to help you with any questions you have.</p>
                  <p>How can I assist you today?</p>
                </div>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center border-t border-gray-200 pt-4">
                <Input
                  type="text"
                  placeholder="Type your message..."
                  className="flex-1 mr-2 rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-black"
                />
                <Button className="bg-blue-500 text-white">Send</Button>
              </div>
            </div>
          </div>
          <div className="lg:w-1/2">
          <Tabs>
              <TabsList className="flex flex-wrap justify-center lg:justify-start">
                <TabsTrigger value="test" className="text-black">Test Chloe</TabsTrigger>
                <TabsTrigger value="train" className="text-black">Train Chloe</TabsTrigger>
              </TabsList>
              <TabsContent value="test">
                <div className="space-y-4">
                  <p className="text-gray-800">Test a few sample questions generated from your knowledge content.</p>
                  <div className="space-y-2">
                    <Button variant="ghost" className="w-full justify-start text-black">
                      What types of services does the company offer?
                    </Button>
                    <Button variant="ghost" className="w-full justify-start text-black">
                      Can you explain how the company integrates AI consulting into its business model?
                    </Button>
                    <Button variant="ghost" className="w-full justify-start text-black">
                      What specific events or settings might the company provide DJ services for?
                    </Button>
                    
                  </div>
                  <Button variant="outline" className="w-full text-black">
                    Get new questions
                  </Button>
                </div>
              </TabsContent>
              <TabsContent value="train">
                <div className="space-y-4">
                  {/* Add content for training Chloe here */}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
</div>

  );
}

// SVG Icon Components ...

function BarChartIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" x2="12" y1="20" y2="10" />
      <line x1="18" x2="18" y1="20" y2="4" />
      <line x1="6" x2="6" y1="20" y2="16" />
    </svg>
  );
}

function BookIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
    </svg>
  );
}

function BookOpenIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 1 1 3-3h7z" />
    </svg>
  );
}

function DatabaseIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <ellipse cx="12" cy="5" rx="9" ry="3" />
      <path d="M3 5V19A9 3 0 0 0 21 19V5" />
      <path d="M3 12A9 3 0 0 0 21 12" />
    </svg>
  );
}

function HomeIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

function LayersIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z" />
      <path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65" />
      <path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65" />
    </svg>
  );
}

function LayoutGridIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="7" height="7" x="3" y="3" rx="1" />
      <rect width="7" height="7" x="14" y="3" rx="1" />
      <rect width="7" height="7" x="14" y="14" rx="1" />
      <rect width="7" height="7" x="3" y="14" rx="1" />
    </svg>
  );
}

function MessageCircleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
    </svg>
  );
}

function MoveHorizontalIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="18 8 22 12 18 16" />
      <polyline points="6 8 2 12 6 16" />
      <line x1="2" x2="22" y1="12" y2="12" />
    </svg>
  );
}

function RepeatIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m17 2 4 4-4 4" />
      <path d="M3 11v-1a4 4 0 0 1 4-4h14" />
      <path d="m7 22-4-4 4-4" />
      <path d="M21 13v1a4 4 0 0 1-4 4H3" />
    </svg>
  );
}

function UserIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}




