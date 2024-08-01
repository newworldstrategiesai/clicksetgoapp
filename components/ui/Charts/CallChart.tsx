import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import { ChartOptions } from 'chart.js';
import 'chart.js/auto';
import 'chartjs-adapter-date-fns';

// Define the Call data interface
interface Call {
  date: Date;
  inbound: number;
  outbound: number;
}

const CallChart = () => {
  const [callData, setCallData] = useState<Call[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCallData = async () => {
      try {
        const response = await fetch('/api/get-call-data');
        const data = await response.json();

        if (!Array.isArray(data)) {
          throw new Error('Unexpected data format: Expected an array');
        }

        console.log('Fetched call data:', data);

        // Map the fetched data to the Call interface
        const formattedData: Call[] = data.map((call: any) => ({
          date: new Date(call.startedAt),  // Ensure date is a Date object
          inbound: call.type === 'inboundPhoneCall' ? 1 : 0,
          outbound: call.type === 'outboundPhoneCall' ? 1 : 0,
        }));

        setCallData(formattedData);
      } catch (error) {
        setError('Failed to fetch call data');
      } finally {
        setLoading(false);
      }
    };

    fetchCallData();
  }, []);

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  // Handle invalid dates
  const validCallData = callData.filter((call) => !isNaN(call.date.getTime()));

  // Aggregate the data
  const aggregateData = validCallData.reduce<{ [key: string]: { inbound: number; outbound: number } }>((acc, call) => {
    const dateKey = call.date.toISOString().split('T')[0]; // Group by date

    if (!acc[dateKey]) {
      acc[dateKey] = { inbound: 0, outbound: 0 };
    }

    acc[dateKey].inbound += call.inbound;
    acc[dateKey].outbound += call.outbound;

    return acc;
  }, {});

  const dates = Object.keys(aggregateData).map(date => new Date(date));
  const inboundCalls = Object.values(aggregateData).map(data => data.inbound);
  const outboundCalls = Object.values(aggregateData).map(data => data.outbound);

  const data = {
    labels: dates,
    datasets: [
      {
        label: 'Inbound Calls',
        data: dates.map((date, index) => ({ x: date, y: inboundCalls[index] })),
        fill: true,
        borderColor: 'rgba(75,192,192,1)',
        backgroundColor: 'rgba(75,192,192,0.2)',
      },
      {
        label: 'Outbound Calls',
        data: dates.map((date, index) => ({ x: date, y: outboundCalls[index] })),
        fill: true,
        borderColor: 'rgba(153,102,255,1)',
        backgroundColor: 'rgba(153,102,255,0.2)',
      },
    ],
  };

  // Define options with correct types
  const options: ChartOptions<'line'> = {
    scales: {
      x: {
        type: 'time',
        time: {
          unit: 'day',
          tooltipFormat: 'P',
        },
      },
      y: {
        beginAtZero: true,
      },
    },
  };

  return <Line data={data} options={options} />;
};

export default CallChart;
