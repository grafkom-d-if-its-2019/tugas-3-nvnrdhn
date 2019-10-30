(function() {
  // console.log("test");
  
  glUtils.SL.init({ callback: function() { main(); }});
  function main() {
    var canvas = document.getElementById("glcanvas");
    var gl = glUtils.checkWebGL(canvas);
    var vertexShader = glUtils.getShader(gl, gl.VERTEX_SHADER, glUtils.SL.Shaders.v1.vertex);
    var fragmentShader = glUtils.getShader(gl, gl.FRAGMENT_SHADER, glUtils.SL.Shaders.v1.fragment);
    var program = glUtils.createProgram(gl, vertexShader, fragmentShader);
    gl.useProgram(program);

    var cubePoints = [
      [ -0.5, -0.5,  0.5 ],
      [ -0.5,  0.5,  0.5 ],
      [  0.5,  0.5,  0.5 ],
      [  0.5, -0.5,  0.5 ],
      [ -0.5, -0.5, -0.5 ],
      [ -0.5,  0.5, -0.5 ],
      [  0.5,  0.5, -0.5 ],
      [  0.5, -0.5, -0.5 ],
    ]

    var nPoints = [
      [-0.3, -0.5, 0.10], //0
      [-0.5, -0.3, 0.10],
      [-0.5, 0.3, 0.10],
      [-0.3, 0.5, 0.10],
      [0.3, -0.1, 0.10],
      [0.3, 0.5, 0.10],
      [0.5, 0.3, 0.10],
      [0.5, -0.3, 0.10],
      [0.3, -0.5, 0.10],
      [-0.3, 0.1, 0.10],  //9

      [-0.3, -0.5, -0.10],//10
      [-0.5, -0.3, -0.10],
      [-0.5, 0.3, -0.10],
      [-0.3, 0.5, -0.10],
      [0.3, -0.1, -0.10],
      [0.3, 0.5, -0.10],
      [0.5, 0.3, -0.10],
      [0.5, -0.3, -0.10],
      [0.3, -0.5, -0.10],
      [-0.3, 0.1, -0.10], //19
    ]

    var cyan = [0.0, 1.0, 1.0],
        dark = [0.0, 0.5, 0.5]

    var nTriangles = []

    nTriangles.push(...nPoints[0], ...cyan, ...nPoints[1], ...cyan, ...nPoints[2], ...cyan) 
    nTriangles.push(...nPoints[0], ...cyan, ...nPoints[2], ...cyan, ...nPoints[9], ...cyan)
    nTriangles.push(...nPoints[2], ...cyan, ...nPoints[3], ...cyan, ...nPoints[8], ...cyan)
    nTriangles.push(...nPoints[3], ...cyan, ...nPoints[7], ...cyan, ...nPoints[8], ...cyan)
    nTriangles.push(...nPoints[4], ...cyan, ...nPoints[5], ...cyan, ...nPoints[7], ...cyan)
    nTriangles.push(...nPoints[5], ...cyan, ...nPoints[6], ...cyan, ...nPoints[7], ...cyan)

    nTriangles.push(...nPoints[0+10], ...dark, ...nPoints[1+10], ...dark, ...nPoints[2+10], ...dark) 
    nTriangles.push(...nPoints[0+10], ...dark, ...nPoints[2+10], ...dark, ...nPoints[9+10], ...dark)
    nTriangles.push(...nPoints[2+10], ...dark, ...nPoints[3+10], ...dark, ...nPoints[8+10], ...dark)
    nTriangles.push(...nPoints[3+10], ...dark, ...nPoints[7+10], ...dark, ...nPoints[8+10], ...dark)
    nTriangles.push(...nPoints[4+10], ...dark, ...nPoints[5+10], ...dark, ...nPoints[7+10], ...dark)
    nTriangles.push(...nPoints[5+10], ...dark, ...nPoints[6+10], ...dark, ...nPoints[7+10], ...dark)
    
    for (let i = 0; i < 10; i++) {
      if (i == 9) {
        nTriangles.push(...nPoints[i], ...cyan, ...nPoints[i+10], ...dark, ...nPoints[0], ...cyan)
        nTriangles.push(...nPoints[i+10], ...dark, ...nPoints[10], ...dark, ...nPoints[0], ...cyan)
      }
      else {
        nTriangles.push(...nPoints[i], ...cyan, ...nPoints[i+10], ...dark, ...nPoints[i+1], ...cyan)
        nTriangles.push(...nPoints[i+10], ...dark, ...nPoints[i+11], ...dark, ...nPoints[i+1], ...cyan)
      }
    }

    var vertices = []

    function quad(a, b, c, d) {
      var indices = [ a, b, b, c, c, d, d, a ]
      var indices2 = [ a, b, c, d ]
      for (let i = 0; i < indices.length; i++)
        if (indices[i] < 4)
          vertices.push(...cubePoints[indices[i]], ...cyan)
        else
          vertices.push(...cubePoints[indices[i]], ...dark)
      for (let i = 0; i < indices2.length; i++) {
        if (indices2[i] < 4) {
          vertices.push(...cubePoints[indices2[i]], ...cyan)
          vertices.push(...cubePoints[indices2[i]+4], ...dark)
        }
      }
    }

    quad(0,1,2,3)
    quad(4,5,6,7)
    vertices.push(...nTriangles)

    var vertexBufferObject = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBufferObject)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW)

    var vPosition = gl.getAttribLocation(program, "vPosition")
    var vColor = gl.getAttribLocation(program, "vColor")
    gl.vertexAttribPointer(
      vPosition,                          //variabel posisi attrib di shader
      3,                                  //jumlah elemen per attrib
      gl.FLOAT,                           //tipe data attrib
      gl.FALSE,                           
      6 * Float32Array.BYTES_PER_ELEMENT, //ukuran byte tiap verteks (overall)
      0                                   //offset posisi elemen
    )
    gl.vertexAttribPointer(
      vColor, 
      3, 
      gl.FLOAT, 
      gl.FALSE, 
      6 * Float32Array.BYTES_PER_ELEMENT, 
      3 * Float32Array.BYTES_PER_ELEMENT
    )
    gl.enableVertexAttribArray(vPosition)
    gl.enableVertexAttribArray(vColor)
    var speed = 0.005, camZ = 0.0, rotator = 0.0
    var axis = [false, true, false], x = 0, y = 1, z = 2
    var transX = 0.0, transY = 0.0, transZ = 0.0,
        mulX = 0.005, mulY = 0.005, mulZ = 0.005, rot = 0.05

    var currentN = [],
        currentCube = []

    var PLANE = {
      FRONT: null,
      BACK: null,
      TOP: null,
      BOTTOM: null,
      RIGHT: null,
      LEFT: null
    }

    var mmLoc = gl.getUniformLocation(program, 'modelMatrix'),
        vmLoc = gl.getUniformLocation(program, 'viewMatrix'),
        pmLoc = gl.getUniformLocation(program, 'projectionMatrix')
    var mm = glMatrix.mat4.create(),
        vm = glMatrix.mat4.create(),
        pm = glMatrix.mat4.create(),
        temp = glMatrix.mat4.create()

    glMatrix.mat4.translate(mm, mm, [0.0, 0.0, -1.5])
    glMatrix.mat4.perspective(pm,
      glMatrix.glMatrix.toRadian(90), // FoV Y dlm radian
      canvas.width/canvas.height,     // aspect ratio
      0.5,  //near
      10.0  //far
    )
    gl.uniformMatrix4fv(pmLoc, false, pm)

    function onKeyDown(event) {
      if (event.keyCode == 173) speed -= 0.001
      if (event.keyCode == 61) speed += 0.001
      if (event.keyCode == 48) speed = 0
      if (event.keyCode == 88) axis[x] = !axis[x]
      if (event.keyCode == 89) axis[y] = !axis[y]
      if (event.keyCode == 90) axis[z] = !axis[z]
      if (event.keyCode == 38) camZ -= 0.01
      if (event.keyCode == 40) camZ += 0.01
    }

    document.addEventListener('keydown', onKeyDown)

    function mat_mul(a, b) {
      var c1 = a[0]*b[0] + a[4]*b[1] + a[8]*b[2] + a[12]*b[3],
          c2 = a[1]*b[0] + a[5]*b[1] + a[9]*b[2] + a[13]*b[3],
          c3 = a[2]*b[0] + a[6]*b[1] + a[10]*b[2] + a[14]*b[3],
          c4 = a[3]*b[0] + a[7]*b[1] + a[11]*b[2] + a[15]*b[3]
      return [c1, c2, c3, c4]
    }

    function calculateDistance(point, plane) {
      var v = glMatrix.vec3.create(),
          a = glMatrix.vec3.create(),
          b = glMatrix.vec3.create(),
          c = glMatrix.vec3.create()
      glMatrix.vec3.subtract(v, point, plane[0])
      glMatrix.vec3.subtract(a, plane[1], plane[0])
      glMatrix.vec3.subtract(b, plane[2], plane[1])
      glMatrix.vec3.cross(c, a, b)
      var lenC = glMatrix.vec3.len(c)
      glMatrix.vec3.divide(c, c, [lenC,lenC,lenC])
      return Math.abs(glMatrix.vec3.dot(v, c))
    }

    function checkCollision() {
      var eps = 0.01
      for (let i = 0; i < currentN.length; i++) {
        if (calculateDistance(currentN[i], PLANE.FRONT) < eps) {
          if (mulZ > 0) {
            mulZ*=-1
            rot*=-1
            return
          }
        }
      }
      for (let i = 0; i < currentN.length; i++) {
        if (calculateDistance(currentN[i], PLANE.BACK) < eps) {
          if (mulZ < 0) {
            mulZ*=-1
            rot*=-1
            return
          }
        }
      }
      for (let i = 0; i < currentN.length; i++) {
        if (calculateDistance(currentN[i], PLANE.TOP) < eps) {
          if (mulY > 0) {
            mulY*=-1
            return
          }
        }
      }
      for (let i = 0; i < currentN.length; i++) {
        if (calculateDistance(currentN[i], PLANE.BOTTOM) < eps) {
          if (mulY < 0) {
            mulY*=-1
            return
          }
        }
      }
      for (let i = 0; i < currentN.length; i++) {
        if (calculateDistance(currentN[i], PLANE.RIGHT) < eps) {
          if (mulX > 0) {
            mulX*=-1
            rot*=-1
            return
          }
        }
      }
      for (let i = 0; i < currentN.length; i++) {
        if (calculateDistance(currentN[i], PLANE.LEFT) < eps) {
          if (mulX < 0) {
            mulX*=-1
            rot*=-1
            return
          }
        }
      }
    }
    
    function render() {
      glMatrix.mat4.lookAt(vm,
        [0.0, 0.0, camZ],  //posisi kamera
        [0.0, 0.0, -1.5], //kemana kamera menghadap (vektor)
        [0.0, 1.0, 0.0]
      )
      gl.uniformMatrix4fv(vmLoc, false, vm)

      gl.clear(gl.COLOR_BUFFER_BIT)
      if (axis[x]) glMatrix.mat4.rotateX(mm, mm, speed)
      if (axis[y]) glMatrix.mat4.rotateY(mm, mm, speed)
      if (axis[z]) glMatrix.mat4.rotateZ(mm, mm, speed)
      gl.uniformMatrix4fv(mmLoc, false, mm)
      gl.drawArrays(gl.LINES, 0, 24)

      currentCube = []
      for (let i = 0; i < cubePoints.length; i++) {
        var t = mat_mul(mm, [...cubePoints[i], 1.0])
        currentCube.push(t)
      }

      PLANE.FRONT = [currentCube[0], currentCube[1], currentCube[2]]
      PLANE.BACK = [currentCube[4], currentCube[5], currentCube[6]]
      PLANE.TOP = [currentCube[1], currentCube[2], currentCube[6]]
      PLANE.BOTTOM = [currentCube[0], currentCube[3], currentCube[7]]
      PLANE.RIGHT = [currentCube[2], currentCube[3], currentCube[7]]
      PLANE.LEFT = [currentCube[0], currentCube[1], currentCube[5]]

      glMatrix.mat4.copy(temp, mm)

      glMatrix.mat4.translate(mm, mm, [transX, transY, transZ])
      glMatrix.mat4.rotateY(mm, mm, rotator)
      glMatrix.mat4.scale(mm, mm, [0.5, 0.5, 0.5])
      gl.uniformMatrix4fv(mmLoc, false, mm)
      gl.drawArrays(gl.TRIANGLES, 24, nTriangles.length/6)

      let indices = [
        0, 1, 2, 3, 5, 6, 7, 8,
        10, 11, 12, 13, 15, 16, 17, 18
      ]
      currentN = []
      for (let i = 0; i < indices.length; i++) {
        var t = mat_mul(mm, [...nPoints[indices[i]], 1.0])
        currentN.push(t)
      }

      glMatrix.mat4.copy(mm, temp)
      gl.uniformMatrix4fv(mmLoc, false, mm)

      checkCollision()

      rotator += rot
      transX += mulX
      transY += mulY
      transZ += mulZ
      
      requestAnimationFrame(render)
    }

    gl.clearColor(0.0, 0.0, 0.0, 1.0)
    gl.enable(gl.DEPTH_TEST)
    render()
  }
})();