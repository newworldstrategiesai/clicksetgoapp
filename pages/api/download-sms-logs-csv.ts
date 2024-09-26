import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/utils/supabaseClient';

// Utility function to generate a CSV from logs
const generateCSV = (logs: any[]) => {
  const csvHeaders = ['ID', 'From', 'To', 'Message', 'Date Sent'].join(',');
  const csvRows = logs.map(log => [
    log.id || '',
    log.from || '',
    log.to || '',
    `"${log.body.replace(/"/g, '""')}"`, // Wrap message body in quotes to handle commas and escape quotes
    log.dateSent || ''
  ].join(','));
  return [csvHeaders, ...csvRows].join('\n');
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    // Fetch all SMS logs from Supabase
    let allLogs: any[] = [];
    let pageToken: string | null = null;

    do {
      const { data, error, next_page_token } = await supabase
        .from('sms_logs')
        .select('*')
        .range(pageToken ? pageToken : 0, 100); // Fetch in batches, adjust batch size as needed

      if (error) {
        console.error('Error fetching SMS logs:', error);
        return res.status(500).json({ error: 'Error fetching SMS logs' });
      }

      allLogs = [...allLogs, ...data];

      pageToken = next_page_token || null;
    } while (pageToken);

    // Generate CSV from the logs
    const csvContent = generateCSV(allLogs);

    // Send CSV as a file response
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="sms_logs.csv"');
    res.status(200).send(csvContent);
  } catch (error) {
    console.error('Error generating CSV:', error);
    res.status(500).json({ error: 'Error generating CSV' });
  }
}
