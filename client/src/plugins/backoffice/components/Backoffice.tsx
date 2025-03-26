import { Component, For, Show } from 'solid-js';
import { backofficeStore } from '../store';
import styles from './Backoffice.module.scss';

export const Backoffice: Component = () => {
  return (
    <div class={styles.backoffice}>
      <aside class={styles.sidebar}>
        <For each={backofficeStore.plugins()}>
          {(plugin) => (
            <button
              class={styles.pluginButton}
              classList={{ [styles.active]: backofficeStore.activePluginId() === plugin.id }}
              onClick={() => backofficeStore.setActivePlugin(plugin.id)}
            >
              <span class={styles.icon}>{plugin.icon}</span>
              <span class={styles.name}>{plugin.name}</span>
            </button>
          )}
        </For>
      </aside>
      <main class={styles.content}>
        <Show 
          when={backofficeStore.activePluginId()} 
          fallback={<div class={styles.welcome}>Select a plugin to begin</div>}
        >
          {(id) => {
            const plugin = backofficeStore.getPlugin(id());
            if (!plugin) return null;
            const Content = plugin.content;
            return <Content />;
          }}
        </Show>
      </main>
    </div>
  );
}; 