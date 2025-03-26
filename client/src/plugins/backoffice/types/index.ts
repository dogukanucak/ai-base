export interface BackofficePlugin {
  id: string;
  name: string;
  description: string;
  icon?: string;
  component: () => JSX.Element;
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
  description?: string;
  isSecret?: boolean;
}
