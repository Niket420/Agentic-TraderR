import { Area, AreaChart, CartesianGrid, ReferenceDot, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatDate, formatPrice } from "@/lib/formatters";
import type { PricePoint } from "@/types/testing";

export function PriceChart({ history, entryPrice }: { history: PricePoint[]; entryPrice: number }) {
  const data = history.map((p) => ({ ...p, ts: new Date(p.date).getTime() }));
  const entry = data[0];

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id="priceFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--color-accent)" stopOpacity={0.28} />
              <stop offset="100%" stopColor="var(--color-accent)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="var(--color-border-hairline)" vertical={false} />
          <XAxis
            dataKey="ts"
            type="number"
            domain={["dataMin", "dataMax"]}
            tickFormatter={(v) => formatDate(new Date(v).toISOString())}
            tick={{ fontSize: 10, fill: "var(--color-text-disabled)", fontFamily: "var(--font-mono)" }}
            axisLine={{ stroke: "var(--color-border)" }}
            tickLine={false}
            minTickGap={60}
          />
          <YAxis
            domain={["auto", "auto"]}
            tick={{ fontSize: 10, fill: "var(--color-text-disabled)", fontFamily: "var(--font-mono)" }}
            axisLine={false}
            tickLine={false}
            width={54}
            tickFormatter={(v) => `₹${v}`}
          />
          <Tooltip
            contentStyle={{ background: "var(--color-bg-elevated)", border: "1px solid var(--color-border-strong)", borderRadius: 4, fontSize: 11, fontFamily: "var(--font-mono)" }}
            labelFormatter={(v) => formatDate(new Date(v as number).toISOString())}
            formatter={(value) => [formatPrice(Number(value)), "Price"]}
          />
          <Area type="monotone" dataKey="price" stroke="var(--color-accent)" strokeWidth={1.75} fill="url(#priceFill)" />
          {entry && <ReferenceDot x={entry.ts} y={entryPrice} r={4} fill="var(--color-text-primary)" stroke="var(--color-bg)" strokeWidth={2} />}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
