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
