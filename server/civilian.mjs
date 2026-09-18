const text=(value,max)=>String(value??'').trim().slice(0,max);
export function normalizeCivilian(input,today=new Date().toISOString().slice(0,10)){
 const data={};
 for(const [key,max] of Object.entries({fullName:150,birthDate:10,nationality:100,gender:40,residence:300,contact:100,travelPurpose:300,documentType:40,documentNumber:100,statement:1500,officerNotes:1500}))data[key]=text(input[key],max);
 if(!data.fullName)throw new Error('Enter the civilian’s name, or enter Unknown when it cannot be established.');
 if(!['civilian_statement','document_transcription'].includes(input.source))throw new Error('Choose how the civilian details were collected.');
 if(data.birthDate){const d=new Date(data.birthDate+'T00:00:00Z');if(!/^\d{4}-\d{2}-\d{2}$/.test(data.birthDate)||!Number.isFinite(d.getTime())||d.toISOString().slice(0,10)!==data.birthDate||data.birthDate>today)throw new Error('Enter a valid birth date that is not in the future.');}
 return {...data,source:input.source,verification:'unverified'};
}
