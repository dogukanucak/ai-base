import { backofficeStore } from "./store";
import { ServerManagementPlugin } from "./plugins/server-management";
import { EnvEditorPlugin } from "./plugins/env-editor";

export function initializeBackofficePlugins() {
  // Register all plugins
  backofficeStore.registerPlugin(new ServerManagementPlugin());
  backofficeStore.registerPlugin(new EnvEditorPlugin());
}
