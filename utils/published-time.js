export const getPublishedDate = ({ head }) => {
  let publishedDate = head
    .querySelector('meta[property="article:published_time"]')
    ?.getAttribute("content");
  if (publishedDate == null)
    throw new Error(
      `Failed to get published date for blog post from '${src}'.`
    );
  return new Date(publishedDate);
};

export const serializeTimeElement = (publishedDate) => {
  const timeElement = document.createElement("time");
  timeElement.setAttribute("datetime", publishedDate.toISOString());
  timeElement.textContent = new Intl.DateTimeFormat("en", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
    hour: "numeric",
    minute: "numeric",
  }).format(publishedDate);
  return timeElement;
};
