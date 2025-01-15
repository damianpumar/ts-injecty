import Definition from "./Definition";

export default class ValueDefinition extends Definition {
    constructor(private readonly value: any) {
        super("singleton");
    }

    resolve<T>(): T {
        return this.value as T;
    }
}
