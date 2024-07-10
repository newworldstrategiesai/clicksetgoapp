// components/Layout.js
import React from 'react';

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-gray-800 text-white p-4">
        <h1>Dashboard</h1>
      </header>
      <main className="flex-1 p-4 bg-gray-900 text-white">
        {children}
      </main>
      <footer className="bg-gray-800 text-white p-4">
        <p>&copy; 2024 Your Company</p>
      </footer>
    </div>
  );
};

export default Layout;
