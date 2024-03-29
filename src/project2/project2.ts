namespace Project2 {
    // These variables must be global variables.
    // Some callback functions may need to access them.
    let gl: WebGLRenderingContext | null;
    let canvas: HTMLCanvasElement | null;
    let ctm_location: WebGLUniformLocation | null;
    let model_view_location: WebGLUniformLocation | null;
    let projection_location: WebGLUniformLocation | null;
    let ctm: mat4 = [
        [1.0, 0.0, 0.0, 0.0],
        [0.0, 1.0, 0.0, 0.0],
        [0.0, 0.0, 1.0, 0.0],
        [0.0, 0.0, 0.0, 1.0],
    ];
    const viewscale = 0.13;
    const projection: mat4 = Camera.frustum(-viewscale, viewscale, -viewscale, viewscale, -0.1, -100);

    const mazeWidth = 8;
    const mazeHeight = 8;
    export const maze = Maze.genMaze(mazeWidth, mazeHeight);
    console.log(Maze.toString(maze));

    type PlayerState =
        | "idle"
        | "walk"
        | "walkback"
        | "turnleft"
        | "turnright"
        | "flyup"
        | "flydown"
        | "map";

    let currState: PlayerState = "idle";

    // vectors for each direction

    const dirs: { [key in Maze.MazeDir]: vec4; } = {
        up: [0, 0, -1, 0],
        down: [0, 0, 1, 0],
        left: [-1, 0, 0, 0],
        right: [1, 0, 0, 0],
    };

    const leftDirs: { [key in Maze.MazeDir]: Maze.MazeDir; } = {
        up: "left",
        left: "down",
        down: "right",
        right: "up",
    };

    const rightDirs: { [key in Maze.MazeDir]: Maze.MazeDir; } = {
        up: "right",
        right: "down",
        down: "left",
        left: "up",
    };

    // is automatic solving happening right now?
    let solving = false;
    let solvePath: Maze.MazeDir[] | null;
    let currPathIndex = 0;

    // for tracking the current animation
    let animTime = 0;
    const animLength = 15;
    let animStart = 0;
    let animStartPos: vec4 = [0, 0, 0, 0];
    let animTarget: vec4 = [0, 0, 0, 0];

    const mapViewPos: vec4 = [3.5, 5, 3.5, 1];
    const mapViewDir: vec4 = [0, -1, 0, 0];

    let currPos: vec4 = [-1, 0.5, 0, 1];
    let savedPos: vec4 = [0, 0, 0, 1];
    let currDirName: Maze.MazeDir = "right";
    let currDir: vec4 = dirs[currDirName];

    const idleUp: vec4 = [0, 1, 0, 0];
    let currUp = idleUp;

    let model_view: mat4 = Camera.lookAt(currPos, vecAdd(currPos, currDir), currUp);
    let positions: vec4[];

    function initGL(canvas: HTMLCanvasElement) {
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
        if (!gl) return -1;
        positions = Maze.toMesh(maze);

        let colors: vec4[] = Maze.groundColor().concat([...Array(Math.ceil(positions.length / 36) - 1)].flatMap(Mesh.cubeAxisColors));

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
        model_view_location = gl.getUniformLocation(shaderProgram, "model_view");
        if (model_view_location === null) {
            alert("Unable to locate model_view");
            return -1;
        }
        projection_location = gl.getUniformLocation(shaderProgram, "projection");
        if (projection_location === null) {
            alert("Unable to locate projection");
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

        gl.uniformMatrix4fv(ctm_location, false, to1DF32Array(ctm));
        gl.uniformMatrix4fv(model_view_location, false, to1DF32Array(model_view));
        gl.uniformMatrix4fv(projection_location, false, to1DF32Array(projection));

        gl.drawArrays(gl.TRIANGLES, 0, positions.length);
    }

    function idle() {
        switch (currState) {
            case "idle":
                if (!solving) break;

                if (currPathIndex >= solvePath!.length) {
                    solving = false;
                } else if (solvePath![currPathIndex] === currDirName) {
                    currPathIndex++;
                    walk();
                } else if (solvePath![currPathIndex] === leftDirs[currDirName]) {
                    turnLeft();
                } else {
                    turnRight();
                }
                break;
            case "walk":
                if (animTime >= animStart + animLength) {
                    currPos = animTarget;
                    currState = "idle";
                    break;
                }
                currPos = vecLerp(animStartPos, animTarget, (animTime - animStart) / animLength);
                break;
            case "walkback":
                if (animTime >= animStart + animLength) {
                    currPos = animTarget;
                    currState = "idle";
                    break;
                }
                currPos = vecLerp(animStartPos, animTarget, (animTime - animStart) / animLength);
                break;
            case "turnleft":
                if (animTime >= animStart + animLength) {
                    currDir = animTarget;
                    currState = "idle";
                    break;
                }
                currDir = vecLerp(animStartPos, animTarget, (animTime - animStart) / animLength);
                break;
            case "turnright":
                if (animTime >= animStart + animLength) {
                    currDir = animTarget;
                    currState = "idle";
                    break;
                }
                currDir = vecLerp(animStartPos, animTarget, (animTime - animStart) / animLength);
                break;
            case "flyup":
                if (animTime >= animStart + animLength) {
                    currPos = mapViewPos;
                    currDir = mapViewDir;
                    currUp = dirs[currDirName];
                    currState = "map";
                    break;
                }
                currPos = vecLerp(savedPos, mapViewPos, (animTime - animStart) / animLength);
                currDir = vecLerp(dirs[currDirName], mapViewDir, (animTime - animStart) / animLength);
                currUp = vecLerp(idleUp, dirs[currDirName], (animTime - animStart) / animLength);
                break;
            case "flydown":
                if (animTime >= animStart + animLength) {
                    currPos = savedPos;
                    currDir = dirs[currDirName];
                    currUp = idleUp;
                    currState = "idle";
                    break;
                }
                currPos = vecLerp(mapViewPos, savedPos, (animTime - animStart) / animLength);
                currDir = vecLerp(mapViewDir, dirs[currDirName], (animTime - animStart) / animLength);
                currUp = vecLerp(dirs[currDirName], idleUp, (animTime - animStart) / animLength);
                break;
            case "map":
                break;
            default:
                throw new Error(`${currState} is not a defined state, something has gone horribly wrong`);
        }

        animTime += 1;

        model_view = Camera.lookAt(currPos, vecAdd(currPos, currDir), currUp);
        // Draw
        display();

        requestAnimationFrame(idle);
    }

    function walk() {
        if (currState !== "idle") {
            return;
        }
        animStart = animTime;
        animStartPos = currPos;
        animTarget = vecAdd(currPos, currDir);
        currState = "walk";
    }

    function walkback() {
        if (currState !== "idle") {
            return;
        }
        animStart = animTime;
        animStartPos = currPos;
        animTarget = vecAdd(currPos, vecScale(-1, currDir));
        currState = "walkback";
    }

    function turnLeft() {
        if (currState !== "idle") {
            return;
        }
        animStart = animTime;
        animStartPos = currDir;
        currDirName = leftDirs[currDirName];
        animTarget = dirs[currDirName];

        currState = "turnleft";
    }

    function turnRight() {
        if (currState !== "idle") {
            return;
        }
        animStart = animTime;
        animStartPos = currDir;
        currDirName = rightDirs[currDirName];
        animTarget = dirs[currDirName];

        currState = "turnright";
    }

    function mapToggle() {
        if (currState === "idle") {
            savedPos = currPos;
            animStart = animTime;

            currState = "flyup";
        } else if (currState === "map") {
            animStart = animTime;

            currState = "flydown";
        }
    }

    function solveMaze() {
        if (currState !== "idle") {
            return;
        }
        solvePath = Maze.solveMaze(maze, currPos[2], currPos[0]);
        currPathIndex = 0;
        solving = solvePath !== null;
    }

    // This function will be called when a keyboard is pressed.
    function keyDownCallback(event: KeyboardEvent) {
        if (solving) {
            return;
        }
        switch (event.key) {
            case "w":
            case "W":
                walk();
                break;
            case "a":
            case "A":
                turnLeft();
                break;
            case "s":
            case "S":
                walkback();
                break;
            case "d":
            case "D":
                turnRight();
                break;
            case " ":
                mapToggle();
                break;
            case "c":
            case "C":
                solveMaze();
                break;
        }
    }

    export function main() {
        canvas = document.getElementById("gl-canvas") as HTMLCanvasElement;
        if (initGL(canvas) === -1)
            return -1;
        if (init() === -1)
            return -1;

        // Register callback functions
        // Comment out those that are not used.
        document.addEventListener("keydown", keyDownCallback);

        display();

        requestAnimationFrame(idle);
    }
}
