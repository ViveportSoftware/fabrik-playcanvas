/**
 * A joint used to constrain the relative angle between FabrikBone3D objects in an IK chain.
 * <p>
 * There are three types of joint available:
 * <ul>
 * <li>JointType.BALL - A joint which may rotate up to a given angle with regard to the previous
 * bone in the chain or with regard to a global absolute direction in the case of the base bone,</li>
 * <li>JointType.GLOBAL_HINGE - A joint which acts as a hinge, only allowing rotation about a globally
 * specified axis, and</li>
 * <li>JointType.LOCAL_HINGE - A joint which acts as a hinge, only allowing rotation about a locally
 * specified axis (that is, rotation about an axis relative to the current bones direction).</li>
 * </ul>
 * Ball joints are free to rotate in any direction relative to the direction of the previous bone
 * in the chain. Setting the constraint angle to 180 degrees allows full freedom, whilst a
 * constraint angle of 0 degrees will fully constrain the bone to the direction of the previous bone.
 * <p>
 * Hinge joints can rotate in both clockwise and anti-clockwise directions within the valid
 * constraint angles of 0..180 degrees. A global hinge is constrained to rotate about a global
 * axis, while a local hinge is constrained about an axis relative to the bone being constrained.
 * <p>
 * Each FabrikBone3D contains precisely one FabrikJoint3D object, which does not have a specific
 * location, but can be considered to be attached to the {@code mStartLocation} of the bone. That
 * a bone only contains a single joint may seem unintuitive at first, as when you think about bones
 * in your arms or legs, most bones are connected at two points i.e. with a connection at each end.
 * However, if you imagine working from a blank slate and adding a single bone to an IK chain, then
 * that first bone has a single joint at its base (i.e. start location) and there is no joint at
 * it's tip (i.e. end location).
 * <p>
 * Following on from this, adding a second bone to the chain adds with it a second joint, which
 * again can be thought of as being located at the start location of that second bone (which itself
 * is at the end location of the first bone). In this way we avoid having redundant joints (i.e. 2
 * bones? 4 joints!), and by using the joint of the outer bone to constrain any inner bone during
 * the FABRIK algorithm's 'forward pass', and the bone's own joint when traversing the IK chain
 * during the 'backward pass', the correct constraints are enforced between the relative angles
 * of any pair of adjacent bones.
 *
 * @version 0.4.2 - 19/06/2019
 */

import {Utils} from '../utils/Utils';
import {Vec3} from '../utils/Vec3';
import {FabrikJoint} from './FabrikJoint';

/**
 * The type of joint that this object represents.
 *
 * <ul><li><strong>JointType.BALL</strong> - A ball joint (or 'ball and socket joint'). This type of joint
 * has a single contraint angle which is the extent to which it can rotate with regard to the
 * direction of the previous bone in a chain. Alternatively, it may be set to 180 degrees, which
 * is no constraint, or 0 degrees, which is entirely contrained.</li>
 * <li><strong>JointType.GLOBAL_HINGE</strong> - A global hinge joint constrains rotation of the
 * joint about a global direction unit vector, that is, a direction specified in world-space.
 * A hinge joint is like the hinge on a door - unlike a ball joint it has a clockwise and
 * anti-clockwise set of constraints where, both of these directions are specified in the
 * range 0 to 180 degrees.</li>
 * <li><strong>JointType.LOCAL_HINGE</strong> - A local hinge is similar to a global hinge, but in
 * a local hinge the hinge rotation axis is specified in local space, that is, relative to the
 * direction of the bone rather than to a 'world-space' global absolute direction. A local
 * <p>
 * A local hinge in the human body would be analogous to elbow or knee joints, which are
 * constrained about the perpendicular axis of the arm or leg they're attached to. However,
 * unlike an elbow or knee joint, a local hinge may rotate up to a maximum of 180 degrees in
 * both clockwise and anti-clockwise directions unless the mHingeClockwiseConstraintDegs and/or
 * mHingeAntiClockwiseConstraintDegs properties have been set to lower values.</li>
 * </ul>
 */
export enum JointType {
  BALL,
  GLOBAL_HINGE,
  LOCAL_HINGE,
}

export class FabrikJoint3D implements FabrikJoint<FabrikJoint3D> {
  /** The minimum valid constraint angle for a joint is 0 degrees - this will fully constrain the bone. */
  public static MIN_CONSTRAINT_ANGLE_DEGS = 0.0;

  /** The maximum valid constraint angle for a joint is 180 degrees - this will allow the bone complete freedom to rotate. */
  public static MAX_CONSTRAINT_ANGLE_DEGS = 180.0;

  /**
   * The angle (specified in degrees) up to which this FabrikJoint3D is allowed to
   * rotate if it is a rotor joint.
   * <p>
   * The valid range of this property is 0.0f to 180.0f, whereby 0.0f means that the joint
   * will lock the bone to the same direction as the previous bone in an IK chain, and 180
   * degrees means that the bone can rotate to face the opposite direction to the previous
   * bone.
   *
   * The default 180.0f.
   */
  private mRotorConstraintDegs = FabrikJoint3D.MAX_CONSTRAINT_ANGLE_DEGS;

  /**
   * The angle (specified in degrees) up to which this FabrikJoint3D is allowed to rotate
   * in an clockwise direction with regard to its present orientation about its hinge axis.
   * <p>
   * The valid range of this property is 0.0f to 180.0f, whereby 0.0f means that the joint cannot
   * rotate in an clockwise direction at all, and 180.0f means that the joint is unconstrained
   * with regard to anti-clockwise rotation.
   * <p>
   * The default is 180.0f (no constraint).
   */
  private mHingeClockwiseConstraintDegs =
    FabrikJoint3D.MAX_CONSTRAINT_ANGLE_DEGS;

  /**
   * The angle (specified in degrees) up to which this FabrikJoint3D is allowed to rotate
   * in an anti-clockwise direction with regard to its present orientation.
   * <p>
   * The valid range of this property is 0.0f to 180.0f, whereby 0.0f means that the joint cannot
   * rotate in an anti-clockwise direction at all, and 180.0f means that the joint is unconstrained
   * with regard to anti-clockwise rotation.
   * <p>
   * The default is 180.0f.
   */
  private mHingeAnticlockwiseConstraintDegs =
    FabrikJoint3D.MAX_CONSTRAINT_ANGLE_DEGS;

  /** The unit vector axis about which a hinged joint may rotate. */
  private mRotationAxisUV = new Vec3();

  /** For a hinged joint, this is the axis used as a point of reference for rotation (it is NOT the axis about which the hinge rotates). */
  private mReferenceAxisUV = new Vec3();

  /**
   * The type of this joint.
   * <p>
   * Valid options are JointType.BALL, JointType.GLOBAL_HINGE, and JointType.LOCAL_HINGE.
   *
   * The default is JointType.BALL.
   */
  private mJointType = JointType.BALL;

  // ---------- Constructors ----------

  /**
   * Default constructor.
   * <p>
   * By default, a FabrikJoint3D cannot be used until the type of joint that it represents has
   * been specified. This may be done via the {@link #setAsBallJoint(float)},
   * {@link #setAsGlobalHinge(au.edu.federation.utils.Vec3f, float, float, Vec3f)} or
   * {@link #setAsLocalHinge(au.edu.federation.utils.Vec3f, float, float, Vec3f)} methods.
   */
  // constructor() { }

  /**
   * Copy constructor.
   * <p>
   * Performs a deep copy / clone of the source object so that there are no shared references
   * between the objects after the new object has been constructed.
   *
   * @param	source	The FabrikJoint3D object to copy.
   */
  constructor(source: FabrikJoint3D | undefined = undefined) {
    if (source) {
      this.set(source);
    }
  }

  /**
   * Method to clone a FabrikJoint3D.
   * <p>
   * Internally, this uses the copy constructor {@link #FabrikJoint3D(FabrikJoint3D)} to
   * perform the clone.
   *
   * @param	source	The FabrikJoint3D to clone.
   * @return			The cloned FabrikJoint3D.
   */
  public clone(source: FabrikJoint3D): FabrikJoint3D {
    return new FabrikJoint3D(source);
  }

  /**
   * Set this joint to have the same properties as the proided 'source' joint.
   *
   * @param	source	The joint from which to duplicate all properties on this joint.
   */
  // @Override
  public set(source: FabrikJoint3D): void {
    if (source) {
      // Copy by value
      this.mJointType = source.mJointType;
      this.mRotorConstraintDegs = source.mRotorConstraintDegs;
      this.mHingeClockwiseConstraintDegs = source.mHingeClockwiseConstraintDegs;
      this.mHingeAnticlockwiseConstraintDegs =
        source.mHingeAnticlockwiseConstraintDegs;

      // Copy by value via setter method
      this.mRotationAxisUV.set(source.mRotationAxisUV);
      this.mReferenceAxisUV.set(source.mReferenceAxisUV);
    }
  }

  /**
   * Set this joint to be a ball joint.
   *
   * @param	constraintAngleDegs	The maximum allowable angle in degrees between this bone and the previous bone in the chain.
   */
  public setAsBallJoint(constraintAngleDegs: number): void {
    // Throw a RuntimeException if the rotor constraint angle is outside the range 0 to 180 degrees
    FabrikJoint3D.validateConstraintAngleDegs(constraintAngleDegs);

    // Set the rotor constraint angle and the joint type to be BALL.
    this.mRotorConstraintDegs = constraintAngleDegs;
    this.mJointType = JointType.BALL;
  }

  /**
   * Specify this joint to be a hinge with the provided settings.
   *
   * @param jointType						The type of joint, this may be either BALL, GLOBAL_HINGE or LOCAL_HINGE.
   * @param rotationAxis					The rotation axis of the hinge.
   * @param clockwiseConstraintDegs		The clockwise constraint angle about the reference axis.
   * @param anticlockwiseConstraintDegs	The anticlockwise constraint angle about the reference axis.
   * @param referenceAxis					The reference axis itself, which must fall within the plane of the hinge rotation axis.
   */
  public setHinge(
    jointType: JointType,
    rotationAxis: Vec3,
    clockwiseConstraintDegs: number,
    anticlockwiseConstraintDegs: number,
    referenceAxis: Vec3
  ): void {
    // Ensure the reference axis falls within the plane of the rotation axis (i.e. they are perpendicular, so their dot product is zero)
    if (
      !Utils.approximatelyEquals(
        Vec3.dotProduct(rotationAxis, referenceAxis),
        0.0,
        0.01
      )
    ) {
      const angleDegs = Vec3.getAngleBetweenDegs(rotationAxis, referenceAxis);
      throw new Error(
        'The reference axis must be in the plane of the hinge rotation axis - angle between them is currently: ' +
          angleDegs
      );
    }

    // Validate the constraint angles to be within the valid range and the axis isn't zero
    FabrikJoint3D.validateConstraintAngleDegs(clockwiseConstraintDegs);
    FabrikJoint3D.validateConstraintAngleDegs(anticlockwiseConstraintDegs);
    FabrikJoint3D.validateAxis(rotationAxis);
    FabrikJoint3D.validateAxis(referenceAxis);

    // Set params
    this.mHingeClockwiseConstraintDegs = clockwiseConstraintDegs;
    this.mHingeAnticlockwiseConstraintDegs = anticlockwiseConstraintDegs;
    this.mJointType = jointType;
    this.mRotationAxisUV.set(rotationAxis.normalised());
    this.mReferenceAxisUV.set(referenceAxis.normalised());
  }

  /**
   * Make this FabrikJoint3D a global hinge joint - that is, a hinge which rotates around a global / world-space axis.
   * <p>
   * Once performed, the hinge is considered initialised and ready for use.
   * <p>
   * Providing a zero vec3f for any axis, or constraint angles outside the range 0..180 degrees results in an IllegalArgumentException.
   *
   * @param globalRotationAxis	The global / world-space axis about which the hinge allows rotation.
   * @param cwConstraintDegs		The clockwise constraint angle in degrees.
   * @param acwConstraintDegs		The anti-clockwise constraint angle in degrees.
   * @param globalReferenceAxis	The initial axis around the globalHingeRotationAxis which we will enforce rotational constraints.
   */
  public setAsGlobalHinge(
    globalRotationAxis: Vec3,
    cwConstraintDegs: number,
    acwConstraintDegs: number,
    globalReferenceAxis: Vec3
  ): void {
    this.setHinge(
      JointType.GLOBAL_HINGE,
      globalRotationAxis,
      cwConstraintDegs,
      acwConstraintDegs,
      globalReferenceAxis
    );
  }

  /**
   * Make this FabrikJoint3D a local hinge joint - that is, a hinge which rotates around an axis relative to the bone to which it is attached.
   * <p>
   * Once performed, the hinge is considered initialised and ready for use.
   * <p>
   * Providing a zero vec3f for any axis, or constraint angles outside the range 0..180 degrees results in an IllegalArgumentException.
   *
   * @param localRotationAxis		The local (i.e. previous bone direction relative) axis about which the hinge allows rotation.
   * @param cwConstraintDegs		The clockwise constraint angle in degrees.
   * @param acwConstraintDegs		The anti-clockwise constraint angle in degrees.
   * @param localReferenceAxis	The initial axis around the localRotationAxis which we will enforce rotational constraints.
   */
  public setAsLocalHinge(
    localRotationAxis: Vec3,
    cwConstraintDegs: number,
    acwConstraintDegs: number,
    localReferenceAxis: Vec3
  ): void {
    this.setHinge(
      JointType.LOCAL_HINGE,
      localRotationAxis,
      cwConstraintDegs,
      acwConstraintDegs,
      localReferenceAxis
    );
  }

  /**
   * Get the clockwise constraint angle of a local or global hinge joint.
   * <p>
   * If the joint is of type JointType.BALL then a RuntimeException is thrown.
   *
   * @return	The clockwise constraint angle in degrees.
   */
  public getHingeClockwiseConstraintDegs(): number {
    if (this.mJointType != JointType.BALL) {
      return this.mHingeClockwiseConstraintDegs;
    } else {
      throw new Error(
        'Joint type is JointType.BALL - it does not have hinge constraint angles.'
      );
    }
  }

  /**
   * Get the anti-clockwise constraint angle of a local or global hinge joint.
   * <p>
   * If the joint is of type JointType.BALL then a RuntimeException is thrown.
   *
   * @return	The anti-clockwise constraint angle in degrees.
   */
  public getHingeAnticlockwiseConstraintDegs(): number {
    if (this.mJointType != JointType.BALL) {
      return this.mHingeAnticlockwiseConstraintDegs;
    } else {
      throw new Error(
        'Joint type is JointType.BALL - it does not have hinge constraint angles.'
      );
    }
  }

  /**
   * Set the rotor constraint angle of a ball joint.
   * <p>
   * If the angle is outside of the range 0.0f..180.0f then an IllegalArgumentException is thrown.
   * If the joint is not of type JointType.BALL then a RuntimeException is thrown.
   *
   * @param	angleDegs	The rotor constraint angle in degrees.
   */
  public setBallJointConstraintDegs(angleDegs: number): void {
    FabrikJoint3D.validateConstraintAngleDegs(angleDegs);

    if (this.mJointType == JointType.BALL) {
      this.mRotorConstraintDegs = angleDegs;
    } else {
      throw new Error(
        'This joint is of type: ' +
          this.mJointType +
          ' - only joints of type JointType.BALL have a ball joint constraint angle.'
      );
    }
  }

  /**
   * Get the rotor constraint angle of a ball joint.
   * <p>
   * If the joint is not of type JointType.BALL then a RuntimeException is thrown.
   *
   * @return	The rotor constraint angle in degrees.
   */
  public getBallJointConstraintDegs(): number {
    if (this.mJointType == JointType.BALL) {
      return this.mRotorConstraintDegs;
    } else {
      throw new Error(
        'This joint is not of type JointType.BALL - it does not have a ball joint constraint angle.'
      );
    }
  }

  /**
   * Set the clockwise constraint angle of a hinge joint.
   * <p>
   * If the angle is outside of the range 0.0f..180.0f then an IllegalArgumentException is thrown.
   * If the joint is of type JointType.BALL then a RuntimeException is thrown.
   *
   * @param	angleDegs	The clockwise hinge constraint angle in degrees.
   */
  public setHingeJointClockwiseConstraintDegs(angleDegs: number): void {
    FabrikJoint3D.validateConstraintAngleDegs(angleDegs);

    if (this.mJointType != JointType.BALL) {
      this.mHingeClockwiseConstraintDegs = angleDegs;
    } else {
      throw new Error(
        'Joint type is JointType.BALL - it does not have hinge constraint angles.'
      );
    }
  }

  /**
   * Set the anit-clockwise constraint angle of a hinge joint.
   * <p>
   * If the angle is outside of the range 0.0f..180.0f then an IllegalArgumentException is thrown.
   * If the joint is of type JointType.BALL then a RuntimeException is thrown.
   *
   * @param	angleDegs	The anti-clockwise hinge constraint angle in degrees.
   */
  public setHingeJointAnticlockwiseConstraintDegs(angleDegs: number): void {
    FabrikJoint3D.validateConstraintAngleDegs(angleDegs);

    if (this.mJointType != JointType.BALL) {
      this.mHingeAnticlockwiseConstraintDegs = angleDegs;
    } else {
      throw new Error(
        'Joint type is JointType.BALL - it does not have hinge constraint angles.'
      );
    }
  }

  /**
   * Set the hinge rotation axis as a normalised version of the provided axis.
   * <p>
   * If a zero axis is specifed then an InvalidArgument exception is thrown.
   * If the joint type is JointType.BALL then a RuntimeException is thrown.
   *
   * @param axis	The axis which the hinge rotates about.
   */
  public setHingeRotationAxis(axis: Vec3): void {
    FabrikJoint3D.validateAxis(axis);

    if (this.mJointType != JointType.BALL) {
      this.mRotationAxisUV.set(axis.normalised());
    } else {
      throw new Error(
        'Joint type is JointType.BALL - it does not have a hinge rotation axis.'
      );
    }
  }

  /**
   * Return the hinge reference axis, which is the direction about which hinge rotation is measured.
   * <p>
   * If the joint type is BALL (i.e. not a hinge) then a RuntimeException is thrown.
   *
   * @return	The hinge reference axis vector.
   */
  public getHingeReferenceAxis(): Vec3 {
    if (this.mJointType != JointType.BALL) {
      return this.mReferenceAxisUV;
    } else {
      throw new Error(
        'Joint type is JointType.BALL - it does not have a hinge reference axis.'
      );
    }
  }

  /**
   * Set the hinge reference axis, which is the direction about which the hinge rotation is measured.
   * <p>
   * If a zero axis is specifed then an InvalidArgument exception is thrown.
   * If the joint type is JointType.BALL then a RuntimeException is thrown.
   *
   * @param referenceAxis	The reference axis about which hinge rotation is measured.
   */
  public setHingeReferenceAxis(referenceAxis: Vec3): void {
    FabrikJoint3D.validateAxis(referenceAxis);

    if (this.mJointType != JointType.BALL) {
      this.mReferenceAxisUV.set(referenceAxis.normalised());
    } else {
      throw new Error(
        'Joint type is JointType.BALL - it does not have a hinge reference axis.'
      );
    }
  }

  /**
   * Return the hinge rotation axis.
   * <p>
   * If the joint type is JointType.BALL (i.e. not a hinge) then a RuntimeException is thrown.
   *
   * @return	The hinge rotation axis vector.
   */
  public getHingeRotationAxis(): Vec3 {
    if (this.mJointType != JointType.BALL) {
      return this.mRotationAxisUV;
    } else {
      throw new Error(
        'Joint type is JointType.BALL - it does not have a hinge rotation axis.'
      );
    }
  }

  /**
   * Return the type of this joint.
   * <p>
   * This may be JointType.BALL, JointType.GLOBAL_HINGE or JointType.LOCAL_HINGE.
   *
   * @return	The type of this joint.
   */
  public getJointType(): JointType {
    return this.mJointType;
  }

  /** Return a concise, human-readable description of this FebrikJoint3D object. */
  // @Override
  public toString(): string {
    let s = ``;
    switch (this.mJointType) {
      case JointType.BALL:
        s += `Joint type: Ball\r\n`;
        s += `Constraint angle: ${this.mRotorConstraintDegs}`;
        break;
      case JointType.GLOBAL_HINGE:
      case JointType.LOCAL_HINGE:
        if (this.mJointType == JointType.GLOBAL_HINGE) {
          s += `Joint type                    : Global hinge\r\n`;
        } else {
          s += `Joint type                    : Local hinge\r\n`;
        }
        s += `Rotation axis                 : ${this.mRotationAxisUV}\r\n`;
        s += `Reference axis                : ${this.mReferenceAxisUV}\r\n`;
        s += `Anticlockwise constraint angle: ${this.mHingeClockwiseConstraintDegs}\r\n`;
        s += `Clockwise constraint angle    : ${this.mHingeClockwiseConstraintDegs}\r\n`;
        break;
    }

    return s;
  }

  // ---------- Private Methods ----------

  private static validateConstraintAngleDegs(angleDegs: number): void {
    if (
      angleDegs < FabrikJoint3D.MIN_CONSTRAINT_ANGLE_DEGS ||
      angleDegs > FabrikJoint3D.MAX_CONSTRAINT_ANGLE_DEGS
    ) {
      throw new Error(
        'Constraint angles must be within the range ' +
          FabrikJoint3D.MIN_CONSTRAINT_ANGLE_DEGS +
          ' to ' +
          FabrikJoint3D.MAX_CONSTRAINT_ANGLE_DEGS +
          ' inclusive.'
      );
    }
  }

  private static validateAxis(axis: Vec3): void {
    if (axis.length() <= 0.0) {
      throw new Error('Provided axis is illegal - it has a magnitude of zero.');
    }
  }

  //   @Override
  //   public int hashCode() {
  //     final int prime = 31;
  //     int result = 1;
  //     result = prime * result + Float.floatToIntBits(mHingeAnticlockwiseConstraintDegs);
  //     result = prime * result + Float.floatToIntBits(mHingeClockwiseConstraintDegs);
  //     result = prime * result + ((mJointType == null) ? 0 : mJointType.hashCode());
  //     result = prime * result + ((mReferenceAxisUV == null) ? 0 : mReferenceAxisUV.hashCode());
  //     result = prime * result + ((mRotationAxisUV == null) ? 0 : mRotationAxisUV.hashCode());
  //     result = prime * result + Float.floatToIntBits(mRotorConstraintDegs);
  //     return result;
  //   }

  //   @Override
  public equals(obj: Object): boolean {
    if (this == obj) {
      return true;
    }

    if (obj == null) {
      return false;
    }

    const other = obj as FabrikJoint3D;

    if (
      this.mHingeAnticlockwiseConstraintDegs !=
      other.mHingeAnticlockwiseConstraintDegs
    ) {
      return false;
    }

    if (
      this.mHingeClockwiseConstraintDegs != other.mHingeClockwiseConstraintDegs
    ) {
      return false;
    }

    if (this.mJointType != other.mJointType) {
      return false;
    }

    if (this.mReferenceAxisUV == null) {
      if (other.mReferenceAxisUV != null) {
        return false;
      }
    } else if (!this.mReferenceAxisUV.equals(other.mReferenceAxisUV)) {
      return false;
    }

    if (this.mRotationAxisUV == null) {
      if (other.mRotationAxisUV != null) {
        return false;
      }
    } else if (!this.mRotationAxisUV.equals(other.mRotationAxisUV)) {
      return false;
    }

    if (this.mRotorConstraintDegs != other.mRotorConstraintDegs) {
      return false;
    }

    return true;
  }
} // End of FabrikJoint3D class
