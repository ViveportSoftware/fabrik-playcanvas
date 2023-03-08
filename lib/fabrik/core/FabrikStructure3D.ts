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

import {Mat3} from '../utils/Mat3';
import {Utils} from '../utils/Utils';
import {Vec3} from '../utils/Vec3';
import {BoneConnectionPoint} from './BoneConnectionPoint';
import {BaseboneConstraintType3D, FabrikChain3D} from './FabrikChain3D';
import {FabrikJoint3D} from './FabrikJoint3D';
import {FabrikStructure} from './FabrikStructure';

export class FabrikStructure3D
  implements FabrikStructure<FabrikChain3D, Vec3, FabrikJoint3D>
{
  /** The string name of this FabrikStructure3D - can be used for creating Maps, if required. */
  private mName: string = '';

  /**
   * The main substance of a FabrikStructure3D is a List of FabrikChain3D objects.
   * <p>
   * Each FabrikChain3D in the mChains vector is independent of all others, but shares the same target location as any/all other chains
   * which exist in this structure.
   */
  private mChains: Array<FabrikChain3D> = new Array<FabrikChain3D>();

  private mChainsMap: Map<string, FabrikChain3D> = new Map();

  // --------- Public Methods ----------

  /** Default constructor. */
  constructor() {}

  /**
   * Naming constructor.
   * <p>
   * Name lengths are truncated to a maximum of 100 characters, if necessary.
   *
   *  @param	name	The name you wish to call the structure.
   */
  public static NewByName(name: string): FabrikStructure3D {
    const s = new FabrikStructure3D();
    s.setName(name);
    return s;
  }

  public isEmpty(): boolean {
    return this.mChains.length == 0;
  }

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
  // @Override
  public solveForTarget(newTargetLocation: Vec3): void {
    const numChains = this.mChains.length;
    let connectedChainNumber;

    // Loop over all chains in this structure...
    for (let loop = 0; loop < numChains; ++loop) {
      // Get this chain, and get the number of the chain in this structure it's connected to (if any)
      const thisChain = this.getChain(loop);
      connectedChainNumber = thisChain.getConnectedChainNumber();

      // If this chain isn't connected to another chain then update as normal...
      if (connectedChainNumber == -1) {
        thisChain.solveForTarget(newTargetLocation);
      } // ...however, if this chain IS connected to another chain...
      else {
        // ... get the host chain and bone which this chain is connected to
        const hostChain = this.getChain(connectedChainNumber);
        const hostBone = hostChain.getBone(thisChain.getConnectedBoneNumber());
        if (hostBone.getBoneConnectionPoint() == BoneConnectionPoint.START) {
          thisChain.setBaseLocation(hostBone.getStartLocation());
        } else {
          thisChain.setBaseLocation(hostBone.getEndLocation());
        }

        // Now that we've clamped the base location of this chain to the start or end point of the bone in the chain we are connected to, it's
        // time to deal with any base bone constraints...

        // What type of base bone constraint is this (connected to another) chain using?
        const constraintType = thisChain.getBaseboneConstraintType();
        switch (constraintType) {
          // None or global basebone constraints? Nothing to do, because these will be handled in FabrikChain3D.solveIK() as we do not
          // need information from another chain to handle them.
          case BaseboneConstraintType3D.NONE: // Nothing to do because there's no basebone constraint
          case BaseboneConstraintType3D.GLOBAL_ROTOR: // Nothing to do because the basebone constraint is not relative to bones in other chains in this structure
          case BaseboneConstraintType3D.GLOBAL_HINGE: // Nothing to do because the basebone constraint is not relative to bones in other chains in this structure
            break;

          // If we have a local rotor or hinge constraint then we must calculate the relative basebone constraint before calling updateTarget
          case BaseboneConstraintType3D.LOCAL_ROTOR:
          case BaseboneConstraintType3D.LOCAL_HINGE: {
            // Get the direction of the bone this chain is connected to and create a rotation matrix from it.
            const connectionBoneMatrix = Mat3.createRotationMatrix(
              hostBone.getDirectionUV()
            );

            // We'll then get the basebone constraint UV and multiply it by the rotation matrix of the connected bone
            // to make the basebone constraint UV relative to the direction of bone it's connected to.
            const relativeBaseboneConstraintUV = connectionBoneMatrix
              .timesByVec3(thisChain.getBaseboneConstraintUV())
              .normalised();

            // Update our basebone relative constraint UV property
            thisChain.setBaseboneRelativeConstraintUV(
              relativeBaseboneConstraintUV
            );

            // Updat the relative reference constraint UV if we hav a local hinge
            if (constraintType == BaseboneConstraintType3D.LOCAL_HINGE) {
              thisChain.setBaseboneRelativeReferenceConstraintUV(
                connectionBoneMatrix.timesByVec3(
                  thisChain.getBone(0).getJoint().getHingeReferenceAxis()
                )
              );
            }
            break;
          }

          // No need for a default - constraint types are enums and we've covered them all.
        }

        // NOTE: If the base bone constraint type is NONE then we don't do anything with the base bone constraint of the connected chain.

        // Finally, update the target and solve the chain
        // Update the target and solve the chain
        if (!thisChain.getEmbeddedTargetMode()) {
          thisChain.solveForTarget(newTargetLocation);
        } else {
          thisChain.solveForEmbeddedTarget();
        }
      } // End of if chain is connected to another chain section
    } // End of loop over chains
  } // End of updateTarget method

  public solveForTargets(newTargetLocations: Map<string, Vec3>): void {
    const numChains = this.mChains.length;
    let connectedChainNumber;

    // Loop over all chains in this structure...
    for (let loop = 0; loop < numChains; ++loop) {
      // Get this chain, and get the number of the chain in this structure it's connected to (if any)
      const chain = this.getChain(loop);

      const target = newTargetLocations.get(chain.getName());

      if (!target) continue;

      connectedChainNumber = chain.getConnectedChainNumber();

      // If this chain isn't connected to another chain then update as normal...
      if (connectedChainNumber == -1) {
        // chain.solveForTarget(target);
      } // ...however, if this chain IS connected to another chain...
      else {
        // ... get the host chain and bone which this chain is connected to
        const hostChain = this.getChain(connectedChainNumber);
        const hostBone = hostChain.getBone(chain.getConnectedBoneNumber());

        if (hostBone.getBoneConnectionPoint() == BoneConnectionPoint.START) {
          chain.setBaseLocation(hostBone.getStartLocation());
        } else {
          chain.setBaseLocation(hostBone.getEndLocation());
        }

        // Now that we've clamped the base location of this chain to the start or end point of the bone in the chain we are connected to, it's
        // time to deal with any base bone constraints...

        // What type of base bone constraint is this (connected to another) chain using?
        const constraintType = chain.getBaseboneConstraintType();

        switch (constraintType) {
          // None or global basebone constraints? Nothing to do, because these will be handled in FabrikChain3D.solveIK() as we do not
          // need information from another chain to handle them.
          case BaseboneConstraintType3D.NONE: // Nothing to do because there's no basebone constraint
          case BaseboneConstraintType3D.GLOBAL_ROTOR: // Nothing to do because the basebone constraint is not relative to bones in other chains in this structure
          case BaseboneConstraintType3D.GLOBAL_HINGE: // Nothing to do because the basebone constraint is not relative to bones in other chains in this structure
            break;

          // If we have a local rotor or hinge constraint then we must calculate the relative basebone constraint before calling updateTarget
          case BaseboneConstraintType3D.LOCAL_ROTOR:
          case BaseboneConstraintType3D.LOCAL_HINGE: {
            // Get the direction of the bone this chain is connected to and create a rotation matrix from it.
            const connectionBoneMatrix = Mat3.createRotationMatrix(
              hostBone.getDirectionUV()
            );

            // We'll then get the basebone constraint UV and multiply it by the rotation matrix of the connected bone
            // to make the basebone constraint UV relative to the direction of bone it's connected to.
            const relativeBaseboneConstraintUV = connectionBoneMatrix
              .timesByVec3(chain.getBaseboneConstraintUV())
              .normalised();

            // Update our basebone relative constraint UV property
            chain.setBaseboneRelativeConstraintUV(relativeBaseboneConstraintUV);

            // Updat the relative reference constraint UV if we hav a local hinge
            if (constraintType == BaseboneConstraintType3D.LOCAL_HINGE) {
              chain.setBaseboneRelativeReferenceConstraintUV(
                connectionBoneMatrix.timesByVec3(
                  chain.getBone(0).getJoint().getHingeReferenceAxis()
                )
              );
            }
            break;
          }
          // No need for a default - constraint types are enums and we've covered them all.
        }
      }

      if (!chain.getEmbeddedTargetMode()) {
        chain.solveForTarget(target);
      } else {
        chain.solveForEmbeddedTarget();
      }
    }
  }

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
  // @Override
  public addChain(chain: FabrikChain3D): void {
    const existedChain = this.mChainsMap.get(chain.getName());
    if (existedChain) {
      throw new Error(`chain name [${chain.getName()}] is existed`);
    }
    this.mChains.push(chain);
    this.mChainsMap.set(chain.getName(), chain);
  }

  /**
   * Remove a FabrikChain3D from this FabrikStructure3D by its index.
   * <p>
   * In effect, the chain is removed from the mChains list of FabrikChain3D objects, and the mNumChains property is decremented.
   *
   * @param	chainIndex	The index of the chain to remove from the mChains list of FabrikChain3D objects.
   **/
  public removeChain(chainIndex: number): void {
    if (this.isEmpty()) {
      throw new Error('mChains is empty');
    }

    if (chainIndex < 0 || chainIndex >= this.mChains.length) {
      throw new Error('out of range');
    }

    this.mChains.splice(chainIndex, 1);
  }

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
  // @Override
  // public  connectChain( newChain:FabrikChain3D,  existingChainNumber:number,  existingBoneNumber:number):void
  // {
  // 	// Does this chain exist? If not throw an IllegalArgumentException
  // 	if (existingChainNumber > this.mChains.size())
  // 	{
  // 		throw new IllegalArgumentException("Cannot connect to chain " + existingChainNumber + " - no such chain (remember that chains are zero indexed).");
  // 	}

  // 	// Do we have this bone in the specified chain? If not throw an IllegalArgumentException
  // 	if (existingBoneNumber > mChains.get(existingChainNumber).getNumBones() )
  // 	{
  // 		throw new IllegalArgumentException("Cannot connect to bone " + existingBoneNumber + " of chain " + existingChainNumber + " - no such bone (remember that bones are zero indexed).");
  // 	}

  // 	// Make a copy of the provided chain so any changes made to the original do not affect this chain
  // 	FabrikChain3D relativeChain = new FabrikChain3D(newChain);

  // 	// Connect the copy of the provided chain to the specified chain and bone in this structure
  // 	relativeChain.connectToStructure(this, existingChainNumber, existingBoneNumber);

  // 	// The chain as we were provided should be centred on the origin, so we must now make it
  // 	// relative to the start location of the given bone in the given chain.

  // 	// Get the connection point so we know to connect at the start or end location of the bone we're connecting to
  // 	BoneConnectionPoint connectionPoint = this.getChain(existingChainNumber).getBone(existingBoneNumber).getBoneConnectionPoint();
  // 	Vec3f connectionLocation;
  // 	if (connectionPoint == BoneConnectionPoint.START)
  // 	{
  // 		connectionLocation = mChains.get(existingChainNumber).getBone(existingBoneNumber).getStartLocation();
  // 	}
  // 	else // If it's BoneConnectionPoint.END then we set the connection point to be the end location of the bone we're connecting to
  // 	{
  // 		connectionLocation = mChains.get(existingChainNumber).getBone(existingBoneNumber).getEndLocation();
  // 	}
  // 	relativeChain.setBaseLocation(connectionLocation);

  // 	// When we have a chain connected to a another 'host' chain, the chain is which is connecting in
  // 	// MUST have a fixed base, even though that means the base location is 'fixed' to the connection
  // 	// point on the host chain, rather than a static location.
  // 	relativeChain.setFixedBaseMode(true);

  // 	// Translate the chain we're connecting to the connection point
  // 	for (int loop = 0; loop < relativeChain.getNumBones(); ++loop)
  // 	{
  // 		Vec3f origStart = relativeChain.getBone(loop).getStartLocation();
  // 		Vec3f origEnd   = relativeChain.getBone(loop).getEndLocation();

  // 		Vec3f translatedStart = origStart.plus(connectionLocation);
  // 		Vec3f translatedEnd   = origEnd.plus(connectionLocation);

  // 		relativeChain.getBone(loop).setStartLocation(translatedStart);
  // 		relativeChain.getBone(loop).setEndLocation(translatedEnd);
  // 	}

  // 	this.addChain(relativeChain);
  // }

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
  // @Override
  public connectChain(
    newChain: FabrikChain3D,
    existingChainNumber: number,
    existingBoneNumber: number,
    boneConnectionPoint: BoneConnectionPoint
  ): void {
    // Does this chain exist? If not throw an IllegalArgumentException
    if (existingChainNumber > this.mChains.length) {
      throw new Error(
        'Cannot connect to chain ' +
          existingChainNumber +
          ' - no such chain (remember that chains are zero indexed).'
      );
    }

    // Do we have this bone in the specified chain? If not throw an IllegalArgumentException
    if (existingBoneNumber > this.getChain(existingChainNumber).getNumBones()) {
      throw new Error(
        'Cannot connect to bone ' +
          existingBoneNumber +
          ' of chain ' +
          existingChainNumber +
          ' - no such bone (remember that bones are zero indexed).'
      );
    }

    // Make a copy of the provided chain so any changes made to the original do not affect this chain
    const relativeChain = FabrikChain3D.NewByFabrikChain3D(newChain);

    // Connect the copy of the provided chain to the specified chain and bone in this structure
    relativeChain.connectToStructure(
      this,
      existingChainNumber,
      existingBoneNumber
    );

    // The chain as we were provided should be centred on the origin, so we must now make it
    // relative to the start location of the given bone in the given chain.

    // Set the connection point and use it to get the connection location
    this.getChain(existingChainNumber)
      .getBone(existingBoneNumber)
      .setBoneConnectionPoint(boneConnectionPoint);
    let connectionLocation: Vec3;
    if (boneConnectionPoint == BoneConnectionPoint.START) {
      connectionLocation = this.getChain(existingChainNumber)
        .getBone(existingBoneNumber)
        .getStartLocation();
    } // If it's BoneConnectionPoint.END then we set the connection point to be the end location of the bone we're connecting to
    else {
      connectionLocation = this.getChain(existingChainNumber)
        .getBone(existingBoneNumber)
        .getEndLocation();
    }
    relativeChain.setBaseLocation(connectionLocation);

    // When we have a chain connected to a another 'host' chain, the chain is which is connecting in
    // MUST have a fixed base, even though that means the base location is 'fixed' to the connection
    // point on the host chain, rather than a static location.
    relativeChain.setFixedBaseMode(true);

    // Translate the chain we're connecting to the connection point
    for (let loop = 0; loop < relativeChain.getNumBones(); ++loop) {
      const origStart = relativeChain.getBone(loop).getStartLocation();
      const origEnd = relativeChain.getBone(loop).getEndLocation();

      const translatedStart = origStart.plus(connectionLocation);
      const translatedEnd = origEnd.plus(connectionLocation);

      relativeChain.getBone(loop).setStartLocation(translatedStart);
      relativeChain.getBone(loop).setEndLocation(translatedEnd);
    }

    this.addChain(relativeChain);
  }

  public connectChainByName(
    newChain: FabrikChain3D,
    existingChainName: string,
    existingBoneNumber: number,
    boneConnectionPoint: BoneConnectionPoint
  ): void {
    const existingChain = this.getChainByName(existingChainName);
    if (!existingChain) {
      throw new Error(`chain ${existingChainName} is not existed`);
    }

    const newChainByName = this.getChainByName(newChain.getName());
    if (newChainByName) {
      throw new Error(`new chain ${newChain.getName()} is already existed`);
    }

    const existingChainNumber = this.mChains.indexOf(existingChain);
    this.connectChain(
      newChain,
      existingChainNumber,
      existingBoneNumber,
      boneConnectionPoint
    );
  }

  /**
   * Return the number of chains in this structure.
   *
   * @return	The number of chains in this structure.
   */
  // @Override
  public getNumChains(): number {
    return this.mChains.length;
  }

  /**
   * Return the specified chain from this structure.
   * <p>
   * Chain numbers are zero indexed. If the specified chain does not exist in this structure
   * then an IllegalArgumentException is thrown.
   *
   * @param	chainNumber	The specified chain from this structure.
   * @return	The specified FabrikChain3D from this chain.
   */
  // @Override
  public getChain(chainNumber: number): FabrikChain3D {
    if (this.isEmpty()) {
      throw new Error('mChains is empty');
    }
    return this.mChains[chainNumber];
  }

  public getChainByName(name: string): FabrikChain3D | undefined {
    if (this.isEmpty()) {
      throw new Error('mChains is empty');
    }
    return this.mChainsMap.get(name);
  }

  /**
   * Set the fixed base mode on all chains in this structure.
   *
   * @param	fixedBaseMode	Whether all chains should operate in fixed base mode (true) or not (false).
   */
  public setFixedBaseMode(fixedBaseMode: boolean): void {
    for (let loop = 0; loop < this.mChains.length; ++loop) {
      this.getChain(loop).setFixedBaseMode(fixedBaseMode);
    }
  }

  /**
   * Set the name of this structure, capped to 100 characters if required.
   *
   * @param	name	The name to set.
   */
  // @Override
  public setName(name: string): void {
    this.mName = Utils.getValidatedName(name);
  }

  // @Override
  public getName(): string {
    return this.mName;
  }

  /**
   * Return a concise, human readable description of this FabrikStructure3D.
   * <p>
   * If further details on a specific chain are required, then you should get and print each chain individually.
   *
   * @return A concise, human readable description of this FabrikStructure3D.
   */
  // @Override
  public toString(): string {
    let s = ``;

    s += `"----- FabrikStructure3D: ${this.mName} -----\r\n`;
    s += `Number of chains: ${this.mChains.length}\r\n`;

    for (let loop = 0; loop < this.mChains.length; ++loop) {
      s += this.getChain(loop).toString();
    }

    return s;
  }

  //   @Override
  //   public int hashCode() {
  //     final int prime = 31;
  //     int result = 1;
  //     result = prime * result + ((mChains == null) ? 0 : mChains.hashCode());
  //     result = prime * result + ((mName == null) ? 0 : mName.hashCode());
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

    const other = obj as FabrikStructure3D;
    if (this.mChains == null) {
      if (other.mChains != null) {
        return false;
      }
    } else if (this.mChains != other.mChains) {
      return false;
    }
    if (this.mName == null) {
      if (other.mName != null) {
        return false;
      }
    } else if (this.mName != other.mName) {
      return false;
    }
    return true;
  }
}
