import { Registration, ResolveArg } from "./types";

import DIContainer from "./container/DIContainer";

import BaseDefinition from "./definitions/BaseDefinition";
import { object, value, get, factory } from "./definitions/DefinitionBuilders";

import ImplementationIsMissingError from "./errors/ImplementationIsMissingError";

export class Container {
    private readonly container: DIContainer = new DIContainer();

    private constructor() {}

    static register(registrations: Registration[]): void {
        this.instance.register(registrations);
    }

    static resolve<T>(type: ResolveArg<T>): T {
        return this.instance.resolve<T>(type);
    }

    private static _instance: Container | null;
    private static get instance(): Container {
        if (!this._instance) {
            this._instance = new Container();
        }

        return this._instance;
    }

    static dispose() {
        this._instance = null;
    }

    register(registrations: Registration[]): void {
        for (const registration of registrations) {
            const dependencies = this.registerDependencies(registration);

            this.registerParent(registration, dependencies);
        }
    }

    resolve<T>(type: ResolveArg<T>): T {
        return this.container.resolve(type);
    }

    private registerParent(
        registration: Registration,
        dependencies: BaseDefinition[]
    ) {
        if (registration.isInterface) {
            if (!registration.implementation)
                throw new ImplementationIsMissingError(registration.type);

            this.container.register(
                registration.type,
                registration.implementation.prototype?.constructor
                    ? object(registration.implementation, registration.mode)
                    : value(registration.implementation)
            );

            return;
        }

        if (registration.isFactory) {
            this.container.register(
                registration.type.name,
                factory((resolver) => {
                    return new registration.type(resolver);
                })
            );

            return;
        }

        this.container.register(
            registration.type.name,
            object(
                registration.implementation ?? registration.type,
                registration.mode
            ).construct(...dependencies)
        );
    }

    private registerDependencies(registration: Registration) {
        const injections: BaseDefinition[] = [];

        for (const dependency of registration.dependencies) {
            const { type, isInterface, mode } = dependency;

            if (isInterface) {
                injections.push(get(type));

                continue;
            }

            injections.push(get(type.name));

            this.container.register(type.name, object(type, mode));
        }

        return injections;
    }
}
