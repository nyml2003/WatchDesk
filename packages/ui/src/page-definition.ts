import type { JSX } from "solid-js";

export interface PageDefinition {
  readonly id: string;
  readonly label: string;
  readonly icon: string;
  render(): JSX.Element;
}
