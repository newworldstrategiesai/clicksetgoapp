'use client';

export default function ReportsPage() {
  const reports = [
    {
      title: "Automated resolution rate",
      description: "An analysis of how many conversations your AI Agent resolved in a way that was accurate, relevant, and safe.",
    },
    {
      title: "Average handle time",
      description: "The average length of time your customers spent in conversations with your AI Agent.",
    },
    {
      title: "Containment rate",
      description: "How often your AI Agent handled your customers' inquiries without escalating to human support.",
    },
    {
      title: "Conversational messages volume",
      description: "The number of messages per conversation with your AI Agent, from any source.",
    },
    {
      title: "Conversations breakdown",
      description: "The number of conversations your customers initiated, engaged in, escalated, and were automatically resolved.",
    },
    {
      title: "Customer Satisfaction Score",
      description: "View the percent of chatters who were satisfied with their experience with your bot.",
    },
    {
      title: "Satisfaction Survey Results",
      description: "View the results of your customer satisfaction survey.",
    },
  ];

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">Reports</h1>
        <p className="text-gray-400 mb-8">View key performance metrics.</p>
        <div className="space-y-4">
          {reports.map((report) => (
            <div
              key={report.title}
              className="bg-gray-800 hover:bg-gray-700 transition-colors rounded-lg p-4 cursor-pointer"
            >
              <h2 className="text-xl font-semibold">{report.title}</h2>
              <p className="text-gray-400">{report.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
