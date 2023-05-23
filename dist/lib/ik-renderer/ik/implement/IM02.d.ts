import * as IK from '..';
import * as Fabrik from '../../../fabrik';
export declare class IM02 extends IK.Base implements IK.IK {
    private solver;
    constructor();
    getSolver(): Fabrik.FabrikStructure3D;
    update(): void;
    solveForTarget(target: Fabrik.Vec3): void;
    solveForTargets(targets: Map<string, Fabrik.Vec3>): void;
    run(): void;
}
