import { ResolveArg } from "../types";

import { Definitions, IDIContainer } from "./IDIContainer";

import BaseDefinition from "../definitions/BaseDefinition";
import ValueDefinition from "../definitions/ValueDefinition";
import ObjectDefinition from "../definitions/ObjectDefinition";

import DependencyIsMissingError from "../errors/DependencyIsMissingError";
import CircularDependencyError from "../errors/CircularDependencyError";

export default class DIContainer implements IDIContainer {
    private definitions: Definitions = {};
    private resolved: {
        [name: string]: any;
    } = {};

    resolve<T>(type: ResolveArg<T>, parentDeps?: string[]): T {
        if (typeof type === "string") return this.get<T>(type, parentDeps);

        return this.get<T>(type.name, parentDeps);
    }

    addDefinition(name: string, definition: BaseDefinition | any) {
        if (name in this.definitions) return;

        if (!(definition instanceof BaseDefinition)) {
            definition = new ValueDefinition(definition);
        }

        this.definitions[name] = definition;
    }

    addDefinitions(definitions: Definitions | any) {
        Object.keys(definitions).map((name: string) => {
            this.addDefinition(name, definitions[name]);
        });
    }

    private get<T>(name: string, parentDeps: string[] = []): T {
        if (!(name in this.definitions)) {
            throw new DependencyIsMissingError(name);
        }

        const definition = this.definitions[name];

        this.validateCircularResolution(parentDeps, name, definition);

        if (definition.isSingleton() && !!this.resolved[name]) {
            return this.resolved[name];
        }

        parentDeps.push(name);
        this.resolved[name] = definition.resolve<T>(this, parentDeps);

        return this.resolved[name];
    }

    private validateCircularResolution(
        parentDeps: string[],
        name: string,
        definition: BaseDefinition
    ) {
        if (!parentDeps.includes(name)) return;

        if (!(definition instanceof ObjectDefinition)) return;

        if (
            definition.dependencies.some((dependency) =>
                parentDeps.includes(dependency)
            )
        ) {
            throw new CircularDependencyError(name, parentDeps);
        }
    }
}
