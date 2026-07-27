# K9 Creative Studio 7.2.1 — Ripristino anteprima

## Correzione principale

- Ripristinata la copia del rendering dal canvas temporaneo al canvas visibile.
- Eliminato il doppio incremento di `renderToken` tra `build()` e `renderDesignV4()`.
- Il controllo anti-rendering obsoleto resta centralizzato in `build()`.
- Cambio tema, composizione e formato tornano ad aggiornare l’anteprima.
- Cache PWA aggiornata a `k9-creative-studio-v7.2.1`.

## Causa tecnica

`build()` incrementava `renderToken`, poi `renderDesignV4()` lo incrementava una seconda volta. Al rientro dal renderer, `build()` considerava sempre il risultato obsoleto e terminava prima di copiarlo nel canvas visibile.
