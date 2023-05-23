/** Class to represent a 3D Inverse Kinematics (IK) chain that can be solved for a given target using the FABRIK algorithm.
 * <p>
 * A FabrikChain3D consists primarily of a list of connected {@link au.edu.federation.caliko.FabrikBone3D} objects, and a number of parameters which
 * keep track of settings related to how we go about solving the IK chain.
 *
 * @author Al Lansley
 * @version 0.5.3 - 19/06/2019
 */
import { Color } from '../utils/Color';
import { Vec3 } from '../utils/Vec3';
import { FabrikBone3D } from './FabrikBone3D';
import { FabrikChain } from './FabrikChain';
import { FabrikJoint3D, JointType } from './FabrikJoint3D';
import { FabrikStructure3D } from './FabrikStructure3D';
export declare enum BaseboneConstraintType3D {
    NONE = 0,
    GLOBAL_ROTOR = 1,
    LOCAL_ROTOR = 2,
    GLOBAL_HINGE = 3,
    LOCAL_HINGE = 4
}
export declare class FabrikChain3D implements FabrikChain<FabrikBone3D, Vec3, FabrikJoint3D> {
    static DefaultApproximatelyEqualsTolerance: number;
    /**
     * The core of a FabrikChain3D is a list of FabrikBone3D objects. It is this chain that we attempt to solve for a specified
     * target location via the solveForTarget method(s).
     */
    private mChain;
    /**
     * The name of this FabrikChain3D object.
     * <p>
     * Although entirely optional, it may be used to uniquely identify a specific FabrikChain3D in an an array/list/map
     * or such of FabrikChain3D objects.
     *
     * @see  #setName
     * @see  #getName
     */
    private mName;
    /**
     * The distance threshold we must meet in order to consider this FabrikChain3D to be successfully solved for distance.
     * <p>
     * When we solve a chain so that the distance between the end effector and target is less than or equal to the distance
     * threshold, then we consider the chain to be solved and will dynamically abort any further attempts to solve the chain.
     * <p>
     * The default solve distance threshold is <strong>1.0f</strong>.
     * <p>
     * The minimum valid distance threshold is 0.0f, however a slightly higher value should be used to avoid forcing the IK
     * chain solve process to run repeatedly when an <strong>acceptable</strong> (but not necessarily <em>perfect</em>)
     * solution is found. Setting a very low solve distance threshold may result in significantly increased processor usage and
     * hence increased processing time to solve a given IK chain.
     * <p>
     * Although this property is the main criteria used to establish whether or not we have solved a given IK chain, it works
     * in combination with the {@link #mMaxIterationAttempts} and {@link mMinIterationChange} fields to improve the
     * performance of the algorithm in situations where we may not be able to solve a given IK chain. Such situations may arise
     * when bones in the chain are highly constrained, or when the target is further away than the length of a chain which has
     * a fixed base location.
     * <p>
     * See {@link #setSolveDistanceThreshold(float) }
     * See {@link #mMaxIterationAttempts }
     * See {@link #mMinIterationChange }
     */
    private mSolveDistanceThreshold;
    /**
     * maxIterationAttempts (int)	Specifies the maximum number of attempts that will be performed in order to solve the IK chain.
     * If we have not solved the chain to within the solve distance threshold after this many attempts then we accept the best
     * solution we have best on solve distance to target.
     * <p>
     * The default is 20 iteration attempts.
     */
    private mMaxIterationAttempts;
    /**
     * minIterationChange	(float)	Specifies the minimum distance improvement which must be made per solve attempt in order for us to believe it
     * worthwhile to continue making attempts to solve the IK chain. If this iteration change is not exceeded then we abort any further solve
     * attempts and accept the best solution we have based on solve distance to target.
     *
     * The default is 0.01f.
     */
    private mMinIterationChange;
    /**
     * chainLength	(float)	The chainLength is the combined length of all bones in this FabrikChain3D object.
     * <p>
     * When a FabrikBone3D is added or removed from the chain using the addBone, addConsecutiveBone or removeBone methods, then
     * the chainLength is updated to reflect this.
     * <p>
     * See {@link #addBone(FabrikBone3D)}
     * See {@link #addConsecutiveBone(FabrikBone3D)}
     * See {@link #removeBone(int)}
     */
    private mChainLength;
    /**
     * mBaseLocation (Vec3f)	The location of the start joint of the first bone in the IK chain.
     * <p>
     * By default, FabrikChain3D objects are created with a fixed base location, that is the start joint
     * of the first bone in the chain is not moved during the solving process. A user may still move this
     * base location by calling setFixedBaseMode(boolean) and the FABRIK algorithm will then
     * honour this new location as the 'fixed' base location.
     * <p>
     * The default is Vec3f(0.f, 0.0f).
     * <p>
     * See {@link #setFixedBaseMode(boolean)}
     */
    private mFixedBaseLocation;
    /** mFixedBaseMode	Whether this FabrikChain3D has a fixed (i.e. immovable) base location.
     *
     * By default, the location of the start joint of the first bone added to the IK chain is considered fixed. This
     * 'anchors' the base of the chain in place. Optionally, a user may toggle this behaviour by calling
     * {@link #setFixedBaseMode(boolean)} to enable or disable locking the basebone to a fixed starting location.
     *
     * See {@link #setFixedBaseMode(boolean)}
     */
    private mFixedBaseMode;
    /**
     * Each chain has a BaseboneConstraintType3D - this may be either:
     * - NONE,         // No constraint - basebone may rotate freely
     * - GLOBAL_ROTOR, // World-space rotor (i.e. ball joint) constraint
     * - LOCAL_ROTOR,  // Rotor constraint which is relative to the coordinate space of the connected bone
     * - GLOBAL_HINGE, // World-space hinge constraint, or
     * - LOCAL_HINGE   // Hinge constraint which is relative to the coordinate space of the connected bone
     */
    private mBaseboneConstraintType;
    /** mBaseboneConstraintUV	The direction around which we should constrain the basebone.
     * <p>
     * To ensure correct operation, the provided Vec3f is normalised inside the {@link #setBaseboneConstraintUV(Vec3f)} method. Passing a Vec3f
     * with a magnitude of zero will result in the constraint not being set.
     */
    private mBaseboneConstraintUV;
    /**
     * mBaseboneRelativeConstraintUV	The basebone direction constraint in the coordinate space of the bone in another chain
     * that this chain is connected to.
     */
    private mBaseboneRelativeConstraintUV;
    /**
     * mBaseboneRelativeReferenceConstraintUV	The basebone reference constraint in the coordinate space of the bone in another chain
     * that this chain is connected to.
     */
    private mBaseboneRelativeReferenceConstraintUV;
    /**
     * mTargetlastLocation	The last target location for the end effector of this IK chain.
     * <p>
     * The target location can be updated via the {@link #solveForTarget(Vec3f)} or {@link #solveForTarget(float, float, float)} methods, which in turn
     * will call the solveIK(Vec3f) method to attempt to solve the IK chain, resulting in an updated chain configuration.
     * <p>
     * The default is Vec3f(Float.MAX_VALUE, Float.MAX_VALUE, Float.MAX_VALUE)
     */
    private mLastTargetLocation;
    /**
     * The width in pixels of the line used to draw constraints for this chain.
     * <p>
     * The valid range is 1.0f to 32.0f inclusive.
     * <p>
     * The default is 2.0f pixels.
     */
    private mConstraintLineWidth;
    /**
     * The previous location of the start joint of the first bone added to the chain.
     * <p>
     * We keep track of the previous base location in order to use it to determine if the current base location and
     * previous base location are the same, i.e. has the base location moved between the last run to this run? If
     * the base location has moved, then we MUST solve the IK chain for this new base location - even if the target
     * location has remained the same between runs.
     * <p>
     * The default is Vec3f(Float.MAX_VALUE, Float.MAX_VALUE, Float.MAX_VALUE).
     * <p>
     * See {@link #setFixedBaseMode(boolean)}
     */
    private mLastBaseLocation;
    /**
     * mCurrentSolveDistance	The current distance between the end effector and the target location for this IK chain.
     * <p>
     * The current solve distance is updated when an attempt is made to solve the IK chain as triggered by a call to the
     * {@link #solveForTarget(Vec3f)} or (@link #solveForTarget(float, float, float) methods.
     */
    private mCurrentSolveDistance;
    /**
     * The zero-indexed number of the chain this chain is connected to in a FabrikStructure3D.
     * <p>
     * If the value is -1 then it's not connected to another bone or chain.
     *
     * The default is -1.
     */
    private mConnectedChainNumber;
    /**
     * The zero-indexed number of the bone that this chain is connected to, if it's connected to another chain at all.
     * <p>
     * If the value is -1 then it's not connected to another bone or chain.
     *
     * The default is -1.
     */
    private mConnectedBoneNumber;
    /**
     * mEmbeddedTarget	An embedded target location which can be used to solve this chain.
     * <p>
     * Embedded target locations allow structures to be solved for multiple targets (one per chain in the structure)
     * rather than all chains being solved for the same target. To use embedded targets, the mUseEmbeddedTargets flag
     * must be true (which is not the default) - this flag can be set via a call to setEmbeddedTargetMode(true).
     *
     * See (@link #setEmbeddedTargetMode(boolean) }
     */
    private mEmbeddedTarget;
    /**
     * mUseEmbeddedTarget	Whether or not to use the mEmbeddedTarget location when solving this chain.
     * <p>
     * This flag may be toggled by calling the setEmbeddedTargetMode(true) on the chain.
     * <p>
     * The default is false.
     * <p>
     * See {@link #setEmbeddedTargetMode(boolean) }
     */
    private mUseEmbeddedTarget;
    /** Default constructor */
    /**
     * Copy constructor.
     *
     * @param	source	The chain to duplicate.
     */
    static NewByFabrikChain3D(source: FabrikChain3D): FabrikChain3D;
    /**
     * Naming constructor.
     *
     * @param	name	The name to set for this chain.
     */
    constructor(name: string);
    isEmpty(): boolean;
    firstBone(): FabrikBone3D;
    lastBone(): FabrikBone3D;
    firstBoneEndLocation(): Vec3;
    lastBoneEndLocation(): Vec3;
    /**
     * Add a bone to the end of this IK chain of this FabrikChain3D object.
     * <p>
     * This chain's {@link mChainLength} property is updated to take into account the length of the
     * new bone added to the chain.
     * <p>
     * In addition, if the bone being added is the very first bone, then this chain's
     * {@link mFixedBaseLocation} property is set from the start joint location of the bone.
     *
     * @param	bone	The FabrikBone3D object to add to this FabrikChain3D.
     * @see		#mChainLength
     * @see		#mFixedBaseLocation
     */
    addBone(bone: FabrikBone3D): void;
    /**
     * Add a bone to the end of this IK chain given the direction unit vector and length of the new bone to add.
     * <p>
     * The bone added does not have any rotational constraints enforced, and will be drawn with a default color
     * of white at full opacity.
     * <p>
     * This method can only be used when the IK chain contains a basebone, as without it we do not
     * have a start location for this bone (i.e. the end location of the previous bone).
     * <p>
     * If this method is executed on a chain which does not contain a basebone then a {@link RuntimeException}
     * is thrown.
     * <p>
     * If this method is provided with a direction unit vector of zero, or a bone length of zero then then an
     * {@link IllegalArgumentException} is thrown.
     *
     * @param	directionUV The initial direction of the new bone
     * @param	length		The length of the new bone
     */
    /**
     * Add a consecutive bone to the end of this IK chain given the direction unit vector and length of the new bone to add.
     * <p>
     * The bone added does not have any rotational constraints enforced, and will be drawn with a default color
     * of white at full opacity.
     * <p>
     * This method can only be used when the IK chain contains a basebone, as without it we do not
     * have a start location for this bone (i.e. the end location of the previous bone).
     * <p>
     * If this method is executed on a chain which does not contain a basebone then a {@link RuntimeException}
     * is thrown.
     * <p>
     * If this method is provided with a direction unit vector of zero, or a bone length of zero then then an
     * {@link IllegalArgumentException} is thrown.
     *
     * @param	directionUV The initial direction of the new bone
     * @param	length		The length of the new bone
     * @param	color		The color with which to draw the bone
     */
    /**
     * Add a pre-created consecutive bone to the end of this IK chain.
     * <p>
     * This method can only be used when the IK chain contains a basebone, as without it we do not
     * have a start location for this bone (i.e. the end location of the previous bone).
     * <p>
     * If this method is executed on a chain which does not contain a basebone then a {@link RuntimeException}
     * is thrown.
     * <p>
     * If this method is provided with a direction unit vector of zero, or a bone length of zero then then an
     * {@link IllegalArgumentException} is thrown.
     *
     * @param	bone		The bone to add to the end of the chain.
     */
    addConsecutiveBone(bone: FabrikBone3D): void;
    /**
     * Add a consecutive hinge constrained bone to the end of this chain. The bone may rotate freely about the hinge axis.
     * <p>
     * The bone will be drawn with a default color of white.
     * <p>
     * This method can only be used when the IK chain contains a basebone, as without it we do not
     * have a start location for this bone (i.e. the end location of the previous bone).
     * <p>
     * If this method is executed on a chain which does not contain a basebone then a RuntimeException is thrown.
     * If this method is provided with a direction unit vector of zero, then an IllegalArgumentException is thrown.
     * If the joint type requested is not JointType.LOCAL_HINGE or JointType.GLOBAL_HINGE then an IllegalArgumentException is thrown.
     * If this method is provided with a hinge rotation axis unit vector of zero, then an IllegalArgumentException is thrown.
     *
     * @param	directionUV			The initial direction of the new bone.
     * @param	length				The length of the new bone.
     * @param	jointType			The type of hinge joint to be used - either JointType.LOCAL or JointType.GLOBAL.
     * @param	hingeRotationAxis	The axis about which the hinge joint freely rotates.
     */
    /**
     * Add a consecutive hinge constrained bone to the end of this chain. The bone may rotate freely about the hinge axis.
     * <p>
     * The bone will be drawn with a default color of white.
     * <p>
     * This method can only be used when the IK chain contains a basebone, as without it we do not
     * have a start location for this bone (i.e. the end location of the previous bone).
     * <p>
     * If this method is executed on a chain which does not contain a basebone then a RuntimeException is thrown.
     * If this method is provided with a direction unit vector of zero, then an IllegalArgumentException is thrown.
     * If the joint type requested is not JointType.LOCAL_HINGE or JointType.GLOBAL_HINGE then an IllegalArgumentException is thrown.
     * If this method is provided with a hinge rotation axis unit vector of zero, then an IllegalArgumentException is thrown.
     *
     * @param	directionUV			The initial direction of the new bone.
     * @param	length				The length of the new bone.
     * @param	jointType			The type of hinge joint to be used - either JointType.LOCAL or JointType.GLOBAL.
     * @param	hingeRotationAxis	The axis about which the hinge joint freely rotates.
     * @param	color				The color to draw the bone.
     */
    addConsecutiveFreelyRotatingHingedBone(directionUV: Vec3, length: number, jointType: JointType, hingeRotationAxis: Vec3, color?: Color): void;
    /**
     * Add a consecutive hinge constrained bone to the end of this IK chain.
     * <p>
     * The hinge type may be a global hinge where the rotation axis is specified in world-space, or
     * a local hinge, where the rotation axis is relative to the previous bone in the chain.
     * <p>
     * If this method is executed on a chain which does not contain a basebone then a RuntimeException is thrown.
     * If this method is provided with bone direction or hinge constraint axis of zero then an IllegalArgumentException is thrown.
     * If the joint type requested is not LOCAL_HINGE or GLOBAL_HINGE then an IllegalArgumentException is thrown.
     *
     * @param	directionUV			The initial direction of the new bone.
     * @param	length				The length of the new bone.
     * @param	jointType			The joint type of the new bone.
     * @param	hingeRotationAxis	The axis about which the hinge rotates.
     * @param	clockwiseDegs		The clockwise constraint angle in degrees.
     * @param	anticlockwiseDegs	The anticlockwise constraint angle in degrees.
     * @param	hingeReferenceAxis	The axis about which any clockwise/anticlockwise rotation constraints are enforced.
     * @param	color				The color to draw the bone.
     */
    addConsecutiveHingedBone(directionUV: Vec3, length: number, jointType: JointType, hingeRotationAxis: Vec3, clockwiseDegs: number, anticlockwiseDegs: number, hingeReferenceAxis: Vec3, color?: Color): void;
    /**
     * Add a consecutive hinge constrained bone to the end of this IK chain.
     * <p>
     * The hinge type may be a global hinge where the rotation axis is specified in world-space, or
     * a local hinge, where the rotation axis is relative to the previous bone in the chain.
     * <p>
     * This method can only be used when the IK chain contains a basebone, as without it we do not
     * have a start location for this bone (i.e. the end location of the previous bone).
     * <p>
     * If this method is executed on a chain which does not contain a basebone then a RuntimeException is thrown.
     * If this method is provided with bone direction or hinge constraint axis of zero then an IllegalArgumentException is thrown.
     * If the joint type requested is not LOCAL_HINGE or GLOBAL_HINGE then an IllegalArgumentException is thrown.
     *
     * @param	directionUV						The initial direction of the new bone.
     * @param	length							The length of the new bone.
     * @param	jointType						The joint type of the new bone.
     * @param	hingeRotationAxis				The axis about which the hinge rotates.
     * @param	clockwiseDegs					The clockwise constraint angle in degrees.
     * @param	anticlockwiseDegs				The anticlockwise constraint angle in degrees.
     * @param	hingeConstraintReferenceAxis	The reference axis about which any clockwise/anticlockwise rotation constraints are enforced.
     */
    /**
     * Add a consecutive rotor (i.e. ball joint) constrained bone to the end of this IK chain.
     * <p>
     * This method can only be used when the IK chain contains a basebone, as without it we do not
     * have a start location for this bone (i.e. the end location of the previous bone).
     * <p>
     * If this method is executed on a chain which does not contain a basebone then a RuntimeException is thrown.
     * If this method is provided with bone direction or hinge constraint axis of zero then an IllegalArgumentException is thrown.
     *
     * @param	boneDirectionUV					The initial direction unit vector of the new bone.
     * @param	boneLength						The length of the new bone.
     * @param	constraintAngleDegs				The rotor constraint angle of the new bone.
     * @param	color							The color to draw the bone.
     */
    addConsecutiveRotorConstrainedBone(boneDirectionUV: Vec3, boneLength: number, constraintAngleDegs: number, color?: Color): void;
    /**
     * Add a consecutive rotor (i.e. ball joint) constrained bone to the end of this IK chain.
     * <p>
     * The bone will be drawn in white at full opacity by default. This method can only be used when the IK chain contains
     * a basebone, as without it we do not have a start location for this bone (i.e. the end location of the previous bone).
     * <p>
     * If this method is executed on a chain which does not contain a basebone then a RuntimeException is thrown.
     * If this method is provided with bone direction or hinge constraint axis of zero then an IllegalArgumentException is thrown.
     * If the joint type requested is not LOCAL_HINGE or GLOBAL_HINGE then an IllegalArgumentException is thrown.
     *
     * @param	boneDirectionUV		The initial direction unit vector of the new bone.
     * @param	boneLength			The length of the new bone.
     * @param	constraintAngleDegs	The rotor constraint angle for of the new bone.
     */
    /**
     * Return the basebone relative unit vector of this chain.
     *
     * This direction is updated by the FabrikStructure3D when this chain is connected to another chain. There is
     * no other possible way of doing it as we have no knowledge of other chains, but the structure does, allowing
     * us to calculate this relative constraint UV.
     *
     * @return The basebone relative constraint UV as updated (on solve) by the structure containing this chain.
     */
    getBaseboneRelativeConstraintUV(): Vec3;
    /**
     * Return the basebone constraint type of this chain.
     *
     * @return	The basebone constraint type of this chain.
     */
    getBaseboneConstraintType(): BaseboneConstraintType3D;
    /**
     * Method to set the line width (in pixels) with which to draw any constraint lines.
     * <p>
     * Valid values are 1.0f to 32.0f inclusive, although the OpenGL standard specifies that only line widths of 1.0f are guaranteed to work.
     * Values outside of this range will result in an IllegalArgumentException being thrown.
     *
     * @param	lineWidth	The width of the line used to draw constraint lines.
     */
    setConstraintLineWidth(lineWidth: number): void;
    /**
     * Get the directional constraint of the basebone.
     * <p>
     * If the basebone is not constrained then a RuntimeException is thrown. If you wish to check whether the
     * basebone of this IK chain is constrained you may use the {@link #getBaseboneConstraintType()} method.
     *
     * @return  The global directional constraint unit vector of the basebone of this IK chain.
     */
    getBaseboneConstraintUV(): Vec3;
    /**
     * Return the base location of the IK chain.
     * <p>
     * Regardless of how many bones are contained in the chain, the base location is always the start location of the
     * first bone in the chain.
     * <p>
     * This method does not return the mBaseLocation property of this chain because the start location of the basebone
     * may be more up-to-date due to a moving 'fixed' location.
     *
     * @return	The location of the start joint of the first bone in this chain.
     */
    getBaseLocation(): Vec3;
    /**
     * Return a bone by its zero-indexed location in the IK chain.
     *
     * @param	boneNumber	The number of the bone to return from the Vector of FabrikBone3D objects.
     * @return				The specified bone.
     */
    getBone(boneNumber: number): FabrikBone3D;
    /**
     * Return the List%lt;FabrikBone3D%gt; which comprises the actual IK chain of this FabrikChain3D object.
     *
     * @return	The List%lt;FabrikBone3D%gt; which comprises the actual IK chain of this FabrikChain3D object.
     */
    getChain(): Array<FabrikBone3D>;
    /**
     * Return the current length of the IK chain.
     * <p>
     * This method does not dynamically re-calculate the length of the chain - it merely returns the previously
     * calculated chain length, which gets updated each time a bone is added or removed from the chain. However,
     * as the chain length is updated whenever necessary this should be fine.
     * <p>
     * If you need a calculated-on-the-fly value for the chain length, then use the getLiveChainLength() method.
     *
     * @return	The pre-calculated length of the IK chain as stored in the mChainLength property.
     */
    getChainLength(): number;
    /**
     * Return the index of the bone in another chain that this this chain is connected to.
     * <p>
     * Returns -1 (default) if this chain is not connected to another chain.
     *
     * @return	The zero-indexed number of the bone we are connected to in the chain we are connected to.
     */
    getConnectedBoneNumber(): number;
    /**
     * Return the index of the chain in a FabrikStructure3D that this this chain is connected to.
     * <p>
     * Returns -1 (default) if this chain is not connected to another chain.
     *
     * @return	The zero-index number of the chain we are connected to.
     */
    getConnectedChainNumber(): number;
    /**
     * Return the location of the end effector in the IK chain.
     * <p>
     * Regardless of how many bones are contained in the chain, the end effector is always the end location
     * of the final bone in the chain.
     *
     * @return	The location of this chain's end effector.
     */
    getEffectorLocation(): Vec3;
    /**
     * Return whether or not this chain uses an embedded target.
     *
     * Embedded target mode may be enabled or disabled using setEmbeddededTargetMode(boolean).
     *
     * @return whether or not this chain uses an embedded target.
     */
    getEmbeddedTargetMode(): boolean;
    /**
     * Return the embedded target location.
     *
     * @return the embedded target location.
     */
    getEmbeddedTarget(): Vec3;
    /**
     * Return the target of the last solve attempt.
     * <p>
     * The target location and the effector location are not necessarily at the same location unless the chain has been solved
     * for distance, and even then they are still likely to be <i>similar</i> rather than <b>identical</b> values.
     *
     * @return	The target location of the last solve attempt.
     */
    getLastTargetLocation(): Vec3;
    /**
     * Return the live calculated length of the chain.
     *
     * Typically, the getChainLength() can be called which returns the length of the chain as updated /
     * recalculated when a bone is added or removed from the chain (which is significantly faster as it
     * doesn't require recalculation), but sometimes it may be useful to get the definitive most
     * up-to-date chain length so you can check if operations being performed have altered the chain
     * length - hence this method.
     *
     * @return	The 'live' (i.e. calculated from scratch) length of the chain.
     */
    getLiveChainLength(): number;
    /**
     * Return the name of this IK chain.
     *
     * @return	The name of this IK chain.
     */
    getName(): string;
    /**
     * Return the number of bones in this IK chain.
     *
     * @return	The number of bones in this IK chain.
     */
    getNumBones(): number;
    /**
     * Remove a bone from this IK chain by its zero-indexed location in the chain.
     * <p>
     * This chain's {@link mChainLength} property is updated to take into account the new chain length.
     * <p>
     * If the bone number to be removed does not exist in the chain then an IllegalArgumentException is thrown.
     *
     * @param	boneNumber	The zero-indexed bone to remove from this IK chain.
     */
    removeBone(boneNumber: number): void;
    /**
     * Set the relative basebone constraint UV - this direction should be relative to the coordinate space of the basebone.
     *
     * This function is deliberately made package-private as it should not be used by the end user - instead, the
     * FabrikStructure3D.solveForTarget() method will update this mBaseboneRelativeConstraintUV property FOR USE BY this
     * chain as required.
     *
     * The reason for this is that this chain on its own cannot calculate the relative constraint
     * direction, because it relies on direction of the connected / 'host' bone in the chain that this chain is connected
     * to - only we have no knowledge of that other chain! But, the FabrikStructure3D DOES have knowledge of that other
     * chain, and is hence able to calculate and update this relative basebone constraint direction for us.
     **/
    setBaseboneRelativeConstraintUV(constraintUV: Vec3): void;
    /**
     * Set the relative basebone reference constraint UV - this direction should be relative to the coordinate space of the basebone.
     *
     * This function is deliberately made package-private as it should not be used by the end user - instead, the
     * FabrikStructure3D.solveForTarget() method will update this mBaseboneRelativeConstraintUV property FOR USE BY this
     * chain as required.
     *
     * This property is required when we have a LOCAL_HINGE basebone constraint with reference axes - we must maintain the
     * hinge's own rotation and reference axes, and then the FabrikStructure3D.solveForTarget() method updates the
     * mBaseboneRelativeConstraintUV and mBaseboneRelativeReferenceConstraintUV as required.
     **/
    setBaseboneRelativeReferenceConstraintUV(constraintUV: Vec3): void;
    /**
     * Return the relative basebone reference constraint unit vector.
     *
     * @return	The relative basebone reference constraint unit vector.
     */
    getBaseboneRelativeReferenceConstraintUV(): Vec3;
    /**
     * Specify whether we should use the embedded target location when solving the IK chain.
     *
     * @param	value	Whether we should use the embedded target location when solving the IK chain.
     */
    setEmbeddedTargetMode(value: boolean): void;
    /**
     * Set this chain to have a rotor basebone constraint.
     * <p>
     * Depending on whether the constraint type is GLOBAL_ROTOR or LOCAL_ROTOR the constraint will be applied
     * about global space or about the local coordinate system of a bone in another chain that this chain is
     * attached to.
     * <p>
     * The angle provided should be between the range of 0.0f (completely constrained) to 180.0f (completely free to
     * rotate). Values outside of this range will be clamped to the relevant minimum or maximum.
     * <p>
     * If this chain does not contain a basebone then a RuntimeException is thrown.
     * If the constraint axis is a zero vector or the rotor type is not GLOBAL_ROTOR or LOCAL_ROTOR then then an
     * IllegalArgumentException is thrown.
     *
     * @param	rotorType		The type of constraint to apply, this may be GLOBAL_ROTOR or LOCAL_ROTOR.
     * @param	constraintAxis	The axis about which the rotor applies.
     * @param	angleDegs		The angle about the constraint axis to limit movement in degrees.
     */
    setRotorBaseboneConstraint(rotorType: BaseboneConstraintType3D, constraintAxis: Vec3, angleDegs: number): void;
    /**
     * Set this chain to have a hinged basebone constraint.
     * <p>
     * If the number of bones in this chain is zero (i.e. it does not contain a basebone) then a RuntimeException is thrown.
     * If the hinge rotation or reference axes are zero vectors then an IllegalArgumentException is thrown.
     * If the hinge reference axis does not lie in the plane of the hinge rotation axis (that is, they are not perpendicular)
     * then an IllegalArgumentException is thrown.
     *
     * @param hingeType				The type of constraint to apply, this may be GLOBAL_HINGE or LOCAL_HINGE.
     * @param hingeRotationAxis		The axis about which the global hinge rotates.
     * @param cwConstraintDegs		The clockwise constraint angle about the hinge reference axis in degrees.
     * @param acwConstraintDegs		The clockwise constraint angle about the hinge reference axis in degrees.
     * @param hingeReferenceAxis	The axis (perpendicular to the hinge rotation axis) about which the constraint angles apply.
     */
    setHingeBaseboneConstraint(hingeType: BaseboneConstraintType3D, hingeRotationAxis: Vec3, cwConstraintDegs: number, acwConstraintDegs: number, hingeReferenceAxis: Vec3): void;
    /**
     * Set this chain to have a freely rotating globally hinged basebone.
     * <p>
     * The clockwise and anticlockwise constraint angles are automatically set to 180 degrees and the hinge reference axis
     * is generated to be any vector perpendicular to the hinge rotation axis.
     * <p>
     * If the number of bones in this chain is zero (i.e. it does not contain a basebone) then a RuntimeException is thrown.
     * If the hinge rotation axis are zero vectors then an IllegalArgumentException is thrown.
     *
     * @param hingeRotationAxis		The world-space axis about which the global hinge rotates.
     */
    setFreelyRotatingGlobalHingedBasebone(hingeRotationAxis: Vec3): void;
    /**
     * Set this chain to have a freely rotating globally hinged basebone.
     * <p>
     * The clockwise and anticlockwise constraint angles are automatically set to 180 degrees and the hinge reference axis
     * is generated to be any vector perpendicular to the hinge rotation axis.
     * <p>
     * If the number of bones in this chain is zero (i.e. it does not contain a basebone) then a RuntimeException is thrown.
     * If the hinge rotation axis are zero vectors then an IllegalArgumentException is thrown.
     *
     * @param hingeRotationAxis		The world-space axis about which the global hinge rotates.
     */
    setFreelyRotatingLocalHingedBasebone(hingeRotationAxis: Vec3): void;
    /**
     * Set this chain to have a locally hinged basebone.
     * <p>
     * The clockwise and anticlockwise constraint angles are automatically set to 180 degrees and the hinge reference axis
     * is generated to be any vector perpendicular to the hinge rotation axis.
     * <p>
     * If the number of bones in this chain is zero (i.e. it does not contain a basebone) then a RuntimeException is thrown.
     * If the hinge rotation axis are zero vectors then an IllegalArgumentException is thrown.
     *
     * @param hingeRotationAxis		The local axis about which the hinge rotates.
     * @param cwDegs				The clockwise constraint angle in degrees.
     * @param acwDegs				The anticlockwise constraint angle in degrees.
     * @param hingeReferenceAxis	The local reference axis about which the hinge is constrained.
     * */
    setLocalHingedBasebone(hingeRotationAxis: Vec3, cwDegs: number, acwDegs: number, hingeReferenceAxis: Vec3): void;
    /**
     * Set this chain to have a globally hinged basebone.
     * <p>
     * The clockwise and anticlockwise constraint angles are automatically set to 180 degrees and the hinge reference axis
     * is generated to be any vector perpendicular to the hinge rotation axis.
     * <p>
     * If the number of bones in this chain is zero (i.e. it does not contain a basebone) then a RuntimeException is thrown.
     * If the hinge rotation axis are zero vectors then an IllegalArgumentException is thrown.
     *
     * @param hingeRotationAxis		The global / world-space axis about which the hinge rotates.
     * @param cwDegs				The clockwise constraint angle in degrees.
     * @param acwDegs				The anticlockwise constraint angle in degrees.
     * @param hingeReferenceAxis	The global / world-space reference axis about which the hinge is constrained.
     * */
    setGlobalHingedBasebone(hingeRotationAxis: Vec3, cwDegs: number, acwDegs: number, hingeReferenceAxis: Vec3): void;
    /**
     * Set a directional constraint for the basebone.
     * <p>
     * This method constrains the <strong>basebone</strong> (<em>only</em>) to a global direction unit vector.
     * <p>
     * Attempting to set the basebone constraint when the bone has a basebone constraint type of NONE or providing
     * a constraint vector of zero will result will result in an IllegalArgumentException being thrown.
     *
     * @param	constraintUV	The direction unit vector to constrain the basebone to.
     * @see		au.edu.federation.caliko.FabrikJoint3D#setBallJointConstraintDegs(float angleDegs)
     * @see		au.edu.federation.caliko.FabrikJoint3D#setHingeJointClockwiseConstraintDegs(float)
     * @see		au.edu.federation.caliko.FabrikJoint3D#setHingeJointAnticlockwiseConstraintDegs(float)
     */
    setBaseboneConstraintUV(constraintUV: Vec3): void;
    /**
     * Method used to move the base location of a chain relative to its connection point.
     * <p>
     * The assignment is made by reference so that this base location and the location where
     * we attach to the other chain are the same Vec3f object.
     * <p>
     * Note: If this chain is attached to another chain then this 'fixed' base location will be updated
     * as and when the connection point in the chain we are attached to moves.
     *
     * @param	baseLocation	The fixed base location for this chain.
     */
    setBaseLocation(baseLocation: Vec3): void;
    /**
     * Connect this chain to the specified bone in the specified chain in the provided structure.
     * <p>
     * In order to connect this chain to another chain, both chains must exist within the same structure.
     * <p>
     * If the structure does not contain the specified chain or bone then an IllegalArgumentException is thrown.
     *
     * @param	structure	The structure which contains the chain which contains the bone to connect to.
     * @param	chainNumber	The zero-indexed number of the chain in the structure to connect to.
     * @param	boneNumber	The zero-indexed number of the bone in the chain to connect to.
     */
    connectToStructure(structure: FabrikStructure3D, chainNumber: number, boneNumber: number): void;
    /**
     * Set the fixed basebone mode for this chain.
     * <p>
     * If the basebone is 'fixed' in place, then its start location cannot move. The bone is still allowed to
     * rotate, with or without constraints.
     * <p>
     * Specifying a non-fixed base location while this chain is connected to another chain will result in a
     * RuntimeException being thrown.
     * <p>
     * Fixing the basebone's start location in place and constraining to a global absolute direction are
     * mutually exclusive. Disabling fixed base mode while the chain's constraint type is
     * BaseboneConstraintType3D.GLOBAL_ABSOLUTE will result in a RuntimeException being thrown.	 *
     *
     * @param  value  Whether or not to fix the basebone start location in place.
     */
    setFixedBaseMode(value: boolean): void;
    /**
     * Set the maximum number of attempts that will be made to solve this IK chain.
     * <p>
     * The FABRIK algorithm may require more than a single pass in order to solve
     * a given IK chain for an acceptable distance threshold. If we reach this
     * iteration limit then we stop attempting to solve the IK chain. Further details
     * on this topic are provided in the {@link #mMaxIterationAttempts} documentation.
     * <p>
     * If a maxIterations value of less than 1 is provided then an IllegalArgumentException is
     * thrown, as we must make at least a single attempt to solve an IK chain.
     *
     * @param maxIterations  The maximum number of attempts that will be made to solve this IK chain.
     */
    setMaxIterationAttempts(maxIterations: number): void;
    /**
     * Set the minimum iteration change before we dynamically abort any further attempts to solve this IK chain.
     * <p>
     * If the latest solution found has changed by less than this amount then we consider the progress being made
     * to be not worth the computational effort and dynamically abort any further attempt to solve the chain for
     * the current target to minimise CPU usage.
     * <p>
     * If a minIterationChange value of less than zero is specified then an IllegalArgumentException is
     * thrown.
     *
     * @param	minIterationChange  The minimum change in solve distance from one iteration to the next.
     */
    setMinIterationChange(minIterationChange: number): void;
    /**
     * Set the name of this chain, capped to 100 characters if required.
     *
     * @param	name	The name to set.
     */
    setName(name: string): void;
    /**
     * Set the distance threshold within which we consider the IK chain to be successfully solved.
     * <p>
     * If a solve distance value of less than zero is specified then an IllegalArgumentException is thrown.
     *
     * @param  solveDistance  The distance between the end effector of this IK chain and target within which we will accept the solution.
     */
    setSolveDistanceThreshold(solveDistance: number): void;
    /**
     * Set the color of all bones in this chain to the specified color.
     *
     * @param	color	The color to set all bones in this chain.
     */
    setColor(color: Color): void;
    /**
     * Solve this IK chain for the current embedded target location.
     *
     * The embedded target location can be updated by calling updateEmbeddedTarget(Vec3f).
     *
     * @return The distance between the end effector and the chain's embedded target location for our best solution.
     */
    solveForEmbeddedTarget(): number;
    /**
     * Method to solve this IK chain for the given target location.
     * <p>
     * The end result of running this method is that the IK chain configuration is updated.
     * <p>
     * To minimuse CPU usage, this method dynamically aborts if:
     * - The solve distance (i.e. distance between the end effector and the target) is below the {@link mSolveDistanceThreshold},
     * - A solution incrementally improves on the previous solution by less than the {@link mMinIterationChange}, or
     * - The number of attempts to solve the IK chain exceeds the {@link mMaxIterationAttempts}.
     *
     * @param	targetX	The x location of the target
     * @param	targetY	The y location of the target
     * @param	targetZ	The z location of the target
     * @return			The resulting distance between the end effector and the new target location after solving the IK chain.
     */
    /**
     * Method to solve this IK chain for the given target location.
     * <p>
     * The end result of running this method is that the IK chain configuration is updated.
     * <p>
     * To minimuse CPU usage, this method dynamically aborts if:
     * - The solve distance (i.e. distance between the end effector and the target) is below the {@link mSolveDistanceThreshold},
     * - A solution incrementally improves on the previous solution by less than the {@link mMinIterationChange}, or
     * - The number of attempts to solve the IK chain exceeds the {@link mMaxIterationAttempts}.
     *
     * @param	newTarget	The location of the target for which we will solve this IK chain.
     * @return	float		The resulting distance between the end effector and the new target location after solving the IK chain.
     */
    solveForTarget(newTarget: Vec3): number;
    /** Return a concise, human-readable of the IK chain. */
    toString(): string;
    /**
     * Solve the IK chain for the given target using the FABRIK algorithm.
     * <p>
     * If this chain does not contain any bones then a RuntimeException is thrown.
     *
     * @return	The best solve distance found between the end-effector of this chain and the provided target.
     */
    private solveIK;
    /***
     * Calculate the length of this IK chain by adding up the lengths of each bone.
     * <p>
     * The resulting chain length is stored in the mChainLength property.
     * <p>
     * This method is called each time a bone is added to the chain. In addition, the
     * length of each bone is recalculated during the process to ensure that our chain
     * length is accurate. As the typical usage of a FabrikChain3D is to add a number
     * of bones once (during setup) and then use them, this should not have any
     * performance implication on the typical execution cycle of a FabrikChain3D object,
     * as this method will not be called in any method which executes regularly.
     */
    updateChainLength(): void;
    /**
     * Update the embedded target for this chain.
     *
     * The internal mEmbeddedTarget object is updated with the location of the provided parameter.
     * If the chain is not in useEmbeddedTarget mode then a RuntimeException is thrown.
     * Embedded target mode can be enabled by calling setEmbeddedTargetMode(true) on the chain.
     *
     * @param newEmbeddedTarget	The location of the embedded target.
     */
    updateEmbeddedTarget(newEmbeddedTarget: Vec3): void;
    /**
     * Update the embedded target for this chain.
     *
     * The internal mEmbeddedTarget object is updated with the location of the provided parameter.
     * If the chain is not in useEmbeddedTarget mode then a RuntimeException is thrown.
     * Embedded target mode can be enabled by calling setEmbeddedTargetMode(true) on the chain.
     *
     * @param x	The x location of the embedded target.
     * @param y	The y location of the embedded target.
     * @param z	The z location of the embedded target.
     */
    /**
     * Clone and return the IK Chain of this FabrikChain3D, that is, the list of FabrikBone3D objects.
     *
     * @return	A cloned List%lt;FabrikBone3D%gt;
     */
    private cloneIkChain;
    /**
     * {@inheritDoc}
     */
    getMaxIterationAttempts(): number;
    /**
     * {@inheritDoc}
     */
    getMinIterationChange(): number;
    /**
     * {@inheritDoc}
     */
    getSolveDistanceThreshold(): number;
    equals(obj: Object): boolean;
}
