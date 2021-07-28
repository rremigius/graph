import Node from "./Node.js";
import Edge from "./Edge.js";

const { Mozel } = window.Graph;

export default class GraphModel extends Mozel {}
GraphModel.collection('nodes', Node);
GraphModel.collection('edges', Edge);
