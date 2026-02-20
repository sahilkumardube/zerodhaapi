function nowIST() {
  return new Date(
    new Date().toLocaleString("en-US", {
      timeZone: process.env.DEFAULT_TIMEZONE ?? "Asia/Kolkata",
    }),
  );
}

export function getMarketTimingState(date = nowIST()) {
  const day = date.getDay();
  const isWeekday = day >= 1 && day <= 5;
  const minutes = date.getHours() * 60 + date.getMinutes();
  const marketOpen = 9 * 60 + 15;
  const marketClose = 15 * 60 + 30;

  return {
    isWeekday,
    isMarketOpen: isWeekday && minutes >= marketOpen && minutes <= marketClose,
  };
}
