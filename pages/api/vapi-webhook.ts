import type { NextApiRequest, NextApiResponse } from 'next';
import { parse } from 'papaparse';
import fs from 'fs';
import path from 'path';

const AUTH_TOKEN = process.env.WEBHOOK_AUTH_TOKEN;

const parseCSV = (): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    const filePath = path.join(process.cwd(), 'data', 'Corrected_Contacts.csv');
    const fileContents = fs.readFileSync(filePath, 'utf8');

    parse(fileContents, {
      header: true,
      complete: (results) => {
        resolve(results.data);
      },
      error: (error) => {
        reject(error);
      },
    });
  });
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const authHeader = req.headers['authorization'];
  if (!authHeader || authHeader !== `Bearer ${AUTH_TOKEN}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const data = req.body;
  const phoneNumber = data.message?.customer?.number?.replace(/\D/g, '');

  try {
    const contacts = await parseCSV();
    const contact = contacts.find(
      (contact: any) => contact.phone.replace(/\D/g, '') === phoneNumber
    );

    const firstName = contact ? contact.first_name : 'Unknown';

    const responsePayload = {
      status: 'success',
      received: { firstName, phoneNumber },
    };

    res.status(200).json(responsePayload);
  } catch (error) {
    console.error('Error reading or parsing CSV:', error);
    res.status(500).json({ error: 'Error reading or parsing CSV' });
  }
}
