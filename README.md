Wrap a component class and get the `CachedComponent`.

This `CachedComponent` will calculate a `key` from `props` and use the `key` to decide whether to construct a new instance and cache the old or to recover the old component from cache and update `props`.

We can use it with `react-router` easily to save up the time of constructing the **RouteComponent** you already constructed, and achieve an much more fluent routing experience like the native apps.

And besides, this tool also offers some switching component hooks. You can use these hooks to make something like **animation** and so on.