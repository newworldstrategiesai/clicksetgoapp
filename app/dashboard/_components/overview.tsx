import { LineGraph } from "../_components/line-graph"; // Import the LineGraph component
import { BarGraph } from "./bar-graph";
import { PieGraph } from "./pie-graph";
import { CalendarDateRangePicker } from "@/components/date-range-picker";
import PageContainer from "@/components/layout/page-container";
import { RecentSales } from "./recent-sales";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Home } from "@/components/HomeSidebar";

export default function OverViewPage() {
  return (
    <div className="flex h-screen">
      {/* Sidebar Component */}
      <Home userId="your-user-id" fullName="Your Full Name" />

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
                  {/* ... */}
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-7">
                  <div className="col-span-4">
                    {/* Replace AreaGraph with LineGraph */}
                    <LineGraph />
                  </div>
                  <Card className="col-span-4 md:col-span-3">
                    <CardHeader>
                      <CardTitle>Recent Sales</CardTitle>
                      <CardDescription>
                        You made 265 sales this month.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <RecentSales />
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
}
