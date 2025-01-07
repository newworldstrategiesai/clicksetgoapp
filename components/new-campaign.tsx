// components/ui/NewCampaign.tsx

'use client';

import { useState, useEffect } from "react";
import { Label } from "@/components/ui/NewCampaign/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/NewCampaign/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/NewCampaign/select";
import { Button } from "@/components/ui/NewCampaign/button";
import { createClient } from '@supabase/supabase-js';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useCountry } from "@/context/CountryContext";
import moment from "moment-timezone";
import { useRouter } from 'next/navigation';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface NewCampaignProps {
  userId: string;
}

const countryCodes: Record<string, string> = {
  US: "+1",
  IN: "+91",
  FR: "+33",
  DE: "+49",
  ES: "+34",
  IT: "+39",
  // Add more country codes here
};

const timezones = [
  { value: 'UTC', label: 'UTC' },
  { value: 'America/New_York', label: 'Eastern Time (ET)' },
  { value: 'America/Chicago', label: 'Central Time (CT)' },
  { value: 'America/Denver', label: 'Mountain Time (MT)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
  { value: 'Europe/London', label: 'London' },
  { value: 'Europe/Paris', label: 'Paris' },
  { value: 'Asia/Tokyo', label: 'Tokyo' },
  { value: 'Australia/Sydney', label: 'Sydney' },
  { value: 'Asia/Kolkata', label: 'India' }
];

export function NewCampaign({ userId }: NewCampaignProps) {
  const { defaultCountry, setDefaultCountry } = useCountry();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    startDate: new Date(),
    endDate: new Date(),
    timezone: '',
    audience: '',
    budget: '',
    allocation: '',
    utmSource: '',
    utmMedium: '',
    utmCampaign: '',
    schedule: '',
    agent: '',
    callDistribution: ''
  });
  const router = useRouter();
  const [lists, setLists] = useState<{ id: string; name: string }[]>([]);
  const [schedules, setSchedules] = useState<{ id: string; name: string }[]>([]);
  const [agents, setAgents] = useState<{ id: string; agent_name: string }[]>([]);

  const [isSubmitting, setIsSubmitting] = useState(false); // For loading state
  const [isAdvanced, setIsAdvanced] = useState(false); // State for Advanced section

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch Lists
        const listsResponse = await supabase
          .from('lists')
          .select('id, name')
          .eq('user_id', userId);

        if (listsResponse.error) {
          toast.error('Error fetching lists');
        } else {
          setLists(listsResponse.data || []);
        }

        // Fetch Schedules
        const schedulesResponse = await supabase
          .from('schedules')
          .select('id, name')
          .eq('user_id', userId);

        if (schedulesResponse.error) {
          toast.error('Error fetching schedules');
        } else {
          setSchedules(schedulesResponse.data || []);
        }

        // Fetch Agents
        const agentsResponse = await supabase
          .from('agents')
          .select('id, agent_name')
          .eq('user_id', userId)

        if (agentsResponse.error) {
          toast.error('Error fetching agents');
        } else {
          setAgents(agentsResponse.data || []);
        }
      } catch (error) {
        toast.error('Error fetching data');
      }
    };

    fetchData();
  }, [userId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleTimezoneChange = (value: string) => {
    setFormData(prevData => ({
      ...prevData,
      timezone: value
    }));
  };

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
  const handleDistributionMethodChange = (value: string) => {
    setFormData((prevData) => ({
      ...prevData,
      callDistribution: value,
    }));
  
    if (value === 'Immediate') {
      // If Immediate, clear schedule and disable it
      setFormData((prevData) => ({
        ...prevData,
        schedule: '', // Clear the schedule
      }));
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Frontend Validations
    if (formData.startDate >= formData.endDate) {
      toast.error('End date must be after the start date');
      return;
    }

    if (!formData.timezone) {
      toast.error('Please select a timezone');
      return;
    }

     // Check if "Distributed" is selected and if schedule is not selected
    if (formData.callDistribution === 'Distributed' && !formData.schedule) {
      toast.error('Please select a schedule');
      return;
    }

    // Optional: Add more validations as needed

    setIsSubmitting(true); // Start loading

    const format1 = "YYYY-MM-DD HH:mm:ss"
    
    //Get the string portion of the selected date time, ignoring timezone
    const selectedTimeString = moment(formData.startDate).format(format1);

    // Calculate scheduled_at in UTC
    const scheduledAtUTC = moment.tz(selectedTimeString, formData.timezone).utc().toISOString();
    
    // Prepare data for insertion
    const insertData = {
      name: formData.name,
      description: formData.description || null,
      start_date: formData.startDate.toISOString(),
      end_date: formData.endDate.toISOString(),
      start_timezone: formData.timezone || null,
      end_timezone: formData.timezone || null, // Assuming end timezone is same as start
      status: "Pending",
      audience: formData.audience || null,    
      schedule: formData.schedule || null,
      agent: formData.agent || null,
      budget: formData.budget ? parseFloat(formData.budget) : null,
      allocation: formData.allocation ? parseFloat(formData.allocation) : null,
      utm_source: formData.utmSource || null,
      utm_medium: formData.utmMedium || null,
      utm_campaign: formData.utmCampaign || null,
      user_id: userId,
      country_code: defaultCountry.code,
      scheduled_at: scheduledAtUTC,
      call_distribution: formData.callDistribution
    };
    // Debugging: Log the data being sent
    // router.push('/campaigns');
    try {
      const { error } = await supabase.from('campaigns').insert([insertData]);

      if (error) {
        toast.error(`Error saving campaign: ${error.message}`);
      } else {
        toast.success('New Campaign created successfully');
        // Optionally, reset the form or redirect the user
        setFormData({
          name: '',
          description: '',
          startDate: new Date(),
          endDate: new Date(),
          timezone: '',
          audience: '',
          budget: '',
          allocation: '',
          utmSource: '',
          utmMedium: '',
          utmCampaign: '',
          schedule: '',
          agent: '',
          callDistribution: ''
        });
        setIsAdvanced(false); // Reset Advanced section
        router.push(`/campaigns`);
      }
    } catch (error) {
      console.error('Error inserting campaign:', error);
      toast.error('An unexpected error occurred while creating the campaign.');
    } finally {
      setIsSubmitting(false); // End loading
    }
  };

  const selectedListName = lists.find(list => list.id === formData.audience)?.name || 'Select a list';
  const selectedScheduleName = schedules.find(schedule => schedule.id === formData.schedule)?.name || 'Select a schedule';
  const selectedAgentName = agents.find(agent => agent.id === formData.agent)?.agent_name || 'Select an agent';

  const handleCountryChange = async (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedCountry = event.target.value;
    const countryCode = countryCodes[selectedCountry];
    setDefaultCountry({ name: selectedCountry, code: countryCode });

    const { error } = await supabase
      .from('client_settings')
      .update({ campaign_country_name: selectedCountry, campaign_country_code: countryCode })
      .eq('user_id', userId);

    if (error) {
      console.error('Error updating country in Supabase:', error.message);
      window.alert('Error updating country. Please try again.');
    }
  };

  const toggleAdvanced = () => {
    setIsAdvanced(prev => !prev);
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      <ToastContainer />
      <h1 className="text-2xl font-bold mb-6 text-left text-gray-800 dark:text-white">New Campaign</h1>
      <form onSubmit={handleSubmit} className="space-y-6 bg-modal dark:bg-gray-900 shadow-md rounded-lg p-8 transition-all duration-200">
        {/* Campaign Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="name">Campaign Name</Label>
            <Input
              id="name"
              name="name"
              type="text"
              placeholder="Enter campaign name"
              value={formData.name}
              onChange={handleChange}
              className="border rounded-lg p-2 w-full bg-white dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Enter campaign description"
              value={formData.description}
              onChange={handleChange}
              className="border rounded-lg p-2 w-full bg-white dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="startDate">Start Date</Label>
            <DatePicker
              selected={formData.startDate}
              onChange={(date) => setFormData(prev => ({ ...prev, startDate: date! }))}
              showTimeSelect
              dateFormat="Pp"
              placeholderText="Select start date and time"
              className="border rounded-lg p-2 w-full bg-white dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <Label htmlFor="endDate">End Date</Label>
            <DatePicker
              selected={formData.endDate}
              onChange={(date) => setFormData(prev => ({ ...prev, endDate: date! }))}
              showTimeSelect
              dateFormat="Pp"
              placeholderText="Select end date and time"
              className="border rounded-lg p-2 w-full bg-white dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
        </div>

        {/* Timezone and Audience */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="audience">Audience</Label>
            <Select onValueChange={handleSelectChange} value={formData.audience}>
              <SelectTrigger className="border rounded-lg p-2 w-full bg-white dark:bg-gray-800 dark:text-white">
                <SelectValue placeholder={selectedListName} />
              </SelectTrigger>
              <SelectContent className="bg-gray-100 dark:bg-gray-800 dark:text-white">
                {lists.map((list) => (
                  <SelectItem key={list.id} value={list.id}>
                    {list.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
              <Label htmlFor="distributionMethod">Call Distribution</Label>
              <Select value={formData.callDistribution} onValueChange={handleDistributionMethodChange}>
                <SelectTrigger className="border rounded-lg p-2 w-full bg-white dark:bg-gray-800 dark:text-white">
                  <SelectValue placeholder="Select Method" />
                </SelectTrigger>
                <SelectContent className="bg-gray-100 dark:bg-gray-800 dark:text-white">
                  <SelectItem value="Immediate">Immediate</SelectItem>
                  <SelectItem value="Distributed">Distributed</SelectItem>
                </SelectContent>
              </Select>
            </div>
        </div>

        {/* Schedule and Agent */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="schedule">Schedule<span style={{ fontSize: '0.9em', color: '#888' }}>(Optional)</span></Label>
            <Select onValueChange={handleScheduleChange} value={formData.schedule} disabled={formData.callDistribution === 'Immediate'} >
              <SelectTrigger className="border rounded-lg p-2 w-full bg-white dark:bg-gray-800 dark:text-white">
                  <SelectValue placeholder={selectedScheduleName} />
              </SelectTrigger>
              <SelectContent className="bg-gray-100 dark:bg-gray-800 dark:text-white">
                {schedules.map((schedule) => (
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
              <SelectTrigger className="border rounded-lg p-2 w-full bg-white dark:bg-gray-800 dark:text-white">
                <SelectValue placeholder={selectedAgentName} />
              </SelectTrigger>
              <SelectContent className="bg-gray-100 dark:bg-gray-800 dark:text-white">
                {agents.map((agent) => (
                  <SelectItem key={agent.id} value={agent.id}>
                    {agent.agent_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        {/* Country Selection */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="countryCode">Country</Label>
            <select
              value={defaultCountry.name}
              onChange={handleCountryChange}
              name="countryCode"
              id="countryCode"
              className="border-black rounded-lg p-2 mt-2 w-full bg-white dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select Country</option>
              <option value="US">United States</option>
              <option value="IN">India</option>
              <option value="FR">France</option>
              <option value="DE">Germany</option>
              <option value="ES">Spain</option>
              <option value="IT">Italy</option>
              {/* Add more country options as needed */}
            </select>
          </div>
          <div className="flex items-center justify-end">
            <Button
              type="button"
              onClick={toggleAdvanced}
              variant="secondary"
              className="mt-6"
            >
              {isAdvanced ? 'Hide Advanced' : 'Show Advanced'}
            </Button>
          </div>
        </div>
        {/* Advanced Section */}
        {isAdvanced && (
          <div className="border-t border-gray-300 dark:border-gray-700 pt-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Advanced Settings</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Budget and Allocation */}
              <div>
                <Label htmlFor="budget">Budget</Label>
                <Input
                  id="budget"
                  name="budget"
                  type="number"
                  min="0"
                  placeholder="Enter budget"
                  value={formData.budget}
                  onChange={handleChange} 
                  className="border rounded-lg p-2 w-full bg-white dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <Label htmlFor="timezone">Timezone</Label>
                <Select onValueChange={handleTimezoneChange} value={formData.timezone}>
                  <SelectTrigger className="border rounded-lg p-2 w-full bg-white dark:bg-gray-800 dark:text-white">
                    <SelectValue placeholder="Select a timezone" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-100 dark:bg-gray-800 dark:text-white">
                    {timezones.map((tz) => (
                      <SelectItem key={tz.value} value={tz.value}>
                        {tz.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="allocation">Allocation</Label>
                <Input
                  id="allocation"
                  name="allocation"
                  type="number"
                  min="0"
                  placeholder="Enter allocation"
                  value={formData.allocation}
                  onChange={handleChange}
                  className="border rounded-lg p-2 w-full bg-white dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* UTM Parameters */}
              <div className="sm:col-span-2">
                <Label htmlFor="utmSource">UTM Source</Label>
                <Input
                  id="utmSource"
                  name="utmSource"
                  type="text"
                  placeholder="Enter UTM Source"
                  value={formData.utmSource}
                  onChange={handleChange}
                  className="border rounded-lg p-2 w-full bg-white dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="utmMedium">UTM Medium</Label>
                <Input
                  id="utmMedium"
                  name="utmMedium"
                  type="text"
                  placeholder="Enter UTM Medium"
                  value={formData.utmMedium}
                  onChange={handleChange}
                  className="border rounded-lg p-2 w-full bg-white dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="utmCampaign">UTM Campaign</Label>
                <Input
                  id="utmCampaign"
                  name="utmCampaign"
                  type="text"
                  placeholder="Enter UTM Campaign"
                  value={formData.utmCampaign}
                  onChange={handleChange}
                  className="border rounded-lg p-2 w-full bg-white dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div> 
            </div>
          </div>
        )}
        <Button
          type="submit"
          className="w-full bg-blue-500 dark:bg-blue-500 text-white dark:text-white hover:bg-blue-600 transition duration-200"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Creating Campaign...' : 'Create Campaign'}
        </Button>
      </form>
    </div>
  );
}
