import GraphAbstract from "./GraphAbstract";
import Graph from "./Graph";

if(typeof window !== 'undefined') {
	(window as any).GraphAbstract = GraphAbstract;
	(window as any).Graph = Graph;
}
export default GraphAbstract;