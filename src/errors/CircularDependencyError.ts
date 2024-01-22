import CustomError from "./CustomError";

export default class CircularDependencyError extends CustomError {
    constructor(name: string, path: string[]) {
        super(
            CircularDependencyError.name,
            CircularDependencyError.createMessage(name, path)
        );
    }

    private static createMessage(name: string, path: string[]) {
        const resolution: string[] = [];

        for (const dep of path) {
            if (!resolution.includes(dep)) {
                resolution.push(dep);
                continue;
            }

            resolution.push(`**${dep}**`);

            break;
        }

        return (
            `Circular Dependency is detected. Dependency: "${name}", path: ` +
            resolution.join(" -> ") +
            "."
        );
    }
}
