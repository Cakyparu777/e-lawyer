---
name: Lexicon Authority
colors:
  surface: '#f8f9fa'
  surface-dim: '#d9dadb'
  surface-bright: '#f8f9fa'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f4f5'
  surface-container: '#edeeef'
  surface-container-high: '#e7e8e9'
  surface-container-highest: '#e1e3e4'
  on-surface: '#191c1d'
  on-surface-variant: '#44474d'
  inverse-surface: '#2e3132'
  inverse-on-surface: '#f0f1f2'
  outline: '#75777e'
  outline-variant: '#c5c6ce'
  surface-tint: '#4e5f7e'
  primary: '#031632'
  on-primary: '#ffffff'
  primary-container: '#1a2b48'
  on-primary-container: '#8293b5'
  inverse-primary: '#b6c7eb'
  secondary: '#055db6'
  on-secondary: '#ffffff'
  secondary-container: '#65a1fe'
  on-secondary-container: '#003670'
  tertiary: '#211400'
  on-tertiary: '#ffffff'
  tertiary-container: '#3c2700'
  on-tertiary-container: '#ad8d5b'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d7e2ff'
  primary-fixed-dim: '#b6c7eb'
  on-primary-fixed: '#081b38'
  on-primary-fixed-variant: '#374765'
  secondary-fixed: '#d6e3ff'
  secondary-fixed-dim: '#a9c7ff'
  on-secondary-fixed: '#001b3d'
  on-secondary-fixed-variant: '#00468c'
  tertiary-fixed: '#ffdead'
  tertiary-fixed-dim: '#e5c18a'
  on-tertiary-fixed: '#281900'
  on-tertiary-fixed-variant: '#5b4217'
  background: '#f8f9fa'
  on-background: '#191c1d'
  surface-variant: '#e1e3e4'
typography:
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.5px
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 26px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: -0.4px
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 30px
  headline-sm:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 26px
  body-lg:
    fontFamily: Inter
    fontSize: 17px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 15px
    fontWeight: '400'
    lineHeight: 22px
  body-sm:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
  label-lg:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.1px
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 4px
  margin-main: 20px
  gutter: 16px
  stack-sm: 8px
  stack-md: 16px
  stack-lg: 24px
---

## Brand & Style

The design system is engineered to project an aura of absolute institutional stability and digital security. Targeting individuals and corporate entities seeking legal counsel, the interface prioritizes a **Corporate / Modern** aesthetic that leans heavily into the "High-Trust" category. 

The emotional response should be one of immediate relief and clarity—eliminating the anxiety often associated with legal disputes. To achieve this, the system utilizes a refined, systematic approach characterized by generous whitespace, precision-aligned elements, and a restrained use of motion. Drawing from the Apple Human Interface Guidelines (HIG), the design emphasizes clarity over decoration, ensuring that sensitive information is always legible and primary actions are unambiguous.

## Colors

The palette is anchored by **Deep Navy (#1A2B48)**, representing tradition and authority. **Professional Blue (#3A7BD5)** serves as the primary interactive color, providing a modern, digital-first contrast to the navy. 

In **Light Mode**, the interface uses a layered grayscale approach (#F8F9FA to #343A40) to define surface depth. In **Dark Mode**, the Deep Navy is tinted further toward black to serve as the base surface, while Professional Blue maintains accessibility through slight saturation adjustments.

Semantic colors (Success, Warning, Error) follow industry standards but are used sparingly—primarily for status chips and validation—to avoid visual clutter in document-heavy views.

## Typography

This design system utilizes **Inter** for its exceptional legibility and systematic structure, mimicking the precision of SF Pro while providing a distinct professional character. 

Hierarchy is strictly enforced to manage legal complexity:
- **Headlines:** Use tighter letter-spacing and heavier weights to anchor pages.
- **Body:** Standardized at 17px for primary reading (matching iOS defaults) to ensure comfort during long-form document review.
- **Labels:** Used for metadata, status chips, and form captions, utilizing Medium and SemiBold weights to remain distinct from body text.

## Layout & Spacing

The layout philosophy follows a **Fluid Grid** model optimized for mobile-first React Native implementation. We use a 4pt baseline grid to ensure vertical rhythm.

- **Margins:** A standard 20px horizontal margin is applied to all screens to provide a premium "breathable" feel.
- **Grids:** Lawyer cards and category icons follow a flexible column system (usually 1 or 2 columns on mobile).
- **Safe Areas:** Strict adherence to iOS safe areas for the Home Indicator and Dynamic Island/Notch.
- **Breakpoints:** While mobile-focused, layout containers should max out at 600px for tablet optimization, switching from full-width lists to centered cards.

## Elevation & Depth

To maintain a professional and secure feel, the design system avoids heavy shadows in favor of **Tonal Layers** and **Low-contrast Outlines**.

- **Level 0 (Base):** Primary background color.
- **Level 1 (Cards/Containers):** Raised via a subtle 1px border (#E9ECEF) or a very soft, high-diffusion shadow (0px 4px 12px, 5% opacity).
- **Level 2 (Modals/Toasts):** Higher elevation with a 15% opacity shadow and backdrop blur (Glassmorphism) to maintain context of the screen below.
- **Dark Mode Elevation:** Depth is communicated through lighter surface tints rather than shadows, following HIG standards.

## Shapes

The shape language is **Rounded**, utilizing an 8px (0.5rem) base radius. This strikes a balance between the "sharp" traditional legal world and the "soft" modern consumer app.

- **Primary Buttons & Inputs:** 8px radius.
- **Large Cards (Lawyer Profiles):** 16px radius (rounded-lg).
- **Status Chips:** Full "pill" rounding for maximum distinction from interactive buttons.
- **Selection States:** Checkboxes use a 4px radius, while Radio buttons remain circular.

## Components

### Buttons
- **Primary:** Deep Navy background, White text. High-emphasis for "Book Now" or "Confirm."
- **Secondary:** Outlined with Professional Blue. Used for "Message" or "View Profile."
- **Ghost:** No background or border. Professional Blue text. Used for "Cancel" or "See All."

### Input Fields
- **Standard:** 12pt label above, 16pt inner padding, 8px radius. Subtle border that thickens and turns Professional Blue on focus.
- **OTP Styling:** 6 individual square inputs with 12px spacing, highlighting the active digit with a blue underline or border.
- **Search:** Includes a magnifying glass icon; background slightly darker/lighter than base surface.

### Cards
- **Lawyer Profiles:** Features a circular avatar, star rating, specialty badge, and "Available" status indicator.
- **Category Cards:** Vertical stack with a centered icon and label.

### Feedback & Status
- **Status Chips:** High-contrast text on a low-opacity background of the same color (e.g., Success text on light green background).
- **Rating Stars:** Solid Gold (#FFC107) for filled, light gray for empty.
- **Toasts:** Positioned at the top of the screen (below the header), using a sleek, compact bar with an icon indicating the message type.

### Navigation
- **iOS Tab Bar:** Uses SF Symbols (or equivalent) with a blur background. Active state is Professional Blue; inactive is Gray.
- **Header Bars:** Centered title, 17pt SemiBold, with back buttons always labeled or icon-only depending on depth.