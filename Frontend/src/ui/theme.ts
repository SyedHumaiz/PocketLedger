import type { ViewStyle } from 'react-native';

export const colors = { background:'#101217', surface:'#1a1e26', surfaceRaised:'#222832', border:'#343c49', text:'#f5f7fb', muted:'#a8b0bd', accent:'#7cdb9a', danger:'#ff7b7b', warning:'#f4c96b' } as const;
export const spacing = { xs:6, sm:10, md:16, lg:24, xl:32 } as const;
export const radius = { sm:10, md:16, lg:22 } as const;
export const screen: ViewStyle = { flex:1, backgroundColor:colors.background, paddingHorizontal:spacing.md };
