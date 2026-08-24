export const CARE_CATEGORIES = ["읽기", "걷기", "운동", "명상", "수면", "식사", "만남", "쉬기", "기록하기", "기타"] as const;
export const CARE_LOG_CONTENT_MAX_LENGTH = 500;
export type CareCategory = (typeof CARE_CATEGORIES)[number];
