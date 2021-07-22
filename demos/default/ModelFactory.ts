import {MozelFactory} from "mozel";
import StandardNodeModel from "../../src/models/StandardNodeModel";
import Node from "./Node";

export default class ModelFactory extends MozelFactory {
	initDependencies() {
		super.initDependencies();
		this.localDependencies.bind(StandardNodeModel).to(Node);
	}
}
