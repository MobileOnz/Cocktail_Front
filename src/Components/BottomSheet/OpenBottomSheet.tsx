import React, {
    useMemo,
    useRef,
    forwardRef,
    useImperativeHandle,
    useCallback,
    useState,
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

        const [footerHeight, setFooterHeight] = useState(0);

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
                            onLayout={(e) => setFooterHeight(e.nativeEvent.layout.height)}
                            style={{ backgroundColor: theme.background }}
                        >
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
                bottomInset={insets.bottom}
                footerComponent={renderFooter}
                enablePanDownToClose={false}
                enableOverDrag={false}
                enableHandlePanningGesture={false}
                enableContentPanningGesture={false} // “시트 드래그” 막기
                backgroundStyle={{ backgroundColor: theme.background }}
                handleIndicatorStyle={{ backgroundColor: theme.background }}
            >
                <BottomSheetScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{
                        paddingBottom: footer ? footerHeight + insets.bottom : insets.bottom,
                    }}
                >
                    {children}
                </BottomSheetScrollView>
            </BottomSheet>
        );
    },
);

export default OpenBottomSheet;
