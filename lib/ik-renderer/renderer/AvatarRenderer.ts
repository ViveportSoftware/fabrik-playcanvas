import * as pc from 'playcanvas';
import {AvatarPart} from './AvatarPart';
import {Renderer} from './Renderer';

export class AvatarRenderer extends Renderer {
  private avatarEntity?: pc.Entity;

  private isRenderForwardLines: boolean = false;

  private boneLengthMap: Map<AvatarPart, number> = new Map();

  constructor(
    app: pc.Application | undefined = undefined,
    rootEntity: pc.Entity | undefined = undefined,
    avatarEntity: pc.Entity | undefined = undefined
  ) {
    super(app, rootEntity);

    this.avatarEntity = avatarEntity;
  }

  public async init() {
    await super.init();

    if (!this.avatarEntity) {
      this.avatarEntity = this.addAvatar();
    }

    this.addXRStartCallback(
      ((vrCamera: pc.Entity) => {
        if (this.avatarEntity) {
          const head = this.avatarEntity.findByName(AvatarPart.Head);
          if (head) {
            vrCamera.setPosition(head.getLocalPosition());
            head.setLocalScale(0, 0, 0);
          }
        }
      }).bind(this)
    );
  }

  public addAvatar(): pc.Entity | undefined {
    const asset = this.app?.assets.find('avatar');

    if (asset) {
      const entity = (
        asset.resource as pc.ContainerResource
      ).instantiateRenderEntity();

      // entity.setLocalScale(6, 6, 6);
      // entity.setLocalPosition(0, -4.5, 0);

      const hips = entity?.findByName(AvatarPart.Hips);
      if (hips) {
        const hipsPos = hips?.getPosition();
        entity.setPosition(0, -1 * hipsPos?.y, -0.2);
      }

      if (this.rootEntity) {
        this.rootEntity.addChild(entity);
      } else {
        this.app?.root.addChild(entity);
      }

      return entity;
    }

    return undefined;
  }

  public getAvatarEntity(): pc.Entity | undefined {
    return this.avatarEntity;
  }

  public update(): void {
    if (this.isRenderForwardLines && this.avatarEntity) {
      this.renderAvatarForwardLines(this.avatarEntity);
    }
  }

  private renderAvatarForwardLines(avatarEntity: pc.Entity): void {
    this.renderAvatarRightArmForwardLines(avatarEntity);
    this.renderAvatarLeftArmForwardLines(avatarEntity);
    this.renderAvatarRightLegForwardLines(avatarEntity);
    this.renderAvatarLeftLegForwardLines(avatarEntity);
  }

  private renderAvatarForwardLine(v1: pc.Vec3, v2: pc.Vec3): void {
    this.drawLine(
      new pc.Vec3(v1.x, v1.y, v1.z),
      new pc.Vec3(v1.x + v2.x, v1.y + v2.y, v1.z + v2.z),
      new pc.Color(1, 0, 0, 1)
    );
  }

  private renderAvatarLeftArmForwardLines(avatarEntity: pc.Entity): void {
    const avatarLeftUpperArm = avatarEntity.findByName(AvatarPart.LeftUpperArm);
    const avatarLeftLowerArm = avatarEntity.findByName(AvatarPart.LeftLowerArm);
    const avatarLeftHand = avatarEntity.findByName(AvatarPart.LeftHand);

    if (avatarLeftUpperArm) {
      const pos = avatarLeftUpperArm.getLocalPosition();
      const forward = avatarLeftUpperArm.forward;
      this.renderAvatarForwardLine(pos, forward);
    }

    if (avatarLeftLowerArm) {
      const pos = avatarLeftLowerArm.getLocalPosition();
      const forward = avatarLeftLowerArm.forward;
      this.renderAvatarForwardLine(pos, forward);
    }

    if (avatarLeftHand) {
      const pos = avatarLeftHand.getLocalPosition();
      const forward = avatarLeftHand.forward;
      this.renderAvatarForwardLine(pos, forward);
    }
  }

  private renderAvatarRightArmForwardLines(avatarEntity: pc.Entity): void {
    const avatarRightUpperArm = avatarEntity.findByName(
      AvatarPart.RightUpperArm
    );
    const avatarRightLowerArm = avatarEntity.findByName(
      AvatarPart.RightLowerArm
    );
    const avatarRightHand = avatarEntity.findByName(AvatarPart.RightHand);

    if (avatarRightUpperArm) {
      const pos = avatarRightUpperArm.getLocalPosition();
      const forward = avatarRightUpperArm.forward;
      this.renderAvatarForwardLine(pos, forward);
    }

    if (avatarRightLowerArm) {
      const pos = avatarRightLowerArm.getLocalPosition();
      const forward = avatarRightLowerArm.forward;
      this.renderAvatarForwardLine(pos, forward);
    }

    if (avatarRightHand) {
      const pos = avatarRightHand.getLocalPosition();
      const forward = avatarRightHand.forward;
      this.renderAvatarForwardLine(pos, forward);
    }
  }

  private renderAvatarLeftLegForwardLines(avatarEntity: pc.Entity): void {
    const avatarLeftUpperLeg = avatarEntity.findByName(AvatarPart.LeftUpperLeg);
    const avatarLeftLowerLeg = avatarEntity.findByName(AvatarPart.LeftLowerLeg);
    const avatarLeftFoot = avatarEntity.findByName(AvatarPart.LeftFoot);

    if (avatarLeftUpperLeg) {
      const pos = avatarLeftUpperLeg.getLocalPosition();
      const forward = avatarLeftUpperLeg.forward;
      this.renderAvatarForwardLine(pos, forward);
    }

    if (avatarLeftLowerLeg) {
      const pos = avatarLeftLowerLeg.getLocalPosition();
      const forward = avatarLeftLowerLeg.forward;
      this.renderAvatarForwardLine(pos, forward);
    }

    if (avatarLeftFoot) {
      const pos = avatarLeftFoot.getLocalPosition();
      const forward = avatarLeftFoot.forward;
      this.renderAvatarForwardLine(pos, forward);
    }
  }

  private renderAvatarRightLegForwardLines(avatarEntity: pc.Entity): void {
    const avatarRightUpperLeg = avatarEntity.findByName(
      AvatarPart.RightUpperLeg
    );
    const avatarRightLowerLeg = avatarEntity.findByName(
      AvatarPart.RightLowerLeg
    );
    const avatarRightFoot = avatarEntity.findByName(AvatarPart.RightFoot);

    if (avatarRightUpperLeg) {
      const pos = avatarRightUpperLeg.getLocalPosition();
      const forward = avatarRightUpperLeg.forward;
      this.renderAvatarForwardLine(pos, forward);
    }

    if (avatarRightLowerLeg) {
      const pos = avatarRightLowerLeg.getLocalPosition();
      const forward = avatarRightLowerLeg.forward;
      this.renderAvatarForwardLine(pos, forward);
    }

    if (avatarRightFoot) {
      const pos = avatarRightFoot.getLocalPosition();
      const forward = avatarRightFoot.forward;
      this.renderAvatarForwardLine(pos, forward);
    }
  }

  public calculateBoneLenth(): Map<AvatarPart, number> {
    const neckBoneLength = this.calculateBoneLengthNeck();

    const hipsBoneLength = this.calculateBoneLengthHipsToSpine();
    const spineBoneLength = this.calculateBoneLengthSpine();
    const chestBoneLength = this.calculateBoneLengthChest();
    const upperChestBoneLength = this.calculateBoneLengthUpperChest();

    const rightShoulderBoneLength = this.calculateBoneLengthRightShoulder();
    const rightUpperArmBoneLength = this.calculateBoneLengthRightUpperArm();
    const rightLowerArmBoneLength = this.calculateBoneLengthRightLowerArm();
    const rightHandBoneLength = this.calculateBoneLengthRightHand();

    const leftShoulderBoneLength = this.calculateBoneLengthLeftShoulder();
    const leftUpperArmBoneLength = this.calculateBoneLengthLeftUpperArm();
    const leftLowerArmBoneLength = this.calculateBoneLengthLeftLowerArm();
    const leftHandBoneLength = this.calculateBoneLengthLeftHand();

    const rightHipBoneLength = this.calculateBoneLengthRightHip();
    const rightUpperLegBoneLength = this.calculateBoneLengthRightUpperLeg();
    const rightLowerLegBoneLength = this.calculateBoneLengthRightLowerLeg();
    const rightFootBoneLength = this.calculateBoneLengthRightFoot();

    const leftHipBoneLength = this.calculateBoneLengthLeftHip();
    const leftUpperLegBoneLength = this.calculateBoneLengthLeftUpperLeg();
    const leftLowerLegBoneLength = this.calculateBoneLengthLeftLowerLeg();
    const leftFootBoneLength = this.calculateBoneLengthLeftFoot();

    this.boneLengthMap.set(AvatarPart.Neck, neckBoneLength);

    this.boneLengthMap.set(AvatarPart.Hips, hipsBoneLength);
    this.boneLengthMap.set(AvatarPart.Spine, spineBoneLength);
    this.boneLengthMap.set(AvatarPart.Chest, chestBoneLength);
    this.boneLengthMap.set(AvatarPart.UpperChest, upperChestBoneLength);

    this.boneLengthMap.set(AvatarPart.RightShoulder, rightShoulderBoneLength);
    this.boneLengthMap.set(AvatarPart.RightUpperArm, rightUpperArmBoneLength);
    this.boneLengthMap.set(AvatarPart.RightLowerArm, rightLowerArmBoneLength);
    this.boneLengthMap.set(AvatarPart.RightHand, rightHandBoneLength);

    this.boneLengthMap.set(AvatarPart.LeftShoulder, leftShoulderBoneLength);
    this.boneLengthMap.set(AvatarPart.LeftUpperArm, leftUpperArmBoneLength);
    this.boneLengthMap.set(AvatarPart.LeftUpperArm, leftLowerArmBoneLength);
    this.boneLengthMap.set(AvatarPart.LeftHand, leftHandBoneLength);

    this.boneLengthMap.set(AvatarPart.RightHip, rightHipBoneLength);
    this.boneLengthMap.set(AvatarPart.RightUpperLeg, rightUpperLegBoneLength);
    this.boneLengthMap.set(AvatarPart.RightLowerLeg, rightLowerLegBoneLength);
    this.boneLengthMap.set(AvatarPart.RightFoot, rightFootBoneLength);

    this.boneLengthMap.set(AvatarPart.LeftHip, leftHipBoneLength);
    this.boneLengthMap.set(AvatarPart.LeftUpperLeg, leftUpperLegBoneLength);
    this.boneLengthMap.set(AvatarPart.LeftLowerLeg, leftLowerLegBoneLength);
    this.boneLengthMap.set(AvatarPart.LeftFoot, leftFootBoneLength);

    // console.error('======== calculateBoneLenth ========');
    // console.error('neckBoneLength:', neckBoneLength);

    // console.error('hipsBoneLength:', hipsBoneLength);
    // console.error('spineBoneLength:', spineBoneLength);
    // console.error('chestBoneLength:', chestBoneLength);
    // console.error('upperChestBoneLength:', upperChestBoneLength);

    // console.error('rightShoulderBoneLength:', rightShoulderBoneLength);
    // console.error('rightUpperArmBoneLength:', rightUpperArmBoneLength);
    // console.error('rightLowerArmBoneLength:', rightLowerArmBoneLength);
    // console.error('rightHandBoneLength:', rightHandBoneLength);

    // console.error('leftShoulderBoneLength:', leftShoulderBoneLength);
    // console.error('leftUpperArmBoneLength:', leftUpperArmBoneLength);
    // console.error('leftLowerArmBoneLength:', leftLowerArmBoneLength);
    // console.error('leftHandBoneLength:', leftHandBoneLength);

    // console.error('rightHipBoneLength:', rightHipBoneLength);
    // console.error('rightUpperLegBoneLength:', rightUpperLegBoneLength);
    // console.error('rightLowerLegBoneLength:', rightLowerLegBoneLength);
    // console.error('rightFootBoneLength:', rightFootBoneLength);

    // console.error('leftHipBoneLength:', leftHipBoneLength);
    // console.error('leftUpperLegBoneLength:', leftUpperLegBoneLength);
    // console.error('leftLowerLegBoneLength:', leftLowerLegBoneLength);
    // console.error('leftFootBoneLength:', leftFootBoneLength);

    return this.boneLengthMap;
  }

  private calculateBoneLengthNeck(): number {
    if (!this.avatarEntity) {
      throw new Error('avatar entity is undefined');
    }

    const neck = this.avatarEntity.findByName(AvatarPart.Neck);
    const head = this.avatarEntity.findByName(AvatarPart.Head);

    if (neck && head) {
      const neckPos = neck.getPosition();
      const headPos = head.getPosition();

      return neckPos.distance(headPos);
    }

    return 0;
  }

  private calculateBoneLengthHipsToSpine(): number {
    if (!this.avatarEntity) {
      throw new Error('avatar entity is undefined');
    }

    const hips = this.avatarEntity.findByName(AvatarPart.Hips);
    const spine = hips?.findByName(AvatarPart.Spine);

    if (hips && spine) {
      const hipsPos = hips.getPosition();
      const spinePos = spine.getPosition();

      return hipsPos.distance(spinePos);
    }

    return 0;
  }

  private calculateBoneLengthSpine(): number {
    if (!this.avatarEntity) {
      throw new Error('avatar entity is undefined');
    }

    const spine = this.avatarEntity.findByName(AvatarPart.Spine);
    const chest = spine?.findByName(AvatarPart.Chest);

    if (spine && chest) {
      const spinePos = spine.getPosition();
      const chestPos = chest.getPosition();

      return spinePos.distance(chestPos);
    }

    return 0;
  }

  private calculateBoneLengthChest(): number {
    if (!this.avatarEntity) {
      throw new Error('avatar entity is undefined');
    }

    const chest = this.avatarEntity.findByName(AvatarPart.Chest);
    const upperChest = chest?.findByName(AvatarPart.UpperChest);

    if (chest && upperChest) {
      const chestPos = chest.getPosition();
      const upperChestPos = upperChest.getPosition();

      return chestPos.distance(upperChestPos);
    }

    return 0;
  }

  private calculateBoneLengthUpperChest(): number {
    if (!this.avatarEntity) {
      throw new Error('avatar entity is undefined');
    }

    const upperChest = this.avatarEntity.findByName(AvatarPart.UpperChest);
    const neck = upperChest?.findByName(AvatarPart.Neck);

    if (upperChest && neck) {
      const upperChestPos = upperChest.getPosition();
      const neckPos = neck.getPosition();

      return upperChestPos.distance(neckPos);
    }

    return 0;
  }

  private calculateBoneLengthRightShoulder(): number {
    if (!this.avatarEntity) {
      throw new Error('avatar entity is undefined');
    }

    const shoulder = this.avatarEntity.findByName(AvatarPart.RightShoulder);
    const upperArm = shoulder?.findByName(AvatarPart.RightUpperArm);

    if (shoulder && upperArm) {
      const shoulderPos = shoulder.getPosition();
      const upperArmPos = upperArm.getPosition();

      return shoulderPos.distance(upperArmPos);
    }

    return 0;
  }

  private calculateBoneLengthRightUpperArm(): number {
    if (!this.avatarEntity) {
      throw new Error('avatar entity is undefined');
    }

    const upperArm = this.avatarEntity.findByName(AvatarPart.RightUpperArm);
    const lowerArm = upperArm?.findByName(AvatarPart.RightLowerArm);

    if (upperArm && lowerArm) {
      const upperArmPos = upperArm?.getPosition();
      const lowerArmPos = lowerArm?.getPosition();

      return upperArmPos?.distance(lowerArmPos);
    }

    return 0;
  }

  private calculateBoneLengthRightLowerArm(): number {
    if (!this.avatarEntity) {
      throw new Error('avatar entity is undefined');
    }

    const lowerArm = this.avatarEntity.findByName(AvatarPart.RightLowerArm);
    const hand = lowerArm?.findByName(AvatarPart.RightHand);

    if (lowerArm && hand) {
      const lowerArmPos = lowerArm?.getPosition();
      const handPos = hand?.getPosition();

      return lowerArmPos?.distance(handPos);
    }

    return 0;
  }

  private calculateBoneLengthRightHand(): number {
    if (!this.avatarEntity) {
      throw new Error('avatar entity is undefined');
    }

    const hand = this.avatarEntity?.findByName(AvatarPart.RightHand);
    const middle1 = hand?.findByName(AvatarPart.RightMiddle1);

    if (hand && middle1) {
      const handPos = hand?.getPosition();
      const middle1Pos = middle1?.getPosition();

      return handPos?.distance(middle1Pos);
    }

    return 0;
  }

  private calculateBoneLengthLeftShoulder(): number {
    if (!this.avatarEntity) {
      throw new Error('avatar entity is undefined');
    }

    const shoulder = this.avatarEntity.findByName(AvatarPart.LeftShoulder);
    const upperArm = shoulder?.findByName(AvatarPart.LeftUpperArm);

    if (shoulder && upperArm) {
      const shoulderPos = shoulder.getPosition();
      const upperArmPos = upperArm.getPosition();

      return shoulderPos.distance(upperArmPos);
    }

    return 0;
  }

  private calculateBoneLengthLeftUpperArm(): number {
    if (!this.avatarEntity) {
      throw new Error('avatar entity is undefined');
    }

    const upperArm = this.avatarEntity.findByName(AvatarPart.LeftUpperArm);
    const lowerArm = upperArm?.findByName(AvatarPart.LeftLowerArm);

    if (upperArm && lowerArm) {
      const upperArmPos = upperArm?.getPosition();
      const lowerArmPos = lowerArm?.getPosition();

      return upperArmPos?.distance(lowerArmPos);
    }

    return 0;
  }

  private calculateBoneLengthLeftLowerArm(): number {
    if (!this.avatarEntity) {
      throw new Error('avatar entity is undefined');
    }

    const lowerArm = this.avatarEntity.findByName(AvatarPart.LeftLowerArm);
    const hand = lowerArm?.findByName(AvatarPart.LeftHand);

    if (lowerArm && hand) {
      const lowerArmPos = lowerArm?.getPosition();
      const handPos = hand?.getPosition();

      return lowerArmPos?.distance(handPos);
    }

    return 0;
  }

  private calculateBoneLengthLeftHand(): number {
    if (!this.avatarEntity) {
      throw new Error('avatar entity is undefined');
    }

    const hand = this.avatarEntity?.findByName(AvatarPart.LeftHand);
    const middle1 = hand?.findByName(AvatarPart.LeftMiddle1);

    if (hand && middle1) {
      const handPos = hand?.getPosition();
      const middle1Pos = middle1?.getPosition();

      return handPos?.distance(middle1Pos);
    }

    return 0;
  }

  private calculateBoneLengthRightHip(): number {
    if (!this.avatarEntity) {
      throw new Error('avatar entity is undefined');
    }

    const hips = this.avatarEntity.findByName(AvatarPart.Hips);
    const upperLeg = hips?.findByName(AvatarPart.RightUpperLeg);

    if (hips && upperLeg) {
      const hipsPos = hips?.getPosition();
      const upperLegPos = upperLeg?.getPosition();

      return hipsPos?.distance(upperLegPos);
    }

    return 0;
  }

  private calculateBoneLengthRightUpperLeg(): number {
    if (!this.avatarEntity) {
      throw new Error('avatar entity is undefined');
    }

    const upperLeg = this.avatarEntity.findByName(AvatarPart.RightUpperLeg);
    const lowerLeg = upperLeg?.findByName(AvatarPart.RightLowerLeg);

    if (upperLeg && lowerLeg) {
      const upperLegPos = upperLeg?.getPosition();
      const lowerLegPos = lowerLeg?.getPosition();

      return upperLegPos?.distance(lowerLegPos);
    }

    return 0;
  }

  private calculateBoneLengthRightLowerLeg(): number {
    if (!this.avatarEntity) {
      throw new Error('avatar entity is undefined');
    }

    const lowerLeg = this.avatarEntity.findByName(AvatarPart.RightLowerLeg);
    const foot = lowerLeg?.findByName(AvatarPart.RightFoot);

    if (lowerLeg && foot) {
      const lowerLegPos = lowerLeg?.getPosition();
      const footPos = foot?.getPosition();

      return lowerLegPos?.distance(footPos);
    }

    return 0;
  }

  private calculateBoneLengthRightFoot(): number {
    if (!this.avatarEntity) {
      throw new Error('avatar entity is undefined');
    }

    const foot = this.avatarEntity.findByName(AvatarPart.RightFoot);
    const toeBase = foot?.findByName(AvatarPart.RightToeBase);

    if (foot && toeBase) {
      const footPos = foot?.getPosition();
      const toeBasePos = toeBase?.getPosition();

      return footPos?.distance(toeBasePos);
    }

    return 0;
  }

  private calculateBoneLengthLeftHip(): number {
    if (!this.avatarEntity) {
      throw new Error('avatar entity is undefined');
    }

    const hips = this.avatarEntity.findByName(AvatarPart.Hips);
    const upperLeg = hips?.findByName(AvatarPart.LeftUpperLeg);

    if (hips && upperLeg) {
      const hipsPos = hips?.getPosition();
      const upperLegPos = upperLeg?.getPosition();

      return hipsPos?.distance(upperLegPos);
    }

    return 0;
  }

  private calculateBoneLengthLeftUpperLeg(): number {
    if (!this.avatarEntity) {
      throw new Error('avatar entity is undefined');
    }

    const upperLeg = this.avatarEntity.findByName(AvatarPart.LeftUpperLeg);
    const lowerLeg = upperLeg?.findByName(AvatarPart.LeftLowerLeg);

    if (upperLeg && lowerLeg) {
      const upperLegPos = upperLeg?.getPosition();
      const lowerLegPos = lowerLeg?.getPosition();

      return upperLegPos?.distance(lowerLegPos);
    }

    return 0;
  }

  private calculateBoneLengthLeftLowerLeg(): number {
    if (!this.avatarEntity) {
      throw new Error('avatar entity is undefined');
    }

    const lowerLeg = this.avatarEntity.findByName(AvatarPart.LeftLowerLeg);
    const foot = lowerLeg?.findByName(AvatarPart.LeftFoot);

    if (lowerLeg && foot) {
      const lowerLegPos = lowerLeg?.getPosition();
      const footPos = foot?.getPosition();

      return lowerLegPos?.distance(footPos);
    }

    return 0;
  }

  private calculateBoneLengthLeftFoot(): number {
    if (!this.avatarEntity) {
      throw new Error('avatar entity is undefined');
    }

    const foot = this.avatarEntity.findByName(AvatarPart.LeftFoot);
    const toeBase = foot?.findByName(AvatarPart.LeftToeBase);

    if (foot && toeBase) {
      const footPos = foot?.getPosition();
      const toeBasePos = toeBase?.getPosition();

      return footPos?.distance(toeBasePos);
    }

    return 0;
  }
}
