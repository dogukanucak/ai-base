import { Component } from "solid-js";

export interface BackofficePlugin {
  id: string;
  name: string;
  icon: string;
  content: Component;
}
