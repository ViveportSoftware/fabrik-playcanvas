/**
 * A FabrikStructure3D contains one or more FabrikChain3D objects, which we can solve using the FABRIK (Forward And
 * Backward Reaching Inverse Kinematics) algorithm for specified target locations.
 * <p>
 * The FabrikStructure3D class is merely a convenient holder for a list of FabrikChain3D objects which allows
 * multiple chains to have their target location updated, as well as solving and drawing the multiple chains
 * attached to the FabrikStructure3D object using one method call per structure.
 * <p>
 * If you do not intend on attaching multiple FabrikChain3D objects into a complex structure, for example one with
 * multiple effectors, then you may be better served by creating individual FabrikChain3D objects and using those
 * objects directly.
 *
 * @author Al Lansley
 * @version 0.5 - 19/06/2019
 **/
import { Vec3 } from '../utils/Vec3';
import { BoneConnectionPoint } from './BoneConnectionPoint';
import { FabrikChain3D } from './FabrikChain3D';
import { FabrikJoint3D } from './FabrikJoint3D';
import { FabrikStructure } from './FabrikStructure';
export declare class FabrikStructure3D implements FabrikStructure<FabrikChain3D, Vec3, FabrikJoint3D> {
    /** The string name of this FabrikStructure3D - can be used for creating Maps, if required. */
    private mName;
    /**
     * The main substance of a FabrikStructure3D is a List of FabrikChain3D objects.
     * <p>
     * Each FabrikChain3D in the mChains vector is independent of all others, but shares the same target location as any/all other chains
     * which exist in this structure.
     */
    private mChains;
    private mChainsMap;
    /** Default constructor. */
    constructor();
    /**
     * Naming constructor.
     * <p>
     * Name lengths are truncated to a maximum of 100 characters, if necessary.
     *
     *  @param	name	The name you wish to call the structure.
     */
    static NewByName(name: string): FabrikStructure3D;
    isEmpty(): boolean;
    /**
     * Solve the structure for the given target location.
     * <p>
     * All chains in this structure are solved for the given target location EXCEPT those which have embedded targets enabled, which are
     * solved for the target location embedded in the chain.
     * <p>
     * After this method has been executed, the configuration of all IK chains attached to this structure will have been updated.
     *
     * @param   newTargetLocation	The location of the target for which we will attempt to solve all chains attached to this structure.
     */
    solveForTarget(newTargetLocation: Vec3): void;
    solveForTargets(newTargetLocations: Map<string, Vec3>): void;
    /**
     * Add a FabrikChain3D to this FabrikStructure3D.
     * <p>
     * In effect, the chain is added to the mChains list of FabrikChain3D objects, and the mNumChains property is incremented.
     * <p>
     * Adding a chain using this method adds the chain to the structure, but does not connect it to any existing chain
     * in the structure. If you wish to connect a chain, use one of the connectChain methods instead.
     * <p>
     * All chains in a structure share the same target, and all chains in the structure can be solved for the target location
     * via a single call to updateTarget.
     *
     * @param	chain	(FabrikChain3D)	The FabrikChain3D to add to this structure.
     * @see   #connectChain(FabrikChain3D, int, int)
     * @see		#connectChain(FabrikChain3D, int, int, BoneConnectionPoint)
     **/
    addChain(chain: FabrikChain3D): void;
    /**
     * Remove a FabrikChain3D from this FabrikStructure3D by its index.
     * <p>
     * In effect, the chain is removed from the mChains list of FabrikChain3D objects, and the mNumChains property is decremented.
     *
     * @param	chainIndex	The index of the chain to remove from the mChains list of FabrikChain3D objects.
     **/
    removeChain(chainIndex: number): void;
    /**
     * Connect a chain to an existing chain in this structure.
     * <p>
     * Both chains and bones are are zero indexed.
     * <p>
     * If the existingChainNumber or existingBoneNumber specified to connect to does not exist in this structure
     * then an IllegalArgumentExeception is thrown.
     *
     * @param	newChain			The chain to connect to this structure
     * @param	existingChainNumber	The index of the chain to connect the new chain to.
     * @param	existingBoneNumber	The index of the bone to connect the new chain to within the existing chain.
     */
    /**
     * Connect a chain to an existing chain in this structure.
     * <p>
     * Both chains and bones are are zero indexed.
     * <p>
     * If the existingChainNumber or existingBoneNumber specified to connect to does not exist in this structure
     * then an IllegalArgumentExeception is thrown.
     *
     * @param	newChain		The chain to connect to this structure
     * @param	existingChainNumber	The index of the chain to connect the new chain to.
     * @param	existingBoneNumber	The index of the bone to connect the new chain to within the existing chain.
     * @param	boneConnectionPoint	Whether the new chain should connect to the START or END of the specified bone in the specified chain.
     */
    connectChain(newChain: FabrikChain3D, existingChainNumber: number, existingBoneNumber: number, boneConnectionPoint: BoneConnectionPoint): void;
    connectChainByName(newChain: FabrikChain3D, existingChainName: string, existingBoneNumber: number, boneConnectionPoint: BoneConnectionPoint): void;
    /**
     * Return the number of chains in this structure.
     *
     * @return	The number of chains in this structure.
     */
    getNumChains(): number;
    /**
     * Return the specified chain from this structure.
     * <p>
     * Chain numbers are zero indexed. If the specified chain does not exist in this structure
     * then an IllegalArgumentException is thrown.
     *
     * @param	chainNumber	The specified chain from this structure.
     * @return	The specified FabrikChain3D from this chain.
     */
    getChain(chainNumber: number): FabrikChain3D;
    getChainByName(name: string): FabrikChain3D | undefined;
    /**
     * Set the fixed base mode on all chains in this structure.
     *
     * @param	fixedBaseMode	Whether all chains should operate in fixed base mode (true) or not (false).
     */
    setFixedBaseMode(fixedBaseMode: boolean): void;
    /**
     * Set the name of this structure, capped to 100 characters if required.
     *
     * @param	name	The name to set.
     */
    setName(name: string): void;
    getName(): string;
    /**
     * Return a concise, human readable description of this FabrikStructure3D.
     * <p>
     * If further details on a specific chain are required, then you should get and print each chain individually.
     *
     * @return A concise, human readable description of this FabrikStructure3D.
     */
    toString(): string;
    equals(obj: Object): boolean;
}
