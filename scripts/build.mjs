import fs from 'node:fs';
fs.mkdirSync('dist/server',{recursive:true});fs.mkdirSync('dist/.openai',{recursive:true});
const assets={};for(const [file,type] of [['index.html','text/html; charset=utf-8'],['workspace.js','text/javascript; charset=utf-8'],['camera-support.js','text/javascript; charset=utf-8'],['judge-demo.js','text/javascript; charset=utf-8'],['styles.css','text/css; charset=utf-8'],['readability.css','text/css; charset=utf-8'],['workflow.css','text/css; charset=utf-8']])assets['/'+file]={body:fs.readFileSync('dist/'+file,'utf8'),type};
assets['/demo/document.jpg']={body:fs.readFileSync('dist/assets/document-reference.jpg').toString('base64'),type:'image/jpeg',encoding:'base64'};
assets['/civilian-rules.js']={body:fs.readFileSync('server/civilian.mjs','utf8'),type:'text/javascript; charset=utf-8'};
assets['/check-rules.js']={body:fs.readFileSync('server/checks.mjs','utf8'),type:'text/javascript; charset=utf-8'};
fs.writeFileSync('dist/server/assets.mjs','export const assets='+JSON.stringify(assets)+';');
fs.copyFileSync('server/worker.mjs','dist/server/index.js');fs.copyFileSync('server/checks.mjs','dist/server/checks.mjs');fs.copyFileSync('.openai/hosting.json','dist/.openai/hosting.json');
if(fs.existsSync('drizzle'))fs.cpSync('drizzle','dist/.openai/drizzle',{recursive:true});console.log('Built SeemaDrishti Worker and workspace assets.');

fs.copyFileSync('server/civilian.mjs','dist/server/civilian.mjs');
