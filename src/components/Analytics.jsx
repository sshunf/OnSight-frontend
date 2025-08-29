import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Chart, registerables } from "chart.js";
Chart.register(...registerables);
import "../css/Dashboard.css";
import "../css/Analytics.css"
import Sidebar from "./Sidebar";

const backendURL = import.meta.env.VITE_BACKEND_URL?.replace(/\/$/, "");

export default function Analytics() {
  const displayName = localStorage.getItem("displayName");
  const [user, setUser] = useState(null);
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);

  const [rawData, setRawData] = useState([]); // API result
  const [topN, setTopN] = useState(6);        // how many machines to display
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  // Gate: require user + gymId
  useEffect(() => {
    const userEmail = localStorage.getItem("userEmail");
    const gymId = localStorage.getItem("gymId");
    if (!userEmail || !gymId) {
      navigate("/login");
    } else {
      setUser({ email: userEmail });
    }
  }, [navigate]);

  // Fetch per-machine DOW averages
  useEffect(() => {
    const fetchData = async () => {
      try {
        const gymId = localStorage.getItem("gymId");
        if (!gymId) return;

        const url = `${backendURL}/api/dow/avg-per-machine?gymId=${gymId}`;
        const res = await fetch(url);
        const json = await res.json();

        if (Array.isArray(json.result)) {
          setRawData(json.result);
        } else {
          console.error("Unexpected response format:", json);
          setRawData([]);
        }
      } catch (e) {
        console.error("Failed to fetch analytics data:", e);
        setRawData([]);
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchData();
  }, [user]);

  // Build/update chart whenever data or topN changes
  useEffect(() => {
    if (!rawData || rawData.length === 0 || !chartRef.current) {
      // Clean up any previous instance
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
        chartInstanceRef.current = null;
      }
      return;
    }

    const dayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

    // Compute overall average per machine to rank for TopN
    const withTotals = rawData.map((m) => {
      const total = (m.days || []).reduce((acc, d) => acc + (d?.avgMinutes || 0), 0);
      return { ...m, __totalAvg: total / 7 };
    });

    // Sort by overall average descending
    withTotals.sort((a, b) => (b.__totalAvg || 0) - (a.__totalAvg || 0));

    // Take top N
    const top = withTotals.slice(0, Math.max(1, topN));

    // Create datasets: one dataset per machine, values ordered Mon..Sun
    const datasets = top.map((m, idx) => {
      const byIndex = new Map((m.days || []).map((d) => [d.dayIndex, d.avgMinutes || 0]));
      const data = dayLabels.map((_, i) => byIndex.get(i + 1) ?? 0);
      const { bg, border } = pickColor(idx);
      return {
        label: m.machineName || String(m.machineId),
        data,
        backgroundColor: bg,
        borderColor: border,
        borderWidth: 1,
      };
    });

    // (Re)build chart
    const ctx = chartRef.current.getContext("2d");
    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }
    chartInstanceRef.current = new Chart(ctx, {
      type: "bar",
      data: {
        labels: dayLabels,
        datasets,
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: "Average Usage per Day of Week (per Machine, all-time)",
            color: "white",
          },
          legend: {
            display: true,
            labels: { color: "white", boxWidth: 16 },
          },
          tooltip: {
            callbacks: {
              label: (ctx) => {
                const v = ctx.raw ?? 0;
                return `${ctx.dataset.label}: ${v.toFixed(2)} min`;
              },
            },
          },
        },
        scales: {
          x: {
            stacked: false,
            ticks: { color: "white" },
            grid: { color: "rgba(255,255,255,0.2)" },
          },
          y: {
            stacked: false,
            beginAtZero: true,
            ticks: { color: "white" },
            grid: { color: "rgba(255,255,255,0.2)" },
            title: { display: true, text: "Average Minutes", color: "white" },
          },
        },
      },
    });

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
        chartInstanceRef.current = null;
      }
    };
  }, [rawData, topN]);

  // Simple palette (falls back to HSL if we exceed predefined colors)
  const pickColor = (i) => {
    const palette = [
      { bg: "rgba(124, 58, 237, 0.6)", border: "rgba(124,58,237,1)" }, // violet
      { bg: "rgba(34, 197, 94, 0.6)", border: "rgba(34,197,94,1)" },   // green
      { bg: "rgba(59, 130, 246, 0.6)", border: "rgba(59,130,246,1)" }, // blue
      { bg: "rgba(239, 68, 68, 0.6)", border: "rgba(239,68,68,1)" },   // red
      { bg: "rgba(245, 158, 11, 0.6)", border: "rgba(245,158,11,1)" }, // amber
      { bg: "rgba(20, 184, 166, 0.6)", border: "rgba(20,184,166,1)" }, // teal
      { bg: "rgba(217, 70, 239, 0.6)", border: "rgba(217,70,239,1)" }, // fuchsia
      { bg: "rgba(99, 102, 241, 0.6)", border: "rgba(99,102,241,1)" }, // indigo
    ];
    if (i < palette.length) return palette[i];
    const hue = (i * 47) % 360;
    return { bg: `hsla(${hue}, 70%, 55%, 0.6)`, border: `hsla(${hue}, 70%, 45%, 1)` };
    };

  if (!user) return null;

  return (
    <div className="dashboard-container analytics">
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onLogout={() => {
          localStorage.clear();
          navigate("/login");
        }}
        displayName={displayName}
        email={user?.email}
      />

      <div className="dashboard-header">
        <div className="header-content">
          <div className="header-left">
            <h1>Analytics</h1>
          </div>
          <div className="header-right">
            <button
              className="menu-button circle"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open sidebar"
              title="Open menu"
            >
              ☰
            </button>
          </div>
        </div>
      </div>

      <div className="data-section">
        <h2>Average Usage per Day of Week (By Machine)</h2>

        <div className="controls">
          <label className="control">
            <span>Machines to display:</span>
            <span className="select-wrap">
              <select
                value={topN}
                onChange={(e) => setTopN(parseInt(e.target.value))}
                className="select"
              >
                <option value={3}>Top 3</option>
                <option value={5}>Top 5</option>
                <option value={6}>Top 6</option>
                <option value={8}>Top 8</option>
                <option value={999}>All</option>
              </select>
            </span>
          </label>
        </div> 

        <div className="row">
          <div className="chart-card" style={{ maxWidth: 1200 }}>
            <div className="chart" style={{ height: "480px" }}>
              {loading ? (
                <div style={{ color: "#e5e7eb" }}>Loading…</div>
              ) : rawData.length === 0 ? (
                <div style={{ color: "#e5e7eb" }}>No data available.</div>
              ) : (
                <canvas ref={chartRef} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
