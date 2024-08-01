import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import { ChartOptions } from 'chart.js';
import 'chart.js/auto';
import 'chartjs-adapter-date-fns';

// Define the SMS data interface
interface SMSData {
  date: Date;
  direction: string;
}

const SMSChart = () => {
  const [smsData, setSmsData] = useState<SMSData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSMSData = async () => {
      try {
        const response = await fetch('/api/get-sms-data');
        const data = await response.json();

        if (!Array.isArray(data.messages)) {
          throw new Error('Unexpected data format: Expected an array');
        }

        console.log('Fetched SMS data:', data);

        const formattedData: SMSData[] = data.messages.map((sms: any) => ({
          date: new Date(sms.dateSent),
          direction: sms.direction,
        }));

        setSmsData(formattedData);
      } catch (error) {
        setError('Failed to fetch SMS data');
      } finally {
        setLoading(false);
      }
    };

    fetchSMSData();
  }, []);

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  // Group and count SMS data by date
  const groupedData = smsData.reduce<{ [key: string]: { sent: number; received: number } }>((acc, sms) => {
    const dateKey = sms.date.toISOString().split('T')[0]; // Group by date
    if (!acc[dateKey]) {
      acc[dateKey] = { sent: 0, received: 0 };
    }
    if (sms.direction === 'outbound') {
      acc[dateKey].sent += 1;
    } else if (sms.direction === 'inbound') {
      acc[dateKey].received += 1;
    }
    return acc;
  }, {});

  const dates = Object.keys(groupedData).map(date => new Date(date));
  const sentSMS = dates.map(date => groupedData[date.toISOString().split('T')[0]].sent);
  const receivedSMS = dates.map(date => groupedData[date.toISOString().split('T')[0]].received);

  const data = {
    labels: dates,
    datasets: [
      {
        label: 'Sent SMS',
        data: dates.map((date, index) => ({ x: date, y: sentSMS[index] })),
        fill: true,
        borderColor: 'rgba(75,192,192,1)',
        backgroundColor: 'rgba(75,192,192,0.2)',
      },
      {
        label: 'Received SMS',
        data: dates.map((date, index) => ({ x: date, y: receivedSMS[index] })),
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
        title: {
          display: true,
          text: 'Date',
        },
      },
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Number of SMS',
        },
      },
    },
  };

  return <Line data={data} options={options} />;
};

export default SMSChart;
