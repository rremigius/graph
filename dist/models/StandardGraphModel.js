var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import Mozel, { collection } from "mozel";
import StandardNodeModel from "./StandardNodeModel";
import StandardEdgeModel from "./StandardEdgeModel";
export default class StandardGraphModel extends Mozel {
    static createFactory() {
        const factory = super.createFactory();
        factory.register(StandardGraphModel);
        factory.register(StandardNodeModel);
        factory.register(StandardEdgeModel);
        return factory;
    }
}
__decorate([
    collection(StandardNodeModel)
], StandardGraphModel.prototype, "nodes", void 0);
__decorate([
    collection(StandardEdgeModel)
], StandardGraphModel.prototype, "edges", void 0);
