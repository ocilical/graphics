"use strict";
var Lab03;
(function (Lab03) {
    // These variables must be global variables.
    // Some callback functions may need to access them.
    let gl;
    let canvas;
    let ctm_location;
    // made my own transformation matrices to make it easier to see the cone
    const ctms = [
        matMul(rotateX(0), scale(0.7, 0.7, 0.7)),
        matMul(rotateX(-30), scale(0.7, 0.7, 0.7)),
        matMul(rotateX(-60), scale(0.7, 0.7, 0.7)),
        matMul(rotateX(-90), scale(0.7, 0.7, 0.7)),
    ];
    // [
    //     [
    //         [1.0, 0.0, 0.0, 0.0],
    //         [0.0, 1.0, 0.0, 0.0],
    //         [0.0, 0.0, 1.0, 0.0],
    //         [0.0, 0.0, 0.0, 1.0]
    //     ],
    //     [
    //         [1.0, 0.0, 0.0, 0.0],
    //         [0.0, 0.87, -0.50, 0.0],
    //         [0.0, 0.50, 0.87, 0.0],
    //         [0.0, 0.0, 0.0, 1.0]
    //     ],
    //     [
    //         [1.0, 0.0, 0.0, 0.0],
    //         [0.0, 0.50, -0.87, 0.0],
    //         [0.0, 0.87, 0.50, 0.0],
    //         [0.0, 0.0, 0.0, 1.0]
    //     ],
    //     [
    //         [1.0, 0.0, 0.0, 0.0],
    //         [0.0, 0.0, -1.0, 0.0],
    //         [0.0, 1.0, 0.0, 0.0],
    //         [0.0, 0.0, 0.0, 1.0]
    //     ]
    // ];
    let ctm_index = 0;
    let degs = [0, 30, 60, 90];
    const coneSegments = 128;
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
        let positions = Lab03.genCone(coneSegments);
        let colors = Lab03.randomColors(coneSegments * 2);
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
        // Set the ctm
        gl.uniformMatrix4fv(ctm_location, false, to1DF32Array(ctms[ctm_index]));
        // Draw the object
        gl.drawArrays(gl.TRIANGLES, 0, coneSegments * 6);
    }
    function keyDownCallback(event) {
        if (event.key === " ") {
            ctm_index += 1;
            if (ctm_index === 4)
                ctm_index = 0;
            console.log("Tilting backward " + degs[ctm_index] + " degrees");
            display();
        }
    }
    function main() {
        canvas = document.getElementById("gl-canvas");
        if (initGL(canvas) === -1)
            return -1;
        if (init() === -1)
            return -1;
        document.addEventListener("keydown", keyDownCallback);
        display();
    }
    Lab03.main = main;
})(Lab03 || (Lab03 = {}));
