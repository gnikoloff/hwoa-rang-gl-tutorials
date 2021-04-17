import * as HwoaRangGL from 'hwoa-rang-gl'

// Create a HTMLCanvas and obtain WebGLRenderingContext
const canvas = document.createElement('canvas')
const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')

// Size our canvas and append it to the DOM
canvas.width = innerWidth * devicePixelRatio
canvas.height = innerHeight * devicePixelRatio
canvas.style.width = `${innerWidth}px`
canvas.style.height = `${innerHeight}px`
document.body.appendChild(canvas)

// Set the viewport size
gl.viewport(0, 0, innerWidth, innerHeight)
// Enable depth testing
gl.enable(gl.DEPTH_TEST)
// Set the background color
gl.clearColor(0.9, 0.9, 0.9, 1.0)

// Create our perspective camera with 45 degrees field of view
const fieldOfViewRadians = 45 * Math.PI / 180
const aspect = innerWidth / innerHeight
const near = 0.1
const far = 100
const perspCamera = new HwoaRangGL.PerspectiveCamera(
  fieldOfViewRadians,
  aspect,
  near,
  far
)
perspCamera.position = [5, 3, 3]
perspCamera.lookAt([0, 0, 0])

// Camera controller
new HwoaRangGL.CameraController(perspCamera)

// Create the geometry needed for our cube
const { vertices, indices, uv, normal } = HwoaRangGL.GeometryUtils.createBox({
  width: 1,
    height: 1,
    depth: 1
  })
const geometry = new HwoaRangGL.Geometry(gl)
geometry
  .addIndex({ typedArray: indices })
  .addAttribute('position', { typedArray: vertices, size: 3 })
  .addAttribute('normal', { typedArray: normal, size: 3 })
  .addAttribute('uv', { typedArray: uv, size: 2 })

const mesh = new HwoaRangGL.Mesh(gl, {
  geometry,
  uniforms: {
    texture: { type: HwoaRangGL.UNIFORM_TYPE_INT, value: 0 },
    lightDirection: { type: HwoaRangGL.UNIFORM_TYPE_VEC3, value: [1, 1, 0.5] }
  },
  vertexShaderSource: `
    attribute vec4 position;
    attribute vec2 uv;
    attribute vec3 normal;

    varying vec2 v_uv;
    varying vec3 v_normal;

    void main () {
      gl_Position = projectionMatrix * viewMatrix * modelMatrix * position;
      
      v_uv = uv;
      v_normal = mat3(modelMatrix) * normal;
    }
  `,
  fragmentShaderSource: `
    precision highp float;

    uniform sampler2D texture;
    uniform vec3 lightDirection;

    varying vec2 v_uv;
    varying vec3 v_normal;

    void main () {
      vec3 normal = normalize(v_normal);
      float light = dot(normal, lightDirection);

      gl_FragColor = texture2D(texture, v_uv);
      gl_FragColor.rgb *= light;
    }
  `
})

// We initialize our texture as empty 1x1 so we can start using it 
// immediately and not have to wait for the image to load to
// render our scene
const texture = new HwoaRangGL.Texture(gl, {
  minFilter: gl.LINEAR_MIPMAP_LINEAR
})
  .bind()
  .fromSize(1, 1)
  
const img = new Image()
img.onload = () => {
  texture
    .bind()
    .setIsFlip(1)
    .fromImage(img)
    .setAnisotropy(8)
    .generateMipmap()
}
img.src = location.href.includes('github')
  ? '/hwoa-rang-gl-tutorials/assets/webgl-logo.png'
  : '/assets/webgl-logo.png'

// Start our animation loop
requestAnimationFrame(renderFrame)

function renderFrame (ts) {
  // Clear the color and depth buffers on each render tick
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

  gl.activeTexture(gl.TEXTURE0)
  texture.bind()

  // Paint our mesh to the screen
  mesh
    // Bind it's program as active
    .use()
    // Incrementally rotate it around the Y axis on each loop
    .setRotation({ y: ts / 1000 })
    // Provide camera to render it with
    .setCamera(perspCamera)
    // Issue a draw command
    .draw()

  // Schedule new animation loop callback
  requestAnimationFrame(renderFrame)
}
