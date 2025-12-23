import React from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
    Easing,
    Extrapolate,
    interpolate,
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming,
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.25;

export interface CardData {
  id: number;
  name: string;
  age: number;
  image: string;
  bio: string;
}

interface SwipeCardProps {
  card: CardData;
  index: number;
  totalCards: number;
  onSwipeLeft: (card: CardData) => void;
  onSwipeRight: (card: CardData) => void;
}

const SwipeCard: React.FC<SwipeCardProps> = ({
  card,
  index,
  totalCards,
  onSwipeLeft,
  onSwipeRight,
}) => {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const isFirstCard = index === 0;

  const panGesture = Gesture.Pan()
    .enabled(isFirstCard)
    .onBegin(() => {
      console.log('Gesture started on card:', card.name, 'index:', index);
    })
    .onUpdate((event) => {
      translateX.value = event.translationX;
      translateY.value = event.translationY;
    })
    .onEnd((event) => {
      console.log('Gesture ended, translationX:', event.translationX);
      const shouldSwipe = Math.abs(event.translationX) > SWIPE_THRESHOLD || 
                          Math.abs(event.velocityX) > 800;
      
      if (shouldSwipe && Math.abs(event.translationX) > 50) {
        // Swipe completed - determine direction
        const direction = event.translationX > 0 ? 1 : -1;
        
        // Ultra-smooth exit animation with timing
        translateX.value = withTiming(direction * SCREEN_WIDTH * 1.5, {
          duration: 400,
          easing: Easing.out(Easing.cubic),
        });
        translateY.value = withTiming(event.translationY + direction * 100, {
          duration: 400,
          easing: Easing.out(Easing.ease),
        });

        // Call appropriate callback based on direction
        if (direction > 0) {
          runOnJS(onSwipeRight)(card);
        } else {
          runOnJS(onSwipeLeft)(card);
        }
      } else {
        // Return to original position with bouncy spring
        translateX.value = withSpring(0, {
          damping: 20,
          stiffness: 300,
          mass: 1,
          overshootClamping: false,
        });
        translateY.value = withSpring(0, {
          damping: 20,
          stiffness: 300,
          mass: 1,
          overshootClamping: false,
        });
      }
    });

  const animatedStyle = useAnimatedStyle(() => {
    const rotate = interpolate(
      translateX.value,
      [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
      [-20, 0, 20],
      Extrapolate.CLAMP
    );

    const opacity = interpolate(
      Math.abs(translateX.value),
      [0, SWIPE_THRESHOLD * 2],
      [1, 0],
      Extrapolate.CLAMP
    );

    const scale = interpolate(
      Math.abs(translateX.value),
      [0, SWIPE_THRESHOLD],
      [1, 0.95],
      Extrapolate.CLAMP
    );

    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { rotate: `${rotate}deg` },
        { scale: isFirstCard ? 1 : scale },
      ],
      opacity: isFirstCard ? 1 : opacity,
    };
  });

  const likeStampStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      translateX.value,
      [0, SWIPE_THRESHOLD / 3, SWIPE_THRESHOLD],
      [0, 0.8, 1],
      Extrapolate.CLAMP
    );
    
    const scale = interpolate(
      translateX.value,
      [0, SWIPE_THRESHOLD / 2, SWIPE_THRESHOLD],
      [0.5, 1.1, 1],
      Extrapolate.CLAMP
    );

    const rotate = interpolate(
      translateX.value,
      [0, SWIPE_THRESHOLD],
      [-30, -15],
      Extrapolate.CLAMP
    );

    return {
      opacity,
      transform: [
        { scale: Math.max(0, scale) },
        { rotate: `${rotate}deg` },
      ],
    };
  });

  const nopeStampStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      translateX.value,
      [-SWIPE_THRESHOLD, -SWIPE_THRESHOLD / 3, 0],
      [1, 0.8, 0],
      Extrapolate.CLAMP
    );
    
    const scale = interpolate(
      translateX.value,
      [-SWIPE_THRESHOLD, -SWIPE_THRESHOLD / 2, 0],
      [1, 1.1, 0.5],
      Extrapolate.CLAMP
    );

    const rotate = interpolate(
      translateX.value,
      [-SWIPE_THRESHOLD, 0],
      [30, 15],
      Extrapolate.CLAMP
    );

    return {
      opacity,
      transform: [
        { scale: Math.max(0, scale) },
        { rotate: `${rotate}deg` },
      ],
    };
  });

  const cardStyle = [
    styles.card,
    {
      zIndex: totalCards - index,
      top: index * 10,
    },
    animatedStyle,
    !isFirstCard && {
      transform: [{ scale: 1 - index * 0.05 }],
    },
  ];

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View style={cardStyle} pointerEvents={isFirstCard ? 'auto' : 'none'}>
        <View style={styles.imageContainer}>
          <View style={[styles.imagePlaceholder, { backgroundColor: card.image }]}>
            <Text style={styles.placeholderText}>📸</Text>
          </View>
          
          {/* Like Stamp */}
          <Animated.View style={[styles.stamp, styles.likeStamp, likeStampStyle]}>
            <Text style={styles.stampText}>LIKE</Text>
          </Animated.View>

          {/* Nope Stamp */}
          <Animated.View style={[styles.stamp, styles.nopeStamp, nopeStampStyle]}>
            <Text style={styles.stampText}>NOPE</Text>
          </Animated.View>
        </View>

        <View style={styles.cardInfo}>
          <Text style={styles.cardName}>
            {card.name}, {card.age}
          </Text>
          <Text style={styles.cardBio}>{card.bio}</Text>
        </View>
      </Animated.View>
    </GestureDetector>
  );
};

const styles = StyleSheet.create({
  card: {
    position: 'absolute',
    width: SCREEN_WIDTH * 0.9,
    height: SCREEN_HEIGHT * 0.7,
    backgroundColor: 'white',
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 10,
  },
  imageContainer: {
    flex: 1,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },
  imagePlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 80,
  },
  cardInfo: {
    padding: 24,
    backgroundColor: 'white',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  cardName: {
    fontSize: 32,
    fontWeight: '800',
    marginBottom: 8,
    color: '#1A1A1A',
    letterSpacing: -0.5,
  },
  cardBio: {
    fontSize: 16,
    color: '#666',
    lineHeight: 22,
  },
  stamp: {
    position: 'absolute',
    top: 60,
    borderWidth: 6,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  likeStamp: {
    right: 40,
    borderColor: '#00E676',
  },
  nopeStamp: {
    left: 40,
    borderColor: '#FF1744',
  },
  stampText: {
    fontSize: 48,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
});

export default SwipeCard;
