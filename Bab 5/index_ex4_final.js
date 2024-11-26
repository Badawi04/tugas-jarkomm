import * as THREE from './modules/three.module.js';

main();

function main() {
    // create context
    const canvas = document.querySelector("#c");
    const gl = new THREE.WebGLRenderer({
        canvas,
        antialias: true
    });

    // create camera
    const angleOfView = 55;
    const aspectRatio = canvas.clientWidth / canvas.clientHeight;
    const nearPlane = 0.1;
    const farPlane = 100;
    const camera = new THREE.PerspectiveCamera(
        angleOfView,
        aspectRatio,
        nearPlane,
        farPlane
    );
    camera.position.set(0, 8, 30);

    // create the scene
    const scene = new THREE.Scene();
    const textureLoader = new THREE.TextureLoader();

    // Load mountain background image
    const mountainTexture = textureLoader.load('textures/mountain.jpg');
    scene.background = mountainTexture;

    const fog = new THREE.Fog("grey", 2, 100);
    scene.fog = fog;

    // GEOMETRY
    const cubeSize = 5;
    const cubeGeometry = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);  

    const sphereRadius = 3.5;
    const sphereWidthSegments = 32;
    const sphereHeightSegments = 16;
    const sphereGeometry = new THREE.SphereGeometry(
        sphereRadius,
        sphereWidthSegments,
        sphereHeightSegments
    );

    const planeWidth = 256;
    const planeHeight = 128;
    const planeGeometry = new THREE.PlaneGeometry(planeWidth, planeHeight);

    // Load texture for the cube
    const cubeTexture = textureLoader.load('textures/lava.jpg'); // Replace with your texture path
    const cubeMaterial = new THREE.MeshPhongMaterial({
        map: cubeTexture // Apply the texture to the material
    });

    const sphereNormalMap = textureLoader.load('textures/snow.jpg');
    sphereNormalMap.wrapS = THREE.RepeatWrapping;
    sphereNormalMap.wrapT = THREE.RepeatWrapping;
    const sphereMaterial = new THREE.MeshStandardMaterial({
        color: 'tan',
        normalMap: sphereNormalMap
    });

    const planeTextureMap = textureLoader.load('textures/banyu.jpg');
    planeTextureMap.wrapS = THREE.RepeatWrapping;
    planeTextureMap.wrapT = THREE.RepeatWrapping;
    planeTextureMap.repeat.set(16, 16);
    planeTextureMap.minFilter = THREE.NearestFilter;
    planeTextureMap.anisotropy = gl.getMaxAnisotropy();

    const planeNorm = textureLoader.load('textures/pebbles_normal.png');
    planeNorm.wrapS = THREE.RepeatWrapping;
    planeNorm.wrapT = THREE.RepeatWrapping;
    planeNorm.minFilter = THREE.NearestFilter;
    planeNorm.repeat.set(16, 16);
    const planeMaterial = new THREE.MeshStandardMaterial({
        map: planeTextureMap,
        side: THREE.DoubleSide,
        normalMap: planeNorm 
    });

    // MESHES
    const cube = new THREE.Mesh(cubeGeometry, cubeMaterial); // Use the textured material
    cube.position.set(cubeSize + 1, cubeSize + 1, 0);
    scene.add(cube);

    const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    sphere.position.set(-sphereRadius - 1, sphereRadius + 2, 0);
    scene.add(sphere);

    const plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.rotation.x = Math.PI / 2;
    // scene.add(plane);

    // Create rain effect
    const rainCount = 10000;
    const rainDrops = [];

    for (let i = 0; i < rainCount; i++) {
        const geometry = new THREE.SphereGeometry(0.1, 8, 8); // Sphere for raindrop
        const material = new THREE.MeshBasicMaterial({ color: 0xaaaaaa, transparent: true });
        const rainDrop = new THREE.Mesh(geometry, material);

        // Random position for each raindrop
        rainDrop.position.set(
            Math.random() * 400 - 200, // x
            Math.random() * 500,       // y (initial height)
            Math.random() * 400 - 200  // z
        );

        rainDrops.push(rainDrop);
        scene.add(rainDrop);
    }

    // LIGHTS
    const color = 0xffffff;
    const intensity = 0.7;
    const light = new THREE.DirectionalLight(color, intensity);
    light.target = plane;
    light.position.set(0, 30, 30);
    scene.add(light);
    scene.add(light.target);

    const ambientColor = 0xffffff;
    const ambientIntensity = 0.3;
    const ambientLight = new THREE.AmbientLight(ambientColor, ambientIntensity);
    scene.add(ambientLight);

    // Lightning effect
    const lightningLight = new THREE.PointLight(0xffffff, 0); // Create a point light for lightning
    lightningLight.position.set(0, 20, -30); // Position it behind the sphere and cube
    scene.add(lightningLight);

    // Function to trigger lightning effect
    function triggerLightning() {
        lightningLight.intensity = 5; // Increase intensity
        setTimeout(() => {
            lightningLight.intensity = 0; // Reset intensity after 50ms
        }, 50);
    }

    // DRAW
    function draw(time) {
        time *= 0.001;

        if (resizeGLToDisplaySize(gl)) {
            const canvas = gl.domElement;
            camera.aspect = canvas.clientWidth / canvas.clientHeight;
            camera.updateProjectionMatrix();
        }
        
        cube.rotation.x += 0.01;
        cube.rotation.y += 0.01;
        cube.rotation.z += 0.01;

        sphere.rotation.x += 0.01;
        sphere.rotation.y += 0.01;

        // Move raindrops down
        rainDrops.forEach(rainDrop => {
            rainDrop.position.y -= 2; // Adjust speed of the drop

            // Reset raindrop position when it goes below a certain level
            if (rainDrop.position.y < -250) {
                rainDrop.position.y = Math.random() * 500; // Reset to a new random height
            }
        });

        // Randomly trigger lightning every few seconds
        if (Math.random() < 0.01) {
            triggerLightning();
        }

        light.position.x = 20 * Math.cos(time);
        light.position.y = 20 * Math.sin(time);
        gl.render(scene, camera);
        requestAnimationFrame(draw);
    }

    requestAnimationFrame(draw);
}

// UPDATE RESIZE
function resizeGLToDisplaySize(gl) {
    const canvas = gl.domElement;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const needResize = canvas.width != width || canvas.height != height;
    if (needResize) {
        gl.setSize(width, height, false);
    }
    return needResize;
}
