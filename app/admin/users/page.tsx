/**
 * Admin Users Page
 * 
 * Displays a list of all registered users in the platform.
 */

import DataTable from "@/components/admin/DataTable";
import { getAllUsers } from "@/lib/actions/admin.action";

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
 * Admin Users Page Component
 * 
 * Shows a table of all users with their details.
 */
const AdminUsersPage = async () => {
  const users = await getAllUsers();

  const columns = [
    {
      key: "name",
      header: "Name",
    },
    {
      key: "email",
      header: "Email",
    },
    {
      key: "createdAt",
      header: "Joined",
      render: (user: AdminUser) => formatDate(user.createdAt),
    },
  ];

  return (
    <div className="admin-page">
      <h2 className="admin-page-title">Users Management</h2>
      <p className="text-light-400 mb-8">
        All registered users ({users?.length || 0} total)
      </p>

      <DataTable
        data={users || []}
        columns={columns}
        emptyMessage="No users found in the database."
      />
    </div>
  );
};

export default AdminUsersPage;
