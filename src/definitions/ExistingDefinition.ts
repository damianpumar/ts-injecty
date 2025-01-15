import Definition from "./Definition";
import { IDIContainer } from "../container/IDIContainer";

export default class ExistingDefinition extends Definition {
    constructor(public readonly name: string) {
        super("transient");
    }

    resolve<T>(container: IDIContainer, parentDeps: string[] = []): T {
        return container.resolve(this.name, parentDeps);
    }
}
