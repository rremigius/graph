import Mozel, {Collection, collection, GenericMozel, property, required} from "mozel";

export default class EntityModel extends Mozel {
	@collection(String)
	labels!:Collection<string>;

	@property(GenericMozel, {required, default:()=>new GenericMozel()})
	data!:GenericMozel;

	toString() {
		return `Entity ${this.gid}`;
	}
}