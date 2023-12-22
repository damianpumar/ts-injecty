import BaseDefinition from "./BaseDefinition";
import { IDIContainer } from "../container/IDIContainer";
import { ResolveArg } from "../types";

export interface Resolver {
    resolve<T>(type: ResolveArg<T>): T;
}

export type Factory = (resolver: Resolver) => any;

export default class FactoryDefinition extends BaseDefinition {
    constructor(private readonly factory: Factory) {
        super("transient");
    }

    resolve<T>(container: IDIContainer): T {
        return this.factory(container as Resolver);
    }
}
