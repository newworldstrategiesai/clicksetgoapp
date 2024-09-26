"use client";

import { useState, useEffect } from 'react';
import { Label } from "@/components/ui/NewCampaign/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/NewCampaign/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/NewCampaign/select";
import { Button } from "@/components/ui/NewCampaign/button";
import { Checkbox } from "@/components/ui/checkbox";
import { createClient } from '@supabase/supabase-js';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface NewCampaignProps {
  userId: string;
}

// List of timezones for the dropdown
const timezones = [
  { value: 'UTC', label: 'UTC' },
  { value: 'America/New_York', label: 'Eastern Time (ET)' },
  { value: 'America/Chicago', label: 'Central Time (CT)' },
  { value: 'America/Denver', label: 'Mountain Time (MT)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
  { value: 'Europe/London', label: 'London' },
  { value: 'Europe/Paris', label: 'Paris' },
  { value: 'Asia/Tokyo', label: 'Tokyo' },
  { value: 'Australia/Sydney', label: 'Sydney' }
];

export function NewCampaign({ userId }: NewCampaignProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    timezone: '', // Selected timezone will be stored here
    audience: '', // Expecting UUID
    channels: {
      email: false,
      sms: false,
      phone: false,
    },
    budget: '',
    allocation: '',
    utmSource: '',
    utmMedium: '',
    utmCampaign: '',
    gdpr: false,
    ccpa: false,
    schedule: '',  // Expecting UUID
    agent: '' // Expecting agent UUID
  });

  const [lists, setLists] = useState<{ id: string; name: string }[]>([]);
  const [schedules, setSchedules] = useState<{ id: string; name: string }[]>([]);
  const [agents, setAgents] = useState<{ id: string; agent_name: string }[]>([]); // Agents state

  // Fetch lists, schedules, and agents from Supabase
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [listsResponse, schedulesResponse, agentsResponse] = await Promise.all([
          supabase.from('lists').select('id, name').eq('user_id', userId),
          supabase.from('schedules').select('id, name').eq('user_id', userId),
          supabase.from('agents').select('id, agent_name')
        ]);

        if (listsResponse.error) toast.error('Error fetching lists');
        else setLists(listsResponse.data || []);

        if (schedulesResponse.error) toast.error('Error fetching schedules');
        else setSchedules(schedulesResponse.data || []);

        if (agentsResponse.error) toast.error('Error fetching agents');
        else setAgents(agentsResponse.data || []);
      } catch (error) {
        toast.error('Error fetching data');
      }
    };

    fetchData();
  }, [userId]);

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Handle checkbox changes
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prevData => ({
      ...prevData,
      channels: {
        ...prevData.channels,
        [name]: checked
      }
    }));
  };

  // Handle timezone selection from dropdown
  const handleTimezoneChange = (value: string) => {
    setFormData(prevData => ({
      ...prevData,
      timezone: value
    }));
  };

  // Handle audience, schedule, and agent selection
  const handleSelectChange = (value: string) => {
    setFormData(prevData => ({
      ...prevData,
      audience: value
    }));
  };

  const handleScheduleChange = (value: string) => {
    setFormData(prevData => ({
      ...prevData,
      schedule: value
    }));
  };

  const handleAgentChange = (value: string) => {
    setFormData(prevData => ({
      ...prevData,
      agent: value
    }));
  };

  // Handle form submission and campaign creation
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const isValidUUID = (value: string) => /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(value);

    if (formData.audience && !isValidUUID(formData.audience)) {
      toast.error('Invalid audience ID');
      return;
    }

    if (formData.schedule && !isValidUUID(formData.schedule)) {
      toast.error('Invalid schedule ID');
      return;
    }

    if (formData.agent && !isValidUUID(formData.agent)) {
      toast.error('Invalid agent ID');
      return;
    }

    const { data, error } = await supabase.from('campaigns').insert([
      {
        name: formData.name,
        description: formData.description || null,
        start_date: formData.startDate || null,
        start_time: formData.startTime || null,
        end_date: formData.endDate || null,
        end_time: formData.endTime || null,
        start_timezone: formData.timezone || null,
        end_timezone: formData.timezone || null,
        audience: formData.audience || null,
        schedule: formData.schedule || null,
        agent: formData.agent || null,  // Include agent in insert
        channels: formData.channels,
        budget: formData.budget || null,
        allocation: formData.allocation || null,
        utm_source: formData.utmSource || null,
        utm_medium: formData.utmMedium || null,
        utm_campaign: formData.utmCampaign || null,
        gdpr: formData.gdpr,
        ccpa: formData.ccpa,
        user_id: userId,
      }
    ]);

    if (error) {
      toast.error(`Error saving campaign: ${error.message}`);
    } else {
      toast.success('Campaign saved successfully!');

      if (data && data.length > 0) { // Check if data is valid
        // Fetch and create tasks for each contact in the list (audience)
        const { data: contactListData, error: contactListError } = await supabase
          .from('contact_lists')
          .select('contact_id')
          .eq('list_id', formData.audience);

        if (contactListError) {
          toast.error(`Error fetching contact list: ${contactListError.message}`);
          return;
        }

        const tasks = contactListData.map((entry) => ({
          campaign_id: data[0].id,
          call_subject: `Call task for campaign: ${formData.name}`,
          call_status: 'Pending',
          scheduled_at: new Date().toISOString(),
          priority: 'Normal',
          contact_id: entry.contact_id,
        }));

        const { error: taskError } = await supabase.from('call_tasks').insert(tasks);
        if (taskError) {
          toast.error(`Error creating tasks: ${taskError.message}`);
        } else {
          toast.success('Call tasks created successfully.');
        }
      }
    }
  };

  // Find selected names for display in the dropdowns
  const selectedListName = lists.find(list => list.id === formData.audience)?.name || 'Select a list';
  const selectedScheduleName = schedules.find(schedule => schedule.id === formData.schedule)?.name || 'Select a schedule';
  const selectedAgentName = agents.find(agent => agent.id === formData.agent)?.agent_name || 'Select an agent';

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <ToastContainer />
      <h1 className="text-3xl font-bold mb-6">New Campaign</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="name">Campaign Name</Label>
            <Input id="name" name="name" type="text" placeholder="Enter
campaign name" value={formData.name} onChange={handleChange} />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" name="description" placeholder="Enter campaign description" value={formData.description} onChange={handleChange} />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="startDate">Start Date</Label>
            <div className="flex items-center gap-2">
              <Input id="startDate" name="startDate" type="date" value={formData.startDate} onChange={handleChange} />
              <Input id="startTime" name="startTime" type="time" value={formData.startTime} onChange={handleChange} />
            </div>
          </div>
          <div>
            <Label htmlFor="endDate">End Date</Label>
            <div className="flex items-center gap-2">
              <Input id="endDate" name="endDate" type="date" value={formData.endDate} onChange={handleChange} />
              <Input id="endTime" name="endTime" type="time" value={formData.endTime} onChange={handleChange} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="timezone">Timezone</Label>
            <Select onValueChange={handleTimezoneChange} defaultValue={formData.timezone}>
              <SelectTrigger id="timezone">
                <SelectValue placeholder="Select Timezone" />
              </SelectTrigger>
              <SelectContent>
                {timezones.map((tz) => (
                  <SelectItem key={tz.value} value={tz.value}>
                    {tz.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="audience">Audience</Label>
            <Select onValueChange={handleSelectChange} defaultValue={formData.audience}>
              <SelectTrigger id="audience">
                <SelectValue placeholder={selectedListName} />
              </SelectTrigger>
              <SelectContent>
                {lists.map(list => (
                  <SelectItem key={list.id} value={list.id}>
                    {list.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="schedule">Schedule</Label>
            <Select onValueChange={handleScheduleChange} value={formData.schedule}>
              <SelectTrigger id="schedule">
                <SelectValue placeholder={selectedScheduleName} />
              </SelectTrigger>
              <SelectContent>
                {schedules.map(schedule => (
                  <SelectItem key={schedule.id} value={schedule.id}>
                    {schedule.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="agent">Agent</Label>
            <Select onValueChange={handleAgentChange} value={formData.agent}>
              <SelectTrigger id="agent">
                <SelectValue placeholder={selectedAgentName} />
              </SelectTrigger>
              <SelectContent>
                {agents.map(agent => (
                  <SelectItem key={agent.id} value={agent.id}>
                    {agent.agent_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label>Channels</Label>
          <div className="flex gap-4">
            <Checkbox name="email" checked={formData.channels.email} onChange={handleCheckboxChange} />
            <Label htmlFor="email">Email</Label>
            <Checkbox name="sms" checked={formData.channels.sms} onChange={handleCheckboxChange} />
            <Label htmlFor="sms">SMS</Label>
            <Checkbox name="phone" checked={formData.channels.phone} onChange={handleCheckboxChange} />
            <Label htmlFor="phone">Phone</Label>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="budget">Budget</Label>
            <Input id="budget" name="budget" type="text" placeholder="Enter budget" value={formData.budget} onChange={handleChange} />
          </div>
          <div>
            <Label htmlFor="allocation">Allocation</Label>
            <Input id="allocation" name="allocation" type="text" placeholder="Enter allocation" value={formData.allocation} onChange={handleChange} />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="utmSource">UTM Source</Label>
            <Input id="utmSource" name="utmSource" type="text" placeholder="Enter UTM source" value={formData.utmSource} onChange={handleChange} />
          </div>
          <div>
            <Label htmlFor="utmMedium">UTM Medium</Label>
            <Input id="utmMedium" name="utmMedium" type="text" placeholder="Enter UTM medium" value={formData.utmMedium} onChange={handleChange} />
          </div>
          <div>
            <Label htmlFor="utmCampaign">UTM Campaign</Label>
            <Input id="utmCampaign" name="utmCampaign" type="text" placeholder="Enter UTM campaign" value={formData.utmCampaign} onChange={handleChange} />
          </div>
        </div>

        <div className="flex gap-4 items-center">
          <Checkbox id="gdpr" name="gdpr" checked={formData.gdpr} onChange={handleCheckboxChange} />
          <Label htmlFor="gdpr">GDPR Compliance</Label>
        </div>

        <div className="flex gap-4 items-center">
          <Checkbox id="ccpa" name="ccpa" checked={formData.ccpa} onChange={handleCheckboxChange} />
          <Label htmlFor="ccpa">CCPA Compliance</Label>
        </div>

        <Button type="submit">Create Campaign</Button>
      </form>
    </div>
  );
}
