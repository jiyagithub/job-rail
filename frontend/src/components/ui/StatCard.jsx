function StatCard({ label, value, icon: Icon, accent = "brand" }) {
  const accentClasses = {
    brand: "bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400",
    green: "bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-400",
    red: "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400",
    yellow: "bg-yellow-50 text-yellow-600 dark:bg-yellow-500/10 dark:text-yellow-400",
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{value}</p>
        </div>
        {Icon && (
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${accentClasses[accent]}`}>
            <Icon size={20} />
          </div>
        )}
      </div>
    </div>
  );
}

export default StatCard;