import { Component } from 'solid-js';
import { BackofficePlugin } from '../../types';

const EnvEditorContent: Component = () => {
  return (
    <div class="env-editor">
      <h2>Environment Variables</h2>
      <p>Environment variable management will be implemented here.</p>
    </div>
  );
};

export class EnvEditorPlugin implements BackofficePlugin {
  id = 'env-editor';
  name = 'Environment Variables';
  icon = '📝';
  content = () => <EnvEditorContent />;
} 