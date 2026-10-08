import {build} from 'esbuild';
import {readFile,writeFile} from 'node:fs/promises';
const result=await build({entryPoints:['src/main.tsx'],bundle:true,write:false,outdir:'standalone',format:'iife',platform:'browser',target:'es2022',minify:true,define:{'process.env.NODE_ENV':'"production"','import.meta.env.BASE_URL':'"./"'},legalComments:'none'});
const js=result.outputFiles.find(f=>f.path.endsWith('.js')).text.replace(/<\/script/gi,'<\\/script');
const css=result.outputFiles.find(f=>f.path.endsWith('.css')).text;
const favicon=await readFile('public/favicon.svg','utf8');
const html=`<!doctype html><html lang="mn"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#35694e"><title>Амьтдын пикник</title><link rel="icon" href="data:image/svg+xml,${encodeURIComponent(favicon)}"><style>${css}</style></head><body><div id="root"></div><script>${js}</script></body></html>`;
await writeFile('dist/animal-picnic.html',html);console.log('Standalone offline game: dist/animal-picnic.html');
