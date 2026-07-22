@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --foreground-rgb: 17, 26, 22;
  --background-start-rgb: 246, 247, 244;
  --background-end-rgb: 255, 255, 255;
}

@layer base {
  :root {
    /* Cedar brand */
    --cedar-green: #0f5e3a;
    --cedar-green-light: #1a7a4e;
    --cedar-green-dark: #0a4a2e;
    --cedar-gold: #c9a227;
    --cedar-gold-light: #e0bd4a;
    --cedar-gold-dark: #a8851c;

    /* shadcn tokens mapped to Cedar */
    --background: 84 27% 97%;
    --foreground: 150 30% 8%;
    --card: 0 0% 100%;
    --card-foreground: 150 30% 8%;
    --popover: 0 0% 100%;
    --popover-foreground: 150 30% 8%;
    --primary: 144 68% 22%;
    --primary-foreground: 0 0% 100%;
    --secondary: 44 64% 47%;
    --secondary-foreground: 0 0% 100%;
    --muted: 150 10% 94%;
    --muted-foreground: 150 8% 40%;
    --accent: 144 40% 94%;
    --accent-foreground: 144 68% 22%;
    --destructive: 0 72% 51%;
    --destructive-foreground: 0 0% 98%;
    --border: 150 12% 88%;
    --input: 150 12% 88%;
    --ring: 144 68% 22%;
    --chart-1: 144 68% 22%;
    --chart-2: 44 64% 47%;
    --chart-3: 200 70% 45%;
    --chart-4: 28 80% 55%;
    --chart-5: 340 60% 55%;
    --radius: 0.75rem;

    --glass-bg: 255 255 255 / 0.7;
    --glass-border: 255 255 255 / 0.5;
  }
  .dark {
    --background: 150 30% 6%;
    --foreground: 84 20% 95%;
    --card: 150 28% 9%;
    --card-foreground: 84 20% 95%;
    --popover: 150 28% 9%;
    --popover-foreground: 84 20% 95%;
    --primary: 144 55% 42%;
    --primary-foreground: 150 30% 6%;
    --secondary: 44 64% 47%;
    --secondary-foreground: 0 0% 100%;
    --muted: 150 18% 16%;
    --muted-foreground: 150 12% 65%;
    --accent: 150 20% 18%;
    --accent-foreground: 144 55% 55%;
    --destructive: 0 62% 45%;
    --destructive-foreground: 0 0% 98%;
    --border: 150 18% 20%;
    --input: 150 18% 20%;
    --ring: 144 55% 42%;
    --chart-1: 144 55% 42%;
    --chart-2: 44 64% 52%;
    --chart-3: 200 70% 55%;
    --chart-4: 28 80% 60%;
    --chart-5: 340 65% 60%;

    --glass-bg: 20 30 24 / 0.6;
    --glass-border: 255 255 255 / 0.08;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
    font-feature-settings: 'rlig' 1, 'calt' 1;
  }
}

@layer components {
  .glass {
    background: hsl(var(--glass-bg));
    backdrop-filter: blur(16px) saturate(160%);
    -webkit-backdrop-filter: blur(16px) saturate(160%);
    border: 1px solid hsl(var(--glass-border));
  }
  .glass-card {
    @apply glass rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.06)];
  }
  .gradient-gold {
    background-image: linear-gradient(135deg, #c9a227 0%, #e0bd4a 50%, #c9a227 100%);
  }
  .gradient-cedar {
    background-image: linear-gradient(135deg, #0f5e3a 0%, #1a7a4e 100%);
  }
  .text-gradient-gold {
    background-image: linear-gradient(135deg, #c9a227 0%, #e0bd4a 100%);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
  }
  .text-gradient-cedar {
    background-image: linear-gradient(135deg, #0f5e3a 0%, #1a7a4e 100%);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
  }
  .scrollbar-hide::-webkit-scrollbar { display: none; }
  .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
  .hide-spin::-webkit-outer-spin-button,
  .hide-spin::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
}

@layer utilities {
  .animate-marquee {
    animation: marquee 30s linear infinite;
  }
  @keyframes marquee {
    from { transform: translateX(0); }
    to { transform: translateX(-50%); }
  }
  .shimmer {
    background: linear-gradient(90deg, hsl(var(--muted)) 25%, hsl(var(--accent)) 50%, hsl(var(--muted)) 75%);
    background-size: 200% 100%;
    animation: shimmer 1.5s infinite;
  }
  @keyframes shimmer {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }
}

/* RTL support */
[dir='rtl'] {
  text-align: right;
}
