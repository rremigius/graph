import Layout from "../Layout";
// @ts-ignore
import fcose from "cytoscape-fcose";
import cytoscape from "cytoscape";

cytoscape.use(fcose);

export default class FCoseLayout extends Layout {
	readonly options:any;

	createOptions():any {
		const options = super.createOptions() as any;
		options.idealEdgeLength = this.options.idealEdgeLegnth || function() { return 100 };
		return options;
	}
}