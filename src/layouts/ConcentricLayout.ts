import Layout from "../Layout";
import cytoscape, {ConcentricLayoutOptions} from "cytoscape";

export default class ConcentricLayout extends Layout {
	readonly options:ConcentricLayoutOptions;

	createOptions():cytoscape.ConcentricLayoutOptions {
		const options = super.createOptions() as cytoscape.ConcentricLayoutOptions;

		options.concentric = node => node.degree() * 10;
		options.levelWidth = this.options.levelWidth || function(){ return 5 };

		return options;
	}
}