import Layout from "../Layout";

// @ts-ignore
import fcose from "cytoscape-fcose";
import cytoscape from "cytoscape";

cytoscape.use(fcose);

export default class FCoseLayout extends Layout {
	createOptions():any {
		const options = super.createOptions() as any;
		options.idealEdgeLength = (ele:cytoscape.Singular) => this.model.options.idealEdgeLength || 100;
		return options;
	}
}