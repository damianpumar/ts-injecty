import { Container } from "./Container";
import { register } from "./DependencyBuilder";
import { useResolve } from "./useResolve";
import { Ref, Factory } from "./types";

export default Container;

export { register, useResolve, Factory, Ref as Class };
