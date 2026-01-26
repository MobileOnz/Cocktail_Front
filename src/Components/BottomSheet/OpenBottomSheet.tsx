import React, {
    useMemo,
    useRef,
    forwardRef,
    useImperativeHandle,
    useCallback,
} from 'react';
import BottomSheet, {
    BottomSheetBackdrop,
    BottomSheetBackdropProps,
    BottomSheetFooter,
    BottomSheetFooterProps,
    BottomSheetScrollView,
} from '@gorhom/bottom-sheet';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import theme from '../../assets/styles/theme';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
type OpenBottomSheetProps = {
    children: React.ReactNode;
    snapPoints?: (string | number)[];
    footer?: React.ReactNode;
};

export type OpenBottomSheetHandle = {
    open: () => void;
    close: () => void;
};

const OpenBottomSheet = forwardRef<OpenBottomSheetHandle, OpenBottomSheetProps>(
    ({ children, snapPoints, footer }, ref) => {
        const bottomSheetRef = useRef<BottomSheet>(null);
        const insets = useSafeAreaInsets();
        const FOOTER_GAP = 220 + insets.bottom;


        const _snapPoints = useMemo(() => snapPoints ?? ['80%'], [snapPoints]);

        useImperativeHandle(ref, () => ({
            open: () => bottomSheetRef.current?.snapToIndex(0),
            close: () => bottomSheetRef.current?.close(),
        }));

        const renderBackdrop = useCallback(
            (props: BottomSheetBackdropProps) => (
                <BottomSheetBackdrop
                    {...props}
                    appearsOnIndex={0}
                    disappearsOnIndex={-1}
                    pressBehavior="close"
                />
            ),
            [],
        );

        const renderFooter = useCallback(
            (props: BottomSheetFooterProps) => {
                if (!footer) { return null; }

                return (
                    <BottomSheetFooter {...props} bottomInset={0}>
                        <SafeAreaView edges={['bottom']} style={{ backgroundColor: theme.background }}>
                            {footer}
                        </SafeAreaView>
                    </BottomSheetFooter>
                );
            },
            [footer],
        );

        return (
            <BottomSheet
                ref={bottomSheetRef}
                index={-1}
                snapPoints={_snapPoints}
                backdropComponent={renderBackdrop}
                bottomInset={0}
                footerComponent={renderFooter}
                enablePanDownToClose={false}
                enableOverDrag={false}
                enableHandlePanningGesture={false}
                enableContentPanningGesture={false} // “시트 드래그” 막기
                backgroundStyle={{ backgroundColor: theme.background }}
                handleIndicatorStyle={{ backgroundColor: theme.background }}
            >
                <View style={styles.fixedHeader}>
                    <TouchableOpacity
                        onPress={() => bottomSheetRef.current?.close()}
                        style={styles.closeButton}
                    >
                        <MaterialIcons name="close" size={26} color="#000" />
                    </TouchableOpacity>
                </View>
                <BottomSheetScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{
                        paddingBottom: footer ? FOOTER_GAP : insets.bottom + 20,
                    }}
                >
                    {children}
                </BottomSheetScrollView>
            </BottomSheet>
        );
    },
);
const styles = StyleSheet.create({
    fixedHeader: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        paddingHorizontal: 16,
        zIndex: 999,
    },
    closeButton: {
        padding: 8,
    },
});

export default OpenBottomSheet;
