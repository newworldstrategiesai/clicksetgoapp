// components/NewCampaign.tsx

'use client';

import React, { useState, useEffect, useCallback } from "react";
import { Label } from "@/components/ui/NewCampaign/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/NewCampaign/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/NewCampaign/select";
import { Button } from "@/components/ui/NewCampaign/button";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useCountry } from "@/context/CountryContext";
import axios from 'axios';
import { supabase } from "@/utils/supabaseClient";

interface NewCampaignProps {
  userId: string;
}

const countryCodes: Record<string, string> = {
  US: "+1",
  IN: "+91",
  FR: "+33",
  UK: "+44",
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
  { value: 'Australia/Sydney', label: 'Sydney' }
];

interface TwilioNumber {
  sid: string;
  phoneNumber: string;
}

interface Voice {
  voice_id: string;
  name: string;
  gender: string;
  accent: string;
  preview_url: string;
}

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
    twilioNumber: '', // Added for Twilio number selection
    voice: '', // Added for Voice selection if needed
  });

  const [lists, setLists] = useState<{ id: string; name: string }[]>([]);
  const [schedules, setSchedules] = useState<{ id: string; name: string }[]>([]);
  const [agents, setAgents] = useState<{ id: string; agent_name: string }[]>([]);
  const [twilioNumbers, setTwilioNumbers] = useState<TwilioNumber[]>([]);
  const [voices, setVoices] = useState<Voice[]>([]); // State for voices
  const [isSubmitting, setIsSubmitting] = useState(false); // For loading state

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch Lists
        const listsResponse = await axios.post('/api/get-lists', { userId });
        if (listsResponse.data.error) {
          toast.error('Error fetching lists');
        } else {
          setLists(listsResponse.data.lists || []);
        }

        // Fetch Schedules
        const schedulesResponse = await axios.post('/api/get-schedules', { userId });
        if (schedulesResponse.data.error) {
          toast.error('Error fetching schedules');
        } else {
          setSchedules(schedulesResponse.data.schedules || []);
        }

        // Fetch Agents
        const agentsResponse = await axios.post('/api/get-agents', { userId });
        if (agentsResponse.data.error) {
          toast.error('Error fetching agents');
        } else {
          setAgents(agentsResponse.data.agents || []);
        }

        // Fetch Twilio Numbers
        const twilioResponse = await axios.post('/api/get-twilio-numbers', { userId });
        if (twilioResponse.data.error) {
          toast.error('Error fetching Twilio numbers');
        } else {
          setTwilioNumbers(twilioResponse.data.allNumbers || []);
          if (twilioResponse.data.allNumbers.length > 0) {
            setFormData(prev => ({ ...prev, twilioNumber: twilioResponse.data.allNumbers[0].phoneNumber }));
          }
        }

        // Fetch Voices (if applicable)
        const voicesResponse = await axios.post('/api/get-voices', { userId });
        if (voicesResponse.data.error) {
          toast.error('Error fetching voices');
        } else {
          setVoices(voicesResponse.data.voices || []);
          if (voicesResponse.data.voices.length > 0) {
            setFormData(prev => ({ ...prev, voice: voicesResponse.data.voices[0].voice_id }));
          }
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

  const handleTwilioNumberChange = (value: string) => {
    setFormData(prevData => ({
      ...prevData,
      twilioNumber: value
    }));
  };

  const handleVoiceChange = (value: string) => {
    setFormData(prevData => ({
      ...prevData,
      voice: value
    }));
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

    if (!formData.schedule) {
      toast.error('Please select a schedule');
      return;
    }

    if (!formData.twilioNumber) {
      toast.error('Please select a Twilio number');
      return;
    }

    // Optional: Add more validations as needed

    setIsSubmitting(true); // Start loading

    // Prepare data for insertion
    const insertData = {
      name: formData.name,
      description: formData.description || null,
      start_date: formData.startDate.toISOString(),
      end_date: formData.endDate.toISOString(),
      start_timezone: formData.timezone || null,
      end_timezone: formData.timezone || null, // Assuming end timezone is same as start
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
      twilio_number: formData.twilioNumber, // Assuming you have a column for Twilio number
      voice: formData.voice || null, // If voice is needed
      // Remove scheduled_at since it's calculated by the trigger
    };

    // Debugging: Log the data being sent
    console.log('Inserting Campaign:', insertData);

    try {
      const { data, error } = await supabase.from('campaigns').insert([insertData]);

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
          twilioNumber: twilioNumbers.length > 0 ? twilioNumbers[0].phoneNumber : '',
          voice: voices.length > 0 ? voices[0].voice_id : '',
        });
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
  const selectedTwilioNumber = twilioNumbers.find(number => number.phoneNumber === formData.twilioNumber)?.phoneNumber || 'Select a Twilio number';
  const selectedVoiceName = voices.find(voice => voice.voice_id === formData.voice)?.name || 'Select a voice';

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

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <ToastContainer />
      <h1 className="text-3xl font-bold mb-6 text-center text-white">New Campaign</h1>
      <form onSubmit={handleSubmit} className="space-y-6 bg-black shadow-md rounded-lg p-8">
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
              className="border rounded-lg p-2 w-full bg-gray-700 text-white"
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
              className="border rounded-lg p-2 w-full bg-gray-700 text-white"
            />
          </div>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="startDate">Start Date</Label>
            <DatePicker
              selected={formData.startDate}
              onChange={(date: Date | null) => {
                if (date) {
                  setFormData(prev => ({ ...prev, startDate: date }));
                }
              }}
              showTimeSelect
              dateFormat="Pp"
              placeholderText="Select start date and time"
              className="border rounded-lg p-2 w-full bg-gray-700 text-white"
              required
            />
          </div>
          <div>
            <Label htmlFor="endDate">End Date</Label>
            <DatePicker
              selected={formData.endDate}
              onChange={(date: Date | null) => {
                if (date) {
                  setFormData(prev => ({ ...prev, endDate: date }));
                }
              }}
              showTimeSelect
              dateFormat="Pp"
              placeholderText="Select end date and time"
              className="border rounded-lg p-2 w-full bg-gray-700 text-white"
              required
            />
          </div>
        </div>

        {/* Timezone and Audience */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="timezone">Timezone</Label>
            <Select onValueChange={handleTimezoneChange} value={formData.timezone}>
              <SelectTrigger className="bg-gray-700 text-white">
                <SelectValue placeholder="Select a timezone" />
              </SelectTrigger>
              <SelectContent className="bg-gray-700 text-white">
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
            <Select onValueChange={handleSelectChange} value={formData.audience}>
              <SelectTrigger className="bg-gray-700 text-white">
                <SelectValue placeholder={selectedListName} />
              </SelectTrigger>
              <SelectContent className="bg-gray-700 text-white">
                {lists.map((list) => (
                  <SelectItem key={list.id} value={list.id}>
                    {list.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Twilio Number and Voice Selection */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="twilioNumber">From (Twilio Number)</Label>
            <Select onValueChange={handleTwilioNumberChange} value={formData.twilioNumber}>
              <SelectTrigger className="bg-gray-700 text-white">
                <SelectValue placeholder={selectedTwilioNumber || 'Select a Twilio number'} />
              </SelectTrigger>
              <SelectContent className="bg-gray-700 text-white max-h-60 overflow-y-auto">
                {twilioNumbers.length > 0 ? (
                  twilioNumbers.map((number) => (
                    <SelectItem key={number.sid} value={number.phoneNumber}>
                      {number.phoneNumber}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="" disabled>
                    No Twilio numbers available
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="voice">Voice</Label>
            <Select
              onValueChange={handleVoiceChange}
              value={formData.voice}
            >
              <SelectTrigger className="bg-gray-700 text-white">
                <SelectValue placeholder={selectedVoiceName || 'Select a voice'} />
              </SelectTrigger>
              <SelectContent className="bg-gray-700 text-white">
                {voices.length > 0 ? (
                  voices.map((voice) => (
                    <SelectItem key={voice.voice_id} value={voice.voice_id}>
                      {voice.name} ({voice.gender}, {voice.accent})
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="" disabled>
                    No voices available
                  </SelectItem>
                )}
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
              className="border rounded-lg p-2 w-full bg-gray-700 text-white"
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
              className="border rounded-lg p-2 w-full bg-gray-700 text-white"
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
              className="border rounded-lg p-2 w-full bg-gray-700 text-white"
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
              className="border rounded-lg p-2 w-full bg-gray-700 text-white"
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
              className="border rounded-lg p-2 w-full bg-gray-700 text-white"
            />
          </div>
          <div className="flex flex-col">
            <Label htmlFor="countryCode">Country</Label>
            <select
              value={defaultCountry.name}
              onChange={handleCountryChange}
              name="countryCode"
              id="countryCode"
              className="border rounded-lg p-2 w-full bg-gray-700 text-white"
              required
            >
              <option value="US">United States</option>
              <option value="IN">India</option>
              <option value="FR">France</option>
              <option value="UK">United Kingdom</option>
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
            <Select onValueChange={handleScheduleChange} value={formData.schedule}>
              <SelectTrigger className="bg-gray-700 text-white">
                <SelectValue placeholder={selectedScheduleName} />
              </SelectTrigger>
              <SelectContent className="bg-gray-700 text-white">
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
              <SelectTrigger className="bg-gray-700 text-white">
                <SelectValue placeholder={selectedAgentName} />
              </SelectTrigger>
              <SelectContent className="bg-gray-700 text-white">
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
          className="w-full bg-blue-600 text-white hover:bg-blue-700 transition duration-200"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Creating Campaign...' : 'Create Campaign'}
        </Button>
      </form>
    </div>
  );
}
