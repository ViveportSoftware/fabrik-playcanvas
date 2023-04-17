import * as pc from 'playcanvas';
import * as Fabrik from '../../../fabrik';

export class Target {
  public id: string;
  public entity: pc.Entity;

  constructor(id: string, entity: pc.Entity) {
    this.id = id;
    this.entity = entity;
  }

  public getPosition(): Fabrik.Vec3 {
    const pos = this.entity.getPosition();
    return new Fabrik.Vec3(pos.x, pos.y, pos.z);
  }

  public getLocalPosition(): Fabrik.Vec3 {
    const pos = this.entity.getLocalPosition();
    return new Fabrik.Vec3(pos.x, pos.y, pos.z);
  }

  public getRotation(): pc.Quat {
    return this.entity.getRotation();
  }

  public getLocalRotation(): pc.Quat {
    return this.entity.getLocalRotation();
  }

  public setPosition(pos: Fabrik.Vec3): void {
    this.entity.setPosition(pos.x, pos.y, pos.z);
  }

  public setRotation(rotation: pc.Quat): void {
    this.entity.setRotation(rotation.x, rotation.y, rotation.z, rotation.w);
  }
}
