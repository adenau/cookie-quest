import * as pc from 'playcanvas';
import config from '../config/gameConfig.json';

class ParticleSystem {
    constructor(scene, app) {
        this.scene = scene;
        this.app = app;
        this.particles = [];
    }

    createParticle(cookieTexture, position = { x: 0, y: 0, z: 0 }) {
        const particle = new pc.Entity();
        
        particle.addComponent('model', {
            type: 'plane',
            material: new pc.StandardMaterial()
        });

        if (cookieTexture) {
            const material = particle.model.material;
            material.diffuseMap = cookieTexture;
            material.diffuse = new pc.Color(1, 1, 1);
            material.opacity = 0.9;
            material.blendType = pc.BLEND_NORMAL;
            material.cull = pc.CULLFACE_NONE;
            material.update();
        }

        const size = config.particles.size;
        particle.setLocalScale(size, size, size);
        particle.setPosition(position.x, position.y, position.z);
        
        this.scene.addChild(particle);
        
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 
            (config.particles.maxSpeed - config.particles.minSpeed) + 
            config.particles.minSpeed;
        
        particle.velocity = new pc.Vec3(
            Math.cos(angle) * speed,
            Math.sin(angle) * speed,
            0
        );
        
        particle.spinSpeed = (Math.random() - 0.5) * 10;
        particle.currentRotation = Math.random() * 360;
        particle.lifetime = config.particles.lifetime;
        particle.timeAlive = 0;
        particle.initialScale = config.particles.size;
        
        this.particles.push(particle);
    }

    update(dt) {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            
            const pos = particle.getPosition();
            pos.x += particle.velocity.x * dt;
            pos.y += particle.velocity.y * dt;
            particle.setPosition(pos);
            
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

    emitParticles(cookieTexture, count = 8) {
        for (let i = 0; i < count; i++) {
            this.createParticle(cookieTexture);
        }
    }
}

export default ParticleSystem;  