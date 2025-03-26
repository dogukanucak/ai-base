import { createSignal, Accessor, Setter } from "solid-js";
import { BackofficePlugin } from "./types";

type Signal<T> = [get: Accessor<T>, set: Setter<T>];

class BackofficeStore {
  private pluginsSignal: Signal<BackofficePlugin[]>;
  private activePluginIdSignal: Signal<string | null>;

  constructor() {
    this.pluginsSignal = createSignal<BackofficePlugin[]>([]);
    this.activePluginIdSignal = createSignal<string | null>(null);
  }

  plugins = () => this.pluginsSignal[0]();
  activePluginId = () => this.activePluginIdSignal[0]();

  registerPlugin(plugin: BackofficePlugin) {
    const currentPlugins = this.plugins();
    if (!currentPlugins.find((p) => p.id === plugin.id)) {
      this.pluginsSignal[1]([...currentPlugins, plugin]);
      console.log("Plugin registered:", plugin.id);
      console.log("Current plugins:", this.plugins());
    }
  }

  unregisterPlugin(pluginId: string) {
    this.pluginsSignal[1](this.plugins().filter((p) => p.id !== pluginId));
  }

  setActivePlugin(pluginId: string | null) {
    console.log("Setting active plugin:", pluginId);
    this.activePluginIdSignal[1](pluginId);
  }

  getPlugin(pluginId: string): BackofficePlugin | undefined {
    const plugin = this.plugins().find((p) => p.id === pluginId);
    console.log("Getting plugin:", pluginId, plugin);
    return plugin;
  }
}

export const backofficeStore = new BackofficeStore();
