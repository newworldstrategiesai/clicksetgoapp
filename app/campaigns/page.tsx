"use client";

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import Image from "next/image";
import CampModal from "components/CampModal";

// Define the Campaign type for TypeScript
interface Campaign {
  id: string;
  name: string;
  status: string;
  start_date: string;
  end_date: string;
  audience: string;
}

interface List {
  id: string;
  name: string;
}

export default function CampaignsPage() {
  const [campaignData, setCampaignData] = useState<Campaign[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [audienceName, setAudienceName] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  // Initialize Supabase client
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Fetch campaigns from Supabase
  useEffect(() => {
    async function fetchCampaigns() {
      const { data, error } = await supabase
        .from<Campaign, Campaign[]>('campaigns') // Correct usage: Campaign row type and Campaign[] return type
        .select('*');

      if (error) {
        console.error("Error fetching campaigns:", error);
      } else {
        setCampaignData(data || []);
      }
    }
    fetchCampaigns();
  }, [supabase]);

  // Fetch audience name based on audience UUID
  const fetchAudienceName = async (audienceId: string) => {
    const { data, error } = await supabase
      .from<List>('lists')
      .select('name')
      .eq('id', audienceId)
      .single();

    if (error) {
      console.error("Error fetching audience name:", error);
    } else {
      setAudienceName(data?.name || null);
    }
  };

  const openModal = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    if (campaign.audience) {
      fetchAudienceName(campaign.audience);
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedCampaign(null);
    setAudienceName(null);
  };

  return (
    <>
      {/* Mobile view with example image */}
      <div className="block md:hidden pt-4">
        <Image
          src="/examples/mail-dark.png"
          width={1280}
          height={727}
          alt="Campaigns"
          className="hidden dark:block w-full h-auto"
        />
        <Image
          src="/examples/mail-light.png"
          width={1280}
          height={727}
          alt="Campaigns"
          className="block dark:hidden w-full h-auto"
        />
      </div>

      {/* Table view for all screen sizes */}
      <div className="flex flex-col p-4 md:pt-6 lg:pt-8">
        <h1 className="text-2xl font-bold mb-6">Campaigns</h1>
        <div className="overflow-x-auto rounded-lg shadow-md">
          <table className="min-w-full bg-white border border-gray-300 table-auto">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-4 py-3 text-gray-700 font-semibold text-sm border-b">Name</th>
                <th className="px-4 py-3 text-gray-700 font-semibold text-sm border-b">Status</th>
                <th className="px-4 py-3 text-gray-700 font-semibold text-sm border-b">Start Date</th>
                <th className="px-4 py-3 text-gray-700 font-semibold text-sm border-b">End Date</th>
              </tr>
            </thead>
            <tbody>
              {campaignData.map((campaign) => (
                <tr
                  key={campaign.id}
                  className="hover:bg-gray-100 cursor-pointer"
                  onClick={() => openModal(campaign)}
                >
                  <td className="px-4 py-3 border-b text-gray-800">{campaign.name}</td>
                  <td className="px-4 py-3 border-b text-gray-800">{campaign.status}</td>
                  <td className="px-4 py-3 border-b text-gray-800">
                    {new Date(campaign.start_date).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 border-b text-gray-800">
                    {new Date(campaign.end_date).toLocaleDateString()}
                  </td>
                </tr>
              ))}
              {campaignData.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-3 text-center text-gray-500">
                    No campaigns available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Modal for showing campaign details */}
        {showModal && selectedCampaign && (
          <CampModal
            campaign={selectedCampaign}
            audience={{ name: audienceName }}
            onClose={closeModal}
            onPause={() => console.log("Pause campaign:", selectedCampaign.id)}
            onEdit={() => console.log("Edit campaign:", selectedCampaign.id)}
            onDelete={() => console.log("Delete campaign:", selectedCampaign.id)}
          />
        )}
      </div>
    </>
  );
}
