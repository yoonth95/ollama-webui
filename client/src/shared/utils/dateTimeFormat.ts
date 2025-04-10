const dateTimeFormat = (date: string) => {
  const dateObj = new Date(date);
  const formatter = new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const formattedDate = formatter.format(dateObj);

  return formattedDate;
};

export default dateTimeFormat;
