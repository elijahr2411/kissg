const fs = require('fs');
const childprocess = require('child_process');

function run(cmd) {
    try {
        childprocess.execSync(cmd, {stdio: 'inherit', });
    } catch (e) {
        process.exit(e.status);
    }
}

// Compile typescript
console.log("Running the typescript compiler");
run('tsc');
// Copy static files
console.log("Copying static files");
fs.cpSync('static/.', 'dist', {recursive: true, force: true});