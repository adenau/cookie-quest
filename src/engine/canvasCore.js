import * as pc from 'playcanvas';

class CanvasCore {
    constructor() {
        this.initializeEngine();
    }

    initializeEngine() {
        this.canvas = document.createElement('canvas');
        
        this.canvas.style.position = 'fixed';
        this.canvas.style.width = '100vw';
        this.canvas.style.height = '100vh';
        this.canvas.style.left = '0';
        this.canvas.style.top = '0';
        this.canvas.style.zIndex = '1';
        document.body.appendChild(this.canvas);

        this.app = new pc.Application(this.canvas, {
            mouse: new pc.Mouse(this.canvas),
            touch: new pc.TouchDevice(this.canvas),
            graphicsDeviceOptions: {
                antialias: true,
                alpha: true
            }
        });

        this.handleResize();
        window.addEventListener('resize', () => this.handleResize());
        this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());
    }

    handleResize() {
        const dpr = window.devicePixelRatio;
        const width = window.innerWidth;
        const height = window.innerHeight;
        
        this.canvas.width = Math.floor(width * dpr);
        this.canvas.height = Math.floor(height * dpr);
        
        this.app.resizeCanvas(width, height);
        
        if (this.camera && this.camera.camera) {
            const aspect = width / height;
            this.camera.camera.aspectRatio = aspect;
            this.camera.camera.horizontalFov = true;
            this.camera.camera.fov = 45;
        }
    }

    createScene() {
        this.scene = new pc.Entity();
        this.app.root.addChild(this.scene);

        this.createCamera();
        this.createLight();
    }

    createCamera() {
        this.camera = new pc.Entity();
        this.camera.addComponent('camera', {
            clearColor: new pc.Color(0.1, 0.1, 0.1),
            nearClip: 0.1,
            farClip: 1000,
            fov: 45,
            aspectRatio: window.innerWidth / window.innerHeight,
            horizontalFov: true
        });
        this.camera.setPosition(0, 0, 10);
        this.scene.addChild(this.camera);
    }

    createLight() {
        this.light = new pc.Entity();
        this.light.addComponent('light', {
            type: 'directional',
            color: new pc.Color(1, 1, 1),
            castShadows: true,
            intensity: 2
        });
        this.light.setEulerAngles(45, 45, 0);
        this.scene.addChild(this.light);
    }

    start() {
        this.app.start();
    }
}

export default CanvasCore;