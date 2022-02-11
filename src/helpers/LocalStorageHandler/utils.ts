import dayjs from "dayjs";
import { StorageItem } from "./types";

const expiryInMinutes = 5;

export const isExpired = (item: StorageItem) => {
  const now = dayjs();
  const storedTime = dayjs(item.timestamp);
  return now.diff(storedTime, "minute") > expiryInMinutes;
};
