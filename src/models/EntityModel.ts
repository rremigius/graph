import Mozel, {Collection, collection, GenericMozel, property, required} from "mozel";
import {isEmpty} from "lodash";

export default class EntityModel extends Mozel {
	@collection(String)
	labels!:Collection<string>;

	@property(GenericMozel, {required, default:()=>new GenericMozel()})
	data!:GenericMozel;

	@property(Boolean)
	selected?:boolean;

	getCaption() {
		if(this.data && !isEmpty(this.data.name)) return this.data.name;
		if(this.labels.length) {
			return this.labels.toArray().join(':');
		}
		return '';
	}

	toString() {
		return `Entity ${this.gid}`;
	}
}