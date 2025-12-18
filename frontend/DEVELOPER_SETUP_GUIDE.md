# 🚀 Developer Setup Guide

## Getting Started with MedixWeb Landing Page

Complete guide untuk developer baru untuk memahami dan bekerja dengan landing page implementation.

---

## ⚙️ Prerequisites

Pastikan Anda sudah memiliki:
- Node.js 16.x atau lebih tinggi
- npm 7.x atau yarn
- VS Code atau editor pilihan Anda
- Git (untuk version control)
- Basic React knowledge

### Check Versions
```bash
node --version   # Should be v16+
npm --version    # Should be v7+
```

---

## 📦 Installation Steps

### 1. Navigate to Project
```bash
cd d:\uas-paw-mario-bilang-nama-timnya-sigmaboy-aja-dan-kita-setuju\frontend
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Verify Installation
```bash
npm list react react-router-dom tailwindcss lucide-react
```

### 4. Start Development Server
```bash
npm run dev
```

### 5. Open in Browser
```
http://localhost:5173
```

---

## 🗂️ Project Structure Understanding

### Where are the landing page files?
```
src/
├── components/
│   ├── Header.tsx                    ← Navigation at top
│   ├── sections/                     ← All 7 sections here
│   │   ├── HeroSection.tsx
│   │   ├── AboutSection.tsx
│   │   ├── ValuesSection.tsx
│   │   ├── TestimonialsSection.tsx
│   │   ├── InsightsSection.tsx
│   │   ├── CTASection.tsx
│   │   ├── Footer.tsx
│   │   └── index.ts
│   └── layout/
│       └── PublicLayout.tsx          ← Layout wrapper
│
├── pages/
│   ├── Landing.tsx                   ← Main landing page
│   └── PublicDoctorsList.tsx         ← Doctors page
│
└── services/mock/
    └── landing-page.data.ts          ← Mock data
```

---

## 👀 Quick Page Preview

### Landing Page Structure
The Landing page is built from these sections (in order):
1. **Header** - Navigation menu
2. **HeroSection** - Main hero with CTA
3. **AboutSection** - About us
4. **ValuesSection** - Core values
5. **TestimonialsSection** - User testimonials
6. **InsightsSection** - Blog articles
7. **CTASection** - Final call to action
8. **Footer** - Footer links

### Viewing the Landing Page
- URL: `http://localhost:5173/`
- Should display all sections vertically
- Header is sticky at top
- Footer at bottom

---

## ✏️ Making Your First Change

### Task: Change Hero Headline

**Step 1**: Open file
```
src/components/sections/HeroSection.tsx
```

**Step 2**: Find the headline (around line 20)
```typescript
// Current:
<h1 className="text-5xl lg:text-6xl font-bold mb-6 leading-tight">
  Your Trusted Partner in Modern Healthcare
</h1>

// Change to:
<h1 className="text-5xl lg:text-6xl font-bold mb-6 leading-tight">
  Your New Headline Here
</h1>
```

**Step 3**: Save the file (Ctrl+S)

**Step 4**: Browser updates automatically (hot reload)

**Result**: You'll see the change in `http://localhost:5173/`

---

## 🎨 Understanding Styling

### Tailwind CSS Classes

All styling uses Tailwind CSS utility classes:
```typescript
// Colors
bg-blue-600      // Background color (blue)
text-white       // Text color (white)
text-gray-600    // Text color (gray)

// Spacing
px-4            // Padding horizontal
py-8            // Padding vertical
gap-4           // Gap between items
mb-6            // Margin bottom

// Typography
text-5xl        // Large text
font-bold       // Bold text
text-center     // Center text

// Layout
grid            // CSS Grid
flex            // Flexbox
container       // Max-width container
mx-auto         // Center horizontally

// Responsive
md:             // Medium screens and up
lg:             // Large screens and up
```

Example:
```typescript
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* 1 column on mobile, 2 on tablet, 3 on desktop */}
</div>
```

---

## 🔗 Understanding Routes

### How Navigation Works

1. **Landing Page**
   - URL: `/`
   - Component: `src/pages/Landing.tsx`
   - Access: Public (no login needed)

2. **Doctors List**
   - URL: `/patient/doctors-list`
   - Component: `src/pages/PublicDoctorsList.tsx`
   - Access: Public (no login needed)

3. **Register**
   - URL: `/auth/register`
   - Component: `src/pages/auth/Register.tsx`
   - Access: Public (no login needed)

4. **Login**
   - URL: `/auth/login`
   - Component: `src/pages/auth/Login.tsx`
   - Access: Public (no login needed)

### Navigation Flow
```
Landing Page
    ↓
"Explore Services" button → /patient/doctors-list
"Book Appointment" button → /auth/register

Doctors List Page
    ↓
"Book Now" button → /auth/register
"Back to Home" link → /
```

---

## 📝 Common Tasks

### Task 1: Add a New Testimonial

**File**: `src/components/sections/TestimonialsSection.tsx`

Find the testimonials array and add:
```typescript
const testimonials: Testimonial[] = [
  // ... existing testimonials
  {
    id: 4,
    name: 'New Person Name',
    role: 'Their Role',
    image: '👨',  // or 👩 for women
    content: 'Their testimonial text here',
    rating: 5,
  },
];
```

### Task 2: Change Footer Links

**File**: `src/components/sections/Footer.tsx`

Find the links section and modify URLs or labels.

### Task 3: Update About Section Features

**File**: `src/components/sections/AboutSection.tsx`

The features are hardcoded. To add/edit:
```typescript
const features: Feature[] = [
  {
    icon: <YourIcon />,
    title: 'Feature Title',
    description: 'Feature description',
  },
  // Add more...
];
```

### Task 4: Change Color Scheme

Search and replace in all section files:
```
From: bg-blue-600    To: bg-green-600
From: text-blue-600  To: text-green-600
```

---

## 🐛 Debugging Tips

### Common Issues

**Issue**: "Cannot find module 'react'"
- **Solution**: Run `npm install`
- **Check**: `node_modules` folder exists

**Issue**: Page shows blank
- **Check**: Browser console (F12) for errors
- **Check**: Port 5173 is correct
- **Try**: Refresh page (Ctrl+R)

**Issue**: Styling not showing
- **Check**: Tailwind CSS classes spelled correctly
- **Check**: `index.css` has Tailwind imports
- **Try**: Restart dev server (`npm run dev`)

**Issue**: Links don't work
- **Check**: Routes in `App.tsx` match links
- **Check**: Path names match exactly (case-sensitive)

### Debug Logs
Add to any component to see if it renders:
```typescript
console.log('Component loaded');
useEffect(() => {
  console.log('Component mounted');
}, []);
```

---

## 📚 File Reference Guide

### Components at a Glance

| Component | Purpose | Lines | Complexity |
|-----------|---------|-------|-----------|
| Header.tsx | Navigation | ~100 | Medium |
| HeroSection | Main section | ~90 | Low |
| AboutSection | About info | ~80 | Low |
| ValuesSection | Core values | ~150 | Medium |
| TestimonialsSection | Reviews | ~70 | Low |
| InsightsSection | Blog | ~90 | Low |
| CTASection | Call-to-action | ~50 | Low |
| Footer | Footer | ~100 | Medium |
| PublicLayout | Layout wrapper | ~20 | Very Low |
| PublicDoctorsList | Doctors page | ~150 | Medium |

---

## 🔄 Development Workflow

### Daily Workflow
```
1. Morning:
   npm run dev
   Open http://localhost:5173
   
2. Develop:
   - Edit files in src/
   - Browser auto-updates
   - Check console for errors
   
3. Commit changes:
   git add .
   git commit -m "Update landing page"
   
4. End of day:
   npm run build (optional, to test)
```

### Testing Changes
```bash
# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## 📖 Key Concepts

### Components are Functions
```typescript
export const MyComponent: React.FC = () => {
  return (
    <div>Component content</div>
  );
};
```

### Using Props
```typescript
interface MyProps {
  title: string;
  count: number;
}

export const MyComponent: React.FC<MyProps> = ({ title, count }) => {
  return <div>{title}: {count}</div>;
};
```

### Using Links for Navigation
```typescript
import { Link } from 'react-router-dom';

<Link to="/page-name">Click me</Link>
```

### Using Tailwind Classes
```typescript
<div className="bg-blue-600 text-white p-4 rounded-lg hover:bg-blue-700 transition-colors">
  Styled element
</div>
```

---

## 🎯 Next Learning Steps

1. **Understand React Basics**
   - Functional components
   - JSX syntax
   - Props and state

2. **Learn Tailwind CSS**
   - Utility-first CSS
   - Responsive design
   - Custom configuration

3. **Master React Router**
   - Route configuration
   - Navigation
   - Dynamic routes

4. **Explore Project Structure**
   - Component organization
   - File structure
   - Module imports

---

## 💾 Saving Your Work

### Using Git
```bash
# Check changes
git status

# Stage changes
git add .

# Commit with message
git commit -m "Update landing page sections"

# Push to remote
git push origin main
```

### Without Git
Simply save files with Ctrl+S. Dev server auto-reloads.

---

## 🚀 Ready to Build?

### Checklist
- [ ] Node.js installed
- [ ] Dependencies installed (`npm install`)
- [ ] Dev server running (`npm run dev`)
- [ ] Browser showing http://localhost:5173
- [ ] No console errors
- [ ] Understanding project structure
- [ ] Read QUICK_REFERENCE.md
- [ ] Ready to make changes!

### First Task Ideas
1. Change hero headline
2. Add new testimonial
3. Modify footer links
4. Change color scheme
5. Add new section

---

## 📞 Getting Help

### Resources
- **Documentation**: Check `QUICK_REFERENCE.md`
- **Architecture**: See `ARCHITECTURE_OVERVIEW.md`
- **Specific Changes**: Check `FILE_SUMMARY.md`
- **Implementation**: Review `DESIGN_IMPLEMENTATION.md`

### Searching Code
- **VS Code**: Ctrl+F (find in file)
- **VS Code**: Ctrl+Shift+F (find in project)
- **Find components**: Search for `export const`
- **Find issues**: Look for red squiggles

---

## 🎓 Learning Resources

### React
- Official Docs: https://react.dev
- Hooks Guide: https://react.dev/reference/react
- Router Docs: https://reactrouter.com

### Tailwind CSS
- Official Docs: https://tailwindcss.com
- Component Examples: https://tailwindui.com
- Interactive Playground: https://play.tailwindcss.com

### TypeScript
- Official Docs: https://www.typescriptlang.org
- React with TypeScript: https://react-typescript-cheatsheet.netlify.app

---

## ✨ You're All Set!

Sekarang Anda siap untuk:
- ✅ Menjalankan project
- ✅ Memahami struktur
- ✅ Membuat perubahan
- ✅ Menambah fitur
- ✅ Meng-debug masalah

**Happy Coding!** 🎉

---

**Created**: December 18, 2024
**Type**: Developer Guide
**Level**: Beginner to Intermediate
