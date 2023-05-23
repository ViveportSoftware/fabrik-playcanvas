import * as pc from 'playcanvas';
import * as Fabrik from '../../../fabrik';
export declare class Target {
    id: string;
    entity: pc.Entity;
    constructor(id: string, entity: pc.Entity);
    getPosition(): Fabrik.Vec3;
    getLocalPosition(): Fabrik.Vec3;
    getRotation(): pc.Quat;
    getLocalRotation(): pc.Quat;
    setPosition(pos: Fabrik.Vec3): void;
    setRotation(rotation: pc.Quat): void;
}
