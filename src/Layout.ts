import LayoutModel from "./models/LayoutModel";
import cytoscape, {LayoutOptions} from "cytoscape";

export default class Layout {
	readonly model:LayoutModel;

	constructor(model:LayoutModel) {
		this.model = model;
	}

	createOptions():LayoutOptions {
		const options = this.model.options ? this.model.options.$export() : {};
		return {
			...options,
			name: this.model.name
		};
	}

	apply(elements:cytoscape.Collection, options?:object) {
		const cyLayout = elements.layout({
			...this.createOptions(),
			...options
		});
		cyLayout.run();
		return cyLayout;
	}
}