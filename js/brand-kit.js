
(()=>{
"use strict";
const STORAGE_KEY="k9.brandKit.v1";
const ACTIVE_KEY="k9.brandKit.active";
const MAX_IMAGE_BYTES=1_500_000;
const $=id=>document.getElementById(id);
const q=(s,r=document)=>r.querySelector(s);
const defaultKit=()=>({
 id:(crypto.randomUUID?.()||`kit-${Date.now()}`),name:"K9 Napoletano Academy",academyName:"K9 Napoletano Academy",slogan:"Competenza, metodo e passione cinofila",copyright:`© ${new Date().getFullYear()} K9 Napoletano Academy`,phone:"",email:"",website:"",address:"",facebook:"",instagram:"",whatsapp:"",accent:"#ff7a00",secondary:"#d8ab4d",background:"#0b0d10",text:"#ffffff",fontPreset:"system",ctaStyle:"rounded",mainLogo:"",mainLogoName:"logo-k9.png",qrCode:"",signature:"",stamp:"",autoApply:true,applyContacts:true,applyColors:true,applyLogo:true,updatedAt:new Date().toISOString()
});
const safeParse=(v,f)=>{try{return JSON.parse(v)}catch{return f}};
function readStore(){
 const raw=safeParse(localStorage.getItem(STORAGE_KEY),null);
 if(!raw)return {version:1,kits:[defaultKit()]};
 if(Array.isArray(raw))return {version:1,kits:raw};
 return {version:1,kits:Array.isArray(raw.kits)&&raw.kits.length?raw.kits:[defaultKit()]};
}
function writeStore(store){localStorage.setItem(STORAGE_KEY,JSON.stringify(store));}
function activeId(){return localStorage.getItem(ACTIVE_KEY)||readStore().kits[0].id;}
function setActiveId(id){localStorage.setItem(ACTIVE_KEY,id);}
function activeKit(){const s=readStore();return s.kits.find(k=>k.id===activeId())||s.kits[0];}
function status(message,error=false){const el=$("brandKitStatus");if(!el)return;el.textContent=message;el.classList.toggle("error",error);}
function setValue(id,value){const el=$(id);if(el&&value!=null){el.value=value;el.dispatchEvent(new Event("input",{bubbles:true}));el.dispatchEvent(new Event("change",{bubbles:true}));}}
function text(id){return ($(id)?.value||"").trim();}
function checked(id){return !!$(id)?.checked;}
function collect(){const current=activeKit();return {...current,
 name:text("bkProfileName")||"Brand Kit",academyName:text("bkAcademyName"),slogan:text("bkSlogan"),copyright:text("bkCopyright"),phone:text("bkPhone"),email:text("bkEmail"),website:text("bkWebsite"),address:text("bkAddress"),facebook:text("bkFacebook"),instagram:text("bkInstagram"),whatsapp:text("bkWhatsapp"),accent:$("bkAccent")?.value||"#ff7a00",secondary:$("bkSecondary")?.value||"#d8ab4d",background:$("bkBackground")?.value||"#0b0d10",text:$("bkText")?.value||"#ffffff",fontPreset:$("bkFontPreset")?.value||"system",ctaStyle:$("bkCtaStyle")?.value||"rounded",autoApply:checked("bkAutoApply"),applyContacts:checked("bkApplyContacts"),applyColors:checked("bkApplyColors"),applyLogo:checked("bkApplyLogo"),updatedAt:new Date().toISOString()};}
function save(){const s=readStore(),kit=collect(),idx=s.kits.findIndex(k=>k.id===kit.id);if(idx>=0)s.kits[idx]=kit;else s.kits.push(kit);writeStore(s);setActiveId(kit.id);renderProfiles();renderPreview();status("Brand Kit salvato nel dispositivo.");}
function fill(kit){
 const map={bkProfileName:"name",bkAcademyName:"academyName",bkSlogan:"slogan",bkCopyright:"copyright",bkPhone:"phone",bkEmail:"email",bkWebsite:"website",bkAddress:"address",bkFacebook:"facebook",bkInstagram:"instagram",bkWhatsapp:"whatsapp",bkAccent:"accent",bkSecondary:"secondary",bkBackground:"background",bkText:"text",bkFontPreset:"fontPreset",bkCtaStyle:"ctaStyle"};
 Object.entries(map).forEach(([id,key])=>{if($(id))$(id).value=kit[key]??""});
 [["bkAutoApply","autoApply"],["bkApplyContacts","applyContacts"],["bkApplyColors","applyColors"],["bkApplyLogo","applyLogo"]].forEach(([id,key])=>{if($(id))$(id).checked=kit[key]!==false});
 refreshAssetPreview("bkMainLogoPreview",kit.mainLogo,"Logo");refreshAssetPreview("bkQrPreview",kit.qrCode,"QR");refreshAssetPreview("bkSignaturePreview",kit.signature,"Firma");refreshAssetPreview("bkStampPreview",kit.stamp,"Timbro");renderPreview();
}
function renderProfiles(){const s=readStore(),sel=$("bkProfileSelect");if(!sel)return;sel.innerHTML=s.kits.map(k=>`<option value="${escapeHtml(k.id)}">${escapeHtml(k.name||k.academyName||"Brand Kit")}</option>`).join("");sel.value=activeKit().id;}
function escapeHtml(v){return String(v??"").replace(/[&<>'"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[c]));}
function renderPreview(){const k=collect();const logo=$("bkPreviewLogo");if(logo){if(k.mainLogo){logo.className="brand-kit-logo-preview";logo.src=k.mainLogo;logo.alt="Logo del Brand Kit"}else{logo.removeAttribute("src");logo.className="brand-kit-logo-preview empty";logo.alt="";logo.textContent="K9"}}
 $("bkPreviewName").textContent=k.academyName||"Nome Academy";$("bkPreviewSlogan").textContent=k.slogan||"Slogan istituzionale";$("bkPreviewContacts").innerHTML=[k.phone,k.email,k.website,k.address,k.instagram].filter(Boolean).map(v=>`<span>${escapeHtml(v)}</span>`).join("")||"<span>Nessun contatto configurato</span>";
 [["bkSwatchAccent",k.accent],["bkSwatchSecondary",k.secondary],["bkSwatchBackground",k.background],["bkSwatchText",k.text]].forEach(([id,c])=>{if($(id))$(id).style.background=c});
}
function refreshAssetPreview(id,data,label){const img=$(id);if(!img)return;if(data){img.src=data;img.alt=label;img.hidden=false}else{img.removeAttribute("src");img.hidden=true}}
function fileToData(file){return new Promise((resolve,reject)=>{if(!file)return resolve("");if(file.size>MAX_IMAGE_BYTES)return reject(new Error("Immagine troppo grande: massimo 1,5 MB."));const r=new FileReader();r.onerror=()=>reject(new Error("Impossibile leggere il file."));r.onload=()=>resolve(String(r.result));r.readAsDataURL(file)})}
async function assetChanged(inputId,key,previewId){try{const file=$(inputId)?.files?.[0];if(!file)return;const data=await fileToData(file),s=readStore(),kit=activeKit(),idx=s.kits.findIndex(k=>k.id===kit.id);kit[key]=data;if(key==="mainLogo")kit.mainLogoName=file.name||"logo-k9.png";s.kits[idx]=kit;writeStore(s);refreshAssetPreview(previewId,data,file.name);renderPreview();status("Asset salvato nel Brand Kit.")}catch(e){status(e.message||"Errore durante il caricamento.",true)}}
function dataUrlToFile(dataUrl,name){const [meta,b64]=dataUrl.split(","),mime=(meta.match(/data:(.*?);base64/)||[])[1]||"image/png",bytes=atob(b64),arr=new Uint8Array(bytes.length);for(let i=0;i<bytes.length;i++)arr[i]=bytes.charCodeAt(i);return new File([arr],name||"brand-logo.png",{type:mime});}
function applyLogo(kit){if(!kit.mainLogo)return;const input=$("multiLogoUpload")||$("logoUpload");if(!input)return;try{const dt=new DataTransfer();dt.items.add(dataUrlToFile(kit.mainLogo,kit.mainLogoName));input.files=dt.files;input.dispatchEvent(new Event("change",{bubbles:true}))}catch(e){console.warn("Brand Kit: logo non applicato",e)}}
function contactLine(k){const bits=[];if(k.phone)bits.push(`Tel. ${k.phone}`);if(k.email)bits.push(k.email);if(k.website)bits.push(k.website);if(k.instagram)bits.push(k.instagram.startsWith("@")?k.instagram:`@${k.instagram}`);return bits.join(" · ")}
function applyToProject(showMessage=true){const k=activeKit();if(k.applyColors!==false){setValue("accentColor",k.accent);setValue("goldColor",k.secondary)}if(k.applyContacts!==false){const line=contactLine(k);if(line)setValue("contact",line);if(k.whatsapp||k.phone){setValue("ctaType","whatsapp");setValue("ctaValue",k.whatsapp||k.phone)}if(k.address&&!text("location"))setValue("location",k.address)}if(k.applyLogo!==false)applyLogo(k);document.documentElement.style.setProperty("--k9-brand-font",fontStack(k.fontPreset));document.body.dataset.brandCta=k.ctaStyle||"rounded";setTimeout(()=>$("generateAll")?.click(),80);if(showMessage)status("Brand Kit applicato al progetto corrente.")}
function fontStack(p){return ({system:"system-ui,-apple-system,Segoe UI,sans-serif",editorial:"Georgia,Times New Roman,serif",technical:"Arial Narrow,Roboto Condensed,sans-serif",modern:"Montserrat,Poppins,Arial,sans-serif",elegant:"Palatino Linotype,Book Antiqua,serif"})[p]||"system-ui,sans-serif"}
function newProfile(){const s=readStore(),k=defaultKit();k.name=`Brand Kit ${s.kits.length+1}`;s.kits.push(k);writeStore(s);setActiveId(k.id);renderProfiles();fill(k);status("Nuovo Brand Kit creato.")}
function duplicateProfile(){const s=readStore(),source=activeKit(),k={...source,id:(crypto.randomUUID?.()||`kit-${Date.now()}`),name:`${source.name||"Brand Kit"} copia`,updatedAt:new Date().toISOString()};s.kits.push(k);writeStore(s);setActiveId(k.id);renderProfiles();fill(k);status("Brand Kit duplicato.")}
function deleteProfile(){const s=readStore();if(s.kits.length<=1)return status("Deve rimanere almeno un Brand Kit.",true);if(!confirm("Eliminare il Brand Kit selezionato?"))return;s.kits=s.kits.filter(k=>k.id!==activeId());writeStore(s);setActiveId(s.kits[0].id);renderProfiles();fill(s.kits[0]);status("Brand Kit eliminato.")}
function exportKit(){save();const blob=new Blob([JSON.stringify({schema:"k9-brand-kit",version:1,kit:activeKit()},null,2)],{type:"application/json"}),a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=`brand-kit-${(activeKit().name||"k9").toLowerCase().replace(/[^a-z0-9]+/g,"-")}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),500)}
function importKit(file){const r=new FileReader();r.onload=()=>{try{const data=JSON.parse(r.result),kit=data.kit||data;if(!kit||typeof kit!=="object")throw new Error();const s=readStore(),merged={...defaultKit(),...kit,id:(crypto.randomUUID?.()||`kit-${Date.now()}`),name:`${kit.name||"Brand Kit"} importato`,updatedAt:new Date().toISOString()};s.kits.push(merged);writeStore(s);setActiveId(merged.id);renderProfiles();fill(merged);status("Brand Kit importato correttamente.")}catch{status("File Brand Kit non valido.",true)}};r.readAsText(file)}
function bind(){
 ["bkProfileName","bkAcademyName","bkSlogan","bkCopyright","bkPhone","bkEmail","bkWebsite","bkAddress","bkFacebook","bkInstagram","bkWhatsapp","bkAccent","bkSecondary","bkBackground","bkText","bkFontPreset","bkCtaStyle","bkAutoApply","bkApplyContacts","bkApplyColors","bkApplyLogo"].forEach(id=>$(id)?.addEventListener("input",renderPreview));
 $("bkProfileSelect")?.addEventListener("change",e=>{setActiveId(e.target.value);fill(activeKit())});$("bkSave")?.addEventListener("click",save);$("bkApply")?.addEventListener("click",()=>applyToProject(true));$("bkNew")?.addEventListener("click",newProfile);$("bkDuplicate")?.addEventListener("click",duplicateProfile);$("bkDelete")?.addEventListener("click",deleteProfile);$("bkExport")?.addEventListener("click",exportKit);$("bkImportBtn")?.addEventListener("click",()=>$("bkImport")?.click());$("bkImport")?.addEventListener("change",e=>{if(e.target.files[0])importKit(e.target.files[0]);e.target.value=""});
 [["bkMainLogo","mainLogo","bkMainLogoPreview"],["bkQrCode","qrCode","bkQrPreview"],["bkSignature","signature","bkSignaturePreview"],["bkStamp","stamp","bkStampPreview"]].forEach(([i,k,p])=>$(i)?.addEventListener("change",()=>assetChanged(i,k,p)));
 $("newBtn")?.addEventListener("click",()=>setTimeout(()=>{const k=activeKit();if(k.autoApply!==false)applyToProject(false)},140));
}
function init(){renderProfiles();fill(activeKit());bind();const k=activeKit();if(k.autoApply!==false&&!sessionStorage.getItem("k9.brandKit.applied")){sessionStorage.setItem("k9.brandKit.applied","1");setTimeout(()=>applyToProject(false),450)}}
document.readyState==="loading"?document.addEventListener("DOMContentLoaded",init):init();
})();
