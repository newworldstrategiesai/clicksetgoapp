'use client';

import { useState, useEffect } from 'react';
import CampModal from '@/components/CampModal'; // Import the CampModal component
import { createClient, PostgrestError } from '@supabase/supabase-js'; // Import Supabase client
import { Campaign } from '@/types'; // Import the Campaign type from the types file

interface CampaignTableProps {
  userId: string; // Receive userId as a prop
}

export default function CampaignTable({ userId }: CampaignTableProps) {
  const [campaignData, setCampaignData] = useState<Campaign[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Initialize Supabase client
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Fetch campaigns from Supabase
  const fetchCampaigns = async () => {
    setLoading(true);
    try {
      const { data, error }: { data: Campaign[] | null; error: PostgrestError | null } = await supabase
        .from('campaigns') // Specify the table name as a string
        .select('*')
        .eq('user_id', userId); // Filter by user_id

      if (error) {
        console.error('Error fetching campaigns:', error);
        setErrorMessage('Error fetching campaigns. Please try again later.');
      } else {
        setCampaignData(data || []); // Handle the case where data might be null
      }
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      setErrorMessage('An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  // useEffect to fetch campaigns on userId change
  useEffect(() => {
    fetchCampaigns();
  }, [userId]); // Fetch campaigns when userId changes

  // Function to handle click and redirect to the campaign page
  const handleClick = (campaignId: string) => {
    // Redirect to the campaign page using the campaign ID
    window.location.href = `/campaigns/${campaignId}`;
  };

  // // Open modal for campaign details
  // const openModal = (campaign: Campaign) => {
  //   setSelectedCampaign(campaign);
  //   setShowModal(true);
  // };

  // // Close modal
  // const closeModal = () => {
  //   setShowModal(false);
  //   setSelectedCampaign(null);
  // };

  return (
    <>
      {loading ? (
        <p className="text-center text-gray-600">Loading campaigns...</p>
      ) : errorMessage ? (
        <p className="text-red-500 text-center">{errorMessage}</p>
      ) : (
        <div className="overflow-x-auto rounded-lg shadow-md bg-white">
          <table className="min-w-full bg-white border border-gray-300 table-auto">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-4 py-3 text-gray-700 font-semibold text-sm border-b">Campaign Name</th>
                <th className="px-4 py-3 text-gray-700 font-semibold text-sm border-b">Description</th>
                <th className="px-4 py-3 text-gray-700 font-semibold text-sm border-b">Start Date</th>
                <th className="px-4 py-3 text-gray-700 font-semibold text-sm border-b">End Date</th>
                <th className="px-4 py-3 text-gray-700 font-semibold text-sm border-b">Status</th>
                <th className="px-4 py-3 text-gray-700 font-semibold text-sm border-b">Budget</th>
              </tr>
            </thead>
            <tbody>
              {campaignData.map((campaign) => (
                <tr
                  key={campaign.id}
                  className="hover:bg-gray-100 cursor-pointer transition duration-150"
                  onClick={() => handleClick(campaign.id)} // Use handleClick function to redirect
                >
                  <td className="px-4 py-3 border-b text-gray-800 truncate">{campaign.name || 'No name'}</td>
                  <td className="px-4 py-3 border-b text-gray-800 truncate max-w-xs sm:max-w-md">{campaign.description || 'No description'}</td>
                  <td className="px-4 py-3 border-b text-gray-800">{campaign.start_date ? new Date(campaign.start_date).toLocaleDateString() : 'N/A'}</td>
                  <td className="px-4 py-3 border-b text-gray-800">{campaign.end_date ? new Date(campaign.end_date).toLocaleDateString() : 'N/A'}</td>
                  <td className="px-4 py-3 border-b text-gray-800">{campaign.status}</td>
                  <td className="px-4 py-3 border-b text-gray-800">${campaign.budget?.toFixed(2)}</td>
                </tr>
              ))}
              {campaignData.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-3 text-center text-gray-500">
                    No campaigns available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal for showing campaign details */}
      {/* {showModal && selectedCampaign && (
        <CampModal
          campaign={{
            ...selectedCampaign,
            description: selectedCampaign.description || '', // Ensure description is always a string
            status: selectedCampaign.status || 'Unknown', // Provide default status
          }}
          onClose={closeModal}
          onEdit={async () => {
            console.log('Campaign edited:', selectedCampaign.id);
            await fetchCampaigns(); // Call the fetchCampaigns function here
            closeModal();
          }}
          onDelete={async () => {
            const confirmation = window.confirm("Are you sure you want to delete this campaign?");
            if (confirmation) {
              const { error } = await supabase
                .from('campaigns')
                .delete()
                .eq('id', selectedCampaign.id);

              if (error) {
                console.error('Error deleting campaign:', error);
              } else {
                console.log('Campaign deleted:', selectedCampaign.id);
                await fetchCampaigns(); // Call the fetchCampaigns function here
                closeModal();
              }
            }
          }}
          audience={{ name: selectedCampaign.audience || 'No audience Selected' }} // Replace with actual audience data if available
        />
      )} */}
    </>
  );
}
