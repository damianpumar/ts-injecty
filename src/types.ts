import { Resolver } from "./definitions/FactoryDefinition";

export type Mode = "singleton" | "transient";

export abstract class Factory {
    constructor(protected readonly resolver: Resolver) {}
}

export class Registration {
    public constructor(
        public readonly mode: Mode,
        public readonly type: any,
        public readonly dependencies: Registration[],
        public readonly implementation?: any
    ) {}

    get isInterface(): boolean {
        return typeof this.type === "string";
    }

    get isFactory() {
        return this.type.prototype instanceof Factory;
    }
}

export type ClassReference = abstract new (...args: any) => any;

export interface Class<T> extends Function {
    new (...args: any[]): T;
}

export type ResolveArg<T> = string | Class<T>;

export type DependencyArg<R, T> = R extends string
    ? never
    : string | Function | Class<T>;

export type ImplementationArg<R> = R extends string
    ? Function | ClassReference | object
    : unknown;

export interface Build {
    build: () => Registration;
}

export type ConstructorTypes<T> = T extends abstract new (
    ...args: infer P
) => any
    ? ConstructorParameters<T>
    : never;

type Length<T extends Array<any>> = T extends { length: infer L } ? L : never;
type HasDeps<T extends Array<any>> = Length<T> extends 0 ? false : true;

type TypedFunction<T> = () => T;

type Dep<R, N> = N extends number
    ?
          | string // Reference of an object previously registered
          | Class<ConstructorTypes<R>[N]> // Class reference
          | Typed<Class<ConstructorTypes<R>[N]>> // Class instance
          | TypedFunction<Typed<Class<ConstructorTypes<R>[N]>>> // Function return instance
    : never;

interface SevenDepParams<R> {
    withDependencies: (
        ...dep: Length<ConstructorTypes<R>> extends 7
            ? [
                  Dep<R, 0>,
                  Dep<R, 1>,
                  Dep<R, 2>,
                  Dep<R, 3>,
                  Dep<R, 4>,
                  Dep<R, 5>,
                  Dep<R, 6>
              ]
            : never
    ) => Build;
}

interface SixDepParams<R> {
    withDependencies: (
        ...dep: Length<ConstructorTypes<R>> extends 6
            ? [Dep<R, 0>, Dep<R, 1>, Dep<R, 2>, Dep<R, 3>, Dep<R, 4>, Dep<R, 5>]
            : never
    ) => Build;
}

interface FiveDepParams<R> {
    withDependencies: (
        ...dep: Length<ConstructorTypes<R>> extends 5
            ? [Dep<R, 0>, Dep<R, 1>, Dep<R, 2>, Dep<R, 3>, Dep<R, 4>]
            : never
    ) => Build;
}

interface FourDepParams<R> {
    withDependencies: (
        ...dep: Length<ConstructorTypes<R>> extends 4
            ? [Dep<R, 0>, Dep<R, 1>, Dep<R, 2>, Dep<R, 3>]
            : never
    ) => Build;
}

interface ThreeDepParams<R> {
    withDependencies: (
        ...dep: Length<ConstructorTypes<R>> extends 3
            ? [Dep<R, 0>, Dep<R, 1>, Dep<R, 2>]
            : never
    ) => Build;
}

interface TwoDepParams<R> {
    withDependencies: (
        ...dep: Length<ConstructorTypes<R>> extends 2
            ? [Dep<R, 0>, Dep<R, 1>]
            : never
    ) => Build;
}

interface OneDepParam<R> {
    withDependency: (dep: Dep<R, 0>) => Build;
}

interface Scope<R> {
    asASingleton: () => Length<ConstructorTypes<R>> extends 0
        ? ClassImplementation<R>
        : Dependency<R>;
}

type Typed<R> = R extends Class<infer L> ? L : never;

interface ClassImplementation<R> extends Build {
    withImplementation: (implementation: Typed<R>) => Build;
}

interface StringRegisterType<R> {
    withImplementation: (parameter: ImplementationArg<R>) => Build;
    withDynamic: (parameter: Function) => Build;
}

type Dependency<R> = Length<ConstructorTypes<R>> extends 1
    ? OneDepParam<R>
    : Length<ConstructorTypes<R>> extends 2
    ? TwoDepParams<R>
    : Length<ConstructorTypes<R>> extends 3
    ? ThreeDepParams<R>
    : Length<ConstructorTypes<R>> extends 4
    ? FourDepParams<R>
    : Length<ConstructorTypes<R>> extends 5
    ? FiveDepParams<R>
    : Length<ConstructorTypes<R>> extends 6
    ? SixDepParams<R>
    : Length<ConstructorTypes<R>> extends 7
    ? SevenDepParams<R>
    : Scope<R>;

type FactoryImplementation<R> = ConstructorTypes<R>[0] extends Resolver
    ? Build
    : never;

type ClassRegisterType<R> =
    | FactoryImplementation<R>
    | HasDeps<ConstructorTypes<R>> extends true
    ? Dependency<R> & Scope<R>
    : Scope<R> & Dependency<R> & ClassImplementation<R>;

export type RegisterType<R> = R extends string
    ? StringRegisterType<R>
    : ClassRegisterType<R>;
