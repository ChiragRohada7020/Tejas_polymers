using System;
using System.Collections.Generic;
using System.Drawing;
using System.Drawing.Drawing2D;
using System.Drawing.Imaging;
using System.IO;

namespace Krusheebindoo
{
    /// <summary>
    /// Turns the supplied flat-background logo JPEG into web-ready assets.
    ///
    /// The source is a big canvas with wide white margins. Two things have to
    /// happen before it can sit in a 64px header:
    ///
    ///   1. The outer white background has to become transparent. A plain
    ///      "white -> transparent" colour key would also delete the white
    ///      artwork the logo contains (the plant inside the droplet), so the
    ///      background is found with a flood fill inward from the border.
    ///      Only pixels actually reachable from the edge are cleared.
    ///   2. The result is auto-cropped to the artwork plus a small even margin,
    ///      so there is no dead space inflating the rendered size.
    ///
    /// JPEG compression rings around hard edges, so a pixel only counts as
    /// background when all three channels are at or above backgroundLevel.
    ///
    /// Implemented in C# rather than PowerShell because the per-pixel loops run
    /// over ~1M pixels; in PowerShell that takes minutes, here it is instant.
    /// </summary>
    public static class LogoPrep
    {
        public class Result
        {
            public int MinX, MinY, MaxX, MaxY;
            public int CropWidth, CropHeight;
            public double Aspect;
            public int LockupWidth, LockupHeight;
            public int MarkSize;
            public string LockupPath, MarkPath;
        }

        public static Result Run(string source, string outDir, int height, int markSize,
                                 int backgroundLevel, int padding)
        {
            using (var decoded = new Bitmap(source))
            using (var work = new Bitmap(decoded.Width, decoded.Height, PixelFormat.Format32bppArgb))
            {
                using (var g = Graphics.FromImage(work))
                {
                    g.Clear(Color.White);
                    g.DrawImage(decoded, 0, 0, decoded.Width, decoded.Height);
                }

                int w = work.Width, h = work.Height;
                BitmapData bits = work.LockBits(new Rectangle(0, 0, w, h),
                    ImageLockMode.ReadWrite, PixelFormat.Format32bppArgb);
                int stride = bits.Stride;
                int len = stride * h;
                byte[] buf = new byte[len];
                System.Runtime.InteropServices.Marshal.Copy(bits.Scan0, buf, 0, len);

                bool[] isBg = new bool[w * h];
                for (int y = 0; y < h; y++)
                {
                    int row = y * stride;
                    for (int x = 0; x < w; x++)
                    {
                        int i = row + x * 4;
                        if (buf[i] >= backgroundLevel && buf[i + 1] >= backgroundLevel &&
                            buf[i + 2] >= backgroundLevel)
                            isBg[y * w + x] = true;
                    }
                }

                // JPEG edge-ringing means the outermost pixels are not the flat
                // background colour, so the fill is seeded from an inset border
                // where the background is reliably uniform. The rim itself is
                // treated as background below, otherwise it would survive as a
                // 1px frame and define the crop bounds.
                const int Rim = 2;
                int inset = Rim + 2;
                bool[] seen = new bool[w * h];
                var stack = new Stack<int>();
                for (int x = inset; x < w - inset; x++)
                {
                    foreach (int y in new[] { inset, h - 1 - inset })
                    {
                        int k = y * w + x;
                        if (isBg[k] && !seen[k]) { seen[k] = true; stack.Push(k); }
                    }
                }
                for (int y = inset; y < h - inset; y++)
                {
                    foreach (int x in new[] { inset, w - 1 - inset })
                    {
                        int k = y * w + x;
                        if (isBg[k] && !seen[k]) { seen[k] = true; stack.Push(k); }
                    }
                }

                int[][] dirs =
                {
                    new[] { 1, 0 }, new[] { -1, 0 }, new[] { 0, 1 }, new[] { 0, -1 }
                };
                while (stack.Count > 0)
                {
                    int k = stack.Pop();
                    int cy = k / w, cx = k - cy * w;
                    foreach (var d in dirs)
                    {
                        int nx = cx + d[0], ny = cy + d[1];
                        if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
                        int nk = ny * w + nx;
                        if (isBg[nk] && !seen[nk]) { seen[nk] = true; stack.Push(nk); }
                    }
                }

                int minX = w, maxX = -1, minY = h, maxY = -1;
                for (int y = 0; y < h; y++)
                {
                    int row = y * stride;
                    for (int x = 0; x < w; x++)
                    {
                        int i = row + x * 4;
                        bool inRim = x < Rim || y < Rim || x >= w - Rim || y >= h - Rim;
                        if (seen[y * w + x] || inRim)
                        {
                            buf[i + 3] = 0; // outer background only
                        }
                        else
                        {
                            if (x < minX) minX = x;
                            if (x > maxX) maxX = x;
                            if (y < minY) minY = y;
                            if (y > maxY) maxY = y;
                        }
                    }
                }
                System.Runtime.InteropServices.Marshal.Copy(buf, 0, bits.Scan0, len);
                work.UnlockBits(bits);

                if (maxX < minX)
                    throw new InvalidOperationException(
                        "Flood fill cleared the whole image; lower backgroundLevel.");

                int cropX = Math.Max(0, minX - padding);
                int cropY = Math.Max(0, minY - padding);
                int cropW = Math.Min(w - cropX, (maxX - minX + 1) + 2 * padding);
                int cropH = Math.Min(h - cropY, (maxY - minY + 1) + 2 * padding);

                using (var cropped = new Bitmap(cropW, cropH, PixelFormat.Format32bppArgb))
                {
                    using (var g = Graphics.FromImage(cropped))
                    {
                        g.InterpolationMode = InterpolationMode.HighQualityBicubic;
                        g.PixelOffsetMode = PixelOffsetMode.HighQuality;
                        g.CompositingQuality = CompositingQuality.HighQuality;
                        g.DrawImage(work,
                            new Rectangle(0, 0, cropW, cropH),
                            new Rectangle(cropX, cropY, cropW, cropH),
                            GraphicsUnit.Pixel);
                    }

                    Directory.CreateDirectory(outDir);

                    // 3x for retina; the browser downscales via an explicit height.
                    int outH = height * 3;
                    int outW = (int)Math.Round(cropW * (outH / (double)cropH));

                    string lockupPath = Path.Combine(outDir, "krusheebindoo-logo.png");
                    // Declared out here because the return below needs them and
                    // the mark is built inside the lockup's using block.
                    string markPath = Path.Combine(outDir, "krusheebindoo-mark.png");
                    int ms = markSize * 3;
                    using (var lockup = new Bitmap(outW, outH, PixelFormat.Format32bppArgb))
                    {
                        using (var g = Graphics.FromImage(lockup))
                        {
                            g.InterpolationMode = InterpolationMode.HighQualityBicubic;
                            g.PixelOffsetMode = PixelOffsetMode.HighQuality;
                            g.SmoothingMode = SmoothingMode.HighQuality;
                            g.CompositingQuality = CompositingQuality.HighQuality;
                            g.Clear(Color.Transparent);
                            g.DrawImage(cropped, 0, 0, outW, outH);
                        }
                        lockup.Save(lockupPath, ImageFormat.Png);

                        // Square mark for the favicon: the droplet sits above the
                        // wordmark, so the top of the lockup is taken and squared.
                        // Built while `lockup` is still in scope and undisposed.
                        using (var mark = new Bitmap(ms, ms, PixelFormat.Format32bppArgb))
                        {
                            using (var g = Graphics.FromImage(mark))
                            {
                                g.InterpolationMode = InterpolationMode.HighQualityBicubic;
                                g.PixelOffsetMode = PixelOffsetMode.HighQuality;
                                g.SmoothingMode = SmoothingMode.HighQuality;
                                g.CompositingQuality = CompositingQuality.HighQuality;
                                g.Clear(Color.Transparent);
                                g.DrawImage(lockup,
                                    new Rectangle(0, 0, ms, ms),
                                    new Rectangle(0, 0, Math.Min(outW, outH), outH),
                                    GraphicsUnit.Pixel);
                            }
                            mark.Save(markPath, ImageFormat.Png);
                        }
                    }

                    return new Result
                    {
                        MinX = minX, MinY = minY, MaxX = maxX, MaxY = maxY,
                        CropWidth = cropW, CropHeight = cropH,
                        Aspect = (double)cropW / cropH,
                        LockupWidth = outW, LockupHeight = outH,
                        MarkSize = ms, LockupPath = lockupPath, MarkPath = markPath
                    };
                }
            }

            // C# requires a terminal path even though every route through the
            // using blocks above returns. Unreachable, but the compiler wants it.
            throw new InvalidOperationException("unreachable");
        }
    }
}
