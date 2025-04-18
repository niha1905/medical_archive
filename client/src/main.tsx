import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

document.title = "MediRec - Medical Records Manager";

// Create a meta description element
const metaDescription = document.createElement('meta');
metaDescription.name = 'description';
metaDescription.content = 'MediRec - Securely manage and share your medical records with medical professionals.';
document.head.appendChild(metaDescription);

// Create a favicon link
const favicon = document.createElement('link');
favicon.rel = 'icon';
favicon.href = 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🏥</text></svg>';
document.head.appendChild(favicon);

createRoot(document.getElementById("root")!).render(<App />);
