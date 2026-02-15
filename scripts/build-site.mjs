import { cp, copyFile, mkdir, readdir, readFile, writeFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');
const siteSrc = join(rootDir, 'site');
const distSrc = join(rootDir, 'dist');
const curationSrc = join(rootDir, 'curation');
const siteOut = join(rootDir, '_site');

async function buildSite() {
    console.log('🏗️  Building Static Site...');

    try {
        await mkdir(siteOut, { recursive: true });
        
        // 1. Copy Site Scaffold
        await cp(siteSrc, siteOut, { recursive: true });

        // 2. Prepare Data Directory
        // Copy everything from dist to _site/dist
        await cp(distSrc, join(siteOut, 'dist'), { recursive: true });

        // 3. (Legacy) Copy Curation Data to curation/ for backward compatibility 
        // if anything external relies on it, or just to keep source structure.
        // But the app now uses dist/featured.json. 
        // We'll leave the code to copy it but warn it might be deprecated.
        // Actually, let's remove the manual curation copy since it's now in dist.
        /* 
        await mkdir(join(siteOut, 'curation'), { recursive: true });
        let featuredData = { featured: [], collections: [] };
        try { ... } 
        */
       
       // Load featured data for LLMs.txt from the generated artifact
       let featuredData = { featured: [], collections: [] };
       try {
           featuredData = JSON.parse(await readFile(join(distSrc, 'featured.json'), 'utf-8'));
       } catch (e) { /* ignore */ }

        // 4. Copy Logo
        await copyFile(join(rootDir, 'mcp-tool-registry_logo.png'), join(siteOut, 'mcp-tool-registry_logo.png'));

        // 5. Generate LLMs.txt (AI-Native Context)
        console.log('🤖 Generating LLMs.txt...');
        const index = JSON.parse(await readFile(join(distSrc, 'registry.index.json'), 'utf-8'));
        
        let llmsTxt = `# MCP Tool Registry Context\n\n`;
        llmsTxt += `This file provides context for LLMs to understand the tools available in the registry.\n`;
        llmsTxt += `The registry contains ${index.length} tools for Model Context Protocol.\n\n`;
        
        if (featuredData.featured.length > 0) {
            llmsTxt += `## Featured Tools\n`;
            featuredData.featured.forEach(id => llmsTxt += `- ${id}\n`);
            llmsTxt += `\n`;
        }
        
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
        
        await writeFile(join(siteOut, 'LLMs.txt'), llmsTxt);
        console.log('   ✅ Wrote LLMs.txt');

        console.log('✅ Site build complete in _site/');

    } catch (error) {
        console.error('❌ Error building site:', error);
        process.exit(1);
    }
}

buildSite();
