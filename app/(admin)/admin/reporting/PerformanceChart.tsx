"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import type { ChartDataPoint } from "@/lib/analytics";

const SUBSCRIBERS_COLOR = "#10b981";
const OPENS_COLOR = "#3b82f6";

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ dataKey?: string; value?: number }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  const subs = payload.find((p) => p.dataKey === "subscribers")?.value ?? 0;
  const opens = payload.find((p) => p.dataKey === "opens")?.value ?? 0;
  return (
    <div className="rounded-lg border border-white/10 bg-hot-gray px-3 py-2 shadow-lg">
      <p className="mb-1 font-sans text-xs font-medium text-gray-400">{label}</p>
      <div className="flex flex-col gap-0.5">
        <span className="font-sans text-sm" style={{ color: SUBSCRIBERS_COLOR }}>
          New Subscribers: {subs}
        </span>
        <span className="font-sans text-sm" style={{ color: OPENS_COLOR }}>
          Newsletter Opens: {opens}
        </span>
      </div>
    </div>
  );
}

export function PerformanceChart({ data }: { data: ChartDataPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={320}>
      <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
        <XAxis
          dataKey="date"
          stroke="#9ca3af"
          fontSize={12}
          tickLine={false}
          axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
        />
        <YAxis
          stroke="#9ca3af"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          allowDecimals={false}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend
          wrapperStyle={{ fontSize: "12px" }}
          formatter={(value) => (
            <span className="text-gray-300">
              {value === "subscribers" ? "New Subscribers" : "Newsletter Opens"}
            </span>
          )}
        />
        <Line
          type="monotone"
          dataKey="subscribers"
          name="subscribers"
          stroke={SUBSCRIBERS_COLOR}
          strokeWidth={2}
          dot={{ fill: SUBSCRIBERS_COLOR, r: 3 }}
          activeDot={{ r: 4 }}
        />
        <Line
          type="monotone"
          dataKey="opens"
          name="opens"
          stroke={OPENS_COLOR}
          strokeWidth={2}
          dot={{ fill: OPENS_COLOR, r: 3 }}
          activeDot={{ r: 4 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
