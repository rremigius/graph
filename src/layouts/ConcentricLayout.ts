import Layout from "../Layout";
import cytoscape from "cytoscape";

export default class ConcentricLayout extends Layout {
	createOptions():cytoscape.ConcentricLayoutOptions {
		const options = super.createOptions() as cytoscape.ConcentricLayoutOptions;

		options.concentric = node => node.degree() * 10;
		options.levelWidth = () => this.model.options.levelWidth || 5;

		return options;
	}
}