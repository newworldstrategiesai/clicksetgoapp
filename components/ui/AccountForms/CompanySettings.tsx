// components/ui/AccountForms/CompanySettings.tsx

'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabaseClient';
import { v4 as uuidv4 } from 'uuid';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faTrash, faEdit } from '@fortawesome/free-solid-svg-icons';
import { toast, ToastContainer } from 'react-toastify';
import Card from '@/components/ui/Card/Card'; // Adjust the path as necessary
import 'react-toastify/dist/ReactToastify.css';
import { CompanyLink, CompanyInfo } from '@/utils/supabase/types'; // Import the types

interface CompanySettingsProps {
  userId: string;
}

const CompanySettings: React.FC<CompanySettingsProps> = ({ userId }) => {
  console.log('CompanySettings userId:', userId); // Debugging

  if (!userId) {
    return (
      <div className="text-red-500">
        User ID is missing. Please log in again.
      </div>
    );
  }

  const [companyInfo, setCompanyInfo] = useState<CompanyInfo | null>(null);
  const [links, setLinks] = useState<CompanyLink[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [newLink, setNewLink] = useState<{ title: string; url: string }>({
    title: '',
    url: '',
  });
  const [editingLinkId, setEditingLinkId] = useState<string | null>(null);
  const [editedLink, setEditedLink] = useState<{ title: string; url: string }>({
    title: '',
    url: '',
  });

  // Fetch Company Information and Links
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);

      try {
        // Fetch company information from 'companies' table
        const { data: companyData, error: companyError } = await supabase
          .from('companies')
          .select('id, name, description, address, website, phone, owner_id, created_at, updated_at')
          .eq('owner_id', userId)
          .single(); // Ensure only one row is returned

        if (companyError) {
          if (companyError.code === 'PGRST116') {
            // No row exists, possibly insert a default row or handle accordingly
            console.error('No company information found for the user.');
            toast.error('No company information found. Please set it up.');
          } else {
            console.error('Error fetching company data:', companyError.message);
            toast.error('Failed to fetch company information.');
          }
        } else if (companyData) {
          setCompanyInfo(companyData as CompanyInfo);
        }

        // Fetch company links
        const { data: linksData, error: linksError } = await supabase
          .from('company_links')
          .select('id, title, url')
          .eq('user_id', userId);

        if (linksError) {
          if (linksError.code === 'PGRST22') {
            // Column does not exist
            console.error(
              'Error fetching company links: "column company_links.user_id does not exist"'
            );
            toast.error(
              'Failed to fetch company links: Missing "user_id" column in the database.'
            );
          } else {
            console.error('Error fetching company links:', linksError.message);
            toast.error('Failed to fetch company links.');
          }
        } else if (linksData) {
          console.log('Fetched company links:', linksData);
          console.log('Type of linksData:', typeof linksData);
          console.log('Is linksData an array:', Array.isArray(linksData));
          setLinks(linksData as CompanyLink[]);
        }
      } catch (err) {
        console.error('Unexpected error fetching data:', err);
        toast.error('An unexpected error occurred while fetching data.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  // Handle Company Info Change
  const handleCompanyInfoChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    if (!companyInfo) return;

    const { name, value } = e.target;
    setCompanyInfo((prev) => ({
      ...prev!,
      [name]: value,
    }));
  };

  // Handle Company Info Submit
  const handleCompanyInfoSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const updateData: Partial<CompanyInfo> = {
        name: companyInfo?.name,
        description: companyInfo?.description,
        address: companyInfo?.address,
        website: companyInfo?.website,
        phone: companyInfo?.phone,
      };

      const { error } = await supabase
        .from('companies')
        .update(updateData)
        .eq('owner_id', userId)
        .single(); // Ensure only one row is updated

      if (error) {
        console.error('Error updating company info:', error.message);
        toast.error('Failed to update company information.');
      } else {
        toast.success('Company information updated successfully.');
      }
    } catch (err) {
      console.error('Unexpected error updating company info:', err);
      toast.error('An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Link Change (for existing links)
  const handleLinkChange = (
    id: string,
    field: 'title' | 'url',
    value: string
  ) => {
    const updatedLinks = links.map((link) =>
      link.id === id ? { ...link, [field]: value } : link
    );
    setLinks(updatedLinks);
  };

  // Handle Add New Link
  const handleAddLink = async () => {
    if (!newLink.title || !newLink.url) {
      toast.error('Please provide both title and URL for the link.');
      return;
    }

    // Validate URL
    try {
      new URL(newLink.url);
    } catch (_) {
      toast.error('Please enter a valid URL.');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('company_links')
        .insert([
          {
            id: uuidv4(),
            user_id: userId, // Ensure this matches your Supabase schema
            title: newLink.title,
            url: newLink.url,
          },
        ])
        .select('*'); // Ensures the inserted row is returned

      if (error) {
        console.error('Error adding new link:', error.message);
        toast.error('Failed to add new link.');
      } else if (data && data.length > 0) {
        setLinks([...links, data[0]]);
        setNewLink({ title: '', url: '' });
        toast.success('Link added successfully.');
      }
    } catch (err) {
      console.error('Unexpected error adding new link:', err);
      toast.error('An unexpected error occurred.');
    }
  };

  // Handle Delete Link
  const handleDeleteLink = async (id: string) => {
    try {
      const { error } = await supabase
        .from('company_links')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting link:', error.message);
        toast.error('Failed to delete link.');
      } else {
        setLinks(links.filter((link) => link.id !== id));
        toast.success('Link deleted successfully.');
      }
    } catch (err) {
      console.error('Unexpected error deleting link:', err);
      toast.error('An unexpected error occurred.');
    }
  };

  // Handle Edit Link
  const handleEditLink = (link: CompanyLink) => {
    setEditingLinkId(link.id);
    setEditedLink({ title: link.title, url: link.url });
  };

  // Handle Update Link
  const handleUpdateLink = async (id: string) => {
    if (!editedLink.title || !editedLink.url) {
      toast.error('Please provide both title and URL for the link.');
      return;
    }

    // Validate URL
    try {
      new URL(editedLink.url);
    } catch (_) {
      toast.error('Please enter a valid URL.');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('company_links')
        .update({ title: editedLink.title, url: editedLink.url })
        .eq('id', id)
        .select('*'); // Ensures the updated row is returned

      if (error) {
        console.error('Error updating link:', error.message);
        toast.error('Failed to update link.');
      } else if (data && data.length > 0) {
        setLinks(
          links.map((link) =>
            link.id === id
              ? { ...link, title: editedLink.title, url: editedLink.url }
              : link
          )
        );
        setEditingLinkId(null);
        setEditedLink({ title: '', url: '' });
        toast.success('Link updated successfully.');
      }
    } catch (err) {
      console.error('Unexpected error updating link:', err);
      toast.error('An unexpected error occurred.');
    }
  };

  if (isLoading) {
    return (
      <div className="text-center mt-10 dark:text-white">
        Loading Company Settings...
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6 dark:bg-black dark:text-white">
      <ToastContainer />

      {/* Company Information Form */}
      <Card
        title="Company Information"
        description="Edit your company's details below."
      >
        {companyInfo ? (
          <form onSubmit={handleCompanyInfoSubmit} className="space-y-4">
            {/* Company Name */}
            <div>
              <label htmlFor="name" className="block text-gray-400">
                Company Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={companyInfo.name}
                onChange={handleCompanyInfoChange}
                required
                className="mt-1 block w-full p-2 dark:bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                placeholder="Your Company Name"
              />
            </div>

            {/* Company Description */}
            <div>
              <label htmlFor="description" className="block text-gray-400">
                Company Description
              </label>
              <textarea
                id="description"
                name="description"
                value={companyInfo.description}
                onChange={handleCompanyInfoChange}
                required
                className="mt-1 block w-full p-2 dark:bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                placeholder="A brief description of your company."
                rows={4}
              />
            </div>

            {/* Company Address */}
            <div>
              <label htmlFor="address" className="block text-gray-400">
                Company Address
              </label>
              <input
                type="text"
                id="address"
                name="address"
                value={companyInfo.address}
                onChange={handleCompanyInfoChange}
                required
                className="mt-1 block w-full p-2 dark:bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                placeholder="1234 Business St, City, Country"
              />
            </div>

            {/* Company Website */}
            <div>
              <label htmlFor="website" className="block text-gray-400">
                Company Website
              </label>
              <input
                type="url"
                id="website"
                name="website"
                value={companyInfo.website}
                onChange={handleCompanyInfoChange}
                required
                className="mt-1 block w-full p-2 dark:bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                placeholder="https://yourcompany.com"
              />
            </div>

            {/* Company Phone Number */}
            {companyInfo.phone !== undefined && (
              <div>
                <label htmlFor="phone" className="block text-gray-400">
                  Company Phone Number
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={companyInfo.phone || ''}
                  onChange={handleCompanyInfoChange}
                  required
                  className="mt-1 block w-full p-2 dark:bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                  placeholder="+1 123-456-7890"
                />
              </div>
            )}

            {/* Submit Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-md dark:text-white transition-colors duration-200"
                disabled={isLoading}
              >
                {isLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        ) : (
          <p className="text-gray-400">No company information available.</p>
        )}
      </Card>

      {/* Important Links Manager */}
      <Card
        title="Important Links"
        description="Add, edit, or remove important links related to your company."
      >
        {/* Existing Links */}
        {links.length > 0 ? (
          links.map((link) => (
            <div
              key={link.id}
              className="bg-gray-800 shadow rounded-lg p-4 mb-4"
            >
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-medium">{link.title}</h3>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEditLink(link)}
                    className="text-yellow-500 hover:text-yellow-400"
                    title="Edit Link"
                  >
                    <FontAwesomeIcon icon={faEdit} />
                  </button>
                  <button
                    onClick={() => handleDeleteLink(link.id)}
                    className="text-red-500 hover:text-red-400"
                    title="Delete Link"
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                {/* Link Title */}
                <div>
                  <label htmlFor={`title-${link.id}`} className="block text-gray-400">
                    Title
                  </label>
                  <input
                    type="text"
                    id={`title-${link.id}`}
                    name="title"
                    value={
                      editingLinkId === link.id ? editedLink.title : link.title
                    }
                    onChange={(e) =>
                      editingLinkId === link.id
                        ? setEditedLink({ ...editedLink, title: e.target.value })
                        : handleLinkChange(link.id, 'title', e.target.value)
                    }
                    className="mt-1 block w-full p-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                    placeholder="e.g., Facebook"
                  />
                </div>

                {/* Link URL */}
                <div>
                  <label htmlFor={`url-${link.id}`} className="block text-gray-400">
                    URL
                  </label>
                  <input
                    type="url"
                    id={`url-${link.id}`}
                    name="url"
                    value={
                      editingLinkId === link.id ? editedLink.url : link.url
                    }
                    onChange={(e) =>
                      editingLinkId === link.id
                        ? setEditedLink({ ...editedLink, url: e.target.value })
                        : handleLinkChange(link.id, 'url', e.target.value)
                    }
                    className="mt-1 block w-full p-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                    placeholder="https://facebook.com/yourcompany"
                  />
                </div>

                {/* Save Button (Only visible when editing) */}
                {editingLinkId === link.id && (
                  <div className="flex justify-end">
                    <button
                      onClick={() => handleUpdateLink(link.id)}
                      className="px-4 py-2 bg-green-600 hover:bg-green-500 rounded-md dark:text-white transition-colors duration-200"
                    >
                      Save
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-400 mb-4">No important links added yet.</p>
        )}

        {/* Add New Link */}
        <div className="bg-gray-800 shadow rounded-lg p-4">
          <h3 className="text-lg font-medium mb-2">Add New Link</h3>
          <div className="space-y-2">
            {/* Link Title */}
            <div>
              <label htmlFor="newLinkTitle" className="block text-gray-400">
                Title
              </label>
              <input
                type="text"
                id="newLinkTitle"
                name="newLinkTitle"
                value={newLink.title}
                onChange={(e) =>
                  setNewLink({ ...newLink, title: e.target.value })
                }
                className="mt-1 block w-full p-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                placeholder="e.g., Instagram"
              />
            </div>

            {/* Link URL */}
            <div>
              <label htmlFor="newLinkURL" className="block text-gray-400">
                URL
              </label>
              <input
                type="url"
                id="newLinkURL"
                name="newLinkURL"
                value={newLink.url}
                onChange={(e) =>
                  setNewLink({ ...newLink, url: e.target.value })
                }
                className="mt-1 block w-full p-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                placeholder="https://instagram.com/yourcompany"
              />
            </div>

            {/* Add Button */}
            <div className="flex justify-end">
              <button
                onClick={handleAddLink}
                type="button"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-md dark:text-white transition-colors duration-200 flex items-center space-x-2"
              >
                <FontAwesomeIcon icon={faPlus} />
                <span>Add Link</span>
              </button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default CompanySettings;
