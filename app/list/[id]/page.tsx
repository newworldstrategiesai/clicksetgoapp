"use client";

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface Contact {
  id: string;
  first_name: string;
  email_address: string;
  phone: string; // Add this line
}

interface List {
  id: string;
  name: string;
  contacts: Contact[];
}

const ListPage = ({ params }: { params: { id: string } }) => {
  const [list, setList] = useState<List | null>(null);
  const [navbarHeight, setNavbarHeight] = useState<number>(0);
  const router = useRouter();

  useEffect(() => {
    const fetchList = async () => {
      try {
        const response = await fetch(`/api/lists/${params.id}`);
        const data = await response.json();
        setList(data);
      } catch (error) {
        console.error('Error fetching list:', error);
      }
    };

    fetchList();
  }, [params.id]);

  useEffect(() => {
    const handleResize = () => {
      const navbar = document.querySelector('nav'); // Adjust selector if needed
      if (navbar) {
        setNavbarHeight(navbar.clientHeight);
      }
    };

    handleResize(); // Set initial height
    window.addEventListener('resize', handleResize); // Update on resize

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const handleBackClick = () => {
    router.push('/lists');
  };

  if (!list) {
    return <div>Loading...</div>;
  }

  return (
    <div className={`min-h-screen bg-black text-white flex flex-col items-center px-4 md:px-0`} style={{ paddingTop: `${navbarHeight}px` }}>
      <h1 className="text-2xl font-bold mb-4">{list.name}</h1>
      <table className="min-w-full divide-y divide-gray-700">
        <thead>
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Name</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Phone Number</th>
          </tr>
        </thead>
        <tbody className="bg-gray-800 divide-y divide-gray-700">
          {list.contacts && list.contacts.length > 0 ? (
            list.contacts.map((contact) => (
              <tr key={contact.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{contact.first_name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">{contact.phone}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={2} className="px-6 py-4 text-center text-sm text-gray-400">No contacts found</td>
            </tr>
          )}
        </tbody>
      </table>
      <button
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg"
        onClick={handleBackClick}
      >
        Back to Lists
      </button>
    </div>
  );
};

export default ListPage;
