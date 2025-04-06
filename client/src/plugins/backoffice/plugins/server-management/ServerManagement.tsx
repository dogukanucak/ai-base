import { createSignal, createEffect } from "solid-js";
import type { ServerStatus } from "../../types";
import styles from "./ServerManagement.module.scss";

export const ServerManagement = () => {
  const [status, setStatus] = createSignal<ServerStatus>({
    isRunning: false,
    uptime: 0,
    memory: { used: 0, total: 0 },
    cpu: 0,
  });

  const fetchStatus = async () => {
    try {
      const response = await fetch("/api/server/status");
      const data = await response.json();
      setStatus(data);
    } catch (error) {
      console.error("Failed to fetch server status:", error);
    }
  };

  const handleServerAction = async (action: "start" | "stop" | "restart") => {
    try {
      await fetch(`/api/server/${action}`, { method: "POST" });
      await fetchStatus();
    } catch (error) {
      console.error(`Failed to ${action} server:`, error);
    }
  };

  createEffect(() => {
    const interval = setInterval(fetchStatus, 5000);
    fetchStatus();
    return () => clearInterval(interval);
  });

  return (
    <div class={styles.serverManagement}>
      <h2>Server Management</h2>

      <div class={styles.statusCard}>
        <div class={styles.statusHeader}>
          <h3>Server Status</h3>
          <span
            class={`${styles.statusIndicator} ${status().isRunning ? styles.running : styles.stopped}`}
          >
            {status().isRunning ? "Running" : "Stopped"}
          </span>
        </div>

        <div class={styles.metrics}>
          <div class={styles.metric}>
            <label>Uptime</label>
            <span>
              {Math.floor(status().uptime / 3600)}h {Math.floor((status().uptime % 3600) / 60)}m
            </span>
          </div>
          <div class={styles.metric}>
            <label>Memory Usage</label>
            <span>
              {Math.round(status().memory.used / 1024 / 1024)}MB /{" "}
              {Math.round(status().memory.total / 1024 / 1024)}MB
            </span>
          </div>
          <div class={styles.metric}>
            <label>CPU Usage</label>
            <span>{status().cpu.toFixed(1)}%</span>
          </div>
        </div>

        <div class={styles.actions}>
          <button
            class={`${styles.actionButton} ${styles.start}`}
            onClick={() => handleServerAction("start")}
            disabled={status().isRunning}
          >
            Start Server
          </button>
          <button
            class={`${styles.actionButton} ${styles.stop}`}
            onClick={() => handleServerAction("stop")}
            disabled={!status().isRunning}
          >
            Stop Server
          </button>
          <button
            class={`${styles.actionButton} ${styles.restart}`}
            onClick={() => handleServerAction("restart")}
            disabled={!status().isRunning}
          >
            Restart Server
          </button>
        </div>
      </div>
    </div>
  );
};
