/**
 * Polymorphic Vehicle 3D Model Architecture (OOP)
 */

// Base Class (Abstract Concept)
class Vehicle3D {
    constructor(categoryName, glbFileName, iconEmoji) {
        if (this.constructor === Vehicle3D) {
            throw new Error("Abstract class 'Vehicle3D' cannot be instantiated directly.");
        }
        this.categoryName = categoryName;
        this.glbFileName = glbFileName;
        this.iconEmoji = iconEmoji;
    }

    getGLBPath() {
        return `assets/models/${this.glbFileName}`;
    }

    getIcon() {
        return this.iconEmoji;
    }

    // Abstract Method to be overridden polymorphically by derived classes
    buildMesh() {
        throw new Error("Method 'buildMesh()' must be implemented by concrete subclass.");
    }
}

// Concrete Subclass 1: Car3D
class Car3D extends Vehicle3D {
    constructor() {
        super("Car", "car.glb", "🚗");
    }

    buildMesh() {
        const group = new THREE.Group();
        const carMat = new THREE.MeshStandardMaterial({ color: 0x2563eb, metalness: 0.7, roughness: 0.2 });
        const glassMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.1, transparent: true, opacity: 0.7 });
        const wheelMat = new THREE.MeshStandardMaterial({ color: 0x0f172a });

        const body = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.4, 2.4), carMat);
        body.position.set(0, 0.35, 0);
        group.add(body);

        const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.35, 1.2), glassMat);
        cabin.position.set(0, 0.65, -0.1);
        group.add(cabin);

        const wheelGeo = new THREE.CylinderGeometry(0.22, 0.22, 0.15, 16);
        [[-0.62, 0.22, 0.7], [0.62, 0.22, 0.7], [-0.62, 0.22, -0.7], [0.62, 0.22, -0.7]].forEach(pos => {
            const w = new THREE.Mesh(wheelGeo, wheelMat);
            w.rotation.z = Math.PI / 2;
            w.position.set(...pos);
            group.add(w);
        });

        const headL = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.1, 0.05), new THREE.MeshBasicMaterial({ color: 0x60a5fa }));
        headL.position.set(-0.4, 0.35, 1.21);
        group.add(headL);
        const headR = headL.clone();
        headR.position.x = 0.4;
        group.add(headR);

        return group;
    }
}

// Concrete Subclass 2: Bike3D
class Bike3D extends Vehicle3D {
    constructor() {
        super("Bike", "bike.glb", "🏍️");
    }

    buildMesh() {
        const group = new THREE.Group();
        const bodyMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.8, roughness: 0.2 });
        const blackMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.6 });
        const chromeMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9, roughness: 0.1 });

        const tank = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.35, 0.9), bodyMat);
        tank.position.set(0, 0.45, 0);
        group.add(tank);

        const seat = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.1, 0.45), blackMat);
        seat.position.set(0, 0.52, -0.2);
        group.add(seat);

        const handle = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.04, 0.04), chromeMat);
        handle.position.set(0, 0.65, 0.3);
        group.add(handle);

        const fWheel = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.12, 16), blackMat);
        fWheel.rotation.z = Math.PI / 2;
        fWheel.position.set(0, 0.28, 0.55);
        group.add(fWheel);

        const rWheel = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.12, 16), blackMat);
        rWheel.rotation.z = Math.PI / 2;
        rWheel.position.set(0, 0.28, -0.55);
        group.add(rWheel);

        const light = new THREE.Mesh(new THREE.SphereGeometry(0.08, 12, 12), new THREE.MeshBasicMaterial({ color: 0xfef08a }));
        light.position.set(0, 0.55, 0.46);
        group.add(light);

        return group;
    }
}

// Concrete Subclass 3: Van3D
class Van3D extends Vehicle3D {
    constructor() {
        super("Van", "van.glb", "🚐");
    }

    buildMesh() {
        const group = new THREE.Group();
        const vanMat = new THREE.MeshStandardMaterial({ color: 0x0ea5e9, metalness: 0.5, roughness: 0.3 });
        const glassMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.1, transparent: true, opacity: 0.8 });
        const wheelMat = new THREE.MeshStandardMaterial({ color: 0x0f172a });

        const body = new THREE.Mesh(new THREE.BoxGeometry(1.4, 1.0, 3.2), vanMat);
        body.position.set(0, 0.65, 0);
        group.add(body);

        const glass = new THREE.Mesh(new THREE.BoxGeometry(1.42, 0.45, 2.2), glassMat);
        glass.position.set(0, 0.95, -0.1);
        group.add(glass);

        const wheelGeo = new THREE.CylinderGeometry(0.25, 0.25, 0.16, 16);
        [[-0.68, 0.25, 0.95], [0.68, 0.25, 0.95], [-0.68, 0.25, -0.95], [0.68, 0.25, -0.95]].forEach(pos => {
            const w = new THREE.Mesh(wheelGeo, wheelMat);
            w.rotation.z = Math.PI / 2;
            w.position.set(...pos);
            group.add(w);
        });

        const headL = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.12, 0.05), new THREE.MeshBasicMaterial({ color: 0xfef08a }));
        headL.position.set(-0.45, 0.45, 1.61);
        group.add(headL);
        const headR = headL.clone();
        headR.position.x = 0.45;
        group.add(headR);

        return group;
    }
}

// Concrete Subclass 4: Bus3D
class Bus3D extends Vehicle3D {
    constructor() {
        super("Bus", "bus.glb", "🚌");
    }

    buildMesh() {
        const group = new THREE.Group();
        const busMat = new THREE.MeshStandardMaterial({ color: 0xef4444, metalness: 0.4, roughness: 0.3 });
        const glassMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.1, transparent: true, opacity: 0.8 });
        const wheelMat = new THREE.MeshStandardMaterial({ color: 0x0f172a });

        const body = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.3, 4.4), busMat);
        body.position.set(0, 0.8, 0);
        group.add(body);

        const glass = new THREE.Mesh(new THREE.BoxGeometry(1.62, 0.5, 3.8), glassMat);
        glass.position.set(0, 1.1, -0.1);
        group.add(glass);

        const ac = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.2, 1.4), new THREE.MeshStandardMaterial({ color: 0xf8fafc }));
        ac.position.set(0, 1.55, 0);
        group.add(ac);

        const wheelGeo = new THREE.CylinderGeometry(0.26, 0.26, 0.16, 16);
        [[-0.8, 0.26, 1.5], [0.8, 0.26, 1.5], [-0.8, 0.26, -0.9], [0.8, 0.26, -0.9], [-0.8, 0.26, -1.6], [0.8, 0.26, -1.6]].forEach(pos => {
            const w = new THREE.Mesh(wheelGeo, wheelMat);
            w.rotation.z = Math.PI / 2;
            w.position.set(...pos);
            group.add(w);
        });

        return group;
    }
}

// Concrete Subclass 5: Truck3D
class Truck3D extends Vehicle3D {
    constructor() {
        super("Truck", "truck.glb", "🚚");
    }

    buildMesh() {
        const group = new THREE.Group();
        const cabMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.3, metalness: 0.5 });
        const containerMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.4, metalness: 0.2 });
        const wheelMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.8 });

        const cab = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.9, 1.1), cabMat);
        cab.position.set(0, 0.6, 1.0);
        group.add(cab);

        const containerBox = new THREE.Mesh(new THREE.BoxGeometry(1.45, 1.2, 2.5), containerMat);
        containerBox.position.set(0, 0.75, -0.6);
        group.add(containerBox);

        const wheelGeo = new THREE.CylinderGeometry(0.26, 0.26, 0.18, 16);
        [[-0.7, 0.26, 1.0], [0.7, 0.26, 1.0], [-0.7, 0.26, -0.5], [0.7, 0.26, -0.5], [-0.7, 0.26, -1.3], [0.7, 0.26, -1.3]].forEach(pos => {
            const w = new THREE.Mesh(wheelGeo, wheelMat);
            w.rotation.z = Math.PI / 2;
            w.position.set(...pos);
            group.add(w);
        });

        return group;
    }
}

// Polymorphic Factory Class
class Vehicle3DFactory {
    static create(category) {
        const catKey = (category || 'car').toLowerCase();
        switch (catKey) {
            case 'bike':
            case 'motorbike':
                return new Bike3D();
            case 'van':
                return new Van3D();
            case 'bus':
                return new Bus3D();
            case 'truck':
                return new Truck3D();
            case 'car':
            default:
                return new Car3D();
        }
    }
}
