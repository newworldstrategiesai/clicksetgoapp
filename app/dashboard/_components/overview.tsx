// app/dashboard/_components/bar-graph.tsx
import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface BarGraphProps {
  data: {
    date: string;
    inbound: number;
    outbound: number;
  }[];
}

export const BarGraph: React.FC<BarGraphProps> = ({ data }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Call Statistics</CardTitle>
        <CardDescription>Inbound vs Outbound Calls</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="inbound" fill="#8884d8" name="Inbound Calls" />
              <Bar dataKey="outbound" fill="#82ca9d" name="Outbound Calls" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};