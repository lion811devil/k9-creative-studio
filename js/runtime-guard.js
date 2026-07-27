window.__K9_ERRORS = window.__K9_ERRORS || [];

(() => {
  const MAX_ERRORS = 20;
  const remember = (type, detail) => {
    const item = { type, detail: String(detail || "Errore sconosciuto"), at: new Date().toISOString() };
    window.__K9_ERRORS.push(item);
    if (window.__K9_ERRORS.length > MAX_ERRORS) window.__K9_ERRORS.splice(0, window.__K9_ERRORS.length - MAX_ERRORS);
  };

  const showSafeMessage = message => {
    if (typeof window.notify === "function") window.notify(message, true);
    else console.warn(message);
  };

  window.addEventListener("error", event => {
    const detail = event.error?.message || event.message;
    remember("error", detail);
    console.error("K9 runtime error:", event.error || event.message);
    // Il renderer gestisce autonomamente i propri errori. Qui non si sovrascrive
    // più il canvas per errori secondari dell'interfaccia o dei moduli opzionali.
    showSafeMessage("Si è verificato un errore. Il progetto è rimasto memorizzato nel browser.");
  });

  window.addEventListener("unhandledrejection", event => {
    const detail = event.reason?.message || event.reason;
    remember("promise", detail);
    console.error("K9 promise error:", event.reason);
    showSafeMessage("Operazione non completata. Riprova tra qualche secondo.");
  });

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
    showSafeMessage(isIOS
      ? 'Su iPhone o iPad: apri il menu Condividi di Safari e scegli “Aggiungi alla schermata Home”.'
      : 'Apri il menu del browser e scegli “Installa app” oppure “Aggiungi a schermata Home”.');
  }

  window.addEventListener("beforeinstallprompt", event => {
    event.preventDefault();
    deferredInstallPrompt = event;
    if (!isStandalone) setInstallVisible(true);
  });

  window.addEventListener("appinstalled", () => {
    deferredInstallPrompt = null;
    setInstallVisible(false);
    if (typeof window.notify === "function") window.notify("K9 Creative Studio installato correttamente.");
  });

  installTop?.addEventListener("click", requestInstall);
  installFab?.addEventListener("click", requestInstall);

  if ("serviceWorker" in navigator) {
    window.addEventListener("load", async () => {
      try {
        const registration = await navigator.serviceWorker.register("./sw.js", { scope: "./", updateViaCache: "none" });
        registration.update().catch(() => {});
        if (registration.waiting) updateToast?.classList.add("show");

        registration.addEventListener("updatefound", () => {
          const worker = registration.installing;
          if (!worker) return;
          worker.addEventListener("statechange", () => {
            if (worker.state === "installed" && navigator.serviceWorker.controller) updateToast?.classList.add("show");
          });
        });

        applyUpdate?.addEventListener("click", () => registration.waiting?.postMessage({ type: "SKIP_WAITING" }));

        let reloading = false;
        navigator.serviceWorker.addEventListener("controllerchange", () => {
          if (reloading) return;
          reloading = true;
          window.location.reload();
        });
      } catch (error) {
        remember("service-worker", error?.message || error);
        console.error("Registrazione Service Worker non riuscita:", error);
      }
    });
  }

  if (!isStandalone && /iphone|ipad|ipod/i.test(navigator.userAgent)) setTimeout(() => setInstallVisible(true), 1200);
})();
