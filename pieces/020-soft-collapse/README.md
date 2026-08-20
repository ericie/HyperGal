# Soft Collapse

A black-and-white field of geometric cells. Most occupy one unit of the grid;
a handful interrupt it with motifs that span four-by-four units. Groups of
sixteen small frames periodically merge into one large form, while large forms
split back into sixteen independent cells. Each motif has its own geometric
exit and return: forms fold, divide, rotate, open, or collapse inside their
fixed cropped frames. Several independent transitions overlap so the field is
always active without becoming hurried.

Click or tap to move the block under the pointer. Press Space to pause or
resume and R to build a new composition. Add `?seed=anything` to the URL to
revisit a composition.

Add `?debug=true` to open a scrollable motion index of every individual motif
instead of the animated composition. The twelve motifs animate into their
cropped squares on load. Click or focus and activate a tile to play its custom
exit; activate the empty tile again to reverse the motion and bring it back.

The piece respects `prefers-reduced-motion`: the automatic transitions stop,
and clicking changes a local group without an animated transition.

## Archival rule

This folder is fully self-contained. It uses only the Canvas 2D API and
browser-native JavaScript, with no external assets or dependencies.
