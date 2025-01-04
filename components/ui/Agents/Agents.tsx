// components/ui/AgentsPage.tsx

"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PlusCircle } from "lucide-react";
import { AgentEditor } from "@/components/agents/agent-editor";
import { AgentList } from "@/components/agents/agent-list";
import { supabase } from "@/utils/supabaseClient";
import { VoiceAgent, Tables } from "@/lib/types"; // Ensure this interface matches the structure from Supabase

interface AgentsPageProps {
  userId: string; // Accept the userId as a prop
}

export default function AgentsPage({ userId }: AgentsPageProps) {
  const [agents, setAgents] = useState<VoiceAgent[]>([]);
  const [showEditor, setShowEditor] = useState(false);
  const [agentId, setAgentId] = useState<string | null>(null); // Store the current agent ID for editing

  // Fetch agents data from Supabase on component load
  useEffect(() => {
    const fetchAgents = async () => {
      const { data, error } = await supabase
        .from('agents') // No need to specify generics
        .select("*")
        .eq("user_id", userId) // Use the passed userId prop
        .order("created_at", { ascending: false }); // Order by creation date, or as needed

      if (error) {
        console.error("Error fetching agents:", error);
        return;
      }

      if (data) {
        // Map Supabase data to VoiceAgent interface
        const mappedAgents: VoiceAgent[] = data.map((agent) => ({
          id: agent.id,
          name: agent.agent_name,
          description: agent.company_description || "No Description",
          active: agent.active ?? false,
          prompts: agent.prompts || {
            greeting: "Hello!",
            fallback: "Sorry, I didn't catch that.",
            closing: "Goodbye!",
          },
          personality: agent.personality || "Friendly",
          useCase: agent.useCase || "General Assistance",
          voiceId: agent.voiceId || "default-voice-id",
          createdAt: agent.created_at ? new Date(agent.created_at) : new Date(),
          updatedAt: agent.updated_at ? new Date(agent.updated_at) : new Date(),
          user_id: agent.user_id,
        }));

        setAgents(mappedAgents); // Set the agents data in the state
      }
    };

    fetchAgents();
  }, [userId]);

  // Save new or edited agent
  const handleSaveAgent = async (agent: VoiceAgent) => {
    if (!agent.user_id) {
      console.error("User ID is required");
      alert("User ID is required.");
      return;
    }

    const agentData = {
      agent_name: agent.name,
      company_description: agent.description,
      active: agent.active,
      prompts: agent.prompts,
      personality: agent.personality,
      useCase: agent.useCase,
      voiceId: agent.voiceId,
      updated_at: new Date().toISOString(),
      // Include other necessary fields based on your database schema
    };

    try {
      if (agentId) {
        // Update existing agent
        const { error: updateError } = await supabase
          .from('agents')
          .update(agentData)
          .eq("id", agentId);

        if (updateError) {
          throw updateError;
        }

        // Update the agent in the local state
        setAgents((prev) =>
          prev.map((a) =>
            a.id === agentId
              ? { ...a, ...agent, updatedAt: new Date() }
              : a
          )
        );
        alert("Agent data updated successfully!");
      } else {
        // Insert new agent
        const { data: insertData, error: insertError } = await supabase
          .from('agents')
          .insert([
            {
              user_id: userId,
              agent_name: agent.name,
              company_description: agent.description,
              active: agent.active,
              prompts: agent.prompts,
              personality: agent.personality,
              useCase: agent.useCase,
              voiceId: agent.voiceId,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              // Include other necessary fields based on your database schema
            },
          ])
          .select();

        if (insertError) {
          throw insertError;
        }

        if (insertData && insertData.length > 0) {
          const newAgent: VoiceAgent = {
            id: insertData[0].id,
            name: insertData[0].agent_name,
            description: insertData[0].company_description || "No Description",
            active: insertData[0].active ?? false,
            prompts: insertData[0].prompts || {
              greeting: "Hello!",
              fallback: "Sorry, I didn't catch that.",
              closing: "Goodbye!",
            },
            personality: insertData[0].personality || "Friendly",
            useCase: insertData[0].useCase || "General Assistance",
            voiceId: insertData[0].voiceId || "default-voice-id",
            createdAt: insertData[0].created_at
              ? new Date(insertData[0].created_at)
              : new Date(),
            updatedAt: insertData[0].updated_at
              ? new Date(insertData[0].updated_at)
              : new Date(),
            user_id: insertData[0].user_id,
          };

          setAgents((prev) => [newAgent, ...prev]); // Add the new agent to the top of the list
          alert("Agent created successfully!");
        }
      }

      setShowEditor(false); // Close editor after saving
      setAgentId(null); // Reset agentId after saving
    } catch (error: any) {
      console.error("Error saving agent data:", error.message);
      alert("There was an error saving the agent data.");
    }
  };

  // Toggle agent active status
  const handleToggleAgent = async (agentId: string) => {
    const agent = agents.find((a) => a.id === agentId);
    if (!agent) return;

    const updatedAgent = { ...agent, active: !agent.active };
    const { error } = await supabase
      .from('agents')
      .update({ active: updatedAgent.active, updated_at: new Date().toISOString() })
      .eq("id", agentId);

    if (error) {
      console.error("Error toggling agent status:", error);
      alert("There was an error toggling the agent status.");
      return;
    }

    setAgents((prev) =>
      prev.map((a) => (a.id === agentId ? { ...a, active: updatedAgent.active } : a))
    );
    alert(`Agent is now ${updatedAgent.active ? "Active" : "Inactive"}.`);
  };

  // Delete agent from database
  const handleDeleteAgent = async (agentId: string) => {
    if (!window.confirm("Are you sure you want to delete this agent?")) {
      return;
    }

    const { error } = await supabase
      .from('agents')
      .delete()
      .eq("id", agentId);

    if (error) {
      console.error("Error deleting agent:", error);
      alert("There was an error deleting the agent.");
      return;
    }

    setAgents((prev) => prev.filter((agent) => agent.id !== agentId));
    alert("Agent deleted successfully!");
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Voice Agents</h1>
          <p className="text-muted-foreground mt-2">
            Configure and manage your AI voice assistants
          </p>
        </div>
        <Button onClick={() => setShowEditor(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          New Agent
        </Button>
      </div>

      <div className="grid gap-6">
        <Card className="p-6">
          <AgentList
            agents={agents}
            onToggle={handleToggleAgent}
            onDelete={handleDeleteAgent}
          />
        </Card>
      </div>

      <AgentEditor
        open={showEditor}
        onOpenChange={setShowEditor}
        onSave={handleSaveAgent}
        initialData={
          agentId
            ? agents.find((agent) => agent.id === agentId) || undefined
            : undefined
        }
      />
    </div>
  );
}
