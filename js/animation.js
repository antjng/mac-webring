// background animated objects
import '../css/styles.css';
import * as THREE from 'three';

const ANIMATION_END_FRAME = 1;
const ANIMATION_STEP = 0.01;
const SIGMOID_COMPRESSION = 10;
const sigmoid = x => 1 / (1 + Math.exp(-(SIGMOID_COMPRESSION * (x - 0.5))));

const smoothstep = (a, b, t) => {
    const x = Math.max(0, Math.min(1, (t - a) / (b - a)));
    return x * x * (3 - 2 * x);
};

const animationTriggerHeight = () => window.innerHeight / 10;

const ICON_BASE_SIZE = 80;
const SPHERE_RADIUS = 50;
const SPHERE_SEG_W = 36;
const SPHERE_SEG_H = 24;

const LOGO_Y_SPIN_TOP = 0.004;
const SPHERE_X_SPIN = 0.003;
const SCROLL_Y_FACTOR = 0.005;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 600;

const renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector('#bg'),
    alpha: true,
    antialias: true
});
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x000000, 0);

function screenToWorld(xPx, yPx) {
    const halfH = camera.position.z * Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2);
    const halfW = halfH * camera.aspect;
    const nx = (xPx / window.innerWidth) * 2 - 1;
    const ny = -(yPx / window.innerHeight) * 2 + 1;
    return { x: nx * halfW, y: ny * halfH };
}
function worldUnitsPerPixelY() {
    const halfH = camera.position.z * Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2);
    return (2 * halfH) / window.innerHeight;
}
function getAsciiRect() {
    const el = document.querySelector('.title');
    return el ? el.getBoundingClientRect() : null;
}
function getIconStartPosition() {
    const rect = getAsciiRect();
    if (rect) {
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        return screenToWorld(cx, cy);
    }
    return { x: -50, y: 30 };
}
function getIconStartScale() {
    const rect = getAsciiRect();
    if (!rect) return 0.3;
    const worldPerPx = worldUnitsPerPixelY();
    const desiredWorldHeight = rect.height * 1.12 * worldPerPx; // peek above/below
    return desiredWorldHeight / ICON_BASE_SIZE;
}
const iconEndX = () => {
    const sx = window.innerWidth * 0.85;
    return screenToWorld(sx, window.innerHeight / 2).x;
};
const iconEndY = () => {
    const sy = window.innerHeight * 0.85;
    return screenToWorld(window.innerWidth / 2, sy).y;
};


// icon stuff
const iconGeometry = new THREE.PlaneGeometry(ICON_BASE_SIZE, ICON_BASE_SIZE);

const iconMaterial = new THREE.MeshBasicMaterial({
    transparent: true,
    opacity: 0.45,
    side: THREE.DoubleSide,
    alphaTest: 0.1,
    depthTest: false,
    depthWrite: false
});
const icon = new THREE.Mesh(iconGeometry, iconMaterial);
icon.renderOrder = 999;

let texGray = null;
(function loadGreyTexture() {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    const makeTextureFromCanvas = (canvas) => {
        const tex = new THREE.CanvasTexture(canvas);
        tex.minFilter = THREE.LinearFilter;
        tex.magFilter = THREE.LinearFilter;
        tex.premultiplyAlpha = false;
        return tex;
    };

    const makeGrayscaleCanvas = (img) => {
        const c = document.createElement('canvas');
        c.width = 512; c.height = 512;
        const ctx = c.getContext('2d');
        ctx.clearRect(0, 0, 512, 512);
        ctx.drawImage(img, 0, 0, 512, 512);
        const imgData = ctx.getImageData(0, 0, 512, 512);
        const d = imgData.data;
        for (let i = 0; i < d.length; i += 4) {
            const r = d[i], g = d[i + 1], b = d[i + 2];
            const y = 0.2126 * r + 0.7152 * g + 0.0722 * b; // luminance
            d[i] = d[i + 1] = d[i + 2] = y;
        }
        ctx.putImageData(imgData, 0, 0);
        return c;
    };

    img.onload = () => {
        texGray = makeTextureFromCanvas(makeGrayscaleCanvas(img));
        iconMaterial.map = texGray;
        iconMaterial.needsUpdate = true;
    };

    img.onerror = () => {
        const c = document.createElement('canvas');
        c.width = 256; c.height = 256;
        const ctx = c.getContext('2d');
        ctx.clearRect(0, 0, 256, 256);
        ctx.fillStyle = '#777';
        ctx.beginPath(); ctx.arc(128, 128, 100, 0, Math.PI * 2); ctx.fill();
        texGray = makeTextureFromCanvas(c);
        iconMaterial.map = texGray;
        iconMaterial.needsUpdate = true;
    };

    img.src = 'assets/icons/icon-red.svg';
})();


// sphere stuff
const sphereGeometry = new THREE.SphereGeometry(SPHERE_RADIUS, SPHERE_SEG_W, SPHERE_SEG_H);
const sphereMaterial = new THREE.MeshBasicMaterial({
    color: 0x000000,
    wireframe: true,
    transparent: true,
    opacity: 0
});
const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);

const startPos = getIconStartPosition();
const startScale = getIconStartScale();
icon.position.set(startPos.x, startPos.y, 1);
icon.scale.setScalar(startScale);
sphere.position.copy(icon.position);

scene.add(icon);
scene.add(sphere);

let needsResize = false;
window.addEventListener('resize', () => (needsResize = true));
function resizeIfNeeded() {
    if (!needsResize) return;
    needsResize = false;
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    if (frame <= 0.001) {
        const p = getIconStartPosition();
        const s = getIconStartScale();
        icon.position.set(p.x, p.y, 1);
        icon.scale.setScalar(s);
        sphere.position.copy(icon.position);
    }
}


// motion
let frame = 0;

function animate() {
    requestAnimationFrame(animate);
    resizeIfNeeded();
    if (window.scrollY >= animationTriggerHeight()) {
        if (frame <= ANIMATION_END_FRAME) frame += ANIMATION_STEP;
    } else if (frame > 0) {
        frame -= ANIMATION_STEP;
    }
    frame = Math.max(0, Math.min(ANIMATION_END_FRAME, frame));
    const progress = sigmoid(frame);

    const fadeT = smoothstep(0.68, 0.90, progress);
    const heroT = smoothstep(0.70, 1.00, progress);

    const anchor = getIconStartPosition();
    const endX = iconEndX();
    const endY = iconEndY();

    icon.position.x = anchor.x + (endX - anchor.x) * progress;
    icon.position.y = anchor.y + (endY - anchor.y) * progress;
    const s0 = getIconStartScale();
    const s1 = 1.6;
    const currentScale = s0 + (s1 - s0) * progress;
    icon.scale.setScalar(currentScale);

    sphere.position.copy(icon.position);
    const iconSide = ICON_BASE_SIZE * currentScale;
    const desiredFactor = 1.60; // sphere slightly larger than logo
    const sphereScaleMin = (desiredFactor * iconSide) / (2 * SPHERE_RADIUS);
    const targetScale = Math.max(sphereScaleMin, 2.2);
    const sphereScale = 1 + (targetScale - 1) * heroT; // start at 1, ramp to target
    sphere.scale.setScalar(sphereScale);

    icon.material.opacity = 0.45 + (1.0 - 0.45) * heroT;

    const sphereMax = 0.88;
    sphere.material.opacity = sphereMax * fadeT;

    if (progress < 0.7) {
        icon.rotation.y += LOGO_Y_SPIN_TOP;
        icon.rotation.x *= 0.92;
        icon.rotation.z *= 0.92;
        sphere.rotation.x *= 0.98;
        sphere.rotation.y *= 0.98;
        sphere.rotation.z *= 0.98;
    }

    const targetY = window.scrollY * SCROLL_Y_FACTOR;
    const lerpAmt = 0.12 * heroT;

    sphere.rotation.x += SPHERE_X_SPIN * heroT;
    sphere.rotation.y = THREE.MathUtils.lerp(sphere.rotation.y, targetY, lerpAmt);
    sphere.rotation.z = THREE.MathUtils.lerp(sphere.rotation.z, targetY * 0.3, 0.08 * heroT);

    icon.rotation.x += SPHERE_X_SPIN * heroT;
    icon.rotation.y = THREE.MathUtils.lerp(icon.rotation.y, targetY, lerpAmt);
    icon.rotation.z = THREE.MathUtils.lerp(icon.rotation.z, targetY * 0.2, 0.06 * heroT);

    renderer.render(scene, camera);
}
animate();
