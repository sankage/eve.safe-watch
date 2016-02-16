# Safe Watch

A tool to map approximate safe spots in an EVE Online solar system. Safe spots
will be calculated using the standard T-based bookmarking plan (midpoint of a
midpoint). This doesn't account for H-based bookmarks (midpoint of 2 midpoints).

## Formulas


Midpoint:

```
[(x1+x2)/2, (y1+y2)/2, (z1+z2)/2]
```

Distance:

```
√((x2-x1)^2 + (y2-y1)^2 +(z2-z1)^2)
```

## Units

* 1 AU = 149597871 km
* 1 AU = 149597870700 m
* Max DScan range is 14.3 AU or 2147483647 km
* Planet position `{x,y,z}` values are in meters

