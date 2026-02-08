"use client";

import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { Card } from "../../components/Card";

export default function DashboardClient({ series }: { series: any }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
      <Card title="العلف اليومي / Daily Feed (kg)">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={series.daily}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="feedKg" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card title="النافق اليومي / Daily Mortality">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={series.daily}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="mortalityCount" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card title="البيئة / Environment (Last 24h)">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={series.sensors24h}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="temperatureC" dot={false} />
              <Line type="monotone" dataKey="humidityPct" dot={false} />
              <Line type="monotone" dataKey="ammoniaPpm" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card title="الوزن / Avg Weight (g)">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={series.daily}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="avgWeightG" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}
