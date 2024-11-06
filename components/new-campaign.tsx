"use client";

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
import { getUser } from "@/utils/supabase/queries";
// import { createClient } from '@/app/server.server';

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
  { value: 'America/LA', label: 'Pacific Time (PT)' },
  { value: 'Europe/London', label: 'London' },
  { value: 'Europe/Paris', label: 'Paris' },
  { value: 'Asia/Tokyo', label: 'Tokyo' },
  { value: 'Australia/Sydney', label: 'Sydney' }
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
    agent: ''
  });

  const [lists, setLists] = useState<{ id: string; name: string }[]>([]);
  const [schedules, setSchedules] = useState<{ id: string; name: string }[]>([]);
  const [agents, setAgents] = useState<{ id: string; agent_name: string }[]>([]);


  useEffect(() => {
    const fetchData = async () => {
      try {
        const listsResponse = await supabase
          .from('lists')
          .select('id, name')
          .eq('user_id', userId);

        if (listsResponse.error) toast.error('Error fetching lists');
        else setLists(listsResponse.data || []);

        const schedulesResponse = await supabase
          .from('schedules')
          .select('id, name')
          .eq('user_id', userId);

        if (schedulesResponse.error) toast.error('Error fetching schedules');
        else setSchedules(schedulesResponse.data || []);

        const agentsResponse = await supabase
          .from('agents')
          .select('id, agent_name');

        if (agentsResponse.error) toast.error('Error fetching agents');
        else setAgents(agentsResponse.data || []);
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

      const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.startDate >= formData.endDate) {
          toast.error('End date must be after the start date');
          return;
        }

        const { error } = await supabase.from('campaigns').insert([
          {
            name: formData.name,
            description: formData.description || null,
            start_date: formData.startDate.toISOString(),
            end_date: formData.endDate.toISOString(),
            start_timezone: formData.timezone || null,
            end_timezone: formData.timezone || null,
            audience: formData.audience || null,
            schedule: formData.schedule || null,
            agent: formData.agent || null,
            budget: formData.budget || null,
            allocation: formData.allocation || null,
            utm_source: formData.utmSource || null,
            utm_medium: formData.utmMedium || null,
            utm_campaign: formData.utmCampaign || null,
            user_id: userId,
            country_code: defaultCountry.code,
          },
        ]);

        if (error) toast.error(`Error saving campaign: ${error.message}`);
        else toast.success('New Campaign created successfully');
      };

  const selectedListName = lists.find(list => list.id === formData.audience)?.name || 'Select a list';
  const selectedScheduleName = schedules.find(schedule => schedule.id === formData.schedule)?.name || 'Select a schedule';
  const selectedAgentName = agents.find(agent => agent.id === formData.agent)?.agent_name || 'Select an agent';

      const handleCountryChange = async (event: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedCountry = event.target.value;
        const countryCode = countryCodes[selectedCountry];
        setDefaultCountry({ name: selectedCountry, code: countryCode });

        const { error } = await supabase
          .from('user_country_settings')
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
      <h1 className="text-3xl font-bold mb-6 text-center">New Campaign</h1>
      <form onSubmit={handleSubmit} className="space-y-6 bg-black shadow-md rounded-lg p-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="name">Campaign Name</Label>
            <Input id="name" name="name" type="text" placeholder="Enter campaign name" value={formData.name} onChange={handleChange} className="border rounded-lg p-2" />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" name="description" placeholder="Enter campaign description" value={formData.description} onChange={handleChange} className="border rounded-lg p-2" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="startDate">Start Date</Label>
            <DatePicker
              selected={formData.startDate}
              onChange={(date) => setFormData(prev => ({ ...prev, startDate: date! }))}
              showTimeSelect
              dateFormat="Pp"
              placeholderText="Select start date and time"
              className="border rounded-lg p-2 w-full"
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
              className="border rounded-lg p-2 w-full"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="timezone">Timezone</Label>
            <Select onValueChange={handleTimezoneChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select a timezone" />
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
            <Select onValueChange={handleSelectChange}>
              <SelectTrigger>
                <SelectValue placeholder={selectedListName} />
              </SelectTrigger>
              <SelectContent>
                {lists.map((list) => (
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
            <Label htmlFor="budget">Budget</Label>
            <Input id="budget" name="budget" type="text" placeholder="Enter budget" value={formData.budget} onChange={handleChange} className="border rounded-lg p-2" />
          </div>
          <div>
            <Label htmlFor="allocation">Allocation</Label>
            <Input id="allocation" name="allocation" type="text" placeholder="Enter allocation" value={formData.allocation} onChange={handleChange} className="border rounded-lg p-2" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="utmSource">UTM Source</Label>
            <Input id="utmSource" name="utmSource" type="text" placeholder="Enter UTM Source" value={formData.utmSource} onChange={handleChange} className="border rounded-lg p-2" />
          </div>
          <div>
            <Label htmlFor="utmMedium">UTM Medium</Label>
            <Input id="utmMedium" name="utmMedium" type="text" placeholder="Enter UTM Medium" value={formData.utmMedium} onChange={handleChange} className="border rounded-lg p-2" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="utmCampaign">UTM Campaign</Label>
            <Input id="utmCampaign" name="utmCampaign" type="text" placeholder="Enter UTM Campaign" value={formData.utmCampaign} onChange={handleChange} className="border rounded-lg p-2" />
          </div>
          <select value={defaultCountry.name} onChange={handleCountryChange} name="countryCode">
              <option value="US">United States</option>
              <option value="IN">India</option>
              <option value="FR">France</option>
              <option value="UK">United Kingdom</option>
              <option value="DE">Germany</option>
              <option value="ES">Spain</option>
              <option value="IT">Italy</option>
            </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="schedule">Schedule</Label>
            <Select onValueChange={handleScheduleChange}>
              <SelectTrigger>
                <SelectValue placeholder={selectedScheduleName} />
              </SelectTrigger>
              <SelectContent>
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
            <Select onValueChange={handleAgentChange}>
              <SelectTrigger>
                <SelectValue placeholder={selectedAgentName} />
              </SelectTrigger>
              <SelectContent>
                {agents.map((agent) => (
                  <SelectItem key={agent.id} value={agent.id}>
                    {agent.agent_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button type="submit" className="w-full bg-blue-600 text-white hover:bg-blue-700 transition duration-200">Create Campaign</Button>
      </form>
    </div>
  );
}



// 'use client';

// import { useState, useEffect } from 'react';
// import { Label } from '@/components/ui/NewCampaign/label';
// import { Input } from '@/components/ui/input';
// import { Textarea } from '@/components/ui/NewCampaign/textarea';
// import {
//   Select,
//   SelectTrigger,
//   SelectValue,
//   SelectContent,
//   SelectItem,
// } from '@/components/ui/NewCampaign/select';
// import { Button } from '@/components/ui/NewCampaign/button';
// import { createClient } from '@supabase/supabase-js';
// import { toast, ToastContainer } from 'react-toastify';
// // import 'react-toastify/dist/react-toastify.css';
// import DatePicker from 'react-datepicker';
// import 'react-datepicker/dist/react-datepicker.css';
// import { useCountry } from '@/context/CountryContext';

// // Initialize Supabase client
// const supabase = createClient(
//   process.env.NEXT_PUBLIC_SUPABASE_URL!,
//   process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
// );

// // Type for new campaign props
// interface NewCampaignProps {
//   userId: string;
// }

// // Country and timezone mappings
// const countryCodes: Record<string, string> = {
//   US: '+1',
//   IN: '+91',
//   FR: '+33',
//   UK: '+44',
//   DE: '+49',
//   ES: '+34',
//   IT: '+39',
// };

// const timezones = [
//   { value: 'UTC', label: 'UTC' },
//   { value: 'America/New_York', label: 'Eastern Time (ET)' },
//   { value: 'America/Chicago', label: 'Central Time (CT)' },
//   { value: 'America/Denver', label: 'Mountain Time (MT)' },
//   { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
//   { value: 'Europe/London', label: 'London' },
//   { value: 'Europe/Paris', label: 'Paris' },
//   { value: 'Asia/Tokyo', label: 'Tokyo' },
//   { value: 'Australia/Sydney', label: 'Sydney' },
// ];

// export function NewCampaign({ userId }: NewCampaignProps) {
//   const { defaultCountry, setDefaultCountry } = useCountry();
//   const [formData, setFormData] = useState({
//     name: '',
//     description: '',
//     startDate: new Date(),
//     endDate: new Date(),
//     timezone: '',
//     audience: '',
//     budget: '',
//     allocation: '',
//     utmSource: '',
//     utmMedium: '',
//     utmCampaign: '',
//     schedule: '',
//     agent: '',
//   });

//   const [lists, setLists] = useState<{ id: string; name: string }[]>([]);
//   const [schedules, setSchedules] = useState<{ id: string; name: string }[]>([]);
//   const [agents, setAgents] = useState<{ id: string; agent_name: string }[]>([]);

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const [listsResponse, schedulesResponse, agentsResponse] = await Promise.all([
//           supabase.from('lists').select('id, name').eq('user_id', userId),
//           supabase.from('schedules').select('id, name').eq('user_id', userId),
//           supabase.from('agents').select('id, agent_name'),
//         ]);

//         if (listsResponse.error) toast.error('Error fetching lists');
//         else setLists(listsResponse.data || []);

//         if (schedulesResponse.error) toast.error('Error fetching schedules');
//         else setSchedules(schedulesResponse.data || []);

//         if (agentsResponse.error) toast.error('Error fetching agents');
//         else setAgents(agentsResponse.data || []);
//       } catch (error) {
//         toast.error('Error fetching data');
//       }
//     };

//     fetchData();
//   }, [userId]);

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
//     const { name, value } = e.target;
//     setFormData(prevData => ({
//       ...prevData,
//       [name]: value,
//     }));
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (formData.startDate >= formData.endDate) {
//       toast.error('End date must be after the start date');
//       return;
//     }

//     const { error } = await supabase.from('campaigns').insert([
//       {
//         name: formData.name,
//         description: formData.description || null,
//         start_date: formData.startDate.toISOString(),
//         end_date: formData.endDate.toISOString(),
//         start_timezone: formData.timezone || null,
//         end_timezone: formData.timezone || null,
//         audience: formData.audience || null,
//         schedule: formData.schedule || null,
//         agent: formData.agent || null,
//         budget: formData.budget || null,
//         allocation: formData.allocation || null,
//         utm_source: formData.utmSource || null,
//         utm_medium: formData.utmMedium || null,
//         utm_campaign: formData.utmCampaign || null,
//         user_id: userId,
//         country_code: defaultCountry.code,
//       },
//     ]);

//     if (error) toast.error(`Error saving campaign: ${error.message}`);
//     else toast.success('New Campaign created successfully');
//   };

//   const handleCountryChange = async (event: React.ChangeEvent<HTMLSelectElement>) => {
//     const selectedCountry = event.target.value;
//     const countryCode = countryCodes[selectedCountry];
//     setDefaultCountry({ name: selectedCountry, code: countryCode });

//     const { error } = await supabase
//       .from('user_country_settings')
//       .update({ campaign_country_name: selectedCountry, campaign_country_code: countryCode })
//       .eq('user_id', userId);

//     if (error) {
//       console.error('Error updating country in Supabase:', error.message);
//       window.alert('Error updating country. Please try again.');
//     }
//   };

//   return (
//     <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
//       <ToastContainer />
//       <h1 className="text-3xl font-bold mb-6 text-center">New Campaign</h1>
//       <form onSubmit={handleSubmit} className="space-y-6 bg-black shadow-md rounded-lg p-8">
//         {/* Campaign Info */}
//         <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
//           <div>
//             <Label htmlFor="name">Campaign Name</Label>
//             <Input id="name" name="name" type="text" value={formData.name} onChange={handleChange} className="border rounded-lg p-2" />
//           </div>
//           <div>
//             <Label htmlFor="description">Description</Label>
//             <Textarea id="description" name="description" value={formData.description} onChange={handleChange} className="border rounded-lg p-2" />
//           </div>
//         </div>
        
//         {/* Country and Additional Selections */}
//         <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
//           <select value={defaultCountry.name} onChange={handleCountryChange} name="countryCode">
//             <option value="US">United States</option>
//             <option value="IN">India</option>
//             <option value="FR">France</option>
//             <option value="UK">United Kingdom</option>
//             <option value="DE">Germany</option>
//             <option value="ES">Spain</option>
//             <option value="IT">Italy</option>
//           </select>
//           <Button type="submit" className="w-full bg-blue-600 text-white hover:bg-blue-700 transition duration-200">Create Campaign</Button>
//         </div>
//       </form>
//     </div>
//   );
// }
