# Current Seattle review — October 8

The revised fixed-scale material passage is accepted for this demo after a
36-second real-time playback and inspection of 24 observations. The vessel,
original warm reflection, historical wakes and environment settle together.
The source silhouette preserves cranes and rigging, and no giant approach
remains. See `release-review.json`, `full-playback.json` and `review/Seattle.jpg`.
The five-texture 1,000-frame run uses no per-frame generated images or new asset
requests. Engineering measurements and visual decisions remain separate.

The earlier notes below are historical and describe the rejected POC and its
intermediate fixes; they do not describe the current release status.

---

# Seattle continuous-scene POC

## Implemented

- The approved poster lower half is the source, not the newer frame sequence.
- One generated clean plate repairs the ship and reflection region. The build
  script preserves original pixels outside a feathered repair mask.
- Original ship pixels are extracted with an authored silhouette, including
  separate mast and rigging masks; no replacement vessel or person is generated.
- A deterministic 36-second depth timeline drives ship size and contact position.
- Actual ship texture produces reflected bands; shell texture produces wakes.
  Water coverage clips those effects to the collage rather than the paper.
- One scene uses four loaded image assets, independent of animation duration.
- Pause, replay, seek and background-clock suspension are implemented. Paused
  scenes do not repeatedly render. GPU assets have a disposal path.

## Verification

- Node timeline tests: 1,001 samples are finite, monotonic in approach and
  deterministic. Wake centers stay tied to emission positions. Clock tests cover
  pause, replay, seek and hidden-tab resumption semantics.
- Browser: actual PixiJS/WebGL playback works; beginning and end inspected;
  timeline scrub and replay controls exercised. Narrow layout inspected.
- Browser benchmark after adding GPU completion at batch boundaries: 1,000
  rendered states in 972 ms, four scene assets, zero additional asset requests.
  This is an accelerated rendering workload, NOT measured real-time FPS or a
  claim about all devices. Maximum measured CPU submission was 0.5 ms.
- Visual inspection caught an overly low ship path in mid-story; contact height
  was corrected to remain on the water before the final foreground approach.

## Limitations and remaining full-project work

This is the requested Seattle POC, not the 23-scene migration. The full plan is
in PLAN.md. The cargo keeps its existing perspective: the source has only one
view. Extreme close-up enlarges original texture and cannot reveal new detail.
The alpha silhouette and water/reflection treatment are authored approximations;
complex turning would need more authored views or a local 3D asset. The existing
production map/player have not been replaced by this POC.

## Environment revision after visual feedback

The first POC was rejected for concentrating motion on the vessel. The current
renderer also animates the existing water material and city reflections with a
masked surface response, three propagating ship-origin wave events, and moving
cloud illumination on the sky and architecture. Paper and building geometry
remain registered. No further generated assets were required.

The review page can hide the ship/reflection/wake to inspect the environment
independently. Actual WebGL pixel comparison with the subject hidden at 0 and 12
seconds found 90.7% of samples in the authored central-water region changed by
more than two channel values; four paper corner samples changed by zero. This
proves independent environment activity at those samples, not artistic quality
or exhaustive invariance of every paper pixel. Full visual review remains needed.

Environment-enabled benchmark: 1,000 renders in 2,856 ms, maximum CPU submission
1.2 ms, four fixed assets and zero new asset requests. Measured in the local
browser with explicit GPU completion at batch boundaries; not a device-wide FPS
promise. The updated combined scene was visually inspected and left playing.


## Resumed revision — October 7

The source-pixel silhouette now includes the crane crosspieces, railings and thin rigging. Crop bounds and anchor are read from the layer manifest. The reflected image is a separate cutout of the original artwork, preserving its warm shell composition instead of mirroring the ship. Surface energy and reflected motion now decay with the authored event; wakes cannot be emitted before vessel passage or remain at the final frame.

The reusable asset builder writes a resting reconstruction alongside the original, cutouts and repaired plate, for explicit inspection of seams and lost material. Numerical reconstruction similarity is diagnostic only. Dark/checker/light matte inspection completed; the current result remains subject to full playback review. No scene has been automatically promoted to visually accepted.

Latest actual browser benchmark: 1,000 rendered frames, five fixed textures, zero new texture requests, zero generated frames. This supersedes the earlier four-texture figure; performance is not evidence of a complete story. The all-location workbench remains partial and unpublished.
