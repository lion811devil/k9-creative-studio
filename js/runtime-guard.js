window.addEventListener("error",event=>{
 console.error("K9 runtime error:",event.error||event.message);
 const canvas=$("previewCanvas");
 if(canvas){const ctx=canvas.getContext("2d");ctx.save();ctx.fillStyle="#111820";ctx.fillRect(0,0,canvas.width||1080,canvas.height||1080);ctx.fillStyle="#ffb15c";ctx.font="700 42px Arial";ctx.fillText("Anteprima temporaneamente non disponibile",55,100);ctx.fillStyle="#f2f4f6";ctx.font="28px Arial";ctx.fillText("Ricarica l’app o ripristina il progetto.",55,155);ctx.restore()}
 if(typeof notify==="function")notify("Errore nel rendering: l’app ha mantenuto i dati del progetto.",true);
});
window.addEventListener("unhandledrejection",event=>console.error("K9 promise error:",event.reason));

(() => {
  let deferredInstallPrompt = null;
  const installTop = document.getElementById("installPwaBtn");
  const installFab = document.getElementById("installPwaFab");
  const updateToast = document.getElementById("pwaUpdateToast");
  const applyUpdate = document.getElementById("applyPwaUpdate");
  const isStandalone = window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;

  const setInstallVisible = visible => {
    if (installTop) installTop.classList.toggle("hidden", !visible);
    if (installFab) installFab.classList.toggle("hidden", !visible);
  };

  async function requestInstall() {
    if (deferredInstallPrompt) {
      deferredInstallPrompt.prompt();
      try { await deferredInstallPrompt.userChoice; } catch (_) {}
      deferredInstallPrompt = null;
      setInstallVisible(false);
      return;
    }
    const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
    const message = isIOS
      ? 'Su iPhone o iPad: apri il menu Condividi di Safari e scegli “Aggiungi alla schermata Home”.'
      : 'Apri il menu del browser e scegli “Installa app” oppure “Aggiungi a schermata Home”.';
    if (typeof notify === "function") notify(message);
    else alert(message);
  }

  window.addEventListener("beforeinstallprompt", event => {
    event.preventDefault();
    deferredInstallPrompt = event;
    if (!isStandalone) setInstallVisible(true);
  });

  window.addEventListener("appinstalled", () => {
    deferredInstallPrompt = null;
    setInstallVisible(false);
    if (typeof notify === "function") notify("K9 Creative Studio installato correttamente.");
  });

  installTop?.addEventListener("click", requestInstall);
  installFab?.addEventListener("click", requestInstall);

  if ("serviceWorker" in navigator) {
    window.addEventListener("load", async () => {
      try {
        const registration = await navigator.serviceWorker.register("./sw.js", { scope: "./" });

        if (registration.waiting) updateToast?.classList.add("show");

        registration.addEventListener("updatefound", () => {
          const worker = registration.installing;
          if (!worker) return;
          worker.addEventListener("statechange", () => {
            if (worker.state === "installed" && navigator.serviceWorker.controller) {
              updateToast?.classList.add("show");
            }
          });
        });

        applyUpdate?.addEventListener("click", () => {
          registration.waiting?.postMessage({ type: "SKIP_WAITING" });
        });

        let reloading = false;
        navigator.serviceWorker.addEventListener("controllerchange", () => {
          if (reloading) return;
          reloading = true;
          window.location.reload();
        });
      } catch (error) {
        console.error("Registrazione Service Worker non riuscita:", error);
      }
    });
  }

  if (!isStandalone && /iphone|ipad|ipod/i.test(navigator.userAgent)) {
    setTimeout(() => setInstallVisible(true), 1200);
  }
})();
