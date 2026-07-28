/*
 * K9 Creative Studio - Motore grafico modulare
 * Release 6.4.0
 * Questo file contiene esclusivamente helper e renderer Canvas.
 */

function k9v4Lines(value){
 return String(value||"").split(/\n|•|;|\|/).map(v=>v.replace(/^[-–—•\s]+/,"").trim()).filter(Boolean);
}
function k9v4Hash(text){let h=2166136261;for(const ch of String(text||"")){h^=ch.charCodeAt(0);h=Math.imul(h,16777619)}return Math.abs(h>>>0)}
function k9v4HexAlpha(hex,a){
 const v=String(hex||"#ff7a00").replace('#','');const n=parseInt(v.length===3?v.split('').map(x=>x+x).join(''):v,16);
 return `rgba(${(n>>16)&255},${(n>>8)&255},${n&255},${a})`;
}
function k9v4Round(ctx,x,y,w,h,r,fill,stroke=null,lw=1){roundedRect(ctx,x,y,w,h,r);if(fill){ctx.fillStyle=fill;ctx.fill()}if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=lw;ctx.stroke()}}
function k9v4Cover(ctx,img,x,y,w,h,fx=.5,fy=.5){
 if(!img)return;const sc=Math.max(w/img.width,h/img.height),dw=img.width*sc,dh=img.height*sc;
 ctx.save();ctx.beginPath();ctx.rect(x,y,w,h);ctx.clip();ctx.drawImage(img,x+(w-dw)*fx,y+(h-dh)*fy,dw,dh);ctx.restore();
}
function k9v4Wrap(ctx,text,maxWidth,maxLines=99){
 const out=[];for(const para of String(text||'').split(/\n+/)){let line='';for(const word of para.split(/\s+/).filter(Boolean)){const t=line?line+' '+word:word;if(line&&ctx.measureText(t).width>maxWidth){out.push(line);line=word}else line=t;if(out.length>=maxLines)break}if(line&&out.length<maxLines)out.push(line);if(out.length>=maxLines)break}
 if(out.length===maxLines){let q=out[maxLines-1];while(q&&ctx.measureText(q+'…').width>maxWidth)q=q.slice(0,-1);out[maxLines-1]=q+(q?'…':'')}
 return out;
}
function k9v4Fit(ctx,text,maxWidth,maxHeight,start,min,weight=800,maxLines=8,font='Arial'){
 let size=start,lines=[];for(;size>=min;size-=2){ctx.font=`${weight} ${size}px ${font}, sans-serif`;lines=k9v4Wrap(ctx,text,maxWidth,99);if(lines.length*size*1.12<=maxHeight)break}
 const allowed=Math.max(1,Math.floor(maxHeight/(size*1.12)));if(lines.length>allowed){lines=lines.slice(0,allowed);let last=lines.at(-1)||'';while(last&&ctx.measureText(last+'…').width>maxWidth)last=last.slice(0,-1);lines[allowed-1]=last+'…'}
 return {size,lines,lh:size*1.12,height:lines.length*size*1.12};
}
function k9v4DrawText(ctx,fit,x,y,color,align='left'){
 ctx.fillStyle=color;ctx.textAlign=align;ctx.textBaseline='top';for(const line of fit.lines){ctx.fillText(line,x,y);y+=fit.lh}return y;
}
function k9v4CleanText(value){
 return String(value||"").replace(/\r/g,"").replace(/[ \t]+\n/g,"\n").replace(/\n{3,}/g,"\n\n").trim();
}
function k9v4List(value){
 return k9v4CleanText(value).split(/\n+/).map(v=>v.replace(/^[-–—•▪◦✓✔\s]+/,"").trim()).filter(Boolean);
}
function k9v4Sections(d){
 const defs=[
  ['COSA COMPRENDE',d.benefits,'list'],['COME FUNZIONA',d.program,'list'],['PER CHI È INDICATO',d.targetText,'list'],
  ['METODO',d.methodText,'paragraph'],['INCLUSO',d.includedText,'list'],['REQUISITI',d.requirementsText,'list'],
  ['DESCRIZIONE',d.details,'paragraph'],['NOTE IMPORTANTI',d.notesText,'paragraph'],
  ['DATA E ORARI',[d.date?dateText(d.date):'',d.eventTime].filter(Boolean).join(' · '),'paragraph'],
  ['DISPONIBILITÀ E CONTATTI',[d.eventSeats,d.eventPrice,d.eventPhone,d.location,d.contact].filter(Boolean).join('\n'),'list']
 ];
 const seen=new Set(),res=[];
 for(const [title,val,kind] of defs){
  const clean=k9v4CleanText(val);if(!clean)continue;
  let items=kind==='list'?k9v4List(clean):[clean];
  items=items.filter(x=>{const k=x.toLocaleLowerCase('it-IT').replace(/\s+/g,' ');if(seen.has(k))return false;seen.add(k);return true});
  if(items.length)res.push({title,items,kind});
 }
 const mode=d.contentMode||'complete';
 if(mode==='essential')return res.filter(s=>['COSA COMPRENDE','DESCRIZIONE','DATA E ORARI','DISPONIBILITÀ E CONTATTI'].includes(s.title)).slice(0,4);
 if(mode==='balanced')return res.slice(0,6);
 return res.slice(0,10);
}
function k9v4DrawLogo(ctx,img,x,y,maxW,maxH,bg=true){
 if(!img)return;const sc=Math.min(maxW/img.width,maxH/img.height,1.5),w=img.width*sc,h=img.height*sc;
 if(bg)k9v4Round(ctx,x-w-12,y-h-10,w+24,h+20,12,'rgba(255,255,255,.92)','rgba(0,0,0,.10)',1);
 ctx.drawImage(img,x-w,y-h,w,h);
}
function k9v4Palette(d){
 const raw=styles[d.style]||styles['Premium tattico'];
 const base=typeof styleWithMode==='function'?styleWithMode(raw,d.styleMode||'auto'):raw;
 return {accent:d.accent||base.accent||'#f47421',gold:d.gold||base.gold||'#d7ae62',dark:'#0b1016',ink:'#17202a',paper:'#f7f5f1',muted:'#66717c',light:!!base.light,bg1:base.bg1||'#101820',bg2:base.bg2||'#374451'};
}
function k9v4LayoutFamily(d,portrait,wide){
 const selected=typeof selectedGraphic==='function'?selectedGraphic(d.type,d.graphicVariant):null;
 const layout=String(selected?.[1]||(styles[d.style]||{}).layout||'tactical');
 const map={
  tactical:4,operational:4,hexTactical:4,dataSheet:4,blueprint:4,industrial:4,signage:4,
  verticalEditorial:1,editorial:3,magazine:3,timeline:1,tornPaper:1,nordic:5,marble:5,softProfessional:5,minimal:5,
  splitLeft:2,splitRight:2,corporate:2,corporatePremium:2,topBanner:2,verticalStrip:2,asymGrid:2,eventTicket:2,filmStrips:2,
  fullBleed:7,cinematic:0,spotlight:7,bigType:7,urbanPoster:7,festival:7,centerPoster:7,
  photoWindow:1,framedPhoto:1,showcase:5,polaroid:5,photoCollage:6,mosaic:6,stackedCards:6,modules:6,
  rings:6,circleFocus:6,bauhaus:6,neonTech:6,cyberGrid:6,waves:6,mesh:6,ribbonEvent:0,bottomCard:0
 };
 let family=map[layout];
 if(family==null)family=k9v4Hash(layout)%8;
 if(portrait&&family===2)family=1;
 if(wide&&family===1)family=2;
 return {family,layout,label:selected?.[0]||layout};
}

function k9v4Decorate(ctx,w,h,m,unit,P,variant,portrait,wide){
 ctx.save();
 const a=k9v4HexAlpha(P.accent,.55),g=k9v4HexAlpha(P.gold,.48),soft='rgba(255,255,255,.10)';
 switch(variant%12){
  case 0: ctx.strokeStyle=a;ctx.lineWidth=Math.max(3,unit*.006);ctx.strokeRect(m*.42,m*.42,w-m*.84,h-m*.84);ctx.strokeStyle=g;ctx.lineWidth=Math.max(1,unit*.002);ctx.strokeRect(m*.70,m*.70,w-m*1.4,h-m*1.4);break;
  case 1: for(let i=0;i<5;i++){ctx.strokeStyle=i%2?a:soft;ctx.lineWidth=Math.max(1,unit*.002);ctx.beginPath();ctx.arc(w*.88,h*.12,unit*(.07+i*.035),0,Math.PI*2);ctx.stroke()}break;
  case 2: ctx.fillStyle=a;ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(w*.28,0);ctx.lineTo(0,h*.22);ctx.closePath();ctx.fill();ctx.fillStyle=g;ctx.fillRect(0,h-unit*.018,w*.32,unit*.018);break;
  case 3: ctx.strokeStyle=soft;ctx.lineWidth=Math.max(1,unit*.0015);for(let x=m;x<w;x+=unit*.065){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x-unit*.18,h);ctx.stroke()}break;
  case 4: ctx.fillStyle=k9v4HexAlpha(P.accent,.18);for(let i=0;i<7;i++)ctx.fillRect(w-unit*(.035+i*.035),0,unit*.017,h);break;
  case 5: ctx.strokeStyle=g;ctx.lineWidth=Math.max(2,unit*.004);ctx.beginPath();ctx.moveTo(m,h-m*.7);ctx.lineTo(w*.45,h-m*.7);ctx.stroke();ctx.beginPath();ctx.moveTo(w-m*.7,m);ctx.lineTo(w-m*.7,h*.42);ctx.stroke();break;
  case 6: ctx.fillStyle='rgba(255,255,255,.06)';for(let y=0;y<h;y+=unit*.055)for(let x=(y/unit%2)*unit*.028;x<w;x+=unit*.055){ctx.beginPath();ctx.arc(x,y,unit*.004,0,Math.PI*2);ctx.fill()}break;
  case 7: ctx.strokeStyle=a;ctx.lineWidth=Math.max(4,unit*.009);ctx.beginPath();ctx.moveTo(0,h*.84);ctx.bezierCurveTo(w*.28,h*.68,w*.62,h*.98,w,h*.76);ctx.stroke();break;
  case 8: ctx.fillStyle=k9v4HexAlpha(P.gold,.18);ctx.save();ctx.translate(w*.82,h*.16);ctx.rotate(Math.PI/4);ctx.fillRect(-unit*.13,-unit*.13,unit*.26,unit*.26);ctx.restore();break;
  case 9: ctx.strokeStyle=soft;ctx.lineWidth=Math.max(1,unit*.002);for(let i=0;i<4;i++){ctx.strokeRect(m+i*unit*.018,m+i*unit*.018,w-2*(m+i*unit*.018),h-2*(m+i*unit*.018))}break;
  case 10: ctx.fillStyle=a;ctx.fillRect(0,0,wide?w*.018:unit*.022,h);ctx.fillStyle=g;ctx.fillRect(w-unit*.012,0,unit*.012,h*.44);break;
  case 11: ctx.strokeStyle=a;ctx.lineWidth=Math.max(2,unit*.004);for(let i=0;i<3;i++){ctx.beginPath();ctx.moveTo(w*(.64+i*.07),0);ctx.lineTo(w,h*(.25+i*.09));ctx.stroke()}break;
 }
 ctx.restore();
}
function k9v4CardShape(ctx,x,y,w,h,r,variant,fill,stroke,lw){
 if(variant%4===0)return k9v4Round(ctx,x,y,w,h,r,fill,stroke,lw);
 ctx.beginPath();
 if(variant%4===1){ctx.moveTo(x+r,y);ctx.lineTo(x+w-r,y);ctx.quadraticCurveTo(x+w,y,x+w,y+r);ctx.lineTo(x+w,y+h-r);ctx.quadraticCurveTo(x+w,y+h,x+w-r,y+h);ctx.lineTo(x+r*1.7,y+h);ctx.lineTo(x,y+h-r*1.7);ctx.lineTo(x,y+r);ctx.quadraticCurveTo(x,y,x+r,y)}
 else if(variant%4===2){ctx.moveTo(x+r*1.5,y);ctx.lineTo(x+w,y);ctx.lineTo(x+w,y+h-r*1.5);ctx.lineTo(x+w-r*1.5,y+h);ctx.lineTo(x,y+h);ctx.lineTo(x,y+r*1.5);ctx.closePath()}
 else {roundedRect(ctx,x,y,w,h,r)}
 if(fill){ctx.fillStyle=fill;ctx.fill()}if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=lw;ctx.stroke()}
}
async function renderDesignV4(canvas,d){
 // La sequenza dei rendering è gestita esclusivamente da build() in app.js.
 // Il renderer non deve incrementare renderToken: farlo rendeva ogni anteprima
 // immediatamente obsoleta prima della copia dal canvas temporaneo a quello visibile.
 const f=formats[d.type]||formats['Post Instagram quadrato'],w=f.w,h=f.h;canvas.width=w;canvas.height=h;
 const ctx=canvas.getContext('2d',{alpha:false});ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
 const [img,logo,logo2,...extras]=await Promise.all([loadImg(currentImage),loadImg(currentLogo),loadImg(currentLogo2),...extraLogos.map(l=>loadImg(l.data))]);
 const P=k9v4Palette(d),ratio=w/h,portrait=ratio<.86,wide=ratio>1.35,print=/A4|A5|Brochure|Attestato/.test(d.type),unit=Math.min(w,h),m=Math.round(unit*(print?.045:.042));
 const title=String(d.title||'').trim(),sub=String(d.subtitle||d.slogan||'').trim(),sections=k9v4Sections(d),badge=[d.discipline,d.project].filter(Boolean).join(' · ').toUpperCase();
 const styleHash=k9v4Hash(d.style+'|'+d.type+'|'+String(d.graphicVariant??0));const layoutChoice=k9v4LayoutFamily(d,portrait,wide);let family=layoutChoice.family;const decorVariant=(Math.floor(styleHash/8)+(Number(d.graphicVariant)||0))%12;
 const bg=ctx.createLinearGradient(0,0,w,h);bg.addColorStop(0,P.bg1);bg.addColorStop(1,P.bg2);ctx.fillStyle=bg;ctx.fillRect(0,0,w,h);
 k9v4Decorate(ctx,w,h,m,unit,P,decorVariant,portrait,wide);
 // La composizione selezionata dalle frecce superiori determina ora realmente il layout.
 ctx.save();ctx.font=`700 ${Math.max(12,Math.round(unit*.014))}px Arial`;ctx.textAlign='right';ctx.textBaseline='top';ctx.fillStyle=P.light?'rgba(23,32,42,.48)':'rgba(255,255,255,.44)';ctx.fillText(String(layoutChoice.label||'').toUpperCase(),w-m,m*.55);ctx.restore();
 // family 0: cinematic split, 1: editorial portrait, 2: horizontal corporate, 3: magazine,
 // 4: tactical, 5: minimal premium, 6: modular cards, 7: bold poster.
 let hero,content;
 if(family===0){hero={x:0,y:0,w:w,h:portrait?h*.48:h*.60};content={x:0,y:hero.h,w:w,h:h-hero.h};k9v4Cover(ctx,img,...Object.values(hero),.55,.45);const g=ctx.createLinearGradient(0,hero.y,0,hero.h);g.addColorStop(0,'rgba(0,0,0,.06)');g.addColorStop(1,'rgba(0,0,0,.78)');ctx.fillStyle=g;ctx.fillRect(0,0,w,hero.h)}
 else if(family===1){hero={x:m,y:m,w:w-2*m,h:h*.37};content={x:m,y:hero.y+hero.h+m*.55,w:w-2*m,h:h-(hero.y+hero.h+m*1.55)};k9v4Round(ctx,hero.x,hero.y,hero.w,hero.h,unit*.018,P.dark);ctx.save();roundedRect(ctx,hero.x,hero.y,hero.w,hero.h,unit*.018);ctx.clip();k9v4Cover(ctx,img,hero.x,hero.y,hero.w,hero.h,.5,.42);ctx.restore();ctx.fillStyle='rgba(0,0,0,.42)';roundedRect(ctx,hero.x,hero.y,hero.w,hero.h,unit*.018);ctx.fill()}
 else if(family===2){hero={x:w*.48,y:0,w:w*.52,h:h};content={x:m,y:m,w:w*.42,h:h-2*m};k9v4Cover(ctx,img,hero.x,hero.y,hero.w,hero.h,.5,.5);const g=ctx.createLinearGradient(hero.x,0,hero.x+hero.w*.35,0);g.addColorStop(0,P.bg1);g.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=g;ctx.fillRect(hero.x,0,hero.w*.4,h)}
 else if(family===3){hero={x:0,y:0,w:w,h:h*.55};content={x:m,y:h*.49,w:w-2*m,h:h*.47};k9v4Cover(ctx,img,0,0,w,hero.h,.5,.4);ctx.fillStyle='rgba(0,0,0,.30)';ctx.fillRect(0,0,w,hero.h);k9v4Round(ctx,content.x,content.y,content.w,content.h,unit*.02,P.paper,'rgba(0,0,0,.12)',2)}
 else if(family===4){hero={x:w*.42,y:0,w:w*.58,h:h*.66};content={x:m,y:m,w:w*.48,h:h-2*m};k9v4Cover(ctx,img,hero.x,0,hero.w,hero.h,.52,.4);ctx.fillStyle='rgba(5,12,8,.25)';ctx.fillRect(hero.x,0,hero.w,hero.h);ctx.strokeStyle=P.gold;ctx.lineWidth=Math.max(3,unit*.006);ctx.strokeRect(m,m,w-2*m,h-2*m)}
 else if(family===5){ctx.fillStyle=P.paper;ctx.fillRect(0,0,w,h);hero={x:wide?w*.55:m,y:m,w:wide?w*.40:w-2*m,h:wide?h-2*m:h*.40};content={x:m,y:wide?m:hero.y+hero.h+m,w:wide?w*.46:w-2*m,h:wide?h-2*m:h-(hero.y+hero.h+2*m)};k9v4Round(ctx,hero.x,hero.y,hero.w,hero.h,unit*.015,'#ddd');ctx.save();roundedRect(ctx,hero.x,hero.y,hero.w,hero.h,unit*.015);ctx.clip();k9v4Cover(ctx,img,hero.x,hero.y,hero.w,hero.h,.5,.5);ctx.restore()}
 else if(family===6){hero={x:m,y:m,w:w-2*m,h:portrait?h*.32:h*.38};content={x:m,y:hero.y+hero.h+m*.55,w:w-2*m,h:h-(hero.y+hero.h+m*1.55)};k9v4Cover(ctx,img,hero.x,hero.y,hero.w,hero.h,.5,.45);ctx.fillStyle='rgba(0,0,0,.35)';ctx.fillRect(hero.x,hero.y,hero.w,hero.h)}
 else {hero={x:0,y:0,w:w,h:h};content={x:m,y:portrait?h*.51:m,w:portrait?w-2*m:w*.54,h:portrait?h*.43:h-2*m};k9v4Cover(ctx,img,0,0,w,h,.58,.5);ctx.fillStyle='rgba(0,0,0,.54)';ctx.fillRect(0,0,w,h);k9v4Round(ctx,content.x,content.y,content.w,content.h,unit*.018,'rgba(8,12,16,.78)',k9v4HexAlpha(P.accent,.7),Math.max(2,unit*.003))}
 // Hero copy: always uses available content and never overlays the information grid.
 let tx,ty,tw,th,textColor='#fff';
 if(family===2||family===4||family===5){tx=content.x;ty=content.y;tw=content.w;th=Math.min(content.h*.47,h*.48);textColor=family===5?P.ink:'#fff'}
 else if(family===3){tx=m;ty=m;tw=w-2*m;th=hero.h*.76;textColor='#fff'}
 else if(family===6){tx=hero.x+m*.55;ty=hero.y+m*.45;tw=hero.w-m*1.1;th=hero.h-m*.9;textColor='#fff'}
 else if(family===7){tx=content.x+m*.45;ty=content.y+m*.45;tw=content.w-m*.9;th=Math.min(content.h*.47,h*.42);textColor='#fff'}
 else {tx=m;ty=m;tw=wide?w*.55:w-2*m;th=hero.h-m*1.3;textColor='#fff'}
 ctx.textAlign='left';ctx.textBaseline='top';ctx.fillStyle=P.accent;ctx.font=`900 ${Math.max(18,Math.round(unit*.028))}px Arial`;ctx.fillText(fitEllipsis(ctx,badge,tw),tx,ty);ty+=unit*.055;
 if(title){const fit=k9v4Fit(ctx,title,tw,th*.58,Math.round(unit*(portrait?.092:.082)),Math.round(unit*(portrait?.040:.034)),900,portrait?5:4);ty=k9v4DrawText(ctx,fit,tx,ty,textColor,'left')+unit*.018}
 let heroTextBottom=ty;
 if(sub&&ty<((family===2||family===4||family===5)?content.y+th:hero.y+hero.h-m)){
  const fit=k9v4Fit(ctx,sub,tw,Math.max(unit*.08,th-(ty-(family===2||family===4||family===5?content.y:hero.y))),Math.round(unit*(portrait?.034:.031)),Math.round(unit*.022),600,4);
  heroTextBottom=k9v4DrawText(ctx,fit,tx,ty,textColor==='white'?'#fff':textColor,'left');
 }
 // Content region recalculated independently for every format. The information
 // grid always starts below the actual title/subtitle block, never at a fixed
 // percentage that can overlap long copy.
 let gridX=content.x,gridY=content.y,gridW=content.w,gridH=content.h;
 if(family===2||family===4||family===5){gridY=content.y+Math.min(content.h*.50,h*.50);gridH=content.y+content.h-gridY}
 if(family===3){gridX=content.x+m*.55;gridY=content.y+m*.7;gridW=content.w-m*1.1;gridH=content.h-m*1.4}
 if(family===7){gridX=content.x+m*.45;gridY=content.y+Math.min(content.h*.52,h*.46);gridW=content.w-m*.9;gridH=content.y+content.h-gridY-m*.45}
 // Keep a real safety gap under the hero copy and reserve the footer/CTA area.
 const copySafety=unit*(portrait?.030:.022);
 if(heroTextBottom>gridY-copySafety){gridY=heroTextBottom+copySafety;gridH=content.y+content.h-gridY}
 const footerReserve=unit*(portrait?.092:.080);
 gridH=Math.max(0,gridH-footerReserve);
 if(sections.length&&gridH>unit*.12){
  const initialCols=portrait?1:(wide?Math.min(3,sections.length):Math.min(2,sections.length));
  const gap=unit*.016;
  // A card is rendered only when it has enough height for both heading and body.
  // This prevents the previous result where eight empty-looking labels were
  // squeezed into a space suitable for only two or four complete sections.
  const minCardH=unit*(portrait?.145:(wide?.125:.135));
  const maxRows=Math.max(1,Math.floor((gridH+gap)/(minCardH+gap)));
  const maxVisible=Math.max(1,initialCols*maxRows);
  const priority=['COSA COMPRENDE','COME FUNZIONA','PER CHI È INDICATO','DATA E ORARI','DISPONIBILITÀ E CONTATTI','METODO','INCLUSO','REQUISITI','DESCRIZIONE','NOTE IMPORTANTI'];const orderedSections=[...sections].sort((a,b)=>priority.indexOf(a.title)-priority.indexOf(b.title));const visibleSections=orderedSections.slice(0,maxVisible);
  const cols=portrait?1:(wide?Math.min(3,visibleSections.length):Math.min(2,visibleSections.length));
  const rows=Math.ceil(visibleSections.length/cols),cw=(gridW-gap*(cols-1))/cols,ch=(gridH-gap*(rows-1))/rows;
  visibleSections.forEach((sec,i)=>{const col=i%cols,row=Math.floor(i/cols),x=gridX+col*(cw+gap),y=gridY+row*(ch+gap);const lightCard=family===3||family===5;const fill=lightCard?'rgba(255,255,255,.96)':'rgba(7,12,18,.78)',ink=lightCard?P.ink:'#fff';k9v4CardShape(ctx,x,y,cw,ch,unit*.014,decorVariant+i,fill,lightCard?'rgba(0,0,0,.13)':k9v4HexAlpha(P.accent,.48),Math.max(1,unit*.002));
   const pad=unit*.016;ctx.font=`900 ${Math.max(17,Math.round(unit*.023))}px Arial`;ctx.fillStyle=P.accent;ctx.textAlign='left';ctx.textBaseline='top';const ht=k9v4Wrap(ctx,sec.title,cw-2*pad,2);let yy=y+pad;for(const line of ht){ctx.fillText(line,x+pad,yy);yy+=unit*.023}yy+=unit*.008;
   const available=y+ch-pad-yy,items=sec.items,per=Math.max(1,Math.floor(available/Math.max(1,items.length))),baseMin=portrait?Math.round(unit*.020):Math.round(unit*.017),fs=Math.max(16,Math.max(baseMin,Math.min(Math.round(unit*.027),Math.round(per*(sec.kind==='paragraph'?.34:.40)))));ctx.font=`${sec.kind==='paragraph'?600:550} ${fs}px Arial`;ctx.fillStyle=ink;
   for(const item of items){if(yy>y+ch-pad-fs)break;const isParagraph=sec.kind==='paragraph';if(!isParagraph){ctx.fillStyle=P.accent;ctx.beginPath();ctx.arc(x+pad+fs*.18,yy+fs*.48,Math.max(2,fs*.13),0,Math.PI*2);ctx.fill()}ctx.fillStyle=ink;const textX=x+pad+(isParagraph?0:fs*.65),textW=cw-2*pad-(isParagraph?0:fs*.8),maxLines=Math.max(1,Math.floor((y+ch-pad-yy)/(fs*1.30))),lines=k9v4Wrap(ctx,item,textW,maxLines);for(const line of lines){ctx.fillText(line,textX,yy);yy+=fs*1.30}yy+=fs*.22}
  });
 }
 // CTA/footer and logos.
 const ctaText=[d.contact,d.location].filter(Boolean).join(' · ');if(ctaText){ctx.font=`800 ${Math.max(17,Math.round(unit*.022))}px Arial`;const ctaW=Math.min(w-2*m,ctx.measureText(ctaText.toUpperCase()).width+unit*.065),ctaH=Math.max(44,unit*.062),x=family===5?m:w-m-ctaW,y=h-m-ctaH;k9v4Round(ctx,x,y,ctaW,ctaH,ctaH/2,P.accent);ctx.fillStyle='#fff';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(fitEllipsis(ctx,ctaText.toUpperCase(),ctaW-unit*.04),x+ctaW/2,y+ctaH/2)}
 k9v4DrawLogo(ctx,logo,w-m,h-m,unit*.18,unit*.11,true);if(logo2)k9v4DrawLogo(ctx,logo2,m+unit*.16,h-m,unit*.16,unit*.10,true);
 extras.forEach((im,i)=>{if(im)k9v4DrawLogo(ctx,im,w-m,h-m-unit*(.14+i*.12),unit*.14,unit*.09,true)});
 ctx.strokeStyle='rgba(255,255,255,.18)';ctx.lineWidth=Math.max(1,unit*.0015);ctx.strokeRect(1,1,w-2,h-2);return canvas;
}
