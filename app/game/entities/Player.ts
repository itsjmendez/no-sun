import * as THREE from 'three';
import { InputManager } from '../InputManager';
import { Item } from '../items/Item';
import { Lantern } from '../items/Lantern';
import { World } from '../World';

export class Player {
  private character: THREE.Group;
  private head: THREE.Mesh;
  private shoulders: THREE.Mesh;
  private leftLeg: THREE.Mesh;
  private rightLeg: THREE.Mesh;
  private leftArm: THREE.Mesh;
  private rightArm: THREE.Mesh;
  private leftHandItem: Item | null = null;
  private rightHandItem: Item | null = null;
  private handItemPosition: THREE.Vector3;
  private input: InputManager;
  private moveSpeed: number = 15;
  private scene: THREE.Scene;
  private legAnimationTime: number = 0;
  private targetRotation: number = 0;
  private rotationSpeed: number = 5;
  private breathingTime: number = 0;
  private lastRotation: number = 0;
  private isRotating: boolean = false;
  private readonly ARM_ROTATION_LIMIT = Math.PI * 0.35; // Slightly reduced rotation
  private readonly HAND_OFFSET = 0.08; // Distance from arm end to item grip point
  private armTargetRotation: number = 0;
  private currentArmRotation: number = 0;
  private upperBody: THREE.Group;
  private lowerBody: THREE.Group;
  private currentUpperBodyRotation: number = 0;
  private currentLowerBodyRotation: number = 0;
  private world: World;
  private collisionRadius: number = 0.3;

  constructor(scene: THREE.Scene, input: InputManager, world: World) {
    this.scene = scene;
    this.input = input;
    this.world = world;

    // Create main character group
    this.character = new THREE.Group();

    // Add direction indicator (green line pointing forward)
    const directionMaterial = new THREE.LineBasicMaterial({ color: 0x00ff00 });
    const directionGeometry = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0, 0, 1), // Points forward 1 unit in z-direction
    ]);
    const directionLine = new THREE.Line(directionGeometry, directionMaterial);
    this.character.add(directionLine);

    // Create upper and lower body groups
    this.upperBody = new THREE.Group();
    this.lowerBody = new THREE.Group();
    this.character.add(this.upperBody);
    this.character.add(this.lowerBody);

    // Create legs (in lower body group)
    const legGeometry = new THREE.PlaneGeometry(0.08, 0.2);
    const legMaterial = new THREE.MeshPhongMaterial({
      color: 0x666666,
      side: THREE.DoubleSide,
      depthWrite: true,
    });

    this.leftLeg = new THREE.Mesh(legGeometry, legMaterial);
    this.leftLeg.rotation.x = -Math.PI / 2;
    this.leftLeg.position.set(-0.12, 0.1, -0.08);
    this.leftLeg.castShadow = true;
    this.lowerBody.add(this.leftLeg);

    this.rightLeg = new THREE.Mesh(legGeometry, legMaterial);
    this.rightLeg.rotation.x = -Math.PI / 2;
    this.rightLeg.position.set(0.12, 0.1, -0.08);
    this.rightLeg.castShadow = true;
    this.lowerBody.add(this.rightLeg);

    // Create smooth shoulders/body shape
    const shouldersShape = new THREE.Shape();
    shouldersShape.moveTo(-0.18, -0.12);
    shouldersShape.lineTo(0.18, -0.12);
    shouldersShape.bezierCurveTo(0.25, -0.12, 0.25, 0.12, 0.18, 0.12);
    shouldersShape.lineTo(-0.18, 0.12);
    shouldersShape.bezierCurveTo(-0.25, 0.12, -0.25, -0.12, -0.18, -0.12);

    const shouldersGeometry = new THREE.ShapeGeometry(shouldersShape);
    const shouldersMaterial = new THREE.MeshPhongMaterial({
      color: 0x777777,
      side: THREE.DoubleSide,
      depthWrite: true,
    });
    this.shoulders = new THREE.Mesh(shouldersGeometry, shouldersMaterial);
    this.shoulders.rotation.x = -Math.PI / 2;
    this.shoulders.position.y = 0.15;
    this.shoulders.castShadow = true;
    this.upperBody.add(this.shoulders);

    // Create simple head (circle)
    const headGeometry = new THREE.CircleGeometry(0.15, 32);
    const headMaterial = new THREE.MeshPhongMaterial({
      color: 0x888888,
      depthWrite: true,
    });
    this.head = new THREE.Mesh(headGeometry, headMaterial);
    this.head.rotation.x = -Math.PI / 2;
    this.head.position.set(0, 0.2, 0.1);
    this.head.castShadow = true;
    this.upperBody.add(this.head);

    // Create arms
    const armGeometry = new THREE.PlaneGeometry(0.06, 0.2);
    const armMaterial = new THREE.MeshPhongMaterial({
      color: 0x666666,
      side: THREE.DoubleSide,
      depthWrite: true,
    });

    this.rightArm = new THREE.Mesh(armGeometry, armMaterial);
    this.rightArm.rotation.x = -Math.PI / 2;
    this.rightArm.position.set(0.15, 0.15, 0.1);
    this.rightArm.castShadow = true;
    this.upperBody.add(this.rightArm);

    this.leftArm = new THREE.Mesh(armGeometry, armMaterial);
    this.leftArm.rotation.x = -Math.PI / 2;
    this.leftArm.position.set(-0.15, 0.15, 0.1);
    this.leftArm.castShadow = true;
    this.upperBody.add(this.leftArm);

    scene.add(this.character);

    // Initialize hand item position
    this.handItemPosition = new THREE.Vector3(-0.15, 0.15, 0.2);

    // Equip lantern in left hand
    this.equipItemLeftHand(new Lantern(scene));
  }

  private equipItemLeftHand(item: Item) {
    if (this.leftHandItem) {
      this.upperBody.remove(this.leftHandItem.mesh);
    }
    this.leftHandItem = item;
    if (item) {
      // Add item to upper body group instead of character
      this.upperBody.add(item.mesh);
      // Position item relative to left arm
      item.mesh.position.set(-0.2, 0.15, 0.15);
    }
  }

  public update(delta: number) {
    const mousePos = this.input.getMousePosition();
    const targetUpperBodyRotation =
      Math.atan2(-mousePos.x, mousePos.y) + Math.PI;

    // Smooth upper body rotation
    const upperRotationDiff = Math.atan2(
      Math.sin(targetUpperBodyRotation - this.currentUpperBodyRotation),
      Math.cos(targetUpperBodyRotation - this.currentUpperBodyRotation)
    );
    this.currentUpperBodyRotation += upperRotationDiff * 10 * delta;
    this.upperBody.rotation.y = this.currentUpperBodyRotation;

    // Handle movement
    const movement = new THREE.Vector3(0, 0, 0);
    let isMoving = false;

    if (this.input.isKeyPressed('w')) {
      movement.z -= 1;
      isMoving = true;
    }
    if (this.input.isKeyPressed('s')) {
      movement.z += 1;
      isMoving = true;
    }
    if (this.input.isKeyPressed('a')) {
      movement.x -= 1;
      isMoving = true;
    }
    if (this.input.isKeyPressed('d')) {
      movement.x += 1;
      isMoving = true;
    }

    // Update position and lower body rotation
    if (movement.length() > 0) {
      movement.normalize().multiplyScalar(this.moveSpeed * delta);

      // Store current position
      const currentPosition = this.character.position.clone();

      // Try to move
      const newPosition = currentPosition.clone().add(movement);

      // Check for collision
      if (!this.world.checkCollision(newPosition, this.collisionRadius)) {
        // If no collision, apply movement
        this.character.position.copy(newPosition);
      } else {
        // Try to slide along walls
        const tryX = currentPosition.clone();
        tryX.x += movement.x;

        const tryZ = currentPosition.clone();
        tryZ.z += movement.z;

        // Check X movement
        if (!this.world.checkCollision(tryX, this.collisionRadius)) {
          this.character.position.x = tryX.x;
        }

        // Check Z movement
        if (!this.world.checkCollision(tryZ, this.collisionRadius)) {
          this.character.position.z = tryZ.z;
        }
      }

      // Calculate lower body rotation based on movement direction
      const targetLowerBodyRotation = Math.atan2(movement.x, movement.z);

      // Smooth lower body rotation
      const lowerRotationDiff = Math.atan2(
        Math.sin(targetLowerBodyRotation - this.currentLowerBodyRotation),
        Math.cos(targetLowerBodyRotation - this.currentLowerBodyRotation)
      );
      this.currentLowerBodyRotation += lowerRotationDiff * 10 * delta;
      this.lowerBody.rotation.y = this.currentLowerBodyRotation;
    }

    // Update breathing and item position
    this.breathingTime += delta;
    const breathingOffset = Math.sin(this.breathingTime * 1.5) * 0.005;

    // Apply breathing to upper body
    this.upperBody.position.y = breathingOffset;

    // Animate legs when moving
    if (isMoving) {
      this.legAnimationTime += delta * 12;

      const leftLegPhase = Math.sin(this.legAnimationTime);
      const rightLegPhase = Math.sin(this.legAnimationTime + Math.PI);

      this.leftLeg.position.z = -0.08 + leftLegPhase * 0.15;
      this.leftLeg.position.y = 0.1 + Math.max(0, -leftLegPhase) * 0.05;

      this.rightLeg.position.z = -0.08 + rightLegPhase * 0.15;
      this.rightLeg.position.y = 0.1 + Math.max(0, -rightLegPhase) * 0.05;

      // Subtle arm sway during movement
      if (this.leftHandItem) {
        const armSwayOffset = Math.sin(this.legAnimationTime) * 0.02;
        this.leftArm.position.z = 0.1 + armSwayOffset;
        this.leftHandItem.mesh.position.z = 0.15 + armSwayOffset;
      }
    } else {
      // Return legs to default position
      this.leftLeg.position.lerp(new THREE.Vector3(-0.12, 0.1, -0.08), 0.2);
      this.rightLeg.position.lerp(new THREE.Vector3(0.12, 0.1, -0.08), 0.2);

      // Smooth return for arm and item
      if (this.leftHandItem) {
        this.leftArm.position.lerp(new THREE.Vector3(-0.15, 0.15, 0.1), 0.2);
        this.leftHandItem.mesh.position.lerp(
          new THREE.Vector3(-0.2, 0.15, 0.15),
          0.2
        );
      }
    }

    // Update item effects with proper world position
    if (this.leftHandItem) {
      const worldItemPos = new THREE.Vector3();
      this.leftHandItem.mesh.getWorldPosition(worldItemPos);
      for (const effect of this.leftHandItem.effects) {
        effect.update(
          delta,
          worldItemPos,
          new THREE.Vector2(mousePos.x, mousePos.y)
        );
      }
    }
  }

  public setPosition(position: THREE.Vector3): void {
    this.character.position.copy(position);
  }

  public getPosition(): THREE.Vector3 {
    return this.character.position;
  }
}
