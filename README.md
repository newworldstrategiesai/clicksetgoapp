# Click Set Go - AI Voice Assistant for different purposes

**Click Set Go** is an AI-powered voice assistant designed to manage phone calls, SMS messaging, and CRM tasks. The assistant provides personalized interactions by checking the contact database and greeting callers by name. Planned features include memory retention, Google Calendar integration, embeddable agents via Vapi Web SDK, and subscription management via Stripe.

---

## 🚀 **Current Features**

### Inbound and Outbound Phone Calls
- Handle inbound and outbound phone calls.
- The assistant checks the contact database when receiving calls and greets the caller by name .

### SMS Messaging
- Send SMS messages, even during active calls.
- Send end-of-call reports to administrators via SMS.
- Include calendar links in SMS messages to customers (calendar integration planned).

### Email Notifications
- Sends email notifications, including end-of-call reports, to admins.
- User email verification for account validation.

### Call Reporting and Logging
- Logs each call, including transcripts, call duration, and outcomes.
- Stores call reports and details, including message logs and call analysis.

### CRM Functions
- Manage contacts, call logs, SMS logs, and campaigns in an integrated UI.
- Create and manage contact lists, campaigns, and call tasks.

### Responsive UI Design
- iOS-like design for mobile screens.
- iPad-like design for tablet screens.
- Fully expanded desktop UI for optimal user experience across all devices.

### Voice Selection
- Choose from a library of stock voices for the assistant.
- *Planned*: Upload a voice sample for cloning (powered by Eleven Labs).

### Admin Dashboard
- Customize the assistant’s tone, message length, emoji usage, and more.
- Manage API keys for Twilio, Eleven Labs, OpenAI, and other integrations.

### Stripe Payment Integration
- Secure user management and authentication with Supabase.
- Integration with Stripe for subscription payments.
- Stripe Customer Portal for managing billing and subscription status.

---

## 🔧 **Planned Features & Improvements**

### Memory and Context Retention
- *Planned*: The assistant will retain memory of previous conversations and use this context in future interactions for better personalization.

### Google Calendar Integration
- *Planned*: Sync with Google Calendar to check availability and create events directly from the assistant.

### Workflow Automation
- *Planned*: Automate follow-ups after calls or SMS messages, enabling a smooth workflow based on call status and outcomes.

### Embedding the Sales Agent Tool
- *Planned*: Embed the default sales agent on the homepage using the **Vapi Web SDK**.
- *Planned*: Offer a product feature where users can embed their personalized AI agent on their own website using an iframe code snippet.

### Multilingual Support
- *Planned*: Enable the assistant to handle conversations in multiple languages.

### SMS Receiving and Replies
- *Planned*: Receive SMS messages and respond based on memory of previous interactions.

### Enhanced Call Context
- *Planned*: Maintain transcripts of previous conversations for seamless future interactions.

### Nicknames for Contacts
- *Planned*: Users can assign nicknames to phone numbers for quicker recognition during conversations.

### UI Refinements
- Refine the color scheme and design elements for a more polished look.
- Replace placeholder logos with the Click Set Go branding.

### Performance Improvements
- Reduce latency and fix timeout issues in the production environment.
- Optimize database queries and API responses for faster load times.

---

## 🛠 **Tech Stack**

### **Frontend**
- **Next.js**: Server-side rendering framework for React.
- **TypeScript**: Strong typing for enhanced developer experience.
- **Tailwind CSS**: Utility-first CSS for rapid UI development.
- **Chart.js / ShadCN**: Visualization libraries for charts and data displays.

### **Backend**
- **Supabase**: Postgres-based backend and authentication service.
- **Node.js**: Runtime for server-side API handling.
- **Resend**: SMTP service for email management (verification and reporting).
- **Twilio**: SMS and phone call API integration.

### **Voice & AI**
- **OpenAI (GPT-4 Mini)**: AI-powered conversation engine.
- **Eleven Labs**: Voice customization and voice cloning technology.
- **Deepgram**: Speech-to-text and call transcription.

### **Other Tools**
- **Cursor**: Development environment for team collaboration.
- **Webflow**: Frontend design for the homepage.
- **Vercel**: Deployment and hosting for the frontend.

### **Stripe Integration**
- **Stripe Checkout**: Handles secure payments for subscriptions.
- **Stripe Webhooks**: Syncs subscription statuses and payment plans.

---

## 📈 **Integrations**

1. **Google Calendar**: Sync availability and create events (planned).
2. **Twilio**: Manage phone calls and SMS services.
3. **OpenAI**: Power conversations with GPT-4 Mini.
4. **Eleven Labs**: Customize assistant voices with synthesized or cloned voices.
5. **Vapi Web SDK**: Embed the sales agent tool directly on websites (planned).
6. **Stripe**: Subscription payments and customer billing.

---

## 🎯 **Goals for the Developer Team**

- Ensure app responsiveness across all devices.
- Implement text message receiving and international calling.
- Optimize the assistant's memory and call context functionality.
- Improve code quality and scalability.
- Integrate the **Vapi Web SDK** for embedding the sales agent tool.
- Maintain a smooth user experience as new features are rolled out.

---

## 📄 **License**

This project is licensed under the MIT License. See the `LICENSE` file for more details.

---

## 🏗 **Step-by-Step Setup**

### Initiate Deployment

#### Vercel Deploy Button

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fvercel%2Fnextjs-subscription-payments&env=NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,STRIPE_SECRET_KEY&envDescription=Enter%20your%20Stripe%20API%20keys.&envLink=https%3A%2F%2Fdashboard.stripe.com%2Fapikeys&project-name=nextjs-subscription-payments&repository-name=nextjs-subscription-payments&integration-ids=oac_VqOgBHqhEoFTPzGkPd7L0iH6&external-id=https%3A%2F%2Fgithub.com%2Fvercel%2Fnextjs-subscription-payments%2Ftree%2Fmain)

### Configure Supabase Auth

Follow [this guide](https://supabase.com/docs/guides/auth/social-login/auth-github) to set up an OAuth app with GitHub and configure Supabase to use it as an auth provider.

### Configure Stripe

Next, configure [Stripe](https://stripe.com/) to handle test payments. You can follow the Stripe integration and webhook setup in [Stripe documentation](https://stripe.com/docs/webhooks).

Once configured, redeploy your app in Vercel to ensure all environment variables are in place.

---

## 🙌 **Thanks**

Thanks to all contributors and partners who make this project possible. Let's build something great together!

