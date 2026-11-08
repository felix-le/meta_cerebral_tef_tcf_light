const { cpSync, existsSync, mkdirSync, readdirSync } = require('node:fs');
const { join } = require('node:path');

const dist = join(process.cwd(), 'dist');
const source = join(dist, 'assets', 'node_modules', '@expo-google-fonts');
const target = join(dist, 'assets', 'fonts');

if (!existsSync(source)) {
    throw new Error(`Expo font assets were not found at ${source}. Run the web export first.`);
}

mkdirSync(target, { recursive: true });

for (const family of readdirSync(source, { withFileTypes: true })) {
    if (family.isDirectory()) {
        cpSync(join(source, family.name), join(target, family.name), { recursive: true });
    }
}

for (const file of readdirSync(join(dist, '_expo', 'static', 'js', 'web'))) {
    if (file.endsWith('.js')) {
        const path = join(dist, '_expo', 'static', 'js', 'web', file);
        const content = require('node:fs').readFileSync(path, 'utf8');
        require('node:fs').writeFileSync(
            path,
            content.replaceAll('/assets/node_modules/@expo-google-fonts/', '/assets/fonts/'),
        );
    }
}
