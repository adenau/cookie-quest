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

    setupEventListeners() {
        this.core.app.mouse.on(pc.EVENT_MOUSEDOWN, (event) => {
            const rect = this.core.canvas.getBoundingClientRect();
            const x = ((event.x - rect.left) / rect.width) * 2 - 1;
            const y = -((event.y - rect.top) / rect.height) * 2 + 1;
            
            if (Math.sqrt(x * x + y * y) <= 0.4) {
                this.cookie.startRotation();
                this.particles.emitParticles(this.cookie.getTexture());
                this.gameState.addCookies(this.gameState.cookiesPerClick);
            }
        });

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
                this.gameState.addCookies(this.gameState.autoClickers);
            }
        }
    }

    start() {
        this.core.start();
    }
}

export default CookieGame;