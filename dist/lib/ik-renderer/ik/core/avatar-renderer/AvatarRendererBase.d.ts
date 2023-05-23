import * as Fabrik from '../../../../fabrik';
import * as Renderer from '../../../renderer';
import { IK } from '../IK';
import { Humanoid } from '../humanoid/Humanoid';
export declare class AvatarRendererBase {
    protected ik: IK | undefined;
    protected renderer: Renderer.AvatarRenderer | undefined;
    protected ikHumanoid?: Humanoid;
    protected printOnceFlag: boolean;
    constructor(ik: IK | undefined, renderer: Renderer.AvatarRenderer | undefined);
    getSolver(): Fabrik.FabrikStructure3D | undefined;
    solveForTargets(targets: Map<string, Fabrik.Vec3>): void;
    run(): void;
    update(): void;
}
