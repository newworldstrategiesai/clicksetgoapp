// components/line-graph.jsx

'use client';

import React, { useEffect, useState } from 'react';
import { TrendingUp } from 'lucide-react';
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import axios from 'axios';

export function LineGraph() {
  // Define the type for chart data
  type ChartData = {
    month: string;
    inbound: number;
    outbound: number;
  };

  const [chartData, setChartData] = useState<ChartData[]>([]); // Specify the type here
  const [trendPercentage, setTrendPercentage] = useState(0);

  useEffect(() => {
    const fetchCallLogs = async () => {
      try {
        const response = await axios.get('/api/get-call-logs');
        const callLogs = response.data;
        const data = processCallLogs(callLogs);
        setChartData(data); // This should now match the expected type
        calculateTrend(data);
      } catch (error) {
        console.error('Error fetching call logs:', error);
      }
    };

    fetchCallLogs();
  }, []);

  const processCallLogs = (callLogs: { startedAt: string; type: string }[]): ChartData[] => { // Specify return type and parameter type
    // Define the type for counts
    const counts: { [key: string]: ChartData } = {}; // Specify the type here

    callLogs.forEach((log) => {
      const date = new Date(log.startedAt);
      const month = date.toLocaleString('default', { month: 'long' });
      const year = date.getFullYear();
      const monthYear = `${month} ${year}`;

      if (!counts[monthYear]) {
        counts[monthYear] = { month: monthYear, inbound: 0, outbound: 0 };
      }

      if (log.type === 'inboundPhoneCall') {
        counts[monthYear].inbound += 1;
      } else if (log.type === 'outboundPhoneCall') {
        counts[monthYear].outbound += 1;
      }
    });

    const sortedData = Object.values(counts).sort((a, b) => {
      const dateA = new Date(a.month).getTime();
      const dateB = new Date(b.month).getTime();
      return dateA - dateB;
    });

    const lastSixMonthsData = sortedData.slice(-6);

    return lastSixMonthsData;
  };

  const calculateTrend = (data: ChartData[]) => {
    if (data.length < 2) return;
    const lastMonth = data[data.length - 1];
    const previousMonth = data[data.length - 2];

    const totalLastMonth = lastMonth.inbound + lastMonth.outbound;
    const totalPreviousMonth = previousMonth.inbound + previousMonth.outbound;

    if (totalPreviousMonth === 0) return;

    const trend =
      ((totalLastMonth - totalPreviousMonth) / totalPreviousMonth) * 100;
    setTrendPercentage(Number(trend.toFixed(1)));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Call Volume Over Time</CardTitle>
        <CardDescription>
          Showing inbound and outbound calls for the last 6 months
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="w-full h-[310px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value) => value.split(' ')[0].slice(0, 3)}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1F2937',
                  borderColor: '#374151',
                }}
                labelStyle={{ color: '#D1D5DB' }}
                itemStyle={{ color: '#F9FAFB' }}
              />
              <Legend
                formatter={(value, entry) => (
                  <span style={{ color: entry.color }}>{value}</span>
                )}
              />
              <Line
                type="monotone"
                dataKey="inbound"
                stroke="#FBBF24" // Yellow color
                strokeWidth={2}
                dot={{ r: 4 }}
                name="Inbound"
              />
              <Line
                type="monotone"
                dataKey="outbound"
                stroke="#10B981" // Green color
                strokeWidth={2}
                dot={{ r: 4 }}
                name="Outbound"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
      <CardFooter>
        <div className="flex w-full items-start gap-2 text-sm">
          <div className="grid gap-2">
            <div className="flex items-center gap-2 font-medium leading-none">
              Trending {trendPercentage >= 0 ? 'up' : 'down'} by{' '}
              {Math.abs(trendPercentage)}% this month{' '}
              <TrendingUp className="h-4 w-4" />
            </div>
            <div className="flex items-center gap-2 leading-none text-muted-foreground">
              Last 6 Months
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
