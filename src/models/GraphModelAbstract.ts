import Mozel, {Collection, property, required} from "mozel";
import LayoutModel from "./LayoutModel";

export default abstract class GraphModelAbstract<N extends Mozel, R extends Mozel> extends Mozel {
	@property(LayoutModel, {required})
	layout:LayoutModel;

	unfixNodes(nodes:N[]) {
		for(let node of nodes) {
			this.setFixed(node, false);
		}
	}

	abstract isFixed(node:N):boolean;
	abstract setFixed(node:N, fixed:boolean):void;
	abstract getPosition(node:N):{x:number, y:number};
	abstract setPosition(node:N, x:number, y:number):void;
	abstract getRelationSource(relation:R):N;
	abstract getRelationTarget(relation:R):N;
	abstract isNode(entity:any):entity is N;
	abstract isRelation(entity:any):entity is R;
	abstract getGraphModelNodesPath():string;
	abstract getGraphModelRelationsPath():string;
	abstract getNodes():Collection<N>;
	abstract getRelations():Collection<R>;
}