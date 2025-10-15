"use client";

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const data = [
  { name: "Jan", value: 40 },
  { name: "Feb", value: 55 },
  { name: "Mar", value: 30 },
  { name: "Apr", value: 75 },
  { name: "May", value: 50 },
];

export default function SmallChart() {
  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="value" stroke="var(--white)" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
