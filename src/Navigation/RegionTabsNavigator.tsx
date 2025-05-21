import React from "react";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import SelectedRegions from "../BottomSheet/SelectedRegions";

const Tab = createMaterialTopTabNavigator();

const RegionTabsNavigator = ({ selectedRegions, screenProps }) => {

    console.log(selectedRegions)
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarScrollEnabled: true,
        tabBarIndicatorStyle: { backgroundColor: "#000" },
        tabBarLabelStyle: { fontWeight: "bold", color: "#000" },
        tabBarStyle: { backgroundColor: "#fff" },
      }}
    >
      {selectedRegions.map((region) => (
        <Tab.Screen
          key={region}
          name={region}
          options={{ title: region }}
        >
          {/* children 방식으로 전달 */}
          {() => <SelectedRegions region={region} {...screenProps} />}
        </Tab.Screen>
      ))}
    </Tab.Navigator>
  );
};

export default RegionTabsNavigator;
