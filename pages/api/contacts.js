import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const filePath = path.join(process.cwd(), 'data', 'Corrected_Contacts.csv');
      const fileContents = fs.readFileSync(filePath, 'utf8');

      Papa.parse(fileContents, {
        header: true,
        complete: (results) => {
          const contacts = results.data.map(contact => ({
            first_name: contact['First-name'],
            last_name: contact['Last-name'],
            phone: contact['Phone'],
            email_address: contact['Email']
          }));
          res.status(200).json(contacts);
        },
        error: (error) => {
          res.status(500).json({ error: 'Error parsing CSV' });
        },
      });
    } catch (error) {
      res.status(500).json({ error: 'Error reading file' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
