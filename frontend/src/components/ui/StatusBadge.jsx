const statusStyles = {
  pending: "bg-yellow-50 text-yellow-700 dark:bg-yellow-500/10 dark:text-yellow-400",
  running: "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400",
  completed: "bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400",
  failed: "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400",
  active: "bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400",
  paused: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
};

function StatusBadge({ status }) {
  const style = statusStyles[status] || "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400";
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium capitalize ${style}`}>
      {status}
    </span>
  );
}

export default StatusBadge;