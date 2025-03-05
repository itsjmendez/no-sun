import * as THREE from 'three';

export class World {
  private scene: THREE.Scene;
  private worldObjects: THREE.Mesh[] = [];
  private colliders: THREE.Box3[] = [];

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.initializeWorld();
  }

  private initializeWorld() {
    // Create ground
    const groundGeometry = new THREE.PlaneGeometry(100, 100);
    const groundMaterial = new THREE.MeshPhongMaterial({
      color: 0x3a3a3a,
      side: THREE.DoubleSide,
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = Math.PI / 2;
    ground.receiveShadow = true;
    this.scene.add(ground);

    // Add some walls and obstacles
    this.addWall(new THREE.Vector3(-5, 0.5, 0), new THREE.Vector3(0.5, 1, 4));
    this.addWall(new THREE.Vector3(5, 0.5, 0), new THREE.Vector3(0.5, 1, 4));
    this.addWall(new THREE.Vector3(0, 0.5, 5), new THREE.Vector3(10, 1, 0.5));
    this.addWall(new THREE.Vector3(0, 0.5, -5), new THREE.Vector3(10, 1, 0.5));

    // Add some pillars
    this.addPillar(new THREE.Vector3(-3, 0.75, -3));
    this.addPillar(new THREE.Vector3(3, 0.75, -3));
    this.addPillar(new THREE.Vector3(-3, 0.75, 3));
    this.addPillar(new THREE.Vector3(3, 0.75, 3));

    // Add some crates
    this.addCrate(new THREE.Vector3(-2, 0.3, 0));
    this.addCrate(new THREE.Vector3(2, 0.3, 0));
  }

  private addWall(position: THREE.Vector3, size: THREE.Vector3) {
    const geometry = new THREE.BoxGeometry(size.x, size.y, size.z);
    const material = new THREE.MeshPhongMaterial({ color: 0x666666 });
    const wall = new THREE.Mesh(geometry, material);
    wall.position.copy(position);
    wall.castShadow = true;
    wall.receiveShadow = true;
    this.scene.add(wall);
    this.worldObjects.push(wall);

    // Add collision box
    const collider = new THREE.Box3().setFromObject(wall);
    this.colliders.push(collider);
  }

  private addPillar(position: THREE.Vector3) {
    const geometry = new THREE.CylinderGeometry(0.3, 0.3, 1.5, 8);
    const material = new THREE.MeshPhongMaterial({ color: 0x8b4513 });
    const pillar = new THREE.Mesh(geometry, material);
    pillar.position.copy(position);
    pillar.castShadow = true;
    pillar.receiveShadow = true;
    this.scene.add(pillar);
    this.worldObjects.push(pillar);

    // Add collision box
    const collider = new THREE.Box3().setFromObject(pillar);
    this.colliders.push(collider);
  }

  private addCrate(position: THREE.Vector3) {
    const geometry = new THREE.BoxGeometry(0.6, 0.6, 0.6);
    const material = new THREE.MeshPhongMaterial({ color: 0x8b4513 });
    const crate = new THREE.Mesh(geometry, material);
    crate.position.copy(position);
    crate.castShadow = true;
    crate.receiveShadow = true;
    this.scene.add(crate);
    this.worldObjects.push(crate);

    // Add collision box
    const collider = new THREE.Box3().setFromObject(crate);
    this.colliders.push(collider);
  }

  public checkCollision(
    playerPosition: THREE.Vector3,
    radius: number
  ): boolean {
    // Create a bounding sphere for the player
    const playerSphere = new THREE.Sphere(playerPosition, radius);

    // Check collision with all objects
    for (const collider of this.colliders) {
      if (this.sphereIntersectsBox(playerSphere, collider)) {
        return true;
      }
    }
    return false;
  }

  private sphereIntersectsBox(sphere: THREE.Sphere, box: THREE.Box3): boolean {
    // Get box closest point to sphere center by clamping
    const x = Math.max(box.min.x, Math.min(sphere.center.x, box.max.x));
    const y = Math.max(box.min.y, Math.min(sphere.center.y, box.max.y));
    const z = Math.max(box.min.z, Math.min(sphere.center.z, box.max.z));

    // Get squared distance between closest point and sphere center
    const distance = new THREE.Vector3(x, y, z).distanceToSquared(
      sphere.center
    );

    // Sphere and box intersect if squared distance is less than squared radius
    return distance < sphere.radius * sphere.radius;
  }

  public update(delta: number) {
    // Update collider positions if objects move
    this.colliders.forEach((collider, index) => {
      collider.setFromObject(this.worldObjects[index]);
    });
  }
}
