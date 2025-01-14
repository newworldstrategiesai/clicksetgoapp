// app/dashboard/_components/bar-graph.tsx

'use client';

import React from 'react';
import { Bar, BarChart, CartesianGrid, XAxis } from 'recharts';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent
} from '@/components/ui/chart';

export const description = 'An interactive bar chart';

const chartData = [
  { date: '2024-04-01', desktop: 222, mobile: 150 },
  { date: '2024-04-02', desktop: 200, mobile: 120 },
  { date: '2024-04-03', desktop: 260, mobile: 300 },
  { date: '2024-04-04', desktop: 312, mobile: 340 },
  { date: '2024-04-05', desktop: 400, mobile: 380 },
  { date: '2024-04-06', desktop: 150, mobile: 190 },
  { date: '2024-04-07', desktop: 320, mobile: 300 },
  { date: '2024-04-08', desktop: 310, mobile: 350 },
  { date: '2024-04-09', desktop: 430, mobile: 350 },
  { date: '2024-04-10', desktop: 390, mobile: 360 },
  { date: '2024-04-11', desktop: 470, mobile: 390 },
  { date: '2024-04-12', desktop: 500, mobile: 400 },
  { date: '2024-04-13', desktop: 520, mobile: 420 },
  { date: '2024-04-14', desktop: 460, mobile: 380 },
  { date: '2024-04-15', desktop: 450, mobile: 350 },
  { date: '2024-04-16', desktop: 520, mobile: 430 },
  { date: '2024-04-17', desktop: 450, mobile: 350 },
  { date: '2024-04-18', desktop: 430, mobile: 360 },
  { date: '2024-04-19', desktop: 440, mobile: 320 },
  { date: '2024-04-20', desktop: 480, mobile: 400 },
  { date: '2024-04-21', desktop: 460, mobile: 420 },
  { date: '2024-04-22', desktop: 350, mobile: 280 },
  { date: '2024-04-23', desktop: 420, mobile: 350 },
  { date: '2024-04-24', desktop: 460, mobile: 400 },
  { date: '2024-04-25', desktop: 520, mobile: 450 },
  { date: '2024-04-26', desktop: 400, mobile: 300 },
  { date: '2024-04-27', desktop: 300, mobile: 350 },
  { date: '2024-04-28', desktop: 350, mobile: 400 },
  { date: '2024-04-29', desktop: 350, mobile: 400 },
  { date: '2024-04-30', desktop: 446, mobile: 400 }
];

const chartConfig = {
  views: {
    label: 'Page Views'
  },
  desktop: {
    label: 'Desktop',
    color: 'hsl(var(--chart-1))'
  },
  mobile: {
    label: 'Mobile',
    color: 'hsl(var(--chart-2))'
  }
} satisfies ChartConfig;

export function BarGraph() {
  const [activeChart, setActiveChart] =
    React.useState<keyof typeof chartConfig>('desktop');

  const total = React.useMemo(
    () => ({
      desktop: chartData.reduce((acc, curr) => acc + curr.desktop, 0),
      mobile: chartData.reduce((acc, curr) => acc + curr.mobile, 0)
    }),
    []
  );

  return (
    <Card>
      <CardHeader className="flex flex-col items-stretch space-y-0 border-b p-0 sm:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 py-5 sm:py-6">
          <CardTitle>Bar Chart - Interactive</CardTitle>
          <CardDescription>
            Showing total visitors for the last 3 months
          </CardDescription>
        </div>
        <div className="flex">
          {['desktop', 'mobile'].map((key) => {
            const chart = key as keyof typeof chartConfig;
            return (
              <button
                key={chart}
                data-active={activeChart === chart}
                className="relative flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left even:border-l data-[active=true]:bg-muted/50 sm:border-l sm:border-t-0 sm:px-8 sm:py-6"
                onClick={() => setActiveChart(chart)}
              >
                <span className="text-xs text-muted-foreground">
                  {chartConfig[chart].label}
                </span>
                <span className="text-lg font-bold leading-none sm:text-3xl">
                  {total[key as keyof typeof total].toLocaleString()}
                </span>
              </button>
            );
          })}
        </div>
      </CardHeader>
      <CardContent className="px-2 sm:p-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[280px] w-full"
        >
          <BarChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: 12,
              right: 12
            }}
            className="dark:bg-gray-800
            dark:text-white"
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric'
                });
              }}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  className="w-[150px] dark:text-white dark:bg-gray-600
                  text-white
                  bg-black"
                  nameKey="views"
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    });
                  }}
                />
              }
            />
            <Bar dataKey={activeChart} fill={`var(--color-${activeChart})`} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
