import * as pc from 'playcanvas';
import * as Fabrik from '../fabrik';
import * as IK from './ik';
import { HumanoidPart } from './ik/core/humanoid/HumanoidPart';
import * as Renderer from './renderer';
export declare class IKRenderer {
    private ik;
    private renderer;
    static pcV3ToFabrikV3(v: pc.Vec3): Fabrik.Vec3;
    static fabrikV3ToPCV3(v: Fabrik.Vec3): pc.Vec3;
    static equalV3BetweenPCV3(v1: Fabrik.Vec3, v2: pc.Vec3): boolean;
    static equalV3BetweenV3(v1: Fabrik.Vec3, v2: Fabrik.Vec3): boolean;
    static equalBetweenQuat(q1: pc.Quat, q2: pc.Quat): boolean;
    constructor(renderer: Renderer.Renderer | Renderer.AvatarRenderer);
    setIK(ik: IK.IK): void;
    setDebug(debug: boolean): void;
    run(): void;
    private update;
    stop(): void;
    resume(): void;
    private updateTargetsByXRInputSources;
    updateTargetByXRInputSource(targetPart: HumanoidPart, inputSource: pc.XrInputSource): void;
    setAvatarPartMap(part: Renderer.AvatarPart, name: string): void;
}
