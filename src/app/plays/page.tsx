"use client";

import { AuthLayout } from "@/components/auth-layout";
import { useState, useEffect } from "react";
import { Calendar, Clock, Users, Plus, X, Edit, Trash2 } from "lucide-react";

interface Play {
  id: string;
  gameId: string;
  gameName: string;
  gameImage?: string;
  playDate: string;
  duration?: number;
  notes?: string;
  participants?: Participant[];
  participantCount?: number;
  createdAt: string;
}

interface Participant {
  id: string;
  playerName: string;
  score?: number;
  position?: number;
  isWinner: boolean;
}

interface Game {
  id: string;
  name: string;
  imageUrl?: string;
  minPlayers: number;
  maxPlayers: number;
  playingTime?: number;
}

interface ParticipantForm {
  name: string;
  score: number | "";
  position: number | "";
  isWinner: boolean;
}

export default function PlaysPage() {
  const [plays, setPlays] = useState<Play[]>([]);
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingPlay, setEditingPlay] = useState<Play | null>(null);
  const [selectedGameId, setSelectedGameId] = useState("");
  const [playDate, setPlayDate] = useState(new Date().toISOString().split('T')[0]);
  const [duration, setDuration] = useState<number | "">("");
  const [notes, setNotes] = useState("");
  const [participants, setParticipants] = useState<ParticipantForm[]>([
    { name: "", score: "", position: "", isWinner: false }
  ]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch plays
        const playsResponse = await fetch('/api/plays');
        if (playsResponse.ok) {
          const playsData = await playsResponse.json();
          setPlays(playsData.plays || []);
        }

        // Fetch games for the dropdown
        const gamesResponse = await fetch('/api/games');
        if (gamesResponse.ok) {
          const gamesData = await gamesResponse.json();
          setGames(gamesData.games || []);
        }

        // Check URL for pre-selected game
        const urlParams = new URLSearchParams(window.location.search);
        const gameId = urlParams.get('gameId');
        if (gameId) {
          setSelectedGameId(gameId);
          setShowAddForm(true);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const addParticipant = () => {
    setParticipants([...participants, { name: "", score: "", position: "", isWinner: false }]);
  };

  const removeParticipant = (index: number) => {
    if (participants.length > 1) {
      setParticipants(participants.filter((_, i) => i !== index));
    }
  };

  const updateParticipant = (index: number, field: keyof ParticipantForm, value: string | number | boolean) => {
    const updated = [...participants];
    updated[index] = { ...updated[index], [field]: value };
    setParticipants(updated);
  };

  const startEdit = (play: Play) => {
    setEditingPlay(play);
    setSelectedGameId(play.gameId);
    setPlayDate(play.playDate);
    setDuration(play.duration || "");
    setNotes(play.notes || "");
    
    // Convert participants to form format
    const formParticipants: ParticipantForm[] = play.participants?.map(p => ({
      name: p.playerName,
      score: (p.score !== null && p.score !== undefined) ? p.score : "",
      position: (p.position !== null && p.position !== undefined) ? p.position : "",
      isWinner: p.isWinner,
    })) || [{ name: "", score: "", position: "", isWinner: false }];
    
    setParticipants(formParticipants);
    setShowAddForm(true);
  };

  const cancelEdit = () => {
    setEditingPlay(null);
    setSelectedGameId("");
    setPlayDate(new Date().toISOString().split('T')[0]);
    setDuration("");
    setNotes("");
    setParticipants([{ name: "", score: "", position: "", isWinner: false }]);
    setShowAddForm(false);
  };

  const deletePlay = async (play: Play) => {
    if (!confirm(`Are you sure you want to delete this play of "${play.gameName}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/plays/${play.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Refresh plays list
        const playsResponse = await fetch('/api/plays');
        if (playsResponse.ok) {
          const playsData = await playsResponse.json();
          setPlays(playsData.plays || []);
        }
        alert('Play deleted successfully!');
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.error || 'Failed to delete play'}`);
      }
    } catch (error) {
      console.error('Error deleting play:', error);
      alert('Failed to delete play');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedGameId) {
      alert('Please select a game');
      return;
    }

    try {
      const url = editingPlay ? `/api/plays/${editingPlay.id}` : '/api/plays';
      const method = editingPlay ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          gameId: selectedGameId,
          playDate,
          duration: duration === "" ? undefined : Number(duration),
          notes,
          participants: participants.filter(p => p.name.trim() !== ""),
        }),
      });

      if (response.ok) {
        // Refresh plays list
        const playsResponse = await fetch('/api/plays');
        if (playsResponse.ok) {
          const playsData = await playsResponse.json();
          setPlays(playsData.plays || []);
        }
        
        // Reset form
        setEditingPlay(null);
        setSelectedGameId("");
        setPlayDate(new Date().toISOString().split('T')[0]);
        setDuration("");
        setNotes("");
        setParticipants([{ name: "", score: "", position: "", isWinner: false }]);
        setShowAddForm(false);
        
        alert(editingPlay ? 'Play updated successfully!' : 'Play logged successfully!');
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.error || 'Failed to save play'}`);
      }
    } catch (error) {
      console.error('Error saving play:', error);
      alert('Failed to save play');
    }
  };

  if (loading) {
    return (
      <AuthLayout>
        <div className="text-center py-12">
          <div className="text-lg text-gray-600">Loading plays...</div>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <div className="px-4 sm:px-0">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Game Plays</h1>
            <p className="mt-2 text-gray-600">
              Track your board game sessions
            </p>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Log a Play
          </button>
        </div>

        {/* Add Play Form */}
        {showAddForm && (
          <div className="bg-white shadow rounded-lg mb-8">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">
                  {editingPlay ? 'Edit Play' : 'Log a New Play'}
                </h3>
                <button
                  onClick={editingPlay ? cancelEdit : () => setShowAddForm(false)}
                  className="text-gray-600 hover:text-red-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Game Selection */}
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    Game *
                  </label>
                  <select
                    value={selectedGameId}
                    onChange={(e) => setSelectedGameId(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
                  >
                    <option value="" className="text-gray-700">Select a game...</option>
                    {games.map((game) => (
                      <option key={game.id} value={game.id} className="text-gray-900">
                        {game.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Play Date */}
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    Play Date *
                  </label>
                  <input
                    type="date"
                    value={playDate}
                    onChange={(e) => setPlayDate(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
                  />
                </div>

                {/* Duration */}
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    Duration (minutes)
                  </label>
                  <input
                    type="number"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value === "" ? "" : Number(e.target.value))}
                    min="1"
                    placeholder="e.g., 60"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 placeholder-gray-600"
                  />
                </div>

                {/* Participants */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    Players & Scores
                  </label>
                  {participants.map((participant, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4 mb-4">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                        <div>
                          <input
                            type="text"
                            value={participant.name}
                            onChange={(e) => updateParticipant(index, 'name', e.target.value)}
                            placeholder={`Player ${index + 1}`}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 placeholder-gray-600"
                          />
                        </div>
                        <div>
                          <input
                            type="number"
                            value={participant.score}
                            onChange={(e) => updateParticipant(index, 'score', e.target.value === "" ? "" : Number(e.target.value))}
                            placeholder="Score"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 placeholder-gray-600"
                          />
                        </div>
                        <div>
                          <input
                            type="number"
                            value={participant.position}
                            onChange={(e) => updateParticipant(index, 'position', e.target.value === "" ? "" : Number(e.target.value))}
                            placeholder="Position"
                            min="1"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 placeholder-gray-600"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={participant.isWinner}
                              onChange={(e) => updateParticipant(index, 'isWinner', e.target.checked)}
                              className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                            />
                            <span className="ml-2 text-sm font-medium text-gray-800">Winner</span>
                          </label>
                          {participants.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeParticipant(index)}
                              className="text-red-600 hover:text-red-800 p-1"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addParticipant}
                    className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                  >
                    + Add Player
                  </button>
                </div>
              </div>

              {/* Notes */}
              <div className="mt-6">
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  Notes
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  placeholder="How was the game? Any memorable moments?"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 placeholder-gray-600"
                />
              </div>

              {/* Submit Button */}
              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={editingPlay ? cancelEdit : () => setShowAddForm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                  {editingPlay ? 'Update Play' : 'Log Play'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Plays List */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Recent Plays</h3>
          </div>
          <div className="p-6">
            {plays.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🎯</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No game plays recorded yet
                </h3>
                <p className="text-gray-500 mb-4">
                  Start logging your game sessions from your collection!
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {plays.map((play) => (
                  <div key={play.id} className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors">
                    <div className="flex gap-4">
                      {play.gameImage && (
                        <img
                          src={play.gameImage}
                          alt={play.gameName}
                          className="w-16 h-16 rounded object-cover flex-shrink-0"
                        />
                      )}
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-medium text-gray-900">
                              {play.gameName}
                            </h4>
                            <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                              <span className="flex items-center">
                                <Calendar className="w-3 h-3 mr-1" />
                                {new Date(play.playDate).toLocaleDateString()}
                              </span>
                              {play.duration && (
                                <span className="flex items-center">
                                  <Clock className="w-3 h-3 mr-1" />
                                  {play.duration} min
                                </span>
                              )}
                              {play.participantCount && play.participantCount > 0 && (
                                <span className="flex items-center">
                                  <Users className="w-3 h-3 mr-1" />
                                  {play.participantCount} player{play.participantCount !== 1 ? 's' : ''}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-1">
                            <button
                              onClick={() => startEdit(play)}
                              className="text-gray-600 hover:text-blue-600 p-1"
                              title="Edit play"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => deletePlay(play)}
                              className="text-gray-600 hover:text-red-600 p-1"
                              title="Delete play"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        {play.notes && (
                          <p className="text-sm text-gray-600 mt-2">
                            {play.notes}
                          </p>
                        )}
                        
                        {/* Participants with scores */}
                        {play.participants && play.participants.length > 0 && (
                          <div className="mt-3">
                            <h5 className="text-xs font-medium text-gray-700 mb-2">Players:</h5>
                            <div className="space-y-1">
                              {play.participants.map((participant, index) => (
                                <div key={index} className="flex justify-between items-center text-xs">
                                  <div className="flex items-center gap-2">
                                    <span className={participant.isWinner ? "font-medium text-green-700" : "text-gray-600"}>
                                      {participant.playerName}
                                      {participant.isWinner && " 🏆"}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2 text-gray-500">
                                    {participant.score !== null && (
                                      <span>{participant.score} pts</span>
                                    )}
                                    {participant.position !== null && (
                                      <span>#{participant.position}</span>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        <div className="mt-2 text-xs text-gray-500">
                          Logged: {new Date(play.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
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
