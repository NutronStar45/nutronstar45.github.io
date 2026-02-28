export class GraphError extends Error {
    constructor(...params) {
        super(...params);
        this.name = "GraphError";
    }
}
