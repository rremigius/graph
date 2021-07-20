import {MozelFactory} from "mozel";
import NodeModel from "../../src/models/NodeModel";
import Node from "./Node";

export default class ModelFactory extends MozelFactory {
	initDependencies() {
		super.initDependencies();
		this.localDependencies.bind(NodeModel).to(Node);
	}
}
