document.addEventListener("DOMContentLoaded", (event) => {
    console.log("Doc Loaded");

    // Scene setup
    let scene, camera, renderer;
    let textMesh;
    let time = 0;

    // PS1-style low resolution
    const RENDER_WIDTH = 320;
    const RENDER_HEIGHT = 240;

    function init() {
        // Scene
        scene = new THREE.Scene();
        scene.fog = new THREE.Fog(0x000033, 5, 15);

        // Camera
        camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.z = 8;
        camera.position.y = 1;

        // Renderer with PS1-style settings
        renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setClearColor(0x000000, 0);
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.BasicShadowMap; // Pixelated shadows

        // Set low resolution for that chunky PS1 look
        renderer.setPixelRatio(0.35);

        document.body.appendChild(renderer.domElement);

        createLowResTextures();
        createText();
        createLighting();
        createEnvironment();

        document.getElementById('vertex-count').textContent = scene.children.length * 100;
    }

    function createLowResTextures() {
        // Create low-res pixelated textures programmatically
        window.metalTexture = createPixelatedTexture(16, 16, [
            [0x666666, 0x888888, 0x444444, 0x999999],
            [0x777777, 0x555555, 0x888888, 0x333333],
            [0x555555, 0x777777, 0x666666, 0x888888],
            [0x888888, 0x444444, 0x777777, 0x555555]
        ]);

        window.glitchTexture = createPixelatedTexture(8, 8, [
            [0xff0088, 0x8800ff, 0x00ff88, 0xff8800],
            [0x00ff88, 0xff0088, 0xff8800, 0x8800ff]
        ]);
    }

    function createPixelatedTexture(width, height, colorPattern) {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        const pixelWidth = width / colorPattern[0].length;
        const pixelHeight = height / colorPattern.length;

        for (let y = 0; y < colorPattern.length; y++) {
            for (let x = 0; x < colorPattern[y].length; x++) {
                ctx.fillStyle = '#' + colorPattern[y][x].toString(16).padStart(6, '0');
                ctx.fillRect(x * pixelWidth, y * pixelHeight, pixelWidth, pixelHeight);
            }
        }

        const texture = new THREE.CanvasTexture(canvas);
        texture.magFilter = THREE.NearestFilter;
        texture.minFilter = THREE.NearestFilter;
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(2, 2);

        return texture;
    }

    function createText() {
        const loader = new THREE.FontLoader();

        // Create a simple box geometry for each letter since we can't easily load fonts
        // We'll create PERDO using geometric shapes
        const letters = createLetterGeometries();

        const group = new THREE.Group();

        letters.forEach((letterData, index) => {
            const geometry = letterData.geometry;
            const material = new THREE.MeshLambertMaterial({
                map: index % 2 === 0 ? window.metalTexture : window.glitchTexture,
                transparent: false
            });

            const mesh = new THREE.Mesh(geometry, material);
            mesh.position.x = (index - 2) * 2.5; // Center the word
            mesh.position.y = 0;
            mesh.castShadow = true;
            mesh.receiveShadow = true;

            // Add some PS1-style vertex jitter
            const vertices = geometry.attributes.position;
            for (let i = 0; i < vertices.count; i++) {
                vertices.array[i * 3] += (Math.random() - 0.5) * 0.02;
                vertices.array[i * 3 + 1] += (Math.random() - 0.5) * 0.02;
                vertices.array[i * 3 + 2] += (Math.random() - 0.5) * 0.02;
            }
            vertices.needsUpdate = true;

            group.add(mesh);
        });

        scene.add(group);
        textMesh = group;
    }

    function createLetterGeometries() {
        // Simple geometric approximations of P-E-R-D-O
        return [
            { geometry: createPGeometry() },    // P
            { geometry: createEGeometry() },    // E
            { geometry: createRGeometry() },    // R
            { geometry: createDGeometry() },    // D
            { geometry: createOGeometry() }     // O
        ];
    }

    function createPGeometry() {
        const shape = new THREE.Shape();
        // Outer outline of P
        shape.moveTo(0, 0);
        shape.lineTo(0, 2);
        shape.lineTo(1.2, 2);
        shape.lineTo(1.2, 1);
        shape.lineTo(0.3, 1);
        shape.lineTo(0.3, 0);
        shape.lineTo(0, 0);

        // Create hole for the P's internal space
        const hole = new THREE.Path();
        hole.moveTo(0.3, 1.7);
        hole.lineTo(0.9, 1.7);
        hole.lineTo(0.9, 1.3);
        hole.lineTo(0.3, 1.3);
        hole.lineTo(0.3, 1.7);
        shape.holes.push(hole);

        return new THREE.ExtrudeGeometry(shape, {
            depth: 0.3,
            bevelEnabled: true,
            bevelThickness: 0.05,
            bevelSize: 0.02,
            bevelSegments: 1
        });
    }

    function createEGeometry() {
        const shape = new THREE.Shape();
        shape.moveTo(0, 0);
        shape.lineTo(0, 2);
        shape.lineTo(1.2, 2);
        shape.lineTo(1.2, 1.7);
        shape.lineTo(0.3, 1.7);
        shape.lineTo(0.3, 1.2);
        shape.lineTo(1, 1.2);
        shape.lineTo(1, 0.9);
        shape.lineTo(0.3, 0.9);
        shape.lineTo(0.3, 0.3);
        shape.lineTo(1.2, 0.3);
        shape.lineTo(1.2, 0);
        shape.lineTo(0, 0);

        return new THREE.ExtrudeGeometry(shape, {
            depth: 0.3,
            bevelEnabled: true,
            bevelThickness: 0.05,
            bevelSize: 0.02,
            bevelSegments: 1
        });
    }

    function createRGeometry() {
        const shape = new THREE.Shape();
        shape.moveTo(0, 0);
        shape.lineTo(0, 2);
        shape.lineTo(1.2, 2);
        shape.lineTo(1.2, 1.1);
        shape.lineTo(0.9, 1.1);
        shape.lineTo(1.2, 0);
        shape.lineTo(0.8, 0);
        shape.lineTo(0.6, 0.8);
        shape.lineTo(0.3, 0.8);
        shape.lineTo(0.3, 0);
        shape.lineTo(0, 0);

        return new THREE.ExtrudeGeometry(shape, {
            depth: 0.3,
            bevelEnabled: true,
            bevelThickness: 0.05,
            bevelSize: 0.02,
            bevelSegments: 1
        });
    }

    function createDGeometry() {
        const shape = new THREE.Shape();
        shape.moveTo(0, 0);
        shape.lineTo(0, 2);
        shape.lineTo(1, 2);
        shape.quadraticCurveTo(1.3, 1.7, 1.3, 1);
        shape.quadraticCurveTo(1.3, 0.3, 1, 0);
        shape.lineTo(0, 0);

        // Create hole
        const hole = new THREE.Path();
        hole.moveTo(0.3, 0.3);
        hole.lineTo(0.9, 0.3);
        hole.quadraticCurveTo(1, 0.4, 1, 1);
        hole.quadraticCurveTo(1, 1.6, 0.9, 1.7);
        hole.lineTo(0.3, 1.7);
        hole.lineTo(0.3, 0.3);
        shape.holes.push(hole);

        return new THREE.ExtrudeGeometry(shape, {
            depth: 0.3,
            bevelEnabled: true,
            bevelThickness: 0.05,
            bevelSize: 0.02,
            bevelSegments: 1
        });
    }

    function createOGeometry() {
        const shape = new THREE.Shape();
        shape.absellipse(0.6, 1, 0.6, 1, 0, Math.PI * 2, false);

        // Create hole
        const hole = new THREE.Path();
        hole.absellipse(0.6, 1, 0.3, 0.7, 0, Math.PI * 2, true);
        shape.holes.push(hole);

        return new THREE.ExtrudeGeometry(shape, {
            depth: 0.3,
            bevelEnabled: true,
            bevelThickness: 0.05,
            bevelSize: 0.02,
            bevelSegments: 1
        });
    }

    function createLighting() {
        // PS1-style harsh directional lighting
        const ambientLight = new THREE.AmbientLight(0x330066, 0.3);
        scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0x00ff88, 1);
        directionalLight.position.set(5, 10, 5);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 256; // Low res shadows
        directionalLight.shadow.mapSize.height = 256;
        directionalLight.shadow.camera.near = 0.5;
        directionalLight.shadow.camera.far = 50;
        scene.add(directionalLight);

        // Colored accent light
        const accentLight = new THREE.DirectionalLight(0xff0088, 0.5);
        accentLight.position.set(-5, 5, 3);
        scene.add(accentLight);
    }

    function createEnvironment() {
        // Create a simple PS1-style ground plane
        const groundGeometry = new THREE.PlaneGeometry(20, 20, 4, 4);
        const groundMaterial = new THREE.MeshLambertMaterial({
            color: 0x220044,
            transparent: true,
            opacity: 0.8
        });

        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2;
        ground.position.y = -2;
        ground.receiveShadow = true;
        scene.add(ground);

        // Add some floating geometric shapes for atmosphere
        for (let i = 0; i < 8; i++) {
            const geometry = new THREE.BoxGeometry(0.2, 0.2, 0.2);
            const material = new THREE.MeshLambertMaterial({
                color: Math.random() > 0.5 ? 0xff0088 : 0x00ff88,
                transparent: true,
                opacity: 0.6
            });

            const cube = new THREE.Mesh(geometry, material);
            cube.position.set(
                (Math.random() - 0.5) * 20,
                Math.random() * 10 + 2,
                (Math.random() - 0.5) * 20
            );
            cube.rotation.set(
                Math.random() * Math.PI,
                Math.random() * Math.PI,
                Math.random() * Math.PI
            );
            scene.add(cube);
        }
    }

    function animate() {
        requestAnimationFrame(animate);

        time += 0.02;

        if (textMesh) {
            // PS1-style wobbly rotation
            textMesh.rotation.y = Math.sin(time * 0.5) * 0.3;
            textMesh.rotation.x = Math.sin(time * 0.7) * 0.1;

            // Slight position bobbing
            textMesh.position.y = Math.sin(time) * 0.1;

            // Individual letter animations
            textMesh.children.forEach((letter, index) => {
                letter.rotation.z = Math.sin(time + index) * 0.05;
            });
        }

        // Camera movement
        camera.position.x = Math.sin(time * 0.3) * 2;
        camera.position.z = 8 + Math.sin(time * 0.2) * 1;
        camera.lookAt(0, 0, 0);

        renderer.render(scene, camera);
    }

    function onWindowResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }

    window.addEventListener('resize', onWindowResize);

    // Mouse interaction for that authentic PS1 demo feel
    document.addEventListener('mousemove', (event) => {
        const mouseX = (event.clientX / window.innerWidth) * 2 - 1;
        const mouseY = -(event.clientY / window.innerHeight) * 2 + 1;

        if (textMesh) {
            textMesh.rotation.y += mouseX * 0.01;
            textMesh.rotation.x += mouseY * 0.01;
        }
    });

    init();
    animate();
});