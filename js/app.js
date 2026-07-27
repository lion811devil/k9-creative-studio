'use strict';

const $ = (id) => document.getElementById(id);
const canvas = $('posterCanvas');
const ctx = canvas.getContext('2d', { alpha: false });

const FORMATS = {
  square: [1080,1080], portrait:[1080,1350], story:[1080,1920], landscape:[1600,900], a4:[1240,1754]
};

const PALETTES = [
  {id:'orange',name:'Arancio professionale',bg:'#101316',surface:'#1c2228',primary:'#ff9f1a',secondary:'#ffd08a',text:'#ffffff',muted:'#d7dce3'},
  {id:'blue',name:'Blu tecnico',bg:'#071827',surface:'#0d2a40',primary:'#19a7ce',secondary:'#a5e8ff',text:'#ffffff',muted:'#d0e7ef'},
  {id:'green',name:'Verde naturale',bg:'#0d2119',surface:'#183629',primary:'#6ac66b',secondary:'#d7f2bd',text:'#ffffff',muted:'#dce8df'},
  {id:'red',name:'Rosso evento',bg:'#260d12',surface:'#43141e',primary:'#ef3340',secondary:'#ffc4ca',text:'#ffffff',muted:'#f0d9dd'},
  {id:'gold',name:'Nero e oro',bg:'#0b0b0c',surface:'#1b1a17',primary:'#d7af55',secondary:'#f7e5b5',text:'#ffffff',muted:'#ded8ca'},
  {id:'sand',name:'Sabbia elegante',bg:'#eee5d4',surface:'#d8c8ad',primary:'#6f4d2f',secondary:'#a98157',text:'#20170f',muted:'#51483f'},
  {id:'pet',name:'Pet friendly',bg:'#f7f1f5',surface:'#ead9e7',primary:'#ad4e8b',secondary:'#f1a5cf',text:'#281d27',muted:'#665b64'},
  {id:'mono',name:'Bianco e nero',bg:'#f4f4f2',surface:'#deded9',primary:'#101010',secondary:'#555555',text:'#111111',muted:'#444444'},
  {id:'purple',name:'Viola editoriale',bg:'#1b1028',surface:'#332047',primary:'#a96bff',secondary:'#e1c6ff',text:'#ffffff',muted:'#e1d9e9'},
  {id:'cyan',name:'Ciano moderno',bg:'#061a1d',surface:'#10363b',primary:'#29d3c2',secondary:'#a9f5ec',text:'#ffffff',muted:'#d7eeeb'},
  {id:'navy',name:'Blu navy premium',bg:'#07111f',surface:'#13253a',primary:'#f29f05',secondary:'#ffd88c',text:'#ffffff',muted:'#d7e1ed'},
  {id:'light',name:'Chiaro istituzionale',bg:'#f8fafc',surface:'#e5eaf0',primary:'#1f5d8f',secondary:'#98b8d2',text:'#16202a',muted:'#485766'}
];

const TEMPLATES = [
  {id:'hero',name:'Hero fotografico'}, {id:'split',name:'Editoriale diviso'},
  {id:'cinema',name:'Cinematico'}, {id:'magazine',name:'Cover magazine'},
  {id:'minimal',name:'Minimal premium'}, {id:'diagonal',name:'Diagonale dinamico'},
  {id:'cards',name:'Servizi a schede'}, {id:'frame',name:'Finestra fotografica'},
  {id:'ticket',name:'Evento ticket'}, {id:'type',name:'Poster tipografico'},
  {id:'band',name:'Fascia editoriale'}, {id:'academy',name:'Academy istituzionale'},
  {id:'circle',name:'Cerchio fotografico'}, {id:'collage',name:'Collage moderno'},
  {id:'vertical',name:'Editoriale verticale'}, {id:'spotlight',name:'Spotlight evento'}
];

const state = {
  photo:null, logo:null, logo2:null, photoData:null, logoData:null, logo2Data:null,
  photoZoom:1, photoX:0, photoY:0, templateIndex:0
};

function values(){
  return {
    format:$('format').value, template:$('template').value, palette:$('palette').value,
    title:$('title').value.trim(), subtitle:$('subtitle').value.trim(), description:$('description').value.trim(),
    infoHeading:$('infoHeading').value.trim(), info:$('info').value.trim(), contact:$('contact').value.trim(),
    cta:$('cta').value.trim(), brand:$('brand').value.trim(), projectName:$('projectName').value.trim() || 'locandina-k9'
  };
}

function hexRgb(hex){const h=hex.replace('#','');return [parseInt(h.slice(0,2),16),parseInt(h.slice(2,4),16),parseInt(h.slice(4,6),16)]}
function alpha(hex,a){const [r,g,b]=hexRgb(hex);return `rgba(${r},${g},${b},${a})`}
function rounded(x,y,w,h,r){r=Math.min(r,w/2,h/2);ctx.beginPath();ctx.moveTo(x+r,y);ctx.arcTo(x+w,y,x+w,y+h,r);ctx.arcTo(x+w,y+h,x,y+h,r);ctx.arcTo(x,y+h,x,y,r);ctx.arcTo(x,y,x+w,y,r);ctx.closePath()}
function fillRound(x,y,w,h,r,color){ctx.fillStyle=color;rounded(x,y,w,h,r);ctx.fill()}
function line(x1,y1,x2,y2,color,width){ctx.strokeStyle=color;ctx.lineWidth=width;ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke()}
function coverImage(img,x,y,w,h,zoom=1,ox=0,oy=0){
  if(!img){ctx.fillStyle='#27303a';ctx.fillRect(x,y,w,h);ctx.fillStyle='rgba(255,255,255,.4)';ctx.font=`700 ${Math.max(20,w*.035)}px sans-serif`;ctx.textAlign='center';ctx.fillText('CARICA UNA FOTO',x+w/2,y+h/2);return}
  const scale=Math.max(w/img.width,h/img.height)*zoom, dw=img.width*scale, dh=img.height*scale;
  const dx=x+(w-dw)/2+ox*w*.18, dy=y+(h-dh)/2+oy*h*.18;
  ctx.save();ctx.beginPath();ctx.rect(x,y,w,h);ctx.clip();ctx.drawImage(img,dx,dy,dw,dh);ctx.restore();
}
function containImage(img,x,y,w,h){if(!img)return;const s=Math.min(w/img.width,h/img.height),dw=img.width*s,dh=img.height*s;ctx.drawImage(img,x+(w-dw)/2,y+(h-dh)/2,dw,dh)}
function overlay(x,y,w,h,top,bottom){const g=ctx.createLinearGradient(x,y,x,y+h);g.addColorStop(0,top);g.addColorStop(1,bottom);ctx.fillStyle=g;ctx.fillRect(x,y,w,h)}
function font(size,weight=700){ctx.font=`${weight} ${Math.round(size)}px Inter,Arial,sans-serif`}
function wrap(text,maxWidth,size,weight=500,maxLines=10){
  font(size,weight);const out=[];for(const para of String(text||'').split(/\n/)){const words=para.split(/\s+/).filter(Boolean);if(!words.length){out.push('');continue}let row='';for(const word of words){const test=row?row+' '+word:word;if(ctx.measureText(test).width<=maxWidth||!row)row=test;else{out.push(row);row=word;if(out.length>=maxLines)return out}}if(row)out.push(row);if(out.length>=maxLines)return out}return out;
}
function fitLines(text,maxWidth,maxHeight,start,min,weight=800,maxLines=8){for(let s=start;s>=min;s-=2){const lines=wrap(text,maxWidth,s,weight,maxLines);if(lines.length*s*1.08<=maxHeight)return {size:s,lines}}return {size:min,lines:wrap(text,maxWidth,min,weight,maxLines)}}
function drawLines(lines,x,y,size,color,weight=500,align='left',lh=1.18){font(size,weight);ctx.fillStyle=color;ctx.textAlign=align;ctx.textBaseline='top';lines.forEach((t,i)=>ctx.fillText(t,x,y+i*size*lh));return lines.length*size*lh}
function drawTitle(v,p,x,y,w,h,align='left',color=p.text){const fitted=fitLines(v.title||'TITOLO',w,h,Math.min(w*.105,h*.34),Math.max(34,w*.047),900,5);return drawLines(fitted.lines,x,y,fitted.size,color,900,align,1.02)}
function drawSubtitle(v,p,x,y,w,size,align='left',color=p.secondary){return drawLines(wrap(v.subtitle,w,size,700,4),x,y,size,color,700,align,1.12)}
function drawBody(text,x,y,w,size,color,maxLines=8){return drawLines(wrap(text,w,size,500,maxLines),x,y,size,color,500,'left',1.25)}
function drawInfoList(v,p,x,y,w,h,dark=false,columns=1){
  const textColor=dark?'#fff':p.text, secondary=dark?alpha('#ffffff',.8):p.muted;
  font(w*.045,850);ctx.fillStyle=dark?p.secondary:p.primary;ctx.textAlign='left';ctx.fillText((v.infoHeading||'INFORMAZIONI').toUpperCase(),x,y);
  const items=v.info.split(/\n/).map(s=>s.trim()).filter(Boolean).slice(0,8);if(!items.length)return;
  const gap=w*.035, colW=(w-gap*(columns-1))/columns, fs=Math.max(18,Math.min(32,colW*.055));
  items.forEach((item,i)=>{const col=i%columns,row=Math.floor(i/columns),xx=x+col*(colW+gap),yy=y+w*.075+row*(fs*2.15);ctx.fillStyle=dark?p.primary:p.primary;ctx.beginPath();ctx.arc(xx+fs*.25,yy+fs*.47,fs*.18,0,Math.PI*2);ctx.fill();drawLines(wrap(item,colW-fs,fs,600,2),xx+fs*.65,yy,fs,textColor,600,'left',1.08)});
}
function drawCTA(v,p,x,y,w,h,darkText=false){if(!v.cta)return;fillRound(x,y,w,h,h/2,p.primary);font(h*.37,900);ctx.fillStyle=darkText?p.text:(brightness(p.primary)>150?'#111':'#fff');ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(v.cta.toUpperCase(),x+w/2,y+h/2)}
function brightness(hex){const [r,g,b]=hexRgb(hex);return r*.299+g*.587+b*.114}
function drawBrand(v,p,x,y,w,size,align='left',color=p.text){font(size,800);ctx.fillStyle=color;ctx.textAlign=align;ctx.textBaseline='alphabetic';ctx.fillText((v.brand||'K9 CREATIVE STUDIO').toUpperCase(),x,y);}
function drawContact(v,p,x,y,w,size,align='left',color=p.text){if(!v.contact)return;drawLines(wrap(v.contact,w,size,750,2),x,y,size,color,750,align,1.1)}
function drawLogos(p,zone){const {x,y,w,h,align='left'}=zone;const imgs=[state.logo,state.logo2].filter(Boolean);if(!imgs.length)return;const gap=w*.035, each=Math.min(w*.34,(w-gap)/imgs.length);let start=align==='right'?x+w-(each*imgs.length+gap*(imgs.length-1)):align==='center'?x+(w-(each*imgs.length+gap*(imgs.length-1)))/2:x;imgs.forEach((img,i)=>containImage(img,start+i*(each+gap),y,each,h))}
function decor(p,w,h){ctx.fillStyle=alpha(p.primary,.14);ctx.beginPath();ctx.arc(w*.88,h*.12,Math.min(w,h)*.16,0,Math.PI*2);ctx.fill();ctx.strokeStyle=alpha(p.secondary,.28);ctx.lineWidth=Math.max(3,w*.004);ctx.beginPath();ctx.arc(w*.88,h*.12,Math.min(w,h)*.11,0,Math.PI*2);ctx.stroke()}

function renderHero(v,p,w,h){coverImage(state.photo,0,0,w,h,state.photoZoom,state.photoX,state.photoY);overlay(0,0,w,h,alpha(p.bg,.08),alpha(p.bg,.94));decor(p,w,h);drawLogos(p,{x:w*.07,y:h*.055,w:w*.45,h:h*.085});const th=drawTitle(v,p,w*.07,h*.25,w*.82,h*.25,'left','#fff');drawSubtitle(v,p,w*.07,h*.27+th,w*.78,w*.043,'left',p.secondary);drawBody(v.description,w*.07,h*.58,w*.72,w*.026,'#fff',5);drawCTA(v,p,w*.07,h*.82,w*.34,h*.065);drawContact(v,p,w*.46,h*.835,w*.46,w*.025,'right','#fff');}
function renderSplit(v,p,w,h){ctx.fillStyle=p.bg;ctx.fillRect(0,0,w,h);const portrait=h>w;const photo=portrait?{x:0,y:0,w:w,h:h*.47}:{x:w*.52,y:0,w:w*.48,h};coverImage(state.photo,photo.x,photo.y,photo.w,photo.h,state.photoZoom,state.photoX,state.photoY);if(portrait){ctx.fillStyle=p.surface;ctx.fillRect(0,h*.45,w,h*.55);drawLogos(p,{x:w*.07,y:h*.49,w:w*.4,h:h*.07});const th=drawTitle(v,p,w*.07,h*.61,w*.86,h*.16);drawSubtitle(v,p,w*.07,h*.62+th,w*.82,w*.036);drawBody(v.description,w*.07,h*.76,w*.84,w*.025,p.text,4);drawCTA(v,p,w*.07,h*.89,w*.36,h*.055);drawContact(v,p,w*.48,h*.9,w*.45,w*.023,'right')}else{drawLogos(p,{x:w*.055,y:h*.07,w:w*.36,h:h*.09});const th=drawTitle(v,p,w*.055,h*.26,w*.41,h*.29);drawSubtitle(v,p,w*.055,h*.29+th,w*.4,w*.027);drawBody(v.description,w*.055,h*.62,w*.4,w*.018,p.text,5);drawCTA(v,p,w*.055,h*.82,w*.25,h*.08);drawContact(v,p,w*.32,h*.845,w*.17,w*.017,'right')}}
function renderCinema(v,p,w,h){ctx.fillStyle='#000';ctx.fillRect(0,0,w,h);coverImage(state.photo,w*.035,h*.035,w*.93,h*.93,state.photoZoom,state.photoX,state.photoY);overlay(0,0,w,h,'rgba(0,0,0,.15)','rgba(0,0,0,.88)');line(w*.07,h*.09,w*.38,h*.09,p.primary,w*.008);drawLogos(p,{x:w*.07,y:h*.11,w:w*.38,h:h*.075});const th=drawTitle(v,p,w*.07,h*.51,w*.86,h*.23,'left','#fff');drawSubtitle(v,p,w*.07,h*.53+th,w*.82,w*.038,'left',p.secondary);drawCTA(v,p,w*.07,h*.85,w*.35,h*.06);drawContact(v,p,w*.47,h*.86,w*.46,w*.023,'right','#fff')}
function renderMagazine(v,p,w,h){ctx.fillStyle=p.bg;ctx.fillRect(0,0,w,h);coverImage(state.photo,w*.31,0,w*.69,h,state.photoZoom,state.photoX,state.photoY);overlay(w*.2,0,w*.8,h,alpha(p.bg,.85),alpha(p.bg,.15));ctx.save();ctx.translate(w*.08,h*.62);ctx.rotate(-Math.PI/2);drawBrand(v,p,0,0,h*.48,w*.026,'left',p.secondary);ctx.restore();drawLogos(p,{x:w*.06,y:h*.055,w:w*.34,h:h*.07});const th=drawTitle(v,p,w*.06,h*.20,w*.68,h*.28);drawSubtitle(v,p,w*.06,h*.23+th,w*.55,w*.036);fillRound(w*.06,h*.68,w*.49,h*.18,w*.018,alpha(p.surface,.91));drawBody(v.description,w*.085,h*.715,w*.44,w*.023,p.text,5);drawCTA(v,p,w*.62,h*.84,w*.31,h*.055);}
function renderMinimal(v,p,w,h){ctx.fillStyle=p.bg;ctx.fillRect(0,0,w,h);fillRound(w*.07,h*.07,w*.86,h*.47,w*.035,p.surface);ctx.save();rounded(w*.07,h*.07,w*.86,h*.47,w*.035);ctx.clip();coverImage(state.photo,w*.07,h*.07,w*.86,h*.47,state.photoZoom,state.photoX,state.photoY);ctx.restore();drawLogos(p,{x:w*.07,y:h*.57,w:w*.42,h:h*.065});const th=drawTitle(v,p,w*.07,h*.68,w*.86,h*.13);drawSubtitle(v,p,w*.07,h*.69+th,w*.8,w*.033);line(w*.07,h*.86,w*.93,h*.86,p.primary,w*.006);drawContact(v,p,w*.07,h*.89,w*.55,w*.024);drawCTA(v,p,w*.67,h*.875,w*.26,h*.055)}
function renderDiagonal(v,p,w,h){ctx.fillStyle=p.bg;ctx.fillRect(0,0,w,h);ctx.save();ctx.beginPath();ctx.moveTo(w*.35,0);ctx.lineTo(w,0);ctx.lineTo(w,h*.65);ctx.lineTo(0,h);ctx.lineTo(0,h*.38);ctx.closePath();ctx.clip();coverImage(state.photo,0,0,w,h,state.photoZoom,state.photoX,state.photoY);ctx.restore();ctx.fillStyle=alpha(p.primary,.88);ctx.beginPath();ctx.moveTo(0,h*.58);ctx.lineTo(w,h*.28);ctx.lineTo(w,h*.38);ctx.lineTo(0,h*.7);ctx.closePath();ctx.fill();drawLogos(p,{x:w*.06,y:h*.05,w:w*.42,h:h*.07});const th=drawTitle(v,p,w*.06,h*.68,w*.86,h*.16);drawSubtitle(v,p,w*.06,h*.69+th,w*.8,w*.034);drawCTA(v,p,w*.06,h*.9,w*.34,h*.055);drawContact(v,p,w*.46,h*.91,w*.47,w*.023,'right')}
function renderCards(v,p,w,h){ctx.fillStyle=p.bg;ctx.fillRect(0,0,w,h);coverImage(state.photo,0,0,w,h*.38,state.photoZoom,state.photoX,state.photoY);overlay(0,0,w,h*.4,alpha(p.bg,.05),alpha(p.bg,.9));drawLogos(p,{x:w*.06,y:h*.045,w:w*.38,h:h*.07});const th=drawTitle(v,p,w*.06,h*.20,w*.88,h*.15,'left','#fff');drawSubtitle(v,p,w*.06,h*.22+th,w*.82,w*.032,'left',p.secondary);const y=h*.45,cardH=h*.34;fillRound(w*.05,y,w*.9,cardH,w*.025,p.surface);drawInfoList(v,p,w*.085,y+h*.045,w*.83,cardH-h*.08,false,w>h?2:1);drawCTA(v,p,w*.06,h*.86,w*.34,h*.06);drawContact(v,p,w*.45,h*.875,w*.48,w*.023,'right')}
function renderFrame(v,p,w,h){ctx.fillStyle=p.bg;ctx.fillRect(0,0,w,h);decor(p,w,h);fillRound(w*.08,h*.08,w*.84,h*.48,w*.015,p.primary);ctx.save();rounded(w*.105,h*.105,w*.79,h*.43,w*.012);ctx.clip();coverImage(state.photo,w*.105,h*.105,w*.79,h*.43,state.photoZoom,state.photoX,state.photoY);ctx.restore();drawLogos(p,{x:w*.08,y:h*.59,w:w*.4,h:h*.065});const th=drawTitle(v,p,w*.08,h*.69,w*.84,h*.14);drawSubtitle(v,p,w*.08,h*.70+th,w*.8,w*.034);drawCTA(v,p,w*.08,h*.89,w*.34,h*.055);drawContact(v,p,w*.47,h*.9,w*.45,w*.022,'right')}
function renderTicket(v,p,w,h){ctx.fillStyle=p.bg;ctx.fillRect(0,0,w,h);coverImage(state.photo,0,0,w,h*.46,state.photoZoom,state.photoX,state.photoY);overlay(0,0,w,h*.5,alpha(p.bg,.08),alpha(p.bg,.95));drawLogos(p,{x:w*.06,y:h*.045,w:w*.42,h:h*.07});const th=drawTitle(v,p,w*.06,h*.23,w*.87,h*.17,'left','#fff');fillRound(w*.055,h*.49,w*.89,h*.38,w*.025,p.surface);drawSubtitle(v,p,w*.09,h*.535,w*.81,w*.035);drawBody(v.description,w*.09,h*.61,w*.81,w*.024,p.text,5);line(w*.09,h*.75,w*.91,h*.75,alpha(p.text,.18),w*.003);drawContact(v,p,w*.09,h*.785,w*.44,w*.026);drawCTA(v,p,w*.59,h*.77,w*.31,h*.065)}
function renderType(v,p,w,h){ctx.fillStyle=p.bg;ctx.fillRect(0,0,w,h);ctx.fillStyle=p.primary;ctx.fillRect(0,0,w*.12,h);drawLogos(p,{x:w*.18,y:h*.055,w:w*.42,h:h*.075});const th=drawTitle(v,p,w*.18,h*.20,w*.73,h*.31);drawSubtitle(v,p,w*.18,h*.22+th,w*.72,w*.043);fillRound(w*.18,h*.59,w*.73,h*.22,w*.02,p.surface);drawBody(v.description,w*.22,h*.635,w*.65,w*.025,p.text,6);drawCTA(v,p,w*.18,h*.87,w*.34,h*.06);drawContact(v,p,w*.57,h*.885,w*.34,w*.022,'right')}
function renderBand(v,p,w,h){ctx.fillStyle=p.bg;ctx.fillRect(0,0,w,h);coverImage(state.photo,0,h*.14,w,h*.55,state.photoZoom,state.photoX,state.photoY);ctx.fillStyle=p.primary;ctx.fillRect(0,h*.48,w,h*.18);drawLogos(p,{x:w*.055,y:h*.035,w:w*.4,h:h*.075});const th=drawTitle(v,p,w*.055,h*.505,w*.89,h*.11,'left',brightness(p.primary)>150?'#111':'#fff');drawSubtitle(v,p,w*.055,h*.71,w*.84,w*.034);drawBody(v.description,w*.055,h*.77,w*.85,w*.023,p.text,4);drawCTA(v,p,w*.055,h*.9,w*.32,h*.055);drawContact(v,p,w*.43,h*.91,w*.5,w*.022,'right')}
function renderAcademy(v,p,w,h){ctx.fillStyle=p.bg;ctx.fillRect(0,0,w,h);ctx.strokeStyle=p.primary;ctx.lineWidth=w*.018;ctx.strokeRect(w*.035,h*.025,w*.93,h*.95);drawLogos(p,{x:w*.15,y:h*.06,w:w*.7,h:h*.1,align:'center'});drawBrand(v,p,w*.5,h*.205,w*.8,w*.026,'center',p.muted);const th=drawTitle(v,p,w*.5,h*.28,w*.78,h*.19,'center');drawSubtitle(v,p,w*.5,h*.31+th,w*.72,w*.036,'center');ctx.save();rounded(w*.14,h*.52,w*.72,h*.24,w*.02);ctx.clip();coverImage(state.photo,w*.14,h*.52,w*.72,h*.24,state.photoZoom,state.photoX,state.photoY);ctx.restore();drawContact(v,p,w*.5,h*.82,w*.7,w*.025,'center');drawCTA(v,p,w*.31,h*.87,w*.38,h*.055)}
function renderCircle(v,p,w,h){ctx.fillStyle=p.bg;ctx.fillRect(0,0,w,h);decor(p,w,h);const r=Math.min(w*.34,h*.22),cx=w*.5,cy=h*.25;ctx.save();ctx.beginPath();ctx.arc(cx,cy,r,0,Math.PI*2);ctx.clip();coverImage(state.photo,cx-r,cy-r,r*2,r*2,state.photoZoom,state.photoX,state.photoY);ctx.restore();ctx.strokeStyle=p.primary;ctx.lineWidth=w*.015;ctx.beginPath();ctx.arc(cx,cy,r+w*.012,0,Math.PI*2);ctx.stroke();drawLogos(p,{x:w*.08,y:h*.48,w:w*.84,h:h*.07,align:'center'});const th=drawTitle(v,p,w*.5,h*.59,w*.84,h*.16,'center');drawSubtitle(v,p,w*.5,h*.60+th,w*.78,w*.034,'center');drawCTA(v,p,w*.31,h*.87,w*.38,h*.055);drawContact(v,p,w*.5,h*.945,w*.75,w*.022,'center')}
function renderCollage(v,p,w,h){ctx.fillStyle=p.bg;ctx.fillRect(0,0,w,h);ctx.save();ctx.translate(w*.67,h*.22);ctx.rotate(.08);rounded(-w*.28,-h*.17,w*.56,h*.36,w*.02);ctx.clip();coverImage(state.photo,-w*.28,-h*.17,w*.56,h*.36,state.photoZoom,state.photoX,state.photoY);ctx.restore();fillRound(w*.05,h*.08,w*.45,h*.28,w*.02,p.surface);drawLogos(p,{x:w*.08,y:h*.11,w:w*.38,h:h*.06});drawSubtitle(v,p,w*.08,h*.21,w*.37,w*.034);const th=drawTitle(v,p,w*.06,h*.48,w*.88,h*.2);drawBody(v.description,w*.06,h*.70,w*.58,w*.024,p.text,5);drawCTA(v,p,w*.06,h*.88,w*.34,h*.057);drawContact(v,p,w*.46,h*.895,w*.47,w*.022,'right');ctx.fillStyle=p.primary;ctx.fillRect(w*.72,h*.63,w*.21,h*.19);font(w*.09,900);ctx.fillStyle=brightness(p.primary)>150?'#111':'#fff';ctx.textAlign='center';ctx.fillText('K9',w*.825,h*.75)}
function renderVertical(v,p,w,h){ctx.fillStyle=p.bg;ctx.fillRect(0,0,w,h);coverImage(state.photo,w*.53,0,w*.47,h,state.photoZoom,state.photoX,state.photoY);overlay(w*.45,0,w*.55,h,alpha(p.bg,.95),alpha(p.bg,.1));ctx.fillStyle=p.primary;ctx.fillRect(w*.07,h*.06,w*.015,h*.88);drawLogos(p,{x:w*.12,y:h*.06,w:w*.33,h:h*.075});const th=drawTitle(v,p,w*.12,h*.25,w*.62,h*.28);drawSubtitle(v,p,w*.12,h*.28+th,w*.48,w*.035);drawBody(v.description,w*.12,h*.62,w*.39,w*.022,p.text,6);drawCTA(v,p,w*.12,h*.86,w*.3,h*.057)}
function renderSpotlight(v,p,w,h){ctx.fillStyle=p.bg;ctx.fillRect(0,0,w,h);coverImage(state.photo,0,0,w,h,state.photoZoom,state.photoX,state.photoY);overlay(0,0,w,h,alpha('#000000',.35),alpha('#000000',.82));ctx.fillStyle=alpha(p.primary,.92);ctx.beginPath();ctx.arc(w*.15,h*.17,Math.min(w,h)*.12,0,Math.PI*2);ctx.fill();drawLogos(p,{x:w*.55,y:h*.055,w:w*.38,h:h*.075,align:'right'});drawBrand(v,p,w*.15,h*.18,w*.2,w*.023,'center',brightness(p.primary)>150?'#111':'#fff');const th=drawTitle(v,p,w*.07,h*.48,w*.86,h*.24,'left','#fff');drawSubtitle(v,p,w*.07,h*.50+th,w*.82,w*.038,'left',p.secondary);drawCTA(v,p,w*.07,h*.84,w*.34,h*.062);drawContact(v,p,w*.47,h*.86,w*.46,w*.023,'right','#fff')}


function drawUniversalInfo(v,p,w,h){
  if(!v.info || v.template==='cards') return;
  const items=v.info.split(/\n/).map(x=>x.trim()).filter(Boolean).slice(0,4);
  if(!items.length) return;
  const y=h*.735, boxH=h*.105;
  fillRound(w*.055,y,w*.89,boxH,w*.014,alpha(p.surface,.93));
  font(w*.019,850);ctx.fillStyle=p.primary;ctx.textAlign='left';ctx.textBaseline='top';ctx.fillText((v.infoHeading||'INFORMAZIONI').toUpperCase(),w*.08,y+h*.018);
  const cols=w>h?4:2, colW=w*.82/cols, fs=Math.max(15,w*.017);
  items.forEach((item,i)=>{const col=i%cols,row=Math.floor(i/cols),xx=w*.08+col*colW,yy=y+h*.048+row*fs*1.6;ctx.fillStyle=p.primary;ctx.beginPath();ctx.arc(xx+fs*.18,yy+fs*.42,fs*.14,0,Math.PI*2);ctx.fill();drawLines(wrap(item,colW-fs*.8,fs,650,1),xx+fs*.55,yy,fs,p.text,650,'left',1.05)});
}

const RENDERERS={hero:renderHero,split:renderSplit,cinema:renderCinema,magazine:renderMagazine,minimal:renderMinimal,diagonal:renderDiagonal,cards:renderCards,frame:renderFrame,ticket:renderTicket,type:renderType,band:renderBand,academy:renderAcademy,circle:renderCircle,collage:renderCollage,vertical:renderVertical,spotlight:renderSpotlight};

function render(){
  const v=values(), [w,h]=FORMATS[v.format], p=PALETTES.find(x=>x.id===v.palette)||PALETTES[0];
  if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h}
  ctx.clearRect(0,0,w,h);ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
  (RENDERERS[v.template]||renderHero)(v,p,w,h);
  drawUniversalInfo(v,p,w,h);
  $('templateName').textContent=TEMPLATES.find(t=>t.id===v.template)?.name||'Modello';
}

function setSelects(){
  $('template').innerHTML=TEMPLATES.map(t=>`<option value="${t.id}">${t.name}</option>`).join('');
  $('palette').innerHTML=PALETTES.map(p=>`<option value="${p.id}">${p.name}</option>`).join('');
  $('palette').value='orange';
}
function dataURLToImage(data){return new Promise((resolve,reject)=>{if(!data)return resolve(null);const img=new Image();img.onload=()=>resolve(img);img.onerror=reject;img.src=data})}
function loadFile(input,key){const file=input.files?.[0];if(!file)return;const reader=new FileReader();reader.onload=async()=>{state[key+'Data']=reader.result;state[key]=await dataURLToImage(reader.result);render()};reader.readAsDataURL(file)}
function debounce(fn,delay=100){let t;return(...args)=>{clearTimeout(t);t=setTimeout(()=>fn(...args),delay)}}
const lazyRender=debounce(render,80);

function nextTemplate(delta){state.templateIndex=(TEMPLATES.findIndex(t=>t.id===$('template').value)+delta+TEMPLATES.length)%TEMPLATES.length;$('template').value=TEMPLATES[state.templateIndex].id;render()}
function safeName(s){return (s||'locandina-k9').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9-_]+/g,'-').replace(/^-+|-+$/g,'')||'locandina-k9'}
function download(blob,name){const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),1200)}
function canvasBlob(type,quality){return new Promise(resolve=>canvas.toBlob(resolve,type,quality))}
async function exportImage(type,ext,quality){render();const blob=await canvasBlob(type,quality);download(blob,`${safeName(values().projectName)}.${ext}`);status(`File ${ext.toUpperCase()} creato.`)}
function u8(str){return new TextEncoder().encode(str)}
function concat(parts){let size=parts.reduce((s,p)=>s+p.length,0),out=new Uint8Array(size),o=0;parts.forEach(p=>{out.set(p,o);o+=p.length});return out}
async function exportPdf(){
  render();const jpg=await canvasBlob('image/jpeg',.94),img=new Uint8Array(await jpg.arrayBuffer());const w=canvas.width,h=canvas.height;
  const objects=[];objects[1]=u8('<< /Type /Catalog /Pages 2 0 R >>');objects[2]=u8('<< /Type /Pages /Kids [3 0 R] /Count 1 >>');objects[3]=u8(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${w} ${h}] /Resources << /XObject << /Im0 4 0 R >> >> /Contents 5 0 R >>`);objects[4]=concat([u8(`<< /Type /XObject /Subtype /Image /Width ${w} /Height ${h} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${img.length} >>\nstream\n`),img,u8('\nendstream')]);const stream=`q\n${w} 0 0 ${h} 0 0 cm\n/Im0 Do\nQ`;objects[5]=u8(`<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`);
  const parts=[u8('%PDF-1.4\n%\xFF\xFF\xFF\xFF\n')],offsets=[0];let pos=parts[0].length;for(let i=1;i<=5;i++){offsets[i]=pos;const obj=concat([u8(`${i} 0 obj\n`),objects[i],u8('\nendobj\n')]);parts.push(obj);pos+=obj.length}const xref=pos;let table='xref\n0 6\n0000000000 65535 f \n';for(let i=1;i<=5;i++)table+=String(offsets[i]).padStart(10,'0')+' 00000 n \n';parts.push(u8(table+`trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`));download(new Blob([concat(parts)],{type:'application/pdf'}),`${safeName(values().projectName)}.pdf`);status('PDF creato.')
}
function projectData(){return {...values(),photoData:state.photoData,logoData:state.logoData,logo2Data:state.logo2Data,photoZoom:state.photoZoom,photoX:state.photoX,photoY:state.photoY,version:'3.0.0'}}
async function restoreProject(data){if(!data)return;for(const id of ['format','template','palette','title','subtitle','description','infoHeading','info','contact','cta','brand','projectName'])if(data[id]!=null&&$(id))$(id).value=data[id];state.photoData=data.photoData||null;state.logoData=data.logoData||null;state.logo2Data=data.logo2Data||null;state.photoZoom=Number(data.photoZoom)||1;state.photoX=Number(data.photoX)||0;state.photoY=Number(data.photoY)||0;$('photoZoom').value=Math.round(state.photoZoom*100);[state.photo,state.logo,state.logo2]=await Promise.all([dataURLToImage(state.photoData),dataURLToImage(state.logoData),dataURLToImage(state.logo2Data)]);render()}
function status(text){$('status').textContent=text;setTimeout(()=>{if($('status').textContent===text)$('status').textContent=''},3500)}

function bind(){
  document.querySelectorAll('.step').forEach(btn=>btn.addEventListener('click',()=>{document.querySelectorAll('.step,.panel').forEach(x=>x.classList.remove('active'));btn.classList.add('active');$(btn.dataset.panel).classList.add('active')}));
  document.querySelectorAll('input:not([type=file]),select,textarea').forEach(el=>el.addEventListener('input',lazyRender));
  $('template').addEventListener('change',()=>{state.templateIndex=TEMPLATES.findIndex(t=>t.id===$('template').value);render()});$('format').addEventListener('change',render);$('palette').addEventListener('change',render);
  $('photoInput').addEventListener('change',e=>loadFile(e.target,'photo'));$('logoInput').addEventListener('change',e=>loadFile(e.target,'logo'));$('logo2Input').addEventListener('change',e=>loadFile(e.target,'logo2'));
  $('photoZoom').addEventListener('input',e=>{state.photoZoom=Number(e.target.value)/100;render()});$('resetPhoto').addEventListener('click',()=>{state.photoZoom=1;state.photoX=0;state.photoY=0;$('photoZoom').value=100;render()});
  document.querySelectorAll('[data-move]').forEach(b=>b.addEventListener('click',()=>{const m=b.dataset.move;if(m==='center'){state.photoX=0;state.photoY=0}else if(m==='left')state.photoX-=.12;else if(m==='right')state.photoX+=.12;else if(m==='up')state.photoY-=.12;else if(m==='down')state.photoY+=.12;render()}));
  $('prevTemplate').addEventListener('click',()=>nextTemplate(-1));$('nextTemplate').addEventListener('click',()=>nextTemplate(1));
  $('exportPng').addEventListener('click',()=>exportImage('image/png','png',1));$('exportJpg').addEventListener('click',()=>exportImage('image/jpeg','jpg',.94));$('exportPdf').addEventListener('click',exportPdf);
  $('saveProject').addEventListener('click',()=>{try{localStorage.setItem('k9-studio-project',JSON.stringify(projectData()));status('Progetto salvato sul dispositivo.')}catch(e){status('Impossibile salvare: immagini troppo grandi.')}});
  $('loadProject').addEventListener('click',async()=>{const raw=localStorage.getItem('k9-studio-project');if(!raw)return status('Nessun progetto salvato.');await restoreProject(JSON.parse(raw));status('Progetto caricato.')});
}

let deferredPrompt=null;window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferredPrompt=e;$('installBtn').classList.remove('hidden')});$('installBtn')?.addEventListener('click',async()=>{if(!deferredPrompt)return;deferredPrompt.prompt();await deferredPrompt.userChoice;deferredPrompt=null;$('installBtn').classList.add('hidden')});

setSelects();bind();render();
if('serviceWorker' in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));
