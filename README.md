# TinyStroke Creator Brief

A private, mobile-first onboarding site for UGC creators of [TinyStroke](https://tinystroke.com) washable twist crayons. It walks through the product, the filming style, two hero ads shot by shot, every winning ad grouped by pattern, script templates, a hook bank, do's and don'ts, deliverables, and how to submit.

Anything still marked **To be confirmed by Rose** is highlighted in the page.

## Run it locally

From this folder:

```bash
python3 -m http.server 43123
```

Open [http://127.0.0.1:43123](http://127.0.0.1:43123).

The page is static HTML, CSS, and JavaScript. `content.json` holds the brief. Videos and posters live in `videos/`, named by ad id, and play in the page with sound (tap play; browsers will not start sound on their own).

## Deploy

This folder can go on Vercel, Netlify, or any static host as-is. Do not make it public until Rose has reviewed it. The page sends `noindex`.

## Notes for this build

The two zip parts named in the brief (`content.json` plus `videos/`) were not on disk in this environment. The copy in `content.json` is the full creator brief (welcome, product, filming style, hero breakdowns, pattern gallery, scripts, hooks, do's and don'ts, deliverables, and submission steps). The MP4s were recovered from TinyStroke's public Meta Ad Library so each ad plays with its original soundtrack. Posters are the Ad Library preview frames.
