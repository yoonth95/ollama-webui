import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";

const formatCreatedDate = (date: string | Date): string => {
  return formatDistanceToNow(typeof date === "string" ? new Date(date) : date, {
    locale: ko,
    addSuffix: true,
  });
};

export default formatCreatedDate;
