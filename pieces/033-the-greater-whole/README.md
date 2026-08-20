# The Greater Whole

An interactive typographic piece about the way many small, independent forms
are read as a single statement. Every letter and punctuation mark in the
sentence is a control. Crossing one with the knife cursor cuts it from the
statement and releases a composition made only from that character. Its place
remains fixed so the sentence erodes without reflowing. Touch contact and
keyboard activation provide equivalents where rollover is not available.

On fine-pointer devices, the native cursor becomes a compact knife whose blade
switches to the exact color assigned to the newly triggered animation, then
fades back to white after the cut.

## Motion

Eighteen systems—concentric-circle dial, opposing-weight register, oversized edge crops,
conveyor, rain, wave, scale stack, weight matrix, vertical shutter, measured
ledger, compression, stepped cascade, horizontal and vertical variable-ratio
retyping, dots, stripes, ribbon waves, and chevrons—are selected randomly on each interaction. Glyphs
stay square to the page:
movement comes from translation, scale, cropping, weight, and repetition
rather than rotation. Every system lasts exactly 2.5 seconds. New systems are
additive, so moving quickly across the sentence builds temporary wholes from
unrelated parts before each part fades independently.
Most motion unfolds gradually across the full lifespan. A single conveyor row,
rain streak, or small set of wave cells occasionally moves quickly, making
speed an accent within the slower field. Every geometric system is structurally
paired with the activated letter; no animation consists of shapes alone. The
patterns use the same palette and color-only entrance and exit behavior as the
glyphs.

Every background system stays between Geist 100 and 700, moving through clearly
separated light, regular, and mid-weight roles. No canvas animation uses 900;
that weight belongs exclusively to the foreground statement.

The sentence is set large, black, and bold above the canvas. Background glyphs
are always opaque and use the assertive colors sampled from GT Mechanik: hot
pink, acid yellow, olive, and deep green on an off-white ground. Their entrances
and exits interpolate through the ground color, avoiding alpha stacking while
the black statement remains readable above them.

The piece honors reduced-motion preferences by presenting each composition as
a changing 2.5-second still rather than moving its glyphs across the field.

## Type and archive

The only family is Geist Sans. Its variable WOFF2 file and SIL Open Font License
are stored beside the artwork, keeping the piece self-contained and functional
without a server, package manager, CDN, or network connection.

## Debug view

Append `?debug=true` to the piece URL to replace the sentence with a labeled
comparison grid. All eighteen production animation systems run together on the
same lowercase “a,” synchronized to the same 2.5-second loop. The grid uses
five columns on wide screens, four columns at medium widths, and two columns
on narrow screens.
