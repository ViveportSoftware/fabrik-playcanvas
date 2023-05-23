import * as Renderer from '../../../renderer';
import { Base } from '../../implement/Base';
import { AvatarRenderer } from './AvatarRenderer';
import { AvatarRendererBase } from './AvatarRendererBase';
export declare class AvatarRendererLocalHinge extends AvatarRendererBase implements AvatarRenderer {
    constructor(ik: Base | undefined, renderer: Renderer.AvatarRenderer | undefined);
    update(): void;
    private applyRotation;
    private applyRotationByJoints;
    private applyIKToAvatarSpine;
    private applyIKToAvatarHead;
    private applyIKToAvatarRightArm;
    private applyIKToAvatarLeftArm;
    private applyIKToAvatarRightLeg;
    private applyIKToAvatarLeftLeg;
    private applyIKToAvatar;
}
