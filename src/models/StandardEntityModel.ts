import Mozel, {property} from "mozel";

export default class StandardEntityModel extends Mozel {
	@property(String)
	label?:string;

	@property(Boolean)
	selected?:boolean;

	toString() {
		const label = this.label ? ':' + this.label : '';
		return `Entity${label} (${this.gid})`;
	}
}
