import { BrowserCounterService } from "./browser-counter.service";
import { NoopFileSystemService } from "./noop-filesystem.service";
import { BrowserSettingsService } from "./browser-settings.service";

export interface Dependencies {
  counterService: BrowserCounterService;
  fsService: NoopFileSystemService;
  settingsService: BrowserSettingsService;
}

export function createDependencies(): Dependencies {
  return {
    counterService: new BrowserCounterService(),
    fsService: new NoopFileSystemService(),
    settingsService: new BrowserSettingsService(),
  };
}
