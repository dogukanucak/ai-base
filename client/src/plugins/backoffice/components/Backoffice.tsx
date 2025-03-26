import { Component, For, Show, createEffect, createMemo } from 'solid-js';
import { backofficeStore } from '../store';
import styles from './Backoffice.module.scss';
import type { BackofficePlugin } from '../types';

export const Backoffice: Component = () => {
  const activePlugin = createMemo(() => {
    const activeId = backofficeStore.activePluginId();
    const plugin = activeId ? backofficeStore.getPlugin(activeId) : null;
    console.log('Active plugin memo:', { activeId, plugin });
    return plugin;
  });

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
          when={activePlugin()}
          keyed
          fallback={<div class={styles.welcome}>Select a plugin to begin</div>}
        >
          {(plugin) => {
            console.log('Rendering plugin content:', plugin.id);
            const Content = plugin.content;
            return <Content />;
          }}
        </Show>
      </main>
    </div>
  );
}; 