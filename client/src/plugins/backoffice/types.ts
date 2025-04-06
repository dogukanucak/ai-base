import type { Component } from "solid-js";

export interface BackofficePlugin {
  id: string;
  name: string;
  icon: string;
  content: Component;
}

export interface ServerStatus {
  isRunning: boolean;
  uptime: number;
  memory: {
    used: number;
    total: number;
  };
  cpu: number;
}

export interface EnvVariable {
  key: string;
  value: string;
  isSecret?: boolean;
  description?: string;
}
