import * as THREE from 'three';

export interface ItemEffect {
  update(delta: number, position: THREE.Vector3, mousePos: THREE.Vector2): void;
}

export class Item {
  public mesh: THREE.Group;
  public effects: ItemEffect[];

  constructor() {
    this.mesh = new THREE.Group();
    this.effects = [];
  }
}
