# Photo presence evidence review

Reviewed 2026-08-13 by product and engineering. This record supports the proposed feature in which
a person adds a photograph of someone they love to a calm session, and it decides how much motion
that photograph may carry.

The review answers one question: does animating a photograph of a loved one have published support
as a calming intervention? The short answer is that the photograph has support and the animation
does not. The two claims come apart, and the design follows the split rather than the marketing.

## What the evidence supports

A still image of an attachment figure measurably lowers threat response. Four independent
experimental lines converge.

- Guerra, Sanchez-Adam, Anllo-Vento, Ramirez, and Vila (2012), PLOS One, 54 undergraduates. Viewing
  photographs of a partner, parent, or best friend reduced the defensive eye-blink startle reflex
  against neutral and unpleasant faces, F(2,104) = 24.11, p < 0.0001, with larger zygomatic
  responses, F(2,104) = 19.69, p < 0.0001. Familiarity was ruled out by the pleasantness ratings.
- Younger, Aron, Parke, Chatterjee, and Mackey (2010), PLOS One, 15 participants under thermal pain
  in fMRI. Viewing a partner photograph reduced reported moderate pain from 3.7 to 2.4 on a 10-point
  scale and high pain from 7.2 to 6.2. Only the photograph condition recruited reward regions; a
  distraction task cut pain without them.
- Eisenberger, Master, Inagaki, Taylor, Shirinyan, Lieberman, and Naliboff (2011), PNAS 108(28),
  21 participants. Partner photographs during pain raised ventromedial prefrontal activity, the
  region associated with learned safety signals, and that activity tracked the pain reduction.
- Bryant and Hutanamon (2016), PLOS One, 62 participants. Activating an attachment representation
  after a stressor raised high-frequency heart rate variability against a non-attachment control,
  which is the parasympathetic marker this product cares about most.

Recall of a loved person also carries a separate literature. The nostalgia program of Sedikides,
Wildschut, Routledge, and colleagues reports raised social connectedness, meaning in life, optimism,
and self-esteem across correlational and experimental designs. Reminiscence work using photographs
has been tested clinically: the Cochrane review by Woods and colleagues (2018) pooled 22 trials and
meta-analysed 16 of them across 1,749 people with dementia, and found small improvements in quality
of life, cognition, communication, and mood, strongest for quality of life in care homes. Small and
setting-dependent, but real.

None of that is a medical claim about this product, and this product makes none. The brief lists
medical claims as an explicit non-goal.

## What the evidence does not support

No controlled trial compares an animated photograph against the same photograph held still. The
search covered the calming, grief, reminiscence, and human-computer interaction literature and found
no such comparison. Any claim that motion adds calm is currently unevidenced.

The one empirical study of a shipped product is observational. Kidd and Nieto McAvoy (2023),
Convergence 29(3), coded 6,935 tweets carrying the #DeepNostalgia hashtag in the two weeks after the
MyHeritage feature launched, then thematically analysed a random 5% sample of 316. Sixty percent of
tweets carried emotional content and 88% of those were positive, including people moved to tears by
seeing a relative move for the first time. Eleven percent called the result creepy, weird, or freaky.
The authors describe the response as ambivalent rather than positive, and note that the same
animation can be comforting and disturbing at once.

Against that, the mechanism that predicts harm is one of the better-established findings in the
field. Diel, Weigelt, and MacDorman (2022), ACM Transactions on Human-Robot Interaction 11(1),
meta-analysed 72 studies and 247 effect sizes and put the uncanny valley effect at Hedges g = 1.01,
95% CI [0.80, 1.22]. MacDorman and Chattopadhyay (2016) located the cause in realism inconsistency,
strongest when the eyes, eyelashes, and mouth are the least realistic parts of an otherwise
realistic face. Generated facial motion over a real photograph produces exactly that mismatch.

So the honest position is an asymmetry. The still photograph has four convergent experiments behind
it. The animation has one observational study reporting mixed reactions, and a large meta-analysis
predicting that the specific artefacts of face animation cause eeriness.

## Moderators that reverse the direction

Two findings matter more than the average effect, because a calm product is used by the people the
average hides.

Cavanagh, Glode, and Opitz (2015), Frontiers in Psychology, 71 participants. After a sad film clip,
nostalgic reflection produced worse recovery from sad mood than ordinary recall, F = 8.173,
p = 0.006. Attachment security decided the direction: low insecurity gained happiness from the
nostalgic condition, b = -1.252, p = 0.002, while high insecurity had its sadness prolonged,
b = 1.859, p = 0.0001, interaction b = 0.0911, p = 0.004.

Newman and Sachs (2023), Emotion 23(4), 151 diary participants over 1,356 daily reports plus 445
experimental participants. Nostalgia is not reliably positive. Positively-valenced nostalgia
predicted higher life satisfaction (b = 0.24), meaning (b = 0.19), and self-esteem (b = 0.20), all
p < 0.001, and negatively-valenced nostalgia predicted lower scores on all three. The valence, not
the act of remembering, carried the effect.

A feature that opens with a face and no exit will help some people and hold others in the low mood
they opened the app to leave.

## Grief-specific risk

Continuing-bonds research since Klass, Silverman, and Nickman (1996) treats an ongoing connection to
someone who died as normal rather than pathological. The distinction that survives is between an
internalised bond used as a secure base, which tracks with adjustment, and externalised bonds such
as illusions and sensed presence, which track with unresolved loss. Work on prolonged grief disorder
reports that people with higher symptom levels hold bonds more intensely and show stronger
attentional capture by photographs of the person who died. A product that manufactures a moving,
apparently present version of that person is acting on the externalised side of that line.

Hollanek and Nowaczyk-Basinska (2024), Philosophy and Technology, set out the responsible-design
requirements for simulating a dead person: mutual consent covering both the person whose data is
used and the person who interacts with the result, meaningful transparency about what is synthetic,
adult-only access, and a dignified retirement procedure so a simulation can be ended rather than
recurring without invitation. Their term for the failure mode is an unwanted haunting.

## Legal and regulatory constraints

As of 2026-08-13:

- EU AI Act Article 50 has applied since 2 August 2026. A deployer of a system that generates or
  manipulates image or video content constituting a deepfake must disclose that the content is
  artificially generated, and must do so on first exposure. European Commission guidance is explicit
  that a provider's machine-readable marking, such as SynthID, does not discharge the deployer's
  duty; the disclosure has to be perceivable without tools.
- Provider policies place the consent burden on this project. Google's Generative AI Prohibited Use
  Policy forbids using a person's image without their consent and forbids using personal data or
  biometrics without legally required consent. Veo restricts person generation from uploaded images
  and gates the permissive setting behind an allowlist. Uploading photographs of identifiable people
  is permitted only on an attestation of consent and rights.
- GDPR Recital 27 excludes the personal data of dead people, with member states free to legislate
  separately. Photographs of living third parties remain personal data, and the app would be
  processing them on behalf of an uploader who is not the data subject.
- The photograph itself usually carries a third-party copyright, most often the studio or
  photographer, which is separate from any right in the person depicted.

## Design rules this record fixes

1. The photograph is still by default. Stillness is the evidenced state, not a degraded one.
2. Never synthesise facial motion, expression, gaze, blinking, or speech. That is the exact source
   of the realism inconsistency the meta-analysis measures.
3. Any motion is confined to camera and light: a slow drift, a shallow depth parallax, a change in
   grade. The subject does not act.
4. Pace motion at breathing rate rather than film rate. Slow-paced breathing near six cycles per
   minute is the intervention with actual physiological support, so the drift period should sit
   close to ten seconds and stay steady.
5. Motion is opt-in per photograph, reversible in one action, and never begins by itself.
6. Respect `prefers-reduced-motion` by holding the still frame, consistent with the demo scenes.
7. Provide a visible exit from the session that does not require looking at the face again.
8. State that generated motion is generated, in the surface itself, before the person sees it.
9. Do the work on the person's own device wherever the technique allows, so that a photograph of a
   family member never becomes an upload.
10. Ask for a consent attestation before any photograph reaches a third-party service, and record
    what was attested.
11. Keep the feature adult-only and give the person a way to delete the photograph, the derived
    depth data, and any generated clip in one action.

Rule 9 is not a privacy flourish. Camera-and-light motion is reproducible on-device from a single
depth estimate, in the manner of Niklaus, Mai, Yang, and Liu (2019), 3D Ken Burns Effect from a
Single Image, ACM Transactions on Graphics 38(6). Choosing that class of motion means the feature
needs no generative video provider, no upload, and no deepfake disclosure, because nothing about the
person is synthesised. The evidence review and the privacy boundary in
[the product brief](../product/brief.md) point at the same implementation.

## Sources

- Bryant, R. A., and Hutanamon, T. (2016). Activating attachments enhances heart rate variability.
  PLOS One 11(4), e0151747.
- Cavanagh, S. R., Glode, R. J., and Opitz, P. C. (2015). Lost or fond? Effects of nostalgia on sad
  mood recovery vary by attachment insecurity. Frontiers in Psychology 6, 773.
- Diel, A., Weigelt, S., and MacDorman, K. F. (2022). A meta-analysis of the uncanny valley's
  independent and dependent variables. ACM Transactions on Human-Robot Interaction 11(1).
- Eisenberger, N. I., Master, S. L., Inagaki, T. K., Taylor, S. E., Shirinyan, D., Lieberman, M. D.,
  and Naliboff, B. D. (2011). Attachment figures activate a safety signal-related neural region and
  reduce pain experience. PNAS 108(28), 11721-11726.
- European Commission (2026). Transparency obligations under Article 50 of the AI Act.
- Guerra, P., Sanchez-Adam, A., Anllo-Vento, L., Ramirez, I., and Vila, J. (2012). Viewing loved
  faces inhibits defense reactions: a health-promotion mechanism? PLOS One 7(7), e41631.
- Hollanek, T., and Nowaczyk-Basinska, K. (2024). Griefbots, deadbots, postmortem avatars: on
  responsible applications of generative AI in the digital afterlife industry. Philosophy and
  Technology 37, 63.
- Kidd, J., and Nieto McAvoy, E. (2023). Deep Nostalgia: remediated memory, algorithmic nostalgia
  and technological ambivalence. Convergence 29(3), 620-640.
- Klass, D., Silverman, P. R., and Nickman, S. L. (1996). Continuing Bonds: New Understandings of
  Grief. Taylor and Francis.
- Laborde, S., Allen, M. S., Borges, U., Iskra, M., Zammit, N., You, M., Hosang, T., Mosley, E., and
  Dosseville, F. (2022). Psychophysiological effects of slow-paced breathing at six cycles per
  minute with or without heart rate variability biofeedback. Psychophysiology 59(1), e13952.
- MacDorman, K. F., and Chattopadhyay, D. (2016). Reducing consistency in human realism increases
  the uncanny valley effect. Cognition 146, 190-205.
- Newman, D. B., and Sachs, M. E. (2023). Variation in bittersweet nostalgic feelings and their
  divergent effects on daily well-being. Emotion 23(4), 937-948.
- Niklaus, S., Mai, L., Yang, J., and Liu, F. (2019). 3D Ken Burns effect from a single image. ACM
  Transactions on Graphics 38(6).
- Woods, B., O'Philbin, L., Farrell, E. M., Spector, A. E., and Orrell, M. (2018). Reminiscence
  therapy for dementia. Cochrane Database of Systematic Reviews, CD001120.
- Younger, J., Aron, A., Parke, S., Chatterjee, N., and Mackey, S. (2010). Viewing pictures of a
  romantic partner reduces experimental pain: involvement of neural reward systems. PLOS One 5(10),
  e13309.
