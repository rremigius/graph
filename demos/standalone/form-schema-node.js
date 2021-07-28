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
	},  {
		type: "select",
		label: "Label",
		model: "label",
		required: true,
		values: ["Document", "Article", "Website", "Book"],
		validator: VueFormGenerator.validators.string
	}, {
		type: "input",
		inputType: "text",
		label: "Title",
		model: "title",
		featured: true,
		required: true,
		placeholder: "Title",
		validator: VueFormGenerator.validators.string
	}, {
		type: "textArea",
		inputType: "text",
		label: "Description",
		model: "description",
		validator: VueFormGenerator.validators.string
	}, {
		type: "input",
		inputType: "text",
		label: "URL",
		model: "url",
		validator: VueFormGenerator.validators.string
	}]
};
