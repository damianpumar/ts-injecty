import { Container } from "./Container";
import { register } from "./DependencyBuilder";
import { useResolve } from "./useResolve";
import { Class, Factory } from "./types";

export default Container;

export { register, useResolve, Factory, Class };
