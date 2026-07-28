# Audit grafica — K9 Creative Studio 3.1.0

Base verificata: `k9-creative-studio-main (14).zip`.

## Correzioni applicate

- Formati principali limitati a **Locandina A4 verticale** e **Locandina A4 orizzontale**, entrambi a 300 DPI.
- Normalizzazione automatica dei progetti precedenti: qualunque vecchio formato non A4 viene aperto in A4 verticale; A4 orizzontale resta invariato.
- Ripristinata la scheda **Social** e reso nuovamente visibile il comando **Condividi testi**.
- Rifatto il pannello contenuti nel Canvas per i due formati A4:
  - usa i testi effettivamente compilati;
  - conserva le righe separate;
  - evita abbreviazioni e frasi aggiunte dal renderer;
  - dispone i contenuti su due colonne in verticale e una colonna in orizzontale;
  - calcola automaticamente corpo, interlinea e altezza dei blocchi;
  - usa un pannello ad alto contrasto indipendente dal modello scelto.
- Corretto il fallback del renderer: non tenta più di usare il formato Instagram rimosso.
- Aggiornato il versionamento di HTML, JavaScript, CSS e cache PWA alla versione 3.1.0.
- Migliorata l'altezza massima dell'anteprima su smartphone e desktop.

## Controlli statici eseguiti

- Sintassi verificata su tutti i file JavaScript con `node --check`.
- Nessun ID HTML duplicato.
- Tutti i 70 pulsanti visibili con ID risultano richiamati nel codice JavaScript.
- Verificata la presenza dei pannelli Grafica, Testi, Social ed Esporta.

## File da sostituire

- `index.html`
- `js/app.js`
- `css/ui-2.css`
- `sw.js`

## File da aggiungere

- `AUDIT-GRAFICA-3.1.0.md`
