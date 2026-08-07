# Operating limits

- Browser local catalog uses IndexedDB and has no sync path.
- Video uploads are MP4 only, at most 50 MB, and must report a duration from 5 to 120 seconds.
- Posters are JPEG, PNG, or WebP, at most 5 MB. SVG is rejected.
- A catalog must keep one published scene.
- The demo loads the selected video and one transition target only.
- Browser storage may be evicted. Users can reset local data from `/admin`.
- The native preview ships bundled media only. It has no remote update or store submission setup.
