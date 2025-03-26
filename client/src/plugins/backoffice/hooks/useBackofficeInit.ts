import { onMount } from "solid-js";
import { backofficeStore } from "../store";
import { ServerManagementPlugin } from "../plugins/server-management";
import { EnvEditorPlugin } from "../plugins/env-editor";

export const useBackofficeInit = () => {
  onMount(() => {
    console.log("Initializing backoffice plugins...");

    // Register default plugins
    const serverManagement = new ServerManagementPlugin();
    const envEditor = new EnvEditorPlugin();

    console.log("Registering plugins:", { serverManagement, envEditor });

    backofficeStore.registerPlugin(serverManagement);
    backofficeStore.registerPlugin(envEditor);

    // Set first plugin as active
    const plugins = backofficeStore.plugins();
    console.log("Available plugins:", plugins);

    if (plugins.length > 0) {
      console.log("Setting active plugin:", plugins[0].id);
      backofficeStore.setActivePlugin(plugins[0].id);
    }
  });

  return backofficeStore;
};
