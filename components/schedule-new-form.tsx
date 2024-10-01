"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/utils/supabaseClient"; // Ensure this import is correct

interface ScheduleNewFormProps {
  userId: string;
}

export function ScheduleNewForm({ userId }: ScheduleNewFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    monday_open: "09:00",
    monday_close: "17:00",
    tuesday_open: "09:00",
    tuesday_close: "17:00",
    wednesday_open: "09:00",
    wednesday_close: "17:00",
    thursday_open: "09:00",
    thursday_close: "17:00",
    friday_open: "09:00",
    friday_close: "17:00",
    saturday_open: "00:00", // Default time value
    saturday_close: "00:00", // Default time value
    sunday_open: "00:00", // Default time value
    sunday_close: "00:00", // Default time value
    created_at: new Date().toISOString(),
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value === "" ? null : value, // Handle empty values
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate time fields
      const validatedData = Object.fromEntries(
        Object.entries(formData).map(([key, value]) => [
          key,
          value === "" ? null : value,
        ])
      );

      const { error } = await supabase
        .from('schedules')
        .insert({
          ...validatedData,
          user_id: userId,
        });

      if (error) {
        throw error;
      }
      setSuccess(true);
      console.log('Schedule saved successfully');
    } catch (error) {
      console.error('Error saving schedule:', error);
      setError('Error saving schedule. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto mt-8">
      <CardHeader>
        <CardTitle>Schedule Management</CardTitle>
        <CardDescription>Create and manage your schedules.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="name">Schedule Name</Label>
            <Input
              id="name"
              name="name"
              placeholder="Enter schedule name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            {Object.keys(formData).filter(key => key !== "name" && key !== "created_at").map((key) => {
              const [day, time] = key.split('_');
              const label = `${day.charAt(0).toUpperCase() + day.slice(1)} ${time === 'open' ? 'Open' : 'Close'}`;

              return (
                <div key={key} className="space-y-2">
                  <Label htmlFor={key}>{label}</Label>
                  <Input
                    id={key}
                    name={key}
                    type="time"
                    value={formData[key] ?? ''}
                    onChange={handleChange}
                  />
                </div>
              );
            })}
          </div>
          <CardFooter>
            <Button type="submit" className="ml-auto" disabled={loading}>
              {loading ? 'Saving...' : 'Save Schedule'}
            </Button>
          </CardFooter>
        </form>
        {error && <p className="text-red-500">{error}</p>}
        {success && <p className="text-green-500">Schedule saved successfully!</p>}
      </CardContent>
    </Card>
  );
}
