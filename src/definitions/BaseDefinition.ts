import { Mode } from "../types";
import { IDIContainer } from "../container/IDIContainer";

export default abstract class BaseDefinition {
    constructor(public readonly mode: Mode) {}

    abstract resolve<T>(container: IDIContainer, parentDeps?: string[]): T;

    isSingleton(): boolean {
        return this.mode === "singleton";
    }
}
