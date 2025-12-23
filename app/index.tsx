import React, { useState } from 'react';
import { SafeAreaView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import SwipeCard, { CardData } from './components/SwipeCard';

const INITIAL_CARDS: CardData[] = [
  {
    id: 1,
    name: 'Sarah',
    age: 24,
    image: '#FF6B6B',
    bio: '🎨 Artist | Coffee lover ☕ | Adventure seeker 🌍',
  },
  {
    id: 2,
    name: 'Emma',
    age: 26,
    image: '#4ECDC4',
    bio: '📚 Book worm | Yoga enthusiast 🧘‍♀️ | Dog mom 🐕',
  },
  {
    id: 3,
    name: 'Jessica',
    age: 23,
    image: '#95E1D3',
    bio: '🎵 Music producer | Fitness junkie 💪 | Foodie 🍕',
  },
  {
    id: 4,
    name: 'Olivia',
    age: 25,
    image: '#F38181',
    bio: '✈️ Travel blogger | Photographer 📷 | Beach lover 🏖️',
  },
  {
    id: 5,
    name: 'Sophia',
    age: 27,
    image: '#AA96DA',
    bio: '💻 Software engineer | Gamer 🎮 | Cat person 🐱',
  },
];

export default function Index() {
  const [cards, setCards] = useState<CardData[]>(INITIAL_CARDS);
  const [swipedCards, setSwipedCards] = useState<{ card: CardData; action: string }[]>([]);

  const handleSwipeLeft = (card: CardData) => {
    console.log('Swiped LEFT (Nope):', card.name);
    setSwipedCards((prev) => [...prev, { card, action: 'nope' }]);
    setTimeout(() => {
      setCards((prevCards) => prevCards.filter((c) => c.id !== card.id));
    }, 300);
  };

  const handleSwipeRight = (card: CardData) => {
    console.log('Swiped RIGHT (Like):', card.name);
    setSwipedCards((prev) => [...prev, { card, action: 'like' }]);
    setTimeout(() => {
      setCards((prevCards) => prevCards.filter((c) => c.id !== card.id));
    }, 300);
  };

  const handleReset = () => {
    setCards(INITIAL_CARDS);
    setSwipedCards([]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
        
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.logo}>Tinder</Text>
        </View>

        {/* Cards Container */}
        <View style={styles.cardsContainer}>
          {cards.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No more cards!</Text>
              <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
                <Text style={styles.resetButtonText}>Reset Cards</Text>
              </TouchableOpacity>
            </View>
          ) : (
            cards.map((card, index) => (
              <SwipeCard
                key={card.id}
                card={card}
                index={index}
                totalCards={cards.length}
                onSwipeLeft={handleSwipeLeft}
                onSwipeRight={handleSwipeRight}
              />
            ))
          )}
        </View>
      </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  header: {
    paddingVertical: 24,
    alignItems: 'center',
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  logo: {
    fontSize: 36,
    fontWeight: '900',
    letterSpacing: -1,
  },
  cardsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 30,
    paddingBottom: 20,
  },
  emptyContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 28,
    fontWeight: '800',
    color: '#999',
    marginBottom: 24,
    letterSpacing: -0.5,
  },
  resetButton: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 40,
    paddingVertical: 18,
    borderRadius: 30,
    shadowColor: '#FF6B6B',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  resetButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});
