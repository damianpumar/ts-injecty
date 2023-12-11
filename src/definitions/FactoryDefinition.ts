import BaseDefinition from "./BaseDefinition";
import { IDIContainer } from "../container/IDIContainer";
import { Mode, ResolveArg } from "../types";

export interface Resolver {
    resolve<T>(type: ResolveArg<T>): T;
}

export type FactoryType = (resolver: Resolver) => any;

export default class FactoryDefinition extends BaseDefinition {
    constructor(private readonly factory: FactoryType) {
        super(Mode.TRANSIENT);
    }

    resolve<T>(container: IDIContainer): T {
        return this.factory(container as Resolver);
    }
}
