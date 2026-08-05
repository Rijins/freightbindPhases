import Card, { CardHeader } from "../../../../components/Card/Card";
import { MiniAreaChart, MiniBarChart } from "../../../../components/charts";
import PreviewBadge from "../../../../components/widgets/PreviewBadge";
import { MODULE_ACCENTS } from "../../../../utils/themeTokens";

/**
 * AnalyticsPreview — two lightweight dependency-free charts. The status
 * distribution bar chart is REAL (pagination totals per status); the weekly
 * volume trend is preview data since no analytics API exists yet.
 */
const AnalyticsPreview = ({ statusDistribution = [], shipmentVolume = [], loading = false }) => (
  <Card className="h-full">
    <CardHeader
      title="Analytics Preview"
      subtitle="Live status mix and weekly shipment volume trend."
      action={<PreviewBadge />}
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
