// app/dashboard/overview/OverviewClient.tsx

'use client';

import { LineGraph } from "../_components/line-graph"; // Named Import
import { BarGraph } from "../_components/bar-graph";
import { PieGraph } from "../_components/pie-graph";
import { CalendarDateRangePicker } from "@/components/date-range-picker";
import PageContainer from "@/components/layout/page-container";
import RecentCalls from "../_components/RecentCalls"; // Adjust the path as needed
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";


interface OverViewClientProps {
  userId: string;
  vapiKey: string;
}

const OverViewClient: React.FC<OverViewClientProps> = ({ userId, vapiKey }) => {
  return (
    <div className="flex h-screen">
      {/* Sidebar Component */}
      
      {/* Main Content Area */}
      <div className="flex-1 pt-16">
        <PageContainer scrollable>
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row items-center justify-between space-y-2 md:space-y-0">
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
                Hi, Welcome back 👋
              </h2>
              <div className="flex items-center space-x-2">
                <CalendarDateRangePicker />
                <Button>Download</Button>
              </div>
            </div>
            <Tabs defaultValue="overview" className="space-y-4">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="analytics" disabled>
                  Analytics
                </TabsTrigger>
              </TabsList>
              <TabsContent value="overview" className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  {/* Existing Cards */}
                  
                  {/* Add more cards as needed */}
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-7">
                  <div className="col-span-4">
                    {/* Pass userId and vapiKey as props */}
                    <LineGraph userId={userId} vapiKey={vapiKey} />
                  </div>
                  <Card className="col-span-4 md:col-span-3">
                    <CardHeader>
                      <CardTitle>Recent Calls</CardTitle>
                      <CardDescription>
                        View your most recent calls.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <RecentCalls userId={userId} vapiKey={vapiKey} />
                    </CardContent>
                  </Card>
                  <div className="col-span-4">
                    <BarGraph />
                  </div>
                  <div className="col-span-4 md:col-span-3">
                    <PieGraph />
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </PageContainer>
      </div>
    </div>
  );
};

export default OverViewClient;
