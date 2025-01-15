import { Class, Mode } from "../types";
import Definition from "./Definition";
import { IDIContainer } from "../container/IDIContainer";
import MethodIsMissingError from "../errors/MethodIsMissingError";
import InvalidConstructorError from "../errors/InvalidConstructorError";

interface Methods {
    methodName: string;
    args: any;
}

export default class ObjectDefinition extends Definition {
    private readonly constructorFunction: Class<any>;
    public _dependencies: Array<Definition | any> = [];
    private methods: Methods[] = [];

    constructor(constructorFunction: Class<any>, mode: Mode = "transient") {
        super(mode);

        if (typeof constructorFunction !== "function") {
            throw new InvalidConstructorError();
        }

        this.constructorFunction = constructorFunction;
    }

    construct(...deps: Definition | any): this {
        this.dependencies = deps;
        return this;
    }

    method(methodName: string, ...args: any): this {
        this.methods.push({
            methodName,
            args,
        });
        return this;
    }

    resolve<T>(diContainer: IDIContainer, parentDeps: string[] = []): T {
        const deps = this.dependencies.map((dep: Definition | any) => {
            if (dep instanceof Definition) {
                return dep.resolve(diContainer, parentDeps);
            }

            return dep;
        });

        const object = this.createObject(deps);

        this.methods.forEach((method: Methods) => {
            const { methodName, args } = method;
            if (object[methodName] === undefined) {
                throw new MethodIsMissingError(
                    object.constructor.name,
                    methodName
                );
            }
            const resolvedArgs = args.map((arg: any) => {
                if (arg instanceof Definition) {
                    return arg.resolve(diContainer);
                }
                return arg;
            });
            object[methodName](...resolvedArgs);
        });

        return object;
    }

    get dependencies() {
        return this._dependencies;
    }

    private createObject = (deps: Array<Definition | any>) => {
        return this.isAClass()
            ? new this.constructorFunction(...deps)
            : (this.constructorFunction as any)();
    };

    private isAClass() {
        return (
            this.constructorFunction.prototype &&
            Object.hasOwn(this.constructorFunction.prototype, "constructor")
        );
    }

    private set dependencies(deps: Array<Definition | any>) {
        this._dependencies = deps;
    }
}
