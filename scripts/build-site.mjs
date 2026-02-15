import { copyFile, mkdir, readdir, readFile, writeFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');
const siteSrc = join(rootDir, 'site');
const distSrc = join(rootDir, 'dist');
const bundleSrc = join(rootDir, 'bundles');
const siteOut = join(rootDir, '_site');

async function buildSite() {
    console.log('🏗️  Building Static Site...');

    try {
        await mkdir(siteOut, { recursive: true });
        
        // 1. Copy Site Scaffold
        const siteFiles = await readdir(siteSrc);
        for (const file of siteFiles) {
            await copyFile(join(siteSrc, file), join(siteOut, file));
        }

        // 2. Prepare Data Directory (Mirror structure for relative paths)
        await mkdir(join(siteOut, 'dist'), { recursive: true });
        const distFiles = await readdir(distSrc);
        for (const file of distFiles) {
            await copyFile(join(distSrc, file), join(siteOut, 'dist', file));
        }

        // 3. Copy Logo
        await copyFile(join(rootDir, 'mcp-tool-registry_logo.png'), join(siteOut, 'mcp-tool-registry_logo.png'));

        // 4. Generate LLMs.txt (AI-Native Context)
        console.log('🤖 Generating LLMs.txt...');
        const index = JSON.parse(await readFile(join(distSrc, 'registry.index.json'), 'utf-8'));
        
        let llmsTxt = `# MCP Tool Registry Context\n\n`;
        llmsTxt += `This file provides context for LLMs to understand the tools available in the registry.\n`;
        llmsTxt += `The registry contains ${index.length} tools for Model Context Protocol.\n\n`;
        
        llmsTxt += `## Bundles\n`;
        llmsTxt += `- core: Essential utilities (start here)\n`;
        llmsTxt += `- agents: Autonomous agent frameworks\n`;
        llmsTxt += `- ops: DevOps and infrastructure management\n`;
        llmsTxt += `- evaluation: Benchmarking and testing tools\n\n`;
        
        llmsTxt += `## Tool Index\n`;
        index.forEach(tool => {
            const tags = (tool.tags || []).join(', ');
            llmsTxt += `- **${tool.id}**: ${tool.description} (Tags: ${tags})\n`;
        });
        
        await writeFile(join(siteOut, 'dist', 'registry.llms.txt'), llmsTxt);
        console.log('   ✅ Wrote dist/registry.llms.txt');

        console.log('✅ Site build complete in _site/');

    } catch (error) {
        console.error('❌ Error building site:', error);
        process.exit(1);
    }
}

buildSite();
