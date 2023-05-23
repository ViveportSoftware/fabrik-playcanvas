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
import { Color } from '../utils/Color';
import { Vec3 } from '../utils/Vec3';
import { BoneConnectionPoint } from './BoneConnectionPoint';
import { FabrikBone } from './FabrikBone';
import { FabrikJoint3D, JointType } from './FabrikJoint3D';
export declare class FabrikBone3D implements FabrikBone<Vec3, FabrikJoint3D> {
    /** The minimum valid line width with which to draw a bone as a line is 1.0f pixels wide. */
    private static MIN_LINE_WIDTH;
    /** The maximum valid line width with which to draw a bone as a line is 64.0f pixels wide. */
    private static MAX_LINE_WIDTH;
    /**
     * If this chain is connected to a bone in another chain, should this chain connect to the start or the end of that bone?
     * <p>
     * The default is to connect to the end of the specified bone.
     * <p>
     * This property can be set via the {#link #setBoneConnectionPoint(BoneConnectionPoint)} method, or when attaching this chain
     * to another chain via the {@link au.edu.federation.caliko.FabrikStructure3D#connectChain(FabrikChain3D, int, int, BoneConnectionPoint)} method.
     */
    private mBoneConnectionPoint;
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
    private mJoint;
    /**
     * mStartLocation	The start location of this FabrikBone3D object.
     * <p>
     * The start location of a bone may only be set through a constructor or via an 'addBone'
     * method provided by the {@link FabrikChain3D} class.
     */
    private mStartLocation;
    /**
     * mEndLocation	The end location of this FabrikBone3D object.
     * <p>
     * The end location of a bone may only be set through a constructor or indirectly via an
     * 'addBone' method provided by the {@link FabrikChain3D} class.
     */
    private mEndLocation;
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
    private mName;
    /**
     * The length of this bone from its start location to its end location. This is is calculated
     * in the constructor and remains constant for the lifetime of the object.
     */
    private mLength;
    /**
     * The color used to draw the bone as specified by a {@link Color4f au.edu.federation.utils.Color4f.class} object.
     * <p>
     * The default color to draw a bone is white at full opacity i.e. Color4f(1.0f, 1.0f, 1.0f, 1.0f).
     */
    private mColor;
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
    private mLineWidth;
    /**
     * Default constructor */
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
    constructor(startLocation?: Vec3 | undefined, endLocation?: Vec3 | undefined, color?: Color | undefined);
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
    static NewByStartEndName(startLocation: Vec3, endLocation: Vec3, name: string): FabrikBone3D;
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
    static NewByStartDirectionLength(startLocation: Vec3, directionUV: Vec3, length: number): FabrikBone3D;
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
    static NewByStartDirectionLengthName(startLocation: Vec3, directionUV: Vec3, length: number, name: string): FabrikBone3D;
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
    static NewByStartDirectionLengthColor(startLocation: Vec3, directionUV: Vec3, length: number, color: Color): FabrikBone3D;
    /**
     * Copy constructor.
     * <p>
     * Takes a source FabrikBone3D object and copies all properties into the new FabrikBone3D by value.
     * Once this is done, there are no shared references between the source and the new object, and they are
     * exact copies of each other.
     *
     * @param	source	The bone to use as the basis for this new bone.
     */
    static NewByFabrikBone3D(source: FabrikBone3D): FabrikBone3D;
    /**
     * {@inheritDoc}
     */
    length(): number;
    /**
     * Return the live (i.e. live calculated) length of this bone from its current start and end locations.
     *
     * @return	The 'live' calculated distance between the start and end locations of this bone.
     */
    liveLength(): number;
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
    setBoneConnectionPoint(bcp: BoneConnectionPoint): void;
    /**
     * Return the bone connection point for THIS bone, which will be either BoneConnectionPoint.START or BoneConnectionPoint.END.
     * <p>
     * This connection point property controls whether, when THIS bone connects to another bone in another chain, it does so at
     * the start or the end of the bone we connect to.
     *
     * @return	The bone connection point for this bone.
     */
    getBoneConnectionPoint(): BoneConnectionPoint;
    /**
     * Return the color of this bone.
     *
     * @return	The color to draw this bone, as stored in the mColor property.
     */
    getColor(): Color;
    /**
     * Set the color used to draw this bone.
     *
     * @param	color	The color (used to draw this bone) to set on the mColor property.
     */
    setColor(color: Color): void;
    /**
     * Return the line width in pixels used to draw this bone.
     *
     * @return	The line width in pixels used to draw this bone.
     */
    getLineWidth(): number;
    /**
     * {@inheritDoc}
     */
    getStartLocation(): Vec3;
    /**
     * Return the start location of this bone as an array of three floats.
     *
     * @return	The start location of this bone as an array of three floats.
     */
    getStartLocationAsArray(): number[];
    /**
     * {@inheritDoc}
     */
    getEndLocation(): Vec3;
    /**
     * Return the end location of this bone as an array of three floats.
     *
     * @return	The end location of this bone as an array of three floats.
     */
    getEndLocationAsArray(): number[];
    /**
     * Set the FabrikJoint3D of this bone to match the properties of the provided FabrikJoint3D argument.
     *
     * @param	joint	The joint to use as the source for all joint properties on this bone.
     */
    setJoint(joint: FabrikJoint3D): void;
    /**
     * {@inheritDoc}
     */
    getJoint(): FabrikJoint3D;
    /**
     * Return the type of FabrikJoint3D.JointType associated with this bone.
     *
     * @return	The type of FabrikJoint3D.JointType associated with this bone.
     */
    getJointType(): JointType;
    /**
     * Set the clockwise constraint angle of this bone's joint in degrees (0.0f to 180.0f inclusive).
     * <p>
     * If a constraint angle outside of this range is provided, then an IllegalArgumentException is
     * thrown.
     *
     * @param  angleDegs  The relative clockwise constraint angle specified in degrees.
     */
    setHingeJointClockwiseConstraintDegs(angleDegs: number): void;
    /**
     * Return the clockwise constraint angle of this bone's hinge joint in degrees.
     *
     * @return	 The clockwise constraint angle of this bone's hinge joint in degrees.
     */
    getHingeJointClockwiseConstraintDegs(): number;
    /**
     * Set the anticlockwise constraint angle of this bone's joint in degrees (0.0f to 180.0f inclusive).
     * <p>
     * If a constraint angle outside of this range is provided, then an {@link IllegalArgumentException}
     * is thrown.
     *
     * @param  angleDegs  The relative anticlockwise constraint angle specified in degrees.
     */
    setHingeJointAnticlockwiseConstraintDegs(angleDegs: number): void;
    /**
     * Return the anticlockwise constraint angle of this bone's hinge joint in degrees.
     *
     * @return	 The anticlockwise constraint angle of this bone's hinge joint in degrees.
     */
    getHingeJointAnticlockwiseConstraintDegs(): number;
    /**
     * Set the rotor constraint angle of this bone's joint in degrees (0.0f to 180.0f inclusive).
     * <p>
     * If a constraint angle outside of this range is provided, then an {@link IllegalArgumentException}
     * is thrown.
     *
     * @param  angleDegs  The angle in degrees relative to the previous bone which this bone is constrained to.
     */
    setBallJointConstraintDegs(angleDegs: number): void;
    /**
     * Return the anticlockwise constraint angle of this bone's joint in degrees.
     *
     * @return	The anticlockwise constraint angle of this bone's joint in degrees.
     */
    getBallJointConstraintDegs(): number;
    /**
     * Get the direction unit vector between the start location and end location of this bone.
     * <p>
     * If the opposite (i.e. end to start) location is required then you can simply negate the provided direction.
     *
     * @return  The direction unit vector of this bone.
     * @see		Vec3f#negate()
     * @see		Vec3f#negated()
     */
    getDirectionUV(): Vec3;
    /**
     * Get the global pitch of this bone with regard to the X-Axis. Pitch returned is in the range -179.9f to 180.0f.
     *
     * @return  The global pitch of this bone in degrees.
     */
    getGlobalPitchDegs(): number;
    /**
     * Get the global yaw of this bone with regard to the Y-Axis. Yaw returned is in the range -179.9f to 180.0f.
     *
     * @return  The global yaw of this bone in degrees.
     */
    getGlobalYawDegs(): number;
    /**
     * Set the line width with which to draw this bone.
     * <p>
     * If the provided parameter is outside the valid range of 1.0f to 64.0f inclusive then an
     * IllegalArgumentException is thrown.
     *
     * @param	lineWidth	The value to set on the mLineWidth property.
     */
    setLineWidth(lineWidth: number): void;
    /**
     * Set the name of this bone, capped to 100 characters if required.
     *
     * @param	name	The name to set.
     */
    setName(name: string): void;
    /**
     * Get the name of this bone.
     * <p>
     * If the bone has not been specifically named through a constructor or by using the {@link #setName(String)} method,
     * then the name will be the default of "UnnamedFabrikBone3D".
     * @return String
     */
    getName(): string;
    /**
     * Return a concise, human readable description of this FabrikBone3D as a String.
     */
    toString(): string;
    /**
     * {@inheritDoc}
     */
    setStartLocation(location: Vec3): void;
    /**
     * {@inheritDoc}
     */
    setEndLocation(location: Vec3): void;
    /**
     * Set the length of the bone.
     * <p>
     * This method validates the length argument to ensure that it is greater than zero.
     * <p>
     * If the length argument is not a positive value then an {@link IllegalArgumentException} is thrown.
     *
     * @param	length	The value to set on the {@link #mLength} property.
     */
    private setLength;
    equals(obj: Object): boolean;
}
