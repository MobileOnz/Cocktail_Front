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
import { colors } from '../../lib/theme';
import { TAB_BAR_GAP, TAB_BAR_HEIGHT } from '../../lib/layout';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
type OpenBottomSheetProps = {
    children: React.ReactNode;
    snapPoints?: (string | number)[];
    footer?: React.ReactNode;
    /**
     * 떠 있는 하단 탭바가 깔려 있는 화면인지.
     *
     * 탭바는 네비게이터가 화면 위에 absolute 로 얹기 때문에 시트 푸터(초기화/적용하기)를 덮는다.
     * 탭 화면에서 열리는 시트는 true 로 줘서 버튼을 탭바 위로 밀어 올린다.
     * 스택 화면(탭바 없음)에서는 false 여야 한다 — 아니면 아래가 텅 빈다.
     */
    avoidTabBar?: boolean;
};

export type OpenBottomSheetHandle = {
    open: () => void;
    close: () => void;
};

const OpenBottomSheet = forwardRef<OpenBottomSheetHandle, OpenBottomSheetProps>(
    ({ children, snapPoints, footer, avoidTabBar = false }, ref) => {
        const bottomSheetRef = useRef<BottomSheet>(null);
        const insets = useSafeAreaInsets();
        // SafeAreaView 가 insets.bottom 은 이미 먹으므로 탭바가 실제로 더 잡아먹는 만큼만 더한다.
        const tabBarClearance = avoidTabBar ? TAB_BAR_GAP + TAB_BAR_HEIGHT + 8 : 0;
        const FOOTER_GAP = 220 + insets.bottom + tabBarClearance;


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
                        <SafeAreaView
                            edges={['bottom']}
                            style={{ backgroundColor: colors.bg, paddingBottom: tabBarClearance }}
                        >
                            {footer}
                        </SafeAreaView>
                    </BottomSheetFooter>
                );
            },
            [footer, tabBarClearance],
        );

        return (
            <BottomSheet
                ref={bottomSheetRef}
                handleComponent={null}
                index={-1}
                snapPoints={_snapPoints}
                backdropComponent={renderBackdrop}
                bottomInset={0}
                footerComponent={renderFooter}
                enablePanDownToClose={false}
                enableOverDrag={false}
                enableHandlePanningGesture={false}
                enableContentPanningGesture={false} // “시트 드래그” 막기
                backgroundStyle={{ backgroundColor: colors.bg }}
                handleIndicatorStyle={{ backgroundColor: colors.bg }}
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
        paddingTop: 20,
        paddingRight: 8,
    },
});

export default OpenBottomSheet;
