a3-kuksenok-willrs
===============

## Team Members

1. Katie Kuksenok kuksenok@uw.edu
2. Will Scott willrs@uw.edu

## Itneractive UFO visualization

Aimed at novice users, this interactive visualization enables answering the questions: "what's the most interesting UFO activity happening in my area? Can I trust it?"

The dataset, containing 60k sightings, dating back over a 100 years due to a prety open-eneded reporting process, needed to be cleaned considerably.

## Running Instructions

Put your running instructions here.  (Tell us how to open your visualization.) 

If your visualization is web-based,  it would be great if your submissions can be opened online. [Github Pages](http://pages.github.com/) is a good and easy way to put your visualization online so you can put your link here.  For example:

Access our visualization at http://cse512-14w.github.io/a3-kuksenok-willrs/ or download this repository and run `python -m SimpleHTTPServer 9000` and access this from http://localhost:9000/.

## Story Board

[sketch goes here]

- When the user first opens the application, she sees a world map. This map

- We show summary histograms that might be interesting: by shape; by year; by month. Selecting a bar shows a subset of the points - not all, because not all points with shape X have location data, or vice versa. In this sense, there is brushing and linking interaction, but we tried as unobtrusively as possible to get around the incompleteness of the metadata

- We further enable people to dill down to individual data points by clicking on the map. Alternatively, whichever the current "selection" of points is, the corresponding full reports are randomly cycled through on a timer.

### Changes between Storyboard and the Final Implementation

Hark! Foreshadowing!

Probably not going to get to the extra Missile launch feature...but maybe keep it as an easter egg?

## Development Process

- Katie did initial explorations of data dirtiness, and interesting phenomenon (the diary from 1910; distribution of lag; various NUFORC notes)
- Will added geolocation data to records

### Data cleaning & access

We both spent time figuring out in what ways data were dirty; which values were missing, and so on.

The dataset of partial, often unconvincing UFO sightings is something that truly calls for constant closeness to the data. But even 60k records translaes into 80M of data, which is pushing it for a web application - especially if it's not necessary. In dataizer.py, we are doing data cleaning as well as splitting apart raw report text from the metadata, substantially reducing the amount of information we need to load at any given time.