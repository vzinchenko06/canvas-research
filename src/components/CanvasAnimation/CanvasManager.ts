export const SQUARE_SIZE = 200;
export const MIN_DISTANCE = 50;

export const SQUARE_LIFETIME = 3000; // Lifetime in milliseconds (3 seconds)
export const RANDOM_SQUARE_INTERVAL = 600; // Interval in milliseconds for random squares (1 second)
export const IMAGE_ROTATION_INTERVAL = 3000; // Interval in milliseconds for image rotation (3 seconds)

export const FILL_STYLE = "#FFFFFF"; // Fill canvas with white color

export type BackgroundType = "img" | "video";
export type BackgroundSource = { type: BackgroundType; src: string };
export type BackgroundElement = HTMLImageElement | HTMLVideoElement;
export type VisualSquare = { x: number; y: number; size: number; created: number; image: BackgroundElement };

export default class CanvasManager {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  squares: Array<VisualSquare>;
  animationFrameId: number | undefined;
  randomSquareIntervalId: number | null;
  imageRotationIntervalId: number | null;
  lastMouseX: number | null;
  lastMouseY: number | null;
  handleMouseMove: (event: MouseEvent) => void;
  backgrounds: BackgroundElement[];
  currentImageIndex: number;

  constructor(canvas: HTMLCanvasElement, backgroundSources: BackgroundSource[]) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
    this.squares = [];
    this.lastMouseX = null;
    this.lastMouseY = null;
    this.randomSquareIntervalId = null;
    this.imageRotationIntervalId = null;
    this.handleMouseMove = this._handleMouseMove.bind(this);
    this.backgrounds = backgroundSources.map(this._toBackgroundElement.bind(this));
    this.currentImageIndex = 0;
    this.backgrounds[0].onload = () => {
      this.start();
    };
  }

  private _toBackgroundElement(source: BackgroundSource): BackgroundElement {
    if (source.type === "video") {
      const video = document.createElement("video");
      video.src = source.src;
      video.loop = true;
      video.play();
      return video;
    }
    const img = new Image();
    img.src = source.src;
    return img;
  }

  start() {
    this.canvas.addEventListener("mousemove", this.handleMouseMove);
    this.animationFrameId = requestAnimationFrame(this.render.bind(this));
    this.randomSquareIntervalId = window.setInterval(this.createRandomSquare.bind(this), RANDOM_SQUARE_INTERVAL);
    this.imageRotationIntervalId = window.setInterval(this.rotateImage.bind(this), IMAGE_ROTATION_INTERVAL);
  }

  drawSquare(x: number, y: number) {
    return { x, y, size: SQUARE_SIZE, created: Date.now(), image: this.backgrounds[this.currentImageIndex] };
  }

  private _handleMouseMove(event: MouseEvent) {
    const rect = this.canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    if (this.lastMouseX === null || this.lastMouseY === null) {
      this.lastMouseX = x;
      this.lastMouseY = y;
      this.squares.push(this.drawSquare(x, y));
    } else {
      const distance = Math.sqrt(Math.pow(x - this.lastMouseX, 2) + Math.pow(y - this.lastMouseY, 2));
      if (distance >= MIN_DISTANCE) {
        this.lastMouseX = x;
        this.lastMouseY = y;
        this.squares.push(this.drawSquare(x, y));
      }
    }
  }

  createRandomSquare() {
    const x = Math.random() * (this.canvas.width - SQUARE_SIZE);
    const y = Math.random() * (this.canvas.height - SQUARE_SIZE);
    this.squares.push(this.drawSquare(x, y));
  }

  rotateImage() {
    this.currentImageIndex = (this.currentImageIndex + 1) % this.backgrounds.length;
  }

  draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.fillStyle = FILL_STYLE;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    const now = Date.now();
    this.squares = this.squares.filter((sq) => now - sq.created < SQUARE_LIFETIME);
    this.squares.forEach((sq) => {
      this.ctx.drawImage(sq.image, sq.x, sq.y, sq.size, sq.size, sq.x, sq.y, sq.size, sq.size);
    });
  }

  render() {
    this.draw();
    this.animationFrameId = requestAnimationFrame(this.render.bind(this));
  }

  destroy() {
    if (typeof this.animationFrameId === "number") {
      cancelAnimationFrame(this.animationFrameId);
    }
    if (this.randomSquareIntervalId !== null) {
      clearInterval(this.randomSquareIntervalId);
    }
    if (this.imageRotationIntervalId !== null) {
      clearInterval(this.imageRotationIntervalId);
    }
    this.canvas.removeEventListener("mousemove", this.handleMouseMove);
  }
}
