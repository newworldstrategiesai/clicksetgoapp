'use client';

import { useState, useEffect } from 'react';
import { createClient, PostgrestError } from '@supabase/supabase-js'; // Import Supabase client
import { Campaign } from '@/types'; // Import the Campaign type from the types file
import { useRouter } from 'next/navigation';
import CryptoJS from 'crypto-js'; // Import CryptoJS for encryption
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  ReaderIcon,
  TrashIcon,
  Pencil2Icon,
} from '@radix-ui/react-icons';
interface CampaignTableProps {
  userId: string; // Receive userId as a prop
  apiKey: string; 
  twilioSid: string; 
  twilioAuthToken : string; 
  vapiKey: string
}

export default function CampaignTable({ userId,apiKey, twilioSid, twilioAuthToken, vapiKey  }: CampaignTableProps) {
  const [campaignData, setCampaignData] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const router = useRouter();

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
        .eq('user_id', userId) // Filter by user_id
        .order('updated_at', { ascending: false }); // Sort by `updated_at` in descending order

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
    // Encrypt sensitive data
    const encryptedUserId = CryptoJS.AES.encrypt(userId, process.env.SECRET_KEY || "").toString();
    const encryptedApiKey = CryptoJS.AES.encrypt(apiKey, process.env.SECRET_KEY || "").toString();
    const encryptedTwilioSid = CryptoJS.AES.encrypt(twilioSid, process.env.SECRET_KEY || "").toString();
    const encryptedTwilioAuthToken = CryptoJS.AES.encrypt(twilioAuthToken, process.env.SECRET_KEY || "").toString();
    const encryptedVapiKey = CryptoJS.AES.encrypt(vapiKey, process.env.SECRET_KEY || "").toString();

    const queryString = new URLSearchParams({ 
      userId: encryptedUserId, 
      apiKey: encryptedApiKey, 
      twilioSid: encryptedTwilioSid, 
      twilioAuthToken: encryptedTwilioAuthToken, 
      vapiKey: encryptedVapiKey 
    }).toString();
    
    router.push(`/campaigns/${campaignId}?${queryString}`); // Construct the URL with encrypted query parameters
  };
  const handleEdit = (campaignId: string) => {
    const encryptedUserId = CryptoJS.AES.encrypt(userId, process.env.SECRET_KEY || "").toString();
    router.push(`/editCampaign/${campaignId}`);
  };
  const handleDelete = async (campaignId: string) => {
    const confirmation = window.confirm("Are you sure you want to delete this campaign?");
    if (confirmation) {
      const { error: callTaskError } = await supabase
        .from('call_tasks')
        .delete()
        .eq('campaign_id', campaignId);

      if (callTaskError) {
        console.error('Error deleting call tasks:', callTaskError.message || callTaskError);
        return; // Exit if there was an error deleting call tasks
      }
      const { error: campaignError } = await supabase
        .from('campaigns')
        .delete()
        .eq('id', campaignId);
      if (campaignError) {
        console.error('Error deleting campaign:', campaignError.message || campaignError);
      } else {
        fetchCampaigns(); // Reload the campaigns after deletion
      }
    }
  }
  
  return (
    <>
      <div className="flex justify-between mb-4">
        <button 
          className="dark:bg-gray-500 dark:text-white px-4 py-2 rounded dark:hover:bg-gray-800 bg-gray-200"
          onClick={() => router.push('/home')} // Go back to the previous page
        >
          <FontAwesomeIcon icon={faArrowLeft} className=" dark:text-gray-300 text-black" /> 
        </button>
        <button 
          className="bg-blue-500 text-white dark:text-white px-4 py-2 rounded hover:bg-blue-600"
          onClick={() => router.push('/new-campaign')}
        >
          Create New Campaign
        </button>
      </div>
      
      {loading ? (
        <p className="text-center text-gray-600">Loading campaigns...</p>
      ) : errorMessage ? (
        <p className="text-red-500 text-center">{errorMessage}</p>
      ) : (
        <div className="overflow-x-auto rounded-lg shadow-md bg-modal dark:bg-black text-white">
          <table className="min-w-full bg-modal dark:bg-black border border-gray-300 table-auto">
            <thead>
              <tr className="bg-gray-400 dark:bg-gray-800">
                <th className="px-4 py-3 bg-gray-400 text-gray-900 dark:text-gray-800 font-semibold text-sm border-b text-start">Campaign Name</th>
                <th className="px-4 py-3 bg-gray-400 text-gray-900 dark:text-gray-800 font-semibold text-sm border-b text-start">Description</th>
                <th className="px-4 py-3 bg-gray-400 text-gray-900 dark:text-gray-800 font-semibold text-sm border-b text-start">Start Date</th>
                <th className="px-4 py-3 bg-gray-400 text-gray-900 dark:text-gray-800 font-semibold text-sm border-b text-start">End Date</th>
                <th className="px-4 py-3 bg-gray-400 text-gray-900 dark:text-gray-800 font-semibold text-sm border-b text-start">Status</th>
                <th className="px-4 py-3 bg-gray-400 text-gray-900 dark:text-gray-800 font-semibold text-sm border-b text-start">Budget</th>
                <th className="px-4 py-3 bg-gray-400 text-gray-900 dark:text-gray-800 font-semibold text-sm border-b">Action</th>
              </tr>
            </thead>
            <tbody>
              {campaignData.map((campaign) => (
                <tr
                  key={campaign.id}
                  className="hover:bg-gray-300 dark:hover:bg-gray-700 transition duration-150"
                  // onClick={() => handleClick(campaign.id)} // Use handleClick function to redirect
                >
                  <td className="px-4 py-3 border-b text-gray-800 dark:text-gray-300 truncate">{campaign.name || 'No name'}</td>
                  <td className="px-4 py-3 border-b text-gray-800 dark:text-gray-300 truncate max-w-xs sm:max-w-md">{campaign.description && campaign.description.length > 30 ? `${campaign.description.substring(0, 30)}...` : campaign.description || 'No description'}</td>
                  <td className="px-4 py-3 border-b text-gray-800 dark:text-gray-300">{campaign.start_date ? new Date(campaign.start_date).toLocaleDateString() : 'N/A'}</td>
                  <td className="px-4 py-3 border-b text-gray-800 dark:text-gray-300">{campaign.end_date ? new Date(campaign.end_date).toLocaleDateString() : 'N/A'}</td>
                  <td className="px-4 py-3 border-b text-gray-800 dark:text-gray-300"><p>{campaign.status || "Not Available"}</p></td>
                  <td className="px-4 py-3 border-b text-gray-800 dark:text-gray-300">${campaign.budget?.toFixed(2)}</td>
                  <td className={`px-4 py-3 border-b text-gray-800 dark:text-gray-300`}>
                    <div className={`text-gray-800 dark:text-gray-300 flex justify-evenly`}>
                    <p className={` text-center p-2 hover:bg-blue-600 rounded-2xl cursor-pointer`}  onClick={(e) => { e.stopPropagation(); handleEdit(campaign.id) }}><Pencil2Icon className="h-6 w-6 text-muted-foreground/70" /></p>
                    <p className={` text-center p-2 hover:bg-gray-500 rounded-2xl cursor-pointer`}  onClick={(e) => { e.stopPropagation(); handleClick(campaign.id); }}><ReaderIcon className="h-6 w-6 text-muted-foreground/70" /></p>
                    <p className={` text-center p-2 hover:bg-red-600 rounded-2xl cursor-pointer`}  onClick={(e) => { e.stopPropagation(); handleDelete(campaign.id) }}><TrashIcon className="h-6 w-6 text-muted-foreground/70" /></p>
                    </div>
                  </td>
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
    </>
  );
}
