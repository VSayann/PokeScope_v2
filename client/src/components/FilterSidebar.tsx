import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const POKEMON_TYPES = [
  { name: 'fire', label: 'Feu', color: 'bg-red-500' },
  { name: 'water', label: 'Eau', color: 'bg-blue-500' },
  { name: 'grass', label: 'Plante', color: 'bg-green-500' },
  { name: 'electric', label: 'Électrik', color: 'bg-yellow-500' },
  { name: 'psychic', label: 'Psy', color: 'bg-purple-500' },
  { name: 'ice', label: 'Glace', color: 'bg-cyan-500' },
  { name: 'dragon', label: 'Dragon', color: 'bg-indigo-600' },
  { name: 'dark', label: 'Ténèbres', color: 'bg-gray-800' },
  { name: 'fairy', label: 'Fée', color: 'bg-pink-500' },
  { name: 'fighting', label: 'Combat', color: 'bg-red-700' },
  { name: 'poison', label: 'Poison', color: 'bg-purple-700' },
  { name: 'ground', label: 'Sol', color: 'bg-yellow-600' },
  { name: 'flying', label: 'Vol', color: 'bg-indigo-400' },
  { name: 'bug', label: 'Insecte', color: 'bg-green-600' },
  { name: 'rock', label: 'Roche', color: 'bg-yellow-800' },
  { name: 'ghost', label: 'Spectre', color: 'bg-purple-800' },
  { name: 'steel', label: 'Acier', color: 'bg-gray-500' },
  { name: 'normal', label: 'Normal', color: 'bg-gray-400' },
];

const GENERATIONS = [
  { value: 'all', label: 'Toutes les générations' },
  { value: '1', label: 'Génération I (Kanto)' },
  { value: '2', label: 'Génération II (Johto)' },
  { value: '3', label: 'Génération III (Hoenn)' },
  { value: '4', label: 'Génération IV (Sinnoh)' },
  { value: '5', label: 'Génération V (Unys)' },
  { value: '6', label: 'Génération VI (Kalos)' },
  { value: '7', label: 'Génération VII (Alola)' },
  { value: '8', label: 'Génération VIII (Galar)' },
];

interface FilterSidebarProps {
  selectedTypes: string[];
  selectedGeneration: string;
  minHp: number;
  onTypeToggle: (type: string) => void;
  onGenerationChange: (generation: string) => void;
  onHpChange: (hp: number) => void;
  onClearFilters: () => void;
}

export function FilterSidebar({ 
  selectedTypes, 
  selectedGeneration, 
  minHp, 
  onTypeToggle, 
  onGenerationChange, 
  onHpChange, 
  onClearFilters 
}: FilterSidebarProps) {
  return (
    <Card className="sticky top-24">
      <CardHeader>
        <CardTitle className="text-xl text-gray-800">Filtres</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Type Filter */}
        <div>
          <h4 className="font-medium mb-3 text-gray-700">Types</h4>
          <div className="grid grid-cols-2 gap-2">
            {POKEMON_TYPES.map((type) => (
              <Button
                key={type.name}
                variant={selectedTypes.includes(type.name) ? "default" : "outline"}
                size="sm"
                className={cn(
                  "text-white border-none transition-all duration-200 hover:scale-105",
                  selectedTypes.includes(type.name) 
                    ? `${type.color} hover:opacity-90` 
                    : `${type.color} opacity-70 hover:opacity-100`
                )}
                onClick={() => onTypeToggle(type.name)}
              >
                {type.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Generation Filter */}
        <div>
          <h4 className="font-medium mb-3 text-gray-700">Génération</h4>
          <Select value={selectedGeneration} onValueChange={onGenerationChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {GENERATIONS.map((gen) => (
                <SelectItem key={gen.value} value={gen.value}>
                  {gen.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* HP Range Filter */}
        <div>
          <h4 className="font-medium mb-3 text-gray-700">Statistiques</h4>
          <div className="space-y-3">
            <div>
              <label className="text-sm text-gray-600">PV minimum: {minHp}</label>
              <Slider
                value={[minHp]}
                onValueChange={(value) => onHpChange(value[0])}
                max={255}
                min={1}
                step={1}
                className="mt-2"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>1</span>
                <span>255</span>
              </div>
            </div>
          </div>
        </div>

        {/* Selected Filters */}
        {(selectedTypes.length > 0 || selectedGeneration !== 'all' || minHp > 1) && (
          <div>
            <h4 className="font-medium mb-3 text-gray-700">Filtres actifs</h4>
            <div className="flex flex-wrap gap-2 mb-3">
              {selectedTypes.map((type) => {
                const typeInfo = POKEMON_TYPES.find(t => t.name === type);
                return (
                  <Badge key={type} variant="secondary" className="cursor-pointer" onClick={() => onTypeToggle(type)}>
                    {typeInfo?.label} ×
                  </Badge>
                );
              })}
              {selectedGeneration !== 'all' && (
                <Badge variant="secondary" className="cursor-pointer" onClick={() => onGenerationChange('all')}>
                  {GENERATIONS.find(g => g.value === selectedGeneration)?.label} ×
                </Badge>
              )}
              {minHp > 1 && (
                <Badge variant="secondary" className="cursor-pointer" onClick={() => onHpChange(1)}>
                  PV ≥ {minHp} ×
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Clear Filters Button */}
        <Button 
          onClick={onClearFilters}
          className="w-full bg-gradient-to-r from-red-500 to-blue-500 text-white hover:from-red-600 hover:to-blue-600 transition-all duration-200 hover:scale-105"
        >
          Réinitialiser
        </Button>
      </CardContent>
    </Card>
  );
}
