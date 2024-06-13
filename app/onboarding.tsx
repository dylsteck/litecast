import axios from "axios";
import { router } from "expo-router";
import { SetStateAction, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Carousel, { Pagination } from "react-native-snap-carousel";
import AllFilterImg from '../assets/images/allFilters.png';


interface Item {
  key: number;
  title: string;
  text: string;
  image?: string; 
}


const slides = [
  {
    key: 1,
    title: "Ever feel overwhelmed by your feed?",
    text: "Take control with CozyCast! ‍♀️.",
    image: "",
  },
  {
    key: 2,
    title: "Earn Listening Badges",
    text: "Collect special badges as you listen more.",
    image: "",

  },
  {
    key: 3,
    title: "Discover New Artists",
    text: "Dive in and uncover fresh music favourites.",
    image: "",
  },
];

const Onboarding = () => {
  const [sliderValue, setSliderValue] = useState(0);
  const [tokenError, setTokenError] = useState(false);
  const [loading, setLoading] = useState(false);

 

    const _renderItem = ({ item }: { item: Item }) => {
    return (
      <View className="flex flex-col w-screen">
        {item.key === 1 ? (
          <View className="flex flex-row items-center mt-0">
           
          </View>
        ) : item.key === 2 ? (
          <View className="flex pt-4 flex-col items-center justify-center">
            <Image source={AllFilterImg} style={{width:'100%', height:'100%'}} />
          </View>
        ) : (
          <View className="flex pt-4 flex-row justify-between">          
          </View>
        )}
        {/* <View className='flex text-center'> */}
        <View className="flex justify-center w-screen text-center items-center">
          <Text
            className={`text-white text-center text-4xl ${item.key === 1 ? "pt-10" : item.key === 2 ? "pt-12" : "pt-20"}`}
            style={{ fontFamily: "Voltaire-Regular" }}>
            {item.title}
            
          </Text>
          <Text
            className={`text-white text-center text-base ${item.key === 1 ? "px-28" : "px-20"}`}>
            {item.text}
          </Text>
        </View>
      </View>
    );
  };

  const pagination = () => {
    return (
      <Pagination
        dotsLength={[1, 2, 3].length}
        activeDotIndex={sliderValue}
        // width={382}
        dotStyle={{
          width: 36,
          height: 6,
          borderRadius: 100,
          backgroundColor: "rgba(94, 144, 212, 1)",
          paddingBottom: 0,
        }}
        inactiveDotStyle={{
          width: 36,
          height: 6,
          borderRadius: 100,
          backgroundColor: "rgba(255, 255, 255, 0.2)",
          paddingBottom: 0,
        }}
        dotContainerStyle={{ marginHorizontal: 2, paddingBottom: 0, marginBottom: 0 }}
        inactiveDotOpacity={0.4}
        inactiveDotScale={1}
      />
    );
  };

  return (
    <SafeAreaView className="w-screen h-screen bg-[#0A0B0D]">
      <View className="flex flex-col w-screen h-screen justify-center">
        {/* <AppIntroSlider
        renderItem={_renderItem}
        data={[1, 2, 3]}
        activeDotStyle={{
          width: 48,
          height: 10,
          borderRadius: 100,
          backgroundColor: "rgba(94, 144, 212, 1)",
          marginBottom: 40,
        }}
        dotStyle={{
          width: 48,
          height: 10,
          borderRadius: 100,
          backgroundColor: "rgba(255, 255, 255, 0.2)",
          marginBottom: 40,
        }}
        showNextButton={false}
        showDoneButton={false}
      /> */}
        <Carousel
          data={slides}
          renderItem={_renderItem}
          itemWidth={440}
          sliderWidth={440}
          onSnapToItem={(index: SetStateAction<number>) => setSliderValue(index)}
        />
        <View className="mb-0">{pagination()}</View>
        {loading ? (
                    <View className="flex flex-row justify-center items-center">
          <TouchableOpacity
            style={{
              backgroundColor: "white",
              width: 350,
              height: 50,
              // margin: 60,
              marginBottom: 115,
              borderRadius: 30,
              display: "flex",
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
              gap: 3,
            }}
            disabled={loading}>
            <ActivityIndicator color="black" size="small" />
          </TouchableOpacity>
          </View>
        ) : (
          <View className="flex flex-row justify-center items-center">
            <TouchableOpacity
              style={{
                backgroundColor: "white",
                width: 350,
                height: 50,
                // margin: 60,
                marginBottom: 115,
                borderRadius: 30,
                display: "flex",
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
                gap: 3,
              }}
              // onPress={() => handleFetchUserToken()}
              >
              <Text
                className="text-center font-bold text-base"
                style={{ fontFamily: "Satoshi-Bold" }}>
                Connect to{" "}
              </Text>
              {/* <Image source={applelogo} className="w-6 h-7" /> */}
              <Text className="text-center font-bold text-base">MUSIC</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

export default Onboarding;
