# Registry tests

These cover the parts of the component source that are algorithms rather than markup, where a wrong
index is invisible in a browser. Today that is the chart's downsampler.

## Run them

```
npm run test -w @sley-ui/registry
```

Nothing has to be built first. Node imports the TypeScript source and strips the types on the way in,
so the suite reads the same file the registry ships.

## What is asserted

The downsampler has to return exactly the target count, keep the first and last point, keep the
points in order, and choose a lone spike over the smooth points around it. A fixed stride misses that
spike, which is the reason the algorithm is here at all, and one test pins that down so the fixture
cannot quietly stop proving it. Two more cover the guards: a series already short enough comes back
untouched, and so does a target below three.

The extremes are not guaranteed in general. A bucket boundary can split a peak and leave it losing to
its own shoulder, so the suite asserts the behaviour at a target where it holds rather than claiming
a rule that is not true. The measured range is on the chart page of the docs site.
