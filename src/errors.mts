/** An error related to the properties of graphs. */
export class GraphError extends Error {
    constructor(...params: any[]) {
        super(...params);
        this.name = "GraphError";
    }
}
