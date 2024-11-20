import config from '../config/gameConfig.json';

class CookieModel {
    constructor(scene, app) {
        // Store references
        this.scene = scene;
        this.app = app;
        
        // Initialize rotation state
        this.isRotating = false;
        this.currentRotationZ = 0;
        this.baseRotationX = config.cookie.rotation.baseRotationX;

        // Load rotation config
        this.rotateSpeed = config.cookie.rotateSpeed;
        this.wobbleAmount = config.cookie.rotation.wobbleAmount;
        this.wobbleSpeed = config.cookie.rotation.wobbleSpeed;
        this.idleWobbleAmount = config.cookie.rotation.idleWobbleAmount;
        this.idleWobbleSpeed = config.cookie.rotation.idleWobbleSpeed;

        // Initialize cookie
        this.createTextures();
    }

    createTextures() {
        // Create cookie texture using SVG
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

        // Convert SVG to blob URL
        const svgBlob = new Blob([cookieSvg], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(svgBlob);

        // Create and load image
        this.cookieImage = new Image();
        this.cookieImage.src = url;

        // Create PlayCanvas texture when image loads
        this.cookieImage.onload = () => {
            this.cookieTexture = new pc.Texture(this.app.graphicsDevice, {
                width: this.cookieImage.width,
                height: this.cookieImage.height,
                format: pc.PIXELFORMAT_R8_G8_B8_A8
            });
            
            // Create canvas and draw image
            const context = document.createElement('canvas').getContext('2d');
            context.canvas.width = this.cookieImage.width;
            context.canvas.height = this.cookieImage.height;
            context.drawImage(this.cookieImage, 0, 0);
            
            // Set texture source and update if entity exists
            this.cookieTexture.setSource(context.canvas);
            if (this.entity && this.entity.model.material) {
                this.updateMaterial(this.entity.model.material);
            }
        };
    }

    create() {
        // Create cookie entity
        this.entity = new pc.Entity();
        
        // Add model component
        this.entity.addComponent('model', {
            type: 'cylinder',
            material: new pc.StandardMaterial()
        });

        // Apply texture if available
        if (this.cookieTexture) {
            this.updateMaterial(this.entity.model.material);
        }

        // Set initial rotation and scale
        this.entity.setLocalEulerAngles(this.baseRotationX, 0, 0);
        this.entity.setLocalScale(
            config.cookie.baseSize,
            config.cookie.thickness,
            config.cookie.baseSize
        );
        
        // Add to scene
        this.scene.addChild(this.entity);
        return this.entity;
    }

    updateMaterial(material) {
        material.diffuseMap = this.cookieTexture;
        material.diffuse = new pc.Color(1, 1, 1);
        material.specular = new pc.Color(0.2, 0.2, 0.2);
        material.shininess = 10;
        material.bumpiness = 0.5;
        material.update();
    }

    update(dt) {
        if (!this.entity) return;

        if (this.isRotating) {
            // Active rotation with wobble
            const wobble = Math.sin(this.currentRotationZ * Math.PI / 180 * this.wobbleSpeed) * this.wobbleAmount;
            this.currentRotationZ += this.rotateSpeed * dt;
            
            const rotationX = this.baseRotationX + wobble;
            this.entity.setLocalEulerAngles(rotationX, 0, this.currentRotationZ);
            
            // Keep rotation within 360 degrees
            if (this.currentRotationZ >= 360) {
                this.currentRotationZ -= 360;
                this.isRotating = false;
            }
        } else {
            // Idle animation
            const idleWobble = Math.sin(Date.now() / this.idleWobbleSpeed) * this.idleWobbleAmount;
            const rotationX = this.baseRotationX + idleWobble;
            this.entity.setLocalEulerAngles(rotationX, 0, this.currentRotationZ);
        }
    }

    startRotation() {
        this.isRotating = true;
    }

    getTexture() {
        return this.cookieTexture;
    }
}

export default CookieModel;