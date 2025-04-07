import type { BackofficePlugin } from "../types";
import { EnvEditor } from "./env-editor/EnvEditor";
import { ServerManagement } from "./server-management/ServerManagement";

export const plugins: BackofficePlugin[] = [
  {
    id: "server-management",
    name: "Server Management",
    description: "Monitor and control server status",
    icon: "🖥️",
    component: ServerManagement,
  },
  {
    id: "env-editor",
    name: "Environment Variables",
    description: "View and edit environment variables",
    icon: "⚙️",
    component: EnvEditor,
  },
];
