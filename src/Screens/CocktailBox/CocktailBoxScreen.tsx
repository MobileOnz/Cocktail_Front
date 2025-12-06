import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Appbar } from 'react-native-paper'
import { useNavigation } from '@react-navigation/native'
import { fontPercentage } from '../../assets/styles/FigmaScreen'

const CocktailBoxScreen = () => {
    const navigation = useNavigation()
    return (
        <SafeAreaView style={styles.container}>
            <Appbar.Header style={{ backgroundColor: '#FFF' }}>
                <Appbar.Action icon="chevron-left" onPress={() => { navigation.goBack() }} />
                <View style={{ flex: 0.8, alignItems: 'center' }}>
                    <Text style={{ fontSize: fontPercentage(20), fontWeight: '600', color: '#1B1B1B' }}>칵테일 보관함</Text>
                </View>

            </Appbar.Header>
            <View style={styles.textContainer}>

                <Text style={styles.text}>아직 저장한 칵테일이 없네요.</Text>
                <Text style={styles.text}>마음에 드는 칵테일을 찾아볼까요?</Text>
            </View>

        </SafeAreaView>
    )
}

export default CocktailBoxScreen

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFF'
    },
    textContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    },
    text: {
        color: '#BDBDBD',
        fontWeight: '600',
        fontFamily: 'Pretendard',
        fontSize: fontPercentage(16)
    }
})