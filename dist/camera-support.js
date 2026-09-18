export function cameraProblem(error,{secure=true,supported=true,policyAllowed=true,embedded=false}={}){
 if(!secure)return 'Camera access needs a secure HTTPS page. Open the published SeemaDrishti link in your browser.';
 if(!policyAllowed)return 'This embedded view blocks camera access. Open SeemaDrishti directly in Chrome, Edge or Safari using the link below.';
 if(!supported)return 'This browser does not provide live camera access. Open the direct site in Chrome, Edge or Safari, or use the device-camera option below.';
 if(['NotAllowedError','PermissionDeniedError','SecurityError'].includes(error?.name))return 'Camera access is blocked by the browser, app or device. '+(embedded?'Open the direct site in your browser first. ':'')+'Use the site controls beside the address bar → Camera → Allow, then retry. On Windows, also allow camera access for desktop apps in Settings → Privacy & security → Camera.';
 if(['NotFoundError','DevicesNotFoundError'].includes(error?.name))return 'No available camera was found. Connect a camera, check its privacy shutter, and retry.';
 if(['NotReadableError','TrackStartError','AbortError'].includes(error?.name))return 'The camera could not start. Close other apps using it, check device camera access and its privacy shutter, then retry.';
 if(error?.name==='OverconstrainedError')return 'The selected camera is unavailable. Reconnect using the default camera.';
 return 'The camera could not start. Retry or use the device-camera option. '+(error?.message||'');
}
export async function requestCamera(media,kind,deviceId){
 const preferred={audio:false,video:deviceId?{deviceId:{exact:deviceId}}:{facingMode:{ideal:kind==='face'?'user':'environment'},width:{ideal:1280},height:{ideal:720}}};
 try{return await media.getUserMedia(preferred)}catch(e){if(!['OverconstrainedError','NotFoundError'].includes(e.name))throw e;return media.getUserMedia({video:true,audio:false});}
}
