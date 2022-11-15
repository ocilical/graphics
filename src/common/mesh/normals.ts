namespace Mesh {
    /**
     * generate normals for any mesh, results in flat shading
     * @param verts array of verts (must be divisible by 3)
     * @returns array of normals
     */
    export function calcNormals(verts: vec4[]): vec4[] {
        let res: vec4[] = [];

        for (let i = 0; i < verts.length; i += 3) {
            let normal = vecNorm(vecCross(vecSub(verts[i + 1], verts[i]), vecSub(verts[i + 2], verts[i])));
            res.push(normal, normal, normal);
        }

        return res;
    }

    /**
     * calculate normals of a sphere
     * @param verts array of vertices, must be a sphere
     * @returns array of normals
     */
    export function calcSphereNormals(verts: vec4[]): vec4[] {
        return verts.map(v => vecNorm([v[0], v[1], v[2], 0.0]));
    }
}
