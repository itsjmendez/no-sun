export class InputManager {
  private keys: { [key: string]: boolean } = {};
  private mousePosition: { x: number; y: number } = { x: 0, y: 0 };

  constructor() {
    // Wait for window to be defined (client-side only)
    if (typeof window !== 'undefined') {
      this.setupEventListeners();
    }
  }

  private setupEventListeners(): void {
    // Keyboard events
    window.addEventListener('keydown', (event) => {
      this.keys[event.key.toLowerCase()] = true;
    });

    window.addEventListener('keyup', (event) => {
      this.keys[event.key.toLowerCase()] = false;
    });

    // Mouse events
    window.addEventListener('mousemove', (event) => {
      // Calculate normalized mouse position (-1 to 1)
      this.mousePosition.x = (event.clientX / window.innerWidth) * 2 - 1;
      this.mousePosition.y = -(event.clientY / window.innerHeight) * 2 + 1;
    });
  }

  public isKeyPressed(key: string): boolean {
    return this.keys[key.toLowerCase()] || false;
  }

  public getMousePosition(): { x: number; y: number } {
    return this.mousePosition;
  }

  // Clean up method
  public dispose(): void {
    if (typeof window !== 'undefined') {
      window.removeEventListener('keydown', this.handleKeyDown);
      window.removeEventListener('keyup', this.handleKeyUp);
      window.removeEventListener('mousemove', this.handleMouseMove);
    }
  }

  private handleKeyDown = (event: KeyboardEvent): void => {
    this.keys[event.key.toLowerCase()] = true;
  };

  private handleKeyUp = (event: KeyboardEvent): void => {
    this.keys[event.key.toLowerCase()] = false;
  };

  private handleMouseMove = (event: MouseEvent): void => {
    this.mousePosition.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.mousePosition.y = -(event.clientY / window.innerHeight) * 2 + 1;
  };
}
