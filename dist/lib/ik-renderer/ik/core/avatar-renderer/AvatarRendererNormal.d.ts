import * as Renderer from '../../../renderer';
import { IK } from '../IK';
import { AvatarRenderer } from './AvatarRenderer';
import { AvatarRendererBase } from './AvatarRendererBase';
export declare class AvatarRendererNormal extends AvatarRendererBase implements AvatarRenderer {
    constructor(ik: IK | undefined, renderer: Renderer.AvatarRenderer | undefined);
    run(): void;
    update(): void;
    private applyRotation;
    private applyRotationByInputSource;
    private applyRotationForceFront;
    private applyRotationByJoints;
    private applyIKToAvatarSpine;
    private applyIKToAvatarHead;
    private applyIKToAvatarRightArm;
    private applyIKToAvatarLeftArm;
    private applyIKToAvatarRightLeg;
    private applyIKToAvatarLeftLeg;
    private applyIKToAvatar;
}
