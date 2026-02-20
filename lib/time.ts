export function nowInIST() {
  return new Date(
    new Date().toLocaleString("en-US", {
      timeZone: process.env.DEFAULT_TIMEZONE ?? "Asia/Kolkata",
    }),
  );
}

export function formatDateKey(date = nowInIST()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function isBetweenMinutes(date: Date, startHHMM: string, endHHMM: string) {
  const [sH, sM] = startHHMM.split(":").map(Number);
  const [eH, eM] = endHHMM.split(":").map(Number);
  const minutes = date.getHours() * 60 + date.getMinutes();
  return minutes >= sH * 60 + sM && minutes < eH * 60 + eM;
}
