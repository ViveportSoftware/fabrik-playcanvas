import {Vector} from '../utils/Vector';
import {FabrikJoint} from './FabrikJoint';

export interface FabrikBone<V extends Vector<V>, J extends FabrikJoint<J>> {
  /**
   * Return the start location of this bone.
   *
   * @return	The start location of this bone.
   */
  getStartLocation(): V;

  /**
   * Return the end location of this bone.
   *
   * @return	The end location of this bone.
   */
  getEndLocation(): V;

  /**
   * Set the start location of this bone from a provided vector.
   * <p>
   * No validation is performed on the value of the start location - be aware
   * that adding a bone with identical start and end locations will result in
   * undefined behaviour.
   * @param	location	The bone start location specified as a vector.
   */
  setStartLocation(location: V): void;

  /**
   * Set the end location of this bone from a provided vector.
   * <p>
   * No validation is performed on the value of the end location - be aware
   * that adding a bone with identical start and end locations will result in
   * undefined behaviour.
   * @param	location	The bone end location specified as a vector.
   */
  setEndLocation(location: V): void;

  /**
   * Return the length of this bone. This value is calculated when the bone is constructed
   * and used throughout the lifetime of the bone.
   *
   * @return	The length of this bone, as stored in the mLength property.
   */
  length(): number;

  /**
   * Get the joint associated with this bone.
   * <p>
   * Each bone has precisely one joint. Although the joint does not
   * have a location, it can conceptually be thought of to be located at the start location
   * of the bone.
   *
   * @return  The joint associated with this bone.
   */
  getJoint(): J;
}
