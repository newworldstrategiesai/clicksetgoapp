import React from 'react';
import Link from 'next/link';
import './Sidebar.css'; // Assuming Sidebar.css is the stylesheet

const Sidebar = () => {
  return (
    <div className="sidebar">
      <nav className="nav">
        <Link href="/call-logs" className="navLink">
          Call Logs
        </Link>
        <Link href="/sms-logs" className="navLink">
          SMS Logs
        </Link>
        <Link href="/dialer" className="navLink">
          Dialer
        </Link>
      </nav>
    </div>
  );
};

export default Sidebar;
