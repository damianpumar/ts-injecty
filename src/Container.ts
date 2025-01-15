import { Registration, ResolveArg } from "./types";

import DIContainer from "./container/DIContainer";
import { IDIContainer } from "./container/IDIContainer";

import Definition from "./definitions/Definition";
import { object, value, get, factory } from "./definitions/DefinitionBuilders";

import ImplementationIsMissingError from "./errors/ImplementationIsMissingError";

export class Container {
    private readonly container: IDIContainer = new DIContainer();
    private static _instance: Container | null = null;

    private constructor() {}

    static register(registrations: Registration[]): void {
        this.instance.register(registrations);
    }

    static resolve<T>(type: ResolveArg<T>): T {
        return this.instance.resolve<T>(type);
    }

    static dispose() {
        this._instance = null;
    }

    private static get instance(): Container {
        if (!this._instance) {
            this._instance = new Container();
        }
        return this._instance;
    }

    register(registrations: Registration[]): void {
        registrations.forEach((registration) => {
            const dependencies = this.registerDeps(registration);

            this.registerDependency(registration, dependencies);
        });
    }

    resolve<T>(type: ResolveArg<T>): T {
        return this.container.resolve(type);
    }

    private registerDependency(
        registration: Registration,
        dependencies: Definition[]
    ) {
        if (registration.isInterface) {
            this.registerInterface(registration);
        } else if (registration.isFactory) {
            this.registerFactory(registration);
        } else {
            this.registerClass(registration, dependencies);
        }
    }

    private registerInterface(registration: Registration) {
        if (!registration.implementation) {
            throw new ImplementationIsMissingError(registration.type);
        }
        this.container.register(
            registration.type,
            registration.implementation.prototype?.constructor
                ? object(registration.implementation, registration.mode)
                : value(registration.implementation)
        );
    }

    private registerFactory(registration: Registration) {
        this.container.register(
            registration.type.name,
            factory((resolver) => new registration.type(resolver))
        );
    }

    private registerClass(
        registration: Registration,
        dependencies: Definition[]
    ) {
        this.container.register(
            registration.type.name,
            object(
                registration.implementation ?? registration.type,
                registration.mode
            ).construct(...dependencies)
        );
    }

    private registerDeps(registration: Registration): Definition[] {
        return registration.dependencies.map((dependency) => {
            const { type, isInterface, mode } = dependency;

            const injection = get(isInterface ? type : type.name);

            if (!isInterface) {
                this.container.register(type.name, object(type, mode));
            }

            return injection;
        });
    }
}
