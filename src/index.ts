// index.ts
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

// Parse the subcommand and pass execution to the appropriate module
import cli, { OptionDefinition } from 'command-line-args';
import { readFile, cp } from 'fs/promises';
// Yeah I know this is deprecated, the whole reason for said deprecation doesn't even apply here
import { existsSync } from 'fs';
import { Build } from './build';
import path from 'path';
import { KissgProject } from './project';

(async () => {
    const subcommandDefinitions: OptionDefinition[] = [
        { name: 'command', defaultOption: true },
        { name: 'project', alias: 'p', type: String },
    ];
    
    const cmdline = cli(subcommandDefinitions, {stopAtFirstUnknown: true});
    
    const command = cmdline.command ?? 'build';
    const projectdir = cmdline.project ?? process.cwd();
    const argv = cmdline._unknown ?? [];
    
    switch (command) {
        case 'init': 
            // Copy the skeleton project to the current directory
            if (existsSync(path.join(projectdir, 'kissgrc.toml'))) {
                console.error(`A kissgrc.toml file already exists in this directory.`);
                console.error(`To confirm that you want to overwrite the project in this directory, please delete the existing kissgrc.toml file.`);
                process.exit(1);
            }
            await cp(path.join(__dirname, "skeleton"), projectdir, { recursive: true });
            console.log(`Successfully initialized kissg project in ${projectdir}`);
            break;
        case 'build':
            const project = await KissgProject.Load(projectdir);
            await Build(argv, project);
            break;
        case 'help':
        default:
            console.log(await readFile(path.join(__dirname, "help.txt"), 'utf8'));
            break;
    }
})();