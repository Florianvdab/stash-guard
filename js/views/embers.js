const EMBER_COUNT = 36;
const EMBER_COLOR = '255 120 40';

// Embers drifting up behind the page. Purely decorative; skipped when motion is reduced.
export function startEmbers(canvas) {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  new EmberField(canvas).start();
}

class EmberField {
  #canvas;
  #context;
  #embers;

  constructor(canvas) {
    this.#canvas = canvas;
    this.#context = canvas.getContext('2d');
    this.#resize();
    addEventListener('resize', () => this.#resize());
    this.#embers = Array.from({ length: EMBER_COUNT }, () => this.#spawn(Math.random() * innerHeight));
  }

  start() {
    const frame = () => {
      this.#embers = this.#embers.map((ember) => (ember.y < -10 ? this.#spawn(innerHeight + 10) : drift(ember)));
      this.#draw();
      requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  }

  #spawn(y) {
    return {
      x: Math.random() * innerWidth,
      y,
      radius: 0.6 + Math.random() * 1.4,
      speed: 0.15 + Math.random() * 0.45,
      sway: Math.random() * Math.PI * 2,
    };
  }

  #resize() {
    const ratio = devicePixelRatio || 1;
    this.#canvas.width = innerWidth * ratio;
    this.#canvas.height = innerHeight * ratio;
    this.#context.setTransform(ratio, 0, 0, ratio, 0, 0);
  }

  #draw() {
    const context = this.#context;
    context.clearRect(0, 0, innerWidth, innerHeight);
    for (const ember of this.#embers) {
      const fade = Math.min(1, ember.y / innerHeight + 0.15);
      context.beginPath();
      context.arc(ember.x, ember.y, ember.radius, 0, Math.PI * 2);
      context.fillStyle = `rgb(${EMBER_COLOR} / ${0.55 * fade})`;
      context.fill();
    }
  }
}

function drift(ember) {
  return { ...ember, y: ember.y - ember.speed, x: ember.x + Math.sin(ember.y / 60 + ember.sway) * 0.25 };
}
