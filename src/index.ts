import ModelGraphAbstract from "./ModelGraphAbstract";
import Graph from "./Graph";

if(typeof window !== 'undefined') {
	(window as any).GraphAbstract = ModelGraphAbstract;
	(window as any).Graph = Graph;
}
export default ModelGraphAbstract;