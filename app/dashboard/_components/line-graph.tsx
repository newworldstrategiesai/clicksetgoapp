'use client';

import React, { useEffect, useState, useCallback } from 'react';
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
import { LineGraphProps, ChartData } from '@/types';
import moment from 'moment';

export function LineGraph({ userId, onDataFetched }: LineGraphProps) {
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [trendPercentage, setTrendPercentage] = useState(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [timePeriod, setTimePeriod] = useState('Day'); // Default to Day

  const fetchCallLogs = useCallback(async () => {
    setLoading(true);

    try {
      const response = await axios.get('/api/get-call-data', {
        params: {
          userId,
          timePeriod, // Pass the selected time period
        },
      });

      const callLogs = response.data;

      if (Array.isArray(callLogs) && callLogs.length > 0) {
        // Process the raw call logs and group by the selected time period
        const data = processCallLogs(callLogs);
        setChartData(data);
        calculateTrend(data);
        if (onDataFetched) {
          onDataFetched(data); // Pass data up to parent
        }
      } else {
        console.warn('No data returned for the selected period');
        setChartData([]); // Handle no data case
      }
    } catch (error: any) {
      console.error('Error fetching call logs:', error);
      setChartData([]); // Set empty data on error
    } finally {
      setLoading(false);
    }
  }, [userId, onDataFetched, timePeriod]);

  useEffect(() => {
    fetchCallLogs();
  }, [fetchCallLogs]);

  // Group the call logs based on the selected time period
  const processCallLogs = (callLogs: { startedAt: string; type: string }[]): ChartData[] => {
    const counts: { [key: string]: ChartData } = {};

    callLogs.forEach((log) => {
      const date = new Date(log.startedAt);

      // Skip invalid date logs
      if (isNaN(date.getTime())) return;

      let formattedDate;

      // Default to 'Day' if timePeriod is undefined
      const period = timePeriod || 'Day';

      if (period === 'Day') {
        formattedDate = moment(date).format('YYYY-MM-DD HH:00'); // Group by hour for day view
      } else if (period === 'Week') {
        formattedDate = moment(date).format('YYYY-MM-DD'); // Group by date for week view
      } else if (period === 'Month') {
        formattedDate = moment(date).format('YYYY-MM'); // Group by month for month view
      }

      if (!counts[formattedDate]) {
        counts[formattedDate] = { date: formattedDate, inbound: 0, outbound: 0 };
      }

      if (log.type === 'inboundPhoneCall') {
        counts[formattedDate].inbound += 1;
      } else if (log.type === 'outboundPhoneCall') {
        counts[formattedDate].outbound += 1;
      }
    });

    // Sort by date
    const sortedData = Object.values(counts).sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return dateA - dateB;
    });

    return sortedData;
  };

  const calculateTrend = (data: ChartData[]) => {
    if (data.length < 2) return;

    const lastPeriod = data[data.length - 1];
    const previousPeriod = data[data.length - 2];

    const totalLastPeriod = lastPeriod.inbound + lastPeriod.outbound;
    const totalPreviousPeriod = previousPeriod.inbound + previousPeriod.outbound;

    if (totalPreviousPeriod === 0) return;

    const trend = ((totalLastPeriod - totalPreviousPeriod) / totalPreviousPeriod) * 100;
    setTrendPercentage(Number(trend.toFixed(1)));
  };

  const handleTimePeriodChange = (period: string) => {
    setTimePeriod(period);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Call Volume Over Time</CardTitle>
        <CardDescription>
          Showing inbound and outbound calls for the last {timePeriod}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex space-x-4 mb-4">
          <button onClick={() => handleTimePeriodChange('Day')}>Day</button>
          <button onClick={() => handleTimePeriodChange('Week')}>Week</button>
          <button onClick={() => handleTimePeriodChange('Month')}>Month</button>
        </div>
        {loading && <p className="text-gray-500">Loading data...</p>}
        {!loading && chartData.length === 0 && (
          <p>No data available for the selected period</p>
        )}
        {!loading && chartData.length > 0 && (
          <div className="w-full h-[310px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tickFormatter={(value) => value.slice(5)}
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
        )}
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
              Last {timePeriod}
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
