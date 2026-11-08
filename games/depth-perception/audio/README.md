# Phase Shift Foundry audio

Every gameplay, signature, ambience, menu-music, and level-music semantic ID is
now bound through `audio-manifest.json`. Sound effects use a fixed media pool;
ambience and music each use one dedicated media element. All are owned by the
central AudioManager, including when the game is opened without HTTP fetching.

Earlier signature alternatives remain under `review/` for reference. They are no
longer unresolved and do not override the final assignments.

The five prepared `scroll_001`–`scroll_005` ambience files are also preserved,
but intentionally unused. Analysis found 19 sharp attacks per second in every
file, which produced the rapid clicking heard during levels. Level music and the
discrete clunk, piston, steam, and electric-arc effects remain active.

See `processing-log.json` and `assignment-pass-2.json` for source-to-output
transformations. The complete project package also includes the audit reports.
