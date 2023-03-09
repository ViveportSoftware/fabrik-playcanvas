import * as pc from 'playcanvas';
import {AvatarPart} from './AvatarPart';
import {Renderer} from './Renderer';

export class AvatarRenderer extends Renderer {
  private avatarEntity?: pc.Entity;

  private isRenderForwardLines: boolean = false;

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

      entity.setLocalScale(6, 6, 6);
      entity.setLocalPosition(0, -4.5, 0);

      this.app?.root.addChild(entity);
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
}
