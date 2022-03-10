const Vue = window.Vue;
const VueFormGenerator = window.VueFormGenerator;

Vue.use(VueFormGenerator);

export function showForm(model, schema, callback) {
	form.model = model;
	form.schema = schema;
	form.callback = callback;
}

const form = new Vue({
	el: "#form",

	components: {
		"vue-form-generator": VueFormGenerator.component
	},

	data() {
		return {
			model: {},
			schema: {},
			callback: ()=>{},
			valid: false,
			formOptions: {
				validateAfterChanged: true
			}
		};
	},

	methods: {
		onValidated(isValid) {
			this.valid = isValid;
		},
		onSubmit() {
			if(!this.$refs.form) {
				console.error("No 'form' ref found.");
				return;
			}
			this.$refs.form.validate();

			if(!this.valid) return;
			this.callback(this.model);
		}
	}
});
