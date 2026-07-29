import { useState } from "react";
import { LuSun, LuMoon, LuLogOut, LuMail, LuUser, LuPencil, LuCheck, LuX } from "react-icons/lu";
import DashboardLayout from "../components/layout/DashboardLayout";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

function Profile()  {
  const { user, logout, updateName } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();

  const [editing, setEditing] = useState(false);
  const [nameInput, setNameInput] = useState(user?.name || "");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function startEditing() {
    setNameInput(user?.name || "");
    setError("");
    setEditing(true);
  }

  function cancelEditing() {
    setEditing(false);
    setError("");
  }

  async function handleSave() {
    if (!nameInput.trim()) {
      setError("Name can't be empty");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      await updateName(nameInput.trim());
      setEditing(false);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update name");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <DashboardLayout title="Profile">
      <div className="max-w-xl space-y-6">
        {/* Profile */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-6">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Profile</h2>
          <div className="flex items-center gap-4 mb-5">
            <div className="w-14 h-14 rounded-full bg-brand-600 text-white flex items-center justify-center text-xl font-semibold shrink-0">
              {user?.name?.charAt(0).toUpperCase() || "U"}
            </div>
            <div>
              <p className="font-medium text-gray-900 dark:text-white">{user?.name}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{user?.email}</p>
            </div>
          </div>

          {error && (
            <div className="mb-3 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400 rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
              <LuUser size={15} className="shrink-0" />
              Full Name:
              {editing ? (
                <div className="flex items-center gap-2 flex-1">
                  <input
                    type="text"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    autoFocus
                    className="flex-1 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-2 py-1 text-sm text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                  <button
                    onClick={handleSave}
                    disabled={submitting}
                    className="p-1.5 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 dark:bg-green-500/10 dark:text-green-400 disabled:opacity-50"
                    aria-label="Save"
                  >
                    <LuCheck size={15} />
                  </button>
                  <button
                    onClick={cancelEditing}
                    disabled={submitting}
                    className="p-1.5 rounded-lg bg-gray-100 text-gray-500 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 disabled:opacity-50"
                    aria-label="Cancel"
                  >
                    <LuX size={15} />
                  </button>
                </div>
              ) : (
                <>
                  <span className="text-gray-800 dark:text-gray-200">{user?.name}</span>
                  <button
                    onClick={startEditing}
                    className="p-1 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                    aria-label="Edit name"
                  >
                    <LuPencil size={13} />
                  </button>
                </>
              )}
            </div>
            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
              <LuMail size={15} /> Email: <span className="text-gray-800 dark:text-gray-200">{user?.email}</span>
            </div>
          </div>
          <p className="text-xs text-gray-400 dark:text-gray-600 mt-4">
            Email editing isn't available yet.
          </p>
        </div>

        {/* Appearance */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-6">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Appearance</h2>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {darkMode ? <LuMoon size={18} className="text-gray-500" /> : <LuSun size={18} className="text-gray-500" />}
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {darkMode ? "Dark mode" : "Light mode"}
              </span>
            </div>
            <button
              onClick={toggleDarkMode}
              className={`relative w-11 h-6 rounded-full transition-colors ${
                darkMode ? "bg-brand-600" : "bg-gray-300"
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                  darkMode ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </div>

        {/* Account */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-6">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Account</h2>
          <button
            onClick={logout}
            className="flex items-center gap-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 px-4 py-2 rounded-lg transition-colors"
          >
            <LuLogOut size={16} /> Log Out
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default Profile;