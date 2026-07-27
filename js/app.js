window.__K9_ERRORS=window.__K9_ERRORS||[];
const $=id=>document.getElementById(id), STORAGE_KEY="k9CreativeStudioV31AdaptiveMultiLogo";
let currentImage="",currentLogo="",currentLogoOriginal="",currentLogo2="",currentLogo2Original="",extraLogos=[],activeLogoKey="logo",renderToken=0,graphicVariant=0;
let selectedCanvasElement="logo",activeCanvasDrag=null,canvasDragMoved=false;
const OFFSET_KEYS=["image","title","subtitle","details","cta","badge","footer","logo","logo2","logo3","logo4","logo5","logo6","logo7","logo8"];const SCALE_KEYS=[...OFFSET_KEYS];
let manualOffsets=Object.fromEntries(OFFSET_KEYS.map(k=>[k,{x:0,y:0}]));let elementScales=Object.fromEntries(SCALE_KEYS.map(k=>[k,100]));
function normalizeOffsets(value){const out=Object.fromEntries(OFFSET_KEYS.map(k=>[k,{x:0,y:0}]));if(value&&typeof value==="object")OFFSET_KEYS.forEach(k=>{if(value[k]){out[k].x=Number(value[k].x)||0;out[k].y=Number(value[k].y)||0}});return out}function normalizeScales(value){const out=Object.fromEntries(SCALE_KEYS.map(k=>[k,100]));if(value&&typeof value==="object")SCALE_KEYS.forEach(k=>{if(value[k]!=null)out[k]=Math.max(40,Math.min(200,Number(value[k])||100))});return out}
function scaleSnapshot(){return JSON.parse(JSON.stringify(elementScales))}
function elementScale(key){return Math.max(.4,Math.min(2,Number(elementScales[key]||100)/100))}
function updateSelectedScaleControl(){const key=$("moveTarget")?.value||"title",value=Math.round(elementScales[key]||100),names={image:"Immagine principale",title:"Titolo",subtitle:"Sottotitolo / slogan",details:"Descrizione e pannello",cta:"CTA / pulsante",badge:"Badge superiore",footer:"Data e luogo",logo:"Logo 1",logo2:"Logo 2",logo3:"Logo 3",logo4:"Logo 4",logo5:"Logo 5",logo6:"Logo 6",logo7:"Logo 7",logo8:"Logo 8"};if($("selectedElementScale"))$("selectedElementScale").value=value;if($("selectedElementScaleValue"))$("selectedElementScaleValue").textContent=`Dimensione: ${value}%`;if($("selectedElementName"))$("selectedElementName").textContent=names[key]||key}

function offsetSnapshot(){return JSON.parse(JSON.stringify(manualOffsets))}
function resetOffsets(key=null){if(key&&manualOffsets[key]){manualOffsets[key]={x:0,y:0};elementScales[key]=100}else{manualOffsets=normalizeOffsets();elementScales=normalizeScales()}updateOffsetReadout();updateSelectedScaleControl();build(false)}
function updateOffsetReadout(){const key=$("moveTarget")?.value||"title",o=manualOffsets[key]||{x:0,y:0};if($("offsetX"))$("offsetX").textContent=`X: ${Math.round(o.x)} px`;if($("offsetY"))$("offsetY").textContent=`Y: ${Math.round(o.y)} px`}


function allLogoSlots(){
 const list=[];
 if(currentLogo)list.push({key:"logo",name:"Logo 1",data:currentLogo,original:currentLogoOriginal||currentLogo,pos:"br"});
 if(currentLogo2)list.push({key:"logo2",name:"Logo 2",data:currentLogo2,original:currentLogo2Original||currentLogo2,pos:$("logo2Position")?.value||"tl"});
 extraLogos.forEach((l,i)=>list.push({...l,key:`logo${i+3}`}));
 return list;
}
function logoSlotByKey(key){
 if(key==="logo")return currentLogo?{key,name:"Logo 1",data:currentLogo,original:currentLogoOriginal||currentLogo,pos:"br"}:null;
 if(key==="logo2")return currentLogo2?{key,name:"Logo 2",data:currentLogo2,original:currentLogo2Original||currentLogo2,pos:$("logo2Position")?.value||"tl"}:null;
 const i=Number(key.replace("logo",""))-3;return extraLogos[i]||null;
}
function setLogoSlotData(key,data,original=null){
 if(key==="logo"){currentLogo=data;currentLogoOriginal=original||currentLogoOriginal||data}
 else if(key==="logo2"){currentLogo2=data;currentLogo2Original=original||currentLogo2Original||data}
 else{const i=Number(key.replace("logo",""))-3;if(extraLogos[i]){extraLogos[i].data=data;if(original)extraLogos[i].original=original}}
}
function updateLogoManager(){
 const select=$("activeLogoSelect");if(!select)return;
 const slots=allLogoSlots(),previous=activeLogoKey;
 select.innerHTML=slots.length?slots.map(s=>`<option value="${s.key}">${s.name||s.key}</option>`).join(""):'<option value="">Nessun logo</option>';
 if(slots.some(s=>s.key===previous))select.value=previous;else if(slots.length){activeLogoKey=slots[0].key;select.value=activeLogoKey}else activeLogoKey="";
 const slot=logoSlotByKey(activeLogoKey);
 $("activeLogoName").value=slot?.name||"";
 $("activeLogoPosition").value=slot?.pos||"br";
 $("activeLogoScale").value=Math.round(elementScales[activeLogoKey]||100);
 $("activeLogoScaleValue").textContent=Math.round(elementScales[activeLogoKey]||100);
 $("logoManagerStatus").textContent=slots.length?`${slots.length} logo caricati · selezionato ${slot?.name||activeLogoKey}`:"Nessun logo caricato.";
 if(activeLogoKey&&$("moveTarget"))$("moveTarget").value=activeLogoKey;
 updateOffsetReadout();updateSelectedScaleControl();
}
function fileToDataUrl(file){return new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(r.result);r.onerror=reject;r.readAsDataURL(file)})}
async function addMultipleLogos(files){
 const available=8-allLogoSlots().length;if(available<=0)return notify("Puoi gestire al massimo 8 loghi.",true);
 const selected=[...files].slice(0,available);
 for(const file of selected){
  const data=await fileToDataUrl(file);
  if(!currentLogo){currentLogo=currentLogoOriginal=data;activeLogoKey="logo"}
  else if(!currentLogo2){currentLogo2=currentLogo2Original=data;activeLogoKey="logo2"}
  else{const n=extraLogos.length+3;extraLogos.push({key:`logo${n}`,name:file.name.replace(/\.[^.]+$/,"")||`Logo ${n}`,data,original:data,pos:["tl","tr","bl","br","tc","bc"][n%6]});activeLogoKey=`logo${n}`}
 }
 updateLogoManager();applyMedia();build(false);
}
function removeActiveLogo(){
 const key=activeLogoKey;if(!key)return;
 if(key==="logo"){currentLogo=currentLogoOriginal=""}
 else if(key==="logo2"){currentLogo2=currentLogo2Original=""}
 else{const i=Number(key.replace("logo",""))-3;if(i>=0)extraLogos.splice(i,1)}
 manualOffsets[key]={x:0,y:0};elementScales[key]=100;activeLogoKey="";
 updateLogoManager();applyMedia();build(false);
}
async function processActiveLogo(removeBg=true,trim=true){
 const key=activeLogoKey,slot=logoSlotByKey(key);if(!slot?.data)return notify("Seleziona prima un logo.",true);
 const image=await loadImg(slot.data);if(!image)return;
 const c=document.createElement("canvas");c.width=image.naturalWidth;c.height=image.naturalHeight;
 const x=c.getContext("2d",{willReadFrequently:true});x.drawImage(image,0,0);
 if(removeBg){
  const data=x.getImageData(0,0,c.width,c.height),p=data.data;
  const samples=[[0,0],[c.width-1,0],[0,c.height-1],[c.width-1,c.height-1]].map(([sx,sy])=>{const j=(sy*c.width+sx)*4;return[p[j],p[j+1],p[j+2]]});
  const bg=samples.reduce((a,v)=>a.map((n,i)=>n+v[i]),[0,0,0]).map(v=>v/samples.length),tol=70;
  for(let i=0;i<p.length;i+=4){const dist=Math.hypot(p[i]-bg[0],p[i+1]-bg[1],p[i+2]-bg[2]);if(dist<tol)p[i+3]=Math.round(255*(dist/tol))}
  x.putImageData(data,0,0);
 }
 let result=c.toDataURL("image/png");
 setLogoSlotData(key,result);
 updateLogoManager();build(false);notify("Logo aggiornato.");
}

const formats={
"Post Instagram quadrato":{label:"1080 × 1080 px · 1:1",w:1080,h:1080},
"Post Instagram verticale":{label:"1080 × 1350 px · 4:5",w:1080,h:1350},
"Storia Instagram":{label:"1080 × 1920 px · 9:16",w:1080,h:1920},
"Copertina Reel":{label:"1080 × 1920 px · 9:16",w:1080,h:1920},
"Post Facebook":{label:"1200 × 630 px",w:1200,h:630},
"Copertina Facebook":{label:"1640 × 924 px",w:1640,h:924},
"Post LinkedIn":{label:"1200 × 1200 px",w:1200,h:1200},
"Copertina YouTube":{label:"2560 × 1440 px",w:2560,h:1440},
"Miniatura YouTube":{label:"1280 × 720 px · 16:9",w:1280,h:720},
"Stato WhatsApp":{label:"1080 × 1920 px · 9:16",w:1080,h:1920},
"Locandina A4 verticale":{label:"A4 verticale · 2480 × 3508 px",w:2480,h:3508},
"Locandina A4 orizzontale":{label:"A4 orizzontale · 3508 × 2480 px",w:3508,h:2480},
"Volantino A5 verticale":{label:"A5 verticale · 1748 × 2480 px",w:1748,h:2480},
"Brochure A4 verticale":{label:"A4 verticale · 2480 × 3508 px",w:2480,h:3508},
"Attestato A4 orizzontale":{label:"A4 orizzontale · 3508 × 2480 px",w:3508,h:2480},
"Presentazione 16:9":{label:"1920 × 1080 px · 16:9",w:1920,h:1080},
"Presentazione 4:3":{label:"1600 × 1200 px · 4:3",w:1600,h:1200},
"Banner sito panoramico":{label:"1920 × 800 px",w:1920,h:800},
"Banner sito standard":{label:"1600 × 900 px",w:1600,h:900},
"Biglietto da visita":{label:"1050 × 600 px",w:1050,h:600}
};
const disciplines={
"Mantrailing":{icon:"",title:"Segui la traccia. Scopri il potenziale del tuo cane.",desc:"ricerca olfattiva individuale su traccia umana",benefit:"rafforza collaborazione, fiducia e appagamento olfattivo",keywords:["mantrailing","ricerca olfattiva","binomio"]},
"HRDD":{icon:"🦺",title:"Preparazione, metodo e affidabilità operativa.",desc:"ricerca specialistica e lavoro tecnico dell’unità cinofila",benefit:"sviluppa precisione, metodo e competenze operative",keywords:["HRDD","unità cinofile","ricerca specialistica"]},
"Detection":{icon:"👃",title:"Il naso lavora. Il binomio cresce.",desc:"discriminazione olfattiva e ricerca di odori target",benefit:"allena concentrazione, autocontrollo e comunicazione",keywords:["detection","scent work","olfatto"]},
"Dogsitter":{icon:"🐕",title:"Il tuo cane seguito con cura, competenza e attenzione.",desc:"servizio professionale di cura, gestione e benessere del cane",benefit:"offre assistenza organizzata e personalizzata rispettando abitudini ed esigenze",keywords:["dog sitter","cura del cane","servizio cani"]},
"Passeggiate":{icon:"🦮",title:"Passeggiate pensate per il benessere del tuo cane.",desc:"uscite individuali o programmate con gestione responsabile",benefit:"garantisce movimento, esplorazione e routine anche quando il proprietario è impegnato",keywords:["passeggiate cani","dog walking","benessere"]},
"Pensione":{icon:"🏡",title:"Un ambiente sicuro e attento anche quando sei lontano.",desc:"ospitalità e gestione quotidiana personalizzata",benefit:"assicura continuità, cura e serenità durante l’assenza del proprietario",keywords:["pensione cani","ospitalità","cura"]},
"Educazione cinofila":{icon:"🎓",title:"Costruire relazione, equilibrio e comunicazione.",desc:"percorsi educativi personalizzati per cane e proprietario",benefit:"migliora la convivenza e rende più chiara la comunicazione quotidiana",keywords:["educazione cinofila","relazione","comunicazione"]},
"Recupero comportamentale":{icon:"🤝",title:"Comprendere il problema è il primo passo per cambiare.",desc:"percorsi individuali per difficoltà comportamentali",benefit:"aiuta il binomio a gestire criticità con metodo e obiettivi realistici",keywords:["recupero comportamentale","rieducazione","cane"]},
"Problem solving":{icon:"🧩",title:"Pensare, scegliere, risolvere.",desc:"attività guidate di problem solving per il cane",benefit:"stimola autonomia, flessibilità cognitiva e fiducia",keywords:["problem solving","cognizione","attivazione mentale"]},
"Giochi olfattivi":{icon:"👃",title:"Un mondo da scoprire attraverso il naso.",desc:"attività ludiche basate sulla ricerca e discriminazione olfattiva",benefit:"favorisce appagamento, concentrazione e calma",keywords:["giochi olfattivi","olfatto","divertimento"]},
"Attivazione mentale":{icon:"🧠",title:"Mente attiva, cane più appagato.",desc:"giochi cognitivi ed esercizi di attivazione mentale",benefit:"riduce noia e sostiene competenze cognitive e autocontrollo",keywords:["attivazione mentale","giochi cognitivi","benessere"]},
"Clicker training":{icon:"🔘",title:"Precisione, comunicazione e divertimento.",desc:"apprendimento tramite marker e rinforzo positivo",benefit:"rende chiari i comportamenti desiderati e migliora il timing del conduttore",keywords:["clicker training","apprendimento","rinforzo positivo"]},
"Ricerca ludica":{icon:"🔎",title:"Cercare insieme è un gioco che costruisce relazione.",desc:"percorsi di ricerca olfattiva a finalità ludica",benefit:"unisce divertimento, movimento e collaborazione",keywords:["ricerca ludica","olfatto","gioco"]},
"Unità cinofile":{icon:"🐕‍🦺",title:"Formazione tecnica per unità cinofile preparate.",desc:"addestramento, metodo e operatività",benefit:"costruisce competenze verificabili attraverso lavoro progressivo",keywords:["unità cinofile","formazione operativa","addestramento"]},
"Formazione istruttori":{icon:"📚",title:"Competenze solide per formare con responsabilità.",desc:"percorsi formativi per operatori e professionisti cinofili",benefit:"integra teoria, pratica, osservazione e metodo didattico",keywords:["formazione cinofila","istruttori","professionisti"]},
"Stage e seminari":{icon:"📅",title:"Una giornata di formazione può cambiare il modo di lavorare.",desc:"stage, workshop e seminari tematici",benefit:"offre approfondimento pratico e confronto professionale",keywords:["stage cinofilo","seminario","formazione"]},
"Academy generale":{icon:"🏆",title:"Formazione cinofila concreta, professionale e moderna.",desc:"percorsi didattici, operativi e specialistici",benefit:"riunisce competenza, pratica e crescita del binomio",keywords:["K9 Napoletano Academy","cinofilia","formazione"]}
};
const toneProfiles={
"Professionale":{open:"Competenza, metodo e attenzione",adj:"professionale",cta:"Richiedi informazioni",emoji:""},
"Amichevole":{open:"Un’esperienza serena e positiva",adj:"accogliente",cta:"Scrivici, saremo felici di aiutarti",emoji:""},
"Motivazionale":{open:"Ogni traguardo comincia da un primo passo",adj:"motivante",cta:"Inizia oggi il tuo percorso",emoji:"💪"},
"Emozionale":{open:"Una relazione che cresce giorno dopo giorno",adj:"emozionale",cta:"Regala al tuo cane questa esperienza",emoji:"❤️"},
"Tecnico":{open:"Un percorso strutturato con obiettivi verificabili",adj:"tecnico",cta:"Consulta il programma tecnico",emoji:""},
"Istituzionale":{open:"Un’attività organizzata secondo criteri di qualità e responsabilità",adj:"istituzionale",cta:"Contatta la segreteria",emoji:""},
"Premium":{open:"Un servizio curato in ogni dettaglio",adj:"premium",cta:"Prenota la tua esperienza",emoji:"✨"},
"Commerciale":{open:"La soluzione concreta per le esigenze del tuo cane",adj:"commerciale",cta:"Prenota ora",emoji:""},
"Urgenza":{open:"Le disponibilità sono limitate",adj:"urgente",cta:"Blocca subito il tuo posto",emoji:"⏳"},
"Educativo":{open:"Conoscere meglio il cane significa vivere meglio insieme",adj:"educativo",cta:"Scopri come funziona",emoji:"📘"},
"Storytelling":{open:"Tutto comincia da un incontro, un odore, una scelta",adj:"narrativo",cta:"Entra nella storia",emoji:""},
"Social coinvolgente":{open:"Sai davvero cosa può fare il naso del tuo cane?",adj:"social",cta:"Commenta o scrivici in privato",emoji:"👀"},
"Ironico":{open:"Il tuo cane ha già deciso: ora manca solo il tuo sì",adj:"ironico",cta:"Fatti convincere dal tuo cane",emoji:"😄"},
"Elegante":{open:"Equilibrio, qualità e attenzione autentica",adj:"elegante",cta:"Scopri il servizio",emoji:""},
"Tattico":{open:"Precisione, controllo e lavoro di squadra",adj:"tattico",cta:"Accedi al percorso operativo",emoji:""},
"Sportivo":{open:"Allenati, migliora e supera nuovi limiti",adj:"sportivo",cta:"Mettiti alla prova",emoji:"🏆"},
"Luxury":{open:"Un’esperienza esclusiva pensata su misura",adj:"esclusivo",cta:"Richiedi un servizio personalizzato",emoji:"⭐"},
"Scientifico":{open:"Attività costruite sui principi dell’apprendimento e del comportamento",adj:"scientifico",cta:"Approfondisci il metodo",emoji:""},
"Informativo":{open:"Tutte le informazioni utili, in modo chiaro",adj:"informativo",cta:"Leggi i dettagli e contattaci",emoji:"ℹ️"},
"K9 Academy":{open:"Metodo, esperienza sul campo e rispetto del binomio",adj:"K9 Academy",cta:"Entra nella K9 Napoletano Academy",emoji:""}
};
const genericContent={
titles:["Un percorso costruito sul binomio","Esperienza, metodo e relazione","Crescere insieme, passo dopo passo","Il potenziale del cane prende forma"],
slogans:["Più competenza. Più relazione. Più benessere.","Ogni cane merita un percorso costruito bene.","Metodo, rispetto e passione in ogni attività.","Il lavoro migliore nasce dall’ascolto del binomio."],
subtitles:["Un’attività pensata per valorizzare capacità, benessere e collaborazione.","Un percorso pratico e personalizzato, costruito sulle reali esigenze del cane e del proprietario.","Esperienza concreta, attenzione individuale e obiettivi chiari."],
descriptions:["Proponiamo un percorso organizzato e progressivo, nel rispetto dei tempi del cane e degli obiettivi del proprietario. Ogni attività viene adattata al singolo binomio, con attenzione alla relazione, alla sicurezza e al benessere.","Un servizio professionale che unisce osservazione, pratica e confronto. L’obiettivo è offrire strumenti realmente utilizzabili nella vita quotidiana e costruire risultati solidi nel tempo.","L’attività viene sviluppata attraverso esercizi graduali e situazioni controllate, valorizzando le competenze naturali del cane e la comunicazione con il conduttore."],
ctas:["Contattaci per informazioni","Prenota il tuo posto","Richiedi un incontro conoscitivo","Scrivici su WhatsApp"]};
const serviceContent={
"Dogsitter":{titles:["Dogsitter professionale, cura autentica","Il tuo cane in ottime mani","Assistenza su misura per il tuo cane","Serenità per te, benessere per lui"],slogans:["Il benessere del tuo cane, anche quando tu non ci sei.","Cura, attenzione e serenità ogni giorno.","La tua tranquillità comincia dalla sua serenità.","Non solo assistenza: presenza, rispetto e competenza."],subtitles:["Passeggiate, visite a domicilio e attenzioni personalizzate nel rispetto delle abitudini del tuo cane.","Un servizio affidabile e organizzato per garantire continuità, sicurezza e benessere durante la tua assenza.","Cura quotidiana, aggiornamenti al proprietario e attività adeguate alle esigenze del singolo cane."],descriptions:["Il servizio Dogsitter è progettato per offrire al cane una gestione serena e coerente anche quando il proprietario è impegnato. Comprende passeggiate, visite a domicilio, gioco, riposo e aggiornamenti, con modalità definite durante un incontro conoscitivo.","Ogni cane viene seguito nel rispetto delle sue routine, del carattere e delle necessità individuali. Il servizio può includere uscite, somministrazione del pasto secondo indicazioni, attività olfattive leggere e comunicazioni periodiche al proprietario.","Affidabilità, osservazione e organizzazione sono alla base del servizio. Prima dell’avvio raccogliamo tutte le informazioni necessarie per predisporre una gestione personalizzata e sicura."],ctas:["Prenota un incontro conoscitivo","Verifica la disponibilità","Richiedi il servizio Dogsitter","Scrivici per organizzare l’assistenza"]},
"Mantrailing":{titles:["Segui la traccia. Scopri il tuo cane.","Il naso indica la strada","Mantrailing: relazione in movimento","Una traccia, un binomio, una scoperta"],slogans:["Ogni traccia racconta una storia.","Il naso lavora, la relazione cresce.","Fidati del cane. Segui il suo talento.","Una ricerca che unisce mente, corpo e relazione."],subtitles:["Ricerca olfattiva su traccia umana per valorizzare autonomia, collaborazione e motivazione.","Un’attività coinvolgente, adatta a diversi cani, che mette al centro il loro straordinario senso dell’olfatto.","Sessioni progressive per imparare a leggere il cane e lavorare insieme su una traccia individuale."],descriptions:["Il Mantrailing utilizza l’odore individuale di una persona per costruire una ricerca su traccia. Durante il percorso il cane impara a usare le proprie competenze naturali, mentre il conduttore sviluppa osservazione, fiducia e capacità di lettura.","Le sessioni vengono adattate al livello del binomio e alle caratteristiche del cane. L’obiettivo non è soltanto trovare il figurante, ma costruire una comunicazione più efficace attraverso un’attività altamente appagante.","Ogni esercizio viene preparato considerando ambiente, difficoltà, distanza e condizioni del binomio, con una progressione che tutela motivazione, sicurezza e qualità del lavoro."],ctas:["Prenota una prova di Mantrailing","Iscriviti alla prossima sessione","Scopri il lavoro su traccia","Vieni a provare con il tuo cane"]},
"Detection":{titles:["Trasforma il fiuto in precisione","Detection: il naso diventa metodo","Cerca. Discrimina. Segnala.","Il talento olfattivo prende forma"],slogans:["Precisione olfattiva, comunicazione chiara.","Un odore target. Infinite competenze.","Concentrazione, metodo e lavoro di squadra.","Il cane cerca, il binomio cresce."],subtitles:["Ricerca e discriminazione di odori target attraverso esercizi progressivi e segnalazioni precise.","Un’attività tecnica e coinvolgente che sviluppa concentrazione, autocontrollo e collaborazione.","Percorsi adatti a diversi livelli per costruire motivazione, metodo e chiarezza operativa."],descriptions:["La Detection insegna al cane a riconoscere uno specifico odore target e a comunicarne il ritrovamento con una segnalazione definita. Il lavoro viene costruito per fasi, curando motivazione, sistematicità di ricerca e affidabilità.","L’attività è utile per sviluppare concentrazione e precisione, ma anche per migliorare il timing e la capacità di osservazione del conduttore. Ogni esercizio viene adattato all’esperienza del binomio.","Attraverso contenitori, ambienti e scenari diversi, il cane apprende a generalizzare l’odore e a lavorare in presenza di distrazioni, mantenendo una ricerca ordinata e motivata."],ctas:["Prenota una prova Detection","Scopri il percorso olfattivo","Iscriviti alla prossima classe","Richiedi il programma Detection"]},
"Educazione cinofila":{titles:["Una relazione più chiara, ogni giorno","Educare significa comprendere","Costruiamo insieme una buona convivenza","Più comunicazione, meno incomprensioni"],slogans:["La relazione si costruisce nelle piccole cose.","Comprendere il cane cambia la vita insieme.","Regole chiare, fiducia e collaborazione.","Un percorso concreto per la quotidianità."],subtitles:["Percorsi personalizzati per migliorare comunicazione, gestione e serenità nella vita quotidiana.","Strumenti pratici per leggere il comportamento del cane e costruire abitudini sostenibili.","Un lavoro condiviso tra cane e proprietario, basato su obiettivi realistici e progressivi."],descriptions:["Il percorso educativo parte dall’osservazione del cane, del contesto familiare e delle difficoltà quotidiane. Vengono definiti obiettivi concreti e attività semplici da applicare con continuità.","Lavoriamo su comunicazione, gestione al guinzaglio, autocontrollo, richiamo e routine, adattando ogni proposta alle caratteristiche del binomio e dell’ambiente in cui vive.","L’obiettivo è aiutare il proprietario a comprendere meglio il cane e a prendere decisioni coerenti, costruendo una convivenza più equilibrata e sicura."],ctas:["Prenota una valutazione educativa","Inizia il percorso con il tuo cane","Richiedi un incontro individuale","Parlaci delle tue esigenze"]}
};

const serviceProfiles={
"Mantrailing":{
 style:"Fotografico cinematico",styleMode:"dark",tone:"Professionale",objective:"Raccogli iscrizioni",audience:"Proprietari di cani",
 section1:"Cosa svilupperai",section2:"Attività previste",section3:"Per chi è indicato",section4:"Informazioni",
 benefits:["Lettura del cane durante la traccia","Fiducia e collaborazione nel binomio","Appagamento delle capacità olfattive","Gestione progressiva delle difficoltà"],
 program:["Presentazione del metodo","Preparazione del testimone d’odore","Tracce individuali guidate","Debriefing e indicazioni finali"],
 targets:["Proprietari interessati al lavoro olfattivo","Cani di età e razze differenti","Binomi principianti o già avviati"],
 time:"Su appuntamento",seats:"Posti limitati",price:"Contattaci",phone:"WhatsApp"
},
"HRDD":{
 style:"Report operativo",styleMode:"dark",tone:"Tecnico",objective:"Presenta un corso",audience:"Professionisti cinofili",
 section1:"Competenze sviluppate",section2:"Moduli di lavoro",section3:"Destinatari",section4:"Informazioni tecniche",
 benefits:["Metodo di ricerca specialistica","Precisione e affidabilità operativa","Gestione dello scenario e sicurezza","Valutazione progressiva dell’unità cinofila"],
 program:["Fondamenti teorici e protocolli","Impostazione della ricerca","Scenari ed esercitazioni progressive","Debriefing tecnico"],
 targets:["Conduttori di unità cinofile","Operatori e volontari qualificati","Binomi con preparazione adeguata"],
 time:"Programma su calendario",seats:"Accesso su valutazione",price:"Richiedi informazioni",phone:"Contatto diretto"
},
"Detection":{
 style:"K9 intelligence",styleMode:"dark",tone:"Tecnico",objective:"Presenta un corso",audience:"Proprietari di cani",
 section1:"Cosa svilupperai",section2:"Programma",section3:"Per chi è indicato",section4:"Informazioni",
 benefits:["Discriminazione dell’odore target","Ricerca sistematica e motivata","Segnalazione precisa","Concentrazione e autocontrollo"],
 program:["Imprinting dell’odore","Costruzione della segnalazione","Ricerca su contenitori e ambienti","Generalizzazione e distrazioni"],
 targets:["Binomi principianti","Appassionati di attività olfattive","Conduttori interessati al lavoro tecnico"],
 time:"Sessioni programmate",seats:"Posti limitati",price:"Contattaci",phone:"WhatsApp"
},
"Dogsitter":{
 style:"Soft professionale",styleMode:"light",tone:"Amichevole",objective:"Promuovi servizio",audience:"Proprietari di cani",
 section1:"Cosa comprende",section2:"Come funziona",section3:"Servizio indicato per",section4:"Disponibilità e contatti",
 benefits:["Passeggiate e visite personalizzate","Rispetto delle abitudini quotidiane","Gestione attenta di pasti e riposo","Aggiornamenti al proprietario"],
 program:["Incontro conoscitivo iniziale","Raccolta delle esigenze del cane","Pianificazione di giorni e orari","Assistenza e aggiornamenti durante il servizio"],
 targets:["Proprietari impegnati per lavoro","Famiglie assenti per alcune ore","Cani che necessitano di continuità e attenzione"],
 time:"Orari concordabili",seats:"Disponibilità limitata",price:"Preventivo personalizzato",phone:"WhatsApp"
},
"Passeggiate":{
 style:"Natura organica",styleMode:"light",tone:"Amichevole",objective:"Comunica disponibilità",audience:"Proprietari di cani",
 section1:"Benefici del servizio",section2:"Organizzazione",section3:"Ideale per",section4:"Disponibilità",
 benefits:["Movimento ed esplorazione controllata","Routine regolare anche durante gli impegni","Uscite adattate al singolo cane","Gestione responsabile al guinzaglio"],
 program:["Conoscenza iniziale del cane","Definizione della durata e del percorso","Passeggiata individuale o programmata","Resoconto al proprietario"],
 targets:["Cani che restano soli alcune ore","Proprietari con impegni lavorativi","Soggetti che necessitano di uscite regolari"],
 time:"Fasce orarie concordabili",seats:"Zone limitate",price:"Tariffa su richiesta",phone:"WhatsApp"
},
"Pensione":{
 style:"Vetrina premium",styleMode:"light",tone:"Professionale",objective:"Promuovi servizio",audience:"Famiglie",
 section1:"Cura e servizi",section2:"Accoglienza",section3:"Adatta a",section4:"Disponibilità",
 benefits:["Gestione quotidiana personalizzata","Ambiente ordinato e controllato","Rispetto di routine e alimentazione","Aggiornamenti durante il soggiorno"],
 program:["Colloquio conoscitivo","Valutazione delle abitudini","Inserimento graduale quando necessario","Permanenza e monitoraggio"],
 targets:["Famiglie in viaggio","Proprietari temporaneamente assenti","Cani compatibili con il servizio offerto"],
 time:"Su prenotazione",seats:"Posti limitati",price:"Preventivo personalizzato",phone:"WhatsApp"
},
"Educazione cinofila":{
 style:"Chiaro professionale",styleMode:"light",tone:"Educativo",objective:"Presenta un corso",audience:"Proprietari di cani",
 section1:"Obiettivi del percorso",section2:"Argomenti di lavoro",section3:"Per chi è indicato",section4:"Informazioni",
 benefits:["Comunicazione più chiara","Gestione della quotidianità","Regole coerenti e sostenibili","Maggiore serenità nella relazione"],
 program:["Valutazione iniziale","Gestione al guinzaglio e richiamo","Autocontrollo e routine","Verifica dei progressi"],
 targets:["Cuccioli e cani adulti","Famiglie alla prima esperienza","Proprietari con esigenze specifiche"],
 time:"Lezioni su appuntamento",seats:"Percorsi individuali",price:"Contattaci",phone:"WhatsApp"
},
"Recupero comportamentale":{
 style:"Editoriale moderno",styleMode:"light",tone:"Professionale",objective:"Informa ed educa",audience:"Proprietari di cani",
 section1:"Obiettivi",section2:"Percorso di lavoro",section3:"Quando è indicato",section4:"Informazioni",
 benefits:["Comprendere le cause del problema","Ridurre situazioni di conflitto","Costruire strategie gestionali","Monitorare progressi realistici"],
 program:["Colloquio e raccolta anamnestica","Valutazione comportamentale","Piano personalizzato","Verifiche periodiche"],
 targets:["Cani con paure o reattività","Famiglie con difficoltà gestionali","Proprietari disponibili a un percorso continuativo"],
 time:"Solo su appuntamento",seats:"Valutazione individuale",price:"Preventivo dopo valutazione",phone:"Contatto riservato"
},
"Problem solving":{
 style:"Didattico",styleMode:"light",tone:"Educativo",objective:"Promuovi servizio",audience:"Proprietari di cani",
 section1:"Benefici",section2:"Attività",section3:"Per chi è indicato",section4:"Informazioni",
 benefits:["Autonomia e iniziativa","Flessibilità cognitiva","Gestione della frustrazione","Fiducia nelle proprie capacità"],
 program:["Esercizi semplici di scelta","Problemi graduali","Attività con oggetti e percorsi","Osservazione delle strategie"],
 targets:["Cani curiosi o insicuri","Binomi che cercano attività mentali","Proprietari interessati alla cognizione"],
 time:"Sessioni su appuntamento",seats:"Posti limitati",price:"Contattaci",phone:"WhatsApp"
},
"Giochi olfattivi":{
 style:"Natura organica",styleMode:"light",tone:"Amichevole",objective:"Promuovi servizio",audience:"Famiglie",
 section1:"Benefici",section2:"Giochi proposti",section3:"Per chi è indicato",section4:"Informazioni",
 benefits:["Appagamento olfattivo","Concentrazione e calma","Divertimento condiviso","Attività adattabile anche in casa"],
 program:["Ricerca di bocconcini","Scatole e contenitori","Percorsi olfattivi","Piccole discriminazioni"],
 targets:["Cani di ogni età","Famiglie e bambini accompagnati","Binomi alla prima esperienza"],
 time:"Attività programmate",seats:"Posti limitati",price:"Contattaci",phone:"WhatsApp"
},
"Attivazione mentale":{
 style:"Geometrico Bauhaus",styleMode:"light",tone:"Educativo",objective:"Promuovi servizio",audience:"Proprietari di cani",
 section1:"Benefici",section2:"Attività",section3:"Per chi è indicato",section4:"Informazioni",
 benefits:["Stimolazione cognitiva","Riduzione della noia","Autocontrollo e concentrazione","Maggiore sicurezza nell’affrontare novità"],
 program:["Giochi di scelta","Tappetini e puzzle","Ricerca di soluzioni","Progressioni individuali"],
 targets:["Cani giovani, adulti e anziani","Soggetti con necessità di stimolazione","Proprietari che cercano attività domestiche"],
 time:"Su appuntamento",seats:"Sessioni individuali o piccoli gruppi",price:"Contattaci",phone:"WhatsApp"
},
"Clicker training":{
 style:"Social energico",styleMode:"light",tone:"Educativo",objective:"Presenta un corso",audience:"Proprietari di cani",
 section1:"Cosa imparerai",section2:"Programma",section3:"Per chi è indicato",section4:"Informazioni",
 benefits:["Uso corretto del marker","Timing del rinforzo","Costruzione graduale dei comportamenti","Comunicazione precisa"],
 program:["Associazione click-rinforzo","Cattura e shaping","Introduzione del segnale","Generalizzazione"],
 targets:["Proprietari e appassionati","Binomi principianti","Chi desidera migliorare la precisione"],
 time:"Workshop programmati",seats:"Posti limitati",price:"Contattaci",phone:"WhatsApp"
},
"Ricerca ludica":{
 style:"Fotografico cinematico",styleMode:"light",tone:"Amichevole",objective:"Promuovi servizio",audience:"Famiglie",
 section1:"Benefici",section2:"Attività",section3:"Per chi è indicato",section4:"Informazioni",
 benefits:["Divertimento e motivazione","Uso naturale dell’olfatto","Collaborazione con il proprietario","Esperienze in ambienti diversi"],
 program:["Presentazione del gioco","Ricerca semplice","Aumento graduale della difficoltà","Premio e conclusione positiva"],
 targets:["Cani di ogni razza","Famiglie e principianti","Binomi che cercano un’attività ricreativa"],
 time:"Sessioni programmate",seats:"Posti limitati",price:"Contattaci",phone:"WhatsApp"
},
"Unità cinofile":{
 style:"Operativo",styleMode:"dark",tone:"Istituzionale",objective:"Presenta un corso",audience:"Associazioni e gruppi",
 section1:"Competenze",section2:"Addestramento",section3:"Destinatari",section4:"Informazioni operative",
 benefits:["Preparazione progressiva del binomio","Standardizzazione del lavoro","Gestione di scenari complessi","Verifica delle competenze"],
 program:["Valutazione iniziale","Fondamenti tecnici","Scenari operativi","Verifiche e mantenimento"],
 targets:["Associazioni cinofile","Volontari e operatori","Binomi con requisiti adeguati"],
 time:"Calendario dedicato",seats:"Accesso su valutazione",price:"Richiedi informazioni",phone:"Contatto diretto"
},
"Formazione istruttori":{
 style:"Corporate premium",styleMode:"light",tone:"Istituzionale",objective:"Presenta un corso",audience:"Professionisti cinofili",
 section1:"Competenze acquisite",section2:"Moduli formativi",section3:"Destinatari",section4:"Informazioni",
 benefits:["Metodo didattico strutturato","Capacità di osservazione","Progettazione delle lezioni","Gestione professionale del cliente"],
 program:["Fondamenti teorici","Pratica guidata","Tirocinio e casi studio","Valutazione finale"],
 targets:["Educatori e istruttori","Operatori cinofili","Professionisti in aggiornamento"],
 time:"Calendario formativo",seats:"Numero chiuso",price:"Richiedi programma e quota",phone:"Segreteria"
},
"Stage e seminari":{
 style:"Evento workshop",styleMode:"dark",tone:"Professionale",objective:"Annuncia evento",audience:"Pubblico locale",
 section1:"Cosa approfondirai",section2:"Programma dell’evento",section3:"A chi è rivolto",section4:"Data e iscrizioni",
 benefits:["Approfondimento teorico","Dimostrazioni pratiche","Confronto con i docenti","Strumenti applicabili"],
 program:["Accoglienza","Sessione teorica","Dimostrazione ed esercitazioni","Domande e conclusioni"],
 targets:["Proprietari e appassionati","Professionisti cinofili","Associazioni e gruppi"],
 time:"Orario da programma",seats:"Posti limitati",price:"Quota indicata nell’evento",phone:"Iscrizioni WhatsApp"
},
"Academy generale":{
 style:"Corporate premium",styleMode:"dark",tone:"K9 Academy",objective:"Promuovi servizio",audience:"Pubblico locale",
 section1:"Aree di attività",section2:"Cosa offriamo",section3:"A chi ci rivolgiamo",section4:"Contatti",
 benefits:["Formazione cinofila","Discipline olfattive","Servizi per proprietari","Percorsi professionali"],
 program:["Valutazioni e consulenze","Corsi e attività pratiche","Stage e seminari","Progetti specialistici"],
 targets:["Proprietari di cani","Appassionati","Professionisti e associazioni"],
 time:"Attività su calendario",seats:"Informazioni aggiornate",price:"Contattaci",phone:"WhatsApp"
}
};

const professionalContentDetails={
 "Mantrailing":{
  method:"Lavoro individuale e progressivo su traccia olfattiva umana, con difficoltà calibrate sul livello del binomio. Il conduttore viene guidato nella lettura del cane, nella gestione della longhina e nella corretta interpretazione dei cambiamenti comportamentali.",
  included:["Valutazione iniziale del binomio e definizione degli obiettivi","Preparazione del testimone d’odore e impostazione tecnica della partenza","Tracce personalizzate in ambienti differenti con difficoltà progressive","Debriefing finale con indicazioni pratiche per il lavoro successivo"],
  requirements:["Pettorina ad H o specifica da ricerca, comoda e ben regolata","Longhina da 5–10 metri e guanti adatti alla conduzione","Premio alimentare o gioco di forte valore per il cane","Acqua, ciotola e abbigliamento adeguato all’ambiente"],
  notes:"L’attività viene adattata a età, esperienza e condizioni del cane. Le sessioni possono svolgersi in ambiente urbano, rurale o boschivo; il punto di incontro viene comunicato prima dell’attività."
 },
 "HRDD":{
  method:"Percorso tecnico specialistico basato su protocolli progressivi di imprinting, ricerca, discriminazione e segnalazione. Ogni fase viene documentata e verificata con scenari controllati, criteri di sicurezza e valutazioni periodiche.",
  included:["Valutazione motivazionale e attitudinale dell’unità cinofila","Impostazione dell’odore target e consolidamento della segnalazione","Scenari di ricerca con complessità e contaminazioni crescenti","Analisi video, schede di lavoro e verifica dei progressi"],
  requirements:["Binomio con prerequisiti tecnici e motivazionali adeguati","Equipaggiamento operativo e dispositivi di protezione richiesti","Disponibilità a un percorso continuativo e a verifiche periodiche","Rispetto rigoroso dei protocolli di sicurezza e riservatezza"],
  notes:"Percorso specialistico con accesso subordinato a valutazione. Contenuti, scenari e livelli di difficoltà vengono definiti in funzione degli obiettivi formativi e operativi."
 },
 "Detection":{
  method:"Impostazione graduale della discriminazione olfattiva, dalla motivazione alla ricerca sistematica fino alla segnalazione finale. Il lavoro valorizza precisione, autonomia, autocontrollo e chiarezza del conduttore.",
  included:["Selezione e preparazione dell’odore target","Esercizi di discriminazione con distrattori controllati","Ricerca su contenitori, ambienti e superfici differenti","Costruzione e consolidamento della segnalazione"],
  requirements:["Premi di alto valore e contenitore personale per il cane","Pettorina o collare comodo e guinzaglio adeguato","Cane in buone condizioni generali e motivato al lavoro","Disponibilità a ripetere esercizi brevi anche a casa"],
  notes:"Le sostanze utilizzate sono selezionate in funzione del progetto e gestite in sicurezza. Il percorso è adattabile a finalità ludiche, sportive o formative."
 },
 "Dogsitter":{
  method:"Servizio organizzato dopo un incontro conoscitivo e una raccolta dettagliata delle abitudini del cane o del gatto. Le attività vengono pianificate rispettando routine, indicazioni del proprietario, sicurezza e benessere dell’animale.",
  included:["Incontro conoscitivo e scheda informativa dell’animale","Passeggiate, compagnia e cura a domicilio secondo accordi","Gestione di acqua, pasti e attenzioni quotidiane","Aggiornamenti e fotografie durante il servizio"],
  requirements:["Indicazioni chiare su routine, alimentazione e gestione","Guinzaglio, pettorina e materiali abitualmente utilizzati","Contatti veterinari e recapito di emergenza","Consegna delle chiavi o modalità di accesso concordata"],
  notes:"Disponibile a San Giuliano Milanese e zone limitrofe, previa verifica di giorni, orari e distanza. Eventuali terapie vengono gestite solo secondo indicazioni scritte e nei limiti concordati."
 },
 "Passeggiate":{
  method:"Uscite individuali pianificate in base a età, condizione fisica, temperamento e abitudini del cane. Percorsi, durata e intensità vengono modulati per favorire movimento, esplorazione e serenità.",
  included:["Incontro preliminare e prova di gestione al guinzaglio","Passeggiata individuale nella fascia oraria concordata","Acqua, pause e gestione responsabile delle interazioni","Resoconto sintetico e aggiornamento al proprietario"],
  requirements:["Pettorina o collare sicuro e correttamente regolato","Guinzaglio integro e materiali abituali del cane","Informazioni su salute, paure, reattività e abitudini","Recapito disponibile per eventuali comunicazioni urgenti"],
  notes:"Le uscite possono essere modificate o rinviate in caso di condizioni meteorologiche non sicure. Durata e percorso sono sempre adeguati al singolo cane."
 },
 "Pensione":{
  method:"Accoglienza programmata con valutazione preventiva, raccolta delle routine e inserimento graduale quando necessario. La gestione quotidiana rispetta alimentazione, riposo, attività e caratteristiche individuali.",
  included:["Colloquio conoscitivo e valutazione di compatibilità","Gestione quotidiana di pasti, acqua, riposo e uscite","Attività adeguate alle esigenze del cane","Aggiornamenti periodici al proprietario durante il soggiorno"],
  requirements:["Libretto sanitario e profilassi richieste in regola","Alimentazione abituale già porzionata e indicazioni scritte","Eventuali farmaci con prescrizione e istruzioni chiare","Contatti del veterinario curante e recapito di emergenza"],
  notes:"La disponibilità è limitata e subordinata a valutazione. Non vengono accettati soggetti incompatibili con le condizioni organizzative o con necessità non gestibili in sicurezza."
 },
 "Educazione cinofila":{
  method:"Percorso individuale fondato su osservazione, comunicazione coerente e apprendimento graduale. Gli esercizi vengono inseriti nella vita quotidiana per costruire competenze stabili e realmente utilizzabili dalla famiglia.",
  included:["Valutazione iniziale del cane e del contesto familiare","Definizione di obiettivi concreti e piano di lavoro personalizzato","Lezioni pratiche su gestione, comunicazione e autocontrollo","Verifica dei progressi e indicazioni per il lavoro domestico"],
  requirements:["Partecipazione attiva delle persone che gestiscono il cane","Premi, guinzaglio e attrezzatura abitualmente utilizzata","Disponibilità a svolgere brevi esercizi tra una lezione e l’altra","Informazioni complete su salute e precedenti esperienze"],
  notes:"Il percorso educativo non sostituisce una valutazione veterinaria o comportamentale quando necessaria. Tempi e frequenza dipendono dagli obiettivi e dalla continuità del lavoro."
 },
 "Recupero comportamentale":{
  method:"Intervento personalizzato preceduto da raccolta anamnestica e valutazione del comportamento. Il piano integra gestione ambientale, prevenzione, lavoro sulle emozioni e progressioni compatibili con la sicurezza del binomio.",
  included:["Colloquio anamnestico approfondito e osservazione del cane","Individuazione dei fattori scatenanti e delle priorità di sicurezza","Piano gestionale e comportamentale personalizzato","Monitoraggio periodico e adeguamento delle strategie"],
  requirements:["Disponibilità dell’intero nucleo familiare a seguire indicazioni coerenti","Documentazione veterinaria utile e informazioni complete","Uso di dispositivi di sicurezza eventualmente indicati","Impegno costante tra gli incontri e registrazione dei progressi"],
  notes:"In presenza di dolore, patologie o problematiche cliniche può essere richiesto il coinvolgimento del veterinario curante o di un medico veterinario esperto in comportamento."
 },
 "Problem solving":{
  method:"Attività cognitive progressive in cui il cane viene accompagnato a esplorare, scegliere e trovare soluzioni senza forzature. Il conduttore impara a osservare strategie, segnali di difficoltà e modalità di supporto corrette.",
  included:["Valutazione del livello di autonomia e motivazione","Esercizi con oggetti, percorsi e problemi di difficoltà crescente","Indicazioni sulla gestione della frustrazione e delle pause","Proposte replicabili in sicurezza anche a casa"],
  requirements:["Premi alimentari di piccolo formato e forte valore","Pettorina o collare comodo e acqua","Disponibilità a rispettare tempi e scelte del cane","Assenza di forzature o correzioni durante l’attività"],
  notes:"Gli esercizi vengono selezionati in base a età, esperienza e stato emotivo. L’obiettivo non è la velocità, ma la qualità del processo e la crescita dell’autonomia."
 },
 "Giochi olfattivi":{
  method:"Percorso ludico che utilizza ricerca, discriminazione e problem solving olfattivo. Gli esercizi sono brevi, motivanti e adattati al singolo cane per favorire concentrazione, appagamento e calma.",
  included:["Giochi di ricerca con bocconcini, oggetti e contenitori","Progressioni olfattive in ambienti differenti","Indicazioni per creare attività sicure in casa","Osservazione del comportamento e gestione delle pause"],
  requirements:["Premi morbidi e appetibili in quantità adeguata","Acqua e attrezzatura comoda per il cane","Segnalazione preventiva di allergie o restrizioni alimentari","Disponibilità a lasciare al cane tempo e libertà di scelta"],
  notes:"Adatto a cani di diverse età e livelli, con esercizi modificati in funzione delle capacità individuali. Le attività alimentari vengono adattate alle esigenze del soggetto."
 },
 "Attivazione mentale":{
  method:"Esercizi cognitivi calibrati per stimolare attenzione, iniziativa e flessibilità senza creare eccessiva frustrazione. Il proprietario apprende come proporre problemi, graduare la difficoltà e riconoscere quando aiutare.",
  included:["Valutazione delle competenze cognitive e motivazionali","Puzzle, tappetini, oggetti e attività di scelta","Progressioni individuali con pause e rinforzi adeguati","Schemi di gioco replicabili nella quotidianità"],
  requirements:["Premi alimentari idonei e piccoli giochi graditi","Ambiente tranquillo e materiale indicato per la sessione","Rispetto dei tempi individuali e delle pause","Segnalazione di eventuali limitazioni fisiche o alimentari"],
  notes:"Le attività non devono sostituire movimento, esplorazione e relazione. Vengono integrate in una routine equilibrata e adeguata alle condizioni del cane."
 },
 "Clicker training":{
  method:"Apprendimento tramite marker preciso e rinforzo positivo, con esercizi progressivi di cattura, targeting e shaping. Il conduttore sviluppa timing, chiarezza e capacità di suddividere un comportamento in piccoli passaggi.",
  included:["Associazione corretta tra click e rinforzo","Esercizi di cattura, targeting e shaping","Introduzione del segnale e generalizzazione","Correzione del timing e analisi degli errori più comuni"],
  requirements:["Clicker o marker concordato con il docente","Premi piccoli, morbidi e di alto valore","Disponibilità a svolgere sessioni brevi e frequenti","Ambiente inizialmente tranquillo e privo di eccessive distrazioni"],
  notes:"Il clicker non è un richiamo né uno strumento correttivo. Viene utilizzato per indicare con precisione il comportamento che sarà rinforzato."
 },
 "Ricerca ludica":{
  method:"Ricerca motivazionale costruita come gioco collaborativo. Le difficoltà aumentano gradualmente attraverso nascondigli, distanze e ambienti differenti, mantenendo alta la motivazione e una conclusione positiva.",
  included:["Presentazione del gioco e valutazione della motivazione","Ricerche semplici con progressione personalizzata","Esperienze in ambienti interni ed esterni","Indicazioni per riproporre attività in sicurezza"],
  requirements:["Gioco o premio particolarmente gradito al cane","Pettorina, guinzaglio e acqua","Abbigliamento adeguato all’ambiente di lavoro","Disponibilità a rispettare turni, pause e indicazioni"],
  notes:"Attività ricreativa e non operativa, adatta anche a principianti. Ogni ricerca viene adattata per evitare frustrazione e mantenere il cane motivato."
 },
 "Unità cinofile":{
  method:"Programma tecnico progressivo con pianificazione, addestramento, scenari e verifiche. Il lavoro comprende competenze del cane, capacità del conduttore, sicurezza, documentazione e mantenimento operativo.",
  included:["Valutazione iniziale di requisiti e attitudini del binomio","Piano addestrativo con obiettivi e criteri verificabili","Scenari realistici con difficoltà progressive","Debriefing, schede di lavoro e verifiche periodiche"],
  requirements:["Appartenenza o collaborazione con struttura idonea quando richiesta","Equipaggiamento tecnico e dispositivi di protezione","Disponibilità a formazione continuativa e mantenimento","Idoneità sanitaria e comportamentale del cane"],
  notes:"L’accesso e il programma dipendono dalla specialità, dagli standard dell’organizzazione e dalla valutazione iniziale. La formazione non attribuisce automaticamente qualifiche operative."
 },
 "Formazione istruttori":{
  method:"Percorso teorico-pratico basato su osservazione, progettazione didattica, conduzione delle lezioni e analisi dei casi. Le competenze vengono sviluppate attraverso esercitazioni, tutoraggio e verifiche.",
  included:["Materiale didattico e riferimenti bibliografici","Lezioni teoriche, dimostrazioni ed esercitazioni pratiche","Analisi di casi e progettazione di sessioni formative","Feedback individuale e valutazione finale prevista dal percorso"],
  requirements:["Prerequisiti formativi indicati nel programma","Partecipazione alle ore teoriche e pratiche richieste","Disponibilità a studio, tirocinio e produzione degli elaborati","Rispetto del codice etico e delle norme di sicurezza"],
  notes:"Programma, monte ore, modalità di valutazione e attestazione sono specificati nella scheda del corso. Eventuali assenze vengono gestite secondo il regolamento."
 },
 "Stage e seminari":{
  method:"Evento formativo concentrato su un tema specifico, con alternanza di inquadramento teorico, dimostrazioni, esercitazioni e confronto con i docenti. Il programma è calibrato sul livello dei partecipanti.",
  included:["Materiale informativo o didattico previsto dall’evento","Sessioni teoriche e dimostrazioni pratiche","Spazio per domande, confronto e analisi di casi","Attestato di partecipazione quando previsto"],
  requirements:["Iscrizione confermata entro la data indicata","Materiale personale specificato nella convocazione","Rispetto degli orari e delle regole della struttura ospitante","Documentazione del cane in regola se partecipa alle attività"],
  notes:"Posti limitati. Programma, sede e orari possono subire adeguamenti organizzativi comunicati agli iscritti. La partecipazione del cane deve essere espressamente prevista."
 },
 "Academy generale":{
  method:"Progetti formativi e servizi costruiti con metodo, esperienza sul campo e attenzione al benessere. Ogni proposta viene definita in base a obiettivi, livello dei partecipanti e caratteristiche dei binomi coinvolti.",
  included:["Colloquio informativo e orientamento verso il percorso più adatto","Attività pratiche, formazione teorica e supporto professionale","Programmi personalizzati per privati, gruppi e associazioni","Aggiornamenti sulle iniziative e sui calendari disponibili"],
  requirements:["Contatto preliminare per definire esigenze e obiettivi","Documentazione del cane in regola per le attività pratiche","Attrezzatura indicata per la disciplina selezionata","Rispetto delle regole organizzative e di sicurezza"],
  notes:"Le attività sono proposte su calendario o appuntamento. Sedi, disponibilità, costi e requisiti specifici vengono comunicati per ogni progetto."
 }
};
function expandProfileLine(line,kind,service){
 const clean=String(line||"").trim().replace(/[.;]+$/,'');
 if(!clean)return "";
 const suffix={benefit:" con un lavoro progressivo, concreto e adattato alle caratteristiche del singolo binomio.",program:" con spiegazione pratica, applicazione guidata e verifica della corretta esecuzione.",target:" che desiderano un percorso strutturato, rispettoso e coerente con obiettivi realistici."}[kind]||".";
 return clean.length>78?clean+(clean.endsWith('.')?'':'.'):clean+suffix;
}
Object.entries(serviceProfiles).forEach(([service,p])=>{
 const extra=professionalContentDetails[service]||professionalContentDetails["Academy generale"];
 p.benefits=(p.benefits||[]).map(v=>expandProfileLine(v,"benefit",service));
 p.program=(p.program||[]).map(v=>expandProfileLine(v,"program",service));
 p.targets=(p.targets||[]).map(v=>expandProfileLine(v,"target",service));
 p.method=extra.method;p.included=extra.included;p.requirements=extra.requirements;p.notes=extra.notes;
});
function generatedFieldValues(service,key){
 const p=serviceProfile(service), values={
  benefits:p.benefits||[],program:p.program||[],targets:p.targets||[],
  method:[p.method||""],included:p.included||[],requirements:p.requirements||[],notes:[p.notes||""]
 };
 return values[key]||[];
}

function serviceProfile(service){return serviceProfiles[service]||serviceProfiles["Academy generale"]}
function serviceLabels(service){
 const p=serviceProfile(service);
 return [p.section1,p.section2,p.section3,p.section4];
}
function poolFor(service,key){return (serviceContent[service]?.[key]||genericContent[key]).slice()}
function randomItem(arr,avoid=""){const choices=arr.filter(x=>x!==avoid);return (choices.length?choices:arr)[Math.floor(Math.random()*(choices.length?choices.length:arr.length))]}
function toneBlend(text,t1,t2,mix){const a=toneProfiles[t1]||toneProfiles.Professionale;if(!text)return text;let prefix=a.open; if(t2&&t2!=="Nessuno"){const b=toneProfiles[t2]||a;prefix=mix>=70?a.open:`${a.open}. ${b.open}`;}return `${prefix}. ${text}`}
const styles={
"Premium tattico":{bg1:"#10151c",bg2:"#27313d",accent:"#ff7a00",gold:"#d8ab4d",light:false,layout:"tactical"},
"Operativo":{bg1:"#101713",bg2:"#334035",accent:"#d49b35",gold:"#f0c675",light:false,layout:"operational"},
"Chiaro professionale":{bg1:"#f2efe8",bg2:"#aeb7bf",accent:"#e56b00",gold:"#9a6d22",light:true,layout:"corporate"},
"Didattico":{bg1:"#102233",bg2:"#31566f",accent:"#ff9a2e",gold:"#ffd07d",light:false,layout:"educational"},
"Editoriale moderno":{bg1:"#161616",bg2:"#404040",accent:"#ff6b35",gold:"#f0d7b0",light:false,layout:"editorial"},
"Minimal elegante":{bg1:"#f5f2ec",bg2:"#d9d4ca",accent:"#1f2933",gold:"#9b7a45",light:true,layout:"minimal"},
"Sportivo dinamico":{bg1:"#071c2c",bg2:"#164f70",accent:"#ff7a00",gold:"#9edcff",light:false,layout:"sport"},
"Social energico":{bg1:"#31124d",bg2:"#7b235d",accent:"#ffb000",gold:"#ffd166",light:false,layout:"social"},
"Luxury nero oro":{bg1:"#050505",bg2:"#211a0f",accent:"#c99a3d",gold:"#f2d28b",light:false,layout:"luxury"},
"Natura organica":{bg1:"#13251b",bg2:"#53705a",accent:"#d98a3d",gold:"#d9c79e",light:false,layout:"organic"},
"Tecnico industriale":{bg1:"#121820",bg2:"#34414d",accent:"#ff6a00",gold:"#aab9c6",light:false,layout:"industrial"},
"Fotografico cinematico":{bg1:"#080a0d",bg2:"#1e252d",accent:"#ff7a00",gold:"#e7c78f",light:false,layout:"cinematic"},
"Split editoriale sinistra":{bg1:"#11151b",bg2:"#3d4854",accent:"#ff7a00",gold:"#d8b26e",light:false,layout:"splitLeft"},
"Split editoriale destra":{bg1:"#11151b",bg2:"#3d4854",accent:"#ff8a1f",gold:"#e4c18b",light:false,layout:"splitRight"},
"Banner superiore":{bg1:"#17212b",bg2:"#54606b",accent:"#ff7a00",gold:"#f2c879",light:false,layout:"topBanner"},
"Card inferiore":{bg1:"#18202a",bg2:"#47515c",accent:"#ff7a00",gold:"#e5bd72",light:false,layout:"bottomCard"},
"Poster centrale":{bg1:"#101219",bg2:"#363b46",accent:"#ff6f00",gold:"#f0c36e",light:false,layout:"centerPoster"},
"Foto incorniciata":{bg1:"#ede8df",bg2:"#bfc5ca",accent:"#e66300",gold:"#8d6d3d",light:true,layout:"framedPhoto"},
"Cover magazine":{bg1:"#171717",bg2:"#575757",accent:"#ff4f21",gold:"#f5d5a7",light:false,layout:"magazine"},
"Taglio diagonale":{bg1:"#071b26",bg2:"#315e74",accent:"#ff7a00",gold:"#a8d9ed",light:false,layout:"diagonalCut"},
"Card sovrapposte":{bg1:"#171c23",bg2:"#44505e",accent:"#ff8b22",gold:"#e1bd82",light:false,layout:"stackedCards"},
"Focus angolare":{bg1:"#151a20",bg2:"#3e4853",accent:"#ff7200",gold:"#deb36f",light:false,layout:"cornerFocus"},
"Nastro evento":{bg1:"#151a21",bg2:"#4c5660",accent:"#e96f00",gold:"#f4c777",light:false,layout:"ribbonEvent"},
"Fascia verticale":{bg1:"#101820",bg2:"#41515e",accent:"#ff7a00",gold:"#c3d5df",light:false,layout:"verticalStrip"},
"Finestra fotografica":{bg1:"#f1eee7",bg2:"#b6bec4",accent:"#df6500",gold:"#937047",light:true,layout:"photoWindow"},
"Griglia asimmetrica":{bg1:"#111820",bg2:"#334957",accent:"#ff7b00",gold:"#b8d2df",light:false,layout:"asymGrid"},
"Biglietto evento":{bg1:"#171b21",bg2:"#4b555f",accent:"#f07a00",gold:"#e9c27d",light:false,layout:"eventTicket"},
"Spotlight":{bg1:"#080b10",bg2:"#303844",accent:"#ff7b00",gold:"#f2ce91",light:false,layout:"spotlight"},
"Monocromatico forte":{bg1:"#090909",bg2:"#3a3a3a",accent:"#ffffff",gold:"#bdbdbd",light:false,layout:"monochrome"},
"Neon tecnologico":{bg1:"#071019",bg2:"#162f45",accent:"#00e5ff",gold:"#ff4fd8",light:false,layout:"neonTech"},
"Soft professionale":{bg1:"#e8edf0",bg2:"#c8d3da",accent:"#d96500",gold:"#7a8790",light:true,layout:"softProfessional"},
"Blueprint K9":{bg1:"#092236",bg2:"#164c6b",accent:"#37b9ff",gold:"#9edbff",light:false,layout:"blueprint"},
"Urban poster":{bg1:"#1a1513",bg2:"#59463d",accent:"#ff5a1f",gold:"#f0c08b",light:false,layout:"urbanPoster"},
"Emblema retrò":{bg1:"#252018",bg2:"#665943",accent:"#c98734",gold:"#ead5a8",light:false,layout:"retroBadge"},
"Corporate premium":{bg1:"#e9ecef",bg2:"#adb7c0",accent:"#ba5b00",gold:"#6f7780",light:true,layout:"corporatePremium"}
,"Collage fotografico":{bg1:"#10151b",bg2:"#35404b",accent:"#ff7a00",gold:"#f0c879",light:false,layout:"photoCollage"}
,"Polaroid dinamico":{bg1:"#e9e2d7",bg2:"#a8b1b8",accent:"#df6500",gold:"#8a6840",light:true,layout:"polaroid"}
,"Mosaico K9":{bg1:"#0d141c",bg2:"#2b4050",accent:"#ff7b00",gold:"#b7d0dc",light:false,layout:"mosaic"}
,"Tipografia gigante":{bg1:"#0a0a0a",bg2:"#353535",accent:"#ff5c00",gold:"#efc27d",light:false,layout:"bigType"}
,"Cerchi concentrici":{bg1:"#101722",bg2:"#35475e",accent:"#ff7a00",gold:"#e3be7b",light:false,layout:"rings"}
,"Onde organiche":{bg1:"#14251e",bg2:"#547064",accent:"#e98235",gold:"#d9c49b",light:false,layout:"waves"}
,"Doppia esposizione":{bg1:"#0d1117",bg2:"#394553",accent:"#ff7a00",gold:"#e3bf80",light:false,layout:"doubleExposure"}
,"Cornice spezzata":{bg1:"#11161d",bg2:"#48525d",accent:"#ff6f00",gold:"#e9c17e",light:false,layout:"brokenFrame"}
,"Scheda tecnica":{bg1:"#111a22",bg2:"#334957",accent:"#ff7b00",gold:"#b6d2df",light:false,layout:"dataSheet"}
,"Timeline evento":{bg1:"#171b22",bg2:"#4b5661",accent:"#f07800",gold:"#edc780",light:false,layout:"timeline"}
,"Esagoni tattici":{bg1:"#0d1712",bg2:"#35463b",accent:"#d99a38",gold:"#ecd18d",light:false,layout:"hexTactical"}
,"Vetrina premium":{bg1:"#ede9e1",bg2:"#b8c0c6",accent:"#ca6100",gold:"#816b4c",light:true,layout:"showcase"}
,"Editoriale verticale":{bg1:"#151515",bg2:"#494949",accent:"#ff5424",gold:"#f0d1a5",light:false,layout:"verticalEditorial"}
,"Pannelli modulari":{bg1:"#101820",bg2:"#3b4b58",accent:"#ff7a00",gold:"#bdd5df",light:false,layout:"modules"}
,"Foto a tutta pagina":{bg1:"#080b0f",bg2:"#28313b",accent:"#ff7a00",gold:"#eac98e",light:false,layout:"fullBleed"}
,"Strisce cinematografiche":{bg1:"#080808",bg2:"#303030",accent:"#e66d00",gold:"#e5c28b",light:false,layout:"filmStrips"}
,"Cartello segnaletico":{bg1:"#15191d",bg2:"#48525a",accent:"#ff8a00",gold:"#f5d27e",light:false,layout:"signage"}
,"Geometrico Bauhaus":{bg1:"#eee9df",bg2:"#b9c0c5",accent:"#e64b24",gold:"#1d5f86",light:true,layout:"bauhaus"}
,"Carta strappata":{bg1:"#d9d2c6",bg2:"#8f989e",accent:"#db5f00",gold:"#745f42",light:true,layout:"tornPaper"}
,"Gradient mesh":{bg1:"#1b1231",bg2:"#4e285f",accent:"#ff8b23",gold:"#ffd083",light:false,layout:"mesh"}
,"Focus circolare":{bg1:"#0c1118",bg2:"#364453",accent:"#ff7900",gold:"#e7c486",light:false,layout:"circleFocus"}
,"Minimal nordico":{bg1:"#f3f1ec",bg2:"#ccd3d7",accent:"#263746",gold:"#a88758",light:true,layout:"nordic"}
,"Poster festival":{bg1:"#25112e",bg2:"#8b2856",accent:"#ffb400",gold:"#ffe09a",light:false,layout:"festival"}
,"Luxury marmo":{bg1:"#ede9e2",bg2:"#bab2a7",accent:"#9b742d",gold:"#4a4034",light:true,layout:"marble"}
,"Cyber grid":{bg1:"#050c16",bg2:"#102c48",accent:"#00d9ff",gold:"#ff45ce",light:false,layout:"cyberGrid"},"Glassmorphism premium":{bg1:"#11161d",bg2:"#374451",accent:"#ff7a00",gold:"#e9c27c",light:false,layout:"tactical"},"Swiss grid":{bg1:"#f3f1eb",bg2:"#cbd3d8",accent:"#d96500",gold:"#806847",light:true,layout:"corporatePremium"},"Brutalismo editoriale":{bg1:"#08101a",bg2:"#20364b",accent:"#00d9ff",gold:"#ff55c8",light:false,layout:"editorial"},"Architettura moderna":{bg1:"#21161a",bg2:"#6b3746",accent:"#ffad32",gold:"#ffe09a",light:false,layout:"minimal"},"Dark academy":{bg1:"#102018",bg2:"#4a6b57",accent:"#e47c31",gold:"#ddcea5",light:false,layout:"operational"},"White academy":{bg1:"#11161d",bg2:"#374451",accent:"#ff7a00",gold:"#e9c27c",light:false,layout:"dataSheet"},"Tattico sabbia":{bg1:"#f3f1eb",bg2:"#cbd3d8",accent:"#d96500",gold:"#806847",light:true,layout:"magazine"},"Tattico urbano":{bg1:"#08101a",bg2:"#20364b",accent:"#00d9ff",gold:"#ff55c8",light:false,layout:"verticalEditorial"},"K9 intelligence":{bg1:"#21161a",bg2:"#6b3746",accent:"#ffad32",gold:"#ffe09a",light:false,layout:"splitLeft"},"Report operativo":{bg1:"#102018",bg2:"#4a6b57",accent:"#e47c31",gold:"#ddcea5",light:false,layout:"splitRight"},"Manifesto fotografico":{bg1:"#11161d",bg2:"#374451",accent:"#ff7a00",gold:"#e9c27c",light:false,layout:"topBanner"},"Poster tipografico verticale":{bg1:"#f3f1eb",bg2:"#cbd3d8",accent:"#d96500",gold:"#806847",light:true,layout:"bottomCard"},"Poster tipografico orizzontale":{bg1:"#08101a",bg2:"#20364b",accent:"#00d9ff",gold:"#ff55c8",light:false,layout:"centerPoster"},"Editoriale a colonne":{bg1:"#21161a",bg2:"#6b3746",accent:"#ffad32",gold:"#ffe09a",light:false,layout:"photoWindow"},"Editoriale fascia laterale":{bg1:"#102018",bg2:"#4a6b57",accent:"#e47c31",gold:"#ddcea5",light:false,layout:"fullBleed"},"Cover documentario":{bg1:"#11161d",bg2:"#374451",accent:"#ff7a00",gold:"#e9c27c",light:false,layout:"filmStrips"},"Cover reportage":{bg1:"#f3f1eb",bg2:"#cbd3d8",accent:"#d96500",gold:"#806847",light:true,layout:"timeline"},"Evento countdown":{bg1:"#08101a",bg2:"#20364b",accent:"#00d9ff",gold:"#ff55c8",light:false,layout:"eventTicket"},"Evento open day":{bg1:"#21161a",bg2:"#6b3746",accent:"#ffad32",gold:"#ffe09a",light:false,layout:"ribbonEvent"},"Evento masterclass":{bg1:"#102018",bg2:"#4a6b57",accent:"#e47c31",gold:"#ddcea5",light:false,layout:"festival"},"Evento workshop":{bg1:"#11161d",bg2:"#374451",accent:"#ff7a00",gold:"#e9c27c",light:false,layout:"educational"},"Evento seminario":{bg1:"#f3f1eb",bg2:"#cbd3d8",accent:"#d96500",gold:"#806847",light:true,layout:"blueprint"},"Promo servizio premium":{bg1:"#08101a",bg2:"#20364b",accent:"#00d9ff",gold:"#ff55c8",light:false,layout:"showcase"},"Promo servizio essenziale":{bg1:"#21161a",bg2:"#6b3746",accent:"#ffad32",gold:"#ffe09a",light:false,layout:"softProfessional"},"Promo iscrizioni":{bg1:"#102018",bg2:"#4a6b57",accent:"#e47c31",gold:"#ddcea5",light:false,layout:"social"},"Promo disponibilità":{bg1:"#11161d",bg2:"#374451",accent:"#ff7a00",gold:"#e9c27c",light:false,layout:"bigType"},"Social carousel cover":{bg1:"#f3f1eb",bg2:"#cbd3d8",accent:"#d96500",gold:"#806847",light:true,layout:"mesh"},"Social quote card":{bg1:"#08101a",bg2:"#20364b",accent:"#00d9ff",gold:"#ff55c8",light:false,layout:"neonTech"},"Social announcement":{bg1:"#21161a",bg2:"#6b3746",accent:"#ffad32",gold:"#ffe09a",light:false,layout:"doubleExposure"},"Social launch":{bg1:"#102018",bg2:"#4a6b57",accent:"#e47c31",gold:"#ddcea5",light:false,layout:"monochrome"},"Fotografia duotone":{bg1:"#11161d",bg2:"#374451",accent:"#ff7a00",gold:"#e9c27c",light:false,layout:"cinematic"},"Fotografia high contrast":{bg1:"#f3f1eb",bg2:"#cbd3d8",accent:"#d96500",gold:"#806847",light:true,layout:"spotlight"},"Fotografia soft light":{bg1:"#08101a",bg2:"#20364b",accent:"#00d9ff",gold:"#ff55c8",light:false,layout:"diagonalCut"},"Fotografia noir":{bg1:"#21161a",bg2:"#6b3746",accent:"#ffad32",gold:"#ffe09a",light:false,layout:"modules"},"Geometrico diagonale":{bg1:"#102018",bg2:"#4a6b57",accent:"#e47c31",gold:"#ddcea5",light:false,layout:"rings"},"Geometrico modulare":{bg1:"#11161d",bg2:"#374451",accent:"#ff7a00",gold:"#e9c27c",light:false,layout:"brokenFrame"},"Geometrico cerchi":{bg1:"#f3f1eb",bg2:"#cbd3d8",accent:"#d96500",gold:"#806847",light:true,layout:"waves"},"Geometrico lineare":{bg1:"#08101a",bg2:"#20364b",accent:"#00d9ff",gold:"#ff55c8",light:false,layout:"nordic"},"Nature editorial":{bg1:"#21161a",bg2:"#6b3746",accent:"#ffad32",gold:"#ffe09a",light:false,layout:"organic"},"Clinical professional":{bg1:"#102018",bg2:"#4a6b57",accent:"#e47c31",gold:"#ddcea5",light:false,layout:"corporate"}

};

function styleWithMode(base,mode){
  if(!base)return base;
  if(mode==="light")return {...base,bg1:"#f4f1ea",bg2:"#c7d0d6",light:true};
  if(mode==="dark")return {...base,bg1:"#080c12",bg2:"#26313d",light:false};
  return {...base};
}

function notify(t,e=false){$("status").textContent=t;$("status").style.color=e?"var(--danger)":"var(--ok)";clearTimeout(notify.t);notify.t=setTimeout(()=>$("status").textContent="",2800)}
function safeName(v){return(v||"progetto-k9").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"")}
function dateText(v){return v?new Date(v+"T12:00:00").toLocaleDateString("it-IT",{day:"2-digit",month:"long",year:"numeric"}):"Data da definire"}

function cleanPhone(value){return String(value||"").replace(/[^\d+]/g,"").replace(/^\+?/,"")}
function ensureUrl(value){
 const v=String(value||"").trim();
 if(!v)return "";
 if(/^(https?:|mailto:|tel:)/i.test(v))return v;
 return "https://"+v.replace(/^\/+/,"");
}
function resolveCtaUrl(d=projectData(false)){
 const type=d.ctaType||"none",raw=String(d.ctaValue||"").trim();
 if(type==="none")return "";
 if(type==="whatsapp"){
  const phone=cleanPhone(raw||d.eventPhone);
  if(!phone)return "";
  const msg=String(d.ctaMessage||`Ciao, vorrei informazioni su ${d.project||"questo progetto"}.`).trim();
  return `https://wa.me/${phone}${msg?`?text=${encodeURIComponent(msg)}`:""}`;
 }
 if(type==="phone"){
  const phone=cleanPhone(raw||d.eventPhone);
  return phone?`tel:+${phone}`:"";
 }
 if(type==="email"){
  if(!raw)return "";
  const subject=encodeURIComponent(d.project||"Richiesta informazioni");
  const body=encodeURIComponent(d.ctaMessage||`Vorrei ricevere informazioni su ${d.project||"questo progetto"}.`);
  return `mailto:${raw}?subject=${subject}&body=${body}`;
 }
 return ensureUrl(raw);
}
function ctaLabelForType(type){
 return {
  none:"Nessun collegamento",
  whatsapp:"Numero WhatsApp",
  phone:"Numero di telefono",
  website:"Indirizzo del sito web",
  googleform:"Link del Modulo Google",
  eventbrite:"Link Eventbrite",
  email:"Indirizzo email",
  custom:"Link personalizzato"
 }[type]||"Collegamento";
}
function updateCtaControls(){
 const type=$("ctaType")?.value||"none";
 if($("ctaValueLabel"))$("ctaValueLabel").textContent=ctaLabelForType(type);
 if($("ctaMessageField"))$("ctaMessageField").style.display=["whatsapp","email"].includes(type)?"block":"none";
 const placeholders={
  none:"Nessun collegamento necessario",
  whatsapp:"Esempio: 393331234567",
  phone:"Esempio: 393331234567",
  website:"Esempio: www.miosito.it/prenota",
  googleform:"Incolla il link del modulo",
  eventbrite:"Incolla il link dell’evento",
  email:"Esempio: info@esempio.it",
  custom:"Incolla il collegamento completo"
 };
 if($("ctaValue"))$("ctaValue").placeholder=placeholders[type]||"Inserisci il collegamento";
}
function updatePreviewCtaStatus(d=projectData(false)){
 const url=resolveCtaUrl(d),status=$("ctaPreviewStatus"),canvas=$("previewCanvas");
 if(!status||!canvas)return;
 canvas.classList.toggle("cta-ready",!!url);
 status.classList.toggle("active",!!url);
 status.textContent=url
  ? "Pulsante attivo nell’anteprima: toccalo per aprire il collegamento. Nel PDF sarà cliccabile se l’opzione è selezionata."
  : "Il pulsante della locandina è solo grafico: seleziona un’azione e inserisci un collegamento valido.";
}
function openCtaLink(){
 const d=projectData(false),url=resolveCtaUrl(d);
 if(!url)return notify("Configura prima un collegamento valido.",true);
 window.open(url,"_blank","noopener,noreferrer");
}

const CREATIVE_MODELS=[
 ["Hero fotografico","hero"],
 ["Editoriale diviso","split"],
 ["Poster tipografico","typePoster"],
 ["Evento ticket","ticket"],
 ["Magazine","magazine"],
 ["Minimal premium","minimal"],
 ["Cinematico","cinematic"],
 ["Bauhaus geometrico","bauhaus"],
 ["Diagonale dinamico","diagonal"],
 ["Collage editoriale","collage"],
 ["Finestra fotografica","photoFrame"],
 ["Servizi modulari","services"]
];
const GRAPHIC_LAYOUT_GROUPS={
 portrait:CREATIVE_MODELS,
 square:CREATIVE_MODELS,
 landscape:CREATIVE_MODELS,
 ultraWide:CREATIVE_MODELS,
 printPortrait:CREATIVE_MODELS,
 printLandscape:CREATIVE_MODELS
};
function graphicOptions(type){const cls=formatClass(type);return GRAPHIC_LAYOUT_GROUPS[cls]||GRAPHIC_LAYOUT_GROUPS.square}
function normalizeGraphicVariant(type,index=graphicVariant){const list=graphicOptions(type);if(!list.length)return 0;return ((Number(index)||0)%list.length+list.length)%list.length}
function selectedGraphic(type,index=graphicVariant){const list=graphicOptions(type);return list[normalizeGraphicVariant(type,index)]||["Grafica automatica",null]}
function updatePreviewGraphicStatus(){const list=graphicOptions($("type").value),i=normalizeGraphicVariant($("type").value);graphicVariant=i;const item=list[i]||["Grafica automatica",null];if($("previewGraphicName"))$("previewGraphicName").textContent=item[0];if($("previewGraphicCounter"))$("previewGraphicCounter").textContent=`${i+1} / ${list.length} modelli`}
function cycleGraphic(direction=1){const list=graphicOptions($("type").value);if(!list.length)return;graphicVariant=normalizeGraphicVariant($("type").value,graphicVariant+direction);manualOffsets=normalizeOffsets();updatePreviewGraphicStatus();build(false);notify(`Modello selezionato: ${list[graphicVariant][0]}`)}

const FORMAT_THEME_GROUPS={
portrait:["Editoriale verticale","Poster tipografico verticale","Foto a tutta pagina","Evento open day","Soft professionale","Nature editorial","Clinical professional"],
square:["Premium tattico","Social announcement","Focus circolare","Card sovrapposte","Mosaico K9","Luxury nero oro","Corporate premium"],
landscape:["Poster tipografico orizzontale","Cover documentario","Split editoriale sinistra","Banner superiore","Manifesto fotografico","Report operativo","Swiss grid"],
ultraWide:["Banner sito panoramico","Cover reportage","Editoriale fascia laterale","Geometrico lineare","Fotografico cinematico","Corporate premium"],
printPortrait:["Editoriale verticale","Scheda tecnica","Timeline evento","White academy","Clinical professional","Corporate premium"],
printLandscape:["Editoriale a colonne","Report operativo","Luxury marmo","Dark academy","Swiss grid"]
};
function formatClass(type){const f=formats[type]||formats["Post Instagram quadrato"],r=f.w/f.h;if(/A4|A5|Brochure|Attestato/.test(type))return r<1?"printPortrait":"printLandscape";if(r<.82)return"portrait";if(r>2)return"ultraWide";if(r>1.25)return"landscape";return"square"}
function compatibleThemes(type){
 const preferred=["Chiaro professionale","Natura organica","Energia arancio","Premium nero oro","Tattico blu","Editoriale viola"];
 const all=[...$("style").options].map(o=>o.value||o.text).filter(Boolean);
 return preferred.filter(name=>all.includes(name));
}
function applyFormatAdaptiveScale(type,changeTheme=true){
 const f=formats[type]||formats["Post Instagram quadrato"],cls=formatClass(type),ratio=f.w/f.h;
 const profiles={
  portrait:{title:112,subtitle:106,details:104,cta:106,badge:102,footer:100,logo:100,logo2:100,logo3:100,logo4:100,logo5:100,logo6:100,logo7:100,logo8:100},
  square:{title:108,subtitle:102,details:100,cta:104,badge:100,footer:100,logo:100,logo2:100,logo3:100,logo4:100,logo5:100,logo6:100,logo7:100,logo8:100},
  landscape:{title:106,subtitle:100,details:100,cta:102,badge:98,footer:98,logo:94,logo2:94,logo3:94,logo4:94,logo5:94,logo6:94,logo7:94,logo8:94},
  ultraWide:{title:102,subtitle:96,details:96,cta:100,badge:96,footer:96,logo:88,logo2:88,logo3:88,logo4:88,logo5:88,logo6:88,logo7:88,logo8:88},
  printPortrait:{title:110,subtitle:104,details:104,cta:104,badge:100,footer:100,logo:96,logo2:96,logo3:96,logo4:96,logo5:96,logo6:96,logo7:96,logo8:96},
  printLandscape:{title:106,subtitle:100,details:100,cta:102,badge:98,footer:98,logo:92,logo2:92,logo3:92,logo4:92,logo5:92,logo6:92,logo7:92,logo8:92}
 };
 elementScales=normalizeScales(profiles[cls]);
 manualOffsets=normalizeOffsets();
 if(changeTheme&&!$("lockPreviewTheme")?.checked&&$("autoPreviewTheme")?.checked!==false){
  const list=compatibleThemes(type);
  if(list.length&&!list.includes($("style").value))$("style").value=list[0];
 }
 updateSelectedScaleControl();updateOffsetReadout();updatePreviewGraphicStatus();updatePreviewThemeStatus();
 if($("formatAdaptStatus"))$("formatAdaptStatus").textContent=`Adattamento completo ${f.w} × ${f.h}px · testi ${ratio>2?"panoramici":ratio<.75?"verticali":"bilanciati"} · 12 modelli reali e 6 identità colore.`;
}
function updatePreviewThemeStatus(){const list=compatibleThemes($("type").value),current=$("style").value;let i=list.indexOf(current);if(i<0)i=0;if($("previewThemeName"))$("previewThemeName").textContent=current||"Tema";if($("previewThemeCounter"))$("previewThemeCounter").textContent=list.length?`${i+1} / ${list.length} temi`:"—"}
function cycleTheme(direction=1){const list=compatibleThemes($("type").value);if(!list.length)return;let i=list.indexOf($("style").value);if(i<0)i=0;i=(i+direction+list.length)%list.length;$("style").value=list[i];manualOffsets=normalizeOffsets();applyFormatAdaptiveScale($("type").value,false);updatePreviewThemeStatus();build(false);notify(`Identità colore: ${list[i]}`)}
function projectData(autoTitle=false){const project=$("project").value.trim()||"Progetto K9",type=$("type").value,discipline=$("discipline").value,objective=$("objective").value,audience=$("audience").value,tone=$("tone").value,tone2=$("tone2").value,toneMix=Number($("toneMix").value||70),style=$("style").value,styleMode=$("styleMode")?.value||"auto",logoSize=$("logoSize").value||"auto",logoScale=Number($("logoScale")?.value||100),logo2Size=$("logo2Size")?.value||"auto",logo2Scale=Number($("logo2Scale")?.value||100),logo2Position=$("logo2Position")?.value||"tl",contentMode=$("contentMode")?.value||"complete",d=disciplines[discipline],details=$("details").value.trim(),subtitle=$("subtitleInput").value.trim(),slogan=$("sloganInput").value.trim(),contact=$("contact").value.trim(),location=$("location").value.trim(),benefits=$("benefits")?.value.trim()||"",program=$("program")?.value.trim()||"",targetText=$("targetText")?.value.trim()||"",methodText=$("methodText")?.value.trim()||"",includedText=$("includedText")?.value.trim()||"",requirementsText=$("requirementsText")?.value.trim()||"",notesText=$("notesText")?.value.trim()||"",eventTime=$("eventTime")?.value.trim()||"",eventSeats=$("eventSeats")?.value.trim()||"",eventPrice=$("eventPrice")?.value.trim()||"",eventPhone=$("eventPhone")?.value.trim()||"",ctaType=$("ctaType")?.value||"none",ctaValue=$("ctaValue")?.value.trim()||"",ctaMessage=$("ctaMessage")?.value.trim()||"",ctaPdfEnabled=$("ctaPdfEnabled")?.checked!==false,ctaSocialEnabled=$("ctaSocialEnabled")?.checked!==false;if(autoTitle)$("titleInput").value=randomItem(poolFor(discipline,"titles"));return{id:Date.now(),updatedAt:new Date().toISOString(),project,type,discipline,objective,audience,tone,tone2,toneMix,style,styleMode,logoSize,logoScale,logo2Size,logo2Scale,logo2Position,logoBgMode:$("logoBgMode")?.value||"auto",logoTolerance:Number($("logoTolerance")?.value||42),logo2BgMode:$("logo2BgMode")?.value||"auto",logo2Tolerance:Number($("logo2Tolerance")?.value||42),contentMode,graphicVariant,manualOffsets:offsetSnapshot(),elementScales:scaleSnapshot(),title:$("titleInput").value.trim(),slogan,subtitle,details,benefits,program,targetText,methodText,includedText,requirementsText,notesText,eventTime,eventSeats,eventPrice,eventPhone,contact,ctaType,ctaValue,ctaMessage,ctaPdfEnabled,ctaSocialEnabled,date:$("date").value,location,accent:$("accentColor").value,gold:$("goldColor").value,image:currentImage,logo:currentLogo,logoOriginal:currentLogoOriginal,logo2:currentLogo2,logo2Original:currentLogo2Original,extraLogos:JSON.parse(JSON.stringify(extraLogos))}}
function promoPack(d){const disc=disciplines[d.discipline],dt=dateText(d.date),where=d.location||"luogo da definire",tone=toneProfiles[d.tone]||toneProfiles.Professionale;const objectiveLines={"Promuovi servizio":`Scopri un servizio dedicato a ${disc.desc}.`,"Raccogli iscrizioni":`Le iscrizioni sono aperte per ${d.project}.`,"Annuncia evento":`È in programma ${d.project}: un appuntamento dedicato a ${disc.desc}.`,"Comunica disponibilità":`Sono disponibili nuovi posti per ${d.discipline}.`,"Presenta un corso":`Un percorso strutturato per conoscere e approfondire ${disc.desc}.`,"Racconta un risultato":`Un nuovo risultato costruito attraverso metodo, costanza e collaborazione.`,"Pubblica testimonianza":`L’esperienza di chi ha scelto un percorso dedicato a ${d.discipline}.`,"Informa ed educa":`Conoscere ${d.discipline} significa comprendere meglio bisogni, capacità e potenziale del cane.`};const hook=objectiveLines[d.objective]||objectiveLines["Promuovi servizio"],lead=toneBlend(hook,d.tone,d.tone2,d.toneMix),emoji=tone.emoji?tone.emoji+" ":"";const social=`${emoji}${d.title}
${d.slogan}

${lead}

${d.details}

📅 ${dt}
📍 ${where}
🎯 Pensato per: ${d.audience}

${d.contact}`;const short=`${emoji}${d.title}
${d.slogan}
${dt} · ${where}
${d.contact}`;const whatsapp=`Ciao! ${tone.open}.

${d.title}
${d.subtitle}

📅 ${dt}
📍 ${where}

${d.contact}`;const slogans=[d.slogan,...poolFor(d.discipline,"slogans").filter(x=>x!==d.slogan).slice(0,4)].join("\n• ");const tags=[...disc.keywords,d.discipline,d.objective,"cani","cinofilia","benessereanimale","K9NapoletanoAcademy"].map(x=>"#"+x.replace(/\s+/g,"").replace(/[^a-zA-Z0-9À-ÿ]/g,"")).join(" ");const campaign=`1. PRESENTAZIONE
${d.title}
${d.slogan}
${d.subtitle}

2. APPROFONDIMENTO
${d.details}

3. INVITO ALL’AZIONE
${d.contact}
${dt} · ${where}`;return{social,short,whatsapp,slogans,hashtags:tags,campaign}}
function updateTexts(d){const dt=dateText(d.date),disc=disciplines[d.discipline],p=promoPack(d);$("formatPill").textContent=formats[d.type].label;$("titleOut").textContent=d.title;$("sloganOut").textContent=d.slogan;$("subtitleOut").textContent=d.subtitle;$("descriptionOut").textContent=d.details;$("bodyOut").textContent=`${d.title}
${d.slogan}
${d.subtitle}

${d.details}

${serviceLabels(d.discipline)[0].toUpperCase()}
${d.benefits}

${serviceLabels(d.discipline)[1].toUpperCase()}
${d.program}

${serviceLabels(d.discipline)[2].toUpperCase()}
${d.targetText}

${d.eventTime} · ${d.eventSeats} · ${d.eventPrice}
${dt} · ${d.location}
${d.contact}`;$("socialOut").textContent=p.social;$("shortOut").textContent=p.short;$("whatsappOut").textContent=p.whatsapp;$("slogansOut").textContent="• "+p.slogans;$("hashtagsOut").textContent=p.hashtags;$("campaignOut").textContent=p.campaign;$("imagePromptOut").textContent=`Immagine promozionale professionale dedicata a ${d.discipline}: ${disc.desc}. Pubblico: ${d.audience}. Tono visivo ${d.tone.toLowerCase()}${d.tone2!=="Nessuno"?` con influenza ${d.tone2.toLowerCase()}`:""}. Cane e persona realistici, postura naturale, ambiente credibile e ordinato, composizione editoriale pulita, illuminazione cinematografica, spazio negativo per il titolo, alta definizione, nessun testo, nessun logo, nessuna filigrana.`}
function loadImg(src){return new Promise(resolve=>{if(!src)return resolve(null);const im=new Image();im.onload=()=>resolve(im);im.onerror=()=>resolve(null);im.src=src})}
function roundedRect(ctx,x,y,w,h,r){r=Math.min(r,w/2,h/2);ctx.beginPath();ctx.moveTo(x+r,y);ctx.arcTo(x+w,y,x+w,y+h,r);ctx.arcTo(x+w,y+h,x,y+h,r);ctx.arcTo(x,y+h,x,y,r);ctx.arcTo(x,y,x+w,y,r);ctx.closePath()}
function fitFont(ctx,text,maxWidth,start,min,weight="900"){let size=start;do{ctx.font=`${weight} ${size}px Arial, sans-serif`;if(ctx.measureText(text).width<=maxWidth)break;size-=2}while(size>min);return size}
function fitEllipsis(ctx,text,maxWidth){text=String(text||"");if(ctx.measureText(text).width<=maxWidth)return text;let out=text;while(out.length&&ctx.measureText(out+"…").width>maxWidth)out=out.slice(0,-1);return out+"…"}
function wrapLines(ctx,text,maxWidth,maxLines){const paras=String(text||"").split(/\n+/),lines=[];for(const para of paras){const words=para.split(/\s+/);let line="";for(const word of words){const test=line?line+" "+word:word;if(ctx.measureText(test).width>maxWidth&&line){lines.push(line);line=word;if(lines.length>=maxLines)break}else line=test}if(lines.length>=maxLines)break;if(line)lines.push(line)}if(lines.length>maxLines)lines.length=maxLines;if(lines.length===maxLines){let last=lines[maxLines-1];while(ctx.measureText(last+"…").width>maxWidth&&last.length)last=last.slice(0,-1);lines[maxLines-1]=last+"…"}return lines}
function drawCover(ctx,img,w,h){const sc=Math.max(w/img.width,h/img.height),dw=img.width*sc,dh=img.height*sc;ctx.drawImage(img,(w-dw)/2,(h-dh)/2,dw,dh)}
function sampleImageLuminance(img,ratio,portrait){
 if(!img)return .25;
 try{
  const c=document.createElement("canvas"),sw=96,sh=96;c.width=sw;c.height=sh;
  const x=c.getContext("2d",{willReadFrequently:true});drawCover(x,img,sw,sh);
  const data=x.getImageData(0,0,sw,sh).data;
  let total=0,count=0;
  const xMax=portrait?sw:Math.round(sw*(ratio>=1.22?.58:.68));
  const yMin=portrait?0:Math.round(sh*.06),yMax=portrait?Math.round(sh*.68):Math.round(sh*.78);
  for(let yy=yMin;yy<yMax;yy+=2)for(let xx=0;xx<xMax;xx+=2){const i=(yy*sw+xx)*4;total+=(.2126*data[i]+.7152*data[i+1]+.0722*data[i+2])/255;count++}
  return count?total/count:.25;
 }catch{return .25}
}
function textBlockHeight(lines,fontSize,lineFactor=1.1){return Math.max(0,lines.length)*fontSize*lineFactor}
function wrapAllLines(ctx,text,maxWidth){const lines=[];for(const para of String(text||"").split(/\n+/)){const words=para.trim().split(/\s+/).filter(Boolean);let line="";for(const word of words){const test=line?line+" "+word:word;if(line&&ctx.measureText(test).width>maxWidth){lines.push(line);line=word}else line=test}if(line)lines.push(line)}return lines}
function fitWrappedBlock(ctx,text,maxWidth,maxHeight,startSize,minSize,maxLines,weight="900",lineFactor=.96){
 let size=Math.max(minSize,startSize),lines=[],absoluteMin=Math.max(8,Math.round(minSize*.56));
 while(size>=absoluteMin){ctx.font=`${weight} ${size}px Arial, sans-serif`;lines=wrapAllLines(ctx,String(text||""),maxWidth);const allowed=Math.max(maxLines,Math.floor(maxHeight/(size*lineFactor)));if(lines.length<=allowed&&textBlockHeight(lines,size,lineFactor)<=maxHeight)break;size-=2}
 const allowed=Math.max(1,Math.floor(maxHeight/(size*lineFactor)));if(lines.length>allowed){lines=lines.slice(0,allowed);let last=lines[allowed-1]||"";while(last&&ctx.measureText(last+"…").width>maxWidth)last=last.slice(0,-1);lines[allowed-1]=last+"…"}
 return {size,lines,lineHeight:size*lineFactor,height:textBlockHeight(lines,size,lineFactor)};
}
function contentDensity(text){return String(text||"").trim().length}
function clamp(n,min,max){return Math.max(min,Math.min(max,n))}


function hasText(value){return String(value??"").trim().length>0}
function compactList(values){return (values||[]).map(v=>String(v??"").trim()).filter(Boolean)}
function hasEventInfo(d){return [d.eventDate,d.eventLocation,d.eventTime,d.eventSeats,d.eventPrice,d.eventPhone].some(hasText)}
function hasFooterInfo(d){return [d.date,d.location].some(hasText)}
function hasCtaInfo(d){return hasText(d.contact)}
function conditionalSections(d){
 const sections=[];
 const benefits=compactList(d.benefits);if(benefits.length)sections.push({key:"benefits",items:benefits});
 const program=compactList(d.program);if(program.length)sections.push({key:"program",items:program});
 const targets=compactList(d.targets);if(targets.length)sections.push({key:"targets",items:targets});
 if(hasEventInfo(d))sections.push({key:"event",items:compactList([d.eventDate,d.eventLocation,d.eventTime,d.eventSeats,d.eventPrice,d.eventPhone])});
 return sections;
}

async function renderDesign(canvas,d){
 const f=formats[d.type]||formats["Post Instagram quadrato"],w=f.w,h=f.h,ctx=canvas.getContext("2d"),unit=Math.min(w,h);
 canvas.width=w;canvas.height=h;canvas._elementBoxes={};canvas._ctaBox=null;canvas._logoBoxes={};
 const img=await loadImg(d.image),m=unit*.052,model=normalizeGraphicVariant(d.type,d.graphicVariant??graphicVariant)%12;
 const offsets=normalizeOffsets(d.manualOffsets||manualOffsets),offScale=unit/1080;
 const off=k=>({x:(offsets[k]?.x||0)*offScale,y:(offsets[k]?.y||0)*offScale});
 const scale=k=>Math.max(.45,Math.min(2.4,Number((d.elementScales||elementScales)[k]||100)/100));
 const box=(k,x,y,bw,bh)=>canvas._elementBoxes[k]={x,y,w:bw,h:bh};
 const rr=(x,y,bw,bh,r)=>{ctx.beginPath();if(ctx.roundRect)ctx.roundRect(x,y,bw,bh,r);else roundedRect(ctx,x,y,bw,bh,r)};
 const title=d.title||"Titolo della locandina",subtitle=d.subtitle||d.slogan||"",badge=`${d.discipline||"K9"}${d.objective?` · ${d.objective}`:""}`.toUpperCase();
 const cta=(d.ctaText||d.contact||"SCOPRI DI PIÙ").toUpperCase();
 const rawSections=[
  ["COSA COMPRENDE",d.benefits||d.details],
  ["COME FUNZIONA",d.program||d.methodText],
  ["PER CHI È INDICATO",d.targetText||d.audience],
  ["METODO DI LAVORO",d.methodText||d.requirementsText]
 ].filter(x=>hasText(x[1]));
 const styleName=String(d.style||"").toLowerCase();
 const paletteIndex=["chiaro","natura","energia","premium","tattico","editoriale"].findIndex(k=>styleName.includes(k));
 const palettes=[
  {bg:"#f7fbff",surface:"#ffffff",ink:"#10263a",muted:"#52687a",accent:d.accent||"#ff7a00",accent2:d.gold||"#2f8f83",line:"#d7e3eb",onAccent:"#ffffff"},
  {bg:"#edf7f0",surface:"#ffffff",ink:"#173629",muted:"#587064",accent:d.accent||"#4f9b67",accent2:"#d99b42",line:"#c9dfd0",onAccent:"#ffffff"},
  {bg:"#fff5ee",surface:"#ffffff",ink:"#3b2018",muted:"#775c52",accent:d.accent||"#ed5a2a",accent2:"#ffb33d",line:"#efcbbb",onAccent:"#ffffff"},
  {bg:"#0b1118",surface:"#111a24",ink:"#f8f4e8",muted:"#c3bda9",accent:d.accent||"#d7a84a",accent2:"#7a5b25",line:"#4c3e25",onAccent:"#101010"},
  {bg:"#07121b",surface:"#0d1b27",ink:"#eef5f8",muted:"#a6bac5",accent:d.accent||"#ff7a00",accent2:"#1f6d83",line:"#284354",onAccent:"#ffffff"},
  {bg:"#f3effa",surface:"#ffffff",ink:"#241c38",muted:"#685f7a",accent:d.accent||"#7757c8",accent2:"#2e8f9c",line:"#d9cfee",onAccent:"#ffffff"}
 ];
 let p={...palettes[paletteIndex<0?0:paletteIndex]};
 if(d.styleMode==="dark" && !["#0b1118","#07121b"].includes(p.bg)){p={...p,bg:"#0b1118",surface:"#111a24",ink:"#f7fafc",muted:"#bcc8cf",line:"#2b3a46"}}
 if(d.styleMode==="light" && ["#0b1118","#07121b"].includes(p.bg)){p={...p,bg:"#f7fbff",surface:"#ffffff",ink:"#10263a",muted:"#52687a",line:"#d7e3eb"}}
 function drawImage(x,y,bw,bh,darken=0,round=0){
  const o=off("image"),zoom=scale("image");box("image",x,y,bw,bh);
  ctx.save();if(round){rr(x,y,bw,bh,round);ctx.clip()}ctx.fillStyle=p.bg;ctx.fillRect(x,y,bw,bh);
  if(img){const base=Math.max(bw/img.width,bh/img.height),sc=base*zoom,dw=img.width*sc,dh=img.height*sc;ctx.drawImage(img,x+(bw-dw)/2+o.x,y+(bh-dh)/2+o.y,dw,dh)}
  if(darken){ctx.fillStyle=`rgba(0,0,0,${darken})`;ctx.fillRect(x,y,bw,bh)}ctx.restore();
 }
 function fitBlock(text,bw,bh,max,min,weight=800){
  let size=max,lines=[];for(;size>=min;size--){ctx.font=`${weight} ${size}px Arial,sans-serif`;lines=wrapAllLines(ctx,text,bw);if(lines.length*size*1.08<=bh)break}
  const maxLines=Math.max(1,Math.floor(bh/(size*1.08)));if(lines.length>maxLines){lines=lines.slice(0,maxLines);let last=lines.at(-1)||"";while(last&&ctx.measureText(last+"…").width>bw)last=last.slice(0,-1);lines[lines.length-1]=last+"…"}return{size,lines};
 }
 function text(k,text,x,y,bw,bh,max,min,weight,color,align="left"){
  const o=off(k),r=fitBlock(String(text||""),bw,bh,max*scale(k),min,weight),tx=x+o.x+(align==="center"?bw/2:align==="right"?bw:0);
  box(k,x+o.x,y+o.y,bw,bh);ctx.fillStyle=color;ctx.textAlign=align;ctx.textBaseline="top";r.lines.forEach((line,i)=>ctx.fillText(line,tx,y+o.y+i*r.size*1.08));return r;
 }
 function badgeDraw(x,y,bw,outline=false){
  const o=off("badge"),hh=unit*.042*scale("badge");box("badge",x+o.x,y+o.y,bw,hh);ctx.save();
  if(outline){ctx.strokeStyle=p.accent;ctx.lineWidth=Math.max(2,unit*.002);rr(x+o.x,y+o.y,bw,hh,hh/2);ctx.stroke();ctx.fillStyle=p.accent}
  else{ctx.fillStyle=p.accent;rr(x+o.x,y+o.y,bw,hh,hh/2);ctx.fill();ctx.fillStyle=p.onAccent}
  ctx.font=`800 ${Math.max(11,unit*.014*scale("badge"))}px Arial`;ctx.textAlign="center";ctx.textBaseline="middle";ctx.fillText(fitEllipsis(ctx,badge,bw-unit*.025),x+o.x+bw/2,y+o.y+hh/2);ctx.restore();
 }
 function button(x,y,bw,ghost=false){
  const o=off("cta"),hh=unit*.058*scale("cta");box("cta",x+o.x,y+o.y,bw,hh);ctx.save();
  if(ghost){ctx.strokeStyle=p.accent;ctx.lineWidth=Math.max(2,unit*.002);rr(x+o.x,y+o.y,bw,hh,unit*.012);ctx.stroke();ctx.fillStyle=p.accent}
  else{ctx.fillStyle=p.accent;rr(x+o.x,y+o.y,bw,hh,unit*.012);ctx.fill();ctx.fillStyle=p.onAccent}
  ctx.font=`900 ${Math.max(12,unit*.018*scale("cta"))}px Arial`;ctx.textAlign="center";ctx.textBaseline="middle";ctx.fillText(fitEllipsis(ctx,cta,bw-unit*.03),x+o.x+bw/2,y+o.y+hh/2);ctx.restore();
  const url=resolveCtaUrl(d);if(url)canvas._ctaBox={x:x+o.x,y:y+o.y,w:bw,h:hh,url};
 }
 function cardGrid(x,y,bw,bh,cols=2,limit=4,mode="cards"){
  const o=off("details"),items=rawSections.slice(0,limit);if(!items.length)return;box("details",x+o.x,y+o.y,bw,bh);
  const gap=unit*.012,rows=Math.ceil(items.length/cols),cw=(bw-gap*(cols-1))/cols,ch=(bh-gap*(rows-1))/rows;
  items.forEach(([head,body],i)=>{const cx=x+o.x+(i%cols)*(cw+gap),cy=y+o.y+Math.floor(i/cols)*(ch+gap);ctx.save();
   if(mode==="cards"){ctx.fillStyle=p.surface;rr(cx,cy,cw,ch,unit*.012);ctx.fill();ctx.strokeStyle=p.line;ctx.lineWidth=Math.max(1,unit*.0015);ctx.stroke()}
   else if(mode==="lines"){ctx.strokeStyle=p.accent;ctx.lineWidth=unit*.004;ctx.beginPath();ctx.moveTo(cx,cy);ctx.lineTo(cx,cy+ch);ctx.stroke()}
   const pad=unit*.014;ctx.fillStyle=p.accent;ctx.font=`900 ${Math.max(12,unit*.017)}px Arial`;ctx.textAlign="left";ctx.textBaseline="top";ctx.fillText(fitEllipsis(ctx,head,cw-pad*2),cx+pad,cy+pad);
   const bodyText=Array.isArray(body)?body.join(" · "):String(body||"");const r=fitBlock(bodyText,cw-pad*2,ch-pad*2-unit*.026,Math.max(11,unit*.0135),Math.max(9,unit*.0105),500);
   ctx.fillStyle=p.ink;ctx.font=`500 ${r.size}px Arial`;r.lines.forEach((line,j)=>ctx.fillText(line,cx+pad,cy+pad+unit*.027+j*r.size*1.12));ctx.restore();
  });
 }
 function footer(){
  const ft=[dateText(d.date),d.location].filter(hasText).join(" · ");if(!ft)return;const o=off("footer");box("footer",m+o.x,h-m*.75+o.y,w-m*2,m*.45);
  ctx.fillStyle=p.muted;ctx.font=`600 ${Math.max(10,unit*.013*scale("footer"))}px Arial`;ctx.textAlign="left";ctx.textBaseline="middle";ctx.fillText(fitEllipsis(ctx,ft,w-m*2),m+o.x,h-m*.52+o.y);
 }
 function decorations(kind){
  ctx.save();ctx.strokeStyle=p.accent;ctx.fillStyle=p.accent;ctx.globalAlpha=.9;
  if(kind==="bauhaus"){ctx.beginPath();ctx.arc(w*.82,h*.18,unit*.12,0,Math.PI*2);ctx.fill();ctx.fillRect(w*.08,h*.74,w*.25,unit*.025);ctx.strokeStyle=p.accent2;ctx.lineWidth=unit*.012;ctx.strokeRect(w*.68,h*.62,unit*.18,unit*.18)}
  if(kind==="diagonal"){ctx.lineWidth=unit*.012;ctx.beginPath();ctx.moveTo(w*.62,0);ctx.lineTo(w*.33,h);ctx.stroke();ctx.globalAlpha=.35;ctx.beginPath();ctx.moveTo(w*.70,0);ctx.lineTo(w*.41,h);ctx.stroke()}
  if(kind==="cinematic"){ctx.lineWidth=unit*.003;ctx.strokeRect(m,m,w-m*2,h-m*2);ctx.fillRect(m,h*.12,w*.12,unit*.007);ctx.fillRect(w-m-w*.12,h*.12,w*.12,unit*.007)}
  ctx.restore();
 }
 function drawLogos(){
  const list=[];if(d.logo)list.push({key:"logo",src:d.logo,pos:"br"});if(d.logo2)list.push({key:"logo2",src:d.logo2,pos:d.logo2Position||"tl"});(d.extraLogos||[]).forEach((l,i)=>l?.data&&list.push({key:`logo${i+3}`,src:l.data,pos:l.pos||"tr"}));
  return Promise.all(list.map(async l=>({...l,img:await loadImg(l.src)}))).then(loaded=>loaded.forEach((l,i)=>{if(!l.img)return;const s=unit*.085*scale(l.key),pad=m*.65,ratio=l.img.width/l.img.height;let bw=s,bh=s;if(ratio>1)bh=bw/ratio;else bw=bh*ratio;let x=pad,y=pad;if(l.pos.includes("r"))x=w-pad-bw;else if(l.pos.includes("c"))x=(w-bw)/2;if(l.pos.startsWith("b"))y=h-pad-bh;else if(l.pos.startsWith("t"))y=pad;const o=off(l.key);x+=o.x;y+=o.y;ctx.save();ctx.fillStyle="rgba(255,255,255,.90)";rr(x-unit*.006,y-unit*.006,bw+unit*.012,bh+unit*.012,unit*.010);ctx.fill();ctx.drawImage(l.img,x,y,bw,bh);ctx.restore();box(l.key,x-unit*.006,y-unit*.006,bw+unit*.012,bh+unit*.012);canvas._logoBoxes[l.key]={x,y,w:bw,h:bh}}));
 }
 ctx.fillStyle=p.bg;ctx.fillRect(0,0,w,h);
 const ratio=w/h,landscape=ratio>1.2,portrait=ratio<.82;
 if(model===0){ // Hero fotografico
  drawImage(0,0,w,h,.18);const g=ctx.createLinearGradient(0,h*.28,0,h);g.addColorStop(0,"rgba(0,0,0,0)");g.addColorStop(1,"rgba(0,0,0,.88)");ctx.fillStyle=g;ctx.fillRect(0,0,w,h);
  badgeDraw(m,m,Math.min(w*.36,unit*.38));text("title",title,m,h*.48,w-m*2,h*.22,unit*.068,unit*.028,900,"#fff");text("subtitle",subtitle,m,h*.70,w*.68,h*.10,unit*.022,unit*.013,500,"#fff");button(m,h*.84,Math.min(w*.34,unit*.42));decorations("cinematic");
 }else if(model===1){ // Editoriale diviso
  const split=landscape?.48:.44;drawImage(w*split,0,w*(1-split),h,0);ctx.fillStyle=p.bg;ctx.fillRect(0,0,w*split+unit*.006,h);ctx.fillStyle=p.accent;ctx.fillRect(w*split,0,unit*.006,h);
  badgeDraw(m,m,w*split-m*2);text("title",title,m,h*.21,w*split-m*2,h*.26,unit*.058,unit*.026,900,p.ink);text("subtitle",subtitle,m,h*.50,w*split-m*2,h*.15,unit*.021,unit*.012,500,p.muted);button(m,h*.77,w*split-m*2);if(d.contentMode==="complete")cardGrid(w*split+m,h*.62,w*(1-split)-m*2,h*.25,1,2,"lines");
 }else if(model===2){ // Poster tipografico
  ctx.fillStyle=p.accent;ctx.fillRect(0,0,w*.11,h);drawImage(w*.62,m,w*.32,h-m*2,0,unit*.012);badgeDraw(w*.15,m,w*.38,true);
  text("title",title,w*.15,h*.17,w*.42,h*.44,unit*.080,unit*.030,900,p.ink);text("subtitle",subtitle,w*.15,h*.64,w*.40,h*.12,unit*.020,unit*.012,500,p.muted);button(w*.15,h*.81,w*.35,true);
 }else if(model===3){ // Evento ticket
  drawImage(0,0,w,h,.35);ctx.fillStyle=p.surface;rr(m,h*.18,w-m*2,h*.64,unit*.024);ctx.fill();ctx.strokeStyle=p.line;ctx.lineWidth=unit*.002;ctx.setLineDash([unit*.012,unit*.008]);ctx.stroke();ctx.setLineDash([]);
  badgeDraw(m*1.5,h*.22,w-m*3);text("title",title,m*1.5,h*.34,w-m*3,h*.20,unit*.056,unit*.026,900,p.ink,"center");text("subtitle",subtitle,m*2,h*.55,w-m*4,h*.11,unit*.020,unit*.012,500,p.muted,"center");
  if(d.contentMode==="complete")cardGrid(m*1.5,h*.67,w-m*3,h*.09,4,4,"lines");button((w-Math.min(w*.38,unit*.44))/2,h*.78,Math.min(w*.38,unit*.44));
 }else if(model===4){ // Magazine
  drawImage(m,m,w*.58,h-m*2,0,unit*.015);ctx.fillStyle=p.surface;ctx.fillRect(w*.56,0,w*.44,h);badgeDraw(w*.60,m,w*.34);
  text("title",title,w*.60,h*.20,w*.34,h*.29,unit*.052,unit*.024,900,p.ink);text("subtitle",subtitle,w*.60,h*.52,w*.32,h*.15,unit*.019,unit*.011,500,p.muted);if(d.contentMode==="complete")cardGrid(w*.60,h*.66,w*.32,h*.15,1,2,"lines");button(w*.60,h*.84,w*.30);
 }else if(model===5){ // Minimal premium
  ctx.fillStyle=p.surface;rr(m,m,w-m*2,h-m*2,unit*.018);ctx.fill();ctx.strokeStyle=p.line;ctx.stroke();drawImage(w*.59,m*1.5,w*.32,h-m*3,0,unit*.014);
  badgeDraw(m*1.5,m*1.5,w*.34,true);text("title",title,m*1.5,h*.25,w*.40,h*.28,unit*.056,unit*.024,800,p.ink);text("subtitle",subtitle,m*1.5,h*.56,w*.39,h*.16,unit*.019,unit*.011,500,p.muted);button(m*1.5,h*.80,w*.34,true);
 }else if(model===6){ // Cinematico
  drawImage(0,0,w,h,.48);decorations("cinematic");badgeDraw((w-w*.34)/2,m,w*.34,true);text("title",title,m,h*.35,w-m*2,h*.24,unit*.071,unit*.030,900,"#fff","center");text("subtitle",subtitle,w*.18,h*.62,w*.64,h*.11,unit*.021,unit*.012,500,"#fff","center");button((w-w*.36)/2,h*.80,w*.36);
 }else if(model===7){ // Bauhaus
  ctx.fillStyle=p.bg;ctx.fillRect(0,0,w,h);decorations("bauhaus");drawImage(w*.52,h*.22,w*.39,h*.48,0,unit*.018);badgeDraw(m,m,w*.34,true);
  text("title",title,m,h*.25,w*.40,h*.30,unit*.061,unit*.026,900,p.ink);text("subtitle",subtitle,m,h*.58,w*.36,h*.14,unit*.019,unit*.011,500,p.muted);button(m,h*.79,w*.32);
 }else if(model===8){ // Diagonale dinamico
  drawImage(w*.34,0,w*.66,h,0);ctx.fillStyle=p.bg;ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(w*.60,0);ctx.lineTo(w*.33,h);ctx.lineTo(0,h);ctx.closePath();ctx.fill();decorations("diagonal");
  badgeDraw(m,m,w*.35);text("title",title,m,h*.22,w*.36,h*.32,unit*.061,unit*.026,900,p.ink);text("subtitle",subtitle,m,h*.58,w*.31,h*.14,unit*.019,unit*.011,500,p.muted);button(m,h*.81,w*.29);
 }else if(model===9){ // Collage editoriale
  drawImage(m,m,w*.52,h*.47,0,unit*.014);drawImage(w*.59,m,w*.32,h*.21,0,unit*.014);drawImage(w*.59,h*.29,w*.32,h*.22,0,unit*.014);
  ctx.fillStyle=p.surface;rr(m,h*.55,w-m*2,h*.36,unit*.016);ctx.fill();badgeDraw(m*1.4,h*.59,w*.32);text("title",title,m*1.4,h*.68,w*.43,h*.14,unit*.048,unit*.022,900,p.ink);text("subtitle",subtitle,m*1.4,h*.82,w*.42,h*.07,unit*.017,unit*.010,500,p.muted);button(w*.64,h*.74,w*.25);
 }else if(model===10){ // Finestra fotografica
  ctx.fillStyle=p.surface;ctx.fillRect(0,0,w,h);ctx.fillStyle=p.accent;ctx.fillRect(0,0,w,h*.13);drawImage(m,h*.19,w-m*2,h*.43,0,unit*.018);
  badgeDraw(m,h*.04,w-m*2,true);text("title",title,m,h*.66,w*.58,h*.14,unit*.046,unit*.022,900,p.ink);text("subtitle",subtitle,m,h*.81,w*.56,h*.08,unit*.018,unit*.010,500,p.muted);button(w*.66,h*.75,w*.27);
 }else{ // Servizi modulari
  drawImage(0,0,w,h*.42,.18);ctx.fillStyle=p.bg;ctx.fillRect(0,h*.39,w,h*.61);badgeDraw(m,m,w*.34);text("title",title,m,h*.43,w-m*2,h*.12,unit*.046,unit*.022,900,p.ink);
  if(d.contentMode==="complete")cardGrid(m,h*.57,w-m*2,h*.27,2,4,"cards");button(m,h*.87,w*.34);
 }
 footer();await drawLogos();ctx.strokeStyle="rgba(20,30,40,.12)";ctx.lineWidth=Math.max(1,unit*.0015);ctx.strokeRect(1,1,w-2,h-2);return canvas;
}

/* ================================================================
   K9 CREATIVE STUDIO 4.0 — MOTORE COMPOSITIVO PROFESSIONALE
   Layout ricostruito a ogni rendering; tutti i contenuti compilati
   vengono inseriti, con gerarchia, paginazione interna e fit dinamico.
================================================================ */

/* Motore grafico unico: renderDesign() definito in questo file. */

async function build(autoTitle=false){
 const token=++renderToken,fallback=$("renderFallback"),fallbackText=$("renderFallbackText"),preview=$("previewCanvas");
 try{
  if(fallback)fallback.classList.add("hidden");
  const d=projectData(autoTitle);
  updateTexts(d);

  // Render fuori schermo: un rendering lento non può più sovrascrivere
  // una modifica più recente effettuata dall'utente.
  const staging=document.createElement("canvas");
  await renderDesign(staging,d);
  if(token!==renderToken)return d;

  if(preview){
   preview.width=staging.width;
   preview.height=staging.height;
   const ctx=preview.getContext("2d",{alpha:false});
   ctx.clearRect(0,0,preview.width,preview.height);
   ctx.drawImage(staging,0,0);
   preview._ctaBox=staging._ctaBox?{...staging._ctaBox}:null;
   preview._logoBoxes=staging._logoBoxes?Object.fromEntries(Object.entries(staging._logoBoxes).map(([key,box])=>[key,{...box}])):{};
   preview._elementBoxes=staging._elementBoxes?Object.fromEntries(Object.entries(staging._elementBoxes).map(([key,box])=>[key,{...box}])):{};
   drawCanvasSelection(preview);
  }
  updatePreviewCtaStatus(d);
  updatePreviewThemeStatus();
  document.documentElement.dataset.canvasReady="true";
  document.documentElement.dataset.renderVersion=String(token);
  if(document.querySelector('.tab-panel[data-panel="social"]')?.classList.contains("active"))updateSocialPublisher(false);
  return d;
 }catch(error){
  // Ignora errori appartenenti a un rendering ormai superato.
  if(token!==renderToken)return projectData(false);
  console.error("K9 render error",error);
  document.documentElement.dataset.canvasReady="false";
  document.documentElement.dataset.k9Error=String(error?.message||error);
  const canvas=preview;
  if(canvas){
   const ctx=canvas.getContext("2d");
   ctx.fillStyle="#10151b";ctx.fillRect(0,0,canvas.width,canvas.height);
   ctx.fillStyle="#ffffff";ctx.textAlign="center";ctx.font="700 42px Arial";
   ctx.fillText("Anteprima non disponibile",canvas.width/2,canvas.height/2-20);
   ctx.fillStyle="#aab2bd";ctx.font="28px Arial";
   ctx.fillText("Premi Riprova anteprima",canvas.width/2,canvas.height/2+35);
  }
  if(fallback){fallback.classList.remove("hidden");if(fallbackText)fallbackText.textContent=String(error?.message||"Errore nel motore grafico")}
  return projectData(false);
 }
}
function applyMedia(){updateLogoManager();if(currentImage){$("imageThumb").src=currentImage;$("imageThumb").style.display="block"}else $("imageThumb").style.display="none";if(currentLogo){$("logoThumb").src=currentLogo;$("logoThumb").style.display="block"}else $("logoThumb").style.display="none";if(currentLogo2){$("logo2Thumb").src=currentLogo2;$("logo2Thumb").style.display="block"}else $("logo2Thumb").style.display="none"}
function imageFromDataUrl(src){return new Promise((resolve,reject)=>{const im=new Image();im.onload=()=>resolve(im);im.onerror=reject;im.src=src})}
function rgbDistance(a,b){
  // Distanza percettiva pesata: più stabile del semplice RGB, soprattutto sui grigi.
  const rMean=(a[0]+b[0])/2,dr=a[0]-b[0],dg=a[1]-b[1],db=a[2]-b[2];
  return Math.sqrt((2+rMean/256)*dr*dr+4*dg*dg+(2+(255-rMean)/256)*db*db);
}
function dominantBorderColor(data,w,h){
  // Trova il colore dominante lungo tutto il bordo, non solo negli angoli.
  const bins=new Map(),step=Math.max(1,Math.floor(Math.min(w,h)/180));
  const add=(x,y)=>{const i=(y*w+x)*4;if(data[i+3]<20)return;const r=data[i],g=data[i+1],b=data[i+2];const key=`${r>>4},${g>>4},${b>>4}`;const v=bins.get(key)||{n:0,r:0,g:0,b:0};v.n++;v.r+=r;v.g+=g;v.b+=b;bins.set(key,v)};
  for(let x=0;x<w;x+=step){add(x,0);add(x,h-1)}
  for(let y=0;y<h;y+=step){add(0,y);add(w-1,y)}
  let best=null;for(const v of bins.values())if(!best||v.n>best.n)best=v;
  return best?[best.r/best.n,best.g/best.n,best.b/best.n,255]:[255,255,255,255];
}
function removeConnectedBackground(imageData,w,h,target,tolerance){
  const px=imageData.data,total=w*h,seen=new Uint8Array(total),queue=new Int32Array(total);let head=0,tail=0;
  // Tolleranza più controllabile e coerente: 8–100 diventa circa 20–150 percettivi.
  const hard=20+tolerance*1.30,soft=Math.max(8,hard*.42),local=Math.max(18,hard*.72);
  const enqueue=(p)=>{if(seen[p])return;const i=p*4;if(px[i+3]<4){seen[p]=1;return}const c=[px[i],px[i+1],px[i+2]];if(rgbDistance(c,target)<=hard){seen[p]=1;queue[tail++]=p}};
  for(let x=0;x<w;x++){enqueue(x);enqueue((h-1)*w+x)}
  for(let y=1;y<h-1;y++){enqueue(y*w);enqueue(y*w+w-1)}
  while(head<tail){const p=queue[head++],x=p%w,y=(p/w)|0,i=p*4,c=[px[i],px[i+1],px[i+2]];
    const d=rgbDistance(c,target);let a=d<=soft?0:Math.round(255*(d-soft)/(hard-soft));a=Math.min(a,px[i+3]);px[i+3]=a;
    // Elimina l'alone del colore di sfondo sui pixel semitrasparenti.
    if(a>0&&a<255){const k=a/255;px[i]=Math.max(0,Math.min(255,(px[i]-target[0]*(1-k))/k));px[i+1]=Math.max(0,Math.min(255,(px[i+1]-target[1]*(1-k))/k));px[i+2]=Math.max(0,Math.min(255,(px[i+2]-target[2]*(1-k))/k))}
    const visit=(n)=>{if(n<0||n>=total||seen[n])return;const ni=n*4,nc=[px[ni],px[ni+1],px[ni+2]];if(rgbDistance(nc,target)<=hard||rgbDistance(nc,c)<=local){seen[n]=1;queue[tail++]=n}};
    if(x>0)visit(p-1);if(x<w-1)visit(p+1);if(y>0)visit(p-w);if(y<h-1)visit(p+w);
  }
  return imageData;
}
function trimTransparentCanvas(source,pad=12){const c=document.createElement("canvas"),x=c.getContext("2d",{willReadFrequently:true});c.width=source.width;c.height=source.height;x.drawImage(source,0,0);const d=x.getImageData(0,0,c.width,c.height).data;let minX=c.width,minY=c.height,maxX=-1,maxY=-1;for(let yy=0;yy<c.height;yy++)for(let xx=0;xx<c.width;xx++){if(d[(yy*c.width+xx)*4+3]>10){minX=Math.min(minX,xx);minY=Math.min(minY,yy);maxX=Math.max(maxX,xx);maxY=Math.max(maxY,yy)}}if(maxX<0)return source;minX=Math.max(0,minX-pad);minY=Math.max(0,minY-pad);maxX=Math.min(c.width-1,maxX+pad);maxY=Math.min(c.height-1,maxY+pad);const out=document.createElement("canvas");out.width=maxX-minX+1;out.height=maxY-minY+1;out.getContext("2d").drawImage(c,minX,minY,out.width,out.height,0,0,out.width,out.height);return out}

function visibleAlphaRatio(canvas){
  const ctx=canvas.getContext("2d",{willReadFrequently:true});
  const data=ctx.getImageData(0,0,canvas.width,canvas.height).data;
  let visible=0,total=canvas.width*canvas.height;
  for(let i=3;i<data.length;i+=4)if(data[i]>18)visible++;
  return total?visible/total:0;
}
async function processLogo(removeBg=true,trim=true,slot=1){
  const isSecond=slot===2;
  const original=isSecond?currentLogo2Original:currentLogoOriginal;
  const current=isSecond?currentLogo2:currentLogo;
  if(!original&&!current){notify(isSecond?"Carica prima il secondo logo.":"Carica prima un logo.",true);return}
  const previous=current,src=original||current;
  const im=await imageFromDataUrl(src),max=2200,scale=Math.min(1,max/Math.max(im.width,im.height));
  const c=document.createElement("canvas"),ctx=c.getContext("2d",{willReadFrequently:true});
  c.width=Math.max(1,Math.round(im.width*scale));c.height=Math.max(1,Math.round(im.height*scale));
  ctx.clearRect(0,0,c.width,c.height);ctx.drawImage(im,0,0,c.width,c.height);
  const modeId=isSecond?"logo2BgMode":"logoBgMode",tolId=isSecond?"logo2Tolerance":"logoTolerance";
  if(removeBg&&$(modeId).value!=="none"){
    let img=ctx.getImageData(0,0,c.width,c.height);
    const mode=$(modeId).value,tol=Number($(tolId).value||42);
    const detected=dominantBorderColor(img.data,c.width,c.height);
    const target=mode==="white"?[255,255,255]:detected.slice(0,3);
    img=removeConnectedBackground(img,c.width,c.height,target,tol);
    ctx.clearRect(0,0,c.width,c.height);ctx.putImageData(img,0,0);
    if(visibleAlphaRatio(c)<0.015){
      if(isSecond)currentLogo2=previous||currentLogo2Original;else currentLogo=previous||currentLogoOriginal;
      applyMedia();await build(false);notify("Rimozione annullata: avrebbe eliminato quasi tutto il logo.",true);return;
    }
  }
  const result=(trim?trimTransparentCanvas(c,Math.max(10,Math.round(Math.min(c.width,c.height)*.022))):c).toDataURL("image/png");
  if(isSecond)currentLogo2=result;else currentLogo=result;
  applyMedia();await build(false);notify(removeBg?"Sfondo rimosso e logo PNG aggiornato.":"Logo ritagliato e inserito.");
}
function readImage(input,kind){
  const f=input.files?.[0];
  if(!f)return;
  if(f.size>8*1024*1024){notify("Immagine troppo grande: massimo 8 MB.",true);input.value="";return}
  if(!/^image\/(png|jpe?g|webp|svg\+xml)$/i.test(f.type)&&!/\.(png|jpe?g|webp|svg)$/i.test(f.name)){
    notify("Formato non supportato. Usa PNG, JPG, JPEG, WebP o SVG.",true);
    input.value="";
    return;
  }
  const r=new FileReader();
  r.onerror=()=>{notify("Impossibile leggere il file selezionato.",true);input.value=""};
  r.onload=async()=>{
    try{
      await imageFromDataUrl(r.result);
      if(kind==="image"){
        currentImage=r.result;
        notify("Immagine caricata.");
      }else if(kind==="logo2"){
        currentLogo2Original=r.result;
        currentLogo2=r.result;
        notify("Secondo logo caricato.");
      }else{
        currentLogoOriginal=r.result;
        currentLogo=r.result;
        notify("Logo caricato. Usa “Prepara PNG trasparente” solo quando vuoi rimuovere lo sfondo.");
      }
      applyMedia();
      await build(false);
    }catch{
      notify("Il file immagine non può essere elaborato dal browser.",true);
    }finally{
      input.value="";
    }
  };
  r.readAsDataURL(f);
}
async function copyText(t){try{await navigator.clipboard.writeText(t)}catch{const x=document.createElement("textarea");x.value=t;document.body.appendChild(x);x.select();document.execCommand("copy");x.remove()}notify("Testo copiato.")}
function allText(d){const p=promoPack(d);return`K9 NAPOLETANO ACADEMY

PROGETTO
${d.project}

FORMATO
${d.type}

SERVIZIO / DISCIPLINA
${d.discipline}

OBIETTIVO
${d.objective}

TONO
${d.tone}${d.tone2!=="Nessuno"?` + ${d.tone2} (${d.toneMix}/${100-d.toneMix})`:""}

TITOLO
${d.title}

SLOGAN
${d.slogan}

SOTTOTITOLO
${d.subtitle}

DESCRIZIONE
${d.details}

CALL TO ACTION
${d.contact}
${resolveCtaUrl(d)||"Solo grafica — nessun link attivo"}

POST SOCIAL
${p.social}

TESTO BREVE
${p.short}

WHATSAPP
${p.whatsapp}

ALTRI SLOGAN
• ${p.slogans}

HASHTAG
${p.hashtags}

MINI CAMPAGNA
${p.campaign}`}
function download(name,content,type){const b=new Blob([content],{type}),u=URL.createObjectURL(b),a=document.createElement("a");a.href=u;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(u),900)}
function getProjects(){
 try{const value=JSON.parse(localStorage.getItem(STORAGE_KEY)||"[]");return Array.isArray(value)?value:[]}
 catch(error){console.warn("Archivio progetti non leggibile",error);return[]}
}
function setProjects(v){
 try{localStorage.setItem(STORAGE_KEY,JSON.stringify(Array.isArray(v)?v:[]));renderSaved();return true}
 catch(error){console.error("Salvataggio archivio non riuscito",error);notify("Spazio di archiviazione esaurito: elimina progetti o immagini pesanti.",true);return false}
}
async function saveProject(){const d=await build(),l=getProjects(),i=l.findIndex(x=>x.project.toLowerCase()===d.project.toLowerCase());if(i>=0){d.id=l[i].id;l[i]=d}else l.unshift(d);setProjects(l.slice(0,30));notify("Progetto salvato.")}
function esc(v){return String(v||"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function renderSaved(){const l=getProjects();$("savedList").innerHTML=l.length?l.map(d=>`<div class="saved-item"><div><strong>${esc(d.project)}</strong><small>${esc(d.type)} · ${esc(d.discipline)}</small></div><div class="saved-actions"><button onclick="loadProject(${d.id})">Apri</button><button onclick="deleteProject(${d.id})">×</button></div></div>`).join(""):"<p style='color:var(--muted)'>Nessun progetto salvato.</p>"}
function loadProject(id){const d=getProjects().find(x=>x.id===id);if(!d)return;["project","type","discipline","objective","audience","tone","tone2","toneMix","style","styleMode","logoSize","logoScale","logo2Size","logo2Scale","logo2Position","logoBgMode","logoTolerance","logo2BgMode","logo2Tolerance","contentMode","sloganInput","subtitleInput","details","benefits","program","targetText","methodText","includedText","requirementsText","notesText","eventTime","eventSeats","eventPrice","eventPhone","contact","ctaType","ctaValue","ctaMessage","date","location"].forEach(k=>{if(d[k]!=null&&$(k))$(k).value=d[k]});$("titleInput").value=d.title||"";$("sloganInput").value=d.slogan||"";$("subtitleInput").value=d.subtitle||"";$("accentColor").value=d.accent||"#ff7a00";$("goldColor").value=d.gold||"#d8ab4d";currentImage=d.image||"";currentLogo=d.logo||"";currentLogoOriginal=d.logoOriginal||d.logo||"";currentLogo2=d.logo2||"";currentLogo2Original=d.logo2Original||d.logo2||"";extraLogos=Array.isArray(d.extraLogos)?d.extraLogos:[];if($("ctaPdfEnabled"))$("ctaPdfEnabled").checked=d.ctaPdfEnabled!==false;if($("ctaSocialEnabled"))$("ctaSocialEnabled").checked=d.ctaSocialEnabled!==false;updateCtaControls();if($("logoBgMode")&&d.logoBgMode)$("logoBgMode").value=d.logoBgMode;if($("logoScale")&&d.logoScale!=null){$("logoScale").value=d.logoScale;$("logoScaleValue").textContent=d.logoScale+"%"}if($("logo2Scale")&&d.logo2Scale!=null){$("logo2Scale").value=d.logo2Scale;$("logo2ScaleValue").textContent=d.logo2Scale+"%"}if($("logoTolerance")&&d.logoTolerance!=null){$("logoTolerance").value=d.logoTolerance;$("logoToleranceValue").textContent=d.logoTolerance}if($("logo2Tolerance")&&d.logo2Tolerance!=null){$("logo2Tolerance").value=d.logo2Tolerance;$("logo2ToleranceValue").textContent=d.logo2Tolerance}graphicVariant=normalizeGraphicVariant(d.type,d.graphicVariant??0);manualOffsets=normalizeOffsets(d.manualOffsets);elementScales=normalizeScales(d.elementScales);updatePreviewGraphicStatus();updateSelectedScaleControl();applyMedia();updateOffsetReadout();build();closeDrawer();notify("Progetto aperto.")}
function deleteProject(id){setProjects(getProjects().filter(x=>x.id!==id));notify("Progetto eliminato.")}
function openDrawer(){$("drawer").classList.add("open");renderSaved()}function closeDrawer(){$("drawer").classList.remove("open")}
function newProject(){if(!confirm("Creare un nuovo progetto?"))return;$("project").value="Nuovo progetto K9";$("type").value="Post Instagram quadrato";$("discipline").value="Mantrailing";$("objective").value="Promuovi servizio";$("audience").value="Proprietari di cani";$("tone").value="Professionale";$("tone2").value="Nessuno";$("toneMix").value=70;$("toneMixValue").textContent="70";$("style").value="Premium tattico";$("styleMode").value="auto";$("logoSize").value="auto";$("logoScale").value=100;$("logoScaleValue").textContent="100%";$("logo2Size").value="auto";$("logo2Scale").value=100;$("logo2ScaleValue").textContent="100%";$("logo2Position").value="tl";$("logoBgMode").value="auto";$("logoTolerance").value=42;$("logoToleranceValue").textContent="42";$("logo2BgMode").value="auto";$("logo2Tolerance").value=42;$("logo2ToleranceValue").textContent="42";$("contentMode").value="complete";$("titleInput").value="";$("sloganInput").value="";$("subtitleInput").value="";$("details").value="";$("benefits").value="";$("program").value="";$("targetText").value="";$("methodText").value="";$("includedText").value="";$("requirementsText").value="";$("notesText").value="";$("eventTime").value="";$("eventSeats").value="";$("eventPrice").value="";$("eventPhone").value="";$("contact").value="";$("ctaType").value="whatsapp";$("ctaValue").value="";$("ctaMessage").value="Ciao, vorrei ricevere informazioni su questo progetto.";$("ctaPdfEnabled").checked=true;$("ctaSocialEnabled").checked=true;updateCtaControls();$("location").value="";currentImage=currentLogo=currentLogoOriginal=currentLogo2=currentLogo2Original="";extraLogos=[];activeLogoKey="logo";graphicVariant=0;updatePreviewGraphicStatus();manualOffsets=normalizeOffsets();elementScales=normalizeScales();updateSelectedScaleControl();applyMedia();updateOffsetReadout();build(false);notify("Nuovo progetto pronto.")}
async function shareProject(){const d=await build(),text=allText(d);if(navigator.share){try{await navigator.share({title:d.project,text});return}catch(e){if(e.name==="AbortError")return}}copyText(text)}
function importProject(file){const r=new FileReader();r.onload=()=>{try{const d=JSON.parse(r.result);["project","type","discipline","objective","audience","tone","tone2","toneMix","style","styleMode","logoSize","logoScale","logo2Size","logo2Scale","logo2Position","logoBgMode","logoTolerance","logo2BgMode","logo2Tolerance","contentMode","sloganInput","subtitleInput","details","benefits","program","targetText","methodText","includedText","requirementsText","notesText","eventTime","eventSeats","eventPrice","eventPhone","contact","ctaType","ctaValue","ctaMessage","date","location"].forEach(k=>{if(d[k]!=null&&$(k))$(k).value=d[k]});$("titleInput").value=d.title||"";$("sloganInput").value=d.slogan||"";$("subtitleInput").value=d.subtitle||"";$("accentColor").value=d.accent||"#ff7a00";$("goldColor").value=d.gold||"#d8ab4d";currentImage=d.image||"";currentLogo=d.logo||"";currentLogoOriginal=d.logoOriginal||d.logo||"";currentLogo2=d.logo2||"";currentLogo2Original=d.logo2Original||d.logo2||"";extraLogos=Array.isArray(d.extraLogos)?d.extraLogos:[];if($("ctaPdfEnabled"))$("ctaPdfEnabled").checked=d.ctaPdfEnabled!==false;if($("ctaSocialEnabled"))$("ctaSocialEnabled").checked=d.ctaSocialEnabled!==false;updateCtaControls();if($("logoBgMode")&&d.logoBgMode)$("logoBgMode").value=d.logoBgMode;if($("logoScale")&&d.logoScale!=null){$("logoScale").value=d.logoScale;$("logoScaleValue").textContent=d.logoScale+"%"}if($("logo2Scale")&&d.logo2Scale!=null){$("logo2Scale").value=d.logo2Scale;$("logo2ScaleValue").textContent=d.logo2Scale+"%"}if($("logoTolerance")&&d.logoTolerance!=null){$("logoTolerance").value=d.logoTolerance;$("logoToleranceValue").textContent=d.logoTolerance}if($("logo2Tolerance")&&d.logo2Tolerance!=null){$("logo2Tolerance").value=d.logo2Tolerance;$("logo2ToleranceValue").textContent=d.logo2Tolerance}graphicVariant=normalizeGraphicVariant(d.type,d.graphicVariant??0);manualOffsets=normalizeOffsets(d.manualOffsets);elementScales=normalizeScales(d.elementScales);updatePreviewGraphicStatus();updateSelectedScaleControl();applyMedia();updateOffsetReadout();build();notify("Progetto importato.")}catch{notify("File JSON non valido.",true)}};r.readAsText(file)}
function exportValidationReport(d){
 const errors=[],warnings=[],family=window.K9TemplateEngine?.formatFamily?.(d.type)||(/orizzontale|16:9|facebook|banner/i.test(d.type)?"landscape":/quadrato/i.test(d.type)?"square":"portrait");
 const textFields=[d.title,d.slogan,d.subtitle,d.details,d.benefits,d.program,d.targetText,d.methodText,d.includedText,d.requirementsText,d.notesText].map(v=>String(v||"").trim());
 const total=textFields.reduce((n,v)=>n+v.length,0),limits={portrait:2300,square:1700,landscape:1900};
 if(!String(d.title||"").trim())errors.push("Inserisci il titolo della locandina.");
 if(String(d.title||"").trim().length>105)warnings.push("Il titolo è molto lungo e potrebbe risultare poco leggibile.");
 if(String(d.subtitle||d.slogan||"").trim().length>220)warnings.push("Sottotitolo o slogan troppo lungo.");
 if(total>limits[family])warnings.push("I contenuti sono molto estesi per il formato scelto: alcune sezioni potrebbero essere ridotte automaticamente.");
 if(!d.image)warnings.push("Non è stata inserita un’immagine principale.");
 if(!d.logo)warnings.push("Non è stato inserito il logo principale.");
 if(!String(d.contact||d.ctaValue||"").trim())warnings.push("Manca un contatto o una destinazione CTA.");
 return{errors,warnings,total,family};
}
function updateExportCheck(report){
 const el=$("exportCheckStatus");if(!el)return;
 if(report.errors.length){el.className="export-check is-error";el.textContent=`Esportazione bloccata: ${report.errors.join(" ")}`;return}
 if(report.warnings.length){el.className="export-check is-warning";el.textContent=`Controllo: ${report.warnings.join(" ")}`;return}
 el.className="export-check is-ok";el.textContent="Controllo completato: il progetto è pronto per l’esportazione.";
}
function allowExport(d){
 const report=exportValidationReport(d);updateExportCheck(report);
 if(report.errors.length){notify(report.errors[0],true);return false}
 if(report.warnings.length)return confirm(`Controllo prima dell’esportazione:\n\n• ${report.warnings.join("\n• ")}\n\nVuoi esportare comunque?`);
 return true;
}
let exportInProgress=false;
function setExportBusy(active,label="Esportazione in corso…"){
 exportInProgress=!!active;
 ["exportPng","exportJpg","exportWebp","exportPdf"].forEach(id=>{const el=$(id);if(el){el.disabled=exportInProgress;el.setAttribute("aria-busy",String(exportInProgress))}});
 const status=$("exportCheckStatus");
 if(active&&status){status.className="export-check is-warning";status.textContent=label}
}
function triggerBlobDownload(blob,filename,revokeDelay=4000){
 const u=URL.createObjectURL(blob),a=document.createElement("a");
 a.href=u;a.download=filename;a.rel="noopener";document.body.appendChild(a);a.click();a.remove();
 setTimeout(()=>URL.revokeObjectURL(u),revokeDelay);
}
async function canvasToBlob(canvas,mime,quality){
 return new Promise((resolve,reject)=>canvas.toBlob(blob=>blob?resolve(blob):reject(new Error("Il browser non ha generato il file.")),mime,quality));
}
async function exportImage(mime,ext,quality=1){
 if(exportInProgress)return notify("Attendi la fine dell’esportazione già avviata.",true);
 const d=projectData(false);if(!allowExport(d))return;
 setExportBusy(true,`${ext.toUpperCase()} in preparazione…`);
 try{
  const c=document.createElement("canvas");await renderDesign(c,d);
  const blob=await canvasToBlob(c,mime,quality);
  triggerBlobDownload(blob,`${safeName(d.project)}-${c.width}x${c.height}.${ext}`);
  updateExportCheck({errors:[],warnings:[]});
  notify(`${ext.toUpperCase()} esportato: identico all’anteprima.`);
 }catch(error){console.error("K9 export image error",error);notify("Esportazione non riuscita. Riprova dopo aver chiuso altre app aperte.",true)}
 finally{setExportBusy(false)}
}
function dataUrlBytes(dataUrl){const b64=dataUrl.split(",")[1],bin=atob(b64),out=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)out[i]=bin.charCodeAt(i);return out}
function asciiBytes(str){return new TextEncoder().encode(str)}
function concatBytes(parts){const total=parts.reduce((n,p)=>n+p.length,0),out=new Uint8Array(total);let off=0;for(const p of parts){out.set(p,off);off+=p.length}return out}
function pdfEscape(value){return String(value||"").replace(/\\/g,"\\\\").replace(/\(/g,"\\(").replace(/\)/g,"\\)")}
async function exportPdfDirect(){
 if(exportInProgress)return notify("Attendi la fine dell’esportazione già avviata.",true);
 const d=projectData(false);if(!allowExport(d))return;
 setExportBusy(true,"PDF in preparazione…");
 try{
 const c=document.createElement("canvas");await renderDesign(c,d);
 const jpeg=dataUrlBytes(c.toDataURL("image/jpeg",.96));
 const ratio=c.width/c.height;let pageW,pageH;if(ratio>1.15){pageW=842;pageH=Math.round(pageW/ratio)}else if(ratio<.87){pageH=842;pageW=Math.round(pageH*ratio)}else{pageW=720;pageH=Math.round(pageW/ratio)}
 const ctaUrl=d.ctaPdfEnabled?resolveCtaUrl(d):"",box=c._ctaBox;
 const hasLink=!!(ctaUrl&&box);
 const annotationRef=hasLink?" /Annots [6 0 R]":"";
 const content=`q\n${pageW} 0 0 ${pageH} 0 0 cm\n/Im0 Do\nQ\n`,contentBytes=asciiBytes(content);
 const objects=[];
 objects[1]=asciiBytes("<< /Type /Catalog /Pages 2 0 R >>");
 objects[2]=asciiBytes("<< /Type /Pages /Kids [3 0 R] /Count 1 >>");
 objects[3]=asciiBytes(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageW} ${pageH}] /Resources << /XObject << /Im0 4 0 R >> >> /Contents 5 0 R${annotationRef} >>`);
 objects[4]=concatBytes([asciiBytes(`<< /Type /XObject /Subtype /Image /Width ${c.width} /Height ${c.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpeg.length} >>\nstream\n`),jpeg,asciiBytes("\nendstream")]);
 objects[5]=concatBytes([asciiBytes(`<< /Length ${contentBytes.length} >>\nstream\n`),contentBytes,asciiBytes("endstream")]);
 if(hasLink){
  const x1=box.x/c.width*pageW,y1=pageH-(box.y+box.h)/c.height*pageH,x2=(box.x+box.w)/c.width*pageW,y2=pageH-box.y/c.height*pageH;
  objects[6]=asciiBytes(`<< /Type /Annot /Subtype /Link /Rect [${x1.toFixed(2)} ${y1.toFixed(2)} ${x2.toFixed(2)} ${y2.toFixed(2)}] /Border [0 0 0] /A << /S /URI /URI (${pdfEscape(ctaUrl)}) >> >>`);
 }
 const count=hasLink?6:5,parts=[asciiBytes("%PDF-1.4\n%\xE2\xE3\xCF\xD3\n")],offsets=[0];let pos=parts[0].length;
 for(let i=1;i<=count;i++){offsets[i]=pos;const head=asciiBytes(`${i} 0 obj\n`),tail=asciiBytes("\nendobj\n");parts.push(head,objects[i],tail);pos+=head.length+objects[i].length+tail.length}
 const xrefPos=pos;let xref=`xref\n0 ${count+1}\n0000000000 65535 f \n`;for(let i=1;i<=count;i++)xref+=String(offsets[i]).padStart(10,"0")+" 00000 n \n";xref+=`trailer\n<< /Size ${count+1} /Root 1 0 R >>\nstartxref\n${xrefPos}\n%%EOF`;
 parts.push(asciiBytes(xref));const pdf=concatBytes(parts),blob=new Blob([pdf],{type:"application/pdf"});
 triggerBlobDownload(blob,`${safeName(d.project)}-${c.width}x${c.height}.pdf`);
 updateExportCheck({errors:[],warnings:[]});
 notify(hasLink?"PDF generato con pulsante cliccabile.":"PDF generato direttamente dall’app.");
 }catch(error){console.error("K9 PDF export error",error);notify("Generazione PDF non riuscita. Riprova dopo aver chiuso altre app aperte.",true)}
 finally{setExportBusy(false)}
}

const SOCIAL_CHANNELS={
 facebook:{label:"Facebook",w:1200,h:630,formatKey:"Social Facebook",textType:"Post completo",ext:"png"},
 instagramFeed:{label:"Instagram Feed",w:1080,h:1350,formatKey:"Social Instagram Feed",textType:"Caption + hashtag",ext:"png"},
 instagramStory:{label:"Instagram Story",w:1080,h:1920,formatKey:"Social Instagram Story",textType:"Story breve",ext:"png"},
 whatsapp:{label:"WhatsApp",w:1080,h:1080,formatKey:"Social WhatsApp",textType:"Messaggio diretto",ext:"jpg"},
 telegram:{label:"Telegram",w:1080,h:1080,formatKey:"Social Telegram",textType:"Post canale",ext:"jpg"},
 linkedin:{label:"LinkedIn",w:1200,h:627,formatKey:"Social LinkedIn",textType:"Post professionale",ext:"png"},
 x:{label:"X",w:1600,h:900,formatKey:"Social X",textType:"Testo sintetico",ext:"jpg"},
 threads:{label:"Threads",w:1080,h:1350,formatKey:"Social Threads",textType:"Conversazionale",ext:"png"}
};
Object.values(SOCIAL_CHANNELS).forEach(c=>{formats[c.formatKey]={label:`${c.w} × ${c.h} px`,w:c.w,h:c.h}});
let socialCaptionTouched=false,socialPreviewTimer=0;
function socialCaptionFor(channel,d){
 const p=promoPack(d),dt=dateText(d.date),tags=p.hashtags,phone=d.eventPhone?`\n📞 ${d.eventPhone}`:"";
 const map={
  facebook:`${p.social}\n\n${tags}`,
  instagramFeed:`${d.title}\n\n${d.slogan}\n\n${d.details}\n\n📅 ${dt}\n📍 ${d.location}\n🎯 ${d.audience}${phone}\n\n${d.contact}\n\n${tags}`,
  instagramStory:`${d.title}\n${d.slogan}\n\n📅 ${dt}\n📍 ${d.location}\n\n${d.contact}`,
  whatsapp:`${p.whatsapp}${phone}`,
  telegram:`${d.title}\n\n${d.subtitle}\n\n${d.details}\n\n📅 ${dt}\n📍 ${d.location}${phone}\n\n${d.contact}\n\n${tags}`,
  linkedin:`${d.title}\n\n${d.details}\n\nIl percorso è rivolto a ${d.audience.toLowerCase()} e propone un lavoro dedicato a ${disciplines[d.discipline].desc}.\n\n📅 ${dt}\n📍 ${d.location}\n\n${d.contact}\n\n${tags.split(" ").slice(0,6).join(" ")}`,
  x:`${d.title}\n${d.slogan}\n📅 ${dt} · 📍 ${d.location}\n${d.contact}\n${tags.split(" ").slice(0,4).join(" ")}`,
  threads:`${d.title}\n\n${d.slogan}\n\n${d.details}\n\nCosa ne pensi? ${d.contact}\n\n${tags.split(" ").slice(0,8).join(" ")}`
 };
 const base=map[channel]||p.social,link=resolveCtaUrl(d);
 return d.ctaSocialEnabled&&link?`${base}\n\n🔗 Prenotazioni e informazioni: ${link}`:base;
}
async function makeSocialCanvas(channel){
 const cfg=SOCIAL_CHANNELS[channel]||SOCIAL_CHANNELS.facebook,d=projectData(false),socialData={...d,type:cfg.formatKey};
 const canvas=document.createElement("canvas");await renderDesign(canvas,socialData);return{canvas,cfg,d,socialData};
}
async function canvasBlob(canvas,type="image/png",quality=.95){return await new Promise(resolve=>canvas.toBlob(resolve,type,quality))}
async function updateSocialPublisher(forceText=false){
 if(!$('publishChannel')||!$('socialPreviewCanvas'))return;
 const channel=$('publishChannel').value,cfg=SOCIAL_CHANNELS[channel],d=projectData(false);
 $('publishChannelBadge').textContent=cfg.label;$('publishDimensions').textContent=`${cfg.w} × ${cfg.h}`;$('publishTextType').textContent=cfg.textType;$('publishFileType').textContent=cfg.ext.toUpperCase();
 if(forceText||!socialCaptionTouched)$('publishCaption').value=socialCaptionFor(channel,d);
 $('publishProgress').textContent='Preparazione anteprima…';
 clearTimeout(socialPreviewTimer);socialPreviewTimer=setTimeout(async()=>{try{const result=await makeSocialCanvas(channel),target=$('socialPreviewCanvas');target.width=result.canvas.width;target.height=result.canvas.height;target.getContext('2d').drawImage(result.canvas,0,0);$('publishProgress').textContent=`Pacchetto ${cfg.label} pronto: immagine e testo associato.`}catch(e){$('publishProgress').textContent='Impossibile generare l’anteprima social.'}},80);
}
async function copyCaptionSilently(text){try{await navigator.clipboard.writeText(text);return true}catch{try{const ta=document.createElement('textarea');ta.value=text;document.body.appendChild(ta);ta.select();document.execCommand('copy');ta.remove();return true}catch{return false}}}
async function shareSocialPackage(){
 const channel=$('publishChannel').value,cfg=SOCIAL_CHANNELS[channel],caption=$('publishCaption').value.trim(),result=await makeSocialCanvas(channel),mime=cfg.ext==='png'?'image/png':'image/jpeg',blob=await canvasBlob(result.canvas,mime,.96),file=new File([blob],`${safeName(result.d.project)}-${safeName(cfg.label)}.${cfg.ext}`,{type:mime});
 await copyCaptionSilently(caption);
 if(navigator.share){
  try{const payload={title:result.d.title,text:caption};if(!navigator.canShare||navigator.canShare({files:[file]}))payload.files=[file];await navigator.share(payload);notify(`Pacchetto ${cfg.label} inviato al pannello di condivisione.`);return}catch(e){if(e.name==='AbortError')return}
 }
 const u=URL.createObjectURL(blob),a=document.createElement('a');a.href=u;a.download=file.name;a.click();setTimeout(()=>URL.revokeObjectURL(u),1200);notify('Immagine scaricata e testo copiato. Apri il social e incolla il contenuto.')
}
async function downloadSocialImage(){const channel=$('publishChannel').value,cfg=SOCIAL_CHANNELS[channel],result=await makeSocialCanvas(channel),mime=cfg.ext==='png'?'image/png':'image/jpeg',blob=await canvasBlob(result.canvas,mime,.96),u=URL.createObjectURL(blob),a=document.createElement('a');a.href=u;a.download=`${safeName(result.d.project)}-${safeName(cfg.label)}.${cfg.ext}`;a.click();setTimeout(()=>URL.revokeObjectURL(u),1200);notify(`Locandina ${cfg.label} scaricata.`)}
async function downloadSocialPackage(){const channel=$('publishChannel').value,cfg=SOCIAL_CHANNELS[channel],d=projectData(false),caption=$('publishCaption').value.trim();await downloadSocialImage();download(`${safeName(d.project)}-${safeName(cfg.label)}-contenuto.txt`,`${cfg.label}\n${cfg.w} × ${cfg.h}\n\n${caption}`,'text/plain;charset=utf-8');notify(`Pacchetto ${cfg.label} scaricato: immagine + testo.`)}

function generateContent(part="all",force=false){
 const service=$("discipline").value,tone=$("tone").value,tone2=$("tone2").value,mix=Number($("toneMix").value||70),p=serviceProfile(service);
 const set=(id,value)=>{if($(id)&&value)$(id).value=value};
 if(part==="all"||part==="title")set("titleInput",randomItem(poolFor(service,"titles"),force?"":$("titleInput").value));
 if(part==="all"||part==="slogan")set("sloganInput",randomItem(poolFor(service,"slogans"),force?"":$("sloganInput").value));
 if(part==="all"||part==="subtitle")set("subtitleInput",randomItem(poolFor(service,"subtitles"),force?"":$("subtitleInput").value));
 if(part==="all"||part==="description")set("details",toneBlend(randomItem(poolFor(service,"descriptions"),force?"":$("details").value),tone,tone2,mix));
 if(part==="all"||part==="benefits")set("benefits",generatedFieldValues(service,"benefits").join("\n"));
 if(part==="all"||part==="program")set("program",generatedFieldValues(service,"program").join("\n"));
 if(part==="all"||part==="targets")set("targetText",generatedFieldValues(service,"targets").join("\n"));
 if(part==="all"||part==="method")set("methodText",generatedFieldValues(service,"method").join("\n"));
 if(part==="all"||part==="included")set("includedText",generatedFieldValues(service,"included").join("\n"));
 if(part==="all"||part==="requirements")set("requirementsText",generatedFieldValues(service,"requirements").join("\n"));
 if(part==="all"||part==="notes")set("notesText",generatedFieldValues(service,"notes").join("\n"));
 if(part==="all"||part==="cta")set("contact",randomItem(poolFor(service,"ctas"),force?"":$("contact").value));
 build(false)
}
function applyServiceDefaults(){
 const service=$("discipline").value,p=serviceProfile(service);
 $("project").value=service;
 if(styles[p.style])$("style").value=p.style;
 $("styleMode").value=p.styleMode||"auto";
 $("tone").value=p.tone||"Professionale";
 $("objective").value=p.objective||"Promuovi servizio";
 $("audience").value=p.audience||"Proprietari di cani";
 $("benefits").value=(p.benefits||[]).join("\n");
 $("program").value=(p.program||[]).join("\n");
 $("targetText").value=(p.targets||[]).join("\n");
 $("methodText").value=p.method||"";
 $("includedText").value=(p.included||[]).join("\n");
 $("requirementsText").value=(p.requirements||[]).join("\n");
 $("notesText").value=p.notes||"";
 $("eventTime").value=p.time||"Su appuntamento";
 $("eventSeats").value=p.seats||"Disponibilità limitata";
 $("eventPrice").value=p.price||"Contattaci";
 $("eventPhone").value=p.phone||"WhatsApp";
 const selectedStyle=styles[$("style").value]||styles["Premium tattico"];
 $("accentColor").value=selectedStyle.accent;
 $("goldColor").value=selectedStyle.gold;
 generateContent("all",true);
 notify("Progetto, contenuti e stile adattati a "+service+".");
}
$("selectedElementScale").addEventListener("input",()=>{const key=$("moveTarget").value;elementScales[key]=Number($("selectedElementScale").value)||100;updateSelectedScaleControl();build(false)});
function changeSelectedElementScale(delta){const key=$("moveTarget").value;elementScales[key]=Math.max(40,Math.min(200,(elementScales[key]||100)+delta));updateSelectedScaleControl();build(false)}
$("selectedElementSmaller").addEventListener("click",()=>changeSelectedElementScale(-5));
$("selectedElementLarger").addEventListener("click",()=>changeSelectedElementScale(5));
$("lockPreviewTheme")?.addEventListener("change",()=>{if($("lockPreviewTheme").checked)$("autoPreviewTheme").checked=false;updatePreviewThemeStatus()});
$("autoPreviewTheme")?.addEventListener("change",()=>{if($("autoPreviewTheme").checked)$("lockPreviewTheme").checked=false;applyFormatAdaptiveScale($("type").value,true);build(false)});
$("style")?.addEventListener("change",()=>{updatePreviewThemeStatus();build(false)});
$("retryRender")?.addEventListener("click",()=>build(false));
$("previousGraphic")?.addEventListener("click",()=>cycleGraphic(-1));
$("nextGraphic")?.addEventListener("click",()=>cycleGraphic(1));
$("previousTheme")?.addEventListener("click",()=>cycleTheme(-1));
$("nextTheme")?.addEventListener("click",()=>cycleTheme(1));
document.querySelectorAll("[data-move]").forEach(btn=>btn.addEventListener("click",()=>{const key=$("moveTarget").value,step=Math.max(1,Number($("moveStep")?.value)||5);if(!manualOffsets[key])manualOffsets[key]={x:0,y:0};const o=manualOffsets[key],dir=btn.dataset.move;if(dir==="left")o.x-=step;if(dir==="right")o.x+=step;if(dir==="up")o.y-=step;if(dir==="down")o.y+=step;o.x=clamp(o.x,-1080,1080);o.y=clamp(o.y,-1080,1080);updateOffsetReadout();updateSelectedScaleControl();build(false)}));
$("moveTarget").addEventListener("change",()=>{const key=$("moveTarget").value;if(key.startsWith("logo")){activeLogoKey=key;updateLogoManager()}updateOffsetReadout();updateSelectedScaleControl()});$("resetCurrentPosition").onclick=()=>resetOffsets($("moveTarget").value);$("resetAllPositions").onclick=()=>resetOffsets();$("autoFitLayout").onclick=()=>{applyFormatAdaptiveScale($("type").value,false);build(false);notify("Testi e grafica riadattati automaticamente al formato.")};

$("multiLogoUpload")?.addEventListener("change",async e=>{await addMultipleLogos(e.target.files);e.target.value=""});
$("activeLogoSelect")?.addEventListener("change",()=>{activeLogoKey=$("activeLogoSelect").value;if($("moveTarget"))$("moveTarget").value=activeLogoKey;updateLogoManager();build(false)});
$("activeLogoScale")?.addEventListener("input",()=>{if(!activeLogoKey)return;elementScales[activeLogoKey]=Number($("activeLogoScale").value)||100;$("activeLogoScaleValue").textContent=elementScales[activeLogoKey];updateSelectedScaleControl();build(false)});
$("activeLogoPosition")?.addEventListener("change",()=>{const slot=logoSlotByKey(activeLogoKey);if(activeLogoKey==="logo2")$("logo2Position").value=$("activeLogoPosition").value;else if(slot&&activeLogoKey!=="logo")slot.pos=$("activeLogoPosition").value;manualOffsets[activeLogoKey]={x:0,y:0};build(false)});
$("activeLogoName")?.addEventListener("input",()=>{const slot=logoSlotByKey(activeLogoKey);if(slot&&activeLogoKey!=="logo"&&activeLogoKey!=="logo2")slot.name=$("activeLogoName").value;updateLogoManager()});
$("removeActiveLogo")?.addEventListener("click",removeActiveLogo);
$("prepareActiveLogo")?.addEventListener("click",()=>processActiveLogo(true,true));
$("trimActiveLogo")?.addEventListener("click",()=>processActiveLogo(false,true));
$("restoreActiveLogo")?.addEventListener("click",()=>{const slot=logoSlotByKey(activeLogoKey);if(!slot?.original)return;setLogoSlotData(activeLogoKey,slot.original,slot.original);updateLogoManager();build(false)});
$("downloadActiveLogo")?.addEventListener("click",()=>{const slot=logoSlotByKey(activeLogoKey);if(!slot?.data)return;const a=document.createElement("a");a.href=slot.data;a.download=`${safeName(slot.name||activeLogoKey)}.png`;a.click()});
$("centerActiveLogo")?.addEventListener("click",()=>{if(!activeLogoKey)return;manualOffsets[activeLogoKey]={x:0,y:0};const slot=logoSlotByKey(activeLogoKey);if(slot&&activeLogoKey!=="logo")slot.pos="tc";updateLogoManager();build(false)});

$("applyServiceProfile").onclick=applyServiceDefaults;$("generate").onclick=()=>{generateContent("all",true);notify("Progetto e contenuti rigenerati.")};$("regenAllContent").onclick=()=>generateContent("all",true);$("completeAllContent").onclick=()=>{generateContent("all",true);notify("Tutti i campi sono stati completati e ampliati.")};$("regenTitle").onclick=()=>generateContent("title");$("regenSlogan").onclick=()=>generateContent("slogan");$("regenSubtitle").onclick=()=>generateContent("subtitle");$("regenDescription").onclick=()=>generateContent("description");$("regenBenefits").onclick=()=>generateContent("benefits");$("regenProgram").onclick=()=>generateContent("program");$("regenTargets").onclick=()=>generateContent("targets");$("regenMethod").onclick=()=>generateContent("method");$("regenIncluded").onclick=()=>generateContent("included");$("regenRequirements").onclick=()=>generateContent("requirements");$("regenNotes").onclick=()=>generateContent("notes");$("regenCta").onclick=()=>generateContent("cta");$("saveProject").onclick=saveProject;$("newBtn").onclick=newProject;$("savedBtn").onclick=openDrawer;$("closeDrawer").onclick=closeDrawer;$("drawerBack").onclick=closeDrawer;$("clearAll").onclick=()=>{if(confirm("Cancellare tutti i progetti salvati?")){localStorage.removeItem(STORAGE_KEY);renderSaved();notify("Archivio cancellato.")}};$("shareProject").onclick=shareProject;$("downloadTxt").onclick=async()=>{const d=await build();download(`${safeName(d.project)}-pacchetto-promozionale.txt`,allText(d),"text/plain;charset=utf-8")};$("exportPng").onclick=()=>exportImage("image/png","png",1);$("exportJpg").onclick=()=>exportImage("image/jpeg","jpg",.95);$("exportWebp").onclick=()=>exportImage("image/webp","webp",.96);$("exportPdf").onclick=exportPdfDirect;$("downloadJson").onclick=async()=>{const d=await build();download(`${safeName(d.project)}.json`,JSON.stringify(d,null,2),"application/json")};$("importJsonBtn").onclick=()=>$("importJson").click();$("importJson").onchange=e=>{if(e.target.files[0])importProject(e.target.files[0]);e.target.value=""};$("prepareLogoPng").onclick=()=>processLogo(true,true,1);$("trimLogo").onclick=()=>processLogo(false,true,1);$("restoreLogo").onclick=()=>{if(!currentLogoOriginal)return notify("Nessun logo originale disponibile.",true);currentLogo=currentLogoOriginal;applyMedia();build(false);notify("Logo originale ripristinato.")};$("downloadLogoPng").onclick=()=>{if(!currentLogo)return notify("Carica prima un logo.",true);const a=document.createElement("a");a.href=currentLogo;a.download=`${safeName($("project").value||"logo-k9")}-logo.png`;a.click();notify("Logo PNG scaricato.")};$("prepareLogo2Png").onclick=()=>processLogo(true,true,2);$("trimLogo2").onclick=()=>processLogo(false,true,2);$("restoreLogo2").onclick=()=>{if(!currentLogo2Original)return notify("Nessun secondo logo originale disponibile.",true);currentLogo2=currentLogo2Original;applyMedia();build(false);notify("Secondo logo originale ripristinato.")};$("downloadLogo2Png").onclick=()=>{if(!currentLogo2)return notify("Carica prima il secondo logo.",true);const a=document.createElement("a");a.href=currentLogo2;a.download=`${safeName($("project").value||"logo-k9")}-logo-2.png`;a.click();notify("Secondo logo PNG scaricato.")};$("logo2Tolerance").addEventListener("input",()=>{$("logo2ToleranceValue").textContent=$("logo2Tolerance").value});$("logoTolerance").addEventListener("input",()=>{$("logoToleranceValue").textContent=$("logoTolerance").value});$("imageUpload").onchange=e=>readImage(e.target,"image");$("logoUpload").onchange=e=>readImage(e.target,"logo");$("logo2Upload").onchange=e=>readImage(e.target,"logo2");document.querySelectorAll(".copy").forEach(b=>b.onclick=()=>copyText($(b.dataset.copy).textContent));["project","objective","audience","tone","tone2","style","styleMode","logoSize","logoScale","logo2Size","logo2Scale","logo2Position","logoBgMode","logoTolerance","logo2BgMode","logo2Tolerance","contentMode","titleInput","sloganInput","subtitleInput","details","benefits","program","targetText","methodText","includedText","requirementsText","notesText","eventTime","eventSeats","eventPrice","eventPhone","contact","ctaValue","ctaMessage","ctaPdfEnabled","ctaSocialEnabled","date","location","accentColor","goldColor"].forEach(id=>{const el=$(id);if(!el)return;el.addEventListener("input",()=>build(false));el.addEventListener("change",()=>build(false))});
let logoDragFrame=0,lastCanvasDragRender=0;
function selectedDragLogo(){return activeLogoKey||$("moveTarget")?.value||"logo"}
function selectManualLogo(key){
 selectedCanvasElement=key;
 const radio=$(key==="logo"?"dragLogo1":"dragLogo2");
 if(radio)radio.checked=true;
 if($("moveTarget"))$("moveTarget").value=key;
 updateOffsetReadout();updateSelectedScaleControl();build(false);
}
function canvasPointFromEvent(canvas,event){
 const rect=canvas.getBoundingClientRect();
 return{x:(event.clientX-rect.left)*canvas.width/rect.width,y:(event.clientY-rect.top)*canvas.height/rect.height};
}
function hitCanvasElement(canvas,p){
 const boxes=canvas?._elementBoxes||{};
 const priority={logo:1,logo2:1,logo3:1,logo4:1,logo5:1,logo6:1,logo7:1,logo8:1,cta:2,title:3,subtitle:4,badge:5,footer:6,details:7};
 return Object.entries(boxes)
  .filter(([,b])=>b&&p.x>=b.x&&p.x<=b.x+b.w&&p.y>=b.y&&p.y<=b.y+b.h)
  .sort(([ka,a],[kb,b])=>((a.w*a.h)-(b.w*b.h))||((priority[ka]||99)-(priority[kb]||99)))
  .map(([key])=>key)[0]||null;
}
function drawCanvasSelection(canvas){
 if(!canvas||!selectedCanvasElement)return;
 const box=canvas._elementBoxes?.[selectedCanvasElement];if(!box)return;
 const ctx=canvas.getContext("2d");ctx.save();ctx.strokeStyle="#19b8ff";ctx.lineWidth=Math.max(3,Math.min(canvas.width,canvas.height)*.004);ctx.setLineDash([12,8]);ctx.strokeRect(box.x,box.y,box.w,box.h);ctx.setLineDash([]);ctx.fillStyle="#19b8ff";const r=Math.max(6,Math.min(canvas.width,canvas.height)*.008);ctx.beginPath();ctx.arc(box.x+box.w,box.y,r,0,Math.PI*2);ctx.fill();ctx.restore();
}
function beginCanvasDrag(event){
 if(!$("freeLogoDragEnabled")?.checked)return;
 const canvas=$("previewCanvas");if(!canvas)return;
 const p=canvasPointFromEvent(canvas,event),key=hitCanvasElement(canvas,p);if(!key)return;
 selectedCanvasElement=key;activeLogoKey=key.startsWith("logo")?key:activeLogoKey;
 if($("moveTarget"))$("moveTarget").value=key;
 updateOffsetReadout();updateSelectedScaleControl();
 activeCanvasDrag={key,startX:p.x,startY:p.y,offsetX:manualOffsets[key]?.x||0,offsetY:manualOffsets[key]?.y||0,pointerId:event.pointerId};
 canvasDragMoved=false;canvas.setPointerCapture?.(event.pointerId);event.preventDefault();
}
function moveCanvasDrag(event){
 if(!activeCanvasDrag)return;
 const canvas=$("previewCanvas"),p=canvasPointFromEvent(canvas,event),factor=1080/Math.min(canvas.width,canvas.height);
 const dx=p.x-activeCanvasDrag.startX,dy=p.y-activeCanvasDrag.startY;if(Math.abs(dx)+Math.abs(dy)>3)canvasDragMoved=true;
 const o=manualOffsets[activeCanvasDrag.key]||(manualOffsets[activeCanvasDrag.key]={x:0,y:0});
 o.x=clamp(activeCanvasDrag.offsetX+dx*factor,-1080,1080);o.y=clamp(activeCanvasDrag.offsetY+dy*factor,-1080,1080);
 updateOffsetReadout();const now=performance.now();
 if(!logoDragFrame&&now-lastCanvasDragRender>34){logoDragFrame=requestAnimationFrame(()=>{logoDragFrame=0;lastCanvasDragRender=performance.now();build(false)});}
 event.preventDefault();
}
function endCanvasDrag(event){
 if(!activeCanvasDrag)return;
 $("previewCanvas")?.releasePointerCapture?.(activeCanvasDrag.pointerId);
 activeCanvasDrag=null;
 if(logoDragFrame){cancelAnimationFrame(logoDragFrame);logoDragFrame=0;}
 build(false);
}
const preview=$("previewCanvas");
preview?.addEventListener("pointerdown",beginCanvasDrag);
preview?.addEventListener("pointermove",moveCanvasDrag);
preview?.addEventListener("pointerup",endCanvasDrag);
preview?.addEventListener("pointercancel",endCanvasDrag);
$("dragLogo1")?.addEventListener("change",()=>selectManualLogo("logo"));
$("dragLogo2")?.addEventListener("change",()=>selectManualLogo("logo2"));
$("moveTarget")?.addEventListener("change",()=>{selectedCanvasElement=$("moveTarget").value;updateOffsetReadout();updateSelectedScaleControl();build(false)});


$("ctaType").addEventListener("change",()=>{updateCtaControls();build(false)});
$("testCta").addEventListener("click",openCtaLink);
$("copyCtaLink").addEventListener("click",()=>{const url=resolveCtaUrl(projectData(false));if(!url)return notify("Configura prima un collegamento valido.",true);copyText(url)});
$("previewCanvas").addEventListener("click",e=>{if(canvasDragMoved){canvasDragMoved=false;return}if($("freeLogoDragEnabled")?.checked)return;const c=e.currentTarget,b=c._ctaBox;if(!b||!b.url)return;const r=c.getBoundingClientRect(),x=(e.clientX-r.left)*c.width/r.width,y=(e.clientY-r.top)*c.height/r.height;if(x>=b.x&&x<=b.x+b.w&&y>=b.y&&y<=b.y+b.h)window.open(b.url,"_blank","noopener,noreferrer")});
$("previewCanvas").addEventListener("mousemove",e=>{const c=e.currentTarget,b=c._ctaBox;if(!b||!b.url){c.style.cursor="default";return}const r=c.getBoundingClientRect(),x=(e.clientX-r.left)*c.width/r.width,y=(e.clientY-r.top)*c.height/r.height;c.style.cursor=(x>=b.x&&x<=b.x+b.w&&y>=b.y&&y<=b.y+b.h)?"pointer":"default"});
$("type").addEventListener("change",()=>{graphicVariant=normalizeGraphicVariant($("type").value,graphicVariant);updatePreviewGraphicStatus();applyFormatAdaptiveScale($("type").value,true);build(false)});$("discipline")?.addEventListener("change",()=>{applyFormatAdaptiveScale($("type").value,false);build(false)});$("discipline").addEventListener("change",applyServiceDefaults);$("toneMix").addEventListener("input",()=>{$("toneMixValue").textContent=$("toneMix").value;build(false)});

if($("publishChannel")){$("publishChannel").addEventListener("change",()=>{socialCaptionTouched=false;updateSocialPublisher(true)});$("publishCaption").addEventListener("input",()=>{socialCaptionTouched=true});$("shareSocialPackage").addEventListener("click",shareSocialPackage);$("copySocialCaption").addEventListener("click",()=>copyText($("publishCaption").value));$("downloadSocialImage").addEventListener("click",downloadSocialImage);$("downloadSocialPackage").addEventListener("click",downloadSocialPackage);document.querySelectorAll(".platformQuick").forEach(btn=>btn.addEventListener("click",()=>{$("publishChannel").value=btn.dataset.channel;socialCaptionTouched=false;updateSocialPublisher(true);document.querySelectorAll(".platformQuick").forEach(x=>x.classList.toggle("primary",x===btn))}))}

function activateTab(name){document.querySelectorAll(".studio-tab").forEach(btn=>btn.classList.toggle("active",btn.dataset.tab===name));document.querySelectorAll(".tab-panel").forEach(panel=>panel.classList.toggle("active",panel.dataset.panel===name));if(name==="graphics")setTimeout(()=>build(false),20);if(name==="social")setTimeout(()=>updateSocialPublisher(!socialCaptionTouched),30);window.scrollTo({top:document.querySelector(".studio-tabs").offsetTop-8,behavior:"smooth"})}
document.querySelectorAll(".studio-tab").forEach(btn=>btn.addEventListener("click",()=>activateTab(btn.dataset.tab)));
$("socialRefresh").addEventListener("click",()=>{socialCaptionTouched=false;generateContent("all",true);setTimeout(()=>updateSocialPublisher(true),40);notify("Pacchetto social rigenerato.")});
renderSaved();updateLogoManager();applyMedia();applyFormatAdaptiveScale($("type").value,false);updateOffsetReadout();updateSelectedScaleControl();updateCtaControls();updatePreviewGraphicStatus();updatePreviewThemeStatus();activateTab("graphics");build(false);
