import * as pc from 'playcanvas';
import CanvasCore from '../engine/canvasCore';
import CookieModel from './cookieModel';
import ParticleSystem from './particleSystem';

class CookieGame {
    constructor(gameState) {
        this.gameState = gameState;
        this.core = new CanvasCore();
        this.core.createScene();
        
        this.cookie = new CookieModel(this.core.scene, this.core.app);
        this.cookie.create();
        
        this.particles = new ParticleSystem(this.core.scene, this.core.app);
        
        this.setupEventListeners();
        this.autoClickerTimer = 0;
    }

    checkClick(clientX, clientY) {
        const rect = this.core.canvas.getBoundingClientRect();
        
        // Convert client coordinates to canvas coordinates
        const x = clientX - rect.left;
        const y = clientY - rect.top;
        
        // Convert to normalized device coordinates (-1 to 1)
        const ndcX = (x / rect.width) * 2 - 1;
        const ndcY = -((y / rect.height) * 2 - 1);
        
        const clickRadius = Math.sqrt(ndcX * ndcX + ndcY * ndcY);
        
        if (clickRadius <= 0.4) {
            this.cookie.startRotation();
            this.particles.emitParticles(this.cookie.getTexture());
            this.gameState.addCookies(this.gameState.cookiesPerClick);
            return true;
        }
        return false;
    }

    setupEventListeners() {
        // Mouse click handling
        this.core.app.mouse.on(pc.EVENT_MOUSEDOWN, (event) => {
            this.checkClick(event.x, event.y);
        });

        // Touch handling - using standard DOM events for better mobile support
        this.core.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            if (e.touches.length > 0) {
                const touch = e.touches[0];
                this.checkClick(touch.clientX, touch.clientY);
            }
        }, { passive: false });

        // Prevent scrolling/zooming while touching the canvas
        this.core.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
        }, { passive: false });

        this.core.canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
        }, { passive: false });

        // Add touch-action CSS property
        this.core.canvas.style.touchAction = 'none';

        // Regular game update
        this.core.app.on('update', (dt) => this.update(dt));
    }

    update(dt) {
        this.cookie.update(dt);
        this.particles.update(dt);

        if (this.gameState.autoClickers > 0) {
            this.autoClickerTimer += dt;
            if (this.autoClickerTimer >= 1) {
                this.autoClickerTimer = 0;
                this.particles.emitParticles(this.cookie.getTexture(), this.gameState.autoClickers);
                this.gameState.addCookies(this.gameState.calculateFactoryProduction());
            }
        }
    }

    start() {
        this.core.start();
    }
}

export default CookieGame;