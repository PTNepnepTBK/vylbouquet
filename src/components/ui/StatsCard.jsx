export default function StatsCard({ icon: Icon, label, value, trend, trendValue, color = "blue" }) {
  const colorClasses = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    yellow: "bg-yellow-50 text-yellow-600",
    red: "bg-red-50 text-red-600",
    purple: "bg-purple-50 text-purple-600",
  };

  const trendClasses = {
    up: "text-green-600",
    down: "text-red-600",
    neutral: "text-gray-600",
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{label}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          {trend && trendValue && (
            <p className={`text-sm mt-2 ${trendClasses[trend]}`}>
              {trend === "up" && "↑"}
              {trend === "down" && "↓"}
              {trend === "neutral" && "→"}
              {" "}{trendValue}
            </p>
          )}
        </div>
        {Icon && (
          <div className={`p-3 rounded-full ${colorClasses[color]}`}>
            <Icon className="w-8 h-8" />
          </div>
        )}
      </div>
    </div>
  );
}
