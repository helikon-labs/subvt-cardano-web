import * as THREE from 'three';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { MTLLoader } from 'three/addons/loaders/MTLLoader.js';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

let cubeContainer;
let orbitControls;
const agent = navigator.userAgent||navigator.vendor||window.opera;
const isMobile = /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(agent) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(agent.substr(0, 4));

function setupCubeScene() {
    cubeContainer = document.getElementById('cube-container');
    const scene = new THREE.Scene();
    const group = new THREE.Group();
    scene.add(group);

    const ambientLight = new THREE.AmbientLight(0xDDDDDD, 0.5);
    scene.add(ambientLight);

    const pointLightIntensity = isMobile ? 40 : 100;
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
        window.innerWidth / -ortographicCameraFactor,
        window.innerWidth / ortographicCameraFactor,
        window.innerHeight / ortographicCameraFactor,
        window.innerHeight / -ortographicCameraFactor,
        -10,
        1000
    );
    camera.position.z = 0;

    const renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    cubeContainer.appendChild(renderer.domElement);

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

    if (isMobile) {
        // orbitControls = new OrbitControls(camera, renderer.domElement);
    }
    const textureLoader = new THREE.TextureLoader();
    const ao = textureLoader.load('./asset/material/sphere-ao-sm.png');
    const height = textureLoader.load('./asset/material/sphere-height-sm.png');
    const metallic = textureLoader.load('./asset/material/sphere-metallic-sm.png');
    const normalOGL = textureLoader.load('./asset/material/sphere-normal-ogl-sm.png');
    const roughness = textureLoader.load('./asset/material/sphere-roughness-sm.png');
    ao.wrapS = ao.wrapT = THREE.RepeatWrapping;
    metallic.wrapS = metallic.wrapT = THREE.RepeatWrapping;
    roughness.wrapS = roughness.wrapT = THREE.RepeatWrapping;

    const sphereMaterial = new THREE.MeshStandardMaterial({
        color: new THREE.Color(0x4F6ADA), // 0x1111FF
        aoMap: ao,
        bumpMap: height,
        bumpScale: 0.75,
        metalnessMap: metallic,
        normalMap: normalOGL,
        roughnessMap: roughness,
        roughness: 1.0,
        metalness: 0.2,
    });

    const rgbeLoader = new RGBELoader();
    const objLoader = new OBJLoader();
    const mtlLoader = new MTLLoader();

    rgbeLoader.load('./asset/cube_environment_1k.hdr', (cubeEnvironment) => {
        cubeEnvironment.mapping = THREE.EquirectangularReflectionMapping;
        scene.environment = cubeEnvironment;
        mtlLoader.load('./asset/cube.mtl', (cubeMaterial) => {
            cubeMaterial.preload();
            objLoader.setMaterials(cubeMaterial);
            objLoader.load('./asset/cube.obj', (cube) => {
                cube.traverse((child) => {
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
                cube.position.set(0, 0, 0);
                objLoader.load('./asset/ada_spheres.obj', (spheres) => {
                    spheres.traverse((child) => {
                        if (child.isMesh) {
                            child.material = sphereMaterial;
                        }
                    });
                    // Position and add the object to the scene
                    spheres.position.set(0, 0, 0);
                    spheres.scale.x = 4;
                    spheres.scale.y = 4;
                    spheres.scale.z = 4;

                    group.add(cube);
                    group.add(spheres);
                });
            });
        });
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
        let scale = 1;
        if (window.innerWidth < 1200 || window.innerHeight < 800) {
            scale = Math.min(
                Math.max(0.5, window.innerWidth / 1200),
                window.innerHeight / 800,
            );
        }
        scale = Math.min(scale, 1);
        scene.scale.x = scale;
        scene.scale.y = scale;
        scene.scale.z = scale;
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

    window.addEventListener(
        'resize',
        (event) => {
            onWindowResize(event);
        },
        false
    );
    if (!isMobile) {
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

    onWindowResize();
    animate();
}

window.onload = setupCubeScene;