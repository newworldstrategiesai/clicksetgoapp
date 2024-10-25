// components/BottomNav.tsx
"use client";

import React from "react";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUpload,      // Import faUpload
  faClock,
  faUser,
  faTh,
  faVoicemail,
} from "@fortawesome/free-solid-svg-icons"; // Import icons

const BottomNav: React.FC = () => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-black text-white shadow-md z-10">
      <div className="flex justify-around items-center max-w-lg mx-auto py-3 px-4">
        {/* Replaced "Favorites" with "Upload" */}
        <Link href="/upload-contacts" className="flex flex-col items-center space-y-1">
          <FontAwesomeIcon icon={faUpload} className="text-xl" />
          <span className="text-xs">Upload</span>
        </Link>

        <Link href="/lists" className="flex flex-col items-center space-y-1">
          <FontAwesomeIcon icon={faClock} className="text-xl" />
          <span className="text-xs">Lists</span>
        </Link>

        <Link href="/contacts" className="flex flex-col items-center space-y-1">
          <FontAwesomeIcon icon={faUser} className="text-xl" />
          <span className="text-xs">Contacts</span>
        </Link>

        <Link href="/dialer" className="flex flex-col items-center space-y-1">
          <FontAwesomeIcon icon={faTh} className="text-xl" />
          <span className="text-xs">Keypad</span>
        </Link>

        <Link href="/call-logs" className="flex flex-col items-center space-y-1">
          <FontAwesomeIcon icon={faVoicemail} className="text-xl" />
          <span className="text-xs">Calls</span>
        </Link>
      </div>
    </nav>
  );
};

export default BottomNav;
