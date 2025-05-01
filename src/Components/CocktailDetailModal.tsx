import React, { useRef, useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Animated,
  FlatList,
  TouchableWithoutFeedback,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { widthPercentage, heightPercentage, fontPercentage } from "../assets/styles/FigmaScreen";
import {API_BASE_URL} from '@env';
import { WINDOW_HEIGHT } from "@gorhom/bottom-sheet";

const server = API_BASE_URL;

interface CocktailDetailModalProps {
  visible: boolean;
  onClose: () => void;
  cocktailIndex: number;
  cocktails: {
    cocktail: {
      id: number;
      cocktail_name: string;
      introduce: string;
      image_url: string;
      cocktail_size: number;
      min_alchol: number;
      max_alchol: number;
    };
    ingredients: {
      unit: string;
      ingredient: string;
      quantity: string;
    }[];
    tastes: {
      tasteDetail: string;
      category: string;
    }[];
    recommends: {
      mood: string;
      season: string;
      situation: string;
    }[];
  }[];
  selectedCocktailId: number;
}

  const  ITEM_WIDTH = widthPercentage(311);
  const ITEM_SPACING = widthPercentage(20);

  const SIDE_SPACING = (widthPercentage(375) - ITEM_WIDTH) / 2;


  
  // 데이터 
  const fetchCocktailById = async (id: number) => {
    const res = await fetch(`${server}/api/public/cocktail?cocktailId=${id}`);
    const json = await res.json();
    return json.data;
  };

const CocktailDetailModal: React.FC<CocktailDetailModalProps> = ({
  visible,
  onClose,
  cocktailIndex,
  cocktails,
  selectedCocktailId,
}) => {
  const flatListRef = useRef<FlatList>(null);
  const scrollX = useRef(new Animated.Value(0)).current;
  const [currentIndex, setCurrentIndex] = useState(cocktailIndex);
  const [fetchedData, setFetchedData] = useState<any | null>(null);

  const [localCocktailData, setLocalCocktailData] = useState<any[]>([]);
  

  // useEffect(() => {
  //   if (visible && selectedCocktailId) {
  //     (async () => {
  //       try {
  //         const data = await fetchCocktailById(selectedCocktailId);
  //         setFetchedData(data);
  //       } catch (err) {
  //         console.error("불러오기 실패:", err);
  //       }
  //     })();
  //   }
  // }, [visible, selectedCocktailId]);

  useEffect(() => {
    if (visible) {
      const fetchAll = async () => {
        const allData = await Promise.all(
          cocktails.map((c) => fetchCocktailById(c.cocktail.id))
        );
        setLocalCocktailData(allData); // 한 번에 다 저장
      };
      fetchAll();
    }
  }, [visible]);

  
  useEffect(() => {
    if (visible) {
      setTimeout(() => {
        flatListRef.current?.scrollToOffset({
          offset: cocktailIndex * (ITEM_WIDTH + ITEM_SPACING),
          animated: false,
        });
        setCurrentIndex(cocktailIndex);
      }, 100);
    }
  }, [visible, cocktailIndex]);

  let isScrolling = false;

  const handleScrollEnd = async (event: any) => {
    if (isScrolling) return;
    isScrolling = true;

    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffsetX / widthPercentage(311));

    flatListRef.current?.scrollToOffset({
      offset: index * (ITEM_WIDTH + ITEM_SPACING),
      animated: true,
    });

    setCurrentIndex(index);

    const selected = cocktails[index]?.cocktail?.id;
  if (selected) {
    try {
      const data = await fetchCocktailById(selected);
      setFetchedData(data); // -> 해당 칵테일 정보 갱신
    } catch (err) {
      console.error("스와이프 중 데이터 불러오기 실패:", err);
    }
  }
    setTimeout(() => {
      isScrolling = false;
    }, 500); // 500ms 후 다시 스크롤 가능
  };


  
return (
  <Modal visible={visible} animationType="fade" transparent>
    <TouchableWithoutFeedback onPress={onClose}>
      <View style={styles.overlay}>
        <Animated.FlatList
          ref={flatListRef}
          data={cocktails}
          horizontal
          pagingEnabled
          onMomentumScrollEnd={handleScrollEnd}
          snapToAlignment="center"
          snapToInterval={ITEM_WIDTH + ITEM_SPACING}
          decelerationRate="fast"
          showsHorizontalScrollIndicator={false}
          keyExtractor={(_, index) => index.toString()}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { x: scrollX } } }],
            { useNativeDriver: false }
          )}
          contentContainerStyle={{ 
            paddingHorizontal: SIDE_SPACING - widthPercentage(10), 
            alignItems: "center" 
          }}
          style={{ height: heightPercentage(550) }}
          renderItem={({ item, index }) => {
            const inputRange = [
              (index - 1) * ITEM_WIDTH,
              index * ITEM_WIDTH,
              (index + 1) * ITEM_WIDTH,
            ];

            const scale = scrollX.interpolate({
              inputRange,
              outputRange: [0.85, 1, 0.85],
              extrapolate: "clamp",
            });

            const translateY = scrollX.interpolate({
              inputRange,
              outputRange: [10, 0, 10],
              extrapolate: "clamp",
            });
            const currentData = localCocktailData[index];

            return (
              <TouchableWithoutFeedback>
                <Animated.View
                  style={[
                    styles.animatedContainer,
                    { transform: [{ scale }, { translateY }] },
                  ]}
                >
                  <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                    <Image source={require("../assets/drawable/cancel.png")} style={styles.closeButton} />
                  </TouchableOpacity>

                  
                  
                  {currentData && (
                      <>
                        <Image
                          source={
                            currentData.cocktail.image_url
                              ? { uri: currentData.cocktail.image_url }
                              : require("../assets/drawable/cocktail.jpg")
                          }
                          style={styles.cocktailImage}
                        />

                      <View style={styles.content}>
                        <Text style={styles.cocktailName}>
                          {currentData.cocktail.cocktail_name}
                        </Text>
                        <Text style={styles.cocktailDescription}>
                          {currentData.cocktail.introduce}
                        </Text>

                        <View style={styles.infoContainer}>
                          <Text style={styles.infoTitle}>기본 정보</Text>
                          <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>잔 크기</Text>
                            <Text style={styles.infoText}>
                              {currentData.cocktail.cocktail_size}ml
                            </Text>
                          </View>
                          <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>기본 맛</Text>
                            <Text style={styles.infoText}>
                              {currentData.tastes?.[0]?.tasteDetail},{" "}
                              {currentData.tastes?.[0]?.category}
                            </Text>
                          </View>
                          <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>도수</Text>
                            <Text style={styles.infoText}>
                              {currentData.cocktail.min_alchol} ~{" "}
                              {currentData.cocktail.max_alchol}
                            </Text>
                          </View>
                          <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>추천 상황</Text>
                            <Text style={styles.infoText}>
                              {currentData.recommends?.[0]?.mood}
                            </Text>
                          </View>
                          <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>재료</Text>
                            <Text style={styles.infoText}>
                              {currentData.ingredients
                                .map((i) => `${i.ingredient} ${i.quantity}${i.unit}`)
                                .join(", ")}
                            </Text>
                          </View>
                        </View>
                      </View>
                    </>
                  )}
                </Animated.View>
              </TouchableWithoutFeedback>
            );
          }}
        />
      </View>
    </TouchableWithoutFeedback>
  </Modal>
);
}


const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  animatedContainer: {
    width: widthPercentage(311),
    backgroundColor: "#FFFCF3",
    borderRadius: widthPercentage(15),
    overflow: "hidden",
    marginHorizontal: ITEM_SPACING / 2,
  },
  closeButton: {
    position: "absolute",
    top: heightPercentage(10),
    right: widthPercentage(10),
    width: widthPercentage(18),
    height: heightPercentage(18),
    zIndex: 10,
  },
  cocktailImage: {
    width: "100%",
    height: heightPercentage(260),
    resizeMode: "cover",
  },
  content: {
    padding: widthPercentage(20),
  },
  cocktailName: {
    fontSize: fontPercentage(18),
    fontWeight: "bold",
    color: "#2d2d2d",
    marginBottom: heightPercentage(4),
  },
  cocktailDescription: {
    fontSize: fontPercentage(14),
    color: "#7d7a6f",
    marginBottom: heightPercentage(16),
  },
  infoContainer: {
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
    paddingTop: heightPercentage(12),
  },
  infoTitle: {
    fontSize: fontPercentage(14),
    fontWeight: "bold",
    color: "#2d2d2d",
    marginBottom: heightPercentage(6),
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: heightPercentage(8),
  },
  infoLabel: {
    fontSize: fontPercentage(14),
    fontWeight: "bold",
    color: "#2D2D2D",
    width: widthPercentage(80),
  },
  infoText: {
    fontSize: fontPercentage(14),
    color: "#7d7a6f",
    flex: 1,
    textAlign: "left",
    flexWrap: "wrap",
  },
});

export default CocktailDetailModal;
