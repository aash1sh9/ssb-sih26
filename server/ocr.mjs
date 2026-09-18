export const DOCUMENT_FIELDS=['passportName','passportNumber','nationality','passportDob','passportExpiry','visaName','visaNumber','visaDob','visaType','visaExpiry'];
const months={JAN:1,FEB:2,MAR:3,APR:4,MAY:5,JUN:6,JUL:7,AUG:8,SEP:9,OCT:10,NOV:11,DEC:12};
function valid(y,m,d){const s=`${y}-${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')}`;return /^\d{4}-\d{2}-\d{2}$/.test(s)&&Number.isFinite(Date.parse(s))&&new Date(s).toISOString().slice(0,10)===s?s:'';}
function dateValue(s){let m=s.match(/\b(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})\b/);if(m)return valid(+m[1],+m[2],+m[3]);m=s.match(/\b(\d{1,2})[\s./-]+([A-Z]{3})[A-Z]*[\s./-]+(\d{4})\b/i);if(m&&months[m[2].toUpperCase()])return valid(+m[3],months[m[2].toUpperCase()],+m[1]);m=s.match(/\b(\d{1,2})[./-](\d{1,2})[./-](\d{4})\b/);if(m)return valid(+m[3],+m[2],+m[1]);return '';}
function cleanName(s){return s.replace(/[^A-Za-z '\-]/g,' ').replace(/\s+/g,' ').trim().replace(/\s+[A-Za-z]{1,2}$/,'');}
function mrzDate(s,birth){const y=+s.slice(0,2),now=new Date().getUTCFullYear();return valid(birth&&2000+y>now?1900+y:2000+y,+s.slice(2,4),+s.slice(4,6));}
function digit(value){return [...value].reduce((s,c,i)=>s+(c==='<'?0:/\d/.test(c)?+c:c.charCodeAt(0)-55)*[7,3,1][i%3],0)%10;}
export function parseDocument(text,confidence=0){
 text=String(text||'').slice(0,24000);const lines=text.split(/\r?\n/).map(x=>x.trim()).filter(Boolean);const upper=text.toUpperCase();
 const compact=lines.map(s=>s.toUpperCase().replace(/\s/g,''));const mrz1=compact.findIndex(s=>/^[PV][A-Z<][A-Z]{3}[A-Z<]+$/.test(s)&&[36,44].includes(s.length));
 let documentType=/\bPASSPORT\b|PASSEPORT|PASAPORTE/i.test(text)?'passport':/\bVISA\b/i.test(text)?'visa':'unknown';
 const values={},evidence={},warnings=[];function set(k,v,basis){if(v){values[k]=v;evidence[k]=basis;}}
 let mrzValid=false;
 if(mrz1>=0){const first=compact[mrz1],second=compact[mrz1+1]||'';if(second.length===first.length&&/^[A-Z0-9<]{9}\d[A-Z<]{3}\d{6}\d[MF<]\d{6}\d/.test(second)){
 documentType=first[0]==='P'?'passport':'visa';const prefix=documentType==='visa'?'visa':'passport';
 mrzValid=digit(second.slice(0,9))===+second[9]&&digit(second.slice(13,19))===+second[19]&&digit(second.slice(21,27))===+second[27];
 if(mrzValid){set(prefix+'Name',first.slice(5).replace(/<+/g,' ').trim(),'MRZ');set(prefix+'Number',second.slice(0,9).replace(/</g,''),'MRZ');set(prefix+'Dob',mrzDate(second.slice(13,19),true),'MRZ');set(prefix+'Expiry',mrzDate(second.slice(21,27),false),'MRZ');set('nationality',second.slice(10,13),'MRZ');}else warnings.push('MRZ check digits do not agree with the OCR reading; inspect or recapture.');
 }}
 if(documentType==='unknown'&&/\bTYPE\s*[: ]+P\b/i.test(text))documentType='passport';
 const prefix=documentType==='visa'?'visa':'passport';
 function following(label,extract){for(let i=0;i<lines.length;i++){const m=lines[i].match(label);if(!m)continue;const after=lines[i].slice(m.index+m[0].length);for(const s of [after,...lines.slice(i+1,i+3)]){const v=extract(s);if(v)return {value:v,basis:lines[i]+' → '+s};}}return null;}
 const name=following(/\b(?:FULL\s*NAME|NAMES?|NAME\s+OF\s+HOLDER)\s*[:.]?/i,s=>{const v=cleanName(s);return v.length>=4&&!/passport|national|date|birth|given|surname|country|type|sex|issuing/i.test(v)&&v.split(' ').length>=2?v:'';});
 const surname=following(/\bSURNAME\s*[:.]?/i,s=>{const v=cleanName(s);return v.length>1&&!/given|name|date|birth|type/i.test(v)?v:''});
 const given=following(/\bGIVEN\s+NAMES?\s*[:.]?/i,s=>{const v=cleanName(s);return v.length>1&&!/national|date|birth|type/i.test(v)?v:''});
 if(!values[prefix+'Name']){if(surname&&given)set(prefix+'Name',surname.value+' '+given.value,surname.basis+' / '+given.basis);else if(name)set(prefix+'Name',name.value,name.basis);}
 const dob=following(/\b(?:DATE\s*OF\s*BIRTH|BIRTH\s*DATE|D\.?O\.?B\.?)\b/i,dateValue);if(dob&&!values[prefix+'Dob'])set(prefix+'Dob',dob.value,dob.basis);
 const expiry=following(/\b(?:DATE\s*OF\s*EXPIRY|OF\s*EXPIRY|EXPIRATION\s*DATE|EXPIRY|VALID\s*UNTIL)\b/i,dateValue);if(expiry&&!values[prefix+'Expiry'])set(prefix+'Expiry',expiry.value,expiry.basis);
 const number=following(/\b(?:PASSPORT\s*(?:NO\.?|NUMBER)|VISA\s*(?:NO\.?|NUMBER)|DOCUMENT\s*(?:NO\.?|NUMBER))\b/i,s=>{const candidates=s.toUpperCase().match(/\b[A-Z0-9]{6,12}\b/g)||[];return candidates.find(v=>/\d/.test(v)&&!/^\d{8}$/.test(v))||''});if(number&&!values[prefix+'Number'])set(prefix+'Number',number.value,number.basis);
 const nationality=following(/\bNATIONALI(?:TY)?\b/i,s=>{const v=cleanName(s);return v.length>=3&&!/birth|date|sex|passport|name/i.test(v)?v:''});if(nationality&&!values.nationality)set('nationality',nationality.value,nationality.basis);
 if(/\b\d{1,2}[/.]\d{1,2}[/.]\d{4}\b/.test(text))warnings.push('Numeric dates are interpreted as day/month/year. Confirm against the document.');
 if(!mrzValid&&/<{2,}/.test(upper))warnings.push('No fully readable supported MRZ was validated. Visible text was used where possible.');
 if(documentType==='unknown')warnings.push('Document type could not be identified. Select it manually or recapture.');
 const missing=['Name','Dob'].filter(k=>!values[prefix+k]);if(missing.length)warnings.push('Some required details could not be read. Recapture or use manual correction.');
 if(+confidence<65)warnings.push('Low overall OCR confidence; review the populated fields.');
 return {documentType,fields:values,evidence,warnings:[...new Set(warnings)],confidence:Math.max(0,Math.min(100,Number(confidence)||0)),status:documentType!=='unknown'&&!missing.length?'extracted':'partial',text,engine:'Tesseract.js 7 / English',mrzValid};
}
export function mergeOcrFields(previous,result,captureId,documentType){
 const type=result.documentType==='unknown'?documentType:result.documentType;
 const next={...previous,_ocr:{...(previous._ocr||{})}};
 if(!['passport','visa'].includes(type))return next;
 for(const key of DOCUMENT_FIELDS.filter(k=>k.startsWith(type)))delete next[key];
 for(const [key,value] of Object.entries(result.fields)){const translated=type==='visa'&&key.startsWith('passport')?key.replace('passport','visa'):key;if(DOCUMENT_FIELDS.includes(translated))next[translated]=value;}
 next._ocr[type]={...result,captureId,documentType:type,checked:false};return next;
}
