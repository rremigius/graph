const VueFormGenerator = window.VueFormGenerator;

export default {
	fields: [{
		type: "input",
		inputType: "text",
		label: "GID",
		model: "gid",
		readonly: true,
		featured: false,
		disabled: true
	}, {
		type: "select",
		label: "Label",
		model: "label",
		required: true,
		values: ["CAUSES", "PARENT", "PROPERTY"],
		validator: VueFormGenerator.validators.string
	}]
};
