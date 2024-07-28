// project.ts
// KISSG
// Copyright (c) 2024 Elijah R
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
// SPDX-License-Identifier: GPL-3.0

import { kissgrc } from "./kissgrc";
import * as toml from 'toml';
import { readFile } from 'fs/promises';
import path from "path";

export class KissgProject {
    private rc: kissgrc;
    private dir: string;

    constructor(rc: kissgrc, dir: string) {
        this.rc = rc;
        this.dir = dir;
    }

    static async Load(project: string): Promise<KissgProject> {
        let rc: kissgrc;
        try {
            let rcraw = await readFile(path.join(project, 'kissgrc.toml'), 'utf8');
            rc = toml.parse(rcraw);
        } catch (e) {
            console.error(`Failed to read or parse kissgrc.toml: ${(e as Error).message}`);
            process.exit(1);
        }
        return new KissgProject(rc, project);
    }

    getRc() {
        return structuredClone(this.rc);
    }

    async getIndexTemplate() {
        return await readFile(path.join(this.dir, this.rc.index.htmlTemplate), 'utf8');
    }

    async getTemplate() {
        return await readFile(path.join(this.dir, this.rc.source.htmlTemplate), 'utf8');
    }
}