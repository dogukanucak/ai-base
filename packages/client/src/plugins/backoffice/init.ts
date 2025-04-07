import { EnvEditorPlugin } from "./plugins/env-editor";
import { ServerManagementPlugin } from "./plugins/server-management";
import { backofficeStore } from "./store";

export function initializeBackofficePlugins() {
  // Register all plugins
  backofficeStore.registerPlugin(new ServerManagementPlugin());
  backofficeStore.registerPlugin(new EnvEditorPlugin());
}
