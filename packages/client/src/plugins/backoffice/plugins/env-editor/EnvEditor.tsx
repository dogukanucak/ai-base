import { For, createEffect, createSignal } from "solid-js";
import type { EnvVariable } from "../../types";
import styles from "./EnvEditor.module.scss";

export const EnvEditor = () => {
  const [variables, setVariables] = createSignal<EnvVariable[]>([]);
  const [editingVar, setEditingVar] = createSignal<string | null>(null);
  const [newValue, setNewValue] = createSignal<string>("");

  const fetchEnvVariables = async () => {
    try {
      const response = await fetch("/api/env/variables");
      const data = await response.json();
      setVariables(data);
    } catch (error) {
      console.error("Failed to fetch environment variables:", error);
    }
  };

  const updateVariable = async (key: string, value: string) => {
    try {
      await fetch("/api/env/variables", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, value }),
      });
      await fetchEnvVariables();
      setEditingVar(null);
    } catch (error) {
      console.error("Failed to update environment variable:", error);
    }
  };

  createEffect(() => {
    fetchEnvVariables();
  });

  const startEditing = (variable: EnvVariable) => {
    setEditingVar(variable.key);
    setNewValue(variable.value);
  };

  const cancelEditing = () => {
    setEditingVar(null);
    setNewValue("");
  };

  return (
    <div class={styles.envEditor}>
      <h2>Environment Variables</h2>

      <div class={styles.variablesList}>
        <For each={variables()}>
          {(variable) => (
            <div class={styles.variableItem}>
              <div class={styles.variableInfo}>
                <span class={styles.variableKey}>{variable.key}</span>
                {editingVar() === variable.key ? (
                  <div class={styles.editActions}>
                    <input
                      type={variable.isSecret ? "password" : "text"}
                      value={newValue()}
                      onInput={(e) => setNewValue(e.currentTarget.value)}
                      class={styles.valueInput}
                    />
                    <button
                      class={styles.saveButton}
                      onClick={() => updateVariable(variable.key, newValue())}
                      type="button"
                    >
                      Save
                    </button>
                    <button class={styles.cancelButton} onClick={cancelEditing} type="button">
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div class={styles.valueDisplay}>
                    <span class={variable.isSecret ? styles.secretValue : ""}>
                      {variable.isSecret ? "••••••••" : variable.value}
                    </span>
                    <button
                      class={styles.editButton}
                      onClick={() => startEditing(variable)}
                      type="button"
                    >
                      Edit
                    </button>
                  </div>
                )}
              </div>
              {variable.description && <p class={styles.description}>{variable.description}</p>}
            </div>
          )}
        </For>
      </div>
    </div>
  );
};
