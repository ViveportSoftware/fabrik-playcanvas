import * as IK from '..';
import * as Fabrik from '../../../fabrik';
export declare class HumanoidVRM extends IK.Base implements IK.IK {
    private ikAvatarRenderer;
    constructor();
    getSolver(): Fabrik.FabrikStructure3D | undefined;
    solveForTargets(targets: Map<string, Fabrik.Vec3>): void;
    private init;
    run(): void;
    update(): void;
}
