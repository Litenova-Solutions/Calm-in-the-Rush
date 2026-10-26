using global::Android.Animation;
using global::Android.Content;
using global::Android.Graphics;
using Path = global::Android.Graphics.Path;
using global::Android.Views;
using global::Android.Views.Animations;
using CalmInTheRush.Android.Ui;

namespace CalmInTheRush.Android.Motion;

public sealed class BreathingWaveView : View
{
    const float BoxWidth = 320f;
    const float BoxHeight = 180f;
    const float CornerRadius = 24f;
    const float StrokeWidth = 3f;
    const float OrbRadius = 13f;

    readonly Context context;
    readonly Path wave;
    readonly Path clip;
    readonly PathMeasure measure;
    readonly Paint skyPaint;
    readonly Paint wavePaint;
    readonly Paint glowPaint;
    readonly Paint orbPaint;
    readonly float[] position = new float[2];
    readonly Color orbStart;
    readonly Color orbEnd;
    float orbX = 16f;
    float orbY = 132f;
    ValueAnimator? animator;

    public BreathingWaveView(Context context)
        : base(context)
    {
        this.context = context;
        SetWillNotDraw(false);

        // BlurMaskFilter is ignored under hardware acceleration, so this view alone renders in software.
        SetLayerType(LayerType.Software, null);
        ImportantForAccessibility = ImportantForAccessibility.No;

        Color skyStart = context.ColorOf(Resource.Color.breathing_sky_start);
        Color skyEnd = context.ColorOf(Resource.Color.breathing_sky_end);
        Color orbStartColor = context.ColorOf(Resource.Color.breathing_orb_start);
        orbStart = orbStartColor;
        orbEnd = context.ColorOf(Resource.Color.breathing_orb_end);

        skyPaint = new Paint(PaintFlags.AntiAlias);
        skyPaint.SetShader(new LinearGradient(
            0, 0, BoxWidth, BoxHeight, skyStart, skyEnd, Shader.TileMode.Clamp!));

        // The SVG wave from BreathingPanel, with its smooth segments expanded to cubic curves.
        wave = new Path();
        wave.MoveTo(16f, 132f);
        wave.CubicTo(42f, 132f, 48f, 48f, 80f, 48f);
        wave.CubicTo(112f, 48f, 118f, 132f, 160f, 132f);
        wave.CubicTo(202f, 132f, 198f, 48f, 240f, 48f);
        wave.CubicTo(282f, 48f, 278f, 132f, 304f, 132f);

        wavePaint = new Paint(PaintFlags.AntiAlias);
        wavePaint.SetStyle(Paint.Style.Stroke);
        wavePaint.Color = context.ColorOf(Resource.Color.breathing_wave);
        wavePaint.StrokeWidth = StrokeWidth;
        wavePaint.StrokeCap = Paint.Cap.Round;

        glowPaint = new Paint(PaintFlags.AntiAlias);
        glowPaint.Color = orbStartColor;
        glowPaint.SetMaskFilter(new BlurMaskFilter(5f, BlurMaskFilter.Blur.Normal));

        orbPaint = new Paint(PaintFlags.AntiAlias);

        clip = new Path();
        clip.AddRoundRect(new RectF(0, 0, BoxWidth, BoxHeight), CornerRadius, CornerRadius, Path.Direction.Cw!);

        measure = new PathMeasure(wave, false);
    }

    protected override void OnMeasure(int widthMeasureSpec, int heightMeasureSpec)
    {
        int width = GetDefaultSize(0, widthMeasureSpec);
        SetMeasuredDimension(width, (int)(width * BoxHeight / BoxWidth));
    }

    protected override void OnDraw(Canvas canvas)
    {
        base.OnDraw(canvas);
        if (Width <= 0)
        {
            return;
        }

        float scale = (float)Width / BoxWidth;
        canvas.Save();
        canvas.Scale(scale, scale);
        canvas.ClipPath(clip);
        canvas.DrawPath(clip, skyPaint);
        canvas.DrawPath(wave, wavePaint);
        canvas.DrawCircle(orbX, orbY, OrbRadius, glowPaint);
        orbPaint.SetShader(new LinearGradient(
            orbX - OrbRadius, orbY - OrbRadius, orbX + OrbRadius, orbY + OrbRadius,
            orbStart, orbEnd, Shader.TileMode.Clamp!));
        canvas.DrawCircle(orbX, orbY, OrbRadius, orbPaint);
        canvas.Restore();
    }

    protected override void OnAttachedToWindow()
    {
        base.OnAttachedToWindow();
        if (MotionPreference.IsReduced(context))
        {
            return;
        }

        ValueAnimator created = ValueAnimator.OfFloat(0f, 1f)!;
        created.SetDuration(12000);
        created.RepeatCount = ValueAnimator.Infinite;
        created.SetInterpolator(new LinearInterpolator());
        created.Update += (_, _) => AdvanceOrb(created.AnimatedFraction);
        animator = created;
        created.Start();
    }

    protected override void OnDetachedFromWindow()
    {
        animator?.Cancel();
        animator = null;
        base.OnDetachedFromWindow();
    }

    void AdvanceOrb(float fraction)
    {
        measure.GetPosTan(fraction * measure.Length, position, null);
        orbX = position[0];
        orbY = position[1];
        Invalidate();
    }
}
