# City of Signs

A procedural black-and-white Tokyo of stacked businesses, exposed stairs,
projecting sign boxes and working rooftops. Click, tap, Enter or Space constructs
another arrangement. `?seed=1907` fixes the opening seed; resize recomposes it.

## Tokyo block vocabulary

The user selected **vertical Tokyo: stacked businesses, external stairs, and
rooftop structures**. The active set now has twenty Tokyo blocks, guided by the user’s facade and street photographs:

| Role | Blocks |
|---|---|
| Street level | Shopfront with upstairs entrance; roller shutter with side passage; basement stair with tenant directory; older shop with noren and tiled canopy; stepped marquee with shutter and side stair |
| Occupied floors | Tenant floors with projecting signs; open switchback stair tower; shallow balconies and condensers; service wall with ducts; setback rooms and roof landing; paired round bays; tiled service wall with routed conduits; louvered alley front; glazed structural ribs |
| Working rooftops | Elevated water tank; billboard gantry; lift overrun and equipment; antenna mast and maintenance roof; layered tile eaves; construction crane |

The fan-shaped hall, swelling facade and striped sky vessel remain as three
surreal exceptions. Their windows use the new rectangular vocabulary. The striped
vessel occurs at most once per city. Sign faces remain wordless. Architectural
character comes from mullions, floor slabs, separate upstairs entrances, wall
thickness, exposed circulation, sign brackets and rooftop equipment.

## Viewing the blocks

`?debug=true` shows the 23 active blocks, with the 20 Tokyo blocks first, plus a
complete composition. `?debug=true&all=true` shows the entire 56-block archive.
The 33 older blocks remain inspectable as studies. Catalog navigation links back
to the city and between the active set and full archive.

## Composition

The canvas uses 5–16 unequal bays, selected by
`clamp(round(width / height * 7), 5, 16)`. Three variable-height chambers form each
building. The three feature towers contain the fan, exposed stairs and swelling
wall. Other buildings use sequences of tenant floors, balconies, service walls
and setbacks, with additional round-bay, glazed-rib and louver-front sequences. Ground-only entrances occupy 10–14.5% of viewport height.

Shared rectangular service courts reserve space across adjacent buildings,
combining a roof walk, rear doors, upper and lower landings and a connecting stair.
These replace the earlier vaulted galleries. Whole-building profiles remain
straight or stepped, with a curve on the swelling-wall tower. Rendering uses
only black and white, with browser edge antialiasing, and DPR capped at two.

## Checks and evidence

`node scripts/check-city-of-signs.mjs` checks 480 seeded layouts: active block
reachability, all 56 catalog drawings, finite geometry, shared-court bounds,
fan clearance, Tokyo ground floors, archive exclusion, one rooftop accent,
keyboard/click regeneration and resize. Browser checks include desktop, square,
phone and alternate-seed renders, the active catalog and full archive.

[Photo-detail pass evidence](../../.impeccable/review/city-photo-details/README.md) contains the
before/current source and browser captures. The thumbnail is the actual square
renderer at seed 1907. This is a reviewable direction, awaiting user feedback.
The vertical bay framework and repeated service-court assembly remain visible.

[Previous place pass](../../.impeccable/review/city-place/README.md) and
[six-round history](../../.impeccable/review/city-six-rounds/2026-09-16/README.md)
are retained. Earlier reviews do not imply acceptance of the current design.

## Architectural reference

The user supplied 21 photographs on 2026-09-16. These are the primary detail
reference: stacked balcony slabs and layered rails; sliding windows with curtains,
tracks and bars; round windows that expose stair landings; tiled service walls
with meters, vents and parallel conduit runs; clustered AC housings; louvered
shopfronts, noren, retro marquees, tile eaves, glazed ribs and construction cranes.

The renderer translates their construction into flat binary geometry. Windows
have nested frames and deterministic infill variation. AC fans are dark disks
behind fine grilles with proportioned cases and mounting feet. Dense detail is
concentrated in service and shutter blocks; ordinary party walls remain quieter.
Grille and louver counts respond to available size. No photographs, photographic
textures, shading or lettering are runtime assets.

Earlier general architectural references:

- [Azabu Wintel Building exterior](https://offisite.jp/office/7879): exposed stair circulation and a rooftop billboard.
- [Daikosha building exterior](https://www.palccoat.com/en/case_study/company2019004/): a steel stair attached to a plain commercial facade.
- [Rooftop equipment examples](https://dailyportalz.jp/kiji/shikumi-mieru-biru): supported water tanks, roof railings and utility systems.
