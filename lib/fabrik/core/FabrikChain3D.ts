/** Class to represent a 3D Inverse Kinematics (IK) chain that can be solved for a given target using the FABRIK algorithm.
 * <p>
 * A FabrikChain3D consists primarily of a list of connected {@link au.edu.federation.caliko.FabrikBone3D} objects, and a number of parameters which
 * keep track of settings related to how we go about solving the IK chain.
 *
 * @author Al Lansley
 * @version 0.5.3 - 19/06/2019
 */

import {Color} from '../utils/Color';
import {Mat3} from '../utils/Mat3';
import {Utils} from '../utils/Utils';
import {Vec3} from '../utils/Vec3';
import {FabrikBone3D} from './FabrikBone3D';
import {FabrikChain} from './FabrikChain';
import {FabrikJoint3D, JointType} from './FabrikJoint3D';
import {FabrikStructure3D} from './FabrikStructure3D';

export enum BaseboneConstraintType3D {
  NONE, // No constraint - basebone may rotate freely
  GLOBAL_ROTOR, // World-space rotor constraint
  LOCAL_ROTOR, // Rotor constraint in the coordinate space of (i.e. relative to) the direction of the connected bone
  GLOBAL_HINGE, // World-space hinge constraint
  LOCAL_HINGE, // Hinge constraint in the coordinate space of (i.e. relative to) the direction of the connected bone
}

export class FabrikChain3D
  implements FabrikChain<FabrikBone3D, Vec3, FabrikJoint3D>
{
  public static DefaultApproximatelyEqualsTolerance = 0.001;
  // ---------- Private Properties ----------

  /**
   * The core of a FabrikChain3D is a list of FabrikBone3D objects. It is this chain that we attempt to solve for a specified
   * target location via the solveForTarget method(s).
   */
  private mChain = new Array<FabrikBone3D>();

  /**
   * The name of this FabrikChain3D object.
   * <p>
   * Although entirely optional, it may be used to uniquely identify a specific FabrikChain3D in an an array/list/map
   * or such of FabrikChain3D objects.
   *
   * @see  #setName
   * @see  #getName
   */
  private mName: string = '';

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
  private mSolveDistanceThreshold: number = 1.0;

  /**
   * maxIterationAttempts (int)	Specifies the maximum number of attempts that will be performed in order to solve the IK chain.
   * If we have not solved the chain to within the solve distance threshold after this many attempts then we accept the best
   * solution we have best on solve distance to target.
   * <p>
   * The default is 20 iteration attempts.
   */
  private mMaxIterationAttempts: number = 20;

  /**
   * minIterationChange	(float)	Specifies the minimum distance improvement which must be made per solve attempt in order for us to believe it
   * worthwhile to continue making attempts to solve the IK chain. If this iteration change is not exceeded then we abort any further solve
   * attempts and accept the best solution we have based on solve distance to target.
   *
   * The default is 0.01f.
   */
  private mMinIterationChange: number = 0.01;

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
  private mChainLength: number = 0;

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
  private mFixedBaseLocation: Vec3 = new Vec3();

  /** mFixedBaseMode	Whether this FabrikChain3D has a fixed (i.e. immovable) base location.
   *
   * By default, the location of the start joint of the first bone added to the IK chain is considered fixed. This
   * 'anchors' the base of the chain in place. Optionally, a user may toggle this behaviour by calling
   * {@link #setFixedBaseMode(boolean)} to enable or disable locking the basebone to a fixed starting location.
   *
   * See {@link #setFixedBaseMode(boolean)}
   */
  private mFixedBaseMode: boolean = true;

  /**
   * Each chain has a BaseboneConstraintType3D - this may be either:
   * - NONE,         // No constraint - basebone may rotate freely
   * - GLOBAL_ROTOR, // World-space rotor (i.e. ball joint) constraint
   * - LOCAL_ROTOR,  // Rotor constraint which is relative to the coordinate space of the connected bone
   * - GLOBAL_HINGE, // World-space hinge constraint, or
   * - LOCAL_HINGE   // Hinge constraint which is relative to the coordinate space of the connected bone
   */
  private mBaseboneConstraintType: BaseboneConstraintType3D =
    BaseboneConstraintType3D.NONE;

  /** mBaseboneConstraintUV	The direction around which we should constrain the basebone.
   * <p>
   * To ensure correct operation, the provided Vec3f is normalised inside the {@link #setBaseboneConstraintUV(Vec3f)} method. Passing a Vec3f
   * with a magnitude of zero will result in the constraint not being set.
   */
  private mBaseboneConstraintUV: Vec3 = new Vec3();

  /**
   * mBaseboneRelativeConstraintUV	The basebone direction constraint in the coordinate space of the bone in another chain
   * that this chain is connected to.
   */
  private mBaseboneRelativeConstraintUV: Vec3 = new Vec3();

  /**
   * mBaseboneRelativeReferenceConstraintUV	The basebone reference constraint in the coordinate space of the bone in another chain
   * that this chain is connected to.
   */
  private mBaseboneRelativeReferenceConstraintUV: Vec3 = new Vec3();

  /**
   * mTargetlastLocation	The last target location for the end effector of this IK chain.
   * <p>
   * The target location can be updated via the {@link #solveForTarget(Vec3f)} or {@link #solveForTarget(float, float, float)} methods, which in turn
   * will call the solveIK(Vec3f) method to attempt to solve the IK chain, resulting in an updated chain configuration.
   * <p>
   * The default is Vec3f(Float.MAX_VALUE, Float.MAX_VALUE, Float.MAX_VALUE)
   */
  private mLastTargetLocation: Vec3 = new Vec3(
    Number.MAX_VALUE,
    Number.MAX_VALUE,
    Number.MAX_VALUE
  );

  /**
   * The width in pixels of the line used to draw constraints for this chain.
   * <p>
   * The valid range is 1.0f to 32.0f inclusive.
   * <p>
   * The default is 2.0f pixels.
   */
  private mConstraintLineWidth: number = 2.0;

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
  private mLastBaseLocation: Vec3 = new Vec3(
    Number.MAX_VALUE,
    Number.MAX_VALUE,
    Number.MAX_VALUE
  );

  /**
   * mCurrentSolveDistance	The current distance between the end effector and the target location for this IK chain.
   * <p>
   * The current solve distance is updated when an attempt is made to solve the IK chain as triggered by a call to the
   * {@link #solveForTarget(Vec3f)} or (@link #solveForTarget(float, float, float) methods.
   */
  private mCurrentSolveDistance: number = Number.MAX_VALUE;

  /**
   * The zero-indexed number of the chain this chain is connected to in a FabrikStructure3D.
   * <p>
   * If the value is -1 then it's not connected to another bone or chain.
   *
   * The default is -1.
   */
  private mConnectedChainNumber: number = -1;

  /**
   * The zero-indexed number of the bone that this chain is connected to, if it's connected to another chain at all.
   * <p>
   * If the value is -1 then it's not connected to another bone or chain.
   *
   * The default is -1.
   */
  private mConnectedBoneNumber: number = -1;

  /**
   * mEmbeddedTarget	An embedded target location which can be used to solve this chain.
   * <p>
   * Embedded target locations allow structures to be solved for multiple targets (one per chain in the structure)
   * rather than all chains being solved for the same target. To use embedded targets, the mUseEmbeddedTargets flag
   * must be true (which is not the default) - this flag can be set via a call to setEmbeddedTargetMode(true).
   *
   * See (@link #setEmbeddedTargetMode(boolean) }
   */
  private mEmbeddedTarget: Vec3 = new Vec3();

  /**
   * mUseEmbeddedTarget	Whether or not to use the mEmbeddedTarget location when solving this chain.
   * <p>
   * This flag may be toggled by calling the setEmbeddedTargetMode(true) on the chain.
   * <p>
   * The default is false.
   * <p>
   * See {@link #setEmbeddedTargetMode(boolean) }
   */
  private mUseEmbeddedTarget: boolean = false;

  // ---------- Constructors ----------

  /** Default constructor */
  // constructor() {}

  /**
   * Copy constructor.
   *
   * @param	source	The chain to duplicate.
   */
  // public FabrikChain3D(FabrikChain3D source)
  // {
  // 	// Force copy by value
  // 	mChain = source.cloneIkChain();

  // 	mFixedBaseLocation.set( source.getBaseLocation() );
  // 	mLastTargetLocation.set(source.mLastTargetLocation);
  // 	mLastBaseLocation.set(source.mLastBaseLocation);
  // 	mEmbeddedTarget.set(source.mEmbeddedTarget);

  // 	// Copy the basebone constraint UV if there is one to copy
  // 	if (source.mBaseboneConstraintType != BaseboneConstraintType3D.NONE)
  // 	{
  // 		mBaseboneConstraintUV.set(source.mBaseboneConstraintUV);
  // 		mBaseboneRelativeConstraintUV.set(source.mBaseboneRelativeConstraintUV);
  // 	}

  // 	// Native copy by value for primitive members
  // 	mChainLength            = source.mChainLength;
  // 	mCurrentSolveDistance   = source.mCurrentSolveDistance;
  // 	mConnectedChainNumber   = source.mConnectedChainNumber;
  // 	mConnectedBoneNumber    = source.mConnectedBoneNumber;
  // 	mBaseboneConstraintType = source.mBaseboneConstraintType;
  // 	mName                   = source.mName;
  // 	mConstraintLineWidth    = source.mConstraintLineWidth;
  // 	mUseEmbeddedTarget      = source.mUseEmbeddedTarget;
  // }
  public static NewByFabrikChain3D(source: FabrikChain3D): FabrikChain3D {
    const c = new FabrikChain3D(source.getName());
    // Force copy by value
    c.mChain = source.cloneIkChain();

    c.mFixedBaseLocation.set(source.getBaseLocation());
    c.mLastTargetLocation.set(source.mLastTargetLocation);
    c.mLastBaseLocation.set(source.mLastBaseLocation);
    c.mEmbeddedTarget.set(source.mEmbeddedTarget);

    // Copy the basebone constraint UV if there is one to copy
    if (source.mBaseboneConstraintType != BaseboneConstraintType3D.NONE) {
      c.mBaseboneConstraintUV.set(source.mBaseboneConstraintUV);
      c.mBaseboneRelativeConstraintUV.set(source.mBaseboneRelativeConstraintUV);
    }

    // Native copy by value for primitive members
    c.mChainLength = source.mChainLength;
    c.mCurrentSolveDistance = source.mCurrentSolveDistance;
    c.mConnectedChainNumber = source.mConnectedChainNumber;
    c.mConnectedBoneNumber = source.mConnectedBoneNumber;
    c.mBaseboneConstraintType = source.mBaseboneConstraintType;
    c.mName = source.mName;
    c.mConstraintLineWidth = source.mConstraintLineWidth;
    c.mUseEmbeddedTarget = source.mUseEmbeddedTarget;

    return c;
  }

  /**
   * Naming constructor.
   *
   * @param	name	The name to set for this chain.
   */
  constructor(name: string) {
    this.mName = name;
  }

  // ---------- Public Methods ------------

  public isEmpty(): boolean {
    return this.mChain.length == 0;
  }

  public firstBone(): FabrikBone3D {
    if (this.isEmpty()) {
      throw new Error('chain is empty');
    }
    return this.mChain[0];
  }

  public lastBone(): FabrikBone3D {
    if (this.isEmpty()) {
      throw new Error('chain is empty');
    }
    return this.mChain[this.mChain.length - 1];
  }

  public firstBoneEndLocation(): Vec3 {
    if (this.isEmpty()) {
      throw new Error('chain is empty');
    }
    return this.firstBone().getEndLocation();
  }

  public lastBoneEndLocation(): Vec3 {
    if (this.isEmpty()) {
      throw new Error('chain is empty');
    }

    return this.lastBone().getEndLocation();
  }

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
  // @Override
  public addBone(bone: FabrikBone3D): void {
    // Add the new bone to the end of the ArrayList of bones
    this.mChain.push(bone);

    // If this is the basebone...
    if (this.mChain.length == 1) {
      // ...then keep a copy of the fixed start location...
      this.mFixedBaseLocation.set(bone.getStartLocation());

      // ...and set the basebone constraint UV to be around the initial bone direction
      this.mBaseboneConstraintUV = bone.getDirectionUV();
    }

    // Increment the number of bones in the chain and update the chain length
    this.updateChainLength();
  }

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
  // @Override
  // public  addConsecutiveBone( directionUV:Vec3,  length:number):void { this.addConsecutiveBone(directionUV, length, new Color() ); }

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
  // public  addConsecutiveBone( directionUV:Vec3,  length:number,  color:Color = new Color()):void
  // {
  // 	// Validate the direction unit vector - throws an IllegalArgumentException if it has a magnitude of zero
  // 	Utils.validateDirectionUV(directionUV);

  // 	// Validate the length of the bone - throws an IllegalArgumentException if it is not a positive value
  // 	Utils.validateLength(length);

  // 	// If we have at least one bone already in the chain...
  // 	if (!mChain.isEmpty())
  // 	{
  // 		// Get the end location of the last bone, which will be used as the start location of the new bone
  // 		Vec3f prevBoneEnd = mChain.get(mChain.size()-1).getEndLocation();

  // 		// Add a bone to the end of this IK chain
  // 		// Note: We use a normalised version of the bone direction
  // 		addBone( new FabrikBone3D(prevBoneEnd, directionUV.normalised(), length, color) );
  // 	}
  // 	else // Attempting to add a relative bone when there is no basebone for it to be relative to?
  // 	{
  // 		throw new RuntimeException("You cannot add the basebone as a consecutive bone as it does not provide a start location. Use the addBone() method instead.");
  // 	}
  // }

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
  public addConsecutiveBone(bone: FabrikBone3D): void {
    // Validate the direction unit vector - throws an IllegalArgumentException if it has a magnitude of zero
    const dir = bone.getDirectionUV();
    Utils.validateDirectionUV(dir);

    // Validate the length of the bone - throws an IllegalArgumentException if it is not a positive value
    const len = bone.liveLength();
    Utils.validateLength(len);

    // If we have at least one bone already in the chain...
    if (this.mChain.length != 0) {
      // Get the end location of the last bone, which will be used as the start location of the new bone
      const prevBoneEnd = this.lastBoneEndLocation();

      bone.setStartLocation(prevBoneEnd);
      bone.setEndLocation(prevBoneEnd.plus(dir.times(len)));

      // Add a bone to the end of this IK chain
      this.addBone(bone);
    } // Attempting to add a relative bone when there is no base bone for it to be relative to?
    else {
      throw new Error(
        'You cannot add the base bone to a chain using this method as it does not provide a start location.'
      );
    }
  }

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
  // public  addConsecutiveFreelyRotatingHingedBone( directionUV:Vec3,  length:number,  jointType:JointType,  hingeRotationAxis:Vec3):void
  // {
  // 	// Because we aren't constraining this bone to a reference axis within the hinge rotation axis we don't care about the hinge constraint
  // 	// reference axis (7th param) so we'll just generate an axis perpendicular to the hinge rotation axis and use that.
  // 	this.addConsecutiveHingedBone( directionUV, length, jointType, hingeRotationAxis, 180.0, 180.0, Vec3.genPerpendicularVectorQuick(hingeRotationAxis), new Color() );
  // }

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
  public addConsecutiveFreelyRotatingHingedBone(
    directionUV: Vec3,
    length: number,
    jointType: JointType,
    hingeRotationAxis: Vec3,
    color: Color = new Color()
  ): void {
    // Because we aren't constraining this bone to a reference axis within the hinge rotation axis we don't care about the hinge constraint
    // reference axis (7th param) so we'll just generate an axis perpendicular to the hinge rotation axis and use that.
    this.addConsecutiveHingedBone(
      directionUV,
      length,
      jointType,
      hingeRotationAxis,
      180.0,
      180.0,
      Vec3.genPerpendicularVectorQuick(hingeRotationAxis),
      color
    );
  }

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
  public addConsecutiveHingedBone(
    directionUV: Vec3,
    length: number,
    jointType: JointType,
    hingeRotationAxis: Vec3,
    clockwiseDegs: number,
    anticlockwiseDegs: number,
    hingeReferenceAxis: Vec3,
    color: Color = new Color(0.5, 0.5, 0.5)
  ): void {
    // Validate the direction and rotation axis unit vectors, and the length of the bone.
    Utils.validateDirectionUV(directionUV);
    Utils.validateDirectionUV(hingeRotationAxis);
    Utils.validateLength(length);

    // Cannot add a consectuive bone of any kind if the there is no basebone
    if (this.isEmpty()) {
      throw new Error(
        'You must add a basebone before adding a consectutive bone.'
      );
    }

    // Normalise the direction and hinge rotation axis
    directionUV.normalise();
    hingeRotationAxis.normalise();

    // Get the end location of the last bone, which will be used as the start location of the new bone
    const prevBoneEnd = this.lastBoneEndLocation();

    // Create a bone and set the draw color...
    const bone = FabrikBone3D.NewByStartDirectionLength(
      prevBoneEnd,
      directionUV,
      length
    );
    bone.setColor(color);

    // ...then create and set up a joint which we'll apply to that bone.
    const joint = new FabrikJoint3D();
    switch (jointType) {
      case JointType.GLOBAL_HINGE:
        joint.setAsGlobalHinge(
          hingeRotationAxis,
          clockwiseDegs,
          anticlockwiseDegs,
          hingeReferenceAxis
        );
        break;
      case JointType.LOCAL_HINGE:
        joint.setAsLocalHinge(
          hingeRotationAxis,
          clockwiseDegs,
          anticlockwiseDegs,
          hingeReferenceAxis
        );
        break;
      default:
        throw new Error(
          'Hinge joint types may be only JointType.GLOBAL_HINGE or JointType.LOCAL_HINGE.'
        );
    }

    // Set the joint we just set up on the the new bone we just created
    bone.setJoint(joint);

    // Finally, add the bone to this chain
    this.addBone(bone);
  }

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
  // public void addConsecutiveHingedBone(Vec3f directionUV,
  // 		                                       float length,
  // 		                                       JointType jointType,
  // 		                                       Vec3f hingeRotationAxis,
  // 		                                       float clockwiseDegs,
  // 		                                       float anticlockwiseDegs,
  // 		                                       Vec3f hingeConstraintReferenceAxis)
  // {
  // 	addConsecutiveHingedBone(directionUV, length, jointType, hingeRotationAxis, clockwiseDegs, anticlockwiseDegs, hingeConstraintReferenceAxis, new Color4f() );
  // }

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
  public addConsecutiveRotorConstrainedBone(
    boneDirectionUV: Vec3,
    boneLength: number,
    constraintAngleDegs: number,
    color: Color = new Color(0.5, 0.5, 0.5)
  ): void {
    // Validate the bone direction and length and that we have a basebone
    Utils.validateDirectionUV(boneDirectionUV);
    Utils.validateLength(boneLength);

    if (this.isEmpty()) {
      throw new Error(
        'Add a basebone before attempting to add consectuive bones.'
      );
    }

    // Create the bone starting at the end of the previous bone, set its direction, constraint angle and color
    // then add it to the chain. Note: The default joint type of a new FabrikBone3D is JointType.BALL.
    const bone = FabrikBone3D.NewByStartDirectionLengthColor(
      this.lastBoneEndLocation(),
      boneDirectionUV.normalise(),
      boneLength,
      color
    );
    bone.setBallJointConstraintDegs(constraintAngleDegs);
    this.addBone(bone);
  }

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
  // public void addConsecutiveRotorConstrainedBone(Vec3f boneDirectionUV, float boneLength, float constraintAngleDegs)
  // {
  // 	addConsecutiveRotorConstrainedBone( boneDirectionUV, boneLength, constraintAngleDegs, new Color4f() );
  // }

  /**
   * Return the basebone relative unit vector of this chain.
   *
   * This direction is updated by the FabrikStructure3D when this chain is connected to another chain. There is
   * no other possible way of doing it as we have no knowledge of other chains, but the structure does, allowing
   * us to calculate this relative constraint UV.
   *
   * @return The basebone relative constraint UV as updated (on solve) by the structure containing this chain.
   */
  // @Override
  public getBaseboneRelativeConstraintUV(): Vec3 {
    return this.mBaseboneRelativeConstraintUV;
  }

  /**
   * Return the basebone constraint type of this chain.
   *
   * @return	The basebone constraint type of this chain.
   */
  // @Override
  public getBaseboneConstraintType(): BaseboneConstraintType3D {
    return this.mBaseboneConstraintType;
  }

  /**
   * Method to set the line width (in pixels) with which to draw any constraint lines.
   * <p>
   * Valid values are 1.0f to 32.0f inclusive, although the OpenGL standard specifies that only line widths of 1.0f are guaranteed to work.
   * Values outside of this range will result in an IllegalArgumentException being thrown.
   *
   * @param	lineWidth	The width of the line used to draw constraint lines.
   */
  public setConstraintLineWidth(lineWidth: number): void {
    Utils.validateLineWidth(lineWidth);
    this.mConstraintLineWidth = lineWidth;
  }

  /**
   * Get the directional constraint of the basebone.
   * <p>
   * If the basebone is not constrained then a RuntimeException is thrown. If you wish to check whether the
   * basebone of this IK chain is constrained you may use the {@link #getBaseboneConstraintType()} method.
   *
   * @return  The global directional constraint unit vector of the basebone of this IK chain.
   */
  // @Override
  public getBaseboneConstraintUV(): Vec3 {
    if (this.mBaseboneConstraintType != BaseboneConstraintType3D.NONE) {
      return this.mBaseboneConstraintUV;
    } else {
      throw new Error(
        'Cannot return the basebone constraint when the basebone constraint type is NONE.'
      );
    }
  }

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
  // @Override
  public getBaseLocation(): Vec3 {
    return this.firstBone().getStartLocation();
  }

  /**
   * Return a bone by its zero-indexed location in the IK chain.
   *
   * @param	boneNumber	The number of the bone to return from the Vector of FabrikBone3D objects.
   * @return				The specified bone.
   */
  // @Override
  public getBone(boneNumber: number): FabrikBone3D {
    if (this.isEmpty()) {
      throw new Error('chain is empty');
    }

    if (boneNumber < 0 && boneNumber >= this.mChain.length) {
      throw new Error('out of range');
    }

    return this.mChain[boneNumber];
  }

  /**
   * Return the List%lt;FabrikBone3D%gt; which comprises the actual IK chain of this FabrikChain3D object.
   *
   * @return	The List%lt;FabrikBone3D%gt; which comprises the actual IK chain of this FabrikChain3D object.
   */
  // @Override
  public getChain(): Array<FabrikBone3D> {
    return this.mChain;
  }

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
  // @Override
  public getChainLength(): number {
    return this.mChainLength;
  }

  /**
   * Return the index of the bone in another chain that this this chain is connected to.
   * <p>
   * Returns -1 (default) if this chain is not connected to another chain.
   *
   * @return	The zero-indexed number of the bone we are connected to in the chain we are connected to.
   */
  // @Override
  public getConnectedBoneNumber(): number {
    return this.mConnectedBoneNumber;
  }

  /**
   * Return the index of the chain in a FabrikStructure3D that this this chain is connected to.
   * <p>
   * Returns -1 (default) if this chain is not connected to another chain.
   *
   * @return	The zero-index number of the chain we are connected to.
   */
  // @Override
  public getConnectedChainNumber(): number {
    return this.mConnectedChainNumber;
  }

  /**
   * Return the location of the end effector in the IK chain.
   * <p>
   * Regardless of how many bones are contained in the chain, the end effector is always the end location
   * of the final bone in the chain.
   *
   * @return	The location of this chain's end effector.
   */
  // @Override
  public getEffectorLocation(): Vec3 {
    return this.lastBoneEndLocation();
  }

  /**
   * Return whether or not this chain uses an embedded target.
   *
   * Embedded target mode may be enabled or disabled using setEmbeddededTargetMode(boolean).
   *
   * @return whether or not this chain uses an embedded target.
   */
  // @Override
  public getEmbeddedTargetMode(): boolean {
    return this.mUseEmbeddedTarget;
  }

  /**
   * Return the embedded target location.
   *
   * @return the embedded target location.
   */
  // @Override
  public getEmbeddedTarget(): Vec3 {
    return this.mEmbeddedTarget;
  }

  /**
   * Return the target of the last solve attempt.
   * <p>
   * The target location and the effector location are not necessarily at the same location unless the chain has been solved
   * for distance, and even then they are still likely to be <i>similar</i> rather than <b>identical</b> values.
   *
   * @return	The target location of the last solve attempt.
   */
  // @Override
  public getLastTargetLocation(): Vec3 {
    return this.mLastTargetLocation;
  }

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
  public getLiveChainLength(): number {
    let length = 0.0;
    this.mChain.forEach(aBone => {
      length += aBone.liveLength();
    });
    return length;
  }

  /**
   * Return the name of this IK chain.
   *
   * @return	The name of this IK chain.
   */
  // @Override
  public getName(): string {
    return this.mName;
  }

  /**
   * Return the number of bones in this IK chain.
   *
   * @return	The number of bones in this IK chain.
   */
  // @Override
  public getNumBones(): number {
    return this.mChain.length;
  }

  /**
   * Remove a bone from this IK chain by its zero-indexed location in the chain.
   * <p>
   * This chain's {@link mChainLength} property is updated to take into account the new chain length.
   * <p>
   * If the bone number to be removed does not exist in the chain then an IllegalArgumentException is thrown.
   *
   * @param	boneNumber	The zero-indexed bone to remove from this IK chain.
   */
  // @Override
  public removeBone(boneNumber: number): void {
    // If the bone number is a bone which exists...
    if (boneNumber < this.mChain.length) {
      // ...then remove the bone, decrease the bone count and update the chain length.
      this.mChain.splice(boneNumber, 1);
      this.updateChainLength();
    } else {
      throw new Error(
        'Bone ' +
          boneNumber +
          ' does not exist to be removed from the chain. Bones are zero indexed.'
      );
    }
  }

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
  public setBaseboneRelativeConstraintUV(constraintUV: Vec3): void {
    this.mBaseboneRelativeConstraintUV = constraintUV;
  }
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
  public setBaseboneRelativeReferenceConstraintUV(constraintUV: Vec3): void {
    this.mBaseboneRelativeReferenceConstraintUV = constraintUV;
  }

  /**
   * Return the relative basebone reference constraint unit vector.
   *
   * @return	The relative basebone reference constraint unit vector.
   */
  public getBaseboneRelativeReferenceConstraintUV(): Vec3 {
    return this.mBaseboneRelativeReferenceConstraintUV;
  }

  /**
   * Specify whether we should use the embedded target location when solving the IK chain.
   *
   * @param	value	Whether we should use the embedded target location when solving the IK chain.
   */
  // @Override
  public setEmbeddedTargetMode(value: boolean): void {
    this.mUseEmbeddedTarget = value;
  }

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
  public setRotorBaseboneConstraint(
    rotorType: BaseboneConstraintType3D,
    constraintAxis: Vec3,
    angleDegs: number
  ): void {
    // Sanity checking
    if (this.isEmpty()) {
      throw new Error(
        'Chain must contain a basebone before we can specify the basebone constraint type.'
      );
    }
    if (constraintAxis.length() <= 0.0) {
      throw new Error('Constraint axis cannot be zero.');
    }
    if (angleDegs < 0.0) {
      angleDegs = 0.0;
    }
    if (angleDegs > 180.0) {
      angleDegs = 180.0;
    }
    if (
      !(
        rotorType == BaseboneConstraintType3D.GLOBAL_ROTOR ||
        rotorType == BaseboneConstraintType3D.LOCAL_ROTOR
      )
    ) {
      throw new Error(
        'The only valid rotor types for this method are GLOBAL_ROTOR and LOCAL_ROTOR.'
      );
    }

    // Set the constraint type, axis and angle
    this.mBaseboneConstraintType = rotorType;
    this.mBaseboneConstraintUV = constraintAxis.normalised();
    this.mBaseboneRelativeConstraintUV.set(this.mBaseboneConstraintUV);
    this.getBone(0).getJoint().setAsBallJoint(angleDegs);
  }

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
  public setHingeBaseboneConstraint(
    hingeType: BaseboneConstraintType3D,
    hingeRotationAxis: Vec3,
    cwConstraintDegs: number,
    acwConstraintDegs: number,
    hingeReferenceAxis: Vec3
  ): void {
    // Sanity checking
    if (this.isEmpty()) {
      throw new Error(
        'Chain must contain a basebone before we can specify the basebone constraint type.'
      );
    }
    if (hingeRotationAxis.length() <= 0.0) {
      throw new Error('Hinge rotation axis cannot be zero.');
    }
    if (hingeReferenceAxis.length() <= 0.0) {
      throw new Error('Hinge reference axis cannot be zero.');
    }
    if (!Vec3.perpendicular(hingeRotationAxis, hingeReferenceAxis)) {
      throw new Error(
        'The hinge reference axis must be in the plane of the hinge rotation axis, that is, they must be perpendicular.'
      );
    }
    if (
      !(
        hingeType == BaseboneConstraintType3D.GLOBAL_HINGE ||
        hingeType == BaseboneConstraintType3D.LOCAL_HINGE
      )
    ) {
      throw new Error(
        'The only valid hinge types for this method are GLOBAL_HINGE and LOCAL_HINGE.'
      );
    }

    // Set the constraint type, axis and angle
    this.mBaseboneConstraintType = hingeType;
    this.mBaseboneConstraintUV.set(hingeRotationAxis.normalised());

    const hinge = new FabrikJoint3D();

    if (hingeType == BaseboneConstraintType3D.GLOBAL_HINGE) {
      hinge.setHinge(
        JointType.GLOBAL_HINGE,
        hingeRotationAxis,
        cwConstraintDegs,
        acwConstraintDegs,
        hingeReferenceAxis
      );
    } else {
      hinge.setHinge(
        JointType.LOCAL_HINGE,
        hingeRotationAxis,
        cwConstraintDegs,
        acwConstraintDegs,
        hingeReferenceAxis
      );
    }

    this.getBone(0).setJoint(hinge);
  }

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
  public setFreelyRotatingGlobalHingedBasebone(hingeRotationAxis: Vec3): void {
    this.setHingeBaseboneConstraint(
      BaseboneConstraintType3D.GLOBAL_HINGE,
      hingeRotationAxis,
      180.0,
      180.0,
      Vec3.genPerpendicularVectorQuick(hingeRotationAxis)
    );
  }

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
  public setFreelyRotatingLocalHingedBasebone(hingeRotationAxis: Vec3): void {
    this.setHingeBaseboneConstraint(
      BaseboneConstraintType3D.LOCAL_HINGE,
      hingeRotationAxis,
      180.0,
      180.0,
      Vec3.genPerpendicularVectorQuick(hingeRotationAxis)
    );
  }

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
  public setLocalHingedBasebone(
    hingeRotationAxis: Vec3,
    cwDegs: number,
    acwDegs: number,
    hingeReferenceAxis: Vec3
  ): void {
    this.setHingeBaseboneConstraint(
      BaseboneConstraintType3D.LOCAL_HINGE,
      hingeRotationAxis,
      cwDegs,
      acwDegs,
      hingeReferenceAxis
    );
  }

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
  public setGlobalHingedBasebone(
    hingeRotationAxis: Vec3,
    cwDegs: number,
    acwDegs: number,
    hingeReferenceAxis: Vec3
  ): void {
    this.setHingeBaseboneConstraint(
      BaseboneConstraintType3D.GLOBAL_HINGE,
      hingeRotationAxis,
      cwDegs,
      acwDegs,
      hingeReferenceAxis
    );
  }

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
  // @Override
  public setBaseboneConstraintUV(constraintUV: Vec3): void {
    if (this.mBaseboneConstraintType == BaseboneConstraintType3D.NONE) {
      throw new Error(
        'Specify the basebone constraint type with setBaseboneConstraintTypeCannot specify a basebone constraint when the current constraint type is BaseboneConstraint.NONE.'
      );
    }

    // Validate the constraint direction unit vector
    Utils.validateDirectionUV(constraintUV);

    // All good? Then normalise the constraint direction and set it
    constraintUV.normalise();
    this.mBaseboneConstraintUV.set(constraintUV);
  }

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
  // @Override
  public setBaseLocation(baseLocation: Vec3): void {
    this.mFixedBaseLocation = baseLocation;
  }

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
  public connectToStructure(
    structure: FabrikStructure3D,
    chainNumber: number,
    boneNumber: number
  ): void {
    // Sanity check chain exists
    const numChains = structure.getNumChains();
    if (chainNumber > numChains) {
      throw new Error(
        'Structure does not contain a chain ' +
          chainNumber +
          ' - it has ' +
          numChains +
          ' chains.'
      );
    }

    // Sanity check bone exists
    const numBones = structure.getChain(chainNumber).getNumBones();
    if (boneNumber > numBones) {
      throw new Error(
        'Chain does not contain a bone ' +
          boneNumber +
          ' - it has ' +
          numBones +
          ' bones.'
      );
    }

    // All good? Set the connection details
    this.mConnectedChainNumber = chainNumber;
    this.mConnectedBoneNumber = boneNumber;
  }

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
  // @Override
  public setFixedBaseMode(value: boolean): void {
    // Enforce that a chain connected to another chain stays in fixed base mode (i.e. it moves with the chain it's connected to instead of independently)
    if (!value && this.mConnectedChainNumber != -1) {
      throw new Error(
        'This chain is connected to another chain so must remain in fixed base mode.'
      );
    }

    // We cannot have a freely moving base location AND constrain the basebone to an absolute direction
    if (
      this.mBaseboneConstraintType == BaseboneConstraintType3D.GLOBAL_ROTOR &&
      !value
    ) {
      throw new Error(
        "Cannot set a non-fixed base mode when the chain's constraint type is BaseboneConstraintType3D.GLOBAL_ABSOLUTE_ROTOR."
      );
    }

    // Above conditions met? Set the fixedBaseMode
    this.mFixedBaseMode = value;
  }

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
  // @Override
  public setMaxIterationAttempts(maxIterations: number): void {
    // Ensure we have a valid maximum number of iteration attempts
    if (maxIterations < 1) {
      throw new Error(
        'The maximum number of attempts to solve this IK chain must be at least 1.'
      );
    }

    // All good? Set the new maximum iteration attempts property
    this.mMaxIterationAttempts = maxIterations;
  }

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
  // @Override
  public setMinIterationChange(minIterationChange: number): void {
    // Ensure we have a valid maximum number of iteration attempts
    if (minIterationChange < 0.0) {
      throw new Error(
        'The minimum iteration change value must be more than or equal to zero.'
      );
    }

    // All good? Set the new minimum iteration change distance
    this.mMinIterationChange = minIterationChange;
  }

  /**
   * Set the name of this chain, capped to 100 characters if required.
   *
   * @param	name	The name to set.
   */
  // @Override
  public setName(name: string): void {
    this.mName = Utils.getValidatedName(name);
  }

  /**
   * Set the distance threshold within which we consider the IK chain to be successfully solved.
   * <p>
   * If a solve distance value of less than zero is specified then an IllegalArgumentException is thrown.
   *
   * @param  solveDistance  The distance between the end effector of this IK chain and target within which we will accept the solution.
   */
  // @Override
  public setSolveDistanceThreshold(solveDistance: number): void {
    // Ensure we have a valid solve distance
    if (solveDistance < 0.0) {
      throw new Error(
        'The solve distance threshold must be greater than or equal to zero.'
      );
    }

    // All good? Set the new solve distance threshold
    this.mSolveDistanceThreshold = solveDistance;
  }

  /**
   * Set the color of all bones in this chain to the specified color.
   *
   * @param	color	The color to set all bones in this chain.
   */
  public setColor(color: Color): void {
    this.mChain.forEach(aBone => {
      aBone.setColor(color);
    });
  }

  /**
   * Solve this IK chain for the current embedded target location.
   *
   * The embedded target location can be updated by calling updateEmbeddedTarget(Vec3f).
   *
   * @return The distance between the end effector and the chain's embedded target location for our best solution.
   */
  // @Override
  public solveForEmbeddedTarget(): number {
    if (this.mUseEmbeddedTarget) {
      return this.solveForTarget(this.mEmbeddedTarget);
    } else {
      throw new Error(
        'This chain does not have embedded targets enabled - enable with setEmbeddedTargetMode(true).'
      );
    }
  }

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
  // public solveForTarget( targetX:number,  targetY:number,  targetZ:number):number
  // {
  // 	return this.solveForTarget( new Vec3(targetX, targetY, targetZ) );
  // }

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
  // @Override
  public solveForTarget(newTarget: Vec3): number {
    // If we have both the same target and base location as the last run then do not solve
    if (
      this.mLastTargetLocation.approximatelyEquals(
        newTarget,
        FabrikChain3D.DefaultApproximatelyEqualsTolerance
      ) &&
      this.mLastBaseLocation.approximatelyEquals(
        this.getBaseLocation(),
        FabrikChain3D.DefaultApproximatelyEqualsTolerance
      )
    ) {
      // return this.mCurrentSolveDistance;
    }

    /***
     * NOTE: We must allow the best solution of THIS run to be used for a new target or base location - we cannot
     * just use the last solution (even if it's better) - because that solution was for a different target / base
     * location combination and NOT for the current setup.
     */

    // Declare a list of bones to use to store our best solution
    let bestSolution: Array<FabrikBone3D> = new Array<FabrikBone3D>();

    // We start with a best solve distance that can be easily beaten
    let bestSolveDistance = Number.MAX_VALUE;

    // We'll also keep track of the solve distance from the last pass
    let lastPassSolveDistance = Number.MAX_VALUE;

    // Allow up to our iteration limit attempts at solving the chain
    let solveDistance;

    for (let loop = 0; loop < this.mMaxIterationAttempts; ++loop) {
      // Solve the chain for this target
      solveDistance = this.solveIK(newTarget);

      // Did we solve it for distance? If so, update our best distance and best solution, and also
      // update our last pass solve distance. Note: We will ALWAYS beat our last solve distance on the first run.

      if (solveDistance < bestSolveDistance) {
        bestSolveDistance = solveDistance;
        bestSolution = this.cloneIkChain();

        // If we are happy that this solution meets our distance requirements then we can exit the loop now
        if (solveDistance <= this.mSolveDistanceThreshold) {
          break;
        }
      } // Did not solve to our satisfaction? Okay...
      else {
        // Did we grind to a halt? If so break out of loop to set the best distance and solution that we have
        if (
          Math.abs(solveDistance - lastPassSolveDistance) <
          this.mMinIterationChange
        ) {
          //System.out.println("Ground to halt on iteration: " + loop);
          break;
        }
      }

      // Update the last pass solve distance
      lastPassSolveDistance = solveDistance;
    } // End of loop

    // Update our solve distance and chain configuration to the best solution found
    this.mCurrentSolveDistance = bestSolveDistance;
    this.mChain = bestSolution;

    // Update our base and target locations
    this.mLastBaseLocation.set(this.getBaseLocation());
    this.mLastTargetLocation.set(newTarget);

    return this.mCurrentSolveDistance;
  }

  /** Return a concise, human-readable of the IK chain. */
  // @Override
  public toString(): string {
    let s = `--- FabrikChain3D: ${this.mName} ---\r\n`;

    if (!this.isEmpty()) {
      s += `Bone count:    : ${this.mChain.length}\r\n`;
      s += `Base location  : ${this.getBaseLocation()}\r\n`;
      s += `Chain length   : ${this.getChainLength()}\r\n`;

      s += `Fixed base mode: ${this.mFixedBaseMode ? 'YES' : 'NO'}\r\n`;

      this.mChain.forEach(aBone => {
        s += `--- Bone: ${aBone} " ---\r\n`;
        s += aBone.toString();
      });
    } else {
      s += `Chain does not contain any bones`;
    }

    return s;
  }

  // ---------- Private Methods ----------

  /**
   * Solve the IK chain for the given target using the FABRIK algorithm.
   * <p>
   * If this chain does not contain any bones then a RuntimeException is thrown.
   *
   * @return	The best solve distance found between the end-effector of this chain and the provided target.
   */
  private solveIK(target: Vec3): number {
    // Sanity check that there are bones in the chain
    if (this.isEmpty()) {
      throw new Error(
        'It makes no sense to solve an IK chain with zero bones.'
      );
    }

    // ---------- Forward pass from end effector to base -----------

    // Loop over all bones in the chain, from the end effector (numBones-1) back to the basebone (0)
    for (let loop = this.mChain.length - 1; loop >= 0; --loop) {
      // Get the length of the bone we're working on
      const thisBone = this.getBone(loop);
      const thisBoneLength = thisBone.length();
      const thisBoneJoint = thisBone.getJoint();
      const thisBoneJointType = thisBone.getJointType();

      // If we are NOT working on the end effector bone
      if (loop != this.mChain.length - 1) {
        // Get the outer-to-inner unit vector of the bone further out
        const outerBoneOuterToInnerUV = this.getBone(loop + 1)
          .getDirectionUV()
          .negated();

        // Get the outer-to-inner unit vector of this bone
        let thisBoneOuterToInnerUV = thisBone.getDirectionUV().negated();

        // Get the joint type for this bone and handle constraints on thisBoneInnerToOuterUV
        if (thisBoneJointType == JointType.BALL) {
          // Constrain to relative angle between this bone and the outer bone if required
          const angleBetweenDegs = Vec3.getAngleBetweenDegs(
            outerBoneOuterToInnerUV,
            thisBoneOuterToInnerUV
          );
          const constraintAngleDegs =
            thisBoneJoint.getBallJointConstraintDegs();
          if (angleBetweenDegs > constraintAngleDegs) {
            thisBoneOuterToInnerUV = Vec3.getAngleLimitedUnitVectorDegs(
              thisBoneOuterToInnerUV,
              outerBoneOuterToInnerUV,
              constraintAngleDegs
            );
          }
        } else if (thisBoneJointType == JointType.GLOBAL_HINGE) {
          // Project this bone outer-to-inner direction onto the hinge rotation axis
          // Note: The returned vector is normalised.
          thisBoneOuterToInnerUV = thisBoneOuterToInnerUV.projectOntoPlane(
            thisBoneJoint.getHingeRotationAxis()
          );

          // NOTE: Constraining about the hinge reference axis on this forward pass leads to poor solutions... so we won't.
        } else if (thisBoneJointType == JointType.LOCAL_HINGE) {
          // Not a basebone? Then construct a rotation matrix based on the previous bones inner-to-to-inner direction...
          let m = new Mat3();
          let relativeHingeRotationAxis = new Vec3();
          if (loop > 0) {
            m = Mat3.createRotationMatrix(
              this.getBone(loop - 1).getDirectionUV()
            );
            relativeHingeRotationAxis = m
              .timesByVec3(thisBoneJoint.getHingeRotationAxis())
              .normalise();
          } // ...basebone? Need to construct matrix from the relative constraint UV.
          else {
            relativeHingeRotationAxis = this.mBaseboneRelativeConstraintUV;
          }

          // ...and transform the hinge rotation axis into the previous bones frame of reference.
          //Vec3f

          // Project this bone's outer-to-inner direction onto the plane described by the relative hinge rotation axis
          // Note: The returned vector is normalised.
          thisBoneOuterToInnerUV = thisBoneOuterToInnerUV.projectOntoPlane(
            relativeHingeRotationAxis
          );

          // NOTE: Constraining about the hinge reference axis on this forward pass leads to poor solutions... so we won't.
        }

        // At this stage we have a outer-to-inner unit vector for this bone which is within our constraints,
        // so we can set the new inner joint location to be the end joint location of this bone plus the
        // outer-to-inner direction unit vector multiplied by the length of the bone.
        const newStartLocation = thisBone
          .getEndLocation()
          .plus(thisBoneOuterToInnerUV.times(thisBoneLength));

        // Set the new start joint location for this bone
        thisBone.setStartLocation(newStartLocation);

        // If we are not working on the basebone, then we also set the end joint location of
        // the previous bone in the chain (i.e. the bone closer to the base) to be the new
        // start joint location of this bone.
        if (loop > 0) {
          this.getBone(loop - 1).setEndLocation(newStartLocation);
        }
      } // If we ARE working on the end effector bone...
      else {
        // Snap the end effector's end location to the target
        thisBone.setEndLocation(target);

        // Get the UV between the target / end-location (which are now the same) and the start location of this bone
        let thisBoneOuterToInnerUV = thisBone.getDirectionUV().negated();

        // If the end effector is global hinged then we have to snap to it, then keep that
        // resulting outer-to-inner UV in the plane of the hinge rotation axis
        switch (thisBoneJointType) {
          case JointType.BALL:
            // Ball joints do not get constrained on this forward pass
            break;
          case JointType.GLOBAL_HINGE:
            // Global hinges get constrained to the hinge rotation axis, but not the reference axis within the hinge plane
            thisBoneOuterToInnerUV = thisBoneOuterToInnerUV.projectOntoPlane(
              thisBoneJoint.getHingeRotationAxis()
            );
            break;
          case JointType.LOCAL_HINGE:
            // Local hinges get constrained to the hinge rotation axis, but not the reference axis within the hinge plane

            // Construct a rotation matrix based on the previous bones inner-to-to-inner direction...
            const m = Mat3.createRotationMatrix(
              this.getBone(loop - 1).getDirectionUV()
            );

            // ...and transform the hinge rotation axis into the previous bones frame of reference.
            const relativeHingeRotationAxis = m
              .timesByVec3(thisBoneJoint.getHingeRotationAxis())
              .normalise();

            // console.log(
            //   'relativeHingeRotationAxis:',
            //   thisBone,
            //   relativeHingeRotationAxis
            // );

            // Project this bone's outer-to-inner direction onto the plane described by the relative hinge rotation axis
            // Note: The returned vector is normalised.
            thisBoneOuterToInnerUV = thisBoneOuterToInnerUV.projectOntoPlane(
              relativeHingeRotationAxis
            );
            break;
        }

        // Calculate the new start joint location as the end joint location plus the outer-to-inner direction UV
        // multiplied by the length of the bone.
        const newStartLocation = target.plus(
          thisBoneOuterToInnerUV.times(thisBoneLength)
        );

        // Set the new start joint location for this bone to be new start location...
        thisBone.setStartLocation(newStartLocation);

        // ...and set the end joint location of the bone further in to also be at the new start location (if there IS a bone
        // further in - this may be a single bone chain)
        if (loop > 0) {
          this.getBone(loop - 1).setEndLocation(newStartLocation);
        }
      }
    } // End of forward pass

    // ---------- Backward pass from base to end effector -----------

    for (let loop = 0; loop < this.mChain.length; ++loop) {
      const thisBone = this.getBone(loop);
      const thisBoneLength = thisBone.length();

      // If we are not working on the basebone
      if (loop != 0) {
        // Get the inner-to-outer direction of this bone as well as the previous bone to use as a baseline
        let thisBoneInnerToOuterUV = thisBone.getDirectionUV();
        let prevBoneInnerToOuterUV = this.getBone(loop - 1).getDirectionUV();

        // Dealing with a ball joint?
        const thisBoneJoint = thisBone.getJoint();
        const jointType = thisBoneJoint.getJointType();
        if (jointType == JointType.BALL) {
          const angleBetweenDegs = Vec3.getAngleBetweenDegs(
            prevBoneInnerToOuterUV,
            thisBoneInnerToOuterUV
          );
          const constraintAngleDegs =
            thisBoneJoint.getBallJointConstraintDegs();

          // Keep this bone direction constrained within the rotor about the previous bone direction
          if (angleBetweenDegs > constraintAngleDegs) {
            thisBoneInnerToOuterUV = Vec3.getAngleLimitedUnitVectorDegs(
              thisBoneInnerToOuterUV,
              prevBoneInnerToOuterUV,
              constraintAngleDegs
            );
          }
        } else if (jointType == JointType.GLOBAL_HINGE) {
          // Get the hinge rotation axis and project our inner-to-outer UV onto it
          const hingeRotationAxis = thisBoneJoint.getHingeRotationAxis();
          thisBoneInnerToOuterUV =
            thisBoneInnerToOuterUV.projectOntoPlane(hingeRotationAxis);

          // If there are joint constraints, then we must honour them...
          const cwConstraintDegs =
            -thisBoneJoint.getHingeClockwiseConstraintDegs();
          const acwConstraintDegs =
            thisBoneJoint.getHingeAnticlockwiseConstraintDegs();
          if (
            !Utils.approximatelyEquals(
              cwConstraintDegs,
              -FabrikJoint3D.MAX_CONSTRAINT_ANGLE_DEGS,
              FabrikChain3D.DefaultApproximatelyEqualsTolerance
            ) &&
            !Utils.approximatelyEquals(
              acwConstraintDegs,
              FabrikJoint3D.MAX_CONSTRAINT_ANGLE_DEGS,
              FabrikChain3D.DefaultApproximatelyEqualsTolerance
            )
          ) {
            const hingeReferenceAxis = thisBoneJoint.getHingeReferenceAxis();

            // Get the signed angle (about the hinge rotation axis) between the hinge reference axis and the hinge-rotation aligned bone UV
            // Note: ACW rotation is positive, CW rotation is negative.
            const signedAngleDegs = Vec3.getSignedAngleBetweenDegs(
              hingeReferenceAxis,
              thisBoneInnerToOuterUV,
              hingeRotationAxis
            );

            // Make our bone inner-to-outer UV the hinge reference axis rotated by its maximum clockwise or anticlockwise rotation as required
            if (signedAngleDegs > acwConstraintDegs) {
              thisBoneInnerToOuterUV = Vec3.rotateAboutAxisDegs(
                hingeReferenceAxis,
                acwConstraintDegs,
                hingeRotationAxis
              ).normalised();
            } else if (signedAngleDegs < cwConstraintDegs) {
              thisBoneInnerToOuterUV = Vec3.rotateAboutAxisDegs(
                hingeReferenceAxis,
                cwConstraintDegs,
                hingeRotationAxis
              ).normalised();
            }
          }
        } else if (jointType == JointType.LOCAL_HINGE) {
          // Transform the hinge rotation axis to be relative to the previous bone in the chain
          const hingeRotationAxis = thisBoneJoint.getHingeRotationAxis();

          // Construct a rotation matrix based on the previous bone's direction
          const m = Mat3.createRotationMatrix(prevBoneInnerToOuterUV);

          // Transform the hinge rotation axis into the previous bone's frame of reference
          const relativeHingeRotationAxis = m
            .timesByVec3(hingeRotationAxis)
            .normalise();

          // Project this bone direction onto the plane described by the hinge rotation axis
          // Note: The returned vector is normalised.
          thisBoneInnerToOuterUV = thisBoneInnerToOuterUV.projectOntoPlane(
            relativeHingeRotationAxis
          );

          // Constrain rotation about reference axis if required
          const cwConstraintDegs =
            -thisBoneJoint.getHingeClockwiseConstraintDegs();
          const acwConstraintDegs =
            thisBoneJoint.getHingeAnticlockwiseConstraintDegs();
          if (
            !Utils.approximatelyEquals(
              cwConstraintDegs,
              -FabrikJoint3D.MAX_CONSTRAINT_ANGLE_DEGS,
              FabrikChain3D.DefaultApproximatelyEqualsTolerance
            ) &&
            !Utils.approximatelyEquals(
              acwConstraintDegs,
              FabrikJoint3D.MAX_CONSTRAINT_ANGLE_DEGS,
              FabrikChain3D.DefaultApproximatelyEqualsTolerance
            )
          ) {
            // Calc. the reference axis in local space
            const relativeHingeReferenceAxis = m
              .timesByVec3(thisBoneJoint.getHingeReferenceAxis())
              .normalise();

            // Get the signed angle (about the hinge rotation axis) between the hinge reference axis and the hinge-rotation aligned bone UV
            // Note: ACW rotation is positive, CW rotation is negative.
            const signedAngleDegs = Vec3.getSignedAngleBetweenDegs(
              relativeHingeReferenceAxis,
              thisBoneInnerToOuterUV,
              relativeHingeRotationAxis
            );

            // Make our bone inner-to-outer UV the hinge reference axis rotated by its maximum clockwise or anticlockwise rotation as required
            if (signedAngleDegs > acwConstraintDegs) {
              thisBoneInnerToOuterUV = Vec3.rotateAboutAxisDegs(
                relativeHingeReferenceAxis,
                acwConstraintDegs,
                relativeHingeRotationAxis
              ).normalise();
            } else if (signedAngleDegs < cwConstraintDegs) {
              thisBoneInnerToOuterUV = Vec3.rotateAboutAxisDegs(
                relativeHingeReferenceAxis,
                cwConstraintDegs,
                relativeHingeRotationAxis
              ).normalise();
            }
          }
        } // End of local hinge section

        // At this stage we have a outer-to-inner unit vector for this bone which is within our constraints,
        // so we can set the new inner joint location to be the end joint location of this bone plus the
        // outer-to-inner direction unit vector multiplied by the length of the bone.
        const newEndLocation = thisBone
          .getStartLocation()
          .plus(thisBoneInnerToOuterUV.times(thisBoneLength));

        // Set the new start joint location for this bone
        thisBone.setEndLocation(newEndLocation);

        // If we are not working on the end effector bone, then we set the start joint location of the next bone in
        // the chain (i.e. the bone closer to the target) to be the new end joint location of this bone.
        if (loop < this.mChain.length - 1) {
          this.getBone(loop + 1).setStartLocation(newEndLocation);
        }
      } // If we ARE working on the basebone...
      else {
        // If the base location is fixed then snap the start location of the basebone back to the fixed base...
        if (this.mFixedBaseMode) {
          thisBone.setStartLocation(this.mFixedBaseLocation);
        } // ...otherwise project it backwards from the end to the start by its length.
        else {
          thisBone.setStartLocation(
            thisBone
              .getEndLocation()
              .minus(thisBone.getDirectionUV().times(thisBoneLength))
          );
        }

        // If the basebone is unconstrained then process it as usual...
        if (this.mBaseboneConstraintType == BaseboneConstraintType3D.NONE) {
          // Set the new end location of this bone, and if there are more bones,
          // then set the start location of the next bone to be the end location of this bone
          const newEndLocation = thisBone
            .getStartLocation()
            .plus(thisBone.getDirectionUV().times(thisBoneLength));
          thisBone.setEndLocation(newEndLocation);

          if (this.mChain.length > 1) {
            this.getBone(1).setStartLocation(newEndLocation);
          }
        } // ...otherwise we must constrain it to the basebone constraint unit vector
        else {
          if (
            this.mBaseboneConstraintType ==
            BaseboneConstraintType3D.GLOBAL_ROTOR
          ) {
            // Get the inner-to-outer direction of this bone
            let thisBoneInnerToOuterUV = thisBone.getDirectionUV();

            const angleBetweenDegs = Vec3.getAngleBetweenDegs(
              this.mBaseboneConstraintUV,
              thisBoneInnerToOuterUV
            );
            const constraintAngleDegs = thisBone.getBallJointConstraintDegs();

            if (angleBetweenDegs > constraintAngleDegs) {
              thisBoneInnerToOuterUV = Vec3.getAngleLimitedUnitVectorDegs(
                thisBoneInnerToOuterUV,
                this.mBaseboneConstraintUV,
                constraintAngleDegs
              );
            }

            const newEndLocation = thisBone
              .getStartLocation()
              .plus(thisBoneInnerToOuterUV.times(thisBoneLength));

            thisBone.setEndLocation(newEndLocation);

            // Also, set the start location of the next bone to be the end location of this bone
            if (this.mChain.length > 1) {
              this.getBone(1).setStartLocation(newEndLocation);
            }
          } else if (
            this.mBaseboneConstraintType == BaseboneConstraintType3D.LOCAL_ROTOR
          ) {
            // Note: The mBaseboneRelativeConstraintUV is updated in the FabrikStructure3D.solveForTarget()
            // method BEFORE this FabrikChain3D.solveForTarget() method is called. We no knowledge of the
            // direction of the bone we're connected to in another chain and so cannot calculate this
            // relative basebone constraint direction on our own, but the FabrikStructure3D does it for
            // us so we are now free to use it here.

            // Get the inner-to-outer direction of this bone
            let thisBoneInnerToOuterUV = thisBone.getDirectionUV();

            // Constrain about the relative basebone constraint unit vector as neccessary
            const angleBetweenDegs = Vec3.getAngleBetweenDegs(
              this.mBaseboneRelativeConstraintUV,
              thisBoneInnerToOuterUV
            );
            const constraintAngleDegs = thisBone.getBallJointConstraintDegs();
            if (angleBetweenDegs > constraintAngleDegs) {
              thisBoneInnerToOuterUV = Vec3.getAngleLimitedUnitVectorDegs(
                thisBoneInnerToOuterUV,
                this.mBaseboneRelativeConstraintUV,
                constraintAngleDegs
              );
            }

            // Set the end location
            const newEndLocation = thisBone
              .getStartLocation()
              .plus(thisBoneInnerToOuterUV.times(thisBoneLength));
            thisBone.setEndLocation(newEndLocation);

            // Also, set the start location of the next bone to be the end location of this bone
            if (this.mChain.length > 1) {
              this.getBone(1).setStartLocation(newEndLocation);
            }
          } else if (
            this.mBaseboneConstraintType ==
            BaseboneConstraintType3D.GLOBAL_HINGE
          ) {
            const thisJoint = thisBone.getJoint();
            const hingeRotationAxis = thisJoint.getHingeRotationAxis();
            const cwConstraintDegs =
              -thisJoint.getHingeClockwiseConstraintDegs(); // Clockwise rotation is negative!
            const acwConstraintDegs =
              thisJoint.getHingeAnticlockwiseConstraintDegs();

            // Get the inner-to-outer direction of this bone and project it onto the global hinge rotation axis
            let thisBoneInnerToOuterUV = thisBone
              .getDirectionUV()
              .projectOntoPlane(hingeRotationAxis);

            // If we have a global hinge which is not freely rotating then we must constrain about the reference axis
            if (
              !(
                Utils.approximatelyEquals(
                  cwConstraintDegs,
                  -FabrikJoint3D.MAX_CONSTRAINT_ANGLE_DEGS,
                  0.01
                ) &&
                Utils.approximatelyEquals(
                  acwConstraintDegs,
                  FabrikJoint3D.MAX_CONSTRAINT_ANGLE_DEGS,
                  0.01
                )
              )
            ) {
              // Grab the hinge reference axis and calculate the current signed angle between it and our bone direction (about the hinge
              // rotation axis). Note: ACW rotation is positive, CW rotation is negative.
              const hingeReferenceAxis = thisJoint.getHingeReferenceAxis();
              const signedAngleDegs = Vec3.getSignedAngleBetweenDegs(
                hingeReferenceAxis,
                thisBoneInnerToOuterUV,
                hingeRotationAxis
              );

              // Constrain as necessary
              if (signedAngleDegs > acwConstraintDegs) {
                thisBoneInnerToOuterUV = Vec3.rotateAboutAxisDegs(
                  hingeReferenceAxis,
                  acwConstraintDegs,
                  hingeRotationAxis
                ).normalise();
              } else if (signedAngleDegs < cwConstraintDegs) {
                thisBoneInnerToOuterUV = Vec3.rotateAboutAxisDegs(
                  hingeReferenceAxis,
                  cwConstraintDegs,
                  hingeRotationAxis
                ).normalise();
              }
            }

            // Calc and set the end location of this bone
            const newEndLocation = thisBone
              .getStartLocation()
              .plus(thisBoneInnerToOuterUV.times(thisBoneLength));
            thisBone.setEndLocation(newEndLocation);

            // Also, set the start location of the next bone to be the end location of this bone
            if (this.mChain.length > 1) {
              this.getBone(1).setStartLocation(newEndLocation);
            }
          } else if (
            this.mBaseboneConstraintType == BaseboneConstraintType3D.LOCAL_HINGE
          ) {
            const thisJoint = thisBone.getJoint();
            const hingeRotationAxis = this.mBaseboneRelativeConstraintUV; // Basebone relative constraint is our hinge rotation axis!
            const cwConstraintDegs =
              -thisJoint.getHingeClockwiseConstraintDegs(); // Clockwise rotation is negative!
            const acwConstraintDegs =
              thisJoint.getHingeAnticlockwiseConstraintDegs();

            // Get the inner-to-outer direction of this bone and project it onto the global hinge rotation axis
            let thisBoneInnerToOuterUV = thisBone
              .getDirectionUV()
              .projectOntoPlane(hingeRotationAxis);

            // If we have a local hinge which is not freely rotating then we must constrain about the reference axis
            if (
              !(
                Utils.approximatelyEquals(
                  cwConstraintDegs,
                  -FabrikJoint3D.MAX_CONSTRAINT_ANGLE_DEGS,
                  0.01
                ) &&
                Utils.approximatelyEquals(
                  acwConstraintDegs,
                  FabrikJoint3D.MAX_CONSTRAINT_ANGLE_DEGS,
                  0.01
                )
              )
            ) {
              // Grab the hinge reference axis and calculate the current signed angle between it and our bone direction (about the hinge
              // rotation axis). Note: ACW rotation is positive, CW rotation is negative.
              const hingeReferenceAxis =
                this.mBaseboneRelativeReferenceConstraintUV;
              const signedAngleDegs = Vec3.getSignedAngleBetweenDegs(
                hingeReferenceAxis,
                thisBoneInnerToOuterUV,
                hingeRotationAxis
              );

              // Constrain as necessary
              if (signedAngleDegs > acwConstraintDegs) {
                thisBoneInnerToOuterUV = Vec3.rotateAboutAxisDegs(
                  hingeReferenceAxis,
                  acwConstraintDegs,
                  hingeRotationAxis
                ).normalise();
              } else if (signedAngleDegs < cwConstraintDegs) {
                thisBoneInnerToOuterUV = Vec3.rotateAboutAxisDegs(
                  hingeReferenceAxis,
                  cwConstraintDegs,
                  hingeRotationAxis
                ).normalise();
              }
            }

            // Calc and set the end location of this bone
            const newEndLocation = thisBone
              .getStartLocation()
              .plus(thisBoneInnerToOuterUV.times(thisBoneLength));
            thisBone.setEndLocation(newEndLocation);

            // Also, set the start location of the next bone to be the end location of this bone
            if (this.mChain.length > 1) {
              this.getBone(1).setStartLocation(newEndLocation);
            }
          }
        } // End of basebone constraint handling section
      } // End of basebone handling section
    } // End of backward-pass loop over all bones

    // Update our last target location
    this.mLastTargetLocation.set(target);

    // DEBUG - check the live chain length and the originally calculated chain length are the same
    /*
		if (Math.abs( this.getLiveChainLength() - mChainLength) > 0.01f)
		{
			System.out.println("Chain length off by > 0.01f");
		}
		*/

    // Finally, calculate and return the distance between the current effector location and the target.
    return Vec3.distanceBetween(this.lastBoneEndLocation(), target);
  }

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
  // @Override
  public updateChainLength(): void {
    // We start adding up the length of the bones from an initial length of zero
    this.mChainLength = 0.0;

    // Loop over all the bones in the chain, adding the length of each bone to the mChainLength property
    this.mChain.forEach(aBone => {
      this.mChainLength += aBone.length();
    });
  }

  /**
   * Update the embedded target for this chain.
   *
   * The internal mEmbeddedTarget object is updated with the location of the provided parameter.
   * If the chain is not in useEmbeddedTarget mode then a RuntimeException is thrown.
   * Embedded target mode can be enabled by calling setEmbeddedTargetMode(true) on the chain.
   *
   * @param newEmbeddedTarget	The location of the embedded target.
   */
  // @Override
  public updateEmbeddedTarget(newEmbeddedTarget: Vec3): void {
    // Using embedded target mode? Overwrite embedded target with provided location
    if (this.mUseEmbeddedTarget) {
      this.mEmbeddedTarget.set(newEmbeddedTarget);
    } else {
      throw new Error(
        'This chain does not have embedded targets enabled - enable with setEmbeddedTargetMode(true).'
      );
    }
  }

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
  // public updateEmbeddedTarget( x:number, y:number, z:number):void
  // {
  // 	// Using embedded target mode? Overwrite embedded target with provided location
  // 	if (mUseEmbeddedTarget) {
  // 	  mEmbeddedTarget.set( new Vec3f(x, y, z) );
  // 	}
  // 	else {
  // 	  throw new RuntimeException("This chain does not have embedded targets enabled - enable with setEmbeddedTargetMode(true).");
  // 	}
  // }

  /**
   * Clone and return the IK Chain of this FabrikChain3D, that is, the list of FabrikBone3D objects.
   *
   * @return	A cloned List%lt;FabrikBone3D%gt;
   */
  private cloneIkChain(): Array<FabrikBone3D> {
    // How many bones are in this chain?
    const numBones = this.mChain.length;

    // Create a new Vector of FabrikBone3D objects of that size
    const clonedChain = new Array<FabrikBone3D>();

    // For each bone in the chain being cloned...
    this.mChain.forEach(aBone => {
      clonedChain.push(FabrikBone3D.NewByFabrikBone3D(aBone));
    });

    return clonedChain;
  }

  /**
   * {@inheritDoc}
   */
  // @Override
  public getMaxIterationAttempts(): number {
    return this.mMaxIterationAttempts;
  }

  /**
   * {@inheritDoc}
   */
  // @Override
  public getMinIterationChange(): number {
    return this.mMinIterationChange;
  }

  /**
   * {@inheritDoc}
   */
  // @Override
  public getSolveDistanceThreshold(): number {
    return this.mSolveDistanceThreshold;
  }

  //   @Override
  //   public int hashCode() {
  //     final int prime = 31;
  //     int result = 1;
  //     result = prime * result + ((mBaseboneConstraintType == null) ? 0 : mBaseboneConstraintType.hashCode());
  //     result = prime * result + ((mBaseboneConstraintUV == null) ? 0 : mBaseboneConstraintUV.hashCode());
  //     result = prime * result + ((mBaseboneRelativeConstraintUV == null) ? 0 : mBaseboneRelativeConstraintUV.hashCode());
  //     result = prime * result
  //         + ((mBaseboneRelativeReferenceConstraintUV == null) ? 0 : mBaseboneRelativeReferenceConstraintUV.hashCode());
  //     result = prime * result + ((mChain == null) ? 0 : mChain.hashCode());
  //     result = prime * result + Float.floatToIntBits(mChainLength);
  //     result = prime * result + mConnectedBoneNumber;
  //     result = prime * result + mConnectedChainNumber;
  //     result = prime * result + Float.floatToIntBits(mConstraintLineWidth);
  //     result = prime * result + Float.floatToIntBits(mCurrentSolveDistance);
  //     result = prime * result + ((mEmbeddedTarget == null) ? 0 : mEmbeddedTarget.hashCode());
  //     result = prime * result + ((mFixedBaseLocation == null) ? 0 : mFixedBaseLocation.hashCode());
  //     result = prime * result + (mFixedBaseMode ? 1231 : 1237);
  //     result = prime * result + ((mLastBaseLocation == null) ? 0 : mLastBaseLocation.hashCode());
  //     result = prime * result + ((mLastTargetLocation == null) ? 0 : mLastTargetLocation.hashCode());
  //     result = prime * result + mMaxIterationAttempts;
  //     result = prime * result + Float.floatToIntBits(mMinIterationChange);
  //     result = prime * result + ((mName == null) ? 0 : mName.hashCode());
  //     result = prime * result + Float.floatToIntBits(mSolveDistanceThreshold);
  //     result = prime * result + (mUseEmbeddedTarget ? 1231 : 1237);
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

    const other = obj as FabrikChain3D;
    if (this.mBaseboneConstraintType != other.mBaseboneConstraintType) {
      return false;
    }
    if (this.mBaseboneConstraintUV == null) {
      if (other.mBaseboneConstraintUV != null) {
        return false;
      }
    } else if (
      !this.mBaseboneConstraintUV.equals(other.mBaseboneConstraintUV)
    ) {
      return false;
    }
    if (this.mBaseboneRelativeConstraintUV == null) {
      if (other.mBaseboneRelativeConstraintUV != null) {
        return false;
      }
    } else if (
      !this.mBaseboneRelativeConstraintUV.equals(
        other.mBaseboneRelativeConstraintUV
      )
    ) {
      return false;
    }
    if (this.mBaseboneRelativeReferenceConstraintUV == null) {
      if (other.mBaseboneRelativeReferenceConstraintUV != null) {
        return false;
      }
    } else if (
      !this.mBaseboneRelativeReferenceConstraintUV.equals(
        other.mBaseboneRelativeReferenceConstraintUV
      )
    ) {
      return false;
    }
    if (this.mChain == null) {
      if (other.mChain != null) {
        return false;
      }
    } else if (this.mChain != other.mChain) {
      return false;
    }
    if (this.mChainLength != other.mChainLength) {
      return false;
    }
    if (this.mConnectedBoneNumber != other.mConnectedBoneNumber) {
      return false;
    }
    if (this.mConnectedChainNumber != other.mConnectedChainNumber) {
      return false;
    }
    if (this.mConstraintLineWidth != other.mConstraintLineWidth) {
      return false;
    }
    if (this.mCurrentSolveDistance != other.mCurrentSolveDistance) {
      return false;
    }
    if (this.mEmbeddedTarget == null) {
      if (other.mEmbeddedTarget != null) {
        return false;
      }
    } else if (this.mEmbeddedTarget != other.mEmbeddedTarget) {
      return false;
    }
    if (this.mFixedBaseLocation == null) {
      if (other.mFixedBaseLocation != null) {
        return false;
      }
    } else if (this.mFixedBaseLocation != other.mFixedBaseLocation) {
      return false;
    }
    if (this.mFixedBaseMode != other.mFixedBaseMode) {
      return false;
    }
    if (this.mLastBaseLocation == null) {
      if (other.mLastBaseLocation != null) {
        return false;
      }
    } else if (this.mLastBaseLocation != other.mLastBaseLocation) {
      return false;
    }
    if (this.mLastTargetLocation == null) {
      if (other.mLastTargetLocation != null) {
        return false;
      }
    } else if (this.mLastTargetLocation != other.mLastTargetLocation) {
      return false;
    }
    if (this.mMaxIterationAttempts != other.mMaxIterationAttempts) {
      return false;
    }
    if (this.mMinIterationChange != other.mMinIterationChange) {
      return false;
    }
    if (this.mName == null) {
      if (other.mName != null) {
        return false;
      }
    } else if (this.mName != other.mName) {
      return false;
    }
    if (this.mSolveDistanceThreshold != other.mSolveDistanceThreshold) {
      return false;
    }
    if (this.mUseEmbeddedTarget != other.mUseEmbeddedTarget) {
      return false;
    }
    return true;
  }
}
