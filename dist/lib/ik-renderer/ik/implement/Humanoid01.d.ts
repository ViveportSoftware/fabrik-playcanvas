import * as IK from '..';
import * as Fabrik from '../../../fabrik';
export declare class Humanoid01 extends IK.Base implements IK.IK {
    private solver;
    private chains;
    private boneScale;
    constructor();
    getSolver(): Fabrik.FabrikStructure3D;
    solveForTargets(targets: Map<string, Fabrik.Vec3>): void;
    private init;
    private initSpine;
    private initRightArm;
    private initLeftArm;
    run(): void;
    update(): void;
}
