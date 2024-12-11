// pages/api/campaign-status.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/utils/supabaseClient';

async function getCampaigns() {
  const { data: campaigns, error } = await supabase
    .from('campaigns')
    .select('id')
    .eq('status', 'Scheduled');

  if (error) throw new Error(error.message);
  return campaigns;
}

async function getCallTasks(campaignId: string) {
  const { data: callTasks, error } = await supabase
    .from('call_tasks')
    .select('call_status')
    .eq('campaign_id', campaignId);

  if (error) throw new Error(error.message);
  return callTasks;
}

async function updateCampaignStatus(campaignId: string) {
  const { error } = await supabase
    .from('campaigns')
    .update({ status: 'Completed' })
    .eq('id', campaignId);

  if (error) throw new Error(error.message);
  console.log(`Campaign ${campaignId} status updated to Completed.`);
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // Step 1: Fetch all campaigns that are in "Scheduled" status
    const campaigns = await getCampaigns();

    // Step 2: Loop through campaigns and check their tasks
    const updatePromises = campaigns.map(async (campaign) => {
      const callTasks = await getCallTasks(campaign.id);

      // Check if all tasks are completed
      const allCompleted = callTasks.every(
        (task) => task.call_status === 'Completed'
      );

      if (allCompleted) {
        await updateCampaignStatus(campaign.id);
      }
    });

    // Wait for all campaign updates to complete
    await Promise.all(updatePromises);

    // Respond with success
    res.status(200).json({ message: 'Campaigns processed successfully' });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: 'An error occurred while processing campaigns.' });
  }
}
