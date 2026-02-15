import { readFile, access } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import assert from 'assert';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');
const siteDir = join(rootDir, '_site');

async function runSmokeTests() {
    console.log('🔥 Running site smoke tests...');

    try {
        // 1. Check Site Directory Existence
        try {
            await access(siteDir);
        } catch {
            throw new Error(`_site directory not found at ${siteDir}. Did you run build:site?`);
        }
        console.log('   ✅ _site directory exists');

        // 2. Check Index HTML
        await access(join(siteDir, 'index.html'));
        console.log('   ✅ index.html exists');

        // 3. Check Data Artifacts in _site/dist
        const indexContent = await readFile(join(siteDir, 'dist', 'registry.index.json'), 'utf-8');
        const index = JSON.parse(indexContent);
        assert.ok(Array.isArray(index), 'registry.index.json should be an array');
        assert.ok(index.length > 0, 'registry.index.json should not be empty');
        console.log('   ✅ registry.index.json is valid');

        // 4. Check Known Tool (Deterministic)
        const knownTool = index.find(t => t.id === 'accessibility-suite');
        assert.ok(knownTool, 'Must contain known tool "accessibility-suite"');
        console.log('   ✅ Known tool accessibility-suite found');

        // 5. Check LLMs.txt
        const llmsTxt = await readFile(join(siteDir, 'dist', 'registry.llms.txt'), 'utf-8');
        assert.ok(llmsTxt.includes('MCP Tool Registry Context'), 'llms.txt has correct header');
        console.log('   ✅ registry.llms.txt is valid');

        console.log('🎉 Site smoke tests passed!');

    } catch (error) {
        console.error('❌ Smoke test failed:', error.message);
        process.exit(1);
    }
}

runSmokeTests();
