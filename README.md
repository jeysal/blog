# blog

> Tim Seckinger's blog

The source of [my personal blog](https://blog.jeys.al).

## Implementation notes

To implement this, I messed around with an old-school no-tooling (just plain source files served by a web server) approach.
It uses native ESM. The external RxJS library is pulled in from [jsDelivr](https://www.jsdelivr.com/) using its [esm.run](https://www.jsdelivr.com/esm) feature.

I also tried out a no-framework (just custom elements) approach.
Additionally, the blog post items on the home page are constructed from fetching and parsing the HTML of the blog post (as opposed to storing the post as JSX/MDX), at the same time also preloading the post HTML into the cache for navigation.

> Would you recommend this approach?

NO!

Skipping bundling is bad for performance. So is fetching whole blog posts for displaying them on the home page. Further, the home page should use static site generationbecause running JavaScript on the home page to fetch blog posts when they rarely change is unnecessary overhead.

Writing custom elements directly is cumbersome and error-prone. Fetching and parsing HTML to extract information is brittle.

This was a fun experiment and challenge, I tried things I had never done before and I learned new things.
But this is not a good approach to build a blog with good performance and stability, nor is it a fast way to get a blog up and running.
It is, however, good enough to keep for my little blog, and perhaps fun and novel for people to look at.

## RSS

`index.rss` is generated using [`html-to-rss`](https://crates.io/crates/html-to-rss)`.

## License

The content on my blog is licensed under [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/).
