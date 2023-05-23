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
import { Vec3 } from '../utils/Vec3';
import { FabrikJoint } from './FabrikJoint';
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
export declare enum JointType {
    BALL = 0,
    GLOBAL_HINGE = 1,
    LOCAL_HINGE = 2
}
export declare class FabrikJoint3D implements FabrikJoint<FabrikJoint3D> {
    /** The minimum valid constraint angle for a joint is 0 degrees - this will fully constrain the bone. */
    static MIN_CONSTRAINT_ANGLE_DEGS: number;
    /** The maximum valid constraint angle for a joint is 180 degrees - this will allow the bone complete freedom to rotate. */
    static MAX_CONSTRAINT_ANGLE_DEGS: number;
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
    private mRotorConstraintDegs;
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
    private mHingeClockwiseConstraintDegs;
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
    private mHingeAnticlockwiseConstraintDegs;
    /** The unit vector axis about which a hinged joint may rotate. */
    private mRotationAxisUV;
    /** For a hinged joint, this is the axis used as a point of reference for rotation (it is NOT the axis about which the hinge rotates). */
    private mReferenceAxisUV;
    /**
     * The type of this joint.
     * <p>
     * Valid options are JointType.BALL, JointType.GLOBAL_HINGE, and JointType.LOCAL_HINGE.
     *
     * The default is JointType.BALL.
     */
    private mJointType;
    /**
     * Default constructor.
     * <p>
     * By default, a FabrikJoint3D cannot be used until the type of joint that it represents has
     * been specified. This may be done via the {@link #setAsBallJoint(float)},
     * {@link #setAsGlobalHinge(au.edu.federation.utils.Vec3f, float, float, Vec3f)} or
     * {@link #setAsLocalHinge(au.edu.federation.utils.Vec3f, float, float, Vec3f)} methods.
     */
    /**
     * Copy constructor.
     * <p>
     * Performs a deep copy / clone of the source object so that there are no shared references
     * between the objects after the new object has been constructed.
     *
     * @param	source	The FabrikJoint3D object to copy.
     */
    constructor(source?: FabrikJoint3D | undefined);
    /**
     * Method to clone a FabrikJoint3D.
     * <p>
     * Internally, this uses the copy constructor {@link #FabrikJoint3D(FabrikJoint3D)} to
     * perform the clone.
     *
     * @param	source	The FabrikJoint3D to clone.
     * @return			The cloned FabrikJoint3D.
     */
    clone(source: FabrikJoint3D): FabrikJoint3D;
    /**
     * Set this joint to have the same properties as the proided 'source' joint.
     *
     * @param	source	The joint from which to duplicate all properties on this joint.
     */
    set(source: FabrikJoint3D): void;
    /**
     * Set this joint to be a ball joint.
     *
     * @param	constraintAngleDegs	The maximum allowable angle in degrees between this bone and the previous bone in the chain.
     */
    setAsBallJoint(constraintAngleDegs: number): void;
    /**
     * Specify this joint to be a hinge with the provided settings.
     *
     * @param jointType						The type of joint, this may be either BALL, GLOBAL_HINGE or LOCAL_HINGE.
     * @param rotationAxis					The rotation axis of the hinge.
     * @param clockwiseConstraintDegs		The clockwise constraint angle about the reference axis.
     * @param anticlockwiseConstraintDegs	The anticlockwise constraint angle about the reference axis.
     * @param referenceAxis					The reference axis itself, which must fall within the plane of the hinge rotation axis.
     */
    setHinge(jointType: JointType, rotationAxis: Vec3, clockwiseConstraintDegs: number, anticlockwiseConstraintDegs: number, referenceAxis: Vec3): void;
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
    setAsGlobalHinge(globalRotationAxis: Vec3, cwConstraintDegs: number, acwConstraintDegs: number, globalReferenceAxis: Vec3): void;
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
    setAsLocalHinge(localRotationAxis: Vec3, cwConstraintDegs: number, acwConstraintDegs: number, localReferenceAxis: Vec3): void;
    /**
     * Get the clockwise constraint angle of a local or global hinge joint.
     * <p>
     * If the joint is of type JointType.BALL then a RuntimeException is thrown.
     *
     * @return	The clockwise constraint angle in degrees.
     */
    getHingeClockwiseConstraintDegs(): number;
    /**
     * Get the anti-clockwise constraint angle of a local or global hinge joint.
     * <p>
     * If the joint is of type JointType.BALL then a RuntimeException is thrown.
     *
     * @return	The anti-clockwise constraint angle in degrees.
     */
    getHingeAnticlockwiseConstraintDegs(): number;
    /**
     * Set the rotor constraint angle of a ball joint.
     * <p>
     * If the angle is outside of the range 0.0f..180.0f then an IllegalArgumentException is thrown.
     * If the joint is not of type JointType.BALL then a RuntimeException is thrown.
     *
     * @param	angleDegs	The rotor constraint angle in degrees.
     */
    setBallJointConstraintDegs(angleDegs: number): void;
    /**
     * Get the rotor constraint angle of a ball joint.
     * <p>
     * If the joint is not of type JointType.BALL then a RuntimeException is thrown.
     *
     * @return	The rotor constraint angle in degrees.
     */
    getBallJointConstraintDegs(): number;
    /**
     * Set the clockwise constraint angle of a hinge joint.
     * <p>
     * If the angle is outside of the range 0.0f..180.0f then an IllegalArgumentException is thrown.
     * If the joint is of type JointType.BALL then a RuntimeException is thrown.
     *
     * @param	angleDegs	The clockwise hinge constraint angle in degrees.
     */
    setHingeJointClockwiseConstraintDegs(angleDegs: number): void;
    /**
     * Set the anit-clockwise constraint angle of a hinge joint.
     * <p>
     * If the angle is outside of the range 0.0f..180.0f then an IllegalArgumentException is thrown.
     * If the joint is of type JointType.BALL then a RuntimeException is thrown.
     *
     * @param	angleDegs	The anti-clockwise hinge constraint angle in degrees.
     */
    setHingeJointAnticlockwiseConstraintDegs(angleDegs: number): void;
    /**
     * Set the hinge rotation axis as a normalised version of the provided axis.
     * <p>
     * If a zero axis is specifed then an InvalidArgument exception is thrown.
     * If the joint type is JointType.BALL then a RuntimeException is thrown.
     *
     * @param axis	The axis which the hinge rotates about.
     */
    setHingeRotationAxis(axis: Vec3): void;
    /**
     * Return the hinge reference axis, which is the direction about which hinge rotation is measured.
     * <p>
     * If the joint type is BALL (i.e. not a hinge) then a RuntimeException is thrown.
     *
     * @return	The hinge reference axis vector.
     */
    getHingeReferenceAxis(): Vec3;
    /**
     * Set the hinge reference axis, which is the direction about which the hinge rotation is measured.
     * <p>
     * If a zero axis is specifed then an InvalidArgument exception is thrown.
     * If the joint type is JointType.BALL then a RuntimeException is thrown.
     *
     * @param referenceAxis	The reference axis about which hinge rotation is measured.
     */
    setHingeReferenceAxis(referenceAxis: Vec3): void;
    /**
     * Return the hinge rotation axis.
     * <p>
     * If the joint type is JointType.BALL (i.e. not a hinge) then a RuntimeException is thrown.
     *
     * @return	The hinge rotation axis vector.
     */
    getHingeRotationAxis(): Vec3;
    /**
     * Return the type of this joint.
     * <p>
     * This may be JointType.BALL, JointType.GLOBAL_HINGE or JointType.LOCAL_HINGE.
     *
     * @return	The type of this joint.
     */
    getJointType(): JointType;
    /** Return a concise, human-readable description of this FebrikJoint3D object. */
    toString(): string;
    private static validateConstraintAngleDegs;
    private static validateAxis;
    equals(obj: Object): boolean;
}
