import { Component } from 'solid-js';
import { BackofficePlugin } from '../../types';
import { EnvEditor } from './EnvEditor';

export class EnvEditorPlugin implements BackofficePlugin {
  id = 'env-editor';
  name = 'Environment Variables';
  icon = '📝';
  content = EnvEditor;
} 