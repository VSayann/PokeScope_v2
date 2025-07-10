export interface PokemonType {
  type: {
    name: string;
    url: string;
  };
}

export interface PokemonStat {
  base_stat: number;
  effort?: number;
  stat: {
    name: string;
    url?: string;
  };
}

export interface PokemonSprites {
  front_default: string;
  front_shiny?: string;
  other: {
    'official-artwork': {
      front_default: string;
    };
    dream_world?: {
      front_default: string;
    };
  };
}

export interface PokemonAbility {
  ability: {
    name: string;
    url: string;
  };
  is_hidden: boolean;
}

export interface PokemonListItem {
  id: number;
  name: string;
  name_fr?: string;
  name_en?: string;
  sprites: {
    front_default: string;
    other: {
      'official-artwork': {
        front_default: string;
      };
    };
  };
  types: PokemonType[];
}

export interface Pokemon extends PokemonListItem {
  height: number;
  weight: number;
  sprites: PokemonSprites;
  stats: PokemonStat[];
  abilities: PokemonAbility[];
  description?: string;
}

export interface PokemonListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: PokemonListItem[];
}

export const TYPE_COLORS: Record<string, string> = {
  normal: '#A8A878',
  fighting: '#C03028', 
  flying: '#A890F0',
  poison: '#A040A0',
  ground: '#E0C068',
  rock: '#B8A038',
  bug: '#A8B820',
  ghost: '#705898',
  steel: '#B8B8D0',
  fire: '#F08030',
  water: '#6890F0',
  grass: '#78C850',
  electric: '#F8D030',
  psychic: '#F85888',
  ice: '#98D8D8',
  dragon: '#7038F8',
  dark: '#705848',
  fairy: '#EE99AC',
  unknown: '#68A090',
  shadow: '#604E82'
};

export const getTypeColor = (typeName: any, variant: 'bg' | 'text' = 'text'): string => {
  // Si typeName est null ou undefined, on retourne une couleur par défaut
  if (typeName == null) {
    return variant === 'bg' ? '#68A09020' : '#68A090';
  }
  
  // Si c'est un objet, on essaie d'extraire le nom du type
  let type: string;
  if (typeof typeName === 'object') {
    type = String(typeName.type?.name || typeName.name || 'normal').toLowerCase().trim();
  } else {
    type = String(typeName).toLowerCase().trim();
  }
  
  // On vérifie si le type existe dans notre mapping
  const color = TYPE_COLORS[type] || '#68A090';
  
  // Si c'est pour le fond, on ajoute de l'opacité
  if (variant === 'bg') {
    return `${color}20`;
  }
  
  return color;
};

export const formatPokemonName = (name: string): string => {
  return name.charAt(0).toUpperCase() + name.slice(1);
};

export const formatPokemonId = (id: number): string => {
  return `#${id.toString().padStart(3, '0')}`;
};
