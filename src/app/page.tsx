"use client";

import { useStats } from "@/hooks/use-data";
import { SURFACE_COLORS } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Trophy, Users, CalendarDays } from "lucide-react";

export default function DashboardPage() {
  const { data, loading, error } = useStats();

  if (loading) {
    return (
      <div className="space-y-8">
        <div>
          <div className="h-10 w-48 rounded-md bg-muted/50 animate-pulse mb-2" />
          <div className="h-5 w-64 rounded-md bg-muted/50 animate-pulse" />
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 w-24 rounded bg-muted/50 animate-pulse" />
                <div className="h-4 w-4 rounded-full bg-muted/50 animate-pulse" />
              </CardHeader>
              <CardContent>
                <div className="h-8 w-32 rounded bg-muted/50 animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className={`h-[400px] rounded-xl bg-muted/50 animate-pulse ${
                i === 4 ? "md:col-span-2 lg:col-span-1 row-span-2 h-[450px]" : ""
              }`}
            />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <p className="text-red-500 font-medium">Error loading data: {error}</p>
      </div>
    );
  }

  if (!data) return null;

  const surfaceData = Object.entries(data.by_surface).map(([name, value]) => ({
    name,
    value,
  }));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          ATP Tour statistics overview (1968–2024)
        </p>
      </div>

      {/* KPI Row */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Matches</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.total_matches.toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Players</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.total_players.toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tournaments</CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.total_tournaments.toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Chart 1: Matches Per Year */}
        <Card>
          <CardHeader>
            <CardTitle>Matches Per Year</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data.by_year}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="matches"
                  stroke="#2D6A4F"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Chart 2: Surface Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Surface Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={surfaceData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ name }) => name}
                >
                  {surfaceData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={SURFACE_COLORS[entry.name] || "hsl(0,0%,60%)"}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Chart 3: Surface Trends Over Time */}
        <Card>
          <CardHeader>
            <CardTitle>Surface Trends Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={data.surface_trends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" />
                <YAxis />
                <Tooltip />
                <Legend />
                {Object.keys(SURFACE_COLORS).map((surface) => (
                  <Area
                    key={surface}
                    type="monotone"
                    dataKey={surface}
                    stackId="1"
                    stroke={SURFACE_COLORS[surface]}
                    fill={SURFACE_COLORS[surface]}
                  />
                ))}
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Chart 4: Grand Slam Title Leaders */}
        <Card className="md:col-span-2 lg:col-span-1 lg:row-span-2">
           <CardHeader>
            <CardTitle>Grand Slam Title Leaders</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={450}>
              <BarChart
                layout="vertical"
                data={data.grand_slam_leaders.slice(0, 15)}
                margin={{ left: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={120} interval={0} style={{ fontSize: '12px' }} />
                <Tooltip />
                <Bar dataKey="count" fill="#2D6A4F" barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Chart 5: Avg Match Duration by Decade */}
        <Card>
          <CardHeader>
            <CardTitle>Avg Match Duration by Decade (mins)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.avg_duration_by_decade}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="decade" />
                <YAxis />
                <Tooltip />
                <Bar
                  dataKey="avg"
                  fill="hsl(220, 70%, 55%)"
                  label={{ position: "top", formatter: (val) => typeof val === "number" ? Math.round(val) : val }}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
