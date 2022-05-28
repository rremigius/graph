import {check} from "validation-kit";
import Log from "log-control";
import {
	EdgeMappingAbstract, MappingAbstract,
	NodeMappingAbstract,
	NodeToEdgeMapping, NodeToEdgeMappingAbstract,
	StandardEdgeMapping, StandardEdgeModel, StandardEntityModel,
	StandardGraphModel,
	StandardNodeMapping, StandardNodeModel
} from "../../src";
import {
	IS_ALPHANUMERIC,
	IS_ARRAY,
	IS_ARRAY_OF,
	IS_BOOLEAN,
	IS_CLASS, IS_INSTANCE_OF, IS_NUMBER, IS_OBJECT, IS_PRIMITIVE, IS_STRING,
	IS_SUBCLASS_OF
} from "validation-kit/dist/validators";
import Mozel from "mozel";
import MozelSyncClient from "mozel-sync/dist/MozelSyncClient";

(window as any).Graph = {
	Log,
	Mozel,
	check,
	StandardEdgeModel, StandardNodeModel, StandardNodeMapping, StandardEdgeMapping, StandardGraphModel,
	StandardEntityModel, NodeMappingAbstract, EdgeMappingAbstract, MappingAbstract, NodeToEdgeMappingAbstract,
	NodeToEdgeMapping, MozelSyncClient,
	IS_INSTANCE_OF, IS_STRING, IS_BOOLEAN, IS_ALPHANUMERIC, IS_ARRAY, IS_ARRAY_OF, IS_NUMBER, IS_OBJECT, IS_CLASS,
	IS_PRIMITIVE, IS_SUBCLASS_OF
}
