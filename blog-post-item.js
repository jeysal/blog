"use strict";

import {
  BehaviorSubject,
  switchMap,
  throwError,
  map,
  withLatestFrom,
  shareReplay,
  timer,
  takeUntil,
} from "https://cdn.jsdelivr.net/npm/rxjs@7.5.7/+esm";
import { fromFetch } from "https://cdn.jsdelivr.net/npm/rxjs@7.5.7/fetch/+esm";

const ATTRIBUTES = {
  SRC: "src",
};
class BlogPostItemElement extends HTMLLIElement {
  #src$;
  #post$;
  #postSub;
  #loadingIndicatorSub;

  constructor() {
    super();
    this.#src$ = new BehaviorSubject(this.getAttribute(ATTRIBUTES.SRC));
    this.#post$ = this.#src$.pipe(
      switchMap((src) =>
        fromFetch(src, {
          accept: "text/html",
          selector: (res) =>
            res.ok
              ? res.text()
              : throwError(
                  new Error(
                    `Failed to get blog post from '${src}'. Status code ${res.status}.`
                  )
                ),
        })
      ),
      map((html) => new DOMParser().parseFromString(html, "text/html")),
      map((post) => {
        const title = post.head.querySelector("title")?.innerText;
        if (title == null)
          throw new Error(`Failed to get title for blog post from '${src}'.`);

        let publishedDate = post.head
          .querySelector('meta[property="article:published_time"]')
          ?.getAttribute("content");
        if (publishedDate == null)
          throw new Error(
            `Failed to get published date for blog post from '${src}'.`
          );
        publishedDate = new Date(publishedDate);

        const textPreview = post.body.querySelector("p")?.innerText;
        if (textPreview == null)
          throw new Error(
            `Failed to get text preview for blog post from '${src}'.`
          );

        return {
          title,
          textPreview,
          publishedDate,
        };
      }),
      withLatestFrom(this.#src$),
      map(([postData, src]) => ({ ...postData, src })),
      shareReplay(1)
    );
  }

  connectedCallback() {
    this.#postSub = this.#post$.subscribe(this.updatePost, this.reportError);
    this.#loadingIndicatorSub = timer(1000)
      .pipe(takeUntil(this.#post$))
      .subscribe(this.showLoadingIndicator);
  }
  disconnectedCallback() {
    this.#postSub.unsubscribe();
    this.#loadingIndicatorSub.unsubscribe();
  }

  updatePost = ({ title, textPreview, publishedDate, src }) => {
    this.textContent = "";

    const titleElement = document.createElement("h2");
    titleElement.textContent = title;

    const textPreviewElement = document.createElement("p");
    textPreviewElement.textContent = textPreview;

    const timeElement = document.createElement("time");
    timeElement.setAttribute("datetime", publishedDate.toISOString());
    timeElement.textContent = publishedDate.toLocaleString();

    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", src);
    linkElement.append(titleElement, textPreviewElement, timeElement);

    this.append(linkElement);
  };
  showLoadingIndicator = () => {
    this.textContent = "Loading blog post…";
  };
  reportError = (error) => {
    this.textContent = String(error);
  };

  static get observedAttributes() {
    return Object.values(ATTRIBUTES);
  }
  attributeChangedCallback(name, _oldValue, newValue) {
    switch (name) {
      case ATTRIBUTES.SRC:
        this.#src$.next(newValue);
        break;
      default:
        throw new Error(`Unknown attribute ${name}`);
    }
  }
}

customElements.define("blog-post-item", BlogPostItemElement, { extends: "li" });