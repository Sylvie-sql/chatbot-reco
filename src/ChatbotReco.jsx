import React, { useState } from "react";

export default function ChatbotReco() {
  const [step, setStep] = useState(0);
  const [phobies, setPhobies] = useState("");
  const [activities, setActivities] = useState("");
  const [result, setResult] = useState(null);

  const handleSubmit = async () => {
    try {
      const response = await fetch("https://chatbot-api.sylvie.app/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phobies, activites: activities }),
      });
      const data = await response.json();
      setResult(data);
    } catch (error) {
      alert("Erreur API recommandation.");
    }
  };

  return (
    <div style={{
      maxWidth: "600px", margin: "2rem auto", padding: "1.5rem",
      border: "2px solid #ccc", borderRadius: "16px", backgroundColor: "#f9f9f9",
      fontFamily: "Arial, sans-serif", boxShadow: "0 8px 20px rgba(0,0,0,0.1)"
    }}>
      <h1 style={{ textAlign: "center", fontSize: "24px" }}>🤖 Chatbot Reco</h1>
      {step === 0 && (
        <>
          <p>Quelle est ta phobie ?</p>
          <input
            value={phobies}
            onChange={(e) => setPhobies(e.target.value)}
            placeholder="Ex: araignées"
            style={{ width: "100%", padding: "0.5rem", marginBottom: "1rem" }}
          />
          <p>Quelle activité aimes-tu ?</p>
          <input
            value={activities}
            onChange={(e) => setActivities(e.target.value)}
            placeholder="Ex: randonnée"
            style={{ width: "100%", padding: "0.5rem" }}
          />
          <button
            onClick={() => {
              setStep(1);
              handleSubmit();
            }}
            style={{ marginTop: "1rem", padding: "0.5rem 1rem", fontWeight: "bold" }}
          >
            Envoyer
          </button>
        </>
      )}
      {step === 1 && result && (
        <>
          <h3>✨ Recommandation IA :</h3>
          <p>{result.ai_text}</p>
          <div style={{ marginTop: "1rem" }}>
            <img src={result.product.image} alt="item" style={{ width: "100px" }} />
            <p>{result.product.text}</p>
            <a href={result.product.link} target="_blank" rel="noreferrer">
              Voir le produit
            </a>
          </div>
        </>
      )}
    </div>
  );
}
