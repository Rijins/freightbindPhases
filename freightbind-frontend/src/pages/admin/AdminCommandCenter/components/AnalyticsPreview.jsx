import Card, { CardHeader } from "../../../../components/Card/Card";
import { MiniAreaChart, MiniBarChart } from "../../../../components/charts";
import { MODULE_ACCENTS } from "../../../../utils/themeTokens";

/**
 * Analytics — two lightweight dependency-free charts, both backed by real
 * data: the status distribution bar chart uses pagination totals per status,
 * and the volume trend comes from the analytics endpoint (createdAt buckets
 * over the last 7 days).
 */
const AnalyticsPreview = ({ statusDistribution = [], shipmentVolume = [], loading = false }) => (
  <Card className="h-full">
    <CardHeader
      title="Shipment Analytics"
      subtitle="Live status mix and weekly shipment volume trend."
    />
    <div className="mt-5 grid grid-cols-1 gap-6 md:grid-cols-2">
      <div>
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
          Shipments by status
        </p>
        <MiniBarChart
          data={statusDistribution}
          loading={loading}
          label="Shipments by status"
          color={MODULE_ACCENTS.shipments.chart}
          emptyTitle="No shipments yet"
        />
      </div>
      <div>
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
          Shipment volume this week
        </p>
        <MiniAreaChart
          data={shipmentVolume}
          loading={loading}
          label="Shipment volume this week"
          color={MODULE_ACCENTS.analytics.chart}
          emptyTitle="No volume data"
        />
      </div>
    </div>
  </Card>
);

export default AnalyticsPreview;