import { createRoot } from "react-dom/client";
import ErrorBoundary from "./components/ErrorBoundary.tsx";
import "./index.css";

// Lazy import App to gracefully handle env loading issues
const init = async () => {
  try {
    const { default: App } = await import("./App.tsx");
    createRoot(document.getElementById("root")!).render(
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    );
  } catch (e) {
    console.error("App init failed:", e);
    const root = document.getElementById("root");
    if (root) {
      root.innerHTML = `
        <div style="min-height:100vh;display:flex;align-items:center;justify-content:center;font-family:sans-serif;text-align:center;padding:2rem">
          <div>
            <h1 style="font-size:1.5rem;margin-bottom:1rem">Загрузка...</h1>
            <p style="color:#888;margin-bottom:1.5rem">Если страница не загружается, попробуйте обновить.</p>
            <button onclick="location.reload()" style="padding:0.5rem 1.5rem;background:#333;color:#fff;border:none;cursor:pointer">Обновить</button>
          </div>
        </div>`;
    }
  }
};

init();
