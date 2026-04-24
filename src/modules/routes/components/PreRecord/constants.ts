import { Dimensions } from 'react-native';

export const SCREEN_WIDTH = Dimensions.get('window').width;
export const ITEM_WIDTH = SCREEN_WIDTH - 24;
export const ITEM_HEIGHT = 118;

export const ACTION_DOCK_BOTTOM = 130;
export const ACTION_DOCK_MAX_HEIGHT = 92;
export const ACTION_DOCK_CLEARANCE = 20;
export const LIST_BOTTOM_OFFSET = ACTION_DOCK_BOTTOM + ACTION_DOCK_MAX_HEIGHT + ACTION_DOCK_CLEARANCE;
export const SUGGEST_HEADER_BOTTOM = LIST_BOTTOM_OFFSET + ITEM_HEIGHT + 14;
