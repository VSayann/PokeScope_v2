import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { formatPokemonId, getTypeColor } from "@/types/pokemon";
import { cn } from "@/lib/utils";

interface PokemonCardProps {
  pokemon: any;
  isFavorite?: boolean;
  onToggleFavorite: (pokemon: any) => void;
  onOpenDetail: (pokemon: any) => void;
}

export function PokemonCard({ pokemon, isFavorite = false, onToggleFavorite, onOpenDetail }: PokemonCardProps) {
  const pokemonId = pokemon.pokedexId || pokemon.id || 0;
  const pokemonName = pokemon.name?.fr || pokemon.name?.en || pokemon.name || 'Inconnu';
  const primaryType = (Array.isArray(pokemon.types) ? pokemon.types[0] : 'normal') || 'normal';
  const typeColor = getTypeColor(String(primaryType));
  
  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleFavorite(pokemon);
  };

  const getStatValue = (statName: string) => {
    if (!pokemon.stats) return 0;
    
    const statMap: Record<string, string> = {
      'hp': 'hp',
      'attack': 'atk',
      'defense': 'def',
      'special-attack': 'spe_atk',
      'special-defense': 'spe_def',
      'speed': 'vit'
    };
    
    if (Array.isArray(pokemon.stats)) {
      const stat = pokemon.stats.find((s: any) => 
        s.stat?.name === statName || s.stat?.name === statMap[statName]
      );
      return stat?.base_stat || 0;
    }
    
    const tyradexStat = statMap[statName] || statName;
    return pokemon.stats[tyradexStat] || 0;
  };

  return (
    <Card 
      className="bg-white rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 cursor-pointer"
      onClick={() => onOpenDetail(pokemon)}
    >
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "p-1 h-auto transition-colors duration-200",
              isFavorite ? "text-red-500 hover:text-red-600" : "text-gray-300 hover:text-red-500"
            )}
            onClick={handleFavoriteClick}
          >
            <Heart className="h-5 w-5" fill={isFavorite ? "currentColor" : "none"} />
          </Button>
        </div>

        <div 
          className="w-full h-48 rounded-xl mb-4 flex items-center justify-center"
          style={{ 
            background: `linear-gradient(to bottom right, ${typeColor}20, ${typeColor}40)` 
          }}
        >
          <div className="flex flex-col items-center mb-4">
            <img
              src={pokemon.sprites?.regular || 
                   pokemon.sprites?.official || 
                   '/pokeball.png'}
              alt={pokemonName}
              className="h-32 w-32 object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/pokeball.png';
              }}
            />
            <h3 className="text-xl font-bold text-gray-800 mt-2">
              {pokemonName}
            </h3>
          </div>
        </div>

        <div className="flex justify-center gap-2 mb-4">
          {Array.isArray(pokemon.types) && pokemon.types.map((type: any, index: number) => {
            let typeName = 'normal';
            
            if (typeof type === 'string') {
              typeName = type;
            } else if (type?.type?.name) {
              typeName = type.type.name;
            } else if (type?.name) {
              typeName = type.name;
            } else if (type) {
              typeName = String(type);
            }
            
            typeName = typeName.toLowerCase().trim();
            
            return (
              <span 
                key={`${typeName}-${index}`}
                className={cn(
                  "px-2 py-1 text-xs font-medium rounded-full",
                  getTypeColor(typeName, 'bg')
                )}
              >
                {typeName.charAt(0).toUpperCase() + typeName.slice(1)}
              </span>
            );
          })}
        </div>

        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <div className="text-lg font-semibold text-red-500">
              {getStatValue('hp')}
            </div>
            <div className="text-xs text-gray-500">PV</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-blue-500">
              {getStatValue('attack')}
            </div>
            <div className="text-xs text-gray-500">Att</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-green-500">
              {getStatValue('defense')}
            </div>
            <div className="text-xs text-gray-500">Def</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
