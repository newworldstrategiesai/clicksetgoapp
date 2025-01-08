import { Resend } from 'resend';

const DEFAULT_RECIPIENT_EMAIL = 'ben@newworldstrategies.ai'; // Default recipient email
const resend = new Resend(process.env.RESEND_API_KEY);

// Define the CallReport interface
interface CallReport {
    call_id: string;
    type: string;
    status: string;
    ended_reason: string;
    summary: string;
    stereo_recording_url: string;
    customer_number: string;
    assistant_name: string;
    assistant_model: string;
    assistant_transcriber: string;
    assistant_voice_provider: string;
    assistant_voice_id: string;
    phone_number: string;
    timestamp: string;
}

export async function sendEmail(callReport: CallReport, email:string) {
  await resend.emails.send({
    from: 'info@clicksetgo.app',
    to: email,
    subject: 'Call Report',
    html: `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Call Report</title>
        <style>
            body {
                font-family: 'Arial', sans-serif;
                background-color: #0d0d0d;
                color: #e6e6e6;
                margin: 0;
                padding: 0;
                line-height: 1.6;
            }
            .container {
                max-width: 600px;
                margin: 20px auto;
                background-color: #1a1a1a;
                border-radius: 12px;
                overflow: hidden;
                box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
                padding: 20px;
            }
            h1 {
                color: #00c6ff;
                text-align: center;
                font-size: 24px;
                margin-bottom: 20px;
            }
            .report-section {
                margin-bottom: 15px;
            }
            .report-section:last-child {
                margin-bottom: 0;
            }
            .report-section strong {
                color: #00c6ff;
                font-size: 16px;
            }
            .report-section p {
                margin: 5px 0;
                padding-left: 10px;
                border-left: 4px solid #00c6ff;
                background-color: #1a1a1a;
                padding: 10px;
                border-radius: 8px;
            }
            .cta-button {
                display: inline-block;
                margin-top: 20px;
                background-color: #00c6ff;
                color: #0d0d0d;
                text-decoration: none;
                padding: 12px 20px;
                border-radius: 8px;
                text-align: center;
                font-weight: bold;
                transition: background-color 0.3s ease;
            }
            .cta-button:hover {
                background-color: #00a5cc;
            }
            .footer {
                margin-top: 30px;
                text-align: center;
                font-size: 14px;
                color: #666;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>Call Report</h1>
            <div class="report-section">
                <strong>Call ID:</strong>
                <p>${callReport.call_id}</p>
            </div>
            <div class="report-section">
                <strong>Type:</strong>
                <p>${callReport.type}</p>
            </div>
            <div class="report-section">
                <strong>Status:</strong>
                <p>${callReport.status}</p>
            </div>
            <div class="report-section">
                <strong>Ended Reason:</strong>
                <p>${callReport.ended_reason}</p>
            </div>
            <div class="report-section">
                <strong>Summary:</strong>
                <p>${callReport.summary}</p>
            </div>
            <div class="report-section">
                <strong>Stereo Recording URL:</strong>
                <p><a href="${callReport.stereo_recording_url}" style="color: #00c6ff;">Listen</a></p>
            </div>
            <div class="report-section">
                <strong>Customer Number:</strong>
                <p>${callReport.customer_number}</p>
            </div>
            <div class="report-section">
                <strong>Assistant Name:</strong>
                <p>${callReport.assistant_name}</p>
            </div>
            <div class="report-section">
                <strong>Assistant Model:</strong>
                <p>${callReport.assistant_model}</p>
            </div>
            <div class="report-section">
                <strong>Assistant Transcriber:</strong>
                <p>${callReport.assistant_transcriber}</p>
            </div>
            <div class="report-section">
                <strong>Assistant Voice Provider:</strong>
                <p>${callReport.assistant_voice_provider}</p>
            </div>
            <div class="report-section">
                <strong>Assistant Voice ID:</strong>
                <p>${callReport.assistant_voice_id}</p>
            </div>
            <div class="report-section">
                <strong>Phone Number:</strong>
                <p>${callReport.phone_number}</p>
            </div>
            <div class="report-section">
                <strong>Timestamp:</strong>
                <p>${callReport.timestamp}</p>
            </div>
            <div style="text-align: center;">
                <a href="${callReport.stereo_recording_url}" class="cta-button">Listen to Recording</a>
            </div>
            <div class="footer">
                <p>&copy; 2024 ClickSetGo. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
    `,
  });
}
