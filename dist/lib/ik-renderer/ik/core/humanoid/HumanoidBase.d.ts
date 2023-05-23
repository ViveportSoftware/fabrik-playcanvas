import * as Fabrik from '../../../../fabrik';
import { HumanoidPart } from './HumanoidPart';
export declare class HumanoidBase {
    protected solver: Fabrik.FabrikStructure3D;
    protected chains: Map<HumanoidPart, Fabrik.FabrikChain3D>;
    protected boneScale: number;
    constructor();
    getSolver(): Fabrik.FabrikStructure3D;
    solveForTargets(targets: Map<string, Fabrik.Vec3>): void;
}
