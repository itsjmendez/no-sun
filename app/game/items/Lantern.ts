import * as THREE from 'three';
import { Item, ItemEffect } from './Item';

class LightEffect implements ItemEffect {
  private light: THREE.SpotLight;
  private target: THREE.Object3D;

  constructor(scene: THREE.Scene) {
    // Create main lantern light with enhanced properties
    this.light = new THREE.SpotLight(0xfff2d9, 3); // Warmer color and stronger intensity
    this.light.angle = Math.PI / 2.5; // Wider angle
    this.light.penumbra = 0.4; // Softer edges
    this.light.decay = 1.2; // Slower light falloff
    this.light.distance = 35; // Greater distance
    this.light.castShadow = true;

    // Improve shadow quality
    this.light.shadow.mapSize.width = 2048;
    this.light.shadow.mapSize.height = 2048;
    this.light.shadow.camera.near = 0.1;
    this.light.shadow.camera.far = 40;
    this.light.shadow.bias = -0.0005;
    this.light.shadow.normalBias = 0.02;

    scene.add(this.light);

    this.target = new THREE.Object3D();
    scene.add(this.target);
    this.light.target = this.target;
  }

  update(delta: number, position: THREE.Vector3, mousePos: THREE.Vector2) {
    // Position light slightly above and forward from the lantern
    this.light.position.copy(position).add(new THREE.Vector3(0, 1.2, 0));

    // Calculate target position with improved depth
    const targetPos = new THREE.Vector3(
      position.x - mousePos.x * -15, // Increased range
      0,
      position.z + mousePos.y * -15 // Increased range
    );
    this.target.position.copy(targetPos);
  }
}

export class Lantern extends Item {
  constructor(scene: THREE.Scene) {
    super();

    // Create lantern body with metallic finish
    const lanternBody = new THREE.Mesh(
      new THREE.CylinderGeometry(0.05, 0.05, 0.1, 8),
      new THREE.MeshPhongMaterial({
        color: 0x3a3a3a,
        emissive: 0x222222,
        shininess: 60,
      })
    );
    lanternBody.rotation.x = Math.PI / 2;
    this.mesh.add(lanternBody);

    // Enhanced lantern glass with stronger glow
    const lanternGlass = new THREE.Mesh(
      new THREE.CylinderGeometry(0.04, 0.04, 0.08, 8),
      new THREE.MeshPhongMaterial({
        color: 0xfff2d9,
        emissive: 0xfff2d9,
        emissiveIntensity: 1,
        transparent: true,
        opacity: 0.7,
      })
    );
    lanternGlass.rotation.x = Math.PI / 2;
    this.mesh.add(lanternGlass);

    // Add multiple point lights for enhanced local illumination
    const glowIntense = new THREE.PointLight(0xfff2d9, 0.8, 2);
    this.mesh.add(glowIntense);

    const glowAmbient = new THREE.PointLight(0xfff2d9, 0.4, 4);
    glowAmbient.position.set(0, 0.5, 0);
    this.mesh.add(glowAmbient);

    // Add main lighting effect
    this.effects.push(new LightEffect(scene));
  }
}
