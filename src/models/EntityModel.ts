import Mozel, {Collection, collection, GenericMozel, property, required} from "mozel";
import {isEmpty} from "lodash";

export default class EntityModel extends Mozel {
	@property(String)
	label?:string;

	@property(GenericMozel, {required, default:()=>new GenericMozel()})
	data!:GenericMozel;

	@property(Boolean)
	selected?:boolean;

	toString() {
		const label = this.label ? ':' + this.label : '';
		return `Entity${label} (${this.gid})`;
	}
}
