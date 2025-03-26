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

  plugins: Accessor<BackofficePlugin[]> = () => this.pluginsSignal[0]();
  activePluginId: Accessor<string | null> = () => this.activePluginIdSignal[0]();

  registerPlugin(plugin: BackofficePlugin) {
    this.pluginsSignal[1]([...this.plugins(), plugin]);
  }

  unregisterPlugin(pluginId: string) {
    this.pluginsSignal[1](this.plugins().filter((p) => p.id !== pluginId));
  }

  setActivePlugin(pluginId: string | null) {
    this.activePluginIdSignal[1](pluginId);
  }

  getPlugin(pluginId: string): BackofficePlugin | undefined {
    return this.plugins().find((p) => p.id === pluginId);
  }
}

export const backofficeStore = new BackofficeStore();
