import {
  ProseHeading,
  ProseLink,
  ProseList,
  ProseListItem,
  ProseOrderedList,
  ProseText,
} from '../components/Prose';
import { PublicPage } from '../components/PublicPage';

export const metadata = {
  title: 'Evidence | Calm in the Rush',
  description:
    'What the published research supports about a screen of pictures, the color and motion around them, and adding a photograph of someone you love, and what it does not support.',
};

const interfaceRecord =
  'https://github.com/Litenova-Solutions/Calm-in-the-Rush/blob/main/docs/research/calm-interface-evidence.md';
const photoRecord =
  'https://github.com/Litenova-Solutions/Calm-in-the-Rush/blob/main/docs/research/photo-presence-evidence.md';

export default function EvidencePage() {
  return (
    <PublicPage
      eyebrow="Evidence"
      title="What the research supports, and what it does not"
      lead="Two questions have a record behind them: what a screen of pictures can actually do for you, and whether a photograph of someone you love should ever move. Both answers are narrower than this category usually claims, and both fixed the design rather than decorating it."
    >
      <ProseHeading>A minute of pictures changes how you feel, not how you work</ProseHeading>
      <ProseText>
        Albulescu and colleagues (2022) pooled 22 studies covering 2,335 people to ask what short
        breaks actually do. Breaks of ten minutes or less raised vigor, d = 0.36, and cut fatigue, d
        = 0.35, both reliably. Performance did not move, d = 0.16, and the confidence interval
        crossed zero. Longer breaks helped performance; short ones did not.
      </ProseText>
      <ProseText>
        That result draws the line for this product. A minute of scrolling through pictures sits
        well inside what they studied, and it has support for feeling better and none for working
        better. So Calm in the Rush offers you a minute of relief. It does not offer focus,
        productivity, or restored attention, and you should distrust any app in this category that
        does.
      </ProseText>

      <ProseHeading>Nature on a screen is not nature</ProseHeading>
      <ProseText>
        The famous result here is Ulrich (1984), who matched 46 gallbladder surgery patients in
        pairs and found that the ones whose window faced trees left hospital in 7.96 days against
        8.70 for the ones facing a brick wall, took fewer strong painkillers, and drew 1.13 negative
        notes from nurses per patient against 3.96. It is a real effect and it is about a window.
      </ProseText>
      <ProseText>
        Screens do worse. Collins and colleagues (2025) showed 63 people ten minutes of nature or
        urban images and measured error-related negativity, an EEG marker of attention. Nothing
        moved, and the difference between nature and urban imagery was not significant, p = 0.62.
        Their conclusion is that brief exposure to flat nature imagery may not produce what real
        nature produces, and that vision alone may not be enough. Systematic reviews of Attention
        Restoration Theory agree that real environments beat simulated ones on working memory and
        attentional control.
      </ProseText>
      <ProseText>
        We keep the affective claim and drop the attention claim. Pictures on a screen can shift how
        a minute feels. They have not been shown to sharpen anyone.
      </ProseText>

      <ProseHeading>Sound carries more than the pictures do</ProseHeading>
      <ProseText>
        Buxton and colleagues (2021) found 36 studies of natural sound and meta-analysed 18. Stress
        and annoyance fell, g = -0.60, and health and positive affect rose, g = 1.63, though that
        second interval runs from 0.09 to 3.16 and is too wide to promise a size. The useful part is
        the split: water sounds did most for mood and health, and bird sounds did most against
        stress and annoyance.
      </ProseText>

      <ProseHeading>Color psychology, as usually sold, is not supported</ProseHeading>
      <ProseText>
        The popular version assigns feelings to hues. Blue is calm, red is urgent. Controlled work
        does not find that. Wilms and Oberfeld (2018) showed 62 people a full grid of hues,
        saturations, and brightnesses for 30 seconds each while recording skin conductance and heart
        rate. Arousal did rise from blue and green toward red, but valence was driven by saturation
        and brightness, and blue only beat other hues at high saturation. Valdez and Mehrabian
        (1994) had already reported the same shape, with the highest arousal landing on a
        green-yellow rather than red.
      </ProseText>
      <ProseText>
        So the lever is not hue. It is saturation and brightness. That is why the interface around
        the picture is deliberately colorless: the photograph should be the most saturated thing on
        your screen, and a tinted interface would compete with it for the dimension that actually
        moves people.
      </ProseText>
      <ProseText>
        Dark-mode evidence from 2024 to 2026 is mixed and depends on the room. Readers with
        astigmatism also report light text on dark backgrounds blurring. This demo uses the light
        token set and does not switch with the system setting.
      </ProseText>

      <ProseHeading>Motion is the part that can hurt someone</ProseHeading>
      <ProseText>
        Parallax scrolling, autoplaying video, and continuous animation cause dizziness, nausea, and
        headaches in people with vestibular disorders. That is a physical reaction, not a taste.
        WCAG 2.3.3 requires that interaction-triggered motion can be switched off unless the motion
        is essential, and almost none of it ever is.
      </ProseText>
      <ProseText>
        A calm product that makes someone motion sick has failed at the only thing it set out to do,
        so motion here is rationed rather than styled.
      </ProseText>

      <ProseHeading>The first half second</ProseHeading>
      <ProseText>
        Reinecke and colleagues (2013) collected appeal ratings for 450 websites from 548 people
        after 500 milliseconds of exposure, and found that visual complexity and colorfulness, plus
        the viewer&apos;s age and education, account for about half the variance in what people
        thought. Low complexity and high color win.
      </ProseText>
      <ProseText>
        One photograph filling the frame is about as low-complexity and high-color as an opening
        screen gets. That is why the app opens on a picture rather than on an explanation.
      </ProseText>

      <ProseHeading>A face you love lowers a threat response</ProseHeading>
      <ProseText>
        Four independent experiments point the same way, and none of them needed the picture to
        move.
      </ProseText>
      <ProseList>
        <ProseListItem>
          Guerra and colleagues (2012) showed photographs of a partner, parent, or best friend to 54
          people and measured the defensive eye-blink startle reflex. It fell against both neutral
          and unpleasant faces, F(2,104) = 24.11, p &lt; 0.0001. Pleasantness ratings ruled out mere
          familiarity.
        </ProseListItem>
        <ProseListItem>
          Younger and colleagues (2010) applied thermal pain to 15 people in an MRI scanner. Looking
          at a partner photograph brought moderate pain from 3.7 down to 2.4 out of 10. A
          distraction task cut pain too, but only the photograph recruited reward circuitry.
        </ProseListItem>
        <ProseListItem>
          Eisenberger and colleagues (2011) found that the same photographs raised activity in the
          ventromedial prefrontal cortex, the region tied to learned safety signals, and that the
          activity tracked how much the pain dropped.
        </ProseListItem>
        <ProseListItem>
          Bryant and Hutanamon (2016) had 62 people bring an attachment figure to mind after a
          stressor and recorded higher high-frequency heart rate variability than a control group.
          That is the parasympathetic marker this product cares about.
        </ProseListItem>
      </ProseList>
      <ProseText>
        Remembering carries its own literature. Reminiscence work with photographs has been tested
        in care settings: the Cochrane review by Woods and colleagues (2018) pooled 22 trials and
        analysed 16 of them across 1,749 people living with dementia, and reported small
        improvements in quality of life, mood, cognition, and communication. Small, uneven between
        settings, and real.
      </ProseText>

      <ProseHeading>No trial supports animating the picture</ProseHeading>
      <ProseText>
        We looked for a controlled comparison between an animated photograph and the same photograph
        held still. There isn&apos;t one. Anyone claiming that the motion is what calms you is ahead
        of the evidence.
      </ProseText>
      <ProseText>
        The only study of a shipped animation feature is observational. Kidd and Nieto McAvoy (2023)
        coded 6,935 posts about the MyHeritage Deep Nostalgia launch and read a random sample of 316
        closely. Of the posts carrying emotion, 88 percent were positive, and people described being
        moved to tears by seeing a relative move for the first time. Eleven percent called the
        result creepy, weird, or freaky. The authors read the reaction as genuinely ambivalent: the
        same clip comforts and unsettles the same person.
      </ProseText>
      <ProseText>
        Meanwhile the mechanism predicting harm is well measured. Diel, Weigelt, and MacDorman
        (2022) meta-analysed 72 uncanny valley studies and 247 effect sizes and put the effect at
        Hedges g = 1.01. MacDorman and Chattopadhyay (2016) traced the cause to inconsistent
        realism, worst when the eyes and mouth are the least convincing parts of an otherwise
        convincing face. Synthetic facial motion over a real photograph produces precisely that
        mismatch.
      </ProseText>

      <ProseHeading>Where it turns the wrong way</ProseHeading>
      <ProseText>
        Averages hide the people a calm product exists for. Cavanagh, Glode, and Opitz (2015) played
        a sad film to 71 people and then asked half of them to reminisce. Overall, reminiscing made
        recovery from the sad mood worse, F = 8.173, p = 0.006. Attachment security decided the
        direction: people low in insecurity felt happier, while people high in insecurity stayed sad
        longer.
      </ProseText>
      <ProseText>
        Newman and Sachs (2023) tracked 151 people across 1,356 daily reports and ran two
        experiments. What mattered was the tone of the memory, not the remembering. Warm nostalgia
        predicted higher life satisfaction, meaning, and self-esteem. Sad nostalgia predicted lower
        scores on all three.
      </ProseText>
      <ProseText>
        Grief adds a sharper edge. Keeping a bond with someone who died is normal, and research
        since Klass, Silverman, and Nickman (1996) treats it that way. The distinction that holds up
        is between an internal bond that works as a secure base and an external one, a sensed
        presence or an apparition, which tracks with unresolved loss. Hollanek and Nowaczyk-Basinska
        (2024) set the design conditions for simulating a person who has died: consent from both
        sides, honesty about what is synthetic, adults only, and a way to end the simulation rather
        than be visited by it. Their name for the failure is an unwanted haunting.
      </ProseText>

      <ProseHeading>What the app does with that</ProseHeading>
      <ProseText>
        The evidence is uneven, so the design is too. These rules are fixed, not defaults waiting
        for a product decision.
      </ProseText>
      <ProseOrderedList>
        <ProseListItem>
          The picture is the interface. Nothing else on screen competes with it for color, contrast,
          or movement.
        </ProseListItem>
        <ProseListItem>
          The interface stays colorless and lets the photograph carry the saturation, because
          saturation and brightness are the dimensions that actually move people.
        </ProseListItem>
        <ProseListItem>
          The demo uses the light token set and does not switch with the system setting.
        </ProseListItem>
        <ProseListItem>
          Any text over a photograph sits on a scrim, and the contrast is measured at the worst
          point on the image rather than an average one.
        </ProseListItem>
        <ProseListItem>
          Scrolling moves the page and nothing else. No parallax, no scroll-triggered animation.
        </ProseListItem>
        <ProseListItem>
          Reduced-motion settings hold a still frame everywhere, including your own photographs.
        </ProseListItem>
        <ProseListItem>
          Nothing plays sound unless you ask for it. Nothing autoplays with sound, ever.
        </ProseListItem>
        <ProseListItem>
          The photograph is still. Stillness is the state with four experiments behind it, not a
          cheaper version of the feature.
        </ProseListItem>
        <ProseListItem>
          No synthetic faces. The app will not generate expression, gaze, blinking, or speech. That
          is the exact artefact the uncanny valley meta-analysis measures.
        </ProseListItem>
        <ProseListItem>
          Motion, if you turn it on, belongs to the camera and the light: a slow drift, a shallow
          parallax, a shift in grade. The person in the picture never acts.
        </ProseListItem>
        <ProseListItem>
          Motion is paced at breathing rate, not film rate. Slow breathing near six cycles a minute
          is the part with real physiological support, so a drift cycle runs close to ten seconds
          and holds steady.
        </ProseListItem>
        <ProseListItem>
          Motion is opt-in for each photograph, reversible in one tap, and never starts on its own.
        </ProseListItem>
        <ProseListItem>
          There is always a way out of the session that does not route back through the face.
        </ProseListItem>
        <ProseListItem>
          The work happens on your device. A photograph of your family is not an upload, and
          depth-based camera motion does not need a server to produce it.
        </ProseListItem>
        <ProseListItem>
          Generated motion is labelled as generated, on the surface, before you see it. EU AI Act
          Article 50 has required that of deepfake content since 2 August 2026, and a
          machine-readable watermark does not satisfy it.
        </ProseListItem>
        <ProseListItem>
          The feature is adult-only, and one action deletes the photograph, anything derived from
          it, and any clip it produced.
        </ProseListItem>
      </ProseOrderedList>

      <ProseHeading>What this page does not claim</ProseHeading>
      <ProseText>
        Calm in the Rush makes no medical claim and is not treatment. The studies above measured
        startle reflexes, pain ratings, heart rate variability, and mood in small samples, mostly of
        undergraduates. They describe a mechanism. They do not promise you an outcome, and this app
        is not a substitute for a person to talk to when grief is heavy.
      </ProseText>
      <ProseText>
        It makes no claim about your attention either. The break research found no performance
        effect and the EEG work found no attention effect from nature imagery on a screen. Those are
        the studies closest to what this app actually does, and we would rather tell you that than
        borrow a claim from research about walking in a forest.
      </ProseText>
      <ProseText>
        Full citations, effect sizes, and the design rules in their exact form are in{' '}
        <ProseLink href={interfaceRecord}>the interface evidence review</ProseLink> and{' '}
        <ProseLink href={photoRecord}>the photo presence evidence review</ProseLink> in the
        repository. The privacy boundary they depend on is on{' '}
        <ProseLink href="/privacy">the privacy page</ProseLink>, and the plan that governs the work
        is in <ProseLink href="/requirements">the product brief</ProseLink>.
      </ProseText>
    </PublicPage>
  );
}
