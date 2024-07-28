// kissgrc.ts
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

export interface kissgrc {
    source: {
        sourceDirectory: string;
        htmlTemplate: string;
    }
    index: {
        enable: boolean;
        listItemTemplate: string;
        htmlTemplate: string;
    }
    output: {
        outputDirectory: string;
    }
}