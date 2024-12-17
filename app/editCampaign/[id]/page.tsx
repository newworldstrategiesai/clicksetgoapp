'use client';

import { useState, useEffect, use } from 'react';
import { Label } from '@/components/ui/NewCampaign/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/NewCampaign/textarea';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from '@/components/ui/NewCampaign/select';
import { Button } from '@/components/ui/NewCampaign/button';
import { createClient } from '@supabase/supabase-js';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useCountry } from '@/context/CountryContext';
import moment from 'moment-timezone';
import { useSearchParams } from 'next/navigation';
import CampaignPage from '@/app/campaigns/[id]/page';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface FormData {
  name: string;
  description: string;
  startDate: Date;
  endDate: Date;
  timezone: string;
  audience: string;
  budget: string;
  allocation: string;
  utmSource: string;
  utmMedium: string;
  utmCampaign: string;
  schedule: string;
  agent: string;
  country: string;
  updated_at: Date;
  status: string;
}

const EditCampaign = ({ params }: { params: Promise<{ id: string }> }) => {
  const { defaultCountry, setDefaultCountry } = useCountry();
  const { id } = use(params);
  const [formData, setFormData] = useState<FormData>({
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
    country: '',
    updated_at: new Date(),
    status: ''
  });

  const [lists, setLists] = useState<{ id: string; name: string }[]>([]);
  const [schedules, setSchedules] = useState<{ id: string; name: string }[]>(
    []
  );
  const [agents, setAgents] = useState<{ id: string; agent_name: string }[]>(
    []
  );
  const [isReadOnly, setIsReadOnly] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [user_id, setUser_id] = useState('');
  const fetchData = async () => {
    try {
      const campaignRes = await supabase
        .from('campaigns')
        .select('*')
        .eq('id', id)
        .single();
      if (campaignRes.error) {
        toast.error(`Error fetching campaign: ${campaignRes.error.message}`);
        return;
      }
      if (!campaignRes.data) {
        toast.error('No campaign data found for the provided ID.');
        return;
      }
      const campaign = campaignRes.data;
      const userId = campaign.user_id;
      setUser_id(userId);
      // Fetch lists
      const listsRes = await supabase
        .from('lists')
        .select('id, name')
        .eq('user_id', userId);
      if (listsRes.error) {
        toast.error(`Error fetching lists: ${listsRes.error.message}`);
        return;
      }

      // Fetch schedules
      const schedulesRes = await supabase
        .from('schedules')
        .select('id, name')
        .eq('user_id', userId);
      if (schedulesRes.error) {
        toast.error(`Error fetching schedules: ${schedulesRes.error.message}`);
        return;
      }

      // Fetch agents
      const agentsRes = await supabase
        .from('agents')
        .select('id, agent_name')
        .eq('user_id', userId);
      if (agentsRes.error) {
        toast.error(`Error fetching agents: ${agentsRes.error.message}`);
        return;
      }

      // Set fetched data
      setFormData(campaign); // Store raw data (optional)
      setLists(listsRes.data || []);
      setSchedules(schedulesRes.data || []);
      setAgents(agentsRes.data || []);

      // Match schedule and set form data
      const matchedSchedule = schedulesRes.data?.find(
        (schedule) => schedule.id === campaign.schedule
      );

      const fetchedCountryCode = campaign.country_code || '';

      // Find the country name based on the country code
      const countryName = Object.keys(countryCodes).find(
        (key) => countryCodes[key] === fetchedCountryCode
      );

      if (countryName) {
        setDefaultCountry({ name: countryName, code: fetchedCountryCode });
      }

      if (campaignRes.data) {
        const campaign = campaignRes.data;
        console.log(campaign);
        setFormData({
          name: campaign.name || '',
          description: campaign.description || '',
          startDate: campaign.start_date
            ? new Date(campaign.start_date)
            : new Date(),
          endDate: campaign.end_date ? new Date(campaign.end_date) : new Date(),
          timezone: campaign.end_timezone || '',
          audience: campaign.audience || '',
          budget: campaign.budget || '',
          allocation: campaign.allocation || '',
          utmSource: campaign.utm_source || '',
          utmMedium: campaign.utm_medium || '',
          utmCampaign: campaign.utm_campaign || '',
          schedule: campaign.schedule || '',
          agent: campaign.agent || '',
          country: campaign.country_code || '',
          updated_at: campaign.updated_at
            ? new Date(campaign.updated_at)
            : new Date(),
          status: campaign.status
        });
      }

      if (listsRes.error) {
        toast.error('Error fetching lists.');
      } else {
        setLists(listsRes.data || []);
      }

      if (schedulesRes.error) {
        toast.error('Error fetching schedules.');
      } else {
        setSchedules(schedulesRes.data || []);
      }

      if (agentsRes.error) {
        toast.error('Error fetching agents.');
      } else {
        setAgents(agentsRes.data || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('An error occurred while fetching campaign data.');
    }
  };

  useEffect(() => {
    if (id) fetchData();
  }, [id]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  useEffect(() => {
    const isReadOnly = ['Pending', 'Scheduled'].includes(
      formData.status
    );
    setIsReadOnly(!isReadOnly);
  })

  const handleSelectChange = async (field: keyof FormData, value: string) => {
    if (field === 'audience' && value !== formData.audience) {
      try {
        // const deleteRes = await supabase
        //   .from('call_tasks')
        //   .delete()
        //   .eq('campaign_id', id);

        // if (deleteRes.error) {
        //   console.error('Error deleting call tasks:', deleteRes.error.message);
        //   toast.error('Failed to update call tasks.');
        //   return;
        // }

        toast.success('Call tasks removed successfully.');
      } catch (error) {
        console.error('Error deleting call tasks:', error);
        toast.error('An error occurred while updating call tasks.');
      }
    }
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.startDate >= formData.endDate) {
      toast.error('End date must be after start date.');
      return;
    }

    setIsSubmitting(true);
    try {
      const format1 = "YYYY-MM-DD HH:mm:ss";  
      const selectedTimeString = moment(formData.startDate).format(format1);  
      const scheduledAtUTC = moment.tz(selectedTimeString, formData.timezone).utc().toISOString();
      const updateRes = await supabase
        .from('campaigns')
        .update({
          name: formData.name,
          description: formData.description,
          start_date: formData.startDate,
          end_date: formData.endDate,
          start_timezone: formData.timezone,
          end_timezone: formData.timezone,
          audience: formData.audience,
          budget: formData.budget,
          allocation: formData.allocation,
          utm_source: formData.utmSource,
          utm_medium: formData.utmMedium,
          utm_campaign: formData.utmCampaign,
          schedule: formData.schedule,
          agent: formData.agent,
          country_code: formData.country,
          updated_at: new Date(),
          scheduled_at: scheduledAtUTC
        })
        .eq('id', id);

      if (updateRes.error) {
        throw new Error(updateRes.error.message);
      }

      toast.success('Campaign updated successfully!');
    } catch (error) {
      console.error('Error updating campaign:', error);
      toast.error('An error occurred while updating the campaign.');
    } finally {
      setIsSubmitting(false);
    }
  };

  function handleTimezoneChange(value: string): void {
    throw new Error('Function not implemented.');
  }
  const selectedListName =
    lists.find((list) => list.id === formData.audience)?.name ||
    'Select a list';
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

  const selectedScheduleName =
    schedules.find((schedule) => schedule.id === formData.schedule)?.name ||
    'Select a schedule';
  const selectedAgentName =
    agents.find((agent) => agent.id === formData.agent)?.agent_name ||
    'Select an agent';
  const countryCodes: Record<string, string> = {
    US: '+1',
    IN: '+91',
    FR: '+33',
    DE: '+49',
    ES: '+34',
    IT: '+39'
    // Add more country codes here
  };

  const handleCountryChange = async (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const selectedCountry = event.target.value;
    const countryCode = countryCodes[selectedCountry];
    setDefaultCountry({ name: selectedCountry, code: countryCode });
    formData.country = countryCode;
    const { error } = await supabase
      .from('client_settings')
      .update({
        campaign_country_name: selectedCountry,
        campaign_country_code: countryCode
      })
      .eq('user_id', user_id);

    if (error) {
      console.error('Error updating country in Supabase:', error.message);
      window.alert('Error updating country. Please try again.');
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <ToastContainer />
      <h1 className="text-5xl font-bold mb-6 text-center dark:text-white">
        Edit Campaign
      </h1>
      <form
        onSubmit={handleSubmit}
        className="space-y-6 dark:bg-black shadow-md p-8 bg-modal rounded-xl"
      >
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
              className="border p-2 w-full bg-white rounded-xl dark:bg-gray-700 dark:text-white"
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
              className={`border p-2 w-full  bg-white rounded-xl dark:bg-gray-700 dark:text-white`}
              disabled={isReadOnly}
            />
          </div>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="startDate">Start Date</Label>
            <DatePicker
              selected={formData.startDate}
              onChange={(date) =>
                setFormData((prev) => ({ ...prev, startDate: date! }))
              }
              showTimeSelect
              dateFormat="Pp"
              placeholderText="Select start date and time"
              className="border p-2 w-full  bg-white rounded-xl dark:bg-gray-700 dark:text-white"
              disabled={isReadOnly}
              required
            />
          </div>
          <div>
            <Label htmlFor="endDate">End Date</Label>
            <DatePicker
              selected={formData.endDate}
              onChange={(date) =>
                setFormData((prev) => ({ ...prev, endDate: date! }))
              }
              showTimeSelect
              dateFormat="Pp"
              placeholderText="Select end date and time"
              className="border p-2 w-full  bg-white rounded-xl dark:bg-gray-700 dark:text-white"
              required
              disabled= {isReadOnly}
            />
          </div>
        </div>

        {/* Timezone and Audience */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="timezone">Timezone</Label>
            <Select
              onValueChange={(value) => handleSelectChange('timezone', value)}
              disabled={isReadOnly}
              value={formData.timezone}
            >
              <SelectTrigger className=" bg-white rounded-xl dark:bg-gray-700 dark:text-white">
                <SelectValue placeholder="Select a timezone" />
              </SelectTrigger>
              <SelectContent className=" bg-white rounded-xl dark:bg-gray-700 dark:text-white">
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
            <Select
              onValueChange={(value) => handleSelectChange('audience', value)}
              value={formData.audience}
              disabled={isReadOnly}
            >
              <SelectTrigger className=" bg-white rounded-xl dark:bg-gray-700 dark:text-white">
                <SelectValue placeholder={selectedListName} />
              </SelectTrigger>
              <SelectContent className=" bg-white rounded-xl dark:bg-gray-700 dark:text-white">
                {lists.map((list) => (
                  <SelectItem key={list.id} value={list.id}>
                    {list.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Budget and Allocation */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
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
              className="border p-2 w-full  bg-white rounded-xl dark:bg-gray-700 dark:text-white"
              disabled={isReadOnly}
            />
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
              className="border p-2 w-full  bg-white rounded-xl dark:bg-gray-700 dark:text-white"
              disabled={isReadOnly}
            />
          </div>
        </div>

        {/* UTM Parameters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="utmSource">UTM Source</Label>
            <Input
              id="utmSource"
              name="utmSource"
              type="text"
              placeholder="Enter UTM Source"
              value={formData.utmSource}
              onChange={handleChange}
              className="border p-2 w-full  bg-white rounded-xl dark:bg-gray-700 dark:text-white"
              disabled={isReadOnly}
            />
          </div>
          <div>
            <Label htmlFor="utmMedium">UTM Medium</Label>
            <Input
              id="utmMedium"
              name="utmMedium"
              type="text"
              placeholder="Enter UTM Medium"
              value={formData.utmMedium}
              onChange={handleChange}
              className="border p-2 w-full  bg-white rounded-xl dark:bg-gray-700 dark:text-white"
              disabled={isReadOnly}
            />
          </div>
        </div>

        {/* UTM Campaign and Country */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="utmCampaign">UTM Campaign</Label>
            <Input
              id="utmCampaign"
              name="utmCampaign"
              type="text"
              placeholder="Enter UTM Campaign"
              value={formData.utmCampaign}
              onChange={handleChange}
              className="border p-2 w-full  bg-white rounded-xl dark:bg-gray-700 dark:text-white"
              disabled={isReadOnly}
            />
          </div>
          <div className="flex flex-col">
            <Label htmlFor="countryCode">Country</Label>
            <select
              value={defaultCountry.name}
              onChange={handleCountryChange}
              name="countryCode"
              id="countryCode"
              className="border p-2 w-full  bg-white rounded-xl dark:bg-gray-700 dark:text-white"
              required
              disabled={isReadOnly}
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
        </div>

        {/* Schedule and Agent */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="schedule">Schedule</Label>
            <Select
              onValueChange={(value) => handleSelectChange('schedule', value)}
              value={formData.schedule}
              disabled={isReadOnly}
            >
              <SelectTrigger className=" bg-white rounded-xl dark:bg-gray-700 dark:text-white">
                <SelectValue placeholder={selectedScheduleName} />
              </SelectTrigger>
              <SelectContent className=" bg-white rounded-xl dark:bg-gray-700 dark:text-white">
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
            <Select
              onValueChange={(value) => handleSelectChange('agent', value)}
              value={formData.agent}
              disabled={isReadOnly}
            >
              <SelectTrigger className=" bg-white rounded-xl dark:bg-gray-700 dark:text-white">
                <SelectValue placeholder={selectedAgentName} />
              </SelectTrigger>
              <SelectContent className=" bg-white rounded-xl dark:bg-gray-700 dark:text-white">
                {agents.map((agent) => (
                  <SelectItem key={agent.id} value={agent.id}>
                    {agent.agent_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full bg-blue-600 text-white hover:bg-blue-700 transition duration-200 rounded-2xl"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Editing Campaign...' : 'Edit Campaign'}
        </Button>
      </form>
    </div>
  );
};

export default EditCampaign;
