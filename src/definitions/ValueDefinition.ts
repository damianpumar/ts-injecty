import BaseDefinition from "./BaseDefinition";

export default class ValueDefinition extends BaseDefinition {
    constructor(private readonly value: any) {
        super("singleton");
    }

    resolve<T>(): T {
        return this.value as T;
    }
}
