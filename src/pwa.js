export function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) return;

  window.addEventListener(
    "load",
    () => {
      navigator.serviceWorker.register("./service-worker.js").catch((error) => {
        console.warn("WebCrunch could not enable offline support.", error);
      });
    },
    { once: true },
  );
}
