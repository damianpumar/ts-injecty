import BaseDefinition, { Mode } from "./BaseDefinition";
import { IDIContainer } from "../container/IDIContainer";

export type Factory = (container: IDIContainer) => any;

export default class FactoryDefinition extends BaseDefinition {
    constructor(private readonly factory: Factory) {
        super(Mode.SINGLETON);
    }

    resolve<T>(container: IDIContainer): T {
        return this.factory(container);
    }
}
