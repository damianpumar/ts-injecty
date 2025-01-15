import { ResolveArg } from "../types";
import { Definitions, IDIContainer } from "./IDIContainer";
import Definition from "../definitions/Definition";
import ValueDefinition from "../definitions/ValueDefinition";
import DependencyIsMissingError from "../errors/DependencyIsMissingError";
import CircularDependencyError from "../errors/CircularDependencyError";

export default class DIContainer implements IDIContainer {
    private definitions: Definitions = {};
    private resolved: Record<string, any> = {};

    resolve<T>(type: ResolveArg<T>, deps: string[] = []): T {
        const isInterface = typeof type === "string";

        if (isInterface) return this.get<T>(type, deps);

        return this.get<T>(type.name, deps);
    }

    register(name: string, definition: Definition | string): void {
        if (this.definitions[name]) return;

        if (!(definition instanceof Definition)) {
            definition = new ValueDefinition(definition);
        }

        this.definitions[name] = definition;
    }

    private get<T>(name: string, parentDeps: string[]): T {
        if (!this.definitions[name]) {
            throw new DependencyIsMissingError(name);
        }

        const definition = this.definitions[name];

        if (definition.isSingleton() && this.resolved[name]) {
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
