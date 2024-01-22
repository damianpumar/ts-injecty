import DIContainer from "../container/DIContainer";

import { object, value, get, factory } from "../definitions/DefinitionBuilders";
import { Foo } from "./fakeClasses";

import DependencyIsMissingError from "../errors/DependencyIsMissingError";

describe("DIContainer", () => {
    test("it adds and resolves definitions", () => {
        const container = new DIContainer();
        container.register("foo", object(Foo));
        container.register("key1", value("value1"));

        const foo = container.resolve("foo");
        expect(foo).toBeInstanceOf(Foo);
        expect(container.resolve("key1")).toEqual("value1");
    });

    test("it throws an error if definition is missing during resolution", () => {
        const container = new DIContainer();
        expect(() => {
            container.resolve("Logger");
        }).toThrow(new DependencyIsMissingError("Logger"));
    });

    test("it always returns singleton", () => {
        const container = new DIContainer();
        container.register("foo", object(Foo, "singleton").construct("name1"));

        const foo = container.resolve<Foo>("foo");
        expect(foo.name).toEqual("name1");

        foo.name = "name2";
        const foo2 = container.resolve<Foo>("foo");
        expect(foo2.name).toEqual("name2");
    });

    test("it always returns transient", () => {
        const container = new DIContainer();
        container.register("foo", object(Foo).construct("name1"));

        const foo = container.resolve<Foo>("foo");
        expect(foo.name).toEqual("name1");

        foo.name = "name2";
        const foo2 = container.resolve<Foo>("foo");
        expect(foo2.name).not.toEqual("name2");
    });

    test("it adds definition to existing list", () => {
        const container = new DIContainer();
        container.register("key1", value("value1"));
        container.register("key2", value("value2"));

        expect(container.resolve("key1")).toEqual("value1");
        expect(container.resolve("key2")).toEqual("value2");
    });

    test("it adds definitions to existing list", () => {
        const container = new DIContainer();
        container.register("key1", value("value1"));
        container.register("key2", value("value2"));
        container.register("key3", value("value3"));

        expect(container.resolve("key1")).toEqual("value1");
        expect(container.resolve("key2")).toEqual("value2");
        expect(container.resolve("key3")).toEqual("value3");
    });

    test("if value not an instance of BaseDefinition treat it as ValueDefinition", () => {
        const container = new DIContainer();

        container.register("key1", "value1");
        expect(container.resolve("key1")).toEqual("value1");

        container.register("key2", "value2");
        expect(container.resolve("key2")).toEqual("value2");
    });

    test("it resolves factory returning pending Promise", async () => {
        class TestUserRepository {
            private dbConnection: any;
            public constructor(private readonly dbConnectionPromise: any) {}
            async init() {
                this.dbConnection = await this.dbConnectionPromise;
            }
            async findUser() {
                await this.init();
                const dbConnection = this.dbConnection;
                return await new Promise((resolve) =>
                    setTimeout(() => {
                        resolve(`${dbConnection} + findUser`);
                    })
                );
            }
        }

        const container = new DIContainer();
        container.register("dsn", value("DSN-secret"));
        container.register(
            "dbConnection",
            factory((resolver) => {
                return new Promise((resolve) =>
                    setTimeout(() => {
                        resolve(resolver.resolve("dsn"));
                    })
                );
            })
        );
        container.register(
            "TestUserRepository",
            object(TestUserRepository).construct(get("dbConnection"))
        );

        const userRepository =
            container.resolve<TestUserRepository>("TestUserRepository");
        expect(await userRepository.findUser()).toBe("DSN-secret + findUser");
    });
});
