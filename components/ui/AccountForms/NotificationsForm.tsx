'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import Button from '@/components/ui/Button/Button'; // Ensure this path is correct
import Card from '@/components/ui/Card/Card';
import {
  saveNotificationSettings,
  getUserNotificationSettings,
  NotificationSettings,
} from '@/utils/supabase/queries';
import { supabase } from '@/utils/supabaseClient'; // Ensure this path is correct
import { Switch } from '@headlessui/react'; // Using Headless UI for toggle switches

interface NotificationsFormProps {
  userId: string;
}

const NotificationsForm: React.FC<NotificationsFormProps> = ({ userId }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const defaultPreferences: NotificationSettings = {
    userId,
    emailInboundCalls: true,
    smsInboundCalls: false,
    emailOutboundCallCompletion: true,
    smsOutboundCalls: true,
    campaignEmailSummary: true,
    campaignSmsInitiation: true,
  };
  const [formValues, setFormValues] = useState<NotificationSettings>(defaultPreferences);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const settings = await getUserNotificationSettings(supabase, userId);
        if (settings) {
          setFormValues(settings);
        } else {
          // If no settings found, use default preferences and save them to the database
          setFormValues(defaultPreferences);
          await saveNotificationSettings(supabase, defaultPreferences);
        }
      } catch (error) {
        console.error('Error fetching notification settings:', error);
        toast.error('Failed to fetch notification settings.');
      }
    };

    fetchSettings();
  }, [userId]);

  const handleToggleChange = (name: string, value: boolean) => {
    setFormValues((prevValues) => ({
      ...prevValues,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      console.log('User ID:', userId);
      console.log('Updating notification settings with values:', formValues);

      const result = await saveNotificationSettings(supabase, formValues);

      console.log('Notification Settings save result:', result);

      if (result.success) {
        toast.success('Notification settings saved successfully!');
      } else {
        throw new Error(result.error || 'Unknown error occurred during saving.');
      }
    } catch (error: any) {
      if (error instanceof Error) {
        console.error('Error during notification settings save:', error);
        toast.error(`Failed to save notification settings: ${error.message}`);
      } else {
        console.error('Unexpected error:', error);
        toast.error('Failed to save notification settings: An unexpected error occurred.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card title="Notification Settings" description="Configure your notification preferences.">
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Inbound Calls Section */}
        <div>
          <h3 className="text-lg font-medium text-white">Inbound Calls</h3>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Email Notifications for Inbound Calls */}
            <div className="flex items-center justify-between">
              <label htmlFor="emailInboundCalls" className="text-sm text-white">
                Email notifications for inbound calls
              </label>
              <Switch
                checked={formValues.emailInboundCalls}
                onChange={(value) => handleToggleChange('emailInboundCalls', value)}
                className={`${
                  formValues.emailInboundCalls ? 'bg-blue-600' : 'bg-gray-400'
                } relative inline-flex h-6 w-11 items-center rounded-full`}
              >
                <span
                  className={`${
                    formValues.emailInboundCalls ? 'translate-x-6' : 'translate-x-1'
                  } inline-block h-4 w-4 transform bg-white rounded-full transition`}
                />
              </Switch>
            </div>
            {/* SMS Notifications for Inbound Calls */}
            <div className="flex items-center justify-between">
              <label htmlFor="smsInboundCalls" className="text-sm text-white">
                SMS notifications for inbound calls
              </label>
              <Switch
                checked={formValues.smsInboundCalls}
                onChange={(value) => handleToggleChange('smsInboundCalls', value)}
                className={`${
                  formValues.smsInboundCalls ? 'bg-blue-600' : 'bg-gray-400'
                } relative inline-flex h-6 w-11 items-center rounded-full`}
              >
                <span
                  className={`${
                    formValues.smsInboundCalls ? 'translate-x-6' : 'translate-x-1'
                  } inline-block h-4 w-4 transform bg-white rounded-full transition`}
                />
              </Switch>
            </div>
          </div>
        </div>

        {/* Outbound Calls Section */}
        <div>
          <h3 className="text-lg font-medium text-white">Outbound Calls</h3>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Email Notifications for Outbound Call Completions */}
            <div className="flex items-center justify-between">
              <label htmlFor="emailOutboundCallCompletion" className="text-sm text-white">
                Email notifications for outbound call completions
              </label>
              <Switch
                checked={formValues.emailOutboundCallCompletion}
                onChange={(value) => handleToggleChange('emailOutboundCallCompletion', value)}
                className={`${
                  formValues.emailOutboundCallCompletion ? 'bg-blue-600' : 'bg-gray-400'
                } relative inline-flex h-6 w-11 items-center rounded-full`}
              >
                <span
                  className={`${
                    formValues.emailOutboundCallCompletion ? 'translate-x-6' : 'translate-x-1'
                  } inline-block h-4 w-4 transform bg-white rounded-full transition`}
                />
              </Switch>
            </div>
            {/* SMS Notifications for Outbound Calls */}
            <div className="flex items-center justify-between">
              <label htmlFor="smsOutboundCalls" className="text-sm text-white">
                SMS notifications for outbound calls
              </label>
              <Switch
                checked={formValues.smsOutboundCalls}
                onChange={(value) => handleToggleChange('smsOutboundCalls', value)}
                className={`${
                  formValues.smsOutboundCalls ? 'bg-blue-600' : 'bg-gray-400'
                } relative inline-flex h-6 w-11 items-center rounded-full`}
              >
                <span
                  className={`${
                    formValues.smsOutboundCalls ? 'translate-x-6' : 'translate-x-1'
                  } inline-block h-4 w-4 transform bg-white rounded-full transition`}
                />
              </Switch>
            </div>
          </div>
        </div>

        {/* Campaign Notifications Section */}
        <div>
          <h3 className="text-lg font-medium text-white">Campaign Notifications</h3>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Email Summaries for Campaigns */}
            <div className="flex items-center justify-between">
              <label htmlFor="campaignEmailSummary" className="text-sm text-white">
                Email summaries for campaigns
              </label>
              <Switch
                checked={formValues.campaignEmailSummary}
                onChange={(value) => handleToggleChange('campaignEmailSummary', value)}
                className={`${
                  formValues.campaignEmailSummary ? 'bg-blue-600' : 'bg-gray-400'
                } relative inline-flex h-6 w-11 items-center rounded-full`}
              >
                <span
                  className={`${
                    formValues.campaignEmailSummary ? 'translate-x-6' : 'translate-x-1'
                  } inline-block h-4 w-4 transform bg-white rounded-full transition`}
                />
              </Switch>
            </div>
            {/* SMS Initiation for Campaigns */}
            <div className="flex items-center justify-between">
              <label htmlFor="campaignSmsInitiation" className="text-sm text-white">
                SMS initiation for campaigns
              </label>
              <Switch
                checked={formValues.campaignSmsInitiation}
                onChange={(value) => handleToggleChange('campaignSmsInitiation', value)}
                className={`${
                  formValues.campaignSmsInitiation ? 'bg-blue-600' : 'bg-gray-400'
                } relative inline-flex h-6 w-11 items-center rounded-full`}
              >
                <span
                  className={`${
                    formValues.campaignSmsInitiation ? 'translate-x-6' : 'translate-x-1'
                  } inline-block h-4 w-4 transform bg-white rounded-full transition`}
                />
              </Switch>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="pt-4 border-t border-gray-700">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save Notification Settings'}
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default NotificationsForm;
