import React, { useState } from "react";
import axios from "axios";
import FooterNav from "../components/FooterNav";

const RecipePage = () => {
  const [ingredients, setIngredients] = useState("");
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(
        "https://api.openai.com/v1/engines/text-davinci-003/completions",
        {
          prompt: `Suggest recipes based on these ingredients: ${ingredients}`,
          max_tokens: 150,
          temperature: 0.7,
          top_p: 1,
          frequency_penalty: 0,
          presence_penalty: 0,
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );

      setRecipes(response.data.choices[0].text.trim().split("\n"));
    } catch (error) {
      console.error("Error fetching recipes:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <header className="p-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Recipe Finder</h1>
      </header>
      <main className="container mx-auto p-4 flex-1">
        <div className="bg-gray-800 rounded-lg p-4 mb-8">
          <h2 className="text-xl font-semibold mb-2">Enter Ingredients</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <textarea
              placeholder="Enter ingredients separated by commas..."
              value={ingredients}
              onChange={(e) => setIngredients(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 rounded"
            />
            <button
              type="submit"
              className="bg-white text-black px-4 py-2 rounded hover:bg-gray-200"
              disabled={loading}
            >
              {loading ? "Searching..." : "Find Recipes"}
            </button>
          </form>
        </div>

        {recipes.length > 0 && (
          <div>
            <h3 className="text-xl font-semibold mb-4">Suggested Recipes</h3>
            <ul className="list-disc pl-5 space-y-2">
              {recipes.map((recipe, index) => (
                <li key={index} className="bg-gray-800 rounded-lg p-4">
                  {recipe}
                </li>
              ))}
            </ul>
          </div>
        )}
      </main>
      <FooterNav />
    </div>
  );
};

export default RecipePage;
