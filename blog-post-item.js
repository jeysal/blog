"use strict";

import {
  BehaviorSubject,
  switchMap,
  throwError,
  map,
  shareReplay,
} from "https://cdn.jsdelivr.net/npm/rxjs@7.5.7/+esm";
import { fromFetch } from "https://cdn.jsdelivr.net/npm/rxjs@7.5.7/fetch/+esm";
import {
  getPublishedDate,
  serializeTimeElement,
} from "./utils/published-time.js";

const ATTRIBUTES = {
  HREF: "href",
};
class BlogPostItemElement extends HTMLAnchorElement {
  #href$;
  #post$;
  #postSub;

  constructor() {
    super();
    this.#href$ = new BehaviorSubject(this.getAttribute(ATTRIBUTES.HREF));
    this.#post$ = this.#href$.pipe(
      switchMap((href) =>
        fromFetch(href, {
          accept: "text/html",
          selector: (res) =>
            res.ok
              ? res.text()
              : throwError(
                  new Error(
                    `Failed to get blog post from '${href}'. Status code ${res.status}.`
                  )
                ),
        })
      ),
      map((html) => new DOMParser().parseFromString(html, "text/html")),
      map((post) => {
        const title = post.head.querySelector("title")?.innerText;
        if (title == null)
          throw new Error(`Failed to get title for blog post from '${href}'.`);

        const publishedDate = getPublishedDate(post);

        const textPreview = post.body.querySelector("h2 ~ p")?.innerText;
        if (textPreview == null)
          throw new Error(
            `Failed to get text preview for blog post from '${href}'.`
          );

        return {
          title,
          textPreview,
          publishedDate,
        };
      }),
      shareReplay(1)
    );
  }

  connectedCallback() {
    this.#postSub = this.#post$.subscribe(this.updatePost, this.reportError);
  }
  disconnectedCallback() {
    this.#postSub.unsubscribe();
  }

  updatePost = ({ title, textPreview, publishedDate }) => {
    this.textContent = "";

    const titleElement = document.createElement("h2");
    titleElement.textContent = title;

    const textPreviewElement = document.createElement("p");
    textPreviewElement.textContent = textPreview;

    const timeElement = serializeTimeElement(publishedDate);

    this.append(titleElement, textPreviewElement, timeElement);
  };
  reportError = (error) => {
    this.textContent = String(error);
  };

  static get observedAttributes() {
    return Object.values(ATTRIBUTES);
  }
  attributeChangedCallback(name, _oldValue, newValue) {
    switch (name) {
      case ATTRIBUTES.HREF:
        this.#href$.next(newValue);
        break;
      default:
        throw new Error(`Unknown attribute ${name}`);
    }
  }
}

import "https://cdn.jsdelivr.net/npm/@ungap/custom-elements@1.1.1/es.js";
customElements.define("blog-post-item", BlogPostItemElement, { extends: "a" });
