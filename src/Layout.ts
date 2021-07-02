import cytoscape, {LayoutOptions} from "cytoscape";

export default class Layout {
	readonly options:LayoutOptions;

	constructor(options:LayoutOptions) {
		this.options = options || {name: 'random'};
	}

	createOptions():LayoutOptions {
		return this.options;
	}

	/**
	 *
	 * @param elements
	 * @param options	Options for override
	 */
	apply(elements:cytoscape.Collection, options?:object) {
		const cyLayout = elements.layout({
			...this.createOptions(),
			...options
		});
		cyLayout.run();
		return cyLayout;
	}
}