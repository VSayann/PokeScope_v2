import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Zap, Heart, Search, Users } from "lucide-react";
import {useRef} from 'react';
import { useLocation } from "wouter";

export default function Landing() {
  const ref = useRef<HTMLDivElement | null>(null);
  const [, navigate] = useLocation();

  const handleRegister = () => {
    navigate("/register");
  };

  const handleLogin = () => {
    navigate("/login");
  };

  const handleClick = () => {
    ref.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-yellow-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-800">PokeScope</h1>
            </div>
            <Button 
              onClick={handleLogin}
              className="bg-gradient-to-r from-red-500 to-blue-500 text-white hover:from-red-600 hover:to-blue-600 transition-all duration-200 hover:scale-105"
            >
              Se connecter
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <section className="text-center mb-16">
          <div className="bg-gradient-to-r from-red-500 via-blue-500 to-yellow-500 rounded-3xl p-12 text-white relative overflow-hidden">
            <div className="relative z-10">
              <h2 className="text-5xl md:text-6xl font-bold mb-6">
                Découvrez le monde Pokémon
              </h2>
              <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
                Explorez, collectionnez et apprenez tout sur vos Pokémon préférés avec PokeScope, 
                votre Pokédex personnel et moderne.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  onClick={handleRegister}
                  size="lg"
                  className="bg-white text-gray-800 hover:bg-gray-100 font-semibold px-8 py-4 text-lg transition-all duration-200 hover:scale-105"
                >
                  Commencer l'aventure
                </Button>
              </div>
            </div>
            <div className="absolute top-4 right-4 text-6xl opacity-20">
              <Zap className="animate-pulse" />
            </div>
            <div className="absolute bottom-4 left-4 text-4xl opacity-20">
              <Heart className="animate-pulse" />
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section ref={ref} className="mb-16">
          <h3 className="text-3xl font-bold text-center text-gray-800 mb-12">
            Fonctionnalités
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="text-center hover:shadow-lg transition-shadow duration-200">
              <CardContent className="p-6">
                <div className="bg-blue-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Search className="h-8 w-8 text-blue-600" />
                </div>
                <h4 className="font-semibold text-lg mb-2 text-gray-800">Recherche Avancée</h4>
                <p className="text-gray-600">
                  Trouvez facilement n'importe quel Pokémon par nom, type ou statistiques.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow duration-200">
              <CardContent className="p-6">
                <div className="bg-red-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Heart className="h-8 w-8 text-red-600" />
                </div>
                <h4 className="font-semibold text-lg mb-2 text-gray-800">Favoris Personnalisés</h4>
                <p className="text-gray-600">
                  Sauvegardez vos Pokémon préférés dans votre collection personnelle.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow duration-200">
              <CardContent className="p-6">
                <div className="bg-yellow-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Zap className="h-8 w-8 text-yellow-600" />
                </div>
                <h4 className="font-semibold text-lg mb-2 text-gray-800">Données Complètes</h4>
                <p className="text-gray-600">
                  Accédez aux statistiques, types, évolutions et descriptions détaillées.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow duration-200">
              <CardContent className="p-6">
                <div className="bg-green-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Users className="h-8 w-8 text-green-600" />
                </div>
                <h4 className="font-semibold text-lg mb-2 text-gray-800">Interface Moderne</h4>
                <p className="text-gray-600">
                  Profitez d'une expérience utilisateur fluide et responsive sur tous vos appareils.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* CTA Section */}
        <section className="text-center">
          <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
            <CardContent className="p-12">
              <h3 className="text-3xl font-bold mb-4">
                Prêt à devenir un maître Pokémon ?
              </h3>
              <p className="text-xl mb-8 opacity-90">
                Rejoignez la communauté PokeScope et commencez votre aventure dès maintenant !
              </p>
              <Button 
                onClick={handleLogin}
                size="lg"
                className="bg-white text-gray-800 hover:bg-gray-100 font-semibold px-8 py-4 text-lg transition-all duration-200 hover:scale-105"
              >
                Commencer gratuitement
              </Button>
            </CardContent>
          </Card>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center mb-4">
            <h4 className="text-xl font-bold">PokeScope</h4>
          </div>
          <p className="text-gray-400">
            Votre Pokédex personnel et moderne. Explorez le monde Pokémon comme jamais auparavant.
          </p>
        </div>
      </footer>
    </div>
  );
}
