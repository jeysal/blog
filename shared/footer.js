import {
  getPublishedDate,
  serializeTimeElement,
} from "../utils/published-time.js";

const footer = document.createElement("footer");
footer.append("Published ", serializeTimeElement(getPublishedDate(document)));
document.body.append(footer);
