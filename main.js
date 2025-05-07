import * as THREE from 'three';

import Stats from 'three/addons/libs/stats.module.js';

import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EXRLoader } from 'three/addons/loaders/EXRLoader.js';

let preset = {};
let container, stats;
let camera, scene, renderer, controls, light;
let mesh;
let exrCubeRenderTarget;
let exrBackground;

const hdri_path = './hdri/hdri.exr';

const base_path = './material/';
const json_path = base_path + 'material.json';

// gui params
const params = {
    geometry: 'Sphere',
    clearbg: false,
    clearbgcolor: 0x333333,
    tonemap: 'ACES',
    roughness: 0.0,
    metalness: 0.0,
    displacementscale: 1.0,
    displacementbias: 0.0,
    normalscale: 1.0,
    aointensity: 1.0,
    exposure: 1.0,
    rotationspeed: 0.33,
    rotate: true,
    ambientlightcolor: 0x404040,
    ambientlightintensity: 1.0,
    textureuscale: 4.0,
    texturevscale: 2.0,
    envmaprotz: 0,
};
const geo = {
    "plane": new THREE.PlaneGeometry(48, 48, 512, 512),
    "sphere": new THREE.SphereGeometry(32.0, 1024, 2048),
}

init();

function loadTexture(path) {
    let tex = null;
    tex = new THREE.TextureLoader().load(path);
    tex.repeat.x = 100;
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(4, 2);
    return tex;
}

function updateSceneMesh() {
    mesh.geometry.dispose();
    mesh.geometry = geo[params.geometry.toLowerCase()]
}

function init() {
    container = document.createElement('div');
    document.body.appendChild(container);

    camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 1, 1000);

    camera.position.set(0, 0, 120);

    scene = new THREE.Scene();

    renderer = new THREE.WebGLRenderer();
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setAnimationLoop(animate);

    container.appendChild(renderer.domElement);

    let geometry = geo.sphere
    let material = new THREE.MeshStandardMaterial();
    mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    light = new THREE.AmbientLight(params.ambientlightcolor);
    light.intensity = params.ambientlightintensity;
    scene.add(light);

    THREE.DefaultLoadingManager.onLoad = function () {
        pmremGenerator.dispose();
    };

    new EXRLoader().load(hdri_path, function (texture) {
        texture.mapping = THREE.EquirectangularReflectionMapping;
        exrCubeRenderTarget = pmremGenerator.fromEquirectangular(texture);
        exrBackground = texture;
    });

    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    pmremGenerator.compileEquirectangularShader();

    stats = new Stats();
    container.appendChild(stats.dom);

    controls = new OrbitControls(camera, renderer.domElement);
    controls.minDistance = 50;
    controls.maxDistance = 300;

    window.addEventListener('resize', onWindowResize);

    const gui = new GUI();

    const loader = new THREE.MaterialLoader();
    fetch(json_path)
        .then((res) => res.json())
        .then((o) => {
            loader.load(json_path, (mat) => {
                mesh.material = mat;

                console.log(mat)

                // load textures from json
                for (const tex in o.textures) {
                    console.log(tex)
                    mesh.material[tex] = loadTexture(base_path + o.textures[tex]);
                }
                mesh.material.map.colorSpace = THREE.SRGBColorSpace;

                // set gui params from loaded material
                params.roughness = mat.roughness;
                params.metalness = mat.metalness;
                params.displacementscale = mesh.material.displacementScale;
                params.displacementbias = mesh.material.displacementBias;
                params.normalscale = o.normalScale;

                // Mesh
                const meshFolder = gui.addFolder('Mesh');
                meshFolder
                    .add(params, 'geometry', ['Plane', 'Sphere'])
                    .name('Mesh')
                    .onChange(updateSceneMesh);

                // Environment
                const envFolder = gui.addFolder('Environment');
                envFolder.add(params, 'envmaprotz', -1.0, 1.0, 0.01).name('Environment Rotation');
                envFolder.add(params, 'clearbg').name('Clear BG');
                envFolder.addColor(params, 'clearbgcolor').name('Clear BG Color');
                envFolder
                    .add(params, 'tonemap', [
                        'Linear',
                        'Reinhard',
                        'Cineon',
                        'ACES',
                        'AgX',
                        'Neutral',
                    ])
                    .name('Tonemapping');
                envFolder.add(params, 'exposure', 0, 2, 0.01).name('Exposure');
                envFolder.addColor(params, 'ambientlightcolor').name('Ambient Light');
                envFolder
                    .add(params, 'ambientlightintensity', 0, 10, 0.01)
                    .name('Ambient Light Intensity');

                // Material
                const matFolder = gui.addFolder('Material');
                matFolder.add(params, 'textureuscale', 1, 16, 1).name('U Scale');
                matFolder.add(params, 'texturevscale', 1, 16, 1).name('V Scale');
                matFolder.add(params, 'roughness', 0, 1, 0.01).name('Roughness');
                matFolder.add(params, 'metalness', 0, 1, 0.01).name('Metalness');

                matFolder.add(params, 'normalscale', 0.0, 1.0, 0.01).name('Normal Scale');
                matFolder.add(params, 'aointensity', 0.0, 1.0, 0.01).name('AO Intensity');

                matFolder.add(params, 'displacementscale', 0, 4, 0.01).name('Displacement Scale');
                matFolder.add(params, 'displacementbias', -2, 2, 0.01).name('Displacement Bias');

                // Animation
                const animFolder = gui.addFolder('Animation');
                animFolder.add(params, 'rotationspeed', 0.0, 1.0, 0.01).name('Rotation Speed');
                animFolder.add(params, 'rotate').name('Rotate');

                // Reset to default
                params.reset = () => {
                    gui.load(preset);
                };
                gui.add(params, 'reset').name('Reset');
                preset = gui.save();

                gui.open();
            });
        });
}

function onWindowResize() {
    const width = window.innerWidth;
    const height = window.innerHeight;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    renderer.setSize(width, height);
}

function animate() {
    stats.begin();
    render();
    stats.end();
}

function render() {
    let newEnvMap = mesh.material.envMap;
    let background = scene.background;
    let tonemapping;

    newEnvMap = exrCubeRenderTarget ? exrCubeRenderTarget.texture : null;
    background = exrBackground;

    tonemapping = {
        Linear: THREE.LinearToneMapping,
        Reinhard: THREE.ReinhardToneMapping,
        Cineon: THREE.CineonToneMapping,
        ACES: THREE.ACESFilmicToneMapping,
        AgX: THREE.AgXToneMapping,
        Neutral: THREE.NeutralToneMapping,
    }[params.tonemap];

    if (newEnvMap !== mesh.material.envMap) {
        mesh.material.envMap = newEnvMap;
        mesh.material.needsUpdate = true;
    }

    // gui config
    const uvs = new THREE.Vector2(params.textureuscale, params.texturevscale);

    if (mesh.material.map) mesh.material.map.repeat.set(uvs.x, uvs.y);

    mesh.material.displacementScale = params.displacementscale;
    mesh.material.displacementBias = params.displacementbias;
    if (mesh.material.displacementMap) mesh.material.displacementMap.repeat.set(uvs.x, uvs.y);

    mesh.material.normalScale = new THREE.Vector2(1 * params.normalscale);
    if (mesh.material.normalMap) mesh.material.normalMap.repeat.set(uvs.x, uvs.y);

    if (mesh.material.aoMap) mesh.material.aoMap.repeat.set(uvs.x, uvs.y);
    mesh.material.aoMapIntensity = params.aointensity;

    mesh.material.roughness = params.roughness;
    if (mesh.material.roughnessMap) mesh.material.roughnessMap.repeat.set(uvs.x, uvs.y);

    mesh.material.metalness = params.metalness;
    if (mesh.material.metalnessMap) mesh.material.metalnessMap.repeat.set(uvs.x, uvs.y);

    mesh.material.envMapRotation.y = params.envmaprotz * 6.283;

    // animate mesh rotation
    mesh.rotation.y += 0.005 * params.rotationspeed * (params.rotate ? 1.0 : 0.0);

    // clear bg
    if (!params.clearbg) {
        scene.background = background;
        scene.backgroundRotation.y = params.envmaprotz * 6.283;
    } else {
        scene.background = new THREE.Color(params.clearbgcolor);
    }

    // ambient light
    light.color = new THREE.Color(params.ambientlightcolor);
    light.intensity = params.ambientlightintensity;

    // tonemapping / exposure
    renderer.toneMapping = tonemapping;
    renderer.toneMappingExposure = params.exposure;

    renderer.render(scene, camera);
}
