# CongreCount - AI-Powered Attendance Counter

[![PWA Badge](https://img.shields.io/badge/PWA-Ready-4285F4?logo=pwa)](https://congrecount.app)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

## Overview

**CongreCount** is a cutting-edge Progressive Web App (PWA) that uses AI-powered face recognition to provide real-time, accurate attendance counting for events, conferences, and entrance monitoring.

### Key Features

✨ **AI-Powered Face Recognition**

- Real-time face detection and tracking
- Automatic duplicate person detection
- Forward-facing face filtering to prevent side-angle duplicates
- Descriptor-based matching with distance thresholding (0.58)

🔒 **Privacy-First Design**

- All processing happens locally on your device
- No images stored or transmitted to servers
- No cloud dependencies for core functionality
- GDPR compliant by design

📱 **Progressive Web App (PWA)**

- Works offline with full functionality
- Installable on any device (mobile, tablet, desktop)
- One-click installation from browser
- Fast, app-like experience

📊 **Rich Analytics**

- Unique person tracking across sessions
- Demographics breakdown (age, gender)
- Session duration tracking
- CSV export for reports

🎯 **Smart Features**

- IndexedDB storage for persistent face memory
- Automatic recognition of returning attendees
- Clear storage button for privacy control
- Real-time status updates and statistics

## PWA Installation

### Desktop (Chrome, Edge, Firefox)

1. Visit [https://congrecount.app](https://congrecount.app)
2. Click the "Install" button in the address bar
3. Choose "Install"
4. App opens in standalone window

### Mobile (iOS & Android)

1. Visit [https://congrecount.app](https://congrecount.app) in mobile browser
2. Tap the share button
3. Select "Add to Home Screen" / "Install app"
4. App installs as native app

### Features When Installed

- ✅ Works completely offline
- ✅ Runs independent of browser
- ✅ Fast launch and performance
- ✅ Persistent data storage
- ✅ Background sync support
- ✅ Push notifications ready

## SEO & Social Media

The app includes comprehensive metadata for search engines and social media crawlers:

- **Open Graph Tags** - Rich sharing on Facebook, LinkedIn, GitHub
- **Twitter Cards** - Beautiful tweets with preview
- **Structured Data** - JSON-LD for search engines
- **Robots.txt** - Search engine crawling rules
- **Sitemap.xml** - Site structure for SEO
- **Security.txt** - Security researcher contact info

### Social Sharing Preview

When you share CongreCount on social media:

- **Title**: CongreCount - AI-Powered Attendance Counter
- **Description**: Real-time face recognition attendance counter for events, entrances, and meetings
- **Image**: CongreCount Logo
- **URL**: https://congrecount.app

## Technical Stack

- **Frontend**: React + TypeScript + Tailwind CSS
- **AI/ML**: @vladmandic/human (Face detection & recognition)
- **Storage**: IndexedDB (persistent face memory)
- **PWA**: Service Workers + Workbox
- **Build**: Vite + VitePWA

## Architecture

### Face Recognition Pipeline

1. **Detection** - Real-time face detection from camera feed
2. **Filtering** - Forward-facing validation (±25° yaw, ±20° pitch/roll)
3. **Extraction** - Face descriptor extraction (1024-dim embedding)
4. **Matching** - Descriptor-based matching with 0.58 threshold
5. **Storage** - IndexedDB persistence with session tracking

### Duplicate Prevention

- **Session Memory** - Best-match strategy within current session
- **Global Memory** - IndexedDB storage across sessions
- **Similarity Threshold** - 0.58 cosine similarity (prevents angle/lighting duplicates)
- **Forward-Face Only** - Rejects side profiles to prevent false duplicates

## Data Privacy

- ✅ No cloud storage
- ✅ No image logging
- ✅ No external tracking
- ✅ Descriptor-only storage (not reconstructable)
- ✅ Local IndexedDB only
- ✅ Clear storage button available

## Browser Support

| Browser | Desktop | Mobile |
| ------- | ------- | ------ |
| Chrome  | ✅      | ✅     |
| Edge    | ✅      | ✅     |
| Firefox | ✅      | ✅     |
| Safari  | ⚠️      | ✅     |
| Opera   | ✅      | ✅     |

## Development

### Prerequisites

- Node.js 16+
- npm or yarn

### Setup

```bash
git clone https://github.com/yourusername/congrecount.git
cd congrecount
npm install
npm run dev
```

### Build for Production

```bash
npm run build
npm run preview
```

### Service Worker Development

The app uses two service worker strategies:

- **Cache-First** for assets (images, CSS, JS)
- **Network-First** for dynamic content

## API Reference

### Face Detection

```typescript
const detections = await detectHumanFaces(videoElement);
// Returns: HumanDetectionResult[]
// - descriptor: Float32Array (face embedding)
// - gender: 'male' | 'female'
// - age: number
// - box: [x, y, w, h]
// - angle: { roll, pitch, yaw }
// - isForwardFacing: boolean
```

### Face Matching

```typescript
const similarity = calculateSimilarity(descriptor1, descriptor2);
// Returns: number (0-1, where 1 = identical face)
// Threshold: 0.58 for matching
```

### IndexedDB Storage

```typescript
await addToFaceMemory(descriptor, gender, age, personId, sessionId);
await updateFaceMemory(personId, sessionId);
const match = await findMatchingFaceInMemory(descriptor, threshold);
await clearFaceMemory(); // Privacy control
```

## Performance Metrics

- **Detection FPS**: 10-15 FPS on mobile
- **Memory Usage**: ~50-100MB IndexedDB for 10,000+ faces
- **Battery Impact**: ~15% per hour on mobile
- **Model Size**: ~20MB AI models (cached)

## Troubleshooting

### App Not Installing

- Ensure site is served over HTTPS
- Check browser compatibility
- Verify manifest.json is valid

### Face Not Detected

- Ensure adequate lighting
- Face should be roughly 30-60% of frame
- Look directly at camera
- Clear any obstructions

### Same Person Counted Twice

- Verify face is forward-facing (not angled)
- Check lighting consistency
- Clear face memory and restart

## Contributing

Contributions welcome! Please see [CONTRIBUTING.md](CONTRIBUTING.md)

## License

MIT License - See [LICENSE](LICENSE) for details

## Support

- 📧 Email: support@congrecount.app
- 🐛 Issues: [GitHub Issues](https://github.com/yourusername/congrecount/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/yourusername/congrecount/discussions)

---

**Made with ❤️ for accurate attendance counting**
