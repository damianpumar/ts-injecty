import BaseDefinition from "../definitions/BaseDefinition";
import { ResolveArg } from "../types";

export type Definitions = Record<string, BaseDefinition>;

export interface IDIContainer {
    resolve<T>(type: ResolveArg<T>, parentDeps?: string[]): T;
    addDefinition(name: string, definition: BaseDefinition | any): void;
    addDefinitions(definitions: Definitions | any): void;
}
