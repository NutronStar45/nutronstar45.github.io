export class GraphError extends Error {
    constructor(...params: any[]) {
        super(...params);
        this.name = "GraphError";
    }
}
