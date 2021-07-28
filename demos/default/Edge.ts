import {property, reference} from "mozel";
import StandardEdgeModel from "../../src/models/StandardEdgeModel";

export default class Edge extends StandardEdgeModel {
	static get type() {
		return 'edge';
	}
}
