/**
 * Admin Interviews Page
 * 
 * Displays a list of all interviews created on the platform.
 */

import DataTable from "@/components/admin/DataTable";
import { getAllInterviews } from "@/lib/actions/admin.action";

/**
 * Format date string for display
 */
const formatDate = (dateString?: string) => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

/**
 * Admin Interviews Page Component
 * 
 * Shows a table of all interviews with their details.
 */
const AdminInterviewsPage = async () => {
  const interviews = await getAllInterviews();

  const columns = [
    {
      key: "role",
      header: "Role",
    },
    {
      key: "type",
      header: "Type",
      render: (interview: AdminInterview) => (
        <span className="admin-badge">{interview.type}</span>
      ),
    },
    {
      key: "level",
      header: "Level",
    },
    {
      key: "techstack",
      header: "Tech Stack",
      render: (interview: AdminInterview) => (
        <div className="tech-tags">
          {interview.techstack.slice(0, 3).map((tech, i) => (
            <span key={i} className="tech-tag">{tech}</span>
          ))}
          {interview.techstack.length > 3 && (
            <span className="tech-tag">+{interview.techstack.length - 3}</span>
          )}
        </div>
      ),
    },
    {
      key: "userName",
      header: "Created By",
    },
    {
      key: "finalized",
      header: "Status",
      render: (interview: AdminInterview) => (
        <span className={`status-badge ${interview.finalized ? "status-complete" : "status-pending"}`}>
          {interview.finalized ? "Complete" : "Pending"}
        </span>
      ),
    },
    {
      key: "createdAt",
      header: "Date",
      render: (interview: AdminInterview) => formatDate(interview.createdAt),
    },
  ];

  return (
    <div className="admin-page">
      <h2 className="admin-page-title">Interviews Management</h2>
      <p className="text-light-400 mb-8">
        All interviews ({interviews?.length || 0} total)
      </p>

      <DataTable
        data={interviews || []}
        columns={columns}
        emptyMessage="No interviews found in the database."
      />
    </div>
  );
};

export default AdminInterviewsPage;
