import { Ref, Mode } from "../types";
import BaseDefinition from "./BaseDefinition";
import { IDIContainer } from "../container/IDIContainer";
import MethodIsMissingError from "../errors/MethodIsMissingError";
import InvalidConstructorError from "../errors/InvalidConstructorError";

interface IExtraMethods {
    methodName: string;
    args: any;
}

export default class ObjectDefinition extends BaseDefinition {
    private readonly constructorFunction: Ref<any>;
    public _dependencies: Array<BaseDefinition | any> = [];
    private methods: IExtraMethods[] = [];

    constructor(constructorFunction: Ref<any>, mode: Mode = "transient") {
        super(mode);

        if (typeof constructorFunction !== "function") {
            throw new InvalidConstructorError();
        }

        this.constructorFunction = constructorFunction;
    }

    construct(...deps: BaseDefinition | any): this {
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
        const deps = this.dependencies.map((dep: BaseDefinition | any) => {
            if (dep instanceof BaseDefinition) {
                return dep.resolve(diContainer, parentDeps);
            }

            return dep;
        });

        const object = this.createObject(deps);

        this.methods.forEach((method: IExtraMethods) => {
            const { methodName, args } = method;
            if (object[methodName] === undefined) {
                throw new MethodIsMissingError(
                    object.constructor.name,
                    methodName
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
    }

    get dependencies() {
        return this._dependencies;
    }

    private createObject = (deps: Array<BaseDefinition | any>) => {
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

    private set dependencies(deps: Array<BaseDefinition | any>) {
        this._dependencies = deps;
    }
}
