class CookieCanvas {
    constructor(gameState) {
        this.gameState = gameState;
        this.particles = [];
        this.initializeEngine();
        this.createTextures();
        this.createScene();
        this.setupEventListeners();
    }

    initializeEngine() {
        this.canvas = document.createElement('canvas');
        
        // Set canvas style for full screen
        this.canvas.style.position = 'fixed';
        this.canvas.style.width = '100vw';
        this.canvas.style.height = '100vh';
        this.canvas.style.left = '0';
        this.canvas.style.top = '0';
        this.canvas.style.zIndex = '1';
        document.body.appendChild(this.canvas);

        // Create PlayCanvas application with proper resolution
        this.app = new pc.Application(this.canvas, {
            mouse: new pc.Mouse(this.canvas),
            touch: new pc.TouchDevice(this.canvas),
            graphicsDeviceOptions: {
                antialias: true,
                alpha: true
            }
        });

        // Set up proper canvas resolution
        this.handleResize();
        window.addEventListener('resize', () => this.handleResize());

        // Prevent right-click menu
        this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());
    }

    handleResize() {
        // Get the display's DPI
        const dpr = window.devicePixelRatio;
        
        // Get actual size of the canvas
        const width = window.innerWidth;
        const height = window.innerHeight;
        
        // Set the canvas resolution to match the display
        this.canvas.width = Math.floor(width * dpr);
        this.canvas.height = Math.floor(height * dpr);
        
        // Resize the PlayCanvas application
        this.app.resizeCanvas(width, height);
        
        // Update the camera if it exists
        if (this.camera && this.camera.camera) {
            const aspect = width / height;
            this.camera.camera.aspectRatio = aspect;
            this.camera.camera.horizontalFov = true;
            this.camera.camera.fov = 45;
        }
    }

    createScene() {
        // Create scene
        this.scene = new pc.Entity();
        this.app.root.addChild(this.scene);

        // Create camera with proper FOV and aspect ratio
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

        // Create light
        this.light = new pc.Entity();
        this.light.addComponent('light', {
            type: 'directional',
            color: new pc.Color(1, 1, 1),
            castShadows: true,
            intensity: 2
        });
        this.light.setEulerAngles(45, 45, 0);
        this.scene.addChild(this.light);

        this.createCookie();
    }

    createTextures() {
        // Create cookie texture
        const cookieSvg = `<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
            <circle cx="256" cy="256" r="240" fill="#C4924B"/>
            <circle cx="256" cy="256" r="240" fill="#A67C3D" fill-opacity="0.3"/>
            <circle cx="156" cy="156" r="25" fill="#3A291C"/>
            <circle cx="356" cy="156" r="30" fill="#3A291C"/>
            <circle cx="256" cy="256" r="28" fill="#3A291C"/>
            <circle cx="156" cy="356" r="30" fill="#3A291C"/>
            <circle cx="356" cy="356" r="25" fill="#3A291C"/>
            <circle cx="106" cy="256" r="25" fill="#3A291C"/>
            <circle cx="406" cy="256" r="25" fill="#3A291C"/>
            <circle cx="206" cy="106" r="20" fill="#3A291C"/>
            <circle cx="306" cy="406" r="20" fill="#3A291C"/>
            <circle cx="156" cy="156" r="40" fill="#B3844E" fill-opacity="0.2"/>
            <circle cx="356" cy="156" r="45" fill="#B3844E" fill-opacity="0.2"/>
            <circle cx="256" cy="256" r="50" fill="#B3844E" fill-opacity="0.2"/>
            <circle cx="156" cy="356" r="45" fill="#B3844E" fill-opacity="0.2"/>
            <circle cx="356" cy="356" r="40" fill="#B3844E" fill-opacity="0.2"/>
        </svg>`;

        // Convert SVG to data URL
        const svgBlob = new Blob([cookieSvg], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(svgBlob);

        // Create image element
        this.cookieImage = new Image();
        this.cookieImage.src = url;

        // Create PlayCanvas texture when image loads
        this.cookieImage.onload = () => {
            this.cookieTexture = new pc.Texture(this.app.graphicsDevice, {
                width: this.cookieImage.width,
                height: this.cookieImage.height,
                format: pc.PIXELFORMAT_R8_G8_B8_A8
            });
            
            // Upload the image data to the texture
            const context = document.createElement('canvas').getContext('2d');
            context.canvas.width = this.cookieImage.width;
            context.canvas.height = this.cookieImage.height;
            context.drawImage(this.cookieImage, 0, 0);
            
            this.cookieTexture.setSource(context.canvas);
            
            // Update materials if they exist
            if (this.cookie && this.cookie.model.material) {
                this.updateCookieMaterial(this.cookie.model.material);
            }
        };
    }

    updateCookieMaterial(material) {
        material.diffuseMap = this.cookieTexture;
        material.diffuse = new pc.Color(1, 1, 1);
        material.specular = new pc.Color(0.2, 0.2, 0.2);
        material.shininess = 10;
        material.bumpiness = 0.5;
        material.update();
    }

    createCookie() {
        this.cookie = new pc.Entity();
        
        // Create cookie model (using cylinder for proper texture mapping)
        this.cookie.addComponent('model', {
            type: 'cylinder',
            material: new pc.StandardMaterial()
        });

        // Set up material
        const material = this.cookie.model.material;
        if (this.cookieTexture) {
            this.updateCookieMaterial(material);
        }

        // Adjust cookie size and shape
        this.cookie.setLocalScale(2, 0.3, 2);
        this.scene.addChild(this.cookie);

        this.isRotating = false;
        this.angle = 0;
        this.rotateSpeed = 90;
    }

    createParticle(x, y) {
        const particle = new pc.Entity();
        
        // Use plane instead of sphere for better texture visibility
        particle.addComponent('model', {
            type: 'plane',
            material: new pc.StandardMaterial()
        });

        // Apply cookie texture to particle
        if (this.cookieTexture) {
            const material = particle.model.material;
            material.diffuseMap = this.cookieTexture;
            material.diffuse = new pc.Color(1, 1, 1);
            material.opacity = 0.9;
            material.blendType = pc.BLEND_NORMAL;
            material.cull = pc.CULLFACE_NONE; // Show both sides
            material.update();
        }

        particle.setLocalScale(0.3, 0.3, 0.3);
        particle.setPosition(0, 0, 0);
        
        this.scene.addChild(particle);
        
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 2 + 3;
        
        particle.velocity = new pc.Vec3(
            Math.cos(angle) * speed,
            Math.sin(angle) * speed,
            0
        );
        
        // Add rotation to particles
        particle.spinSpeed = (Math.random() - 0.5) * 10;
        particle.currentRotation = Math.random() * 360;
        
        particle.lifetime = 1.5;
        particle.timeAlive = 0;
        particle.initialScale = 0.3;
        
        this.particles.push(particle);
    }

    updateParticles(dt) {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            
            const pos = particle.getPosition();
            pos.x += particle.velocity.x * dt;
            pos.y += particle.velocity.y * dt;
            particle.setPosition(pos);
            
            // Update particle rotation
            particle.currentRotation += particle.spinSpeed;
            particle.setEulerAngles(0, 0, particle.currentRotation);
            
            particle.timeAlive += dt;
            
            const lifePercent = particle.timeAlive / particle.lifetime;
            const scale = particle.initialScale * (1 - Math.pow(lifePercent, 2));
            particle.setLocalScale(scale, scale, scale);
            
            if (particle.timeAlive >= particle.lifetime) {
                particle.destroy();
                this.particles.splice(i, 1);
            }
        }
    }

    checkCookieClick(x, y) {
        // Convert screen coordinates to normalized device coordinates (-1 to 1)
        const rect = this.canvas.getBoundingClientRect();
        const ndcX = ((x - rect.left) / rect.width) * 2 - 1;
        const ndcY = -((y - rect.top) / rect.height) * 2 + 1;
        
        // Simple radius check for cookie click
        const clickRadius = Math.sqrt(ndcX * ndcX + ndcY * ndcY);
        return clickRadius <= 0.4; // Adjust this value to change clickable area
    }

    setupEventListeners() {
        // Handle mouse clicks
        this.app.mouse.on(pc.EVENT_MOUSEDOWN, (event) => {
            if (this.checkCookieClick(event.x, event.y)) {
                this.isRotating = true;
                
                // Create particles
                for (let i = 0; i < 8; i++) {
                    this.createParticle(0, 0);
                }
                
                this.gameState.addCookies(this.gameState.cookiesPerClick);
            }
        });

        // Handle touch events for mobile
        this.app.touch.on(pc.EVENT_TOUCHSTART, (event) => {
            if (this.checkCookieClick(event.touches[0].x, event.touches[0].y)) {
                this.isRotating = true;
                
                // Create particles
                for (let i = 0; i < 8; i++) {
                    this.createParticle(0, 0);
                }
                
                this.gameState.addCookies(this.gameState.cookiesPerClick);
            }
        });

        this.app.on('update', (dt) => this.update(dt));
    }

    update(dt) {
        if (this.isRotating) {
            this.angle += this.rotateSpeed * dt;
            this.cookie.setLocalEulerAngles(this.angle, 0, 0);
            if (this.angle >= 360) {
                this.angle = 0;
                this.isRotating = false;
            }
        }

        this.updateParticles(dt);

        if (this.gameState.autoClickers > 0) {
            this.autoClickerTimer = (this.autoClickerTimer || 0) + dt;
            if (this.autoClickerTimer >= 1) {
                this.autoClickerTimer = 0;
                
                for (let i = 0; i < this.gameState.autoClickers; i++) {
                    this.createParticle(0, 0);
                }
                this.gameState.addCookies(this.gameState.autoClickers);
            }
        }
    }

    start() {
        this.app.start();
    }
}

export default CookieCanvas;

