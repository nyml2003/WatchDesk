export {};

import type { ElectronAPI } from "@watchdesk/contracts";

declare global {
  interface Window {
    readonly electronAPI: ElectronAPI;
  }
}
