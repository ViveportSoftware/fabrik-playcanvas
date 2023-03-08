/**
 * A class to represent a FabrikBone3D object.
 * <p>
 * A FabrikBone3D consists of a start location, an end location and a FabrikJoint3D which can constrain
 * the rotation of the bone with regard to a previous bone in an IK chain either as a ball joint or as
 * a hinge joint constrained about a local or global axis.
 *
 * @version 0.3.3 - 19/06/2019
 * @see FabrikJoint3D
 */

import {Color} from '../utils/Color';
import {Utils} from '../utils/Utils';
import {Vec3} from '../utils/Vec3';
import {BoneConnectionPoint} from './BoneConnectionPoint';
import {FabrikBone} from './FabrikBone';
import {FabrikJoint3D, JointType} from './FabrikJoint3D';

export class FabrikBone3D implements FabrikBone<Vec3, FabrikJoint3D> {
  /** The minimum valid line width with which to draw a bone as a line is 1.0f pixels wide. */
  private static MIN_LINE_WIDTH = 1.0;

  /** The maximum valid line width with which to draw a bone as a line is 64.0f pixels wide. */
  private static MAX_LINE_WIDTH = 64.0;

  /**
   * If this chain is connected to a bone in another chain, should this chain connect to the start or the end of that bone?
   * <p>
   * The default is to connect to the end of the specified bone.
   * <p>
   * This property can be set via the {#link #setBoneConnectionPoint(BoneConnectionPoint)} method, or when attaching this chain
   * to another chain via the {@link au.edu.federation.caliko.FabrikStructure3D#connectChain(FabrikChain3D, int, int, BoneConnectionPoint)} method.
   */
  private mBoneConnectionPoint = BoneConnectionPoint.END;

  /**
   * mJoint	The joint attached to this FabrikBone3D.
   * <p>
   * Each bone has a single FabrikJoint3D which controls the angle to which the bone is
   * constrained with regard to the previous (i.e. earlier / closer to the base) bone in its chain.
   * <p>
   * By default, a joint is not constrained (that is, it is free to rotate up to 180
   * degrees in a clockwise or anticlockwise direction), however a joint may be
   * constrained by specifying constraint angles via the
   * {@link #setBallJointConstraintDegs(float)}, {@link #setHingeJointClockwiseConstraintDegs(float)},
   * and {@link #setHingeJointAnticlockwiseConstraintDegs(float)} methods.
   * <p>
   * You might think that surely a bone has two joints, one at the beginning and one at
   * the end - however, consider an empty chain to which you add a single bone: It has
   * a joint at its start, around which the bone may rotate (and which it may optionally
   * be constrained).
   * <p>
   * When a second bone is added to the chain, the joint at the start of this second bone
   * controls the rotational constraints with regard to the first ('base') bone, and so on.
   * <p>
   * During the forward (tip-to-base) pass of the FABRIK algorithm, the end effector is
   * unconstrained and snapped to the target. As we then work from tip-to-base each
   * previous bone is constrained by the joint in the outer bone until we reach the base,
   * at which point, if we have a fixed base location, then we snap the base bone start
   * location to it, or if we do not have a fixed base location we project the new start
   * location along the reverse direction of the bone by its length.
   * <p>
   * During the backward (base-to-tip) pass, each bone is constrained by the joint angles
   * relative to the bone before it, ensuring that all constraints are enforced.
   */
  private mJoint = new FabrikJoint3D();

  /**
   * mStartLocation	The start location of this FabrikBone3D object.
   * <p>
   * The start location of a bone may only be set through a constructor or via an 'addBone'
   * method provided by the {@link FabrikChain3D} class.
   */
  private mStartLocation = new Vec3();

  /**
   * mEndLocation	The end location of this FabrikBone3D object.
   * <p>
   * The end location of a bone may only be set through a constructor or indirectly via an
   * 'addBone' method provided by the {@link FabrikChain3D} class.
   */
  private mEndLocation = new Vec3();

  /**
   * mName	The name of this FabrikBone3D object.
   * <p>
   * It is not necessary to use this property, but it is provided to allow for easy identification
   * of a bone, such as when used in a map such as {@code Map<String, FabrikBone3D>}.
   * <p>
   * The maximum allowable length of the name String is 100 characters - names exceeding this length
   * will be truncated.
   *
   * @see #setName(String)
   * @see #FabrikBone3D(Vec3f, Vec3f, String)
   * @see #FabrikBone3D(Vec3f, Vec3f, float, String)
   */
  private mName: string = '';

  /**
   * The length of this bone from its start location to its end location. This is is calculated
   * in the constructor and remains constant for the lifetime of the object.
   */
  private mLength: number = 0;

  /**
   * The color used to draw the bone as specified by a {@link Color4f au.edu.federation.utils.Color4f.class} object.
   * <p>
   * The default color to draw a bone is white at full opacity i.e. Color4f(1.0f, 1.0f, 1.0f, 1.0f).
   */
  private mColor = new Color();

  /**
   * The width of the line drawn to represent this bone, specified in pixels.
   * <p>
   * The default line width is 1.0f, which is the only value guaranteed to render correctly for
   * any given hardware/driver combination. The maximum line width that can be drawn depends on
   * the graphics hardware and drivers on the host machine, but is typically up to 64.0f (pixels)
   * on modern hardware.
   *
   * The default value is 1.0f.
   *
   * @see		#setLineWidth(float)
   * @see		<a href="https://www.opengl.org/sdk/docs/man3/xhtml/glLineWidth.xml">glLineWidth(float)</a>
   */
  private mLineWidth = 1.0;

  // ---------- Constructors ----------

  /**
   * Default constructor */
  // FabrikBone3D() { }

  /**
   * Create a new FabrikBone3D from a start and end location as provided by a pair of Vec3fs.
   * <p>
   * The {@link #mLength} property is calculated and set from the provided locations. All other properties
   * are set to their default values.
   * <p>
   * Instantiating a FabrikBone3D with the exact same start and end location, and hence a length of zero,
   * will result in an IllegalArgumentException being thrown.
   *
   * @param	startLocation	The start location of this bone.
   * @param	endLocation		The end location of this bone.
   */
  constructor(
    startLocation: Vec3 | undefined = undefined,
    endLocation: Vec3 | undefined = undefined,
    color: Color | undefined = undefined
  ) {
    if (startLocation && endLocation) {
      this.mStartLocation.set(startLocation);
      this.mEndLocation.set(endLocation);

      // Set the length of the bone - if the length is not a positive value then an InvalidArgumentException is thrown
      this.setLength(Vec3.distanceBetween(startLocation, endLocation));
      if (!color) {
        color = new Color(0.5, 0.5, 0.5);
      }
      this.setColor(color);
    }
  }

  /**
   * Create a new FabrikBone3D from a start and end location and a String.
   * <p>
   * This constructor is merely for convenience if you intend on working with named bones, and internally
   * calls the {@link #FabrikBone3D(Vec3f, Vec3f)} constructor.
   *
   * @param	startLocation	The start location of this bone.
   * @param	endLocation		The end location of this bone.
   * @param	name			The name of this bone.
   */
  // public FabrikBone3D(Vec3f startLocation, Vec3f endLocation, String name)
  // {
  // 	// Call the start/end location constructor - which also sets the length of the bone
  // 	this(startLocation, endLocation);
  // 	setName(name);
  // }
  public static NewByStartEndName(
    startLocation: Vec3,
    endLocation: Vec3,
    name: string
  ): FabrikBone3D {
    const b = new FabrikBone3D(startLocation, endLocation);
    b.setName(name);
    return b;
  }

  /**
   * Create a new FabrikBone3D from a start location, a direction unit vector and a length.
   * <p>
   * The end location of the bone is calculated as the start location plus the direction unit
   * vector multiplied by the length (which must be a positive value). All other properties
   * are set to their default values.	 *
   * <p>
   * If this constructor is provided with a direction unit vector of magnitude zero, or with a
   * length less than or equal to zero then an {@link IllegalArgumentException} is thrown.
   *
   * @param	startLocation	The start location of this bone.
   * @param	directionUV		The direction unit vector of this bone.
   * @param	length			The length of this bone.
   */
  // public FabrikBone3D(Vec3f startLocation, Vec3f directionUV, float length)
  // {
  // 	// Sanity checking
  // 	setLength(length); // Throws IAE if < zero
  // 	if ( directionUV.length() <= 0.0f ) {
  // 	  throw new IllegalArgumentException("Direction cannot be a zero vector");
  // 	}

  // 	// Set the length, start and end locations
  // 	setLength(length);
  // 	mStartLocation.set(startLocation);
  // 	mEndLocation.set( mStartLocation.plus( directionUV.normalised().times(length) ) );
  // }
  public static NewByStartDirectionLength(
    startLocation: Vec3,
    directionUV: Vec3,
    length: number
  ): FabrikBone3D {
    // Throws IAE if < zero
    if (directionUV.length() <= 0.0) {
      throw new Error('Direction cannot be a zero vector');
    }

    const b = new FabrikBone3D();
    b.setLength(length);
    b.setStartLocation(startLocation);
    b.setEndLocation(
      startLocation.plus(directionUV.normalised().times(length))
    );
    return b;
  }

  /**
   * Create a named FabrikBone3D from a start location, a direction unit vector, a bone length and a name.
   * <p>
   * This constructor is merely for convenience if you intend on working with named bones, and internally
   * calls the {@link #FabrikBone3D(Vec3f, Vec3f, float)} constructor.
   * <p>
   * If the provided length argument is zero or if the direction is a zero vector then an IllegalArgumentException is thrown.
   *
   * @param	startLocation	The start location of this bone.
   * @param	directionUV		The direction unit vector of this bone.
   * @param	length			The length of this bone.
   * @param	name			The name of this bone.
   */
  // public FabrikBone3D(Vec3f startLocation, Vec3f directionUV, float length, String name)
  // {
  // 	this(startLocation, directionUV, length);
  // 	setName(name);
  // }
  public static NewByStartDirectionLengthName(
    startLocation: Vec3,
    directionUV: Vec3,
    length: number,
    name: string
  ): FabrikBone3D {
    const b = FabrikBone3D.NewByStartDirectionLength(
      startLocation,
      directionUV,
      length
    );
    b.setName(name);
    return b;
  }

  /**
   * Create a new FabrikBone3D from a start location, a direction unit vector, a bone length and a color.
   * <p>
   * This constructor is merely for convenience if you intend on working with named bones, and internally
   * calls the {@link #FabrikBone3D(Vec3f, Vec3f, float)} constructor.
   *
   * @param	startLocation	The start location of this bone.
   * @param	directionUV		The direction unit vector of this bone.
   * @param	length			The length of this bone.
   * @param	color			The color to draw this bone.
   */
  // public FabrikBone3D(Vec3f startLocation, Vec3f directionUV, float length, Color4f color)
  // {
  // 	this(startLocation, directionUV, length);
  // 	setColor(color);
  // }
  public static NewByStartDirectionLengthColor(
    startLocation: Vec3,
    directionUV: Vec3,
    length: number,
    color: Color
  ): FabrikBone3D {
    const b = FabrikBone3D.NewByStartDirectionLength(
      startLocation,
      directionUV,
      length
    );
    b.setColor(color);
    return b;
  }

  /**
   * Copy constructor.
   * <p>
   * Takes a source FabrikBone3D object and copies all properties into the new FabrikBone3D by value.
   * Once this is done, there are no shared references between the source and the new object, and they are
   * exact copies of each other.
   *
   * @param	source	The bone to use as the basis for this new bone.
   */
  // public FabrikBone3D(FabrikBone3D source)
  // {
  // 	// Set all Vec3f properties by value via their set method
  // 	mStartLocation.set(source.mStartLocation);
  // 	mEndLocation.set(source.mEndLocation);
  // 	mJoint.set(source.mJoint);
  // 	mColor.set(source.mColor);

  // 	// Set the remaining properties by value via simple assignment
  // 	mName                = source.mName;
  // 	mLength              = source.mLength;
  // 	mLineWidth           = source.mLineWidth;
  // 	mBoneConnectionPoint = source.mBoneConnectionPoint;
  // }
  public static NewByFabrikBone3D(source: FabrikBone3D): FabrikBone3D {
    const b = new FabrikBone3D();
    // Set all Vec3f properties by value via their set method
    b.mStartLocation.set(source.mStartLocation);
    b.mEndLocation.set(source.mEndLocation);
    b.mJoint.set(source.mJoint);
    b.mColor.set(source.mColor);

    // Set the remaining properties by value via simple assignment
    b.mName = source.mName;
    b.mLength = source.mLength;
    b.mLineWidth = source.mLineWidth;
    b.mBoneConnectionPoint = source.mBoneConnectionPoint;

    return b;
  }

  // ---------- Methods ----------

  /**
   * {@inheritDoc}
   */
  // @Override
  public length(): number {
    return this.mLength;
  }

  /**
   * Return the live (i.e. live calculated) length of this bone from its current start and end locations.
   *
   * @return	The 'live' calculated distance between the start and end locations of this bone.
   */
  public liveLength(): number {
    return Vec3.distanceBetween(this.mStartLocation, this.mEndLocation);
  }

  /**
   * Specify the bone connection point of this bone.
   * <p>
   * This connection point property controls whether, when THIS bone connects to another bone in another chain, it does so at
   * the start or the end of the bone we connect to.
   * <p>
   * The default is BoneConnectionPoint3D.END.
   *
   * @param	bcp	The bone connection point to use (BoneConnectionPoint3.START or BoneConnectionPoint.END).
   *
   */
  public setBoneConnectionPoint(bcp: BoneConnectionPoint): void {
    this.mBoneConnectionPoint = bcp;
  }

  /**
   * Return the bone connection point for THIS bone, which will be either BoneConnectionPoint.START or BoneConnectionPoint.END.
   * <p>
   * This connection point property controls whether, when THIS bone connects to another bone in another chain, it does so at
   * the start or the end of the bone we connect to.
   *
   * @return	The bone connection point for this bone.
   */
  public getBoneConnectionPoint(): BoneConnectionPoint {
    return this.mBoneConnectionPoint;
  }

  /**
   * Return the color of this bone.
   *
   * @return	The color to draw this bone, as stored in the mColor property.
   */
  public getColor(): Color {
    return this.mColor;
  }

  /**
   * Set the color used to draw this bone.
   *
   * @param	color	The color (used to draw this bone) to set on the mColor property.
   */
  public setColor(color: Color): void {
    this.mColor.set(color);
  }

  /**
   * Return the line width in pixels used to draw this bone.
   *
   * @return	The line width in pixels used to draw this bone.
   */
  public getLineWidth(): number {
    return this.mLineWidth;
  }

  /**
   * {@inheritDoc}
   */
  // @Override
  public getStartLocation(): Vec3 {
    return this.mStartLocation;
  }

  /**
   * Return the start location of this bone as an array of three floats.
   *
   * @return	The start location of this bone as an array of three floats.
   */
  public getStartLocationAsArray(): number[] {
    return [
      this.mStartLocation.x,
      this.mStartLocation.y,
      this.mStartLocation.z,
    ];
  }

  /**
   * {@inheritDoc}
   */
  // @Override
  public getEndLocation(): Vec3 {
    return this.mEndLocation;
  }

  /**
   * Return the end location of this bone as an array of three floats.
   *
   * @return	The end location of this bone as an array of three floats.
   */
  public getEndLocationAsArray(): number[] {
    return [this.mEndLocation.x, this.mEndLocation.y, this.mEndLocation.z];
  }

  /**
   * Set the FabrikJoint3D of this bone to match the properties of the provided FabrikJoint3D argument.
   *
   * @param	joint	The joint to use as the source for all joint properties on this bone.
   */
  public setJoint(joint: FabrikJoint3D): void {
    this.mJoint.set(joint);
  }

  /**
   * {@inheritDoc}
   */
  // @Override
  public getJoint(): FabrikJoint3D {
    return this.mJoint;
  }

  /**
   * Return the type of FabrikJoint3D.JointType associated with this bone.
   *
   * @return	The type of FabrikJoint3D.JointType associated with this bone.
   */
  public getJointType(): JointType {
    return this.mJoint.getJointType();
  }

  /**
   * Set the clockwise constraint angle of this bone's joint in degrees (0.0f to 180.0f inclusive).
   * <p>
   * If a constraint angle outside of this range is provided, then an IllegalArgumentException is
   * thrown.
   *
   * @param  angleDegs  The relative clockwise constraint angle specified in degrees.
   */
  public setHingeJointClockwiseConstraintDegs(angleDegs: number): void {
    this.mJoint.setHingeJointClockwiseConstraintDegs(angleDegs);
  }

  /**
   * Return the clockwise constraint angle of this bone's hinge joint in degrees.
   *
   * @return	 The clockwise constraint angle of this bone's hinge joint in degrees.
   */
  public getHingeJointClockwiseConstraintDegs(): number {
    return this.mJoint.getHingeClockwiseConstraintDegs();
  }

  /**
   * Set the anticlockwise constraint angle of this bone's joint in degrees (0.0f to 180.0f inclusive).
   * <p>
   * If a constraint angle outside of this range is provided, then an {@link IllegalArgumentException}
   * is thrown.
   *
   * @param  angleDegs  The relative anticlockwise constraint angle specified in degrees.
   */
  public setHingeJointAnticlockwiseConstraintDegs(angleDegs: number): void {
    this.mJoint.setHingeJointAnticlockwiseConstraintDegs(angleDegs);
  }

  /**
   * Return the anticlockwise constraint angle of this bone's hinge joint in degrees.
   *
   * @return	 The anticlockwise constraint angle of this bone's hinge joint in degrees.
   */
  public getHingeJointAnticlockwiseConstraintDegs(): number {
    return this.mJoint.getHingeAnticlockwiseConstraintDegs();
  }

  /**
   * Set the rotor constraint angle of this bone's joint in degrees (0.0f to 180.0f inclusive).
   * <p>
   * If a constraint angle outside of this range is provided, then an {@link IllegalArgumentException}
   * is thrown.
   *
   * @param  angleDegs  The angle in degrees relative to the previous bone which this bone is constrained to.
   */
  public setBallJointConstraintDegs(angleDegs: number): void {
    if (angleDegs < 0.0 || angleDegs > 180.0) {
      throw new Error(
        'Rotor constraints for ball joints must be in the range 0.0f to 180.0f degrees inclusive.'
      );
    }

    this.mJoint.setBallJointConstraintDegs(angleDegs);
  }

  /**
   * Return the anticlockwise constraint angle of this bone's joint in degrees.
   *
   * @return	The anticlockwise constraint angle of this bone's joint in degrees.
   */
  public getBallJointConstraintDegs(): number {
    return this.mJoint.getBallJointConstraintDegs();
  }

  /**
   * Get the direction unit vector between the start location and end location of this bone.
   * <p>
   * If the opposite (i.e. end to start) location is required then you can simply negate the provided direction.
   *
   * @return  The direction unit vector of this bone.
   * @see		Vec3f#negate()
   * @see		Vec3f#negated()
   */
  public getDirectionUV(): Vec3 {
    return Vec3.getDirectionUV(this.mStartLocation, this.mEndLocation);
  }

  /**
   * Get the global pitch of this bone with regard to the X-Axis. Pitch returned is in the range -179.9f to 180.0f.
   *
   * @return  The global pitch of this bone in degrees.
   */
  public getGlobalPitchDegs(): number {
    return Vec3.getDirectionUV(
      this.mStartLocation,
      this.mEndLocation
    ).getGlobalPitchDegs();
  }

  /**
   * Get the global yaw of this bone with regard to the Y-Axis. Yaw returned is in the range -179.9f to 180.0f.
   *
   * @return  The global yaw of this bone in degrees.
   */
  public getGlobalYawDegs(): number {
    return Vec3.getDirectionUV(
      this.mStartLocation,
      this.mEndLocation
    ).getGlobalYawDegs();
  }

  /**
   * Set the line width with which to draw this bone.
   * <p>
   * If the provided parameter is outside the valid range of 1.0f to 64.0f inclusive then an
   * IllegalArgumentException is thrown.
   *
   * @param	lineWidth	The value to set on the mLineWidth property.
   */
  public setLineWidth(lineWidth: number): void {
    // If the specified argument is within the valid range then set it...
    if (
      lineWidth >= FabrikBone3D.MIN_LINE_WIDTH &&
      lineWidth <= FabrikBone3D.MAX_LINE_WIDTH
    ) {
      this.mLineWidth = lineWidth;
    } // ...otherwise throw an IllegalArgumentException.
    else {
      throw new Error(
        'Line width must be between ' +
          FabrikBone3D.MIN_LINE_WIDTH +
          ' and ' +
          FabrikBone3D.MAX_LINE_WIDTH +
          ' inclusive.'
      );
    }
  }

  /**
   * Set the name of this bone, capped to 100 characters if required.
   *
   * @param	name	The name to set.
   */
  public setName(name: string): void {
    this.mName = Utils.getValidatedName(name);
  }

  /**
   * Get the name of this bone.
   * <p>
   * If the bone has not been specifically named through a constructor or by using the {@link #setName(String)} method,
   * then the name will be the default of "UnnamedFabrikBone3D".
   * @return String
   */
  public getName(): string {
    return this.mName;
  }

  /**
   * Return a concise, human readable description of this FabrikBone3D as a String.
   */
  // @Override
  public toString(): string {
    return (
      `Start joint location : ${this.mStartLocation}\r\n` +
      `End   joint location : ${this.mEndLocation}\r\n` +
      `Bone length          : ${this.mLength}\r\n` +
      `Color                : ${this.mColor}\r\n` +
      ``
    );
  }

  /**
   * {@inheritDoc}
   */
  // @Override
  public setStartLocation(location: Vec3): void {
    this.mStartLocation.set(location);
  }

  /**
   * {@inheritDoc}
   */
  // @Override
  public setEndLocation(location: Vec3): void {
    this.mEndLocation.set(location);
  }

  /**
   * Set the length of the bone.
   * <p>
   * This method validates the length argument to ensure that it is greater than zero.
   * <p>
   * If the length argument is not a positive value then an {@link IllegalArgumentException} is thrown.
   *
   * @param	length	The value to set on the {@link #mLength} property.
   */
  private setLength(length: number): void {
    if (length > 0.0) {
      this.mLength = length;
    } else {
      throw new Error('Bone length must be a positive value.');
    }
  }

  //   @Override
  //   public int hashCode() {
  //     final int prime = 31;
  //     int result = 1;
  //     result = prime * result + ((mBoneConnectionPoint == null) ? 0 : mBoneConnectionPoint.hashCode());
  //     result = prime * result + ((mColor == null) ? 0 : mColor.hashCode());
  //     result = prime * result + ((mEndLocation == null) ? 0 : mEndLocation.hashCode());
  //     result = prime * result + ((mJoint == null) ? 0 : mJoint.hashCode());
  //     result = prime * result + Float.floatToIntBits(mLength);
  //     result = prime * result + Float.floatToIntBits(mLineWidth);
  //     result = prime * result + ((mName == null) ? 0 : mName.hashCode());
  //     result = prime * result + ((mStartLocation == null) ? 0 : mStartLocation.hashCode());
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

    const other = obj as FabrikBone3D;

    if (this.mBoneConnectionPoint != other.mBoneConnectionPoint) {
      return false;
    }

    if (this.mColor == null) {
      if (other.mColor != null) {
        return false;
      }
    } else if (!this.mColor.equals(other.mColor)) {
      return false;
    }

    if (this.mEndLocation == null) {
      if (other.mEndLocation != null) {
        return false;
      }
    } else if (!this.mEndLocation.equals(other.mEndLocation)) {
      return false;
    }

    if (this.mJoint == null) {
      if (other.mJoint != null) {
        return false;
      }
    } else if (!this.mJoint.equals(other.mJoint)) {
      return false;
    }

    if (this.mLength != other.mLength) {
      return false;
    }

    if (this.mLineWidth != other.mLineWidth) {
      return false;
    }

    if (this.mName == null) {
      if (other.mName != null) {
        return false;
      }
    } else if (this.mName != other.mName) {
      return false;
    }

    if (this.mStartLocation == null) {
      if (other.mStartLocation != null) {
        return false;
      }
    } else if (!this.mStartLocation.equals(other.mStartLocation)) {
      return false;
    }

    return true;
  }
} // End of FabrikBone3D class
