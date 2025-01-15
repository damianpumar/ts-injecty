import Definition from "../definitions/Definition";
import { ResolveArg } from "../types";

export type Definitions = Record<string, Definition>;

export interface IDIContainer {
    resolve<T>(type: ResolveArg<T>, parentDeps?: string[]): T;
    register(name: string, definition: Definition | any): void;
}
