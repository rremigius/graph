import Mozel, {GenericMozel, property, required} from "mozel";

export default class LayoutModel extends Mozel {
	@property(String, {required, default: 'random'})
	name!:string;

	@property(GenericMozel)
	options?:GenericMozel;
}