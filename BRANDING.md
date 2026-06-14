# Brand Identity & Design System: Abdullah Malik (M3 Foundation)

This document establishes the strict design constraints for the Abdullah Malik personal brand, built entirely on the **Material Design 3 (M3)** framework. All future development must adhere to these tokens and principles to ensure a cohesive, accessible, and high-quality user experience.

---

## 1. Core Philosophy: Material You
The brand follows the "Material You" philosophy: adaptive, expressive, and personal. 
- **Consistency:** Use standardized M3 components and layouts.
- **Hierarchy:** Use color, weight, and elevation to guide the user's eye.
- **Motion:** Everything that happens on screen should feel physical and intentional.

---

## 2. Color System (Material 3 Tokens)
We use a **Dynamic Tonal Palette** approach. Colors are mapped to functional roles.

| Role | Light Tone | Dark Tone | Description |
| :--- | :--- | :--- | :--- |
| **Primary** | #6750A4 | #D0BCFF | Key component actions (CTAs). |
| **On Primary** | #FFFFFF | #381E72 | Text/Icons on Primary color. |
| **Secondary** | #625B71 | #CCC2DC | Less prominent components. |
| **Tertiary** | #7D5260 | #EFB8C8 | Accents and contrasting elements. |
| **Surface** | #FEF7FF | #141218 | Backgrounds for cards, menus, pages. |
| **On Surface** | #1D1B20 | #E6E1E5 | Main text on surface. |
| **Outline** | #79747E | #938F99 | Borders and structural dividers. |

**Rule:** Never use "pure" black or white for surfaces; always use the M3 tinted neutrals to maintain perceived depth.

---

## 3. Typography (M3 Type Scale)
The brand uses the **Standard M3 Type Scale** for clarity across all viewports.
- **Primary Typeface:** `Nunito` (Sans-serif)
- **Secondary Typeface:** `Syne` (Display/Headlines - for personality)

| Role | Weight | Size | Usage |
| :--- | :--- | :--- | :--- |
| **Display Large** | Regular | 57px | Hero headers. |
| **Headline Medium** | Medium | 28px | Section headers. |
| **Title Medium** | Medium | 16px | Card titles / Navigation. |
| **Body Large** | Regular | 16px | Long-form reading. |
| **Label Small** | Medium | 11px | Metadata / Small labels. |

---

## 4. Shape & Radii
Shape is used to define boundaries and hierarchy. M3 uses a system of rounded corners.

| Token | Radius | Example |
| :--- | :--- | :--- |
| **XS** | 4px | Text fields, simple buttons. |
| **Small** | 8px | Action chips, small cards. |
| **Medium** | 12px | Menu items, standard cards. |
| **Large** | 16px | Dialogs, expansion panels. |
| **XL** | 28px | Large cards, bottom sheets. |
| **Full** | 999px | CTAs (Pill shape), Avatars. |

---

## 5. Elevation & Tint
In M3, elevation is primarily conveyed through **Surface Tints** rather than heavy shadows.
- **Level 0:** 0dp (Flat surface)
- **Level 1:** +1% Primary Tint (Subtle lift)
- **Level 2:** +3% Primary Tint (Active card)
- **Level 3:** +6% Primary Tint (Floating UI)
- **Shadows:** Use only for extreme focus (Dialogs/Popups). Default to 0.1 opacity blurred blacks.

---

## 6. Motion & Interaction
Motion should be "Standard" or "Emphasized" as per M3 specs.
- **Standard Easing:** `cubic-bezier(0.2, 0, 0, 1)`
- **Standard Duration:** 300ms (Transitions), 150ms (Hover state).
- **Emphasized Easing:** `cubic-bezier(0.05, 0.7, 0.1, 1)` (Used for entrance animations).

**Rule:** Interaction must always be accompanied by a state change (ripple effect or color shift).

---

## 7. Spacing & Grid
- **Base Unit:** 8dp (All margins/paddings must be multiples of 8).
- **Gutter:** 24px (Desktop), 16px (Mobile).
- **Max Width:** 1280px for centered content.

---

## 8. Icons
- **Source:** `lucide-react`
- **Size:** 24px (Default), 18px (Micro), 32px (Feature).
- **Stroke:** 1.5pt for a modern, airy feel.
