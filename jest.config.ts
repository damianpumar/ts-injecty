import { Config } from "@jest/types";

const config: Config.InitialOptions = {
    preset: "ts-jest",
    testEnvironment: "node",
    modulePaths: ["<rootDir>/src/"],
    modulePathIgnorePatterns: ["dist/", "fakeClasses.ts"],
};

export default config;
