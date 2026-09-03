/**
 * Vegas Roulette - Hardware-Accelerated Canvas Wheel & Ball Physics Engine
 * Real 60FPS physics animation with ball orbit, track drop, fret bounce, and pocket settling.
 */

import { GAME_CONFIG } from '../config/gameConfig.js';
import { RouletteRules } from './RouletteRules.js';

export class WheelRenderer {
  /**
   * @param {HTMLCanvasElement} canvas
   * @param {Object} options
   */
  constructor(canvas, options = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.options = {
      spinDuration: options.spinDuration || 4200,
      onBallBounce: options.onBallBounce || null,
      onSpinComplete: options.onSpinComplete || null,
      ...options
    };

    this.wheelNumbers = GAME_CONFIG.wheelNumbers.map(n => String(n));
    this.totalPockets = this.wheelNumbers.length; // 38
    this.pocketAngle = (Math.PI * 2) / this.totalPockets;

    // Animation state
    this.isSpinning = false;
    this.animationFrameId = null;
    this.startTime = 0;
    this.duration = this.options.spinDuration;

    // Wheel and ball rotational positions (radians)
    this.wheelAngle = 0;
    this.ballAngle = 0;
    this.ballRadiusRatio = 0.88; // Distance from center
    this.targetNumber = '0';

    // Velocity and trajectory variables
    this.wheelStartAngle = 0;
    this.wheelTotalRotations = 0;
    this.ballStartAngle = 0;
    this.ballTotalRotations = 0;

    // Last fret click tracker
    this.lastFretClickAngle = 0;

    this.resizeObserver = null;
    this.setupResize();
    this.draw();
  }

  setupResize() {
    const handleResize = () => {
      const rect = this.canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      const size = Math.min(rect.width || 360, rect.height || 360);
      
      this.canvas.width = Math.round(size * dpr);
      this.canvas.height = Math.round(size * dpr);
      this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      this.size = size;
      this.draw();
    };

    this.resizeObserver = new ResizeObserver(handleResize);
    this.resizeObserver.observe(this.canvas.parentElement || this.canvas);
    handleResize();
  }

  destroy() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
  }

  /**
   * Calculate exact wheel angle so targetNumber lands at 12 o'clock pointer (top: -Math.PI / 2)
   */
  getTargetWheelAngle(targetNum) {
    const idx = this.wheelNumbers.indexOf(String(targetNum));
    if (idx === -1) return 0;
    // Each pocket center: index * pocketAngle
    // Top pointer is at -Math.PI / 2
    const targetPocketCenter = idx * this.pocketAngle + this.pocketAngle / 2;
    return -Math.PI / 2 - targetPocketCenter;
  }

  /**
   * Start authentic physical spin to designated winning number
   * @param {string|number} winningNumber
   * @param {number} customDuration
   */
  spinTo(winningNumber, customDuration = null) {
    if (this.isSpinning) return;

    this.targetNumber = String(winningNumber);
    this.duration = customDuration || this.options.spinDuration;
    this.isSpinning = true;

    const baseWheelRotations = 5 + Math.floor(Math.random() * 2); // 5-6 full spins
    const baseBallRotations = 8 + Math.floor(Math.random() * 2);  // 8-9 reverse spins

    const targetBaseAngle = this.getTargetWheelAngle(this.targetNumber);
    // Normalize target angle to be greater than current angle
    const currentWheelMod = this.wheelAngle % (Math.PI * 2);
    let deltaWheel = (targetBaseAngle - currentWheelMod) % (Math.PI * 2);
    if (deltaWheel < 0) deltaWheel += Math.PI * 2;
    this.wheelTotalRotations = baseWheelRotations * Math.PI * 2 + deltaWheel;

    this.wheelStartAngle = this.wheelAngle;
    this.ballStartAngle = this.ballAngle;
    this.ballTotalRotations = -(baseBallRotations * Math.PI * 2 + Math.random() * 1.5);

    this.startTime = performance.now();
    this.lastFretClickAngle = 0;

    const animate = (currentTime) => {
      const elapsed = currentTime - this.startTime;
      const progress = Math.min(1, elapsed / this.duration);

      // Deceleration curves (Cubic & Quintic)
      const easeOutWheel = 1 - Math.pow(1 - progress, 3);
      const easeOutBall = 1 - Math.pow(1 - progress, 4);

      // Current wheel rotation
      this.wheelAngle = this.wheelStartAngle + this.wheelTotalRotations * easeOutWheel;

      // Ball path physics:
      // Early phase (0 to 0.65): ball spins on outer rim
      // Mid phase (0.65 to 0.85): ball drops down into the pockets track
      // Final phase (0.85 to 1.0): ball bounces on frets and locks with wheel pocket
      if (progress < 0.65) {
        this.ballRadiusRatio = 0.88;
        this.ballAngle = this.ballStartAngle + this.ballTotalRotations * easeOutBall;
      } else if (progress < 0.85) {
        const dropProgress = (progress - 0.65) / 0.20;
        this.ballRadiusRatio = 0.88 - (0.88 - 0.66) * dropProgress;
        this.ballAngle = this.ballStartAngle + this.ballTotalRotations * easeOutBall;

        // Fret click trigger
        const relativeDiff = Math.abs(this.ballAngle - this.wheelAngle);
        if (Math.abs(relativeDiff - this.lastFretClickAngle) > this.pocketAngle * 1.5) {
          this.lastFretClickAngle = relativeDiff;
          if (this.options.onBallBounce) this.options.onBallBounce();
        }
      } else {
        // Ball settles into target pocket
        const settleProgress = (progress - 0.85) / 0.15;
        // Target angle is top pointer (-Math.PI / 2)
        const topAngle = -Math.PI / 2;
        // Introduce small damped bounce
        const bounce = Math.sin(settleProgress * Math.PI * 4) * (1 - settleProgress) * 0.03;
        this.ballRadiusRatio = 0.66 + bounce;
        this.ballAngle = topAngle + (Math.sin(settleProgress * Math.PI * 2) * (1 - settleProgress) * 0.08);

        if (settleProgress > 0.3 && settleProgress < 0.35 && this.options.onBallBounce) {
          this.options.onBallBounce();
        }
      }

      this.draw();

      if (progress < 1) {
        this.animationFrameId = requestAnimationFrame(animate);
      } else {
        this.isSpinning = false;
        // Lock ball exactly at winning pointer
        this.ballAngle = -Math.PI / 2;
        this.ballRadiusRatio = 0.66;
        this.draw(true); // Draw with winning highlight

        if (this.options.onSpinComplete) {
          this.options.onSpinComplete(this.targetNumber);
        }
      }
    };

    this.animationFrameId = requestAnimationFrame(animate);
  }

  /**
   * Draw the entire roulette wheel canvas
   * @param {boolean} highlightWinner
   */
  draw(highlightWinner = false) {
    const ctx = this.ctx;
    const size = this.size || 360;
    const center = size / 2;
    const radius = center * 0.94;

    ctx.clearRect(0, 0, size, size);
    ctx.save();
    ctx.translate(center, center);

    // 1. Outer Mahogany / Dark Walnut Wood Rim
    const rimGrad = ctx.createRadialGradient(0, 0, radius * 0.85, 0, 0, radius);
    rimGrad.addColorStop(0, '#1c0f0a');
    rimGrad.addColorStop(0.5, '#3a1e12');
    rimGrad.addColorStop(0.85, '#170b07');
    rimGrad.addColorStop(1, '#0c0503');
    ctx.fillStyle = rimGrad;
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.fill();

    // 2. Brass Inlay Rings
    ctx.strokeStyle = '#d4af37';
    ctx.lineWidth = Math.max(2, radius * 0.015);
    ctx.beginPath();
    ctx.arc(0, 0, radius * 0.96, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = 'rgba(255, 215, 0, 0.4)';
    ctx.beginPath();
    ctx.arc(0, 0, radius * 0.88, 0, Math.PI * 2);
    ctx.stroke();

    // 3. Ball Track (Smooth deep trough)
    const trackGrad = ctx.createRadialGradient(0, 0, radius * 0.78, 0, 0, radius * 0.88);
    trackGrad.addColorStop(0, '#111814');
    trackGrad.addColorStop(1, '#080d0a');
    ctx.fillStyle = trackGrad;
    ctx.beginPath();
    ctx.arc(0, 0, radius * 0.88, 0, Math.PI * 2);
    ctx.fill();

    // 4. Rotating Wheel Head
    ctx.save();
    ctx.rotate(this.wheelAngle);

    // Number pockets ring background
    const innerPocketRadius = radius * 0.58;
    const outerPocketRadius = radius * 0.76;

    for (let i = 0; i < this.totalPockets; i++) {
      const numStr = this.wheelNumbers[i];
      const color = RouletteRules.getNumberColor(numStr);
      const startAngle = i * this.pocketAngle;
      const endAngle = startAngle + this.pocketAngle;

      ctx.beginPath();
      ctx.arc(0, 0, outerPocketRadius, startAngle, endAngle);
      ctx.arc(0, 0, innerPocketRadius, endAngle, startAngle, true);
      ctx.closePath();

      // Pocket background color
      if (color === 'red') {
        ctx.fillStyle = '#b91c1c';
      } else if (color === 'black') {
        ctx.fillStyle = '#18181b';
      } else {
        ctx.fillStyle = '#15803d'; // Green for 0 and 00
      }
      ctx.fill();

      // Metallic pocket divider fret
      ctx.strokeStyle = '#d4af37';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(Math.cos(startAngle) * innerPocketRadius, Math.sin(startAngle) * innerPocketRadius);
      ctx.lineTo(Math.cos(startAngle) * outerPocketRadius, Math.sin(startAngle) * outerPocketRadius);
      ctx.stroke();

      // Number text
      ctx.save();
      const midAngle = startAngle + this.pocketAngle / 2;
      ctx.rotate(midAngle);
      ctx.translate(outerPocketRadius * 0.88, 0);
      ctx.rotate(Math.PI / 2);

      ctx.fillStyle = '#ffffff';
      ctx.font = `bold ${Math.max(10, Math.round(radius * 0.055))}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(numStr, 0, 0);
      ctx.restore();
    }

    // Inner brass cone & spokes
    const coneGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, innerPocketRadius);
    coneGrad.addColorStop(0, '#ffd97d');
    coneGrad.addColorStop(0.35, '#c59b27');
    coneGrad.addColorStop(0.8, '#58410e');
    coneGrad.addColorStop(1, '#271c04');
    ctx.fillStyle = coneGrad;
    ctx.beginPath();
    ctx.arc(0, 0, innerPocketRadius, 0, Math.PI * 2);
    ctx.fill();

    // 8 Classical spokes
    ctx.strokeStyle = 'rgba(255, 235, 150, 0.7)';
    ctx.lineWidth = 2.5;
    for (let s = 0; s < 8; s++) {
      const sa = (s * Math.PI) / 4;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(sa) * innerPocketRadius * 0.9, Math.sin(sa) * innerPocketRadius * 0.9);
      ctx.stroke();
    }

    // Center Chrome / Brass Turret
    const turretRadius = innerPocketRadius * 0.35;
    const turretGrad = ctx.createRadialGradient(-turretRadius * 0.3, -turretRadius * 0.3, 2, 0, 0, turretRadius);
    turretGrad.addColorStop(0, '#ffffff');
    turretGrad.addColorStop(0.4, '#d4af37');
    turretGrad.addColorStop(0.85, '#855b11');
    turretGrad.addColorStop(1, '#3b2503');
    ctx.fillStyle = turretGrad;
    ctx.beginPath();
    ctx.arc(0, 0, turretRadius, 0, Math.PI * 2);
    ctx.fill();

    // Turret center cap
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(-turretRadius * 0.2, -turretRadius * 0.2, turretRadius * 0.15, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore(); // end rotating wheel head

    // 5. Draw the Ball (Ivory Sphere with 3D gradient and shadow)
    const ballX = Math.cos(this.ballAngle) * (radius * this.ballRadiusRatio);
    const ballY = Math.sin(this.ballAngle) * (radius * this.ballRadiusRatio);
    const ballR = Math.max(5, radius * 0.038);

    // Ball soft shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.beginPath();
    ctx.arc(ballX + 2, ballY + 3, ballR, 0, Math.PI * 2);
    ctx.fill();

    // Ball body
    const ballGrad = ctx.createRadialGradient(
      ballX - ballR * 0.35,
      ballY - ballR * 0.35,
      1,
      ballX,
      ballY,
      ballR
    );
    ballGrad.addColorStop(0, '#ffffff');
    ballGrad.addColorStop(0.65, '#f4f4f5');
    ballGrad.addColorStop(1, '#a1a1aa');

    ctx.fillStyle = ballGrad;
    ctx.beginPath();
    ctx.arc(ballX, ballY, ballR, 0, Math.PI * 2);
    ctx.fill();

    // 6. Static Top Indicator Marker (Golden Diamond Pointer at 12 o'clock)
    ctx.save();
    ctx.translate(0, -radius * 0.89);
    ctx.fillStyle = '#f59e0b';
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, 8);
    ctx.lineTo(-7, -8);
    ctx.lineTo(7, -8);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    // 7. Winning Pocket Spotlight Flare (when settled)
    if (highlightWinner && !this.isSpinning) {
      ctx.save();
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 3.5;
      ctx.shadowColor = '#f59e0b';
      ctx.shadowBlur = 15;
      ctx.beginPath();
      ctx.arc(0, -radius * 0.67, ballR * 2.8, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    ctx.restore();
  }
}
