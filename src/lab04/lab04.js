"use strict";
var Lab04;
(function (Lab04) {
    // These variables must be global variables.
    // Some callback functions may need to access them.
    let gl;
    let canvas;
    let ctm_location;
    let identity = [
        [1.0, 0.0, 0.0, 0.0],
        [0.0, 1.0, 0.0, 0.0],
        [0.0, 0.0, 1.0, 0.0],
        [0.0, 0.0, 0.0, 1.0]
    ];
    let ctm = identity;
    let isAnimating = true;
    // track number of times idle has been called, used to drive animation
    let animTime = 0;
    // for rotation
    let prevRot = [0, 0, 0];
    let targetRot = prevRot;
    let rotStart = 0;
    const rotTime = 120;
    let positions;
    const numSegments = 128;
    function initGL(canvas) {
        gl = canvas.getContext("webgl");
        if (!gl) {
            alert("WebGL is not available...");
            return -1;
        }
        // Set the clear screen color to black (R, G, B, A)
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        // Enable hidden surface removal
        gl.enable(gl.DEPTH_TEST);
        gl.enable(gl.CULL_FACE);
        return 0;
    }
    function init() {
        if (!gl)
            return -1;
        positions = Mesh.cube(); // Mesh.cylinder(numSegments);
        let colors = Mesh.randomColors(positions.length / 3);
        // Load and compile shader programs
        let shaderProgram = initShaders(gl, "vertex-shader", "fragment-shader");
        if (shaderProgram === -1)
            return -1;
        gl.useProgram(shaderProgram);
        // Allocate memory in a graphics card
        let buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, 4 * 4 * (positions.length + colors.length), gl.STATIC_DRAW);
        // Transfer positions and put it at the beginning of the buffer
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, to1DF32Array(positions));
        // Transfer colors and put it right after positions
        gl.bufferSubData(gl.ARRAY_BUFFER, 4 * 4 * positions.length, to1DF32Array(colors));
        // Vertex Position - locate and enable "vPosition"
        let vPosition_location = gl.getAttribLocation(shaderProgram, "vPosition");
        if (vPosition_location === -1) {
            alert("Unable to locate vPosition");
            return -1;
        }
        gl.enableVertexAttribArray(vPosition_location);
        // vPosition starts at offset 0
        gl.vertexAttribPointer(vPosition_location, 4, gl.FLOAT, false, 0, 0);
        // Vertex Color - locate and enable vColor
        let vColor_location = gl.getAttribLocation(shaderProgram, "vColor");
        if (vColor_location === -1) {
            alert("Unable to locate vColor");
            return -1;
        }
        gl.enableVertexAttribArray(vColor_location);
        // vColor starts at the end of positions
        gl.vertexAttribPointer(vColor_location, 4, gl.FLOAT, false, 0, 4 * 4 * positions.length);
        // Current Transformation Matrix - locate and enable "ctm"
        ctm_location = gl.getUniformLocation(shaderProgram, "ctm");
        if (ctm_location === null) {
            alert("Unable to locate ctm");
            return -1;
        }
        return 0;
    }
    function display() {
        if (!gl) {
            console.log("WebGL not initialized");
            return;
        }
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        // Set the ctm of the middle triangle
        gl.uniformMatrix4fv(ctm_location, false, to1DF32Array(ctm));
        // Draw the middle triangle
        gl.drawArrays(gl.TRIANGLES, 0, positions.length);
    }
    function idle() {
        let posMat = translate(0.5 * Math.cos((animTime / 20)), 0.25 * Math.sin(2 * (animTime / 20)), 0);
        let scaleMat = scale(0.25 * Math.sin((animTime / 10) * 0.4) + 0.5, 0.25 * Math.cos((animTime / 10) * 1.1 + 3) + 0.5, 0.25 * Math.cos((animTime / 10) * 1.6 + 6) + 0.5);
        let currRot = [
            lerp(prevRot[0], targetRot[0], (animTime - rotStart) / rotTime),
            lerp(prevRot[1], targetRot[1], (animTime - rotStart) / rotTime),
            lerp(prevRot[2], targetRot[2], (animTime - rotStart) / rotTime),
        ];
        // pick new rotation target if the previous target has been reached
        if (currRot[0] === targetRot[0] && currRot[2] === targetRot[2] && currRot[2] === targetRot[2]) {
            rotStart = animTime;
            prevRot = targetRot;
            targetRot = [360 * Math.random(), 360 * Math.random(), 360 * Math.random()];
        }
        let rotMat = matMul(matMul(rotateY(currRot[1]), rotateX(currRot[0])), rotateZ(currRot[2]));
        //ctm = matMul(rotMat, matMul(scaleMat, posMat));
        ctm = matMul(posMat, matMul(rotMat, scaleMat));
        // update time
        animTime += 1;
        // Draw
        display();
        if (isAnimating === true)
            requestAnimationFrame(idle);
    }
    // This function will be called when a mouse button is down inside the canvas.
    function mouseDownCallback(event) {
        console.log("mouseDownCallback(): " +
            "event.button = " + event.button +
            ", x = " + (event.clientX - canvas.offsetLeft) +
            ", y = " + (event.clientY - canvas.offsetTop));
    }
    // This function will be called when a mouse button is up inside the canvas
    function mouseUpCallback(event) {
        console.log("mouseUpCallback(): " +
            "event.button = " + event.button +
            ", x = " + (event.clientX - canvas.offsetLeft) +
            ", y = " + (event.clientY - canvas.offsetTop));
    }
    // This function will be called when a mouse pointer moves over the canvas.
    function mouseMoveCallback(event) {
        console.log("mouseMoveCallback(): " +
            "event.button = " + event.button +
            ", x = " + (event.clientX - canvas.offsetLeft) +
            ", y = " + (event.clientY - canvas.offsetTop));
    }
    // This function will be called when a keyboard is pressed.
    function keyDownCallback(event) {
        console.log("keyDownCallback(): " +
            "event.key = " + event.key);
        if (event.key === " ") {
            isAnimating = !isAnimating;
            if (isAnimating)
                requestAnimationFrame(idle);
        }
    }
    function main() {
        canvas = document.getElementById("gl-canvas");
        if (initGL(canvas) === -1)
            return -1;
        if (init() === -1)
            return -1;
        // Register callback functions
        // Comment out those that are not used.
        canvas.addEventListener("mousedown", mouseDownCallback);
        canvas.addEventListener("mouseup", mouseUpCallback);
        canvas.addEventListener("mousemove", mouseMoveCallback);
        document.addEventListener("keydown", keyDownCallback);
        display();
        if (isAnimating)
            requestAnimationFrame(idle);
    }
    Lab04.main = main;
})(Lab04 || (Lab04 = {}));
