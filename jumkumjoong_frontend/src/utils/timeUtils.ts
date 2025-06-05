export const convertUTCtoKST = (utcTime: string): string => {
  const date = new Date(utcTime);
  // UTC to KST: 9시간 더하기
  date.setHours(date.getHours() + 9);
  return date.toISOString();
};

export const getCurrentKSTTime = (): string => {
  const now = new Date();
  // 현재 시간을 UTC로 변환한 후 9시간 더해서 KST로 변환
  const utcTime = now.getTime() + (now.getTimezoneOffset() * 60 * 1000);
  const kstTime = new Date(utcTime + (9 * 60 * 60 * 1000));
  return kstTime.toISOString();
};