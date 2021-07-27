import Mozel, {GenericMozel, property, Alphanumeric, alphanumeric} from "mozel";

export default class GraphileonEdge extends Mozel {
	@property(Alphanumeric)
	id?:alphanumeric;

	@property(String)
	type?:string;

	@property(GenericMozel)
	properties?:GenericMozel;

	@property(Alphanumeric)
	source!:alphanumeric;

	@property(Alphanumeric)
	target!:alphanumeric;

	@property(Boolean)
	selected?:boolean;
}
