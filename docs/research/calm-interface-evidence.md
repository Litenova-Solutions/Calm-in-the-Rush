# Calm interface evidence review

Reviewed 2026-08-13 by product and engineering. This record covers the interface itself: the pictures, the color, the motion, the sound, the words, and how long a session should last. It sits beside [the photo presence evidence review](photo-presence-evidence.md), which covers one proposed feature rather than the surface as a whole.

The question here is narrower than it looks. Calm in the Rush shows pictures on a screen. Almost every study that supports nature as calming studied real nature, and the studies that used a screen are the weakest ones in the set. The honest position is that the product rests on a smaller evidence base than its subject matter suggests, and the design should be built so that it does not need the stronger claim.

## What the evidence supports

**Looking at nature changes measurable outcomes, in the real thing.** Ulrich (1984), Science 224, examined 46 cholecystectomy patients at a suburban Pennsylvania hospital between 1972 and 1981, matched in 23 pairs on sex, age, smoking status, weight, year of surgery, and floor level. Patients whose window faced trees stayed 7.96 days after surgery against 8.70 days for patients facing a brick wall, took fewer strong analgesic doses on days two through five, and drew 1.13 negative nurses' notes per patient against 3.96. It remains the most-cited result in the field and it is about a window, not a display.

**Natural sound has a meta-analysis behind it.** Buxton, Pearson, Allou, Fristrup, and Wittemyer (2021), PNAS 118(14), found 36 publications on the health effects of natural sound and meta-analysed 18. Stress and annoyance fell, Hedges g = -0.60, 95% CI [-0.97, -0.23]. Health and positive affect rose, g = 1.63, 95% CI [0.09, 3.16]. That second interval is wide enough to be worth stating plainly: the direction is reliable, the magnitude is not. The useful detail for a product is the split. Water sounds produced the largest effect on health and positive affect; bird sounds produced the largest effect on stress and annoyance.

**Slow breathing is the intervention with the clearest physiology.** Heart rate and breathing synchronise near six cycles per minute, the 0.1 Hz baroreflex resonance, and Laborde and colleagues (2022), Psychophysiology 59(1), report that individually tuned resonance frequencies add nothing over a standard six cycles per minute. Reviews of slow-paced breathing report medium to large reductions in anxiety and stress. Six per minute means a ten second period, which is the number any paced motion in this product should use.

**Short breaks help how people feel, and not how they perform.** Albulescu, Macsinga, Rusu, Sulea, Bodnaru, and Tulbure (2022), PLOS One 17(8) e0272460, meta-analysed 22 samples totalling 2,335 people. Micro-breaks of ten minutes or less raised vigor, d = 0.36, 95% CI [0.16, 0.55], and reduced fatigue, d = 0.35, 95% CI [0.19, 0.50], both p < 0.001. Performance did not move, d = 0.16, 95% CI [-0.04, 0.37], p = 0.17, and break length moderated it, b = 0.07, p = 0.006, R2 = 0.34: longer breaks helped performance, short ones did not.

This is the single most directly applicable finding in the record, and it draws the line for what CITR may promise. A one minute scroll is well inside the micro-break definition. It has support for feeling better and none at all for working better. The product may offer a minute of relief. It may not offer focus, productivity, or restored attention.

## What the evidence does not support

**Pictures of nature on a screen are not the same as nature.** Collins, McDonnell, Scott, McNay, Shannon, Augustin, Hoffmann, Johnson, Strayer, and LoTemplio (2025), Frontiers in Human Neuroscience, DOI 10.3389/fnhum.2025.1567689, ran 63 participants through the Eriksen Flanker Task across three sessions, showing nature or urban images for ten minutes in randomised seven second intervals. Error-related negativity amplitude did not differ between nature and urban imagery, chi-square(1) = 0.25, p = 0.62, and did not differ across sessions. The authors conclude that brief exposure to 2-D nature imagery may not produce the attention-dependent responses that real nature produces, and suggest the effect needs more than vision.

Systematic reviews of Attention Restoration Theory reach a compatible conclusion: effects on working memory, attentional control, and cognitive flexibility are stronger and more reliable for actual natural environments than for virtual ones, and recent meta-analytic work puts the effect of nature exposure on sustained attention performance as small.

So the attention claim is the one to drop. What survives for a screen is the affective side: mood, felt stress, and the subjective sense of a pause, which is also what the micro-break meta-analysis measures and what this product is actually for.

**Colour psychology as usually stated is not supported.** The popular version assigns emotions to hues. The controlled work does not. Wilms and Oberfeld (2018), Psychological Research 82, 896-914, showed 62 participants a factorial set of colors varying hue (blue, green, red), saturation (low, medium, high), and brightness (dark, medium, bright) for 30 seconds each, taking valence and arousal ratings alongside continuous skin conductance and heart rate. Arousal rose from blue and green to red. Valence was highest for saturated and bright colors, and blue beat the other hues on valence only at high saturation. Hue on its own decided very little.

Valdez and Mehrabian (1994) had reported the same shape: brightness and saturation drove pleasure more strongly than hue, and the highest arousal ratings landed on a green-yellow rather than on red.

The design consequence is specific and not obvious. Choosing a blue interface because blue is calming is not supported. Keeping the interface desaturated and letting the photograph hold the saturation is supported, because saturation and brightness are the dimensions that move arousal and valence.

**Dark mode is not calmer.** Evidence from 2024 to 2026 is mixed and context-bound. Dark mode reduces the contrast between screen and surroundings in a dim room, and can raise strain in a bright one because dilated pupils make low-contrast text harder to resolve. A 2025 study in Ergonomics found dark themes outperformed light themes on accuracy for medium and hard tasks and matched them on easy tasks. Readers with astigmatism report a halo effect that makes light text on dark backgrounds blur. Preference surveys favour dark mode, one reporting 68.4 percent, which is a preference finding and not a comfort finding.

No mode is correct for everyone, so the product should not choose one on the person's behalf.

## Motion is the highest-risk element on the screen

Motion is where a calm product can actively harm someone. Parallax scrolling, autoplaying video, and continuous animation trigger dizziness, nausea, and headaches in people with vestibular disorders, and the reaction is physical rather than aesthetic. WCAG 2.3.3 Animation from Interactions, Level AAA, requires that motion triggered by interaction can be disabled unless the motion is essential to the function, and the essential exception is narrow. A scroll-driven animation is not essential. The `prefers-reduced-motion: reduce` media query is the declared signal, and honouring it is the whole mechanism.

This constrains two things in the current plan directly. The shallow depth parallax in the photo presence design is exactly the class of motion the vestibular literature names, so it has to be opt-in and reduction-aware. And a picture-led scroll must not attach motion to the scroll itself.

## The first half second

Reinecke, Yeh, Miratrix, Mardiko, Zhao, Liu, and Gajos (2013), CHI 2013, collected ratings of colorfulness, visual complexity, and appeal for 450 websites from 548 volunteers. Models of colorfulness and visual complexity, combined with the viewer's age and education, explain roughly half the variance in appeal ratings taken after 500 milliseconds of exposure. Low visual complexity and high colorfulness predict appeal.

One photograph filling the frame is the lowest-complexity, highest-colorfulness thing a page can open with. The research supports opening on a picture rather than on a layout, which is the shape the product owner asked for on independent grounds.

## Text over photographs

Text on a photographic background is one of the most common contrast failures in accessible design, because the background has no single contrast ratio to measure. The reliable technique is a scrim, a semi-transparent layer between the image and the text that flattens the background into a consistent surface. WCAG 1.4.3 requires 4.5:1 for normal text and 3:1 for large text, and the measurement has to be taken at the point where the contrast is lowest rather than at a representative point.

CITR already uses a scrim under its hero wording. The rule that needs writing down is the measurement point, not the technique.

## Design rules this record fixes

1. The photograph is the interface. Nothing else on the screen competes with it for saturation, contrast, or motion.
2. Keep the interface palette desaturated and let the photograph carry the color. Do not choose interface hues for their supposed emotional meaning.
3. Do not hard-code light or dark. Follow the system setting and let the person override it.
4. Scrim any text that sits over a photograph, and measure contrast at the worst point on the image, 4.5:1 for normal text and 3:1 for large.
5. Pace any deliberate motion at breathing rate, near six cycles per minute, so a drift period sits close to ten seconds and stays steady.
6. Attach no motion to scrolling beyond the scroll itself. No parallax, no scroll-driven reveal.
7. Honour `prefers-reduced-motion` by holding a still frame everywhere, including the phone surface and any photo presence motion.
8. Nothing plays sound without a deliberate action. Nothing autoplays with sound under any condition.
9. Where a section wants sound, prefer water for calm and birdsong where alertness is wanted, following the split in the Buxton meta-analysis.
10. Open on one picture. The first 500 milliseconds are decided by visual complexity and colorfulness, not by explanation.
11. Write nothing the picture already says. Words are for what a picture cannot carry.
12. Keep every control at least 44 by 44 CSS pixels or native points.

## Claim boundary

Calm in the Rush makes no medical claim and is not treatment. It is not a substitute for care, and it does not treat anxiety, depression, insomnia, or pain.

It also makes no cognitive claim. The micro-break meta-analysis found no significant performance effect, and the EEG study found no attention effect from nature imagery on a screen. CITR must not describe itself as improving focus, attention, productivity, or restoration, because the studies closest to what it actually does did not find those effects. What the record supports is a short pause that people feel better after, and that is what the product should say.

## Sources

- Albulescu, P., Macsinga, I., Rusu, A., Sulea, C., Bodnaru, A., and Tulbure, B. T. (2022). "Give me a break!" A systematic review and meta-analysis on the efficacy of micro-breaks for increasing well-being and performance. PLOS One 17(8), e0272460.
- Buxton, R. T., Pearson, A. L., Allou, C., Fristrup, K., and Wittemyer, G. (2021). A synthesis of health benefits of natural sounds and their distribution in national parks. PNAS 118(14), e2013097118.
- Collins, S. A., McDonnell, A. S., Scott, E. E., McNay, G. D., Shannon, M. F., Augustin, L., Hoffmann, J. N., Johnson, S., Strayer, D. L., and LoTemplio, S. B. (2025). Nature imagery's influence on ERN amplitude: an examination of Attention Restoration Theory using EEG. Frontiers in Human Neuroscience. DOI 10.3389/fnhum.2025.1567689.
- Kaplan, S. (1995). The restorative benefits of nature: toward an integrative framework. Journal of Environmental Psychology 15(3), 169-182.
- Laborde, S., Allen, M. S., Borges, U., Iskra, M., Zammit, N., You, M., Hosang, T., Mosley, E., and Dosseville, F. (2022). Psychophysiological effects of slow-paced breathing at six cycles per minute with or without heart rate variability biofeedback. Psychophysiology 59(1), e13952.
- Ohly, H., White, M. P., Wheeler, B. W., Bethel, A., Ukoumunne, O. C., Nikolaou, V., and Garside, R. (2016). Attention Restoration Theory: a systematic review of the attention restoration potential of exposure to natural environments. Journal of Toxicology and Environmental Health, Part B 19(7), 305-343.
- Reinecke, K., Yeh, T., Miratrix, L., Mardiko, R., Zhao, Y., Liu, J., and Gajos, K. Z. (2013). Predicting users' first impressions of website aesthetics with a quantification of perceived visual complexity and colorfulness. Proceedings of CHI 2013, 2049-2058.
- Ulrich, R. S. (1984). View through a window may influence recovery from surgery. Science 224(4647), 420-421.
- Valdez, P., and Mehrabian, A. (1994). Effects of color on emotions. Journal of Experimental Psychology: General 123(4), 394-409.
- W3C (2023). Understanding Success Criterion 2.3.3: Animation from Interactions. Web Content Accessibility Guidelines 2.2.
- Wilms, L., and Oberfeld, D. (2018). Color and emotion: effects of hue, saturation, and brightness. Psychological Research 82, 896-914.
