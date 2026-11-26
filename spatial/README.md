# 1AGE Spatial Design 001 — Page prototype

Independent walkable lounge, using the existing local Three.js, Earth texture, logo and gamepad input modules. This is an additive preview at spatial/index.html. The production root, World iframe, existing orbit and profile routes are unchanged.

Design: circular platinum/titanium lounge, panoramic cosmic glazing, Earth and stars, illuminated architectural trim, social stations and low-profile action dock. These are procedural prototype materials, not photorealistic final assets.

Controls: left stick / WASD walks, right stick / arrows / drag looks, Shift runs, E or the action button interacts with the nearest station within reach; tap a nearby station to select it. Home resets arrival. Center 1AGE logo opens navigation and resolution settings. Existing standard-mapped gamepad support provides movement/look, focus navigation, A activation, B cancel and Start menu. Actual Logitech hardware compatibility needs testing.

Review before any domain cutover:
- Open spatial/index.html through a static HTTP server on the branch; verify console and texture loading.
- Test iPhone portrait/landscape, desktop keyboard/mouse, and standard-mapped Logitech gamepad; check control overlap, input cancellation, modal focus and walking bounds.
- Test each station and existing profile routes. These are links to existing preview tools, not new account services.
- Capture arrival and station screenshots and measure frame rate on mobile and desktop. Adjust lighting and architecture with founder feedback.
- Verify main and competing PRs again before merging. Do not modify World, HQ1, HQ2, NNB, NLC or DNS from this branch.
- Future: extract the walking controller and visual tokens into a versioned shared module after device review. Do not automatically replace existing HQ controllers.

No production release, DNS changes, authentication changes or financial services in this prototype.

## Build 002 — realism pass

- Reusable architecture.mjs generates stone/metal tile textures, radial ceiling beams, layered window frames and contact shading. Lighting is warm-white inside and cool-blue outside; no shadow maps or external texture downloads added.
- Improved lounge upholstery, Earth atmospheric shader and front-facing arrival station. The prototype remains procedural; no reference image pixels are copied.
- Keyboard WASD stays usable after an action button receives focus; arrow keys retain focus navigation when a control is focused.
- Review the same arrival camera position before and after the update, check glass transparency and shader compilation, then measure frame times and memory on iOS before adopting these assets elsewhere.
- Production remains unchanged. Visual/device validation is pending.
