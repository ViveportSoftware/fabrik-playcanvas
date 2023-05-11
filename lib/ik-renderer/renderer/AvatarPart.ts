export enum AvatarPart {
  Hips = '1',
  Spine = '2',
  Chest = '3',
  UpperChest = '4',
  Neck = '5',
  Head = '6',
  RightEye = '7',
  LeftEye = '8',

  RightShoulder = '9',
  RightUpperArm = '10',
  RightLowerArm = '11',
  RightHand = '12',
  RightMiddle1 = '13',

  LeftShoulder = '14',
  LeftUpperArm = '15',
  LeftLowerArm = '16',
  LeftHand = '17',
  LeftMiddle1 = '18',

  RightHip = '19',
  RightUpperLeg = '20',
  RightLowerLeg = '21',
  RightFoot = '22',
  RightToeBase = '23',

  LeftHip = '24',
  LeftUpperLeg = '25',
  LeftLowerLeg = '26',
  LeftFoot = '27',
  LeftToeBase = '28',
}

export class AvatarPartMap {
  private static partMap: Map<AvatarPart, string> = new Map([
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

  public static set(part: AvatarPart, name: string): void {
    this.partMap.set(part, name);
  }

  static get Hips(): string {
    return this.partMap.get(AvatarPart.Hips) as string;
  }

  static get Spine(): string {
    return this.partMap.get(AvatarPart.Spine) as string;
  }

  static get UpperChest(): string {
    return this.partMap.get(AvatarPart.UpperChest) as string;
  }

  static get Chest(): string {
    return this.partMap.get(AvatarPart.Chest) as string;
  }

  static get Neck(): string {
    return this.partMap.get(AvatarPart.Neck) as string;
  }

  static get Head(): string {
    return this.partMap.get(AvatarPart.Head) as string;
  }

  static get RightEye(): string {
    return this.partMap.get(AvatarPart.RightEye) as string;
  }

  static get LeftEye(): string {
    return this.partMap.get(AvatarPart.LeftEye) as string;
  }

  static get RightShoulder(): string {
    return this.partMap.get(AvatarPart.RightShoulder) as string;
  }

  static get RightUpperArm(): string {
    return this.partMap.get(AvatarPart.RightUpperArm) as string;
  }

  static get RightLowerArm(): string {
    return this.partMap.get(AvatarPart.RightLowerArm) as string;
  }

  static get RightHand(): string {
    return this.partMap.get(AvatarPart.RightHand) as string;
  }

  static get RightMiddle1(): string {
    return this.partMap.get(AvatarPart.RightMiddle1) as string;
  }

  static get LeftShoulder(): string {
    return this.partMap.get(AvatarPart.LeftShoulder) as string;
  }

  static get LeftUpperArm(): string {
    return this.partMap.get(AvatarPart.LeftUpperArm) as string;
  }

  static get LeftLowerArm(): string {
    return this.partMap.get(AvatarPart.LeftLowerArm) as string;
  }

  static get LeftHand(): string {
    return this.partMap.get(AvatarPart.LeftHand) as string;
  }

  static get LeftMiddle1(): string {
    return this.partMap.get(AvatarPart.LeftMiddle1) as string;
  }

  static get RightHip(): string {
    return this.partMap.get(AvatarPart.RightHip) as string;
  }

  static get RightUpperLeg(): string {
    return this.partMap.get(AvatarPart.RightUpperLeg) as string;
  }

  static get RightLowerLeg(): string {
    return this.partMap.get(AvatarPart.RightLowerLeg) as string;
  }

  static get RightFoot(): string {
    return this.partMap.get(AvatarPart.RightFoot) as string;
  }

  static get RightToeBase(): string {
    return this.partMap.get(AvatarPart.RightToeBase) as string;
  }

  static get LeftHip(): string {
    return this.partMap.get(AvatarPart.LeftHip) as string;
  }

  static get LeftUpperLeg(): string {
    return this.partMap.get(AvatarPart.LeftUpperLeg) as string;
  }

  static get LeftLowerLeg(): string {
    return this.partMap.get(AvatarPart.LeftLowerLeg) as string;
  }

  static get LeftFoot(): string {
    return this.partMap.get(AvatarPart.LeftFoot) as string;
  }

  static get LeftToeBase(): string {
    return this.partMap.get(AvatarPart.LeftToeBase) as string;
  }
}
