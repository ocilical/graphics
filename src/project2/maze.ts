namespace Maze {
    /**
     * A single cell of the maze,
     * if up/down/left/right is true, there is a wall in that direction
     */
    export interface MazeCell {
        up: boolean;
        down: boolean;
        left: boolean;
        right: boolean;
    }

    export type MazeDir =
        | "up"
        | "down"
        | "left"
        | "right";

    /**
     * generate new maze, mazes are row major, *NOT* column major
     * @param width width of new maze
     * @param height height of new maze
     * @returns new maze, as a 2d array of `MazeCell`s
     */
    export function genMaze(width: number, height: number): MazeCell[][] {
        // set up outer walls
        let maze: MazeCell[][] = [...Array(height)].map((_, row): MazeCell[] => {
            return [...Array(width)].map((_, col): MazeCell => {
                return {
                    up: (row === 0),
                    down: (row === (height - 1)),
                    left: (col === 0),
                    right: (col === (width - 1)),
                };
            });
        });

        // fun recursive part
        genMazeHelper(maze, [0, height - 1, 0, width - 1]);

        // make entrance/exit
        maze[0][0].left = false;
        maze[maze.length - 1][maze[0].length - 1].right = false;

        return maze;
    }

    /**
     * recursive helper function for genMaze
     * @param maze maze to recurseively generate
     * @param bounds bounds to generate it, used as `[rowStart, rowEnd, colStart, colEnd]`
     */
    function genMazeHelper(maze: MazeCell[][], bounds: [number, number, number, number]): void {
        let [rowStart, rowEnd, colStart, colEnd] = bounds;
        if (rowEnd - rowStart < 1 || colEnd - colStart < 1) {
            return;
        }

        // refers to down right corner of picked index
        let [randRow, randCol] = [randInt(rowStart, rowEnd), randInt(colStart, colEnd)];

        // put in new vertical wall
        for (let row = rowStart; row <= rowEnd; row++) {
            maze[row][randCol].right = true;
            maze[row][randCol + 1].left = true;
        }

        // put in new horizontal wall
        for (let col = colStart; col <= colEnd; col++) {
            maze[randRow][col].down = true;
            maze[randRow + 1][col].up = true;
        }

        // pick hole to not poke
        let skippedHole = randInt(0, 4);
        // poke holes
        if (skippedHole !== 0) {
            // up hole
            let holeRow = randInt(rowStart, randRow + 1);
            maze[holeRow][randCol].right = false;
            maze[holeRow][randCol + 1].left = false;
        }
        if (skippedHole !== 1) {
            // down hole
            let holeRow = randInt(randRow + 1, rowEnd);
            maze[holeRow][randCol].right = false;
            maze[holeRow][randCol + 1].left = false;

        }
        if (skippedHole !== 2) {
            // left hole
            let holeCol = randInt(colStart, randCol + 1);
            maze[randRow][holeCol].down = false;
            maze[randRow + 1][holeCol].up = false;
        }
        if (skippedHole !== 3) {
            // right hole
            let holeCol = randInt(randCol + 1, colEnd);
            maze[randRow][holeCol].down = false;
            maze[randRow + 1][holeCol].up = false;
        }


        //console.log(toString(maze));

        // recurse
        // up left corner
        genMazeHelper(maze, [rowStart, randRow, colStart, randCol]);
        // down left corner
        genMazeHelper(maze, [randRow + 1, rowEnd, colStart, randCol]);
        // up right corner
        genMazeHelper(maze, [rowStart, randRow, randCol + 1, colEnd]);
        // down right corner
        genMazeHelper(maze, [randRow + 1, rowEnd, randCol + 1, colEnd]);
    }

    /**
     * get a random integer
     * @param min minimum (inclusive)
     * @param max maximum (exclusive)
     * @returns random integer
     */
    function randInt(min: number, max: number): number {
        return Math.floor(Math.random() * (Math.floor(max) - Math.ceil(min)) + Math.ceil(min));
    }

    /**
     * turn a maze into a string
     * @param maze the maze
     * @returns a string that looks like the maze when printed
     */
    export function toString(maze: MazeCell[][]): string {
        let res: string[] = [...Array(maze.length * 2 + 1)].map(() => "");

        // do top wall
        for (let i = 0; i < maze[0].length; i++) {
            res[0] = res[0].concat("+");
            if (maze[0][i].up) {
                res[0] = res[0].concat("---");
            } else {
                res[0] = res[0].concat("   ");
            }
        }
        res[0] = res[0].concat("+");

        // do left wall
        for (let i = 0; i < maze.length; i++) {
            if (maze[i][0].left) {
                res[i * 2 + 1] = res[i * 2 + 1].concat("|");
            } else {
                res[i * 2 + 1] = res[i * 2 + 1].concat(" ");
            }
            res[i * 2 + 2] = res[i * 2 + 2].concat("+");
        }

        // do rest of maze
        for (let row = 0; row < maze.length; row++) {
            for (let col = 0; col < maze[0].length; col++) {
                // middle of cell and right wall
                res[row * 2 + 1] = res[row * 2 + 1].concat("   ");
                if (maze[row][col].right) {
                    res[row * 2 + 1] = res[row * 2 + 1].concat("|");
                } else {
                    res[row * 2 + 1] = res[row * 2 + 1].concat(" ");
                }

                // bottom wall and "vertex" bit
                if (maze[row][col].down) {
                    res[row * 2 + 2] = res[row * 2 + 2].concat("---");
                } else {
                    res[row * 2 + 2] = res[row * 2 + 2].concat("   ");
                }
                res[row * 2 + 2] = res[row * 2 + 2].concat("+");
            }
        }

        return res.join("\n");
    }

    export function groundColor(): vec4[] {
        return [...Array(36)].map(() => [0.5, 0.5, 0.5, 1.0]);
    }

    /**
     * turn a maze into a 3d object, width/columns are on the x axis, height/rows are on the z axis
     * @param maze maze to make a mesh of
     * @returns array of verts, size will be a multiple of 36
     */
    export function toMesh(maze: MazeCell[][]): vec4[] {
        const res: vec4[] = [];

        // create and add base, 1 unit wide padding around the edge
        const baseTrans = composeTrans(translate(-1.5, 0, -1.5), scale(maze[0].length + 2, 0.1, maze.length + 2), translate(0.5, 0, 0.5));
        res.push(...(Mesh.cube().map(v => matVecMul(baseTrans, v))));

        // do pillars
        // scale pillar correctly and move it up a bit
        const pillarShape = composeTrans(translate(0, 0.5, 0), scale(0.1, 1, 0.1));
        for (let row = 0; row < maze.length + 1; row++) {
            for (let col = 0; col < maze[0].length + 1; col++) {
                const pillarTrans = composeTrans(translate(col - 0.5, 0, row - 0.5), pillarShape);
                res.push(...(Mesh.cube().map(v => matVecMul(pillarTrans, v))));
            }
        }

        // walls
        const zWallShape = composeTrans(translate(0, 0.45, 0), scale(0.05, 0.9, 1));
        const zWallleft = translate(-0.5, 0, 0);
        const zWallright = translate(0.5, 0, 0);

        const xWallShape = composeTrans(translate(0, 0.45, 0), scale(1, 0.9, 0.05));
        const xWallup = translate(0, 0, -0.5);
        const xWalldown = translate(0, 0, 0.5);

        // do first two walls, just like tostring!
        for (let row = 0; row < maze.length; row++) {
            if (maze[row][0].left) {
                const wallTrans = composeTrans(zWallleft, translate(0, 0, row), zWallShape);
                res.push(...(Mesh.cube().map(v => matVecMul(wallTrans, v))));
            }
        }

        for (let col = 0; col < maze[0].length; col++) {
            if (maze[0][col].up) {
                const wallTrans = composeTrans(xWallup, translate(col, 0, 0), xWallShape);
                res.push(...(Mesh.cube().map(v => matVecMul(wallTrans, v))));
            }
        }

        // do the rest of the maze
        for (let row = 0; row < maze.length; row++) {
            for (let col = 0; col < maze[0].length; col++) {
                // right wall
                if (maze[row][col].right) {
                    const wallTrans = composeTrans(zWallright, translate(col, 0, row), zWallShape);
                    res.push(...(Mesh.cube().map(v => matVecMul(wallTrans, v))));
                }

                // down wall
                if (maze[row][col].down) {
                    const wallTrans = composeTrans(xWalldown, translate(col, 0, row), xWallShape);
                    res.push(...(Mesh.cube().map(v => matVecMul(wallTrans, v))));
                }
            }
        }

        return res;
    }

    /**
     * returns a cell from a maze accounting for the entrance and exit
     * @param maze maze to get a cell from
     * @param row position to get a cell from
     * @param col position to get a cell from
     * @returns cell
     */
    function getMazeCell(maze: MazeCell[][], row: number, col: number): MazeCell | null {
        // add entrance/exit
        if (row === 0 && col === -1) {
            return { up: true, down: true, left: true, right: false };
        } else if (row === (maze.length - 1) && col == maze[0].length) {
            return { up: true, down: true, left: false, right: true };
        } else if (row < 0 || row > maze.length || col < 0 || col > maze[0].length) {
            return null;
        }
        return maze[row][col];

    }

    /**
     * a messy function to generate a path through the maze
     * @param maze maze to solve
     * @param row position to start from
     * @param col position to start from
     * @returns list of directions to take
     */
    export function solveMaze(maze: MazeCell[][], row: number, col: number): MazeDir[] | null {
        // make sure the player is in the maze and it hasn't already been solved
        if (!getMazeCell(maze, row, col) || (row === maze.length - 1 && col == maze[0].length)) {
            return null;
        }
        // do a breadth first search of the maze keeping track of distance and where we came from
        // arrays are two columns wider to account for entrance/exit
        let queue: [number, number][] = [];
        let visited = [...Array(maze.length)].map(() => [...Array(maze.length + 2)].map(() => false));
        let dist = [...Array(maze.length)].map(() => [...Array(maze.length + 2)].map(() => Infinity));
        type viaPos = [number, number] | null;
        let via: viaPos[][] = [...Array(maze.length)].map(() => [...Array(maze.length + 2)].map(() => null));

        visited[row][col + 1] = true;
        dist[row][col + 1] = 0;
        queue.push([row, col]);

        while (queue.length > 0) {
            let [currRow, currCol] = queue.shift()!; // won't be undefined because queue length must be > 0
            let currCell = getMazeCell(maze, currRow, currCol)!; // won't be null because there's no way out of the maze

            if (currRow == maze.length - 1 && currCol == maze[0].length) {
                break;
            }

            // check every direction

            if (!currCell.up && !visited[currRow - 1][currCol + 1]) {
                visited[currRow - 1][currCol + 1] = true;
                dist[currRow - 1][currCol + 1] = dist[currRow][currCol + 1] + 1;
                via[currRow - 1][currCol + 1] = [currRow, currCol];
                queue.push([currRow - 1, currCol]);
            }

            if (!currCell.down && !visited[currRow + 1][currCol + 1]) {
                visited[currRow + 1][currCol + 1] = true;
                dist[currRow + 1][currCol + 1] = dist[currRow][currCol + 1] + 1;
                via[currRow + 1][currCol + 1] = [currRow, currCol];
                queue.push([currRow + 1, currCol]);
            }

            if (!currCell.left && !visited[currRow][currCol]) {
                visited[currRow][currCol] = true;
                dist[currRow][currCol] = dist[currRow][currCol + 1] + 1;
                via[currRow][currCol] = [currRow, currCol];
                queue.push([currRow, currCol - 1]);
            }

            if (!currCell.right && !visited[currRow][currCol + 2]) {
                visited[currRow][currCol + 2] = true;
                dist[currRow][currCol + 2] = dist[currRow][currCol + 1] + 1;
                via[currRow][currCol + 2] = [currRow, currCol];
                queue.push([currRow, currCol + 1]);
            }
        }

        // start at maze exit
        let currPos = [maze.length - 1, maze[0].length];
        let path = [];
        while (via[currPos[0]][currPos[1] + 1]) {
            path.push(via[currPos[0]][currPos[1] + 1]!);
            currPos = via[currPos[0]][currPos[1] + 1]!;
        }

        // turn path into directions
        let directions: MazeDir[] = [];
        for (let i = path.length - 1; i > 0; i--) {
            if (path[i][0] < path[i - 1][0]) {
                directions.push("down");
            } else if (path[i][0] > path[i - 1][0]) {
                directions.push("up");
            } else if (path[i][1] < path[i - 1][1]) {
                directions.push("right");
            } else {
                directions.push("left");
            }
        }
        // final step to get out of the maze
        directions.push("right");

        return directions;
    }
}
