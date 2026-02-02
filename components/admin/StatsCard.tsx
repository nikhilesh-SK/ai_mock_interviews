/**
 * Stats Card Component
 * 
 * Reusable card for displaying analytics metrics in the admin dashboard.
 */

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: string;
  description?: string;
  trend?: "up" | "down" | "neutral";
}

const StatsCard = ({ title, value, icon, description }: StatsCardProps) => {
  return (
    <div className="stats-card">
      <div className="stats-card-header">
        <span className="stats-card-icon">{icon}</span>
        <h4 className="stats-card-title">{title}</h4>
      </div>

      <div className="stats-card-value">{value}</div>

      {description && (
        <p className="stats-card-description">{description}</p>
      )}
    </div>
  );
};

export default StatsCard;
