import { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Heart, Grid, List, ArrowUp, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { PokemonCard } from "@/components/PokemonCard";
import { PokemonModal } from "@/components/PokemonModal";
import { SearchBar } from "@/components/SearchBar";
import { FilterSidebar } from "@/components/FilterSidebar";
import { Pagination } from "@/components/Pagination";
import { pokemonApi } from "@/services/pokemonApi";
import { Pokemon } from "@/types/pokemon";

export default function Home() {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedGeneration, setSelectedGeneration] = useState("all");
  const [minHp, setMinHp] = useState(1);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [selectedPokemon, setSelectedPokemon] = useState<Pokemon | null>(null);
  const [isLoadingPokemonDetails, setIsLoadingPokemonDetails] = useState(false);

  const itemsPerPage = 20;

  useEffect(() => {
    if (!authLoading && !user) {
      toast({
        title: "Accès non autorisé",
        description: "Connexion en cours...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [user, authLoading, toast]);

  const { data: pokemonData, isLoading: pokemonLoading, error: pokemonError } = useQuery({
    queryKey: ["pokemon", currentPage, itemsPerPage],
    queryFn: () => pokemonApi.getPokemonsDetailed(itemsPerPage, (currentPage - 1) * itemsPerPage),
    staleTime: 5 * 60 * 1000,
  });

  const { data: favorites = [], isLoading: favoritesLoading } = useQuery({
    queryKey: ["/api/favorites"],
    queryFn: pokemonApi.getFavorites,
    enabled: !!user,
    retry: (failureCount, error) => {
      if (isUnauthorizedError(error as Error)) return false;
      return failureCount < 3;
    },
  });

  const { data: favoritePokemonDetails = [], isLoading: favoriteDetailsLoading, error: favoritesError } = useQuery({
    queryKey: ["/api/favorites/details", favorites],
    queryFn: async () => {
      console.log('Chargement des détails des favoris...', { favoritesCount: favorites?.length });
      if (!favorites?.length) return [];
      
      try {
        const details = await Promise.all(
          favorites.map(async (fav: any) => {
            try {
              const pokemon = await pokemonApi.getPokemon(fav.pokemonId);
              console.log('Pokémon chargé:', { id: fav.pokemonId, name: pokemon.name });
              return pokemon;
            } catch (error) {
              console.error('Erreur lors du chargement du Pokémon:', fav.pokemonId, error);
              return null;
            }
          })
        );
        
        // Filtrer les éventuelles valeurs nulles
        return details.filter(Boolean);
      } catch (error) {
        console.error('Erreur lors du chargement des favoris:', error);
        throw error;
      }
    },
    enabled: !!user && showFavoritesOnly && favorites?.length > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });

  const addFavoriteMutation = useMutation({
    mutationFn: pokemonApi.addFavorite,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/favorites"] });
      toast({
        title: "Ajouté aux favoris",
        description: "Ce Pokémon a été ajouté à votre collection !",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error as Error)) {
        toast({
          title: "Non autorisé",
          description: "Connexion en cours...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter aux favoris",
        variant: "destructive",
      });
    },
  });

  const removeFavoriteMutation = useMutation({
    mutationFn: pokemonApi.removeFavorite,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/favorites"] });
      toast({
        title: "Retiré des favoris",
        description: "Ce Pokémon a été retiré de votre collection.",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error as Error)) {
        toast({
          title: "Non autorisé",
          description: "Connexion en cours...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Erreur",
        description: "Impossible de retirer des favoris",
        variant: "destructive",
      });
    },
  });

  const handleToggleFavorite = useCallback((pokemon: Pokemon) => {
    const isFav = favorites.some((fav: any) => fav.pokemonId === pokemon.id);
    if (isFav) {
      removeFavoriteMutation.mutate(pokemon.id);
    } else {
      addFavoriteMutation.mutate(pokemon);
    }
  }, [favorites, addFavoriteMutation, removeFavoriteMutation]);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  }, []);

  const handleTypeToggle = useCallback((type: string) => {
    setSelectedTypes(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
    setCurrentPage(1);
  }, []);

  const handleClearFilters = useCallback(() => {
    setSearchQuery("");
    setSelectedTypes([]);
    setSelectedGeneration("all");
    setMinHp(1);
    setCurrentPage(1);
  }, []);

  const handlePokemonClick = useCallback(async (pokemon: any) => {
    try {
      setIsLoadingPokemonDetails(true);
      const pokemonDetails = await pokemonApi.getPokemon(pokemon.pokedexId || pokemon.id);
      setSelectedPokemon(pokemonDetails);
    } catch (error) {
      console.error('Erreur lors du chargement des détails du Pokémon:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les détails du Pokémon',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingPokemonDetails(false);
    }
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    } finally {
      queryClient.removeQueries({ queryKey: ["user"] });
      window.location.href = "/";
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const getFilteredPokemons = useCallback(() => {
    // Déterminer la source des données en fonction du mode d'affichage
    const sourceData = showFavoritesOnly ? favoritePokemonDetails : pokemonData?.results || [];
    
    console.log('Source des données:', {
      showFavoritesOnly,
      favoriteCount: favoritePokemonDetails?.length,
      pokemonCount: pokemonData?.results?.length,
      sourceDataCount: sourceData.length
    });
    
    if (!sourceData || !sourceData.length) return [];
    
    const filtered = sourceData.filter((pokemon: any) => {
      if (!pokemon) return false;
      
      // Filtre par recherche
      const pokemonName = pokemon.name?.fr || pokemon.name?.en || pokemon.name || '';
      if (searchQuery && !pokemonName.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      
      // Filtre par points de vie minimum
      const hp = pokemon.stats?.hp || 0;
      if (hp < minHp) {
        return false;
      }
      
      // Filtre par type
      const pokemonTypes = (pokemon.types || []).map((t: any) => {
        if (typeof t === 'string') return t.toLowerCase();
        if (t?.type?.name) return t.type.name.toLowerCase();
        if (t?.name) return t.name.toLowerCase();
        return String(t).toLowerCase();
      });
      
      if (selectedTypes.length > 0 && !selectedTypes.some(type => {
        const typeLower = type.toLowerCase();
        return pokemonTypes.some((pt: string) => pt === typeLower);
      })) {
        return false;
      }
      
      // Filtre par génération
      if (selectedGeneration !== 'all' && pokemon.generation?.toString() !== selectedGeneration) {
        return false;
      }
      
      return true;
    });
    
    console.log('Résultats du filtrage:', {
      totalAvantFiltrage: sourceData.length,
      totalApresFiltrage: filtered.length,
      filtres: { searchQuery, selectedTypes, minHp, selectedGeneration, showFavoritesOnly }
    });
    
    return filtered;
  }, [
    showFavoritesOnly,
    favoritePokemonDetails,
    pokemonData?.results,
    searchQuery,
    selectedTypes,
    minHp,
    selectedGeneration
  ]);

  const filteredPokemons = getFilteredPokemons();
  const totalPages = Math.ceil(filteredPokemons.length / itemsPerPage);
  
  const currentPagePokemons = filteredPokemons.slice(
    (currentPage - 1) * itemsPerPage, 
    currentPage * itemsPerPage
  ) as any[];

  const isLoading = authLoading || pokemonLoading || favoritesLoading || 
    (showFavoritesOnly && favoriteDetailsLoading);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-yellow-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-800">PokeScope</h1>
            </div>

            {/* Search Bar */}
            <div className="flex-1 max-w-lg mx-8">
              <SearchBar onSearch={handleSearch} />
            </div>

            {/* User Actions */}
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                className="relative"
                onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
              > Favoris
                <Heart className={`h-5 w-5 ${showFavoritesOnly ? 'text-red-500 fill-current' : 'text-gray-600'}` as string} />
                {favorites?.length > 0 && (
                  <Badge className="absolute -top-1 -right-1 bg-red-500 text-white h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                    {favorites?.length}
                  </Badge>
                )}
              </Button>
              
              <div className="flex items-center space-x-2">
                  {user?.profileImageUrl ? (
                    <img
                      src={user.profileImageUrl}
                      alt="Profile"
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold text-sm">
                        {user?.username?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
                      </span>
                    </div>
                  )}
                <Button variant="ghost" size="sm" onClick={handleLogout}>
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <aside className="lg:w-1/4">
            <FilterSidebar
              selectedTypes={selectedTypes}
              selectedGeneration={selectedGeneration}
              minHp={minHp}
              onTypeToggle={handleTypeToggle}
              onGenerationChange={setSelectedGeneration}
              onHpChange={setMinHp}
              onClearFilters={handleClearFilters}
            />
          </aside>

          {/* Main Content */}
          <div className="lg:w-3/4">
            {/* Controls */}
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center space-x-4">
                <span className="text-gray-600">
                  {showFavoritesOnly ? 'Favoris' : 'Résultats'}: 
                  <span className="font-semibold text-gray-800 ml-1">
                    {showFavoritesOnly ? favorites.length : pokemonData?.count || 0}
                  </span>
                </span>
                <div className="flex space-x-2">
                  <List className="h-4 w-4" />
                </div>
              </div>
            </div>

            {/* Pokemon Grid */}
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl p-6">
                    <Skeleton className="h-48 w-full mb-4 rounded-xl" />
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2 mb-4" />
                    <div className="grid grid-cols-3 gap-2">
                      <Skeleton className="h-8 w-full" />
                      <Skeleton className="h-8 w-full" />
                      <Skeleton className="h-8 w-full" />
                    </div>
                  </div>
                ))}
              </div>
            ) : pokemonError ? (
              <div className="text-center py-12">
                <p className="text-red-500 mb-4">Erreur lors du chargement des Pokémon</p>
                <Button onClick={() => queryClient.invalidateQueries({ queryKey: ["/api/pokemon"] })}>
                  Réessayer
                </Button>
              </div>
            ) : (
              <div className="w-full">
                {currentPagePokemons.length === 0 ? (
                  <div className="text-center py-12 w-full">
                    <p className="text-gray-500 text-lg mb-4">
                      {showFavoritesOnly 
                        ? "Aucun Pokémon dans vos favoris"
                        : "Aucun Pokémon trouvé avec ces filtres"
                      }
                    </p>
                    {!showFavoritesOnly && (
                      <Button onClick={handleClearFilters}>
                        Réinitialiser les filtres
                      </Button>
                    )}
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                      {currentPagePokemons.map((pokemon: any) => (
                        <div 
                          key={`pokemon-${pokemon.id || 'no-id'}-${String(pokemon.name || '').toLowerCase().replace(/\s+/g, '-')}`}
                          onClick={() => handlePokemonClick(pokemon)}
                          className="cursor-pointer"
                        >
                          <PokemonCard 
                            pokemon={pokemon}
                            isFavorite={favorites.some((fav: any) => fav.pokemonId === pokemon.id)}
                            onToggleFavorite={handleToggleFavorite}
                            onOpenDetail={setSelectedPokemon}
                          />
                        </div>
                      ))}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                      <div className="mt-6">
                        <Pagination
                          currentPage={currentPage}
                          totalPages={totalPages}
                          onPageChange={setCurrentPage}
                        />
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Pokemon Detail Modal */}
      {selectedPokemon && (
        <PokemonModal
          pokemon={selectedPokemon}
          isOpen={!!selectedPokemon}
          isFavorite={favorites.some((fav: any) => fav.pokemonId === selectedPokemon.id)}
          onClose={() => setSelectedPokemon(null)}
          onToggleFavorite={handleToggleFavorite}
          isLoading={isLoadingPokemonDetails}
        />
      )}

      {/* Floating Action Button */}
      <Button
        className="fixed bottom-6 right-6 bg-gradient-to-r from-red-500 to-blue-500 text-white w-14 h-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110"
        onClick={scrollToTop}
      >
        <ArrowUp className="h-6 w-6" />
      </Button>
    </div>
  );
}
