import Mozel, {GenericMozel, property, required} from "mozel";

export default class EntityModel extends Mozel {
	@property(GenericMozel, {required, default:()=>new GenericMozel()})
	data!:GenericMozel;
}