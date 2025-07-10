import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { X, Heart } from "lucide-react";
import { Pokemon, formatPokemonName, formatPokemonId, getTypeColor } from "@/types/pokemon";
import { cn } from "@/lib/utils";

interface PokemonModalProps {
  pokemon: Pokemon | null;
  isOpen: boolean;
  isFavorite?: boolean;
  isLoading?: boolean;
  onClose: () => void;
  onToggleFavorite: (pokemon: Pokemon) => void;
}

export function PokemonModal({ pokemon, isOpen, isFavorite = false, onClose, onToggleFavorite }: PokemonModalProps) {
  if (!pokemon) return null;

  const primaryType = pokemon.types[0]?.type.name;
  const typeColor = getTypeColor(primaryType);

  const getStatValue = (statName: string) => {
    return pokemon.stats.find(stat => stat.stat.name === statName)?.base_stat || 0;
  };

  const getStatPercentage = (value: number) => {
    return Math.min((value / 255) * 100, 100);
  };

  const statNames = {
    hp: 'Points de Vie',
    attack: 'Attaque',
    defense: 'Défense',
    'special-attack': 'Attaque Spéciale',
    'special-defense': 'Défense Spéciale',
    speed: 'Vitesse'
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex justify-between items-start">
            <div className="flex items-center space-x-4">
              <span className="text-2xl font-semibold text-gray-500">
                {formatPokemonId(pokemon.id)}
              </span>
              <DialogTitle className="text-3xl font-bold text-gray-800">
                {formatPokemonName(pokemon.name_fr || pokemon.name)}
                {pokemon.name_fr && pokemon.name_fr !== pokemon.name && (
                  <span className="text-lg font-normal text-gray-500 ml-2">
                    ({formatPokemonName(pokemon.name)})
                  </span>
                )}
              </DialogTitle>
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "p-2 transition-colors duration-200",
                  isFavorite ? "text-red-500 hover:text-red-600" : "text-gray-400 hover:text-red-500"
                )}
                onClick={() => onToggleFavorite(pokemon)}
              >
                <Heart className="h-6 w-6" fill={isFavorite ? "currentColor" : "none"} />
              </Button>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-6 w-6" />
            </Button>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Pokemon Image & Basic Info */}
          <div>
            <div 
              className="w-full h-80 rounded-2xl mb-6 flex items-center justify-center"
              style={{ 
                background: `linear-gradient(to bottom right, ${typeColor}20, ${typeColor}40)` 
              }}
            >
              <img
                src={pokemon.sprites.other?.['official-artwork']?.front_default || pokemon.sprites.front_default}
                alt={formatPokemonName(pokemon.name)}
                className="w-64 h-64 object-contain"
              />
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Types</h3>
                <div className="flex flex-wrap gap-2">
                  {pokemon.types.map((type, index) => (
                    <span
                      key={index}
                      className="px-4 py-2 rounded-full text-white font-medium"
                      style={{ backgroundColor: getTypeColor(type.type.name) }}
                    >
                      {formatPokemonName(type.type.name)}
                    </span>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Informations</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="text-gray-600">Taille</div>
                    <div className="font-semibold">{(pokemon.height / 10).toFixed(1)} m</div>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="text-gray-600">Poids</div>
                    <div className="font-semibold">{(pokemon.weight / 10).toFixed(1)} kg</div>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="text-gray-600">Talent Principal</div>
                    <div className="font-semibold">
                      {formatPokemonName(pokemon.abilities[0]?.ability.name || 'Inconnu')}
                    </div>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="text-gray-600">Nombre de Types</div>
                    <div className="font-semibold">{pokemon.types.length}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats & Additional Info */}
          <div>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-4">Statistiques</h3>
                <div className="space-y-3">
                  {pokemon.stats.map((stat, index) => {
                    const statName = stat.stat.name as keyof typeof statNames;
                    const displayName = statNames[statName] || formatPokemonName(stat.stat.name);
                    const value = stat.base_stat;
                    const percentage = getStatPercentage(value);
                    
                    const colors = {
                      hp: 'bg-red-500',
                      attack: 'bg-blue-500',
                      defense: 'bg-green-500',
                      'special-attack': 'bg-purple-500',
                      'special-defense': 'bg-yellow-500',
                      speed: 'bg-pink-500'
                    };
                    
                    const colorClass = colors[statName] || 'bg-gray-500';

                    return (
                      <div key={index}>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm text-gray-600">{displayName}</span>
                          <span className="text-sm font-semibold">{value}</span>
                        </div>
                        <Progress 
                          value={percentage} 
                          className="h-2"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>

              {pokemon.description && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-3">Description</h3>
                  <p className="text-gray-600 leading-relaxed">
                    {pokemon.description}
                  </p>
                </div>
              )}

              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-3">Talents</h3>
                <div className="space-y-2">
                  {pokemon.abilities.map((ability, index) => (
                    <div 
                      key={index}
                      className={cn(
                        "p-3 rounded-lg",
                        ability.is_hidden ? "bg-purple-50 border border-purple-200" : "bg-gray-50"
                      )}
                    >
                      <div className="font-medium">
                        {formatPokemonName(ability.ability.name)}
                        {ability.is_hidden && (
                          <span className="ml-2 text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                            Talent Caché
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
