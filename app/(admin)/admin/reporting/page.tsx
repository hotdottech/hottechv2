import Link from "next/link";
import { getChartData, getTopPosts, getTopNewsletters } from "@/lib/analytics";
import { PerformanceChart } from "./PerformanceChart";
import { ContentBreakdown } from "./ContentBreakdown";
import { cn } from "@/lib/utils";

type PageProps = {
  searchParams: Promise<{ days?: string }>;
};

const ALLOWED_DAYS = [7, 30, 90] as const;

function parseDays(value: string | undefined): number {
  const n = value ? parseInt(value, 10) : NaN;
  if (Number.isNaN(n) || !ALLOWED_DAYS.includes(n as 7 | 30 | 90))
    return 30;
  return n as 7 | 30 | 90;
}

export default async function ReportingPage({ searchParams }: PageProps) {
  const resolved = await searchParams;
  const days = parseDays(resolved.days);

  const [chartData, topPosts, topNewsletters] = await Promise.all([
    getChartData(days),
    getTopPosts(),
    getTopNewsletters(),
  ]);

  return (
    <div className="h-full overflow-y-auto bg-background/50">
      <div className="mx-auto w-[95%] space-y-8 py-10">
        {/* Header Section (Title + Time Filter) */}
        <div>
          <h1 className="font-serif text-2xl font-bold text-hot-white">
            Platform Performance
          </h1>
          <div className="mt-6 flex flex-wrap items-center gap-2">
            <span className="font-sans text-sm text-gray-400">Time range:</span>
            {ALLOWED_DAYS.map((d) => (
              <Link
                key={d}
                href={`/admin/reporting?days=${d}`}
                className={cn(
                  "rounded-md border px-3 py-1.5 font-sans text-sm font-medium transition-colors",
                  days === d
                    ? "border-emerald-500/50 bg-emerald-500/20 text-emerald-400"
                    : "border-white/10 bg-white/5 text-gray-400 hover:border-white/20 hover:text-hot-white"
                )}
              >
                {d} Days
              </Link>
            ))}
          </div>
        </div>

        {/* Chart Section */}
        <div className="rounded-lg border border-white/10 bg-white/5 p-4">
          <PerformanceChart data={chartData} />
        </div>

        {/* Table Section */}
        <ContentBreakdown posts={topPosts} newsletters={topNewsletters} />
      </div>
    </div>
  );
}
