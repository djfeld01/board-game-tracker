"use client";

import { AuthLayout } from "@/components/auth-layout";
import { useState, useEffect } from "react";
import { Plus, Search, ExternalLink, Calendar, Users, Clock, Star, Edit, Trash2, Play, Save, X } from "lucide-react";

interface BGGGame {
  id: string;
  name: string;
  yearPublished: string;
  image: string;
  thumbnail: string;
  minPlayers: string;
  maxPlayers: string;
  playingTime: string;
  minPlayTime: string;
  maxPlayTime: string;
  description: string;
  complexity: string;
  designers: string[];
  publishers: string[];
}

interface CollectionGame {
  id: string;
  name: string;
  description?: string;
  year?: number;
  minPlayers: number;
  maxPlayers: number;
  playingTime?: number;
  complexity?: string;
  imageUrl?: string;
  designer?: string;
  publisher?: string;
  condition?: string;
  bggId?: number;
  createdAt: Date;
  updatedAt: Date;
}

export default function CollectionPage() {
  const [games, setGames] = useState<CollectionGame[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<BGGGame[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingGame, setEditingGame] = useState<CollectionGame | null>(null);
  const [editedGame, setEditedGame] = useState<Partial<CollectionGame> | null>(null);

  // Fetch user's games on component mount
  useEffect(() => {
    const fetchGames = async () => {
      try {
        const response = await fetch('/api/games');
        if (response.ok) {
          const data = await response.json();
          setGames(data.games || []);
        }
      } catch (error) {
        console.error('Error fetching games:', error);
      }
    };

    fetchGames();
  }, []);

  const searchBGG = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    try {
      const response = await fetch(`/api/bgg/search?q=${encodeURIComponent(searchQuery)}`);
      if (response.ok) {
        const results = await response.json();
        setSearchResults(results);
      }
    } catch (error) {
      console.error("Error searching BGG:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const addGameToCollection = async (bggGame: BGGGame) => {
    try {
      const response = await fetch("/api/games", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: bggGame.name,
          bggId: parseInt(bggGame.id),
          year: parseInt(bggGame.yearPublished),
          minPlayers: parseInt(bggGame.minPlayers),
          maxPlayers: parseInt(bggGame.maxPlayers),
          playingTime: parseInt(bggGame.playingTime),
          complexity: parseFloat(bggGame.complexity),
          description: bggGame.description,
          imageUrl: bggGame.image,
          designer: bggGame.designers.join(", "),
          publisher: bggGame.publishers.join(", "),
        }),
      });

      if (response.ok) {
        // Refresh the collection by fetching updated games
        const gamesResponse = await fetch('/api/games');
        if (gamesResponse.ok) {
          const data = await gamesResponse.json();
          setGames(data.games || []);
        }
        
        // Clear search and close forms
        setSearchResults([]);
        setSearchQuery("");
        setShowAddForm(false);
        
        alert('Game added to your collection!');
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.error || 'Failed to add game'}`);
      }
    } catch (error) {
      console.error("Error adding game:", error);
      alert('Failed to add game to collection');
    }
  };

  const handleManualAdd = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    try {
      const response = await fetch("/api/games", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.get('name'),
          year: formData.get('year') ? parseInt(formData.get('year') as string) : undefined,
          minPlayers: parseInt(formData.get('minPlayers') as string),
          maxPlayers: parseInt(formData.get('maxPlayers') as string),
          playingTime: formData.get('playingTime') ? parseInt(formData.get('playingTime') as string) : undefined,
          designer: formData.get('designer') || undefined,
          publisher: formData.get('publisher') || undefined,
          condition: formData.get('condition') || 'good',
        }),
      });

      if (response.ok) {
        // Refresh the collection
        const gamesResponse = await fetch('/api/games');
        if (gamesResponse.ok) {
          const data = await gamesResponse.json();
          setGames(data.games || []);
        }
        
        // Reset form and close
        (e.target as HTMLFormElement).reset();
        setShowAddForm(false);
        alert('Game added to your collection!');
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.error || 'Failed to add game'}`);
      }
    } catch (error) {
      console.error("Error adding game:", error);
      alert('Failed to add game to collection');
    }
  };

  const startEdit = (game: CollectionGame) => {
    setEditingGame(game);
    setEditedGame({ ...game });
  };

  const cancelEdit = () => {
    setEditingGame(null);
    setEditedGame(null);
  };

  const saveEdit = async () => {
    if (!editingGame || !editedGame) return;

    try {
      const response = await fetch(`/api/games/${editingGame.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editedGame),
      });

      if (response.ok) {
        // Refresh the collection
        const gamesResponse = await fetch('/api/games');
        if (gamesResponse.ok) {
          const data = await gamesResponse.json();
          setGames(data.games || []);
        }
        setEditingGame(null);
        setEditedGame(null);
        alert('Game updated successfully!');
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.error || 'Failed to update game'}`);
      }
    } catch (error) {
      console.error("Error updating game:", error);
      alert('Failed to update game');
    }
  };

  const deleteGame = async (game: CollectionGame) => {
    if (!confirm(`Are you sure you want to delete "${game.name}" from your collection?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/games/${game.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Refresh the collection
        const gamesResponse = await fetch('/api/games');
        if (gamesResponse.ok) {
          const data = await gamesResponse.json();
          setGames(data.games || []);
        }
        alert('Game deleted successfully!');
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.error || 'Failed to delete game'}`);
      }
    } catch (error) {
      console.error("Error deleting game:", error);
      alert('Failed to delete game');
    }
  };

  const logPlay = (game: CollectionGame) => {
    // Navigate to plays page with game pre-selected
    window.location.href = `/plays?gameId=${game.id}`;
  };

  return (
    <AuthLayout>
      <div className="px-4 sm:px-0">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Game Collection</h1>
            <p className="mt-2 text-gray-600">
              Manage your board game collection
            </p>
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Game
          </button>
        </div>

        {/* Add Game Form */}
        {showAddForm && (
          <div className="bg-white shadow rounded-lg mb-8">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                Add Game to Collection
              </h3>
            </div>
            <div className="p-6">
              {/* BGG Search */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search BoardGameGeek
                </label>
                <div className="flex gap-3">
                  <div className="flex-1">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && searchBGG()}
                      placeholder="Enter game name to search..."
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 placeholder-gray-500"
                    />
                  </div>
                  <button
                    onClick={searchBGG}
                    disabled={isSearching}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    {isSearching ? (
                      "Searching..."
                    ) : (
                      <>
                        <Search className="w-4 h-4 mr-2" />
                        Search
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Search Results */}
              {searchResults.length > 0 && (
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Search Results</h4>
                  <div className="grid gap-4">
                    {searchResults.map((game) => (
                      <div
                        key={game.id}
                        className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
                      >
                        <div className="flex gap-4">
                          {game.thumbnail && (
                            <img
                              src={game.thumbnail}
                              alt={game.name}
                              className="w-16 h-16 rounded object-cover flex-shrink-0"
                            />
                          )}
                          <div className="flex-1">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <h5 className="font-medium text-gray-900">
                                  {game.name}
                                </h5>
                                <div className="flex items-center gap-4 text-sm text-gray-500">
                                  {game.yearPublished && (
                                    <span className="flex items-center">
                                      <Calendar className="w-3 h-3 mr-1" />
                                      {game.yearPublished}
                                    </span>
                                  )}
                                  {game.minPlayers && game.maxPlayers && (
                                    <span className="flex items-center">
                                      <Users className="w-3 h-3 mr-1" />
                                      {game.minPlayers}-{game.maxPlayers} players
                                    </span>
                                  )}
                                  {game.playingTime && (
                                    <span className="flex items-center">
                                      <Clock className="w-3 h-3 mr-1" />
                                      {game.playingTime} min
                                    </span>
                                  )}
                                  {game.complexity && (
                                    <span className="flex items-center">
                                      <Star className="w-3 h-3 mr-1" />
                                      {game.complexity}/5
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <a
                                  href={`https://boardgamegeek.com/boardgame/${game.id}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:text-blue-800"
                                >
                                  <ExternalLink className="w-4 h-4" />
                                </a>
                                <button
                                  onClick={() => addGameToCollection(game)}
                                  className="px-3 py-1 text-xs font-medium text-white bg-green-600 hover:bg-green-700 rounded"
                                >
                                  Add
                                </button>
                              </div>
                            </div>
                            {game.description && (
                              <p className="text-sm text-gray-600 line-clamp-3">
                                {game.description.replace(/<[^>]*>/g, "").replace(/&[^;]*;/g, "").substring(0, 200)}
                                {game.description.replace(/<[^>]*>/g, "").length > 200 ? "..." : ""}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Manual Add Form */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h4 className="font-medium text-gray-900 mb-4">
                  Or add manually
                </h4>
                <form onSubmit={handleManualAdd}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Game Name *
                      </label>
                      <input
                        type="text"
                        name="name"
                        required
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Year Published
                      </label>
                      <input
                        type="number"
                        name="year"
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Min Players *
                      </label>
                      <input
                        type="number"
                        name="minPlayers"
                        min="1"
                        required
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Max Players *
                      </label>
                      <input
                        type="number"
                        name="maxPlayers"
                        min="1"
                        required
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Playing Time (minutes)
                      </label>
                      <input
                        type="number"
                        name="playingTime"
                        min="1"
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Designer
                      </label>
                      <input
                        type="text"
                        name="designer"
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Publisher
                      </label>
                      <input
                        type="text"
                        name="publisher"
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Condition
                      </label>
                      <select
                        name="condition"
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      >
                        <option value="new">New</option>
                        <option value="like_new">Like New</option>
                        <option value="good">Good</option>
                        <option value="fair">Fair</option>
                        <option value="poor">Poor</option>
                      </select>
                    </div>
                  </div>
                  <div className="mt-4 flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setShowAddForm(false)}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700"
                    >
                      Add Game
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Collection Grid */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Your Games</h3>
          </div>
          <div className="p-6">
            {games.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🎲</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No games in your collection yet
                </h3>
                <p className="text-gray-500 mb-4">
                  Start building your collection by adding your first game!
                </p>
                <button
                  onClick={() => setShowAddForm(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Game
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {games.map((game) => (
                  <div key={game.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    {editingGame?.id === game.id ? (
                      // Edit Form
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <h4 className="text-lg font-medium text-gray-900">Edit Game</h4>
                          <div className="flex gap-2">
                            <button
                              onClick={saveEdit}
                              className="text-green-600 hover:text-green-800 p-1"
                              title="Save changes"
                            >
                              <Save className="w-5 h-5" />
                            </button>
                            <button
                              onClick={cancelEdit}
                              className="text-gray-600 hover:text-red-600 p-1"
                              title="Cancel edit"
                            >
                              <X className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <label className="block text-gray-700 mb-1">Name</label>
                            <input
                              type="text"
                              value={editedGame?.name || ''}
                              onChange={(e) => setEditedGame(prev => prev ? {...prev, name: e.target.value} : null)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-gray-700 mb-1">Condition</label>
                            <select
                              value={editedGame?.condition || 'good'}
                              onChange={(e) => setEditedGame(prev => prev ? {...prev, condition: e.target.value} : null)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            >
                              <option value="excellent">Excellent</option>
                              <option value="very-good">Very Good</option>
                              <option value="good">Good</option>
                              <option value="fair">Fair</option>
                              <option value="poor">Poor</option>
                            </select>
                          </div>
                          
                          <div>
                            <label className="block text-gray-700 mb-1">Designer</label>
                            <input
                              type="text"
                              value={editedGame?.designer || ''}
                              onChange={(e) => setEditedGame(prev => prev ? {...prev, designer: e.target.value} : null)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-gray-700 mb-1">Publisher</label>
                            <input
                              type="text"
                              value={editedGame?.publisher || ''}
                              onChange={(e) => setEditedGame(prev => prev ? {...prev, publisher: e.target.value} : null)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                          </div>
                        </div>
                      </div>
                    ) : (
                      // Normal View
                      <div className="flex items-start space-x-3">
                        {game.imageUrl && (
                          <img
                            src={game.imageUrl}
                            alt={game.name}
                            className="w-16 h-16 rounded object-cover flex-shrink-0"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="text-sm font-medium text-gray-900 truncate">
                                {game.name}
                              </h4>
                              {game.year && (
                                <p className="text-xs text-gray-500">({game.year})</p>
                              )}
                              <div className="flex items-center space-x-3 text-xs text-gray-500 mt-1">
                                <span className="flex items-center">
                                  <Users className="w-3 h-3 mr-1" />
                                  {game.minPlayers}-{game.maxPlayers}
                                </span>
                                {game.playingTime && (
                                  <span className="flex items-center">
                                    <Clock className="w-3 h-3 mr-1" />
                                    {game.playingTime} min
                                  </span>
                                )}
                                {game.complexity && (
                                  <span className="flex items-center">
                                    <Star className="w-3 h-3 mr-1" />
                                    {game.complexity}/5
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="flex gap-1">
                              <button
                                onClick={() => startEdit(game)}
                                className="text-gray-600 hover:text-blue-600 p-1"
                                title="Edit game"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => logPlay(game)}
                                className="text-gray-600 hover:text-green-600 p-1"
                                title="Log a play"
                              >
                                <Play className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => deleteGame(game)}
                                className="text-gray-600 hover:text-red-600 p-1"
                                title="Delete game"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                              {game.bggId && (
                                <a
                                  href={`https://boardgamegeek.com/boardgame/${game.bggId}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-gray-600 hover:text-blue-600 p-1"
                                  title="View on BGG"
                                >
                                  <ExternalLink className="w-4 h-4" />
                                </a>
                              )}
                            </div>
                          </div>
                          {game.description && (
                            <p className="text-xs text-gray-600 mt-2 line-clamp-2">
                              {game.description.replace(/<[^>]*>/g, "").replace(/&[^;]*;/g, "").substring(0, 150)}
                              {game.description.length > 150 ? "..." : ""}
                            </p>
                          )}
                          <div className="mt-2 flex justify-between text-xs text-gray-500">
                            <span>Condition: {game.condition || 'Good'}</span>
                            <span>Added: {new Date(game.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </AuthLayout>
  );
}
