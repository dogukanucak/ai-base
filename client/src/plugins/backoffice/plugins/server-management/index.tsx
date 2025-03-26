import { Component } from 'solid-js';
import { BackofficePlugin } from '../../types';
import { ServerManagement } from './ServerManagement';

const ServerManagementContent: Component = () => {
  return (
    <div class="server-management">
      <h2>Server Management</h2>
      <p>Server management features will be implemented here.</p>
    </div>
  );
};

export class ServerManagementPlugin implements BackofficePlugin {
  id = 'server-management';
  name = 'Server Management';
  icon = '🖥️';
  content = ServerManagement;
} 