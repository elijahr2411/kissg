// build.ts
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

import { OptionDefinition } from "command-line-args";
import { KissgProject } from "./project";
import cli from 'command-line-args';
import { mkdir, readFile, readdir, stat, writeFile } from "fs/promises";
import { KissgHeader } from "./kissgHeader";
import toml from 'toml';
import { Remarkable } from "remarkable";
import path from "path";

const BuildArgs: OptionDefinition[] = [

];

function doTemplate(source: string, definitions: { [key: string]: string }) {
    return source.replace(/\{\{(.+?)\}\}/g, (match: string, key: string) => {
        key = key.trim();
        return definitions[key] ?? "";
    });
}

interface kissgPage {
    title: string;
    path: string;
    date: Date;
}

async function buildFile(project: KissgProject, source: string, dest: string): Promise<kissgPage> {
    // Read the source file
    let sourceContent = await readFile(source, 'utf8');
    // Check for kissg config header
    let kissgHeader: KissgHeader;
    let kissgHeaderEnd ;
    if (sourceContent.startsWith("<kissg>") && (kissgHeaderEnd = sourceContent.lastIndexOf("</kissg>")) !== -1) {
        let headertxt = sourceContent.substring(7, kissgHeaderEnd);
        try {
            kissgHeader = toml.parse(headertxt);
        } catch (e) {
            console.error(`Failed to parse kissg header from ${source}: ${(e as Error).message}`);
            process.exit(1);
        }
    } else {
        kissgHeader = {};
        kissgHeaderEnd = 0;
    }
    // Parse the rest of the file
    let md = sourceContent.substring(kissgHeaderEnd);
    let remarkable = new Remarkable();
    let content = remarkable.render(md);
    // If title is not defined in the header, use the filename
    let filename = path.basename(source, '.md');
    let title = kissgHeader.title ?? filename;
    // Perform templating
    let template = await project.getTemplate();
    let html = doTemplate(template, {
        title,
        content
    });
    // Write the output file
    await writeFile(dest, html);
    // If date is not defined in the header, use the date the file was last modified
    let date = kissgHeader.date ? new Date(kissgHeader.date) : (await stat(source)).mtime;
    return {
        title,
        path: dest,
        date
    };
}

interface buildResult {
    pages: kissgPage[];
    count: number;
}

async function buildRecursive(project: KissgProject, srcdir?: string | undefined): Promise<buildResult> {
    let counter = 0;
    let outfiles = [];
    if (srcdir === undefined) {
        srcdir = project.getSrcDir();
    }
    let contents = await readdir(srcdir, {withFileTypes: true});
    let files = contents.filter(f => f.isFile() && f.name.endsWith('.md'));
    let dirs = contents.filter(f => f.isDirectory());
    // Build all files in the source directory
    let relativeDir = path.relative(project.getSrcDir(), srcdir);
    let destDir = path.join(project.getDestDir(), relativeDir);
    await mkdir(destDir, { recursive: true });
    for (let file of files) {
        let src = path.join(srcdir, file.name);
        let dest = path.join(destDir, path.basename(file.name, '.md') + '.html');
        outfiles.push(await buildFile(project, src, dest));
    }
    counter += files.length;
    // Recurse into subdirectories
    for (let dir of dirs) {
        let result = await buildRecursive(project, path.join(srcdir, dir.name));
        outfiles.push(...result.pages);
        counter += result.count;
    }
    return {
        pages: outfiles,
        count: counter
    };
}

async function buildIndex(project: KissgProject, pages: kissgPage[]) {
    // Sort pages by date (newest first)
    pages.sort((a, b) => b.date.getTime() - a.date.getTime());
    let template = await project.getTemplate();
    let title = project.getIndexTitle();
    let content = `<ul>${
        pages.map(page => `<li><a href="${page.path}">${page.title}</a></li>`).join('')
    }</ul>`;
    let html = doTemplate(template, {
        title,
        content
    });
    let dest = path.join(project.getDestDir(), 'index.html');
    await writeFile(dest, html);
}

export async function Build(argv: string[], project: KissgProject) {
    let cmdline = cli(BuildArgs, { argv });
    let res = await buildRecursive(project);
    console.log(`Built ${res.count} files`);
    if (project.buildIndex()) {
        await buildIndex(project, res.pages);
        console.log(`Built index page`);
    }
}