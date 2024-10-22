(async () => {
    const { Octokit } = await import('@octokit/rest');
  
    // Initialize Octokit with your GitHub personal access token
    const octokit = new Octokit({
      auth: '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', // Replace with your new GitHub token
    });
  
    // Define the issues to be created
    const issues = [
      {
        title: 'SMS Text Function Fails on Outbound Calls',
        body: 'The SMS text function works only for inbound calls. It should also work when making outbound calls.',
        labels: ['bug', 'high priority'],
      },
      {
        title: '404 Error on Call-Logs Page',
        body: 'The call-logs page throws a "Failed to load resource: the server responded with a status of 404" error.',
        labels: ['bug'],
      },
      {
        title: 'CSV Upload Issue: User Needs to Switch Tabs for Upload',
        body: 'When trying to upload a CSV file of contacts, the user has to switch between tabs and come back for the upload process to work correctly.',
        labels: ['bug', 'high priority'],
      },
      {
        title: 'Redirect User to Check Your Email Page After Signup',
        body: 'After signing up, the user receives a confirmation email but is not redirected to a page that instructs them to check their email.',
        labels: ['enhancement', 'medium priority'],
      },
      {
        title: '"Get Started" Button Not Redirecting to Login Page',
        body: 'The "Get Started" button should lead to the login page but sometimes reloads the home page if the user is already logged in.',
        labels: ['bug'],
      },
      {
        title: 'Add Navigation Menu Items for Key Pages',
        body: 'Some crucial pages (e.g., Campaigns) currently have no navigation directing to them. Add nav menu items for these pages.',
        labels: ['enhancement', 'UI'],
      },
      {
        title: 'Improve Responsiveness of Dialer Pages',
        body: 'Ensure the dialer pages look great on both mobile and desktop/tablet. The desktop page should emulate an iPad OS UI.',
        labels: ['enhancement', 'UI', 'responsive'],
      },
      {
        title: 'Voice Upload Feature on Voice Library Page Failing',
        body: 'The modal allows users to upload an audio sample, and a new voice is created in Eleven Labs, but it is unusable due to missing data, possibly the audio file.',
        labels: ['bug', 'high priority'],
      },
      {
        title: '/Campaigns Page Design Issues on Mobile',
        body: 'The modal on the /campaigns page is not responsive. The entire design should be revamped using Tailwind CSS.',
        labels: ['UI', 'enhancement', 'responsive'],
      },
      {
        title: 'Text Color Issues and Task Scheduling on /campaigns/[id] Page',
        body: 'There are text color issues on the campaigns page. The "scheduled time" is not being passed correctly. Add the ability to create call_tasks records from this page.',
        labels: ['bug', 'UI', 'enhancement'],
      },
      {
        title: 'Create a /Voicemail Page for Inbound Calls',
        body: 'The /call-logs page is mislabeled "Voicemail". A dedicated /voicemail page should be created for inbound missed calls with the same UI. The "greeting" button should only be on the voicemail page for setting up inbound agent prompts.',
        labels: ['enhancement'],
      },
      {
        title: 'Remove "Greeting" Button from Call Logs Page',
        body: 'The greeting button should be removed from the /call-logs page and only appear on the /voicemail page.',
        labels: ['UI', 'bug'],
      },
      {
        title: 'Update "Add to List" Button on /Contacts Page',
        body: 'Convert the "Go" button on the /contacts page into a "+" button for adding to the list. Fix the "failed to fetch lists" error in the modal.',
        labels: ['bug', 'UI'],
      },
      {
        title: 'Simplify New Campaign Page',
        body: 'The "channels" checkboxes should be removed from the new-campaign page. Simplify it to outbound voice campaigns only. Add intuitive date pickers and implement a cron job to check task schedules and campaign launch/pausing functionality.',
        labels: ['enhancement', 'feature'],
      },
      {
        title: 'Develop Privacy Policy and Terms of Use Pages',
        body: 'Develop pages for privacy policy and terms of use. Use GPT for initial content generation.',
        labels: ['documentation'],
      },
      {
        title: 'Add Futuristic Charts to Overview Page',
        body: 'The overview page should feature beautiful futuristic charts that show data for inbound/outbound calls, inbound/outbound SMS, and other relevant data.',
        labels: ['enhancement', 'UI'],
      },
      {
        title: 'Implement Task Actions on Tasks Page',
        body: 'The tasks page shows call tasks, but none of the buttons work. Implement functionality to alter DB rows in Supabase. Eventually, all tasks (calls, SMS, emails) should appear here with statuses like pending, processing, and completed.',
        labels: ['feature', 'high priority'],
      },
      {
        title: 'Update Task Status to "Completed"',
        body: 'When a task is completed, its status should be updated to "completed" in the database.',
        labels: ['enhancement', 'high priority'],
      },
      {
        title: 'Implement Agents Table for Dynamic Context in Prompts',
        body: 'Implement the agents table from Supabase to inject context data into prompts dynamically using assistant overrides in Vapi.',
        labels: ['feature'],
      }
    ];
  
    // Function to create issues programmatically
    async function createIssues() {
      for (const issue of issues) {
        try {
          const response = await octokit.rest.issues.create({
            owner: 'newworldstrategiesai', // Replace with your GitHub username
            repo: 'clicksetgoapp', // Replace with your GitHub repository name
            title: issue.title,
            body: issue.body,
            labels: issue.labels,
          });
          console.log(`Issue created: ${response.data.html_url}`);
        } catch (error) {
          console.error(`Error creating issue "${issue.title}":`, error);
        }
      }
    }
  
    // Run the script
    createIssues();
  })();
    
