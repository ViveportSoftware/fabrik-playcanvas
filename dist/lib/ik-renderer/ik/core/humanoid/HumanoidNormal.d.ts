import * as Fabrik from '../../../../fabrik';
import { AvatarPart } from '../../../renderer';
import { Humanoid } from './Humanoid';
import { HumanoidBase } from './HumanoidBase';
export declare class HumanoidNormal extends HumanoidBase implements Humanoid {
    private boneLengthMap;
    private hipsPos;
    constructor(hipsPos: Fabrik.Vec3, boneLengthMap: Map<AvatarPart, number> | undefined);
    private init;
    private initSpine;
    private initHead;
    private initRightArm;
    private initLeftArm;
    private initRightLeg;
    private initLeftLeg;
}
