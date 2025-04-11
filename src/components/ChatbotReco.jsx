import { useState, useEffect } from "react";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";

export default function ChatbotReco() {
  const [step, setStep] = useState(0);
  const [openaiKey, setOpenaiKey] = useState("");
  const [form, setForm] = useState({
    sexe: "",
    age: "",
    profession: "",
    nationalite: "",
    niveau: "",
    phobies: "",
    activites: "",
    socialisation: "",
    imagination: "",
    decisions: "",
    organisation: ""
  });
  const [products, setProducts] = useState([]);
  const [mbti, setMbti] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const savedKey = document.cookie
      .split('; ')
      .find(row => row.startsWith('openaiKey='))?.split('=')[1];
    if (savedKey) {
      setOpenaiKey(savedKey);
      setStep(1);
    }
  }, []);

  const questions = [
    { name: "nationalite", label: "Quelle est votre nationalité ?" },
    { name: "sexe", label: "Quel est votre sexe ?" },
    { name: "age", label: "Quel est votre âge ?", type: "number" },
    { name: "profession", label: "Quelle est votre profession ?" },
    { name: "niveau", label: "Niveau de français (Débutant, Intermédiaire...)" },
    { name: "phobies", label: "Vos 3 phobies (séparées par des virgules)" },
    { name: "activites", label: "Vos activités préférées (séparées par des virgules)" },
    { name: "socialisation", label: "Préférez-vous les grands groupes ou les moments en tête-à-tête ?" },
    { name: "imagination", label: "Vous vous fiez davantage à : votre imagination ou votre expérience concrète ?" },
    { name: "decisions", label: "Prenez-vous vos décisions surtout avec votre logique ou vos émotions ?" },
    { name: "organisation", label: "Préférez-vous planifier ou improviser ?" }
  ];

  const handleNext = () => {
    if (step <= questions.length) {
      setStep(step + 1);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleNext();
    }
  };

  const getUserLanguage = () => {
    const nat = form.nationalite.toLowerCase();
    if (nat.includes("fr")) return "français";
    if (nat.includes("es")) return "espagnol";
    if (nat.includes("cn") || nat.includes("zh") || nat.includes("chine") || nat.includes("china")) return "chinois";
    return "anglais";
  };

  const generateRecommendation = async () => {
    setLoading(true);
    const userLang = getUserLanguage();
    const prompt = `
Voici les informations utilisateur :
Sexe: ${form.sexe}
Âge: ${form.age}
Profession: ${form.profession}
Nationalité: ${form.nationalite}
Niveau de français: ${form.niveau}
Phobies: ${form.phobies}
Activités: ${form.activites}
Préférences sociales: ${form.socialisation}
Préférences d'imagination: ${form.imagination}
Décisions: ${form.decisions}
Organisation: ${form.organisation}

Détermine le type MBTI de cette personne et donne une brève description.
Ensuite, recommande 2 produits correspondant de ce type.
Pour la 3eme recommandation, on fait des recommandations drole base sur ces Phobies,
on recommande a l'inverse, par exemple,
S’il n’aime pas le bruit, je lui recommande des produits bruyant.
Réponds strictement en ${userLang}.
Formate ta réponse en JSON comme ceci; le nom des variables JSON ne doit pas changer en fonction de la langue:
{
  "mbti": "XXXX",
  "description": "Courte description du type MBTI",
  "recommendations": [
    {
      "name": "Nom du produit",
      "description": "Pourquoi ce produit est adapté à cette personne"
    }
  ]
}
`;

    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${openaiKey}`
        },
        body: JSON.stringify({
          model: "gpt-4",
          messages: [
            {
              role: "system",
              content: "You are a helpful assistant that returns only JSON containing an MBTI type, description, and product recommendations."
            },
            {
              role: "user",
              content: prompt
            }
          ],
          temperature: 0.7
        })
      });

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content || "{}";
      const parsed = JSON.parse(content);
      setMbti({ type: parsed.mbti, description: parsed.description });
      setProducts(Array.isArray(parsed.recommendations) ? parsed.recommendations : []);
    } catch (err) {
      alert("Erreur lors de la génération. Vérifie ta clé OpenAI.");
    } finally {
      setLoading(false);
    }
  };

  const searchAmazonLink = (productName) => {
    const query = encodeURIComponent(productName);
    return `https://www.amazon.fr/s?k=${query}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-sky-100 flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-6">
          <h1 className="text-2xl font-bold mb-4 text-center">🤖 Chatbot Recommandation</h1>

          {products.length > 0 ? (
            <div className="space-y-4">
              {mbti && (
                <div className="text-center mb-4">
                  <h2 className="text-xl font-semibold">🧠 Votre type MBTI : {mbti.type}</h2>
                  <p className="text-sm text-gray-600">{mbti.description}</p>
                </div>
              )}
              <p className="text-center text-lg font-medium">🎁 Vos recommandations personnalisées :</p>
              {products.map((product, index) => (
                <Card key={index} className="p-4">
                  <p className="font-semibold">{product.name}</p>
                  <p className="text-sm text-gray-600 mb-2">{product.description}</p>
                  <a
                    href={searchAmazonLink(product.name)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 text-sm underline"
                  >
                    Voir sur Amazon
                  </a>
                </Card>
              ))}
              <Button className="mt-6 w-full" onClick={() => window.location.reload()}>
                Recommencer
              </Button>
            </div>
          ) : (
            <div>
              {step === 0 ? (
                <>
                  <label className="block text-sm font-medium mb-2">
                    Entrez votre clé OpenAI (elle ne sera pas stockée) :
                  </label>
                  <input
                    type="password"
                    value={openaiKey}
                    onChange={(e) => setOpenaiKey(e.target.value)}
                    className="w-full border rounded-xl p-2 mb-4"
                  />
                  <Button onClick={() => {
                    document.cookie = `openaiKey=${openaiKey}; path=/; max-age=31536000`;
                    handleNext();
                  }} className="w-full" disabled={!openaiKey}>
                    Commencer
                  </Button>
                </>
              ) : step <= questions.length ? (
                <>
                  <label className="block text-sm font-medium mb-2">
                    {questions[step - 1].label}
                  </label>
                  <input
                    type={questions[step - 1].type || "text"}
                    value={form[questions[step - 1].name]}
                    onChange={(e) =>
                      setForm({ ...form, [questions[step - 1].name]: e.target.value })
                    }
                    onKeyDown={handleKeyDown}
                    className="w-full border rounded-xl p-2 mb-4"
                  />
                  <Button onClick={handleNext} className="w-full">
                    {step === questions.length ? "Obtenir la recommandation" : "Suivant"}
                  </Button>
                </>
              ) : (
                <div className="text-center">
                  {loading ? (
                    <p className="text-gray-500">Génération en cours...</p>
                  ) : (
                    <Button className="w-full" onClick={generateRecommendation}>
                      Lancer la recommandation
                    </Button>
                  )}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
