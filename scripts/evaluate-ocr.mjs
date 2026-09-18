import fs from 'node:fs';
import {createWorker,PSM} from 'tesseract.js';
const input=process.argv[2],out=process.argv[3];
if(!input||!out)throw new Error('Usage: node scripts/evaluate-ocr.mjs IMAGE OUTPUT.json');
const worker=await createWorker('eng',1,{cachePath:'../../work',logger:m=>{if(m.status==='recognizing text'&&m.progress===1)console.log('Recognition complete')}});
try{await worker.setParameters({tessedit_pageseg_mode:PSM.AUTO});const {data}=await worker.recognize(input,{}, {text:true,blocks:true});fs.writeFileSync(out,JSON.stringify(data,null,2));console.log(JSON.stringify({confidence:data.confidence,text:data.text}));}finally{await worker.terminate();}
