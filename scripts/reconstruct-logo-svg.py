#!/usr/bin/env python3
"""Precision vector reconstruction of the Flamingo Residencial logo (SVG + transparent PNG)."""
from pathlib import Path
import base64

ROOT = Path(r'c:\Users\USUARIO\Desktop\PROYECT-FLAMINGO')


def p(x: float, y: float, S: float = 8.0) -> str:
    return f'{x * S:.1f} {y * S:.1f}'


def build_svg_logos():
    S = 8.0  # 1600x1600 coordinate space mapped 1:1 from 200x200 source grid
    font_b64 = base64.b64encode((ROOT / 'public/fonts/GeistaMond-Regular.woff2').read_bytes()).decode('ascii')

    # 1. Standing vertical leg + foot
    standing_leg_path = (
        f'M {p(95.0, 78.5)} '
        f'L {p(97.2, 78.5)} '
        f'C {p(97.0, 84.0)}, {p(96.9, 88.5)}, {p(97.1, 91.5)} '
        f'C {p(97.2, 93.2)}, {p(96.4, 95.0)}, {p(96.2, 99.0)} '
        f'C {p(96.0, 104.0)}, {p(95.9, 108.5)}, {p(96.2, 111.5)} '
        f'C {p(97.2, 114.2)}, {p(98.5, 117.5)}, {p(98.8, 120.2)} '
        f'C {p(98.9, 121.3)}, {p(97.9, 122.0)}, {p(97.1, 121.2)} '
        f'C {p(95.8, 119.5)}, {p(94.6, 115.8)}, {p(94.3, 112.2)} '
        f'C {p(94.2, 108.0)}, {p(94.4, 102.0)}, {p(94.6, 95.5)} '
        f'C {p(94.4, 93.0)}, {p(94.2, 91.0)}, {p(94.7, 88.5)} '
        f'C {p(94.9, 85.0)}, {p(95.0, 81.5)}, {p(95.0, 78.5)} Z'
    )

    # 2. Bent leg + tucked foot
    bent_leg_path = (
        f'M {p(105.5, 78.8)} '
        f'C {p(106.2, 79.6)}, {p(105.8, 80.8)}, {p(104.2, 81.4)} '
        f'C {p(100.5, 82.8)}, {p(95.8, 84.4)}, {p(92.0, 86.8)} '
        f'C {p(91.6, 89.2)}, {p(90.5, 92.5)}, {p(89.0, 94.3)} '
        f'C {p(88.2, 95.1)}, {p(87.3, 94.6)}, {p(87.6, 93.2)} '
        f'C {p(88.1, 90.6)}, {p(89.2, 87.8)}, {p(90.2, 85.8)} '
        f'C {p(90.6, 85.0)}, {p(91.5, 84.4)}, {p(93.2, 83.6)} '
        f'C {p(97.0, 81.8)}, {p(101.8, 80.0)}, {p(105.5, 78.8)} Z'
    )

    # 3. Dark hooked beak tip (#351A41)
    beak_tip_path = (
        f'M {p(68.0, 51.2)} '
        f'C {p(69.8, 51.8)}, {p(71.4, 52.8)}, {p(72.2, 54.4)} '
        f'C {p(72.4, 57.0)}, {p(72.6, 59.8)}, {p(72.7, 62.2)} '
        f'C {p(72.7, 62.8)}, {p(71.9, 63.0)}, {p(71.2, 62.4)} '
        f'C {p(68.4, 60.2)}, {p(66.8, 57.2)}, {p(67.0, 54.0)} '
        f'C {p(67.1, 52.6)}, {p(67.5, 51.7)}, {p(68.0, 51.2)} Z'
    )

    # 4. White upper beak / cheek patch (#FFF9FC)
    white_cheek_path = (
        f'M {p(69.3, 48.6)} '
        f'C {p(71.2, 49.0)}, {p(72.8, 50.2)}, {p(73.5, 52.0)} '
        f'C {p(73.1, 53.2)}, {p(72.6, 54.0)}, {p(72.0, 54.6)} '
        f'C {p(71.0, 53.0)}, {p(69.6, 51.8)}, {p(67.9, 51.4)} '
        f'C {p(68.2, 50.1)}, {p(68.7, 49.2)}, {p(69.3, 48.6)} Z'
    )

    # 5. Main Flamingo head, graceful S-neck, and upper back silhouette
    body_main_path = (
        f'M {p(69.2, 48.7)} '
        f'C {p(70.8, 46.2)}, {p(73.8, 44.8)}, {p(77.2, 45.0)} '
        f'C {p(81.2, 45.3)}, {p(83.8, 48.4)}, {p(83.8, 53.0)} '
        f'C {p(83.8, 57.5)}, {p(81.4, 62.2)}, {p(78.6, 65.8)} '
        f'C {p(77.4, 67.3)}, {p(77.8, 68.6)}, {p(79.4, 68.3)} '
        f'C {p(81.2, 67.9)}, {p(83.5, 65.2)}, {p(86.8, 62.8)} '
        f'C {p(90.5, 60.1)}, {p(95.2, 59.6)}, {p(99.5, 60.8)} '
        f'C {p(104.2, 62.1)}, {p(107.6, 66.2)}, {p(110.8, 74.2)} '
        f'C {p(111.5, 75.8)}, {p(110.6, 77.0)}, {p(109.0, 76.8)} '
        f'C {p(106.8, 78.8)}, {p(102.5, 80.4)}, {p(96.8, 80.4)} '
        f'C {p(90.8, 80.4)}, {p(86.2, 78.6)}, {p(83.2, 76.0)} '
        f'C {p(79.2, 75.8)}, {p(75.5, 74.2)}, {p(73.6, 70.8)} '
        f'C {p(71.8, 67.6)}, {p(72.6, 63.2)}, {p(75.5, 59.2)} '
        f'C {p(77.8, 56.0)}, {p(79.4, 53.2)}, {p(79.0, 51.2)} '
        f'C {p(78.7, 49.8)}, {p(77.2, 49.6)}, {p(75.6, 50.8)} '
        f'C {p(74.4, 51.7)}, {p(73.6, 52.3)}, {p(72.8, 52.3)} '
        f'C {p(72.2, 50.4)}, {p(70.8, 49.2)}, {p(69.2, 48.7)} Z'
    )

    # 6. Folded wing & lower body plumage (lighter rose pink)
    wing_light_path = (
        f'M {p(85.0, 74.2)} '
        f'C {p(87.2, 69.2)}, {p(91.8, 65.2)}, {p(97.2, 65.0)} '
        f'C {p(102.5, 64.8)}, {p(106.8, 68.5)}, {p(110.4, 74.6)} '
        f'C {p(111.0, 75.8)}, {p(110.2, 76.8)}, {p(108.6, 76.8)} '
        f'C {p(108.2, 78.2)}, {p(106.5, 79.2)}, {p(104.5, 79.4)} '
        f'C {p(101.2, 80.6)}, {p(95.8, 80.8)}, {p(90.8, 79.4)} '
        f'C {p(87.2, 78.4)}, {p(84.8, 76.4)}, {p(85.0, 74.2)} Z'
    )

    # 7. Subtle wing feather highlight curve
    wing_accent_path = (
        f'M {p(89.5, 73.2)} '
        f'C {p(93.5, 69.8)}, {p(99.2, 69.4)}, {p(105.2, 72.8)} '
        f'C {p(100.2, 71.2)}, {p(94.5, 71.5)}, {p(89.5, 73.2)} Z'
    )

    def render_svg(text_color: str, sub_color: str) -> str:
        return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="260 310 1080 1000" width="1080" height="1000">
  <defs>
    <style>
      @font-face {{
        font-family: 'GeistaMondLogo';
        src: url('data:font/woff2;base64,{font_b64}') format('woff2');
        font-weight: 400;
        font-style: normal;
      }}
      .logo-title {{
        font-family: 'GeistaMondLogo', 'Cormorant Garamond', 'Playfair Display', Georgia, serif;
        font-size: 112px;
        font-weight: 700;
        letter-spacing: 0.09em;
        fill: {text_color};
      }}
      .logo-sub {{
        font-family: 'DM Sans', 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
        font-size: 39px;
        font-weight: 500;
        letter-spacing: 0.38em;
        fill: {sub_color};
      }}
    </style>
    <linearGradient id="flamingoBodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#F17CA0" />
      <stop offset="50%" stop-color="#E76590" />
      <stop offset="100%" stop-color="#D95683" />
    </linearGradient>
    <linearGradient id="flamingoWingGrad" x1="0%" y1="0%" x2="100%" y2="90%">
      <stop offset="0%" stop-color="#FAAFC7" />
      <stop offset="55%" stop-color="#F593B4" />
      <stop offset="100%" stop-color="#EB789F" />
    </linearGradient>
    <linearGradient id="flamingoLegGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#D16489" />
      <stop offset="60%" stop-color="#DF7398" />
      <stop offset="100%" stop-color="#C5557B" />
    </linearGradient>
  </defs>

  <!-- Vector Reconstructed Standing Flamingo -->
  <g>
    <path d="{bent_leg_path}" fill="url(#flamingoLegGrad)" />
    <path d="{standing_leg_path}" fill="url(#flamingoLegGrad)" />
    <path d="{white_cheek_path}" fill="#FFF9FC" />
    <path d="{beak_tip_path}" fill="#351A41" />
    <path d="{body_main_path}" fill="url(#flamingoBodyGrad)" />
    <path d="{wing_light_path}" fill="url(#flamingoWingGrad)" />
    <path d="{wing_accent_path}" fill="#E66A94" opacity="0.55" />
    <!-- Serene eye detail -->
    <circle cx="{72.3 * S:.1f}" cy="{49.6 * S:.1f}" r="{1.05 * S:.1f}" fill="#351A41" />
    <path d="M {70.9 * S:.1f} {49.8 * S:.1f} Q {72.3 * S:.1f} {48.9 * S:.1f} {73.7 * S:.1f} {49.9 * S:.1f}" stroke="#351A41" stroke-width="3.6" fill="none" stroke-linecap="round" />
  </g>

  <!-- Crisp Vector Typography -->
  <text x="805" y="1142" text-anchor="middle" class="logo-title">FLAMINGO</text>
  <text x="812" y="1236" text-anchor="middle" class="logo-sub">RESIDENCIAL</text>
</svg>'''

    svg_dark = render_svg('#361D42', '#361D42')
    svg_light = render_svg('#F5F1FA', '#EAE3F2')

    (ROOT / 'public/brand/logo-flamingo.svg').write_text(svg_dark, encoding='utf-8')
    (ROOT / 'public/brand/logo-flamingo-light.svg').write_text(svg_light, encoding='utf-8')
    print('Saved precision vector SVGs!')


if __name__ == '__main__':
    build_svg_logos()
