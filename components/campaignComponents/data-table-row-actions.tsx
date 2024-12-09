'use client';

import React, { useEffect, useState } from 'react';
import {
  DotsHorizontalIcon,
  TrashIcon,
  Pencil1Icon,
  GearIcon
} from '@radix-ui/react-icons'; // Add EyeIcon for view
import { Row } from '@tanstack/react-table';
import { Button } from '@/registry/new-york/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/registry/new-york/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/registry/new-york/ui/dialog';
import { campaignSchema } from '../../app/campaign_ui/data/schema';
import { supabase } from '@/utils/supabaseClient'; // Import Supabase client
import { toast } from 'react-toastify'; // For user feedback
import { redirect, useRouter } from 'next/navigation'; // Import useRouter for navigation
import { getUser } from '@/utils/supabase/queries';
import CryptoJS from 'crypto-js'; // Ensure CryptoJS is imported
import { createClient } from '@/utils/createClient';
interface Task {
  id: string;
  name: string; // Represents the name of the campaign or task
  description: string; // Description of the task
  start_date: Date | null; // Start date of the campaign/task
  end_date: Date | null; // End date of the campaign/task
  status: string; // Current status of the task (e.g., active, pending)
  budget: number; // Budget for the campaign
  updated_at: Date; // Last updated timestamp
  created_at?: Date; // Optional field for creation timestamp
}

interface DataTableRowActionsProps {
  row: Row<Task>;
  onEdit: (task: Task) => void;
}

export default function DataTableRowActions({
  row,
  onEdit
}: DataTableRowActionsProps) {
  const router = useRouter();
  const [user, setUser] = useState<any>(null); // State for storing user data
  const [apiKeys, setApiKeys] = useState<{
    apiKey: string | null;
    twilioSid: string | null;
    twilioAuthToken: string | null;
    vapiKey: string | null;
  }>({
    apiKey: null,
    twilioSid: null,
    twilioAuthToken: null,
    vapiKey: null
  });

  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      const supabaseClient = createClient();
      const loggedInUser = await getUser(supabaseClient); // Get the logged-in user

      if (!loggedInUser) {
        redirect('/signin'); // Redirect to signin if no user
        return;
      }
      setUser(loggedInUser);
    };

    // const fetchApiKeys = async () => {
    //   if (!user) return; // Don't fetch API keys if user is not available

    //   const { data, error } = await supabase
    //     .from('api_keys' as any) // Cast as 'any' to bypass type checking
    //     .select('eleven_labs_key, twilio_sid, twilio_auth_token, vapi_key')
    //     .eq('user_id', user.id)
    //     .single();

    //   if (error || !data) {
    //     console.error('Failed to fetch API keys:', error?.message || 'No data');
    //     toast.error('Failed to fetch API keys. Redirecting to signin.');
    //     router.push('/signin');
    //     return;
    //   }

    //   setApiKeys({
    //     apiKey: data.eleven_labs_key || null,
    //     twilioSid: data.twilio_sid || null,
    //     twilioAuthToken: data.twilio_auth_token || null,
    //     vapiKey: data.vapi_key || null
    //   });
    // };

    fetchUser();
    // fetchApiKeys();
  }, [user, router]);

  let campaign: Task;
  try {
    const parsedTask = campaignSchema.parse(row.original); // Validate the task schema
    campaign = {
      ...parsedTask
    };
  } catch (error) {
    console.error('Task validation failed:', error);
    return null; // Optionally, render a fallback UI
  }

  const handleDelete = async () => {
    if (!campaign.id) return;

    const { error: taskError } = await supabase
      .from('call_tasks')
      .delete()
      .eq('campaign_id', campaign.id);

    if (taskError) {
      console.error('Error deleting related tasks:', taskError.message);
      toast.error('Failed to delete related tasks. Please try again.');
      return;
    }

    const { error: campaignError } = await supabase
      .from('campaigns')
      .delete()
      .eq('id', campaign.id);

    if (campaignError) {
      console.error('Error deleting campaign:', campaignError.message);
      toast.error('Failed to delete campaign. Please try again.');
    } else {
      toast.success('Campaign and related tasks deleted successfully.');
    }

    setIsDialogOpen(false);
  };

  const handleView = () => {
    if (!user || !apiKeys) {
      toast.error('Required data is missing');
      return;
    }

    const encryptedUserId = CryptoJS.AES.encrypt(
      user.id,
      process.env.SECRET_KEY || ''
    ).toString();
    const encryptedApiKey = CryptoJS.AES.encrypt(
      apiKeys.apiKey || '',
      process.env.SECRET_KEY || ''
    ).toString();
    const encryptedTwilioSid = CryptoJS.AES.encrypt(
      apiKeys.twilioSid || '',
      process.env.SECRET_KEY || ''
    ).toString();
    const encryptedTwilioAuthToken = CryptoJS.AES.encrypt(
      apiKeys.twilioAuthToken || '',
      process.env.SECRET_KEY || ''
    ).toString();
    const encryptedVapiKey = CryptoJS.AES.encrypt(
      apiKeys.vapiKey || '',
      process.env.SECRET_KEY || ''
    ).toString();

    const queryString = new URLSearchParams({
      userId: encryptedUserId,
      apiKey: encryptedApiKey,
      twilioSid: encryptedTwilioSid,
      twilioAuthToken: encryptedTwilioAuthToken,
      vapiKey: encryptedVapiKey
    }).toString();
    router.push(`/campaigns/${campaign.id}?${queryString}`); // Assuming the route is /campaign/[id]
  };

  const handleEdit = () => {
    router.push(`/editCampaign/${campaign.id}`);
  };

  return (
    <div className="flex items-center justify-center">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
          >
            <DotsHorizontalIcon className="h-4 w-4" />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[160px]">
          <DropdownMenuItem onClick={handleView}>
            <GearIcon className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
            View
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleEdit}>
            <Pencil1Icon className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setIsDialogOpen(true)}>
            <TrashIcon className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
            Delete
          </DropdownMenuItem>
          <DropdownMenuSeparator />
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this campaign and its related
              tasks? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
