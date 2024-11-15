// components/HomeSidebar.tsx

'use client';

import { useState, useEffect } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Tooltip } from "@/components/ui/Tooltip";
import { Button } from "@/components/ui/Home/button";
import Link from "next/link";
import { supabase } from "@/utils/supabaseClient";
import { useCountry } from "@/context/CountryContext";

interface HomeProps {
  userId: string;
  fullName: string;
}

export function Home({ userId, fullName }: HomeProps) {
  const [showTrainingSubmenu, setShowTrainingSubmenu] = useState(false);
  const [showPerformanceSubmenu, setShowPerformanceSubmenu] = useState(false);
  const [showAIProfileSubmenu, setShowAIProfileSubmenu] = useState(false);
  // const [fullName, setFullName] = useState("User");

  const countryCodes: Record<string, { code: string; name: string }> = {
    US: { code: "+1", name: "United States" },
    IN: { code: "+91", name: "India" },
    FR: { code: "+33", name: "France" },
    UK: { code: "+44", name: "United Kingdom" },
    DE: { code: "+49", name: "Germany" },
    ES: { code: "+34", name: "Spain" },
    IT: { code: "+39", name: "Italy" },
    // Add more country mappings here
  };
  const { defaultCountry, setDefaultCountry } = useCountry();

  useEffect(() => {
    const fetchUserCountry = async () => {
      const { data, error } = await supabase
        .from('client_settings')
        .select('default_country_name')
        .eq('user_id', userId)
        .single();
      if (error && error.code === 'PGRST116') {
        // No row exists, so we insert a new one
        const defaultCountryName = defaultCountry.name;
        const defaultCountryCode = countryCodes[defaultCountryName].code;
        setDefaultCountry({ name: defaultCountryName, code: defaultCountryCode });
      } else if (!error) {
        const countryName = data?.default_country_name || defaultCountry.name;
        setDefaultCountry({ name: countryName, code: countryCodes[countryName].code });
      }
    };
    fetchUserCountry();
  }, [userId]);

  return (
    <div className="flex h-screen pt-16">
      <aside className="bg-black text-white flex flex-col items-center lg:items-start w-16 lg:w-64 lg:hover:w-64 space-y-4 py-6 transition-all duration-200 ease-in-out">
        <nav className="flex-1 flex flex-col items-center lg:items-start space-y-6">
          <Tooltip content="Home">
            <Link
              href="#"
              className="w-full flex justify-center lg:justify-start py-2 px-2 lg:px-4"
            >
              <HomeIcon className="w-6 h-6" />
              <span className="hidden lg:inline ml-4">Home</span>
            </Link>
          </Tooltip>

          {/* Include all other menu items as per your original code */}
          {/* Conversations */}
          <Tooltip content="Conversations">
            <Link
              href="/dialer"
              className="w-full flex justify-center lg:justify-start py-2 px-2 lg:px-4"
            >
              <MessageCircleIcon className="w-6 h-6" />
              <span className="hidden lg:inline ml-4">Conversations</span>
            </Link>
          </Tooltip>

          {/* Performance */}
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
              {/* Topics */}
              <Tooltip content="Topics">
                <Link
                  href="#"
                  className="flex items-center space-x-2 text-gray-400 hover:text-white px-2 lg:px-4"
                >
                  <DatabaseIcon className="w-4 h-4" />
                  <span className="hidden lg:inline">Topics</span>
                </Link>
              </Tooltip>
              {/* Reports */}
              <Tooltip content="Reports">
                <Link
                  href="#"
                  className="flex items-center space-x-2 text-gray-400 hover:text-white px-2 lg:px-4"
                >
                  <BookIcon className="w-4 h-4" />
                  <span className="hidden lg:inline">Reports</span>
                </Link>
              </Tooltip>
              {/* CSAT Setup */}
              <Tooltip content="CSAT Setup">
                <Link
                  href="#"
                  className="flex items-center space-x-2 text-gray-400 hover:text-white px-2 lg:px-4"
                >
                  <RepeatIcon className="w-4 h-4" />
                  <span className="hidden lg:inline">CSAT Setup</span>
                </Link>
              </Tooltip>
            </div>
          )}

          {/* Continue with other menu items as in your original code */}
          {/* Training */}
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
              {/* Guidance */}
              <Tooltip content="Guidance">
                <Link
                  href="/guidance"
                  className="flex items-center space-x-2 text-gray-400 hover:text-white px-2 lg:px-4"
                >
                  <BookIcon className="w-4 h-4" />
                  <span className="hidden lg:inline">Guidance</span>
                </Link>
              </Tooltip>
              {/* Knowledge */}
              <Tooltip content="Knowledge">
                <Link
                  href="/knowledge"
                  className="flex items-center space-x-2 text-gray-400 hover:text-white px-2 lg:px-4"
                >
                  <DatabaseIcon className="w-4 h-4" />
                  <span className="hidden lg:inline">Knowledge</span>
                </Link>
              </Tooltip>
              {/* Processes */}
              <Tooltip content="Processes">
                <Link
                  href="#"
                  className="flex items-center space-x-2 text-gray-400 hover:text-white px-2 lg:px-4"
                >
                  <RepeatIcon className="w-4 h-4" />
                  <span className="hidden lg:inline">Processes</span>
                </Link>
              </Tooltip>
            </div>
          )}

          {/* Agents */}
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
              {/* Persona */}
              <Tooltip content="Persona">
                <Link
                  href="/customization/persona"
                  className="flex items-center space-x-2 text-gray-400 hover:text-white px-2 lg:px-4"
                >
                  <UserIcon className="w-4 h-4" />
                  <span className="hidden lg:inline">Persona</span>
                </Link>
              </Tooltip>
              {/* Greeting */}
              <Tooltip content="Greeting">
                <Link
                  href="customization/greeting"
                  className="flex items-center space-x-2 text-gray-400 hover:text-white px-2 lg:px-4"
                >
                  <BookOpenIcon className="w-4 h-4" />
                  <span className="hidden lg:inline">Greeting</span>
                </Link>
              </Tooltip>
              {/* Handoffs */}
              <Tooltip content="Handoffs">
                <Link
                  href="customization/handoffs"
                  className="flex items-center space-x-2 text-gray-400 hover:text-white px-2 lg:px-4"
                >
                  <RepeatIcon className="w-4 h-4" />
                  <span className="hidden lg:inline">Handoffs</span>
                </Link>
              </Tooltip>
              {/* Languages */}
              <Tooltip content="Languages">
                <Link
                  href="customization/languages"
                  className="flex items-center space-x-2 text-gray-400 hover:text-white px-2 lg:px-4"
                >
                  <DatabaseIcon className="w-4 h-4" />
                  <span className="hidden lg:inline">Languages</span>
                </Link>
              </Tooltip>
              {/* Variables */}
              <Tooltip content="Variables">
                <Link
                  href="#"
                  className="flex items-center space-x-2 text-gray-400 hover:text-white px-2 lg:px-4"
                >
                  <LayersIcon className="w-4 h-4" />
                  <span className="hidden lg:inline">Variables</span>
                </Link>
              </Tooltip>
            </div>
          )}

          {/* Channels */}
          <Tooltip content="Channels">
            <Link
              href="#"
              className="w-full flex justify-center lg:justify-start py-2 px-2 lg:px-4"
            >
              <LayersIcon className="w-6 h-6" />
              <span className="hidden lg:inline ml-4">Channels</span>
            </Link>
          </Tooltip>

          {/* Platform */}
          <Tooltip content="Platform">
            <Link
              href="#"
              className="w-full flex justify-center lg:justify-start py-2 px-2 lg:px-4"
            >
              <LayoutGridIcon className="w-6 h-6" />
              <span className="hidden lg:inline ml-4">Platform</span>
            </Link>
          </Tooltip>
        </nav>
        <div className="px-4 py-6 space-y-4 w-full">
          <Button variant="default" className="w-full bg-purple-600">
            Sub
          </Button>
          <div className="text-xs text-gray-400 hidden lg:block">
            Trial ends: September 4, 2024
          </div>
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
    </div>
  );
}

// SVG Icon Components

function HomeIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 9L12 2L21 9V20A2 2 0 0 1 19 22H5A2 2 0 0 1 3 20V9Z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

function MessageCircleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 11.5A8.38 8.38 0 0 0 12.5 3 8.38 8.38 0 0 0 4 11.5C4 15.75 7.5 19.44 12 21V13.5H8.5V11.5H12V8.5H14V11.5H17.5V13.5H14V21C18.5 19.44 22 15.75 22 11.5Z" />
    </svg>
  );
}

function BarChartIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="12" y1="20" x2="12" y2="10" />
      <line x1="18" y1="20" x2="18" y2="4" />
      <line x1="6" y1="20" x2="6" y2="16" />
    </svg>
  );
}

function BookIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 19.5V4.5A2.5 2.5 0 0 1 6.5 2H20V22H6.5A2.5 2.5 0 0 1 4 19.5Z" />
      <line x1="4" y1="9" x2="20" y2="9" />
    </svg>
  );
}

function RepeatIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="17 1 21 5 17 9" />
      <path d="M3 11V9a4 4 0 0 1 4-4h14" />
      <polyline points="7 23 3 19 7 15" />
      <path d="M21 13v2a4 4 0 0 1-4 4H3" />
    </svg>
  );
}

function BookOpenIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2 3H12A2 2 0 0 1 14 5V19A2 2 0 0 0 12 21H2Z" />
      <path d="M22 3H12A2 2 0 0 0 10 5V19A2 2 0 0 1 12 21H22Z" />
    </svg>
  );
}

function UserIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="7" r="4" />
      <path d="M6 21V19A6 6 0 0 1 12 13H12A6 6 0 0 1 18 19V21" />
    </svg>
  );
}

function DatabaseIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <ellipse cx="12" cy="5" rx="9" ry="3" />
      <path d="M3 5V19C3 20.1046 7.02944 21 12 21C16.9706 21 21 20.1046 21 19V5" />
      <line x1="3" y1="12" x2="21" y2="12" />
    </svg>
  );
}

function LayersIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="12 2 2 7 12 12 22 7 12 2" />
      <polyline points="2 17 12 22 22 17" />
      <polyline points="2 12 12 17 22 12" />
    </svg>
  );
}

function LayoutGridIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="3" width="7" height="7" rx="1" ry="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" ry="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" ry="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" ry="1" />
    </svg>
  );
}
