---
title: JS - An inline loader
---

# {{ $frontmatter.title }}

One upon a time, this was needed to load Javascript files on the frontend, after the page had fully loaded.

```js
/**
 *  A really nice way to dynamically load JavaScript files.
 *  Place this at the bottom of HTML files to load JavaScripts after pageload! :)
 *
 *  The cake is still a lie.
 */
(function (d, scripts) {
  for (var id in scripts)
    if (d.getElementById(id) == null) {
      var js = d.createElement('script');
      js.id = id;
      js.src = scripts[id];
      d.body.appendChild(js);
    }
})(document, {
  jquery: '//ajax.googleapis.com/ajax/libs/jquery/1.8.2/jquery.min.js',
  moment: '//rawgithub.com/timrwood/moment/2.0.0/min/moment.min.js',
  advice: '/js/advice.js',
});
```
