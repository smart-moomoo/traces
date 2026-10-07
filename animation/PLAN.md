# Footprints continuous material scenes

## Objective and delivery

All 23 places retain the approved poster lower-half artwork and get a causal,
continuous environmental story. Image generation creates assets, never output
frames. The renderer evaluates scene state at time t; 1,000 output frames reuse
the same assets. Tonight's explicitly requested milestone is a complete Seattle
proof of concept after documenting the full migration. The other places remain
in scope for the full project, not implicitly completed by this milestone.

## Architecture

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

Use the original poster lower half, extract the original cargo ship, reconstruct
the water/sky behind it once, and render its approach with fixed heading and
perspective. Do not zoom the entire composition or move the little ferry. The
ship's projected size grows as its depth decreases; reflection and wake follow.
At the end the hull fills the view without collision or explosion. Add only
subtle contact movement consistent with a heavy vessel. Use sufficient extracted
texture detail and cap extreme enlargement where it stops being credible.

## All-place story and asset specification

These are fictional environmental studies, not invented autobiographical events.
The source artwork must be inspected before selecting any proposed moving object.
If absent, replace that action with an environmental event supported by the art.

| Place | Event | Required layers and invariant |
|---|---|---|
| Seattle | Cargo approaches from harbor into foreground | Ship, clean plate, reflection, wake; fixed skyline and ferry, stable heading |
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
