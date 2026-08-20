# Operating limits

- Browser-local experience content uses IndexedDB and has no sync path.
- Uploads and locally curated pre-filled tiles accept JPEG, PNG, WebP, and AVIF images only.
- The configuration may contain zero screens. Gallery tile count, browser storage, and usable tile size are the practical limits.
- The seeded experience has a 124 KB cover and six gallery images between 63 KB and 294 KB. Only the cover preloads.
- Browser storage may be evicted. Users can reset local data from `/admin`.
