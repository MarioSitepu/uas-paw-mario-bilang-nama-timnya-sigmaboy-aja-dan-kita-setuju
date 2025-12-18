# 🚀 Quick Reference Guide - Landing Page Development

## 📍 File Locations

### Component Files
```
src/components/
├── Header.tsx                          # Navigation - import untuk sticky header
├── sections/
│   ├── HeroSection.tsx                # Top section dengan CTA
│   ├── AboutSection.tsx               # About us section
│   ├── ValuesSection.tsx              # Company values
│   ├── TestimonialsSection.tsx        # User testimonials
│   ├── InsightsSection.tsx            # Blog section
│   ├── CTASection.tsx                 # Call-to-action
│   ├── Footer.tsx                     # Footer
│   └── index.ts                       # Export all sections
└── layout/
    └── PublicLayout.tsx               # Wrapper layout
```

### Page Files
```
src/pages/
├── Landing.tsx                        # Main landing page
└── PublicDoctorsList.tsx             # Public doctors list
```

### Data Files
```
src/services/mock/
└── landing-page.data.ts              # Mock data
```

---

## 🔧 How to Use Components

### Basic Import Pattern
```typescript
// Import single component
import { HeroSection } from '@/components/sections/HeroSection';

// Or use index export
import { HeroSection, Footer } from '@/components/sections';

// Use in JSX
<HeroSection />
```

### Using PublicLayout
```typescript
import { PublicLayout } from '@/components/layout/PublicLayout';

export const MyPublicPage = () => {
  return (
    <PublicLayout>
      <div>Page content here</div>
    </PublicLayout>
  );
};
```

---

## 🎨 Styling Reference

### Color Classes Used
```css
/* Blues */
bg-blue-400, bg-blue-500, bg-blue-600, bg-blue-50, bg-blue-100, bg-blue-200, bg-blue-300
text-blue-600, text-blue-50, text-blue-900

/* Grays */
bg-gray-50, bg-gray-100, bg-gray-900
text-gray-900, text-gray-600, text-gray-400, text-gray-300

/* Other */
bg-yellow-400, text-yellow-400 (for star ratings)
text-white, bg-white
```

### Spacing Classes
```css
/* Padding */
py-20, py-32, py-16, py-12, py-8, py-4
px-4, px-6, px-8

/* Margins */
mb-6, mb-8, mb-12, mb-16
gap-4, gap-6, gap-8, gap-12
```

### Common Classes
```css
/* Responsive */
hidden md:flex, hidden lg:block, grid-cols-1 md:grid-cols-2 lg:grid-cols-3

/* Rounded */
rounded-lg, rounded-xl, rounded-2xl, rounded-full

/* Shadows */
shadow-sm, shadow-lg

/* Effects */
hover:shadow-lg, hover:scale-105, hover:bg-blue-50
transition-all, transition-colors, transition-transform
transform, -translate-y-2

/* Typography */
font-bold, font-semibold, font-medium
text-sm, text-base, text-lg, text-xl, text-2xl, text-3xl, text-5xl, text-6xl
```

---

## 🔗 Routes

### Public Routes (No Login Required)
```
/                           → Landing page
/auth/register             → Register page
/auth/login                → Login page
/patient/doctors-list      → Public doctors listing
```

### Protected Routes (Login Required)
```
/app/patient/dashboard     → Patient dashboard
/app/patient/doctors       → Doctors list (logged in)
/app/patient/appointments  → My appointments
/app/doctor/dashboard      → Doctor dashboard
/app/doctor/schedule       → Doctor schedule
```

---

## 🎯 Component Props

### Header
```typescript
// No props required - automatically handles routing
<Header />
```

### HeroSection
```typescript
// No props - uses Link for navigation
<HeroSection />
```

### Footer
```typescript
// No props - self-contained
<Footer />
```

### PublicLayout
```typescript
interface PublicLayoutProps {
  children: React.ReactNode;
}

<PublicLayout>
  <YourComponent />
</PublicLayout>
```

---

## 🛠️ Common Modifications

### Change Hero Headline
**File**: `src/components/sections/HeroSection.tsx`
```typescript
<h1 className="text-5xl lg:text-6xl font-bold mb-6 leading-tight">
  Your New Headline Here
</h1>
```

### Add More Testimonials
**File**: `src/components/sections/TestimonialsSection.tsx`
```typescript
const testimonials: Testimonial[] = [
  // ... existing
  {
    id: 4,
    name: 'New Person',
    role: 'Role',
    image: '👨',
    content: 'Content here',
    rating: 5,
  },
];
```

### Change Colors
Search and replace:
```
bg-blue-600 → bg-[your-color]-600
text-blue-600 → text-[your-color]-600
from-blue-400 to-blue-500 → from-[your-color]-400 to-[your-color]-500
```

### Add New Section
1. Create `src/components/sections/NewSection.tsx`
2. Add component logic
3. Add to `src/components/sections/index.ts`
4. Import and use in `src/pages/Landing.tsx`

---

## 📱 Responsive Breakpoints

Tailwind breakpoints digunakan:
```
sm: 640px   (small tablets)
md: 768px   (tablets)
lg: 1024px  (desktops)
xl: 1280px  (large screens)
2xl: 1536px (extra large)
```

Example:
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* 1 column on mobile, 2 on tablet, 3 on desktop */}
</div>
```

---

## 🎪 Icons Available

From `lucide-react`:
```typescript
import { 
  ArrowRight,         // Right arrow
  ArrowLeft,          // Left arrow  
  Heart,              // Heart shape
  Search,             // Search icon
  Lock,               // Lock/secure
  Users,              // Multiple people
  Eye,                // Visibility
  Zap,                // Lightning/energy
  Shield,             // Security/protection
  Sparkles,           // Shine/excellence
  Calendar,           // Date/calendar
  Menu,               // Hamburger menu
  X,                  // Close/cross
  Star,               // Star rating
  Facebook,           // Social media
  Twitter,            // Social media
  Instagram,          // Social media
  Linkedin,           // Social media
} from 'lucide-react';
```

---

## 🔍 Finding and Editing

### To Edit a Section
1. Open `src/components/sections/[SectionName].tsx`
2. Modify JSX/content
3. Save file
4. Check `http://localhost:5173` for changes (hot reload)

### To Change Navigation Links
1. Open `src/components/Header.tsx`
2. Modify `navItems` array
3. Update Link paths in `href` attributes

### To Modify Landing Page Order
1. Open `src/pages/Landing.tsx`
2. Reorder import statements or section rendering
3. Changes appear immediately

---

## 🐛 Troubleshooting

### Hero section looks wrong
- Check gradient classes: `from-blue-400 to-blue-500`
- Verify responsive classes: `py-20 lg:py-32`

### Links not working
- Check routes in `src/App.tsx`
- Verify `react-router-dom` is installed
- Use relative paths with `/`

### Icons not showing
- Ensure `lucide-react` is installed: `npm install lucide-react`
- Check import statement has correct icon name

### Styling not applied
- Verify Tailwind CSS is installed and configured
- Check `index.css` includes `@tailwind` directives
- Make sure class names are spelled correctly

---

## 📊 Data Management

### Mock Data Location
```
src/services/mock/landing-page.data.ts
```

### Using Mock Data
```typescript
import { LANDING_PAGE_DATA } from '@/services/mock/landing-page.data';

const { hero, about, testimonials } = LANDING_PAGE_DATA;
```

### Replacing with API
1. Remove hardcoded data
2. Add `useEffect` hook
3. Call API in useEffect
4. Set state from response
5. Render from state instead of hardcoded data

---

## 🚀 Deployment Checklist

- [ ] Replace all emoji images with real images
- [ ] Update mock data with real data from API
- [ ] Test all links and navigation
- [ ] Test responsive design on different devices
- [ ] Check loading states
- [ ] Test error handling
- [ ] Update copyright year in Footer
- [ ] Check SEO meta tags
- [ ] Test form submissions
- [ ] Performance audit

---

## 📞 Quick Commands

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint and format
npm run lint
npm run format
```

---

**Last Updated**: December 18, 2024
**Maintained By**: Development Team
