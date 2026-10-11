# Footprints continuous material scenes

## Expressive animation revision — October 10, 2026

This revision supersedes the quiet-motion scope and acceptance criteria below.
The October 8 release is a fixed-asset procedural baseline, not evidence that the
requested expressive animation is complete. This revision is a plan; its new
capabilities have not yet been implemented or visually accepted.

### Subject action comes first — latest user correction

The current priority is multiple meaningful subjects and articulated actions.
Water, wind, light and other background effects are optional support. A boat's
hull, mast, two sails and reflection count as ONE subject, not five actors.

- For each source, record a semantic cast, its parts, genuine action vocabulary
  and interactions. Start with the two original San Francisco sailboats, the two
  Bellevue ducks and the three Los Gatos ducks. Do not invent human protagonists.
- Build anticipation, articulation, locomotion, reaction and recovery separately.
  Motion paths alone do not satisfy the action requirement. Bind body parts to a
  parent and coordinate actions with other subjects through the master timeline.
- Review each episode with background effects OFF. Viewers must still see what
  the subjects do, how their poses change, and the sequence of events. Turning
  background shaders up cannot rescue a weak subject performance.
- Static architecture is not a reason to fake unrelated actors. Audit original
  movable subjects first; author necessary few pose assets when a single cutout
  cannot perform the chosen action. Flag missing action capability explicitly.
- Do not call metadata, object counts, parameter changes or rendering throughput
  visual acceptance. Inspect source reconstruction and watch the full actions.

### Decision

Keep PixiJS 8 and GitHub Pages. Add GSAP for nested authored timelines and paths;
use Pixi MeshGeometry/MeshRope for controlled deformation, and articulated
Containers for rigid material pieces. Do not replace the website with a game
engine simply to gain tweens. GSAP is a sequencing tool, not a rigging, physics,
segmentation or storytelling solution.

Spine Professional is the preferred optional visual rig-authoring tool when
editor-based production is wanted: weighted meshes, constraints and reusable
animation clips, with the official spine-pixi-v8 runtime. It requires an
appropriate paid license and authored rigs. It is not an automatic conversion
of paintings into animation. The baseline plan does not depend on purchasing it;
provide a rig adapter so Spine assets can be used later without rewriting scenes.
Do not build a general-purpose animation editor or skeleton engine from scratch.

Official references, checked October 10:
- https://pixijs.com/8.x/guides/components/scene-objects/mesh
- https://gsap.com/docs/v3/GSAP/Timeline/
- https://gsap.com/docs/v3/Plugins/MotionPathPlugin/
- https://en.esotericsoftware.com/spine-pixi
- https://us.esotericsoftware.com/spine-purchase
- https://docs.phaser.io/phaser/concepts/physics

### Representation and runtime

1. Each scene owns a scene graph: fixed art, rigid pieces, articulated groups,
   deformable surfaces, alternate poses, foreground masks and reaction receivers.
   Preserve approved source pigments, shell texture, geometric foundation and
   60–70% composition footprint. Do not distort every shell tile like rubber.
2. Rigid mineral fragments move through joints or relative placement. Deformable
   surfaces use pinned meshes with bounded strain; sails attach to masts, branches
   to trunks. Pose changes requiring unseen surfaces need a few authored texture
   variants, not extreme scaling of one cutout. Image generation is only for
   necessary missing assets/clean plates and is never proportional to frame count.
3. Author reusable clips (bend/release, billow/slacken, detach/tumble/settle,
   approach/break/recede, turn/paddle/glide), with per-scene parameters and timing.
   Clips bind to actual geometry and attachment points. A common wind/contact
   state drives dependent reactions, shadows and reflections.
4. GSAP timelines evaluate numeric controls from the existing master clock.
   Seek must reconstruct state, not rely on callbacks firing in forward order.
   Seed particle trajectories; use fixed-step simulation with cached checkpoints
   or baked numeric trajectories for secondary motion. Baking motion data does
   not mean generating bitmap frames. Pause/replay/seek must agree at equal time.
5. Reflection and wake derive from object pose/velocity and receiver boundaries;
   depth changes update occlusion order. No disconnected generic ripple overlay.
   Shell-textured particles remain sparse and subordinate to the original art.
6. Extend the existing workbench with attachment/mesh/occlusion overlays, editable
   clip parameters, timeline beats and state comparison at arbitrary timestamps.
   Keep authoring controls out of the public exhibition interface.

### Naturalness production contract — required before increasing complexity

Success means a coherent animated material artwork, not photorealism. A frozen
frame must still look like the approved collage; motion must respect its material
logic. Treat the current 23 animations as assets to audit, not accepted templates.
The first work product is an issue ledger with a source image, timestamp, observed
symptom, responsible layer and proposed repair for each scene. Distinguish source,
rig, motion, interaction and staging defects; do not prescribe a shader for all five.

#### 1. Source-first asset construction

For every moving subject, declare a bounded motion envelope before extraction.
That envelope determines which hidden pixels must be reconstructed and which
foreground masks are needed. Separate moving subject, its painted reflection or
shadow, clean plate and foreground: otherwise the original object can remain as
a ghost after movement. Keep a source-to-layer coordinate transform and provenance
for every derived asset. Thin masts, ropes and negative spaces require explicit
alpha inspection; a coarse bounding polygon is insufficient.

Produce a rest-pose reconstruction and compare it with the approved original at
native resolution and public display size, on both light and dark alpha mattes.
Protected regions must remain unchanged; permitted repair regions are explicit.
Inspect the entire swept area with the subject hidden, not just its starting point.
If segmentation or the hidden-area repair fails, repair/rebuild the asset before
animating it. A smaller motion envelope is acceptable only when it still expresses
the intended event; imperceptible movement is not a workaround for bad extraction.

#### 2. Choose the representation from the material

| Representation | Appropriate use | Forbidden shortcut | Required checks |
| --- | --- | --- | --- |
| Rigid fragment/group | Hull, stone, architecture, mineral tiles | Stretching a solid object to simulate turning | Stable proportions and consistent tile scale |
| Articulated groups | Branch hierarchy, reeds, existing animal parts | Whole-object pivot unrelated to an attachment | Parent/child joints remain connected; angle limits |
| Pinned surface | Sail/flag support surface, selective water patch | Rubber deformation of the entire collage | Pins, no triangle inversion, bounded stretch |
| Fragment field | Shell-based foam, moving reflection, loose leaves | Smooth vector particles unrelated to source texture | Source-derived appearance, bounded density and footprint |
| Authored alternate poses | Heading changes exposing new surfaces | Mirroring asymmetric art or flattening it through zero scale | Consistent silhouette, pigment, texture scale and transitions |
| Light/receiver layer | Existing shadow, reflected light, water reflection | Generic dark blob or global brightness pulse | Receiver boundary and causal alignment |

For shell-based cloth, preferentially articulate tiles over a deforming support
rather than stretching the visible mineral texture. Test this at display size;
use limited mesh deformation only where the approved material can tolerate it.
Large perspective changes require new views and are out of scope for a single
flat cutout. A runtime cannot recover unseen geometry from the reference.

#### 3. One scene state drives interacting objects

Each actor defines anchors, material class, allowed degrees of freedom, pose set,
rest pose, motion envelope and depth band. Each receiver defines its surface,
obstacles and contact rules. Each event defines its cause, onset, active interval,
release and residual effects. Values have explicit source-pixel or normalized
scene units; display resizing must not alter physical relationships.

Evaluate in this order: master time -> authored event state -> rig/pose -> world
anchors and contacts -> dependent wake/reflection/shadow -> depth/masks -> render.
Do not independently tween a reflection, shadow or wake to approximately follow
an actor. Use pose for reflection alignment and historical trajectory/velocity for
wake emission; a wake must remain where it was emitted instead of riding along
with the vessel. Water effects must exclude fixed hull/shore/stone masks. A leaf
contacts a specified receiver before it settles; it does not stop at an arbitrary
screen coordinate. Stylized response is authored, but cause and consequence agree.

#### 4. Author movement, including its transitions

Every main action specifies preparation, acceleration, action, recovery and hold
where appropriate; stages can overlap, and not every scene needs the same rhythm.
Define attachment-aware arcs, velocity continuity, follow-through and rest states.
Secondary motion has bounded delay/damping driven by the primary event. Remove
constant universal sine-wave motion from event-critical actors. Ambient motion
may remain, but must not compete with the focal action or pretend to be the story.

For each scene, write a short visible event description and mark which image
features convey each beat. Limit simultaneous focal actions. Preserve the paper
boundary, negative space and tile scale throughout the action, not only at t=0.
Do not enlarge a vessel towards the viewer merely to make the animation noticeable.
When a pose change needs additional images, specify those few assets up front;
never silently substitute a crossfade with a doubled silhouette for a real turn.

#### 5. Review gates and failure routing

These are internal implementation gates, not repeated requests for user approval.

| Gate | Evidence | Failure routes back to |
| --- | --- | --- |
| A: artwork reconstruction | Original/rest composite, alpha mattes, exposed clean plate across full motion envelope | Extraction or repair assets |
| B: rig validity | Extreme poses, attachment overlay, mesh strain/inversion checks, silhouette comparison | Representation, joints or additional poses |
| C: contact and depth | Contact-time closeups; before/during/after occlusion; reflection/wake alignment | Shared state, receiver or masks |
| D: complete animated artwork | Full-speed viewing at desktop/mobile display sizes; event described without labels; beginning/end comparison | Choreography and scene composition, or earlier gates |
| E: runtime and delivery | Repeatable seeks, fixed asset count, frame-time/memory record, page controls and deployed verification | Runtime, resource lifecycle or deployment |

Quantitative checks catch specific defects; none establishes visual naturalness.
Review the whole clip at playback speed plus slow inspection near contacts and
pose transitions. Contact sheets alone cannot prove continuous motion is natural.
Record actual viewing evidence and remaining defects; do not mark an entire set
accepted from automatic loading or pixel-change tests. Separate engineering pass,
internal visual review and any explicit user acceptance in the release record.

### Implementation packages and migration boundaries

The following are planned modules/contracts, not claims of existing functionality:

- Extend the existing scene contract with actor, rig, receiver and event schemas;
  retain original scene IDs and route selection. Version new scene definitions.
- Add a GSAP score adapter that samples numeric controls from master time; keep
  state reconstruction independent of callback order and GSAP's wall-clock ticker.
- Add small rigid-group, pinned-mesh and pose-set adapters; optional Spine adapter
  implements the same sampling interface. Use library primitives rather than
  writing a full skeleton editor or general-purpose physics engine.
- Replace transform-only object mounting incrementally with these adapters;
  bind contacts, depth masks and dependent effects to the evaluated actor state.
- Extend asset preparation manifests with swept repair areas, alpha, pivots and
  receivers. Add workbench views for gates A–D and a per-scene defect ledger.
- Track each of 23 scenes through source audited -> assets ready -> rig ready ->
  interactions ready -> whole-scene reviewed -> release verified. A generic effect
  applied to a scene does not advance it directly to whole-scene reviewed.

Ship the new renderer through explicit per-scene version selection during local
migration. Keep the current release available until the upgraded scene passes the
visual gates. Do not turn a failed new rig into a silent static or micro-motion
fallback and count it as completed. Retain original artwork as reduced-motion
presentation; that is an accessibility mode, not animation acceptance.

Dependencies are pinned and self-hosted for the static site. Measure on named
hardware/browser combinations: target 60 fps desktop and at least 30 fps on the
chosen mobile test device, documenting measured frame times and memory rather
than promising universal performance. Use bounded caches and dispose textures on
scene changes. Simulate deterministically or bake numeric motion for reliable
seeking; all variants must retain fixed image assets across 1,000 output frames.
No paid editor is purchased as part of this plan update.

### Scene programme (proposals, not invented personal memories)

Every sequence must make a visible change and a consequent response readable at
normal viewing size. These beats are adapted after checking source geometry;
never invent a conspicuous new protagonist just to satisfy a template.

| Place | Main event and consequent development | Capability family |
| --- | --- | --- |
| Seattle | Original ferry crosses at source scale while the cargo vessel’s two hoists elevate/hold/stow at different times; cables share boom endpoints. Wake-driven reflection-fragment reassembly remains | rigid hinges, shared-control tether, historical receivers; final art review pending |
| Bellevue | Two original ducks: ledge duck braces/preens/raises its head, swimmer dips/pauses/departs; feet and reflections stay attached | paired subjects, neck joints, contacts |
| San Francisco | Both original boats fill sails at different times, heel/recover, cross in separate lanes and release wind pressure | multiple subjects, pinned mesh, coupled motion |
| Stanford | Two original garden crowns yield in sequence; an attached leaf releases continuously, turns in air, passes the lamp and rests flat on the ground | authored joint release, rigid leaf projection and source-alpha contact shadow; local implementation, final visual review pending |
| Mountain View | Gust traverses reeds in depth order; tips recover with delayed motion as water responds | articulated chains, shared field |
| Sunnyvale | Canopy parts under wind; a moving sun patch crosses lawn and closes again | mesh/groups, source-derived shadow |
| San Jose | Original source is salt ponds, not facades. Author a material crystallization/redistribution event along existing pond boundaries; a light sweep alone is insufficient | source fragment assembly, boundary constraints |
| Los Gatos | Three source ducks: shore bird preens, swimmer dips/approaches/feeds, upended bird balances while feeding | semantic cast, neck joints, contact/receiver |
| Santa Cruz | Hanging flag bends and recovers from its top attachment; original tree tip yields and rebounds with a delay | hanging cloth, fold score, rooted rigid branch |
| Los Angeles | Original east-dome shutter retracts inside its fixed housing; original west telescope elevates about its mount, holds, then both mechanisms recover | rigid mechanical subjects, fixed aperture clipping, original gold-truss alpha; local implementation, final visual review pending |
| Santa Monica | Two original flags lift, fold and relax at different times; source palm-frond articulation remains to implement | independent side-pinned cloth, branch joints |
| San Diego | Wave front approaches, breaks at the actual shore and drains back through the material fragments | segmented wave mesh, sparse particles |
| Dallas | Cloud shadow passes between facade groups, revealing distinct depth and reflected light changes | grouped masks, delayed reflection |
| Fort Worth | Source leaf tumbles onto the pool, makes contact, then drifts with decaying ripples | pose changes, collision event, receiver |
| Chicago | Two source bridge leaves rise/hold/close about fixed pier hinges; original front-facing launch passes and original tender departs later in a separate lane, with source rigging attached | three subjects, paired rigid hinges, staged navigation, historical contacts; local implementation, final review pending |
| Champaign | Original overhead twig releases two distinct source leaves at different times; each turns, descends and stays flat on snow | two deterministic releases from one attachment, separate trajectories and persistent contact; final visual review pending |
| New Orleans | Two source oak twig groups yield; a leaf attached to the upper twig releases, catches a second gust and settles near the root | world-space release reconstructed for every seek, original trunk occlusion, projected rest pose; final visual review pending |
| Wallace | Canopy opens and closes over the gate, exposing and concealing a coherent patch of light | joint groups, projected mask |
| Charleston | Moving canopy shadow traverses successive facade/porch planes and resolves | layered light, occlusion |
| Savannah | Moss strands bend from fixed attachments; a travelling gust produces delayed recovery | rope mesh, damped response |
| Miami | Original reflected forms respond in depth order, split along the fixed stone edge, backwash and reassemble at source positions; stone vessel and poles remain static | bank-constrained rigid source-fragment swell, historical receivers, immutable protection; environmental episode, final review pending |
| Miami Beach | Wave reaches the jetty, splits, breaks at exposed edges and retreats with sparse foam fragments | segmented mesh, obstacle contacts |
| Everglades | Original animal raises its head, holds, sweeps its tail and rests; two source lotus blades cup/unfurl at different times | Root-preserving backbone and leaf meshes implemented locally; source seams, foreground occlusion and full visual acceptance remain pending |

### Implementation order and deliverables

A. Audit all 23 scenes and build the source/rig/motion/interaction defect ledger.
Complete rest reconstruction and motion-envelope asset inspection first. Replace
transform-only object definitions with typed rig/attachment/receiver contracts. Add GSAP behind the existing clock and renderer adapter. Keep public
interaction, original art and current fallback working during migration.
B. Pass asset and rig gates for the relevant scene before choreography. Implement
the action families in production modules: articulated rigid groups,
pinned surfaces, curve paths/pose transitions, material particles, contact-driven
reflection/wakes and layered light. Each family is used by the catalogue rather
than existing as an isolated demonstration.
C. Finish Seattle, San Francisco and New Orleans as complete sequences covering
water interaction, cloth and organic motion. These are integration milestones,
not permission gates or the final stopping point. Fix shared defects in the
capabilities, then author the remaining scenes using their individual programmes.
D. Review all 23 full sequences at actual exhibition size, including transition
into/out of the scene. Preserve texture scale, whitespace and readable silhouettes.
Record unresolved visual faults honestly; the prior release review cannot approve
changed rigs/assets. Refresh source-hashed evidence only after reviewing changes.
E. Verify determinism on backward seeks/replay; alpha/occlusion/attachment bounds;
no frame-dependent image requests over 1,000 renders; representative desktop and
mobile performance, resource disposal and reduced-motion presentation. Reduce
mesh/particle complexity before degrading source resolution. Export is optional:
use the same clock and renderer to capture frames, not an image-generation loop.
F. Push through the existing Pages workflow after visual and functional review,
verify deployed asset versions and all destination entries, and report limitations.

### Acceptance change

Movement must be perceptible at normal scale without a debug pixel comparison.
A viewer should be able to describe what happened and its consequence without
reading text. More amplitude or more objects moving is not by itself improvement.
At least the event-relevant shape/pose or interaction must develop; generic ambient
oscillation alone does not pass. Frame count, clean console and performance do
not substitute for this review. No unsupported claim of user approval is permitted.

Implementation effort scales with unique assets, rigs and authored events. Runtime
and optional export still cost compute per rendered frame, but increasing duration
to 1,000 frames must not incur 1,000 image-generation calls or bitmap downloads.

---

## Objective and delivery

Complete the migration for all 23 places, preserving the approved poster lower-half
artwork and individually authored, continuous environmental stories. Image generation
creates assets, never output frames; 1,000 output frames reuse the same assets.

The goal is complete only when every location has its missing actions, clean layers,
occlusion and cause/effect implemented; complete playback and exhibition controls
have been checked with recorded evidence; the continuous renderer is the default
on the public homepage; the deployment succeeds and the public site is verified.
Preview publication, a POC, five sampled stages, a performance benchmark, or a
subset of locations is progress, never a stopping condition. Continue across
locations without asking the user to repeat “continue.” Do not label an unfinished
story accepted to satisfy the release criteria. Personal memories remain empty
until the user supplies them.

## Delivery record — October 8

The complete 23-scene demo now uses original-material procedural animation in
the default exhibition entry point. Every scene has a recorded visual decision,
a real-time beginning-to-end playback with 24 inspected observations, and a
1,000-render fixed-asset check. The atlas uses one native 1448 × 1086 source
with localized motion instead of six whole-image replacements.

`release-review.json` is the current acceptance record. `full-playback.json`
records actual playback; `region-benchmark.json` records engineering measurements.
`review/` contains all 23 inspected contact sheets. The GitHub Pages workflow
checks these records and source hashes before publishing.

The demo retains a fixed 2D viewpoint and quiet environmental events. It does
not claim 3D rotation, fluid simulation, or a user-authored personal memory.
The earlier checkpoints below document the rejected POC and intermediate
work; they are superseded by this delivery record and the release review.

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
| Everglades | Original alligator raises head and sweeps tail on dry bank; two original lotus leaves cup and release | One animal subject, two plant subjects. No invented splash: tail does not touch water. |

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

### October 8 scene review checkpoint

All 23 scenes were inspected with region overlays and five rendered time samples;
`visual-review.json` records the remaining issues. This is not uninterrupted
playback acceptance. The production dialog still uses the existing films while
`scene-workbench.html` exposes the new renderer for review.

Water masks now exclude the Miami stone vessel and Miami Beach jetty. Cloth
attachment uses two-dimensional anchors. Shared wind propagation has authored
scene directions. Bellevue reuses the original duck and reflection; San Francisco
reuses four original vessel pieces with one common trajectory and separate sail
width tracks. Contacts are emitted at historical actor positions. Scenes without
an authored contact no longer invent a point impact.

San Francisco needed one generated clean plate. Its pixels are composited only
inside feathered original-object footprints; the rest of the original artwork
is retained. The prompt and asset provenance live beside that scene's assets.
San Diego and Miami Beach now have explicit shoreline curves and one timed
approach, break and withdrawal. The crest still needs stronger visual readability
in pale source areas. None of these additions silently changes visualReview to
accepted, and they have not replaced the public exhibition's old films.

### Exhibition integration checkpoint

The opt-in `?animation=continuous` route now loads the same 23 scene implementations
inside the existing map and poster dialog. Normal visitors still get the released
films. Lazy renderer loading, stale-load disposal, closing, scene switching,
pause/resume and full-poster view are connected to the continuous player. All 23
scene switches were exercised through the actual dialog with one canvas at a
time and no console errors. This is integration evidence, not artistic approval.

Stanford now uses an original leaf with lamp occlusion and a persistent landing.
Chicago reuses its small launch, emerging below an explicit bridge occluder;
moored boats are protected from water displacement. Savannah has four narrow
attached moss groups; warm foliage selection supports orange leaves and dry
reeds. Fort Worth's water boundary no longer includes the lawn and white tree.
The remaining story and full-playback issues remain in `visual-review.json`.


### Subject-action implementation update: coastal vegetation and channel passage

The subject-first revision now has twelve authored scene programmes, not twelve accepted scenes. San Diego uses three original palm crowns with fixed hearts and spatially varying frond bend/curl; Mountain View uses three original rooted seed stalks with separate stem loading and delayed upper-stem response. Miami Beach uses the original small launch and two source navigation markers; the markers react in order after the vessel passes their positions. Source scale is retained.

The reusable renderer now supports `radial-fronds` and `stem` rigs. Both preserve their attachments and reconstruct any time without accumulated simulation. New tests measure inversion, strain, fixed roots, delayed response, deterministic seeking and boat/marker timing. Fourteen functional test files pass. These results establish mechanics, not material or story acceptance.

A fixed source repair plate is used per scene. Mountain View required a second repair because the first plate left a stalk behind; the scene uses the corrected v3 plate only inside traced pigment masks. No generated animation frames were added. Source/alpha edge inspection and exhibition-scale readability remain release gates. Eleven scenes still lack the subject-action programme; v2 remains local and unreleased.

### Harbor mechanism implementation

The source ferry and cargo vessel are two semantic subjects. Two cargo booms and their cables remain parts of one cargo vessel. A new source-pixel tether rig anchors one end to the mast and follows the rigid boom’s rotating endpoint while preserving cable thickness. Shared pose controls reconstruct the same GSAP value for mesh and rigid motion, including arbitrary seeks. A detail repair fixes the exposed vertical tower only under the original boom footprints; the skyline, hull and paper remain original. Full 36-second browser playback and the 23-scene lifecycle check are recorded. Reflection-fragment reassembly and full visual acceptance remain outstanding.

### River subject implementation

Chicago now has three semantic subjects: one two-leaf bridge and two original small vessels. The bridge articulates around fixed abutment hinges; its leaves stay at source scale and reunite at rest. The vessels retain their original orientations, wait/accelerate/recover at different times, and use separate lanes. Two antenna cutouts share the tender pose and use an ivory pigment matte to reject original green shoreline pixels. A single generated repair plate is limited to source footprints. Full playback/source sheets are recorded, but truss-hole depth, contact, mobile presentation and final artistic acceptance remain open.

### Material swell and immutable structures

Miami uses 22 source reflection fragments driven by one reusable approach/split/recede/rejoin clip, with delay derived from position and a piece-size-aware bank constraint. These are three reflected forms, not three physical moving vessels; the static sculpture stays static. The inventory now records that distinction explicitly. Source pigment mattes and one fixed cool-water repair are reused for every frame. A new protected-region inspection compares every covered pixel at seven timestamps with effects off and on. It exposed a seven-pixel sampling leak, fixed by bypassing all background displacement and lighting inside the declared immutable mask. All 1,737,544 covered pixels are now stable. Final material/readability review remains open.

Local review should use `python3 scripts/serve-preview.py --port 4173`; the preview serves code and artwork with `Cache-Control: no-store`. This affects local review only, not GitHub Pages caching.

### Subject-priority checkpoint: beach canopy and city materials

Santa Monica now has three original palm crowns and two original flags. Crown
hearts and excluded trunk pixels remain fixed; radial frond pressure and delayed
curl are authored separately from the flag fold channels. The background crown
warp has been removed so it cannot move the same subject twice. Seven enlarged
poses and a complete 30-second background-off playback are recorded. One fixed
repair image is reused under exact source alpha; no generated frame sequence.

Dallas now has an experimental material assembly made from 18 traced source
pieces in three facade groups. Full playback and numeric mechanics pass, but the
11-second view fails artistic review: exposed paper resembles facade holes and
the displaced pieces do not yet form a coherent composition. This failed trial
is kept reviewable locally and must not be released or counted as accepted.

All 23 scenes have a programme, including the failed city trial and Miami's
explicit reflected-form exception. This is an inventory milestone only. The
latest 23 x 1000 rendering run added zero requests; 25 functional tests pass.
The release test intentionally remains failed until affected artwork is reviewed.

### Fixed material hinges and action authoring

The failed Dallas floating-panel trial is superseded by 18 planar shell hinges
on existing facade seams. Hinge positions remain fixed; face foreshortening and
contact-shadow lift derive from the same authored pitch. A single generated
mineral backing replaces the exposed white paper only under traced source masks.
The white-hole defect is resolved in the inspected whole view; full source,
contact and mobile artistic acceptance is still pending.

The local workbench now edits actual GSAP channels and actor tracks. It validates
numeric keys, preserved episode endpoints, world motion bounds and mesh strain
before remounting a draft. Drafts never mutate the catalogue or public site, and
all review gates reset after an edit. Exported JSON records the explicit actions
for later repository integration. The two-time comparison samples actual frames
and reports the same actor, control and receiver state used by the renderer.
All 23 scene definitions round-trip through this authoring contract without state
changes. Browser checks exercised applying an edit, rejecting invalid JSON,
restoring the original score and comparing 0/11-second frames.

Shared hinge changes passed 23 x 1000 fixed-asset rendering with no added image
requests. These engineering checks remain separate from final visual acceptance.
