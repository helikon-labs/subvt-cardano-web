import * as THREE from 'three';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { MTLLoader } from 'three/addons/loaders/MTLLoader.js';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
//import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const scene = new THREE.Scene();
const group = new THREE.Group();
scene.add(group);

const ambientLight = new THREE.AmbientLight(0xDDDDDD, 1.4); // soft white light
scene.add(ambientLight);

const pointLightIntensity = 200;
function addPointLight(x, y, z, intensity) {
    const pointLightDistance = 200;
    const pointLight = new THREE.PointLight(0xffffff, intensity, pointLightDistance);
    pointLight.position.set(x, y, z);
    scene.add(pointLight);
}

addPointLight(0, -10, 0, pointLightIntensity);
addPointLight(-10, 0, 0, pointLightIntensity);
addPointLight(0, 10, 0, pointLightIntensity);
addPointLight(10, 0, 0, pointLightIntensity);
addPointLight(10, 0, 0, pointLightIntensity);
addPointLight(4, 0, 3, pointLightIntensity / 4);

const ortographicCameraFactor = 64;
const camera = new THREE.OrthographicCamera(
    window.innerWidth/-ortographicCameraFactor,
    window.innerWidth/ortographicCameraFactor,
    window.innerHeight/ortographicCameraFactor,
    window.innerHeight/-ortographicCameraFactor,
    -10,
    1000
);
camera.position.z = 2;

const renderer = new THREE.WebGLRenderer({antialias: true});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
//document.body.appendChild(renderer.domElement);
const container = document.getElementById('container-large');
console.log(container);
alert(1);
container.appendChild(renderer.domElement);

const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    // strength
    0.3,
    // radius
    0.3,
    // threshold
    0.0
);
composer.addPass(bloomPass);

// const controls = new OrbitControls(camera, renderer.domElement);
const textureLoader = new THREE.TextureLoader();
const ao = textureLoader.load('./asset/material/sphere-ao.png');
const height = textureLoader.load('./asset/material/sphere-height.png');
const metallic = textureLoader.load('./asset/material/sphere-metallic.png');
const normalOGL = textureLoader.load('./asset/material/sphere-normal-ogl.png');
const roughness = textureLoader.load('./asset/material/sphere-roughness.png');
ao.wrapS = ao.wrapT = THREE.RepeatWrapping;
metallic.wrapS = metallic.wrapT = THREE.RepeatWrapping;
roughness.wrapS = roughness.wrapT = THREE.RepeatWrapping;

const rgbeLoader = new RGBELoader();
const objLoader = new OBJLoader();
const mtlLoader = new MTLLoader();

rgbeLoader.load('./asset/cube_environment_1k.hdr', (texture) => {
    texture.mapping = THREE.EquirectangularReflectionMapping;
    scene.environment = texture; // Set it as environment lighting as well
    mtlLoader.load('./asset/cube.mtl', (materials) => {
        materials.preload();
        objLoader.setMaterials(materials);
        objLoader.load('./asset/cube.obj', (obj) => {
            obj.traverse((child) => {
                if (child.isMesh) {
                    const material = child.material;
                    material.envMap = scene.environment;
                    // Enable transparency and reflection
                    material.metalness = 0.0; // Set higher for reflective surfaces
                    material.roughness = 0.0; // Set lower for smoother reflections
                    material.transparent = false;
                    material.opacity = 1.0;
                    // Optionally, adjust the blending mode if transparency is required
                    material.blending = THREE.AdditiveBlending;
                }
            });
            // Position and add the object to the scene
            obj.position.set(0, 0, 0);
            group.add(obj);
        });
    });
});

const material = new THREE.MeshStandardMaterial({
    color: new THREE.Color(0x1111FF),
    aoMap: ao,
    // displacementMap: height,
    displacementScale: 0.0,
    metalnessMap: metallic,
    normalMap: normalOGL,
    roughnessMap: roughness,
    roughness: 1.0,
    metalness: 0.2,
});
objLoader.load('./asset/ada_spheres.obj', (obj) => {
    obj.traverse((child) => {
        if (child.isMesh) {
            child.material = material;
        }
    });
    // Position and add the object to the scene
    obj.position.set(0, 0, 0);
    obj.scale.x = 4;
    obj.scale.y = 4;
    obj.scale.z = 4;
    group.add(obj);
});

function onWindowResize() {
    // update orthographic camera's frustum boundaries
    camera.left = window.innerWidth / -ortographicCameraFactor;
    camera.right = window.innerWidth / ortographicCameraFactor;
    camera.top = window.innerHeight / ortographicCameraFactor;
    camera.bottom = window.innerHeight / -ortographicCameraFactor;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    // scale scene
    scene.scale.x = Math.min(window.innerWidth, window.innerHeight) / 800;
    scene.scale.y = Math.min(window.innerWidth, window.innerHeight) / 800;
    scene.scale.z = Math.min(window.innerWidth, window.innerHeight) / 800;
}

function onMouseMove(event) {
    const originX = window.innerWidth / 2;
    const originY = window.innerHeight / 2;
    const x = event.x - originX;
    const xRatio = x / window.innerWidth / 1.5;
    const y = originY - event.y;
    const yRatio = y / window.innerHeight / 1.5;
    group.rotation.y = xRatio;
    group.rotation.x = -yRatio;
}

window.onload = function() {
    window.addEventListener(
        'resize',
        (event) => {
            onWindowResize(event);
        },
        false
    );
    window.addEventListener(
        'mousemove',
        (event) => {
            onMouseMove(event);
        },
        false
    );
}

function animate() {
    requestAnimationFrame(animate);
    composer.render();
}
animate();