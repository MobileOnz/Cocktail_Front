import React, {
    useMemo,
    useRef,
    forwardRef,
    useImperativeHandle,
} from 'react';
import BottomSheet, {
    BottomSheetBackdrop,
    BottomSheetBackdropProps,
} from '@gorhom/bottom-sheet';
import theme from '../../assets/styles/theme';
import { View } from 'react-native';

type OpenBottomSheetProps = {
    children: React.ReactNode;
    snapPoints?: (string | number)[];
};

export type OpenBottomSheetHandle = {
    open: () => void;
    close: () => void;
};

const OpenBottomSheet = forwardRef<OpenBottomSheetHandle, OpenBottomSheetProps>(
    ({ children, snapPoints }, ref) => {
        const bottomSheetRef = useRef<BottomSheet>(null);


        const _snapPoints = useMemo(
            () => snapPoints ?? ['80%'],
            [snapPoints],
        );

        useImperativeHandle(ref, () => ({
            open: () => {
                console.log('[OpenBottomSheet] open() called');
                bottomSheetRef.current?.snapToIndex(0); // '80%' 위치

            },
            close: () => {
                console.log('[OpenBottomSheet] close() called');
                bottomSheetRef.current?.close();
            },
        }));

        const renderBackdrop = (props: BottomSheetBackdropProps) => (
            <BottomSheetBackdrop
                {...props}
                appearsOnIndex={0}
                disappearsOnIndex={-1}
                pressBehavior="close"
            />
        );

        return (
            <BottomSheet
                ref={bottomSheetRef}
                index={-1}                       // 처음엔 닫힌 상태
                snapPoints={_snapPoints}
                backdropComponent={renderBackdrop}
                enablePanDownToClose={false}
                enableOverDrag={false}
                enableHandlePanningGesture={false}
                enableContentPanningGesture={false}
                backgroundStyle={{ backgroundColor: theme.background }}
                handleIndicatorStyle={{ backgroundColor: theme.background }}
                onChange={idx => {
                    console.log('[OpenBottomSheet] index changed:', idx);
                }}>

                <View style={{ flex: 1 }}>
                    {children}
                </View>

            </BottomSheet>
        );
    },
);

export default OpenBottomSheet;
