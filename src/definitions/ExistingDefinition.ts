import { Mode } from "../types";
import BaseDefinition from "./BaseDefinition";
import { IDIContainer } from "../container/IDIContainer";

export default class ExistingDefinition extends BaseDefinition {
    constructor(public readonly name: string) {
        super(Mode.TRANSIENT);
    }

    resolve<T>(container: IDIContainer, parentDeps: string[] = []): T {
        return container.resolve(this.name, parentDeps);
    }
}
