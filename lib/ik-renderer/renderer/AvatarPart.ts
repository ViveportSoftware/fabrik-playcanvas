import {Logger} from '../Logger';

export enum AvatarPart {
  Hips,
  Spine,
  Chest,
  UpperChest,
  Neck,
  Head,
  RightEye,
  LeftEye,

  RightShoulder,
  RightUpperArm,
  RightLowerArm,
  RightHand,
  RightMiddle1,

  LeftShoulder,
  LeftUpperArm,
  LeftLowerArm,
  LeftHand,
  LeftMiddle1,

  RightHip,
  RightUpperLeg,
  RightLowerLeg,
  RightFoot,
  RightToeBase,

  LeftHip,
  LeftUpperLeg,
  LeftLowerLeg,
  LeftFoot,
  LeftToeBase,
}

class AvatarPartMapManager {
  private static instance: AvatarPartMapManager;

  private partMap: Map<AvatarPart, string> = new Map([
    [AvatarPart.Hips, 'J_Bip_C_Hips'],
    [AvatarPart.Spine, 'J_Bip_C_Spine'],
    [AvatarPart.UpperChest, 'J_Bip_C_UpperChest'],
    [AvatarPart.Chest, 'J_Bip_C_Chest'],
    [AvatarPart.Neck, 'J_Bip_C_Neck'],
    [AvatarPart.Head, 'J_Bip_C_Head'],
    [AvatarPart.RightEye, 'J_Adj_R_FaceEye'],
    [AvatarPart.LeftEye, 'J_Adj_L_FaceEye'],

    [AvatarPart.RightShoulder, 'J_Bip_R_Shoulder'],
    [AvatarPart.RightUpperArm, 'J_Bip_R_UpperArm'],
    [AvatarPart.RightLowerArm, 'J_Bip_R_LowerArm'],
    [AvatarPart.RightHand, 'J_Bip_R_Hand'],
    [AvatarPart.RightMiddle1, 'J_Bip_R_Middle1'],

    [AvatarPart.LeftShoulder, 'J_Bip_L_Shoulder'],
    [AvatarPart.LeftUpperArm, 'J_Bip_L_UpperArm'],
    [AvatarPart.LeftLowerArm, 'J_Bip_L_LowerArm'],
    [AvatarPart.LeftHand, 'J_Bip_L_Hand'],
    [AvatarPart.LeftMiddle1, 'J_Bip_L_Middle1'],

    [AvatarPart.RightHip, 'J_Bip_R_Hip'],
    [AvatarPart.RightUpperLeg, 'J_Bip_R_UpperLeg'],
    [AvatarPart.RightLowerLeg, 'J_Bip_R_LowerLeg'],
    [AvatarPart.RightFoot, 'J_Bip_R_Foot'],
    [AvatarPart.RightToeBase, 'J_Bip_R_ToeBase'],

    [AvatarPart.LeftHip, 'J_Bip_L_Hip'],
    [AvatarPart.LeftUpperLeg, 'J_Bip_L_UpperLeg'],
    [AvatarPart.LeftLowerLeg, 'J_Bip_L_LowerLeg'],
    [AvatarPart.LeftFoot, 'J_Bip_L_Foot'],
    [AvatarPart.LeftToeBase, 'J_Bip_L_ToeBase'],
  ]);

  private constructor() {}

  public static get Instance(): AvatarPartMapManager {
    if (!AvatarPartMapManager.instance) {
      AvatarPartMapManager.instance = new AvatarPartMapManager();
    }

    return AvatarPartMapManager.instance;
  }

  public set(part: AvatarPart, name: string): void {
    this.partMap.set(part, name);
    Logger.getInstance().log(part, name, this.partMap);
  }

  public get(part: AvatarPart): string {
    const result = this.partMap.get(part);
    if (!result) {
      throw new Error(`Part [${part}] not exisits`);
    }
    return result;
  }
}

export class AvatarPartMap {
  public static set(part: AvatarPart, name: string): void {
    AvatarPartMapManager.Instance.set(part, name);
    Logger.getInstance().log(
      part,
      name,
      AvatarPartMapManager.Instance.get(part)
    );
  }

  static get Hips(): string {
    return AvatarPartMapManager.Instance.get(AvatarPart.Hips);
  }

  static get Spine(): string {
    return AvatarPartMapManager.Instance.get(AvatarPart.Spine);
  }

  static get UpperChest(): string {
    return AvatarPartMapManager.Instance.get(AvatarPart.UpperChest);
  }

  static get Chest(): string {
    return AvatarPartMapManager.Instance.get(AvatarPart.Chest);
  }

  static get Neck(): string {
    return AvatarPartMapManager.Instance.get(AvatarPart.Neck);
  }

  static get Head(): string {
    return AvatarPartMapManager.Instance.get(AvatarPart.Head);
  }

  static get RightEye(): string {
    return AvatarPartMapManager.Instance.get(AvatarPart.RightEye);
  }

  static get LeftEye(): string {
    return AvatarPartMapManager.Instance.get(AvatarPart.LeftEye);
  }

  static get RightShoulder(): string {
    return AvatarPartMapManager.Instance.get(AvatarPart.RightShoulder);
  }

  static get RightUpperArm(): string {
    return AvatarPartMapManager.Instance.get(AvatarPart.RightUpperArm);
  }

  static get RightLowerArm(): string {
    return AvatarPartMapManager.Instance.get(AvatarPart.RightLowerArm);
  }

  static get RightHand(): string {
    return AvatarPartMapManager.Instance.get(AvatarPart.RightHand);
  }

  static get RightMiddle1(): string {
    return AvatarPartMapManager.Instance.get(AvatarPart.RightMiddle1);
  }

  static get LeftShoulder(): string {
    return AvatarPartMapManager.Instance.get(AvatarPart.LeftShoulder);
  }

  static get LeftUpperArm(): string {
    return AvatarPartMapManager.Instance.get(AvatarPart.LeftUpperArm);
  }

  static get LeftLowerArm(): string {
    return AvatarPartMapManager.Instance.get(AvatarPart.LeftLowerArm);
  }

  static get LeftHand(): string {
    return AvatarPartMapManager.Instance.get(AvatarPart.LeftHand);
  }

  static get LeftMiddle1(): string {
    return AvatarPartMapManager.Instance.get(AvatarPart.LeftMiddle1);
  }

  static get RightHip(): string {
    return AvatarPartMapManager.Instance.get(AvatarPart.RightHip);
  }

  static get RightUpperLeg(): string {
    return AvatarPartMapManager.Instance.get(AvatarPart.RightUpperLeg);
  }

  static get RightLowerLeg(): string {
    return AvatarPartMapManager.Instance.get(AvatarPart.RightLowerLeg);
  }

  static get RightFoot(): string {
    return AvatarPartMapManager.Instance.get(AvatarPart.RightFoot);
  }

  static get RightToeBase(): string {
    return AvatarPartMapManager.Instance.get(AvatarPart.RightToeBase);
  }

  static get LeftHip(): string {
    return AvatarPartMapManager.Instance.get(AvatarPart.LeftHip);
  }

  static get LeftUpperLeg(): string {
    return AvatarPartMapManager.Instance.get(AvatarPart.LeftUpperLeg);
  }

  static get LeftLowerLeg(): string {
    return AvatarPartMapManager.Instance.get(AvatarPart.LeftLowerLeg);
  }

  static get LeftFoot(): string {
    return AvatarPartMapManager.Instance.get(AvatarPart.LeftFoot);
  }

  static get LeftToeBase(): string {
    return AvatarPartMapManager.Instance.get(AvatarPart.LeftToeBase);
  }
}
