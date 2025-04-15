// Versão simplificada do main.tsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Assegurando que o elemento root existe
const rootElement = document.getElementById("root");
if (!rootElement) {
  // Criar elemento root se não existir
  const newRoot = document.createElement("div");
  newRoot.id = "root";
  document.body.appendChild(newRoot);
  console.log("Elemento root criado dinamicamente");
}

// Renderizar aplicação no modo estrito para detectar problemas
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
