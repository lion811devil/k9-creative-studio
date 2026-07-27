# K9 Creative Studio 7.1 — Stabilità e prestazioni

## Modifiche

- Rendering dell'anteprima eseguito su canvas fuori schermo e pubblicato solo se è ancora il rendering più recente.
- Eliminato il rischio che una modifica precedente e più lenta sovrascriva l'anteprima aggiornata.
- Conservata l'area CTA cliccabile dopo il trasferimento dal canvas di staging.
- Gestione più robusta dell'archivio locale: dati non validi non bloccano l'app.
- Messaggio esplicito quando lo spazio locale del browser è esaurito.
- Rimossi listener globali duplicati per errori e Promise rifiutate; la responsabilità resta a `runtime-guard.js`.
- Service Worker aggiornato con installazione resiliente, pulizia selettiva delle vecchie cache, navigazione network-first e asset stale-while-revalidate.
- Versione interfaccia e cache aggiornata a 7.1.0.
