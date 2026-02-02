/**
 * Admin Dashboard Page
 * 
 * Main analytics dashboard showing key metrics about users,
 * interviews, and feedback.
 */

import StatsCard from "@/components/admin/StatsCard";
import { getAnalyticsData } from "@/lib/actions/admin.action";

/**
 * Admin Dashboard Component
 * 
 * Displays analytics cards and visualizations for admin overview.
 */
const AdminDashboard = async () => {
  const analytics = await getAnalyticsData();

  if (!analytics) {
    return (
      <div className="admin-page">
        <h2 className="admin-page-title">Analytics Dashboard</h2>
        <p className="text-light-400">Failed to load analytics data.</p>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <h2 className="admin-page-title">Analytics Dashboard</h2>
      <p className="text-light-400 mb-8">Overview of platform statistics</p>

      {/* Stats Grid */}
      <div className="stats-grid">
        <StatsCard
          title="Total Users"
          value={analytics.totalUsers}
          icon="👥"
          description="Registered users"
        />
        <StatsCard
          title="Total Interviews"
          value={analytics.totalInterviews}
          icon="🎤"
          description="Created interviews"
        />
        <StatsCard
          title="Completed"
          value={analytics.finalizedInterviews}
          icon="✅"
          description="Finalized interviews"
        />
        <StatsCard
          title="Avg. Score"
          value={`${analytics.averageScore}%`}
          icon="📈"
          description="Average feedback score"
        />
        <StatsCard
          title="Completion Rate"
          value={`${analytics.completionRate}%`}
          icon="🎯"
          description="Interviews with feedback"
        />
        <StatsCard
          title="Total Feedback"
          value={analytics.totalFeedback}
          icon="💬"
          description="Feedback generated"
        />
      </div>

      {/* Interview Types Distribution */}
      <div className="admin-section mt-10">
        <h3 className="text-xl font-semibold mb-4">Interview Types</h3>
        <div className="type-distribution">
          {Object.entries(analytics.typeDistribution).map(([type, count]) => (
            <div key={type} className="type-item">
              <span className="type-label">{type}</span>
              <span className="type-count">{count}</span>
            </div>
          ))}
          {Object.keys(analytics.typeDistribution).length === 0 && (
            <p className="text-light-400">No interview data available yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
