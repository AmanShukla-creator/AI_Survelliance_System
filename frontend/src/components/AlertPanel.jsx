import { ShieldAlert, Trash2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { apiUrl } from "../config/api";

// Mock data to represent initial state
const initialAlerts = [
  {
    id: 1,
    time: new Date().toLocaleTimeString(),
    message: "System Initialized: Monitoring started.",
  },
  {
    id: 2,
    time: new Date().toLocaleTimeString(),
    message: "Unusual motion detected in Zone 4.",
  },
];

const AlertPanel = () => {
  const [alerts, setAlerts] = useState(initialAlerts);
  const [loading, setLoading] = useState(true);
  const scrollableContainerRef = useRef(null);

  // Function to fetch alerts
  const fetchAlerts = useCallback(async () => {
    // Helper to add a mock alert for UI demonstration purposes
    const addMockAlert = () => {
      const mockMessages = [
        "Unauthorized vehicle detected at Gate C.",
        "Perimeter breach suspected near West Fence.",
        "Camera 7 offline.",
        "High-value asset movement detected.",
      ];
      const randomMessage =
        mockMessages[Math.floor(Math.random() * mockMessages.length)];
      const newAlert = {
        id: Date.now(),
        time: new Date().toLocaleTimeString(),
        message: randomMessage,
      };
      setAlerts((prev) => [newAlert, ...prev].slice(0, 50));
    };

    try {
      // Replace with your actual API endpoint
      const response = await fetch(apiUrl("/api/alerts"));
      if (!response.ok) {
        // Don't throw, just log, so mock data persists on failure
        console.error("Failed to fetch alerts. Status:", response.status);
        // Add a mock alert for demonstration if API fails
        addMockAlert();
        return;
      }
      const newAlerts = await response.json();
      // Assuming the API returns an array of new alerts
      setAlerts((prev) => [...newAlerts, ...prev].slice(0, 50)); // Keep the list from growing too large
    } catch (error) {
      console.error("Error fetching alerts:", error);
      // Add a mock alert for demonstration if API fails
      addMockAlert();
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Fetch alerts every 5 seconds
    const interval = setInterval(fetchAlerts, 5000);
    return () => clearInterval(interval);
  }, [fetchAlerts]);

  // Auto-scroll to top when new alerts arrive
  useEffect(() => {
    if (scrollableContainerRef.current) {
      scrollableContainerRef.current.scrollTop = 0;
    }
  }, [alerts]);

  const removeAlert = (index) => {
    setAlerts(alerts.filter((_, i) => i !== index));
  };

  const clearAllAlerts = () => {
    setAlerts([]);
  };

  return (
    <div className="bg-primary p-4 rounded-lg shadow-inner border border-secondary flex flex-col h-full animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <ShieldAlert className="w-6 h-6 text-accent" />
          <h2 className="text-lg font-semibold text-text-primary tracking-wider">
            Real-Time Alerts
          </h2>
          <span className="ml-2 px-3 py-1 rounded-full bg-red-500/20 text-red-400 text-sm font-semibold">
            {alerts.length}
          </span>
        </div>
        {alerts.length > 0 && (
          <button
            onClick={clearAllAlerts}
            className="text-xs px-3 py-1 rounded bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-all"
          >
            Clear All
          </button>
        )}
      </div>

      <div
        ref={scrollableContainerRef}
        className="flex-grow overflow-y-auto pr-2"
      >
        <div className="space-y-3">
          {loading ? (
            <div className="text-center py-8">
              <p className="text-slate-400">Loading alerts...</p>
            </div>
          ) : alerts.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-slate-400">No active alerts</p>
              <p className="text-slate-500 text-sm">All systems normal</p>
            </div>
          ) : (
            alerts.map((alert, index) => (
              <div
                key={alert.id}
                className={`p-3 rounded-md bg-secondary/60 border-l-4 ${index === 0 ? "border-accent animate-pulse-border" : "border-secondary"}`}
              >
                <div className="flex-1">
                  <p className="text-red-400 font-semibold text-sm">
                    {alert.type || "Detection Alert"}
                  </p>
                  <p className="text-slate-400 text-xs mt-1">
                    {alert.timestamp
                      ? new Date(alert.timestamp).toLocaleTimeString()
                      : "Just now"}
                  </p>
                  {alert.details && (
                    <p className="text-slate-500 text-xs mt-1">
                      {alert.details}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => removeAlert(index)}
                  className="ml-2 p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-red-500/20 transition-all"
                >
                  <Trash2 className="w-4 h-4 text-red-400" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AlertPanel;
