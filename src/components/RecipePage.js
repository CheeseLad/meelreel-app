import React, { useState } from "react";
import FooterNav from "../components/FooterNav";

const RecipePage = () => {
  const [ingredients, setIngredients] = useState("");
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}`,  // Replace with your OpenAI API key
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",  // Or the model you prefer
          messages: [
            { role: 'user', content: `Suggest recipes based on these ingredients: ${ingredients}` }
          ],
          max_tokens: 150,  // Adjust based on how long you expect the response to be
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const recipeText = data.choices[0].message.content.trim();
      setRecipes(recipeText.split('\n').filter(recipe => recipe.trim() !== ''));
    } catch (error) {
      console.error("Error fetching recipes:", error);
      setError("Failed to fetch recipes. Please try again.");
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
        {error && <p className="text-red-500">{error}</p>}
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
