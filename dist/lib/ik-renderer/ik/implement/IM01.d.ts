import * as Fabrik from '../../../fabrik';
import { IK } from '../core/IK';
import { Base } from './Base';
export declare class IM01 extends Base implements IK {
    private solver;
    constructor();
    getSolver(): Fabrik.FabrikStructure3D;
    update(): void;
    solveForTarget(target: Fabrik.Vec3): void;
    solveForTargets(targets: Map<string, Fabrik.Vec3>): void;
    run(): void;
}
