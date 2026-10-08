# Footprints continuous material scenes

## Objective and delivery

All 23 places retain the approved poster lower-half artwork and get a causal,
continuous environmental story. Image generation creates assets, never output
frames. The renderer evaluates scene state at time t; 1,000 output frames reuse
the same assets. Tonight's explicitly requested milestone is a complete Seattle
proof of concept after documenting the full migration. The other places remain
in scope for the full project, not implicitly completed by this milestone.

## Architecture

### Revision after systemic feedback

The Seattle engineering POC is **not visually accepted**. The user rejected the
inaccurate cutout, the oversized ship against the flat collage, and object motion
being presented as a complete story. Neither 1,000 rendered frames nor changing
pixels is an artistic acceptance criterion. No expansion may treat that POC as
the final visual template.

The production unit is a complete authored scene, with four linked deliverables:

1. **Representation:** approved source crop, semantic layers, exact alpha,
   reconstructed hidden areas, attachment points, foreground occlusion and a
   shared material scale. Choose rigid fragments, deformable mesh, light field or
   authored alternate pose for each layer before choosing its motion.
2. **Causal score:** setup, a readable change and resolution; events reference
   their causes and targets. Effects share the same state, rather than independent
   sine waves pretending to interact. Path and velocity are explicit tracks.
3. **Reconstruction:** first evaluate the unanimated layered scene. Compare with
   the approved art at 1:1 and the final viewing size. Inspect alpha on light and
   dark mattes, thin structures, hidden-area repairs and shared texture scale.
4. **Whole-scene review:** inspect the complete event in context, including
   negative space, rhythm, contact and ending. Only then run performance and
   deployment checks. Engineering success cannot override a failed visual review.

`scene-contract.mjs` makes references, event order, transform constraints and
independently evidenced review outcomes explicit. `seattle-spec.mjs` records the
current failed/pending verdicts honestly. It defines a bounded material-tableau
passage instead of promoting a giant foreground cutout as the solution. The
renderer still needs to implement that revised score before acceptance.

Asset extraction is not automatically reliable. Generative cutouts are candidates,
because they may redraw texture or geometry. They must be compared with the
original; exact source masks are preferred when reliable. Rejected candidates
stay outside production assets. If a required view cannot be represented by the
available layers, author the missing view or revise the staging explicitly.

- Self-hosted, pinned PixiJS 8 renderer, static hosting on existing GitHub Pages.
- Pure deterministic timeline functions: seconds in, transforms/events out.
- Source artwork, clean plate, extracted subject textures, occlusion masks and
  bounded environmental regions. No unrelated invented human protagonists.
- Asset prep is one-time: extract existing art with masks; inpaint uncovered
  regions only when necessary. Preserve original pixels outside edited regions.
- Layer order: paper/background, distant environment, reflection/wake, subjects,
  contact water, foreground occluders. Subject and reflection share one motion
  state; emitted wakes use the subject's historical position, not random centers.
- Rigid material fragments for foliage, restrained deformation for cloth/water;
  no whole-image rubber sheet or perpetually shifting skyline.
- Browser ticker advances elapsed seconds independently of display frame rate.
  Pause/resume, seeking and replay use the same time evaluator. Seed any noise.
- Bounded asset lifecycle; current scene only, dispose GPU textures on exit.
- Keep original poster view and accessible controls. Reduced motion opens a
  representative still; animation remains explicitly playable.
- Development review surface exposes timeline scrubbing, layer inspection and
  an actual 1,000-render benchmark; these controls do not clutter the exhibition.

## Seattle milestone

Use the original poster lower half, extract the original cargo ship and reconstruct
the water/sky behind it once. The revised score keeps a shared 2D material scale;
reflection and wake follow the same authored vessel state. Do not zoom the
entire composition or default to a giant foreground vessel.
The original enlarged-hull ending has been rejected in the systemic review.
Revise the staging to retain a shared 2D material scale and a complete harbor
event; implement the revised scene contract before claiming visual completion.

## All-place story and asset specification

These are fictional environmental studies, not invented autobiographical events.
The source artwork must be inspected before selecting any proposed moving object.
If absent, replace that action with an environmental event supported by the art.

| Place | Event | Required layers and invariant |
|---|---|---|
| Seattle | A harbor breeze accompanies a bounded cargo passage; reflections break and settle | Original ship and authored reflection at constant material scale, clean plate, contact-driven wake; fixed skyline and paper margins |
| Bellevue | Duck crosses and wake settles | Existing duck, water mask, bank occlusion; monotonic path |
| San Francisco | Gust fills sail, boat advances, wind eases | Existing vessel/sail, sea, wake; shared heading and wind |
| Stanford | Breeze dislodges leaf which rests on ground | Existing foliage, leaf, trunk occlusion, ground; no new palm branch |
| Mountain View | Gust travels through reeds | Reed clusters, water; delayed bend and damped recovery |
| Sunnyvale | Cloud shadow crosses wetland | Ground/water/foliage illumination masks; fixed vegetation |
| San Jose | Moving light crosses salt ponds | Individual salt-pond masks; preserve causeways and extracted colors, no invented buildings |
| Los Gatos | Duck touches water, rings expand and fade | Existing duck, fixed ripple origin, lake/bank masks |
| Santa Cruz | Sea breeze passes lighthouse | Existing flag if present, otherwise ocean spray/wave; fixed lighthouse |
| Los Angeles | Twilight and observatory lamps | Architecture lighting masks, sky, lamps; smooth monotonic dusk |
| Santa Monica | Breeze crosses palm crowns | Existing fronds, streetside shadows; shared wind and anchored trunks |
| San Diego | Wave approaches, breaks and retreats | Water, shoreline, foam fragments; fixed shore contact |
| Dallas | Cloud-shadow band travels across facades | Facade masks and shared light field; no geometry changes |
| Fort Worth | A water contact creates concentric ripples | Existing water, reflected structure; one causal stationary center |
| Chicago | Vessel moves along river and under occlusion | Existing vessel, bridge/river masks, wake; continuous size and course |
| Champaign Urbana | Winter breeze disturbs existing snow | Snow and tree masks; preserve winter season, no sudden snow appearance |
| New Orleans | Leaf falls through oak shade and settles | Existing leaf, trunk occlusion, ground/contact shadow; leaf persists |
| Wallace | Cloud shade crosses fence and house | Fence/wall/ground masks; one consistent light direction |
| Charleston | Foliage modulates dappled street light | Existing foliage and architecture masks; constant leaf population |
| Savannah | Hanging moss sways and settles | Moss clusters, trunks/ground; attachment points fixed, no disappearing moss |
| Miami | Gust disturbs stone-boat reflections | Water/reflection masks; stone boat remains fixed |
| Miami Beach | Wave runs along jetty and recedes | Sea, jetty occlusion, foam; wave follows actual shore |
| Everglades | Existing animal stirs water, reeds respond | Original animal if visible, water and reeds; no invented animal |

## Migration steps

1. Inspect all approved lower halves, author normalized layer masks and story
   parameters. Correct the older six-frame stories against actual locations.
2. Implement renderer, deterministic motion primitives and complete Seattle asset
   pipeline. Show a functional local POC, not a placeholder or pre-rendered loop.
3. Apply the shared engine to the other 22 individually authored scenes. Reuse
   mechanisms, not identical stories. Generate only genuinely missing assets.
4. Integrate the player into the existing dialog. Replace rotating map images
   with fixed high-resolution map and subtle localized material animation.
5. Verify every sequence and browser lifecycle. Publish only reviewed scenes,
   preserve a rollback commit, and verify production loading/playback.

## Acceptance criteria

- At least 1,000 actual rendered frames from a bounded asset set, no frame fetches
  or generation calls during playback. Report measured timings, not claimed FPS.
- Deterministic state at identical timestamps regardless of seek history.
- Continuous path, scale and velocity; anchored ripple origins, persistent
  objects, matching reflections/occlusion, no unexplained additions/disappearances.
- Artwork outside selected dynamic regions remains registered and stable.
- Inspect beginning, middle and end AND watch full playback for each scene.
- Test pause, replay, scrub, rapid switching, background/foreground, reduced
  motion, small screen layout and loading failures.
- Use source-resolution assets; do not describe upsampling as new native detail.
- Memory/emotion/personalStory remain null until supplied by the user.

## Cost and constraints

The dominant one-time cost is accurate segmentation and clean-plate repair,
not duration. Increasing rendered frames increases rendering time, not image
generation count or downloaded image count. Complex turns revealing unseen sides
need authored poses or a local 3D asset; a single cutout cannot supply that detail.
Do not substitute scaling for a rotating object. Keep such scenes within their
available perspective or author the additional asset explicitly.

## Authoring implementation

`assets/scenes/Seattle/layers.json` now declares semantic extraction operations;
`scripts/prepare-scene.py` builds masks, cutouts, repairs and material samples
from the manifest and writes source/output hashes. It preserves source RGB for
cutouts and marks builds as not visually accepted. `asset-review.html` displays
source, clean plate and cutout on multiple mattes. The rendering timeline now
reads authored tracks from the scene specification, including bounded constant
material scale. Current Seattle alpha and overall story verdicts remain failed
or pending; these tools make the defects reviewable, they do not fix them by
declaration. The isolated imagegen candidate was retained outside production.


### Resumed implementation checkpoint

The common workbench now loads all 23 original-art scenes. The material object pass supports original-pixel fragments, explicit background repair samples, deterministic position/rotation tracks and foreground occlusion masks. New Orleans exercises that path with an original green shell fragment falling and resting near the tree. Seattle now preserves its original authored reflection rather than reflecting the vessel texture. Neither example has been promoted to a completed visual review.

Source cropping is explicit per poster rather than assuming all photo/art splits fall at the center. Region definitions retain their original source coordinates when the crop changes. The workbench can show motion regions and object paths for comparison against the actual composition. Santa Monica's sea/flag regions and foreground exclusions were corrected using that review. Remaining locations still require this same regional/occlusion review and their missing events; a successful 23-scene lifecycle run does not complete that work.

The previously rejected large foreground ship has been removed from the current art-direction rules. The old Seattle preparation command now delegates to the single manifest builder, preventing it from overwriting reviewed masks with obsolete geometry.
