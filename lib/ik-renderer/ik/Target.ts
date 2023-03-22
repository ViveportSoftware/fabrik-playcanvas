import * as pc from 'playcanvas';
import * as Fabrik from '../../fabrik';

export class Target {
  public id: string;
  public pos: Fabrik.Vec3 = new Fabrik.Vec3(0, 0, 0);
  public rotation: pc.Quat = new pc.Quat();
  public entity: pc.Entity;

  constructor(id: string, pos: Fabrik.Vec3, entity: pc.Entity) {
    this.id = id;
    this.pos = pos;
    this.entity = entity;
  }

  public getPosition(): Fabrik.Vec3 {
    return this.pos;
  }

  public getRotation(): pc.Quat {
    return this.rotation;
  }

  public setPosition(pos: Fabrik.Vec3): void {
    this.entity.setLocalPosition(pos.x, pos.y, pos.z);
    this.pos.x = pos.x;
    this.pos.y = pos.y;
    this.pos.z = pos.z;
  }

  public setRotation(rotation: pc.Quat): void {
    this.entity.setRotation(rotation.x, rotation.y, rotation.z, rotation.w);
    this.rotation.x = rotation.x;
    this.rotation.y = rotation.y;
    this.rotation.z = rotation.z;
    this.rotation.w = rotation.w;
  }
}
