import Mozel, {Collection, collection, GenericMozel, property, Alphanumeric, alphanumeric} from "mozel";

export default class GraphileonNode extends Mozel {
	@property(Alphanumeric)
	id?:alphanumeric;

	@collection(String)
	labels!:Collection<string>

	@property(GenericMozel)
	properties?:GenericMozel;

	@property(Boolean)
	selected?:boolean;

	@property(Number)
	x?:number;

	@property(Number)
	y?:number;
}
