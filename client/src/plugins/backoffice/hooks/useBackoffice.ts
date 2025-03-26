import { onMount } from "solid-js";
import { backofficeStore } from "../store";
import { plugins } from "../plugins";

export const useBackoffice = () => {
  onMount(() => {
    // Register all default plugins
    plugins.forEach((plugin) => {
      backofficeStore.registerPlugin(plugin);
    });

    // Set the first plugin as active by default
    if (plugins.length > 0) {
      backofficeStore.setActivePlugin(plugins[0].id);
    }
  });

  return {
    plugins: backofficeStore.plugins,
    activePluginId: backofficeStore.activePluginId,
    setActivePlugin: backofficeStore.setActivePlugin,
    registerPlugin: backofficeStore.registerPlugin,
    unregisterPlugin: backofficeStore.unregisterPlugin,
  };
};
