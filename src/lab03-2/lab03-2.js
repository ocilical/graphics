"use strict";
var Lab03_2;
(function (Lab03_2) {
    // These variables must be global variables.
    // Some callback functions may need to access them.
    let gl;
    let canvas;
    let ctm_location;
    const ctms = [
        rotateX(0),
        rotateX(-30),
        rotateX(-60),
        rotateX(-90),
    ];
    let ctm_index = 0;
    let degs = [0, 30, 60, 90];
    const segments = 128;
    let positions;
    // keep track of stuff for switching model
    let cubeVerts;
    let coneVerts;
    let cylinderVerts;
    let offset;
    let currNumVerts;
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
        positions = [];
        let cube = Mesh.cube();
        cubeVerts = cube.length;
        positions.push(...cube);
        let cone = Mesh.cone(segments);
        coneVerts = cone.length;
        positions.push(...cone);
        let cylinder = Mesh.cylinder(segments);
        cylinderVerts = cylinder.length;
        positions.push(...cylinder);
        offset = 0;
        currNumVerts = cubeVerts;
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
        // Set the ctm
        gl.uniformMatrix4fv(ctm_location, false, to1DF32Array(ctms[ctm_index]));
        // Draw the object
        gl.drawArrays(gl.TRIANGLES, offset, currNumVerts);
    }
    function keyDownCallback(event) {
        switch (event.key) {
            case " ":
                ctm_index += 1;
                if (ctm_index === 4)
                    ctm_index = 0;
                console.log("Tilting backward " + degs[ctm_index] + " degrees");
                display();
                break;
            case "c":
                offset = 0;
                currNumVerts = cubeVerts;
                console.log("Displaying cube");
                display();
                break;
            case "o":
                offset = cubeVerts;
                currNumVerts = coneVerts;
                console.log("Displaying cone");
                display();
                break;
            case "l":
                offset = cubeVerts + coneVerts;
                currNumVerts = cylinderVerts;
                console.log("Displaying cylinder");
                display();
                break;
        }
    }
    function main() {
        canvas = document.getElementById("gl-canvas");
        if (initGL(canvas) === -1)
            return -1;
        if (init() === -1)
            return -1;
        document.addEventListener('keydown', keyDownCallback);
        display();
    }
    Lab03_2.main = main;
})(Lab03_2 || (Lab03_2 = {}));
