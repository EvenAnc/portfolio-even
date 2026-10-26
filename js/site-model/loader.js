/**
 * Site model, loading: reads a model written by .claude/maquette-site/format_modele.py.
 *
 * The file holds positions, normals and texture coordinates as normalised integers, read as
 * they are by the graphics card: no decoder, so no WebAssembly (the site's security policy
 * forbids it). Positions live in a box brought back to 0..1; the mesh scale puts them back.
 * Textures are separate same-origin images: an image packed inside a model would become a
 * blob: address, which the security policy refuses in Safari and Firefox.
 */

function attributeView(buffer, part, Type) {
    return new Type(buffer, part.offset, part.bytes / Type.BYTES_PER_ELEMENT);
}

/** Builds the geometry: the top faces form group 0, the sides group 1. */
function buildGeometry(THREE, desc, buffer) {
    const { layout } = desc;
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position',
        new THREE.BufferAttribute(attributeView(buffer, layout.position, Uint16Array), 3, true));
    // Normals are stored on four bytes for alignment; only three are read.
    const normals = new THREE.InterleavedBuffer(attributeView(buffer, layout.normal, Int8Array), 4);
    geometry.setAttribute('normal', new THREE.InterleavedBufferAttribute(normals, 3, 0, true));
    geometry.setAttribute('uv', new THREE.BufferAttribute(attributeView(buffer, layout.uv, Uint16Array), 2, true));
    geometry.setAttribute('uv1', new THREE.BufferAttribute(attributeView(buffer, layout.uv1, Uint16Array), 2, true));
    const IndexType = desc.indexType === 'u16' ? Uint16Array : Uint32Array;
    const index = attributeView(buffer, layout.index, IndexType);
    geometry.setIndex(new THREE.BufferAttribute(index, 1));
    geometry.addGroup(0, desc.topIndexCount, 0);
    geometry.addGroup(desc.topIndexCount, desc.indexCount - desc.topIndexCount, 1);
    geometry.computeBoundingSphere();
    return { geometry, index };
}

function loadTexture(THREE, loader, url, isColour, anisotropy) {
    if (!url) return Promise.resolve(null);
    return loader.loadAsync(url).then(texture => {
        texture.colorSpace = isColour ? THREE.SRGBColorSpace : THREE.NoColorSpace;
        texture.anisotropy = anisotropy;
        return texture;
    });
}

/** Reads a grey image (heights of the vegetation) as bytes, through a canvas. */
function loadGreyLevels(url) {
    if (!url) return Promise.resolve(null);
    return new Promise((resolve, reject) => {
        const image = new Image();
        image.decoding = 'async';
        image.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = image.naturalWidth;
            canvas.height = image.naturalHeight;
            const context = canvas.getContext('2d', { willReadFrequently: true });
            context.drawImage(image, 0, 0);
            const rgba = context.getImageData(0, 0, canvas.width, canvas.height).data;
            const levels = new Uint8Array(canvas.width * canvas.height);
            for (let i = 0; i < levels.length; i++) levels[i] = rgba[i * 4];
            resolve({ width: canvas.width, height: canvas.height, levels });
        };
        image.onerror = () => reject(new Error('vegetation map'));
        image.src = url;
    });
}

/**
 * Loads the description, the geometry and the textures of a model.
 * @returns {Promise<{desc: object, geometry: object, index: ArrayLike<number>, textures: object}>}
 */
export async function loadModel(THREE, url, anisotropy) {
    const base = new URL(url, window.location.href);
    const desc = await fetch(base).then(response => {
        if (!response.ok) throw new Error(`model ${response.status}`);
        return response.json();
    });
    const buffer = await fetch(new URL(desc.bin, base)).then(response => {
        if (!response.ok) throw new Error(`model data ${response.status}`);
        return response.arrayBuffer();
    });
    const { geometry, index } = buildGeometry(THREE, desc, buffer);
    const loader = new THREE.TextureLoader();
    const urlOf = name => (name ? new URL(name, base).href : null);
    const names = desc.textures;
    const [wood, woodNormal, woodSide, site] = await Promise.all([
        loadTexture(THREE, loader, urlOf(names.wood), true, anisotropy),
        loadTexture(THREE, loader, urlOf(names.woodNormal), false, anisotropy),
        loadTexture(THREE, loader, urlOf(names.woodSide), true, anisotropy),
        loadTexture(THREE, loader, urlOf(names.site), true, anisotropy),
    ]);
    if (site) site.channel = 1;
    const vegetation = desc.vegetation ? await loadGreyLevels(urlOf(desc.vegetation.file)).catch(() => null) : null;
    return { desc, geometry, index, vegetation, textures: { wood, woodNormal, woodSide, site } };
}
