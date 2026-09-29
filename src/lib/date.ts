/**
 * 날짜 표기 공용 유틸.
 *
 * 화면마다 `toLocaleDateString()`(시뮬레이터에서 7/4/2026 미국식)과
 * 자체 포맷이 섞여 있어 '2026.7.4' 한 가지로 통일한다.
 */
export const formatDate = (iso?: string | null): string => {
  if (!iso) {
    return '';
  }
  const d = new Date(iso);
  if (isNaN(d.getTime())) {
    return '';
  }
  return `${d.getFullYear()}.${d.getMonth() + 1}.${d.getDate()}`;
};
