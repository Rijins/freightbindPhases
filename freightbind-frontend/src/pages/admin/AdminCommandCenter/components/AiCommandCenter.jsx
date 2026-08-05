import SectionHeader from "../../../../components/page/SectionHeader";
import AiInsightCard from "../../../../components/widgets/AiInsightCard";
import DashboardGrid from "../../../../components/widgets/DashboardGrid";
import PreviewBadge from "../../../../components/widgets/PreviewBadge";

/**
 * AiCommandCenter — AI recommendations preview. The backend AI engine does
 * not exist yet (planned for a later phase), so the four insights are sample
 * data and the panel is clearly marked as a preview.
 */
const AiCommandCenter = ({ insights = [], loading = false }) => (
  <section aria-labelledby="ai-command-center-title">
    <SectionHeader
      title="AI Command Center"
      subtitle="Priority recommendations surfaced from network telemetry."
      action={<PreviewBadge />}
    />
    <div className="mt-5">
      <DashboardGrid columns={4}>
        {insights.map((insight) => (
          <AiInsightCard key={insight._id} insight={insight} loading={loading} />
        ))}
      </DashboardGrid>
    </div>
  </section>
);

export default AiCommandCenter;
