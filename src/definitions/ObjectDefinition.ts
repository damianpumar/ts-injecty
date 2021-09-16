import BaseDefinition from "../definitions/BaseDefinition";
import { IDIContainer } from "../DIContainer";
import { InvalidConstructorError, MethodIsMissingError } from "../errors";
import { IDefinition } from "./IDefinition";

export interface Type<C extends Object> {
    new (...args: any[]): C;
}

interface IExtraMethods<I> {
    methodName: keyof I;
    args: any;
}

type WithDefinitions<T extends any[]> = {
    [K in keyof T]: T[K] | IDefinition<T[K]>;
};
type ParametersWithDefinition<T extends (...args: any) => any> = T extends (
    ...args: infer P
) => any
    ? WithDefinitions<P>
    : never;
type MethodArgs<
    T extends Type<any>,
    K extends keyof InstanceType<T>
> = ParametersWithDefinition<InstanceType<T>[K]>;

/**
 * Definition to create object by provided class name
 */
export default class ObjectDefinition<T extends Type<any>>
    extends BaseDefinition<InstanceType<T>>
    implements IDefinition<InstanceType<T>> {
    private readonly constructorFunction: T;
    private deps: Array<IDefinition<any> | any> = [];
    private methods: IExtraMethods<InstanceType<T>>[] = [];

    constructor(constructorFunction: T) {
        super();
        if (typeof constructorFunction !== "function") {
            throw new InvalidConstructorError();
        }
        this.constructorFunction = constructorFunction;
    }

    construct(
        ...deps: T extends { new (...args: infer P): any }
            ? WithDefinitions<P>
            : never[]
    ): ObjectDefinition<T> {
        this.deps = deps;
        return this;
    }

    method<MethodName extends keyof InstanceType<T>>(
        methodName: MethodName,
        ...args: MethodArgs<T, MethodName>
    ): ObjectDefinition<T> {
        this.methods.push({
            methodName,
            args,
        });
        return this;
    }

    resolve = (
        diContainer: IDIContainer,
        parentDeps: string[] = []
    ): InstanceType<T> => {
        const deps = this.deps.map((dep: BaseDefinition | any) => {
            if (dep instanceof BaseDefinition) {
                return dep.resolve(diContainer, parentDeps);
            }
            return dep;
        });

        const object = new this.constructorFunction(...deps);
        this.methods.forEach((method: IExtraMethods<InstanceType<T>>) => {
            const { methodName, args } = method;
            if (object[methodName] === undefined) {
                throw new MethodIsMissingError(
                    object.constructor.name,
                    methodName as string
                );
            }
            const resolvedArgs = args.map((arg: any) => {
                if (arg instanceof BaseDefinition) {
                    return arg.resolve(diContainer);
                }
                return arg;
            });
            object[methodName](...resolvedArgs);
        });

        return object;
    };
}
