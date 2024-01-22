import { ResolveArg } from "../types";

import { Definitions, IDIContainer } from "./IDIContainer";

import BaseDefinition from "../definitions/BaseDefinition";
import ValueDefinition from "../definitions/ValueDefinition";
import ObjectDefinition from "../definitions/ObjectDefinition";

import DependencyIsMissingError from "../errors/DependencyIsMissingError";
import CircularDependencyError from "../errors/CircularDependencyError";
import ExistingDefinition from "../definitions/ExistingDefinition";

export default class DIContainer implements IDIContainer {
    private definitions: Definitions = {};
    private resolved: {
        [name: string]: any;
    } = {};

    resolve<T>(type: ResolveArg<T>, parentDeps?: string[]): T {
        if (typeof type === "string") return this.get<T>(type, parentDeps);

        return this.get<T>(type.name, parentDeps);
    }

    register(name: string, definition: BaseDefinition | string) {
        if (name in this.definitions) return;

        if (!(definition instanceof BaseDefinition)) {
            definition = new ValueDefinition(definition);
        }

        this.definitions[name] = definition;
    }

    private get<T>(name: string, parentDeps: string[] = []): T {
        if (!(name in this.definitions)) {
            throw new DependencyIsMissingError(name);
        }

        const definition = this.definitions[name];

        if (definition.isSingleton() && !!this.resolved[name]) {
            return this.resolved[name];
        }

        parentDeps.push(name);

        try {
            this.resolved[name] = definition.resolve<T>(this, parentDeps);
        } catch (error) {
            throw new CircularDependencyError(name, parentDeps);
        }

        return this.resolved[name];
    }
}
