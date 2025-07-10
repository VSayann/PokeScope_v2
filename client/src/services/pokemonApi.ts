import { apiRequest } from "@/lib/queryClient";
import type { Pokemon, PokemonListResponse } from "@/types/pokemon";

const TYRADEX_API = 'https://tyradex.vercel.app/api/v1';

export const pokemonApi = {
  getPokemons: async (limit = 20, offset = 0): Promise<any> => {
    const response = await fetch(`${TYRADEX_API}/gen/1`);
    const allPokemons = await response.json();
    const paginated = allPokemons.slice(offset, offset + limit);
    
    return {
      count: allPokemons.length,
      next: offset + limit < allPokemons.length ? `?offset=${offset + limit}&limit=${limit}` : null,
      previous: offset > 0 ? `?offset=${Math.max(0, offset - limit)}&limit=${limit}` : null,
      results: paginated
    };
  },

  getPokemon: async (id: number | string): Promise<any> => {
    const response = await fetch(`${TYRADEX_API}/pokemon/${id}`);
    const data = await response.json();
    
    // Formatage des données pour correspondre à la structure attendue par le composant
    return {
      id: data.pokedexId,
      name: data.name?.fr || data.name?.en || data.name,
      name_fr: data.name?.fr,
      height: data.height || 0,
      weight: data.weight || 0,
      sprites: {
        front_default: data.sprites?.regular || data.sprites?.shiny || '',
        other: {
          'official-artwork': {
            front_default: data.sprites?.regular || data.sprites?.shiny || ''
          }
        }
      },
      types: (data.types || []).map((type: any) => ({
        type: {
          name: typeof type === 'string' ? type : (type.type?.name || type.name || 'normal')
        }
      })),
      stats: [
        { stat: { name: 'hp' }, base_stat: data.stats?.hp || 0 },
        { stat: { name: 'attack' }, base_stat: data.stats?.atk || 0 },
        { stat: { name: 'defense' }, base_stat: data.stats?.def || 0 },
        { stat: { name: 'special-attack' }, base_stat: data.stats?.spe_atk || 0 },
        { stat: { name: 'special-defense' }, base_stat: data.stats?.spe_def || 0 },
        { stat: { name: 'speed' }, base_stat: data.stats?.vit || 0 }
      ],
      abilities: (data.talents || []).map((talent: any) => ({
        ability: {
          name: talent.name || 'inconnu',
          url: ''
        },
        is_hidden: talent.tc || false
      })),
      description: data.category || ''
    };
  },

  searchPokemon: async (query: string): Promise<Pokemon> => {
    // On récupère d'abord tous les Pokémon pour la recherche
    const response = await fetch(`${TYRADEX_API}/gen/1`);
    const allPokemons = await response.json();
    
    // Recherche insensible à la casse et aux accents
    const normalizedQuery = query.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    
    const found = allPokemons.find((p: any) => 
      p.name.fr.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes(normalizedQuery) ||
      p.name.en.toLowerCase().includes(query.toLowerCase())
    );
    
    if (!found) {
      throw new Error('Pokémon non trouvé');
    }
    
    return pokemonApi.getPokemon(found.pokedexId);
  },

  // Les méthodes suivantes restent inchangées car elles concernent les favoris
  getFavorites: async () => {
    const response = await apiRequest('GET', '/api/favorites');
    return response.json();
  },

  addFavorite: async (pokemon: Pokemon) => {
    await apiRequest('POST', `/api/favorites/${pokemon.id}`);
  },

  removeFavorite: async (pokemonId: number) => {
    await apiRequest('DELETE', `/api/favorites/${pokemonId}`);
  },

  checkFavorite: async (pokemonId: number) => {
    const response = await apiRequest('GET', `/api/favorites/${pokemonId}/check`);
    return response.json();
  },

  getPokemonsDetailed: async (limit = 20, offset = 0) => {
    // Pour Tyradex, on peut directement utiliser getPokemons car il renvoie déjà les données complètes
    return pokemonApi.getPokemons(limit, offset);
  },
};
