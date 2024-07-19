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
          console.log('Parsed CSV data:', results.data); // Log parsed data
          const contacts = results.data.map(contact => ({
            first_name: contact['First-name'],
            last_name: contact['Last-name'],
            phone: contact['Phone'],
            email_address: contact['Email']
          }));
          console.log('Mapped contacts:', contacts); // Log mapped contacts
          res.status(200).json(contacts);
        },
        error: (error) => {
          console.error('Error parsing CSV:', error);
          res.status(500).json({ error: 'Error parsing CSV' });
        },
      });
    } catch (error) {
      console.error('Error reading file:', error);
      res.status(500).json({ error: 'Error reading file' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
