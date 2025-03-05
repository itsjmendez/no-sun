import * as THREE from 'three';
import { Player } from './entities/Player';
import { World } from './World';
import { InputManager } from './InputManager';

export class Game {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private player: Player;
  private world: World;
  private input: InputManager;

  constructor(canvas: HTMLCanvasElement) {
    // Initialize scene
    this.scene = new THREE.Scene();

    // Initialize camera with adjusted position and rotation
    this.camera = new THREE.PerspectiveCamera(
      60, // Reduced FOV for better perspective
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.camera.position.set(0, 8, 0); // Positioned directly above
    this.camera.rotation.x = -Math.PI / 2; // Looking straight down

    // Make sure canvas is ready before creating renderer
    if (!canvas) {
      throw new Error('Canvas element is not available');
    }

    // Initialize renderer
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
    });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = true;

    // Initialize input manager only after ensuring we're on client side
    if (typeof window !== 'undefined') {
      this.input = new InputManager();
    }

    // Initialize world
    this.world = new World(this.scene);

    // Initialize player at center
    this.player = new Player(this.scene, this.input, this.world);
    this.player.setPosition(new THREE.Vector3(0, 0, 0)); // Ensure player starts at center

    // Add ambient light
    const ambientLight = new THREE.AmbientLight(0x404040);
    this.scene.add(ambientLight);

    // Handle window resize
    window.addEventListener('resize', this.handleResize);
  }

  private handleResize = (): void => {
    if (this.camera && this.renderer) {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
  };

  public animate(): void {
    requestAnimationFrame(() => this.animate());

    const delta = 0.016; // Fixed time step

    // Update world
    this.world.update(delta);

    // Update player
    this.player.update(delta);

    // Update camera to follow player smoothly
    if (this.player) {
      const playerPos = this.player.getPosition();
      this.camera.position.x = playerPos.x;
      this.camera.position.z = playerPos.z;
      this.camera.position.y = 8; // Maintain constant height
    }

    // Render scene
    this.renderer.render(this.scene, this.camera);
  }

  public dispose(): void {
    // Clean up event listeners
    if (this.input) {
      this.input.dispose();
    }
    window.removeEventListener('resize', this.handleResize);
  }
}
