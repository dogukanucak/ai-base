import { createSignal } from "solid-js";
import type { BackofficePlugin } from "../types";

const [plugins, setPlugins] = createSignal<BackofficePlugin[]>([]);
const [activePluginId, setActivePluginId] = createSignal<string | null>(null);

export const backofficeStore = {
  plugins,
  activePluginId,
  registerPlugin: (plugin: BackofficePlugin) => {
    setPlugins((prev) => [...prev, plugin]);
  },
  unregisterPlugin: (pluginId: string) => {
    setPlugins((prev) => prev.filter((p) => p.id !== pluginId));
  },
  setActivePlugin: (pluginId: string | null) => {
    setActivePluginId(pluginId);
  },
  getPlugin: (pluginId: string) => plugins().find((p) => p.id === pluginId),
};
