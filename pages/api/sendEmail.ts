import { Resend } from 'resend';

const DEFAULT_RECIPIENT_EMAIL = 'ben@newworldstrategies.ai'; // Default recipient email/
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

export async function sendEmail(callReport: CallReport) {
    const emailData = await resend.emails.send({
        from: 'info@clicksetgo.app',
        to: DEFAULT_RECIPIENT_EMAIL,
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
                      background-color: #f5f7fa;
                      margin: 0;
                      padding: 20px;
                      line-height: 1.6;
                      color: #333;
                  }
                  .email-container {
                      max-width: 700px;
                      margin: 0 auto;
                      background-color: #ffffff;
                      border-radius: 16px;
                      overflow: hidden;
                      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                  }
                  .header {
                      background: linear-gradient(135deg, #00c6ff 0%, #0072ff 100%);
                      padding: 32px;
                      text-align: center;
                      color: white;
                  }
                  .header h1 {
                      margin: 0;
                      font-size: 28px;
                      font-weight: 600;
                  }
                  .timestamp {
                      color: rgba(255, 255, 255, 0.9);
                      font-size: 14px;
                      margin-top: 8px;
                  }
                  .content {
                      padding: 32px;
                  }
                  .section {
                      margin-bottom: 32px;
                  }
                  .section-title {
                      font-size: 18px;
                      font-weight: 600;
                      color: #00c6ff;
                      margin-bottom: 16px;
                      padding-bottom: 8px;
                      border-bottom: 2px solid #f0f4f8;
                  }
                  .info-grid {
                      display: grid;
                      grid-template-columns: repeat(2, 1fr);
                      gap: 20px;
                  }
                  .info-item {
                      background-color: #f8fafc;
                      padding: 16px;
                      border-radius: 8px;
                      border: 1px solid #e9ecef;
                  }
                  .info-label {
                      font-size: 14px;
                      color: #6b7280;
                      margin-bottom: 4px;
                  }
                  .info-value {
                      font-size: 15px;
                      color: #1a1a1a;
                      font-weight: 500;
                  }
                  .summary-box {
                      background-color: #f8fafc;
                      padding: 20px;
                      border-radius: 8px;
                      border: 1px solid #e9ecef;
                      margin-bottom: 24px;
                  }
                  .recording-section {
                      text-align: center;
                      padding: 24px;
                      background-color: #f8fafc;
                      border-radius: 8px;
                      margin-top: 24px;
                  }
                  .recording-button {
                      display: inline-block;
                      background: linear-gradient(135deg, #00c6ff 0%, #0072ff 100%);
                      color: white;
                      text-decoration: none;
                      padding: 14px 32px;
                      border-radius: 8px;
                      font-weight: 600;
                      transition: transform 0.2s;
                  }        
                  .recording-button:hover {
                      transform: translateY(-1px);
                  }
                  .footer {
                      text-align: center;
                      padding: 24px;
                      background-color: #f8fafc;
                      color: #6b7280;
                      font-size: 14px;
                      border-top: 1px solid #e9ecef;
                  }        
                  @media (max-width: 600px) {
                      .info-grid {
                          grid-template-columns: 1fr;
                      }
                      .content {
                          padding: 20px;
                      }

                  }
          </style>
          </head>
          <body>
          <div class="email-container">
          <div class="header">
          <h1>Call Report</h1>
          <div class="timestamp">${callReport.timestamp}</div>
          </div>
          
          <div class="content">
          <div class="section">
          <div class="section-title">Call Details</div>
          <div class="info-grid">
          <div class="info-item">
          <div class="info-label">Call ID</div>
          <div class="info-value">${callReport.call_id}</div>
          </div>
          <div class="info-item">
          <div class="info-label">Type</div>
          <div class="info-value">${callReport.type}</div>
          </div>
          <div class="info-item">
          <div class="info-label">Status</div>
          <div class="info-value">${callReport.status}</div>
          </div>
          <div class="info-item">
          <div class="info-label">Ended Reason</div>
          <div class="info-value">${callReport.ended_reason}</div>
          </div>
          </div>
          </div>
          
          <div class="section">
          <div class="section-title">Call Summary</div>
          <div class="summary-box">

           ${callReport.summary}
          </div>
          </div>
          
          <div class="section">
          <div class="section-title">Contact Information</div>
          <div class="info-grid">
          <div class="info-item">
          <div class="info-label">Customer Number</div>
          <div class="info-value">${callReport.customer_number}</div>
          </div>
          <div class="info-item">
          <div class="info-label">Phone Number</div>
          <div class="info-value">${callReport.phone_number}</div>
          </div>
          </div>
          </div>
          
          <div class="section">
          <div class="section-title">Assistant Information</div>
          <div class="info-grid">
          <div class="info-item">
          <div class="info-label">Assistant Name</div>
          <div class="info-value">${callReport.assistant_name}</div>
          </div>
          <div class="info-item">
          <div class="info-label">Assistant Model</div>
          <div class="info-value">${callReport.assistant_model}</div>
          </div>
          <div class="info-item">
          <div class="info-label">Assistant Transcriber</div>
          <div class="info-value">${callReport.assistant_transcriber}</div>
          </div>
          <div class="info-item">
          <div class="info-label">Assistant Voice Provider</div>
          <div class="info-value">${callReport.assistant_voice_provider}</div>
          </div>
          <div class="info-item">
          <div class="info-label">Assistant Voice ID</div>
          <div class="info-value">${callReport.assistant_voice_id}</div>
          </div>
          </div>
          </div>
          
          <div class="recording-section">
          <a href="${callReport.stereo_recording_url}" class="recording-button">

          Listen to Recording
          </a>
          </div>
          </div>
          
          <div class="footer">

          © 2025 ClickSetGo. All rights reserved.
          </div>
          </div>
          </body>
          </html>
          
        `
      });
      console.log('Email sent successfully and message:', emailData);
}
