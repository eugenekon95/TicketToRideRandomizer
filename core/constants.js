export const DEFAULT_MAX_PLAYERS = 4;
export const TARGET_PLAYERS_COUNT = 4;
export const WHEEL_CANVAS_SIZE = 500;
export const DIFFICULTY_WHEEL_CANVAS_SIZE = 250;

export const GEOMETRY_CONSTANTS = {
    OUTER_PADDING: 10,
    SECTOR_RADIUS_OFFSET: 22,
    INNER_RING_RADIUS: 46,
};

export const RENDERER_CONSTANTS = {
    DEFAULT_LINE_WIDTH: 2,
    HIGHLIGHT_LINE_WIDTH: 4,
    GRADIENT_STOPS: [0, 0.72, 1],
    IMAGE_SIZE: {
        NORMAL: { width: 66, height: 41 },
        WINNER: { width: 80, height: 50 },
    },
    IMAGE_DISTANCE_FACTOR: 0.64,
};

export const SPINNER_CONSTANTS = {
    EXTRA_SPINS: 360 * 12,
    DURATION: 9000,
    TICK_INTERVAL: 100,
};
