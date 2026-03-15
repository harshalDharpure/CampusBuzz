# Campus Navigation System (CNS) — CampusBaze

A production-ready campus navigation web app for students, staff, and visitors. Built with **Next.js 14 (App Router)** and **Google Maps JavaScript API**.

## Features

- **Interactive campus map** — Buildings from JSON, markers, clustering
- **Search** — Autocomplete-style search; map zooms to selected building
- **Route navigation** — Set start/destination; walking directions with distance and time
- **Live location** — Browser Geolocation API; your position on the map
- **Facility filters** — Filter by library, cafeteria, labs, hostel, parking, admin
- **QR codes** — Per-building QR code; scan to open that building’s navigation page
- **Dark mode** — Toggle in the top bar
- **Mobile-friendly** — Responsive layout

## Quick start

### 1. Install and run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 2. Environment variable

Create `.env.local` in the project root (or copy from `.env.example`):

```env
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

**Required Google APIs:**  
- Maps JavaScript API  
- Directions API  

Optional: Geocoding API if you use place search beyond the built-in building list.

Get an API key: [Google Cloud Console](https://console.cloud.google.com/google/maps-apis/).

---

## How to use the app

### Example: Get directions from Hostel to Library

**Scenario:** You are at the hostel and want to walk to the Main Library.

#### Option A — Using your phone’s live location (recommended when you’re actually at the hostel)

1. **Allow location** when the browser asks for permission (so the app can use your current position).
2. On the map, click the button **“Use my location as start”** (bottom-left).  
   The map will center on you and set your current position as the **start** of the route.
3. **Choose the Library as destination:**
   - Either **search** “library” in the search box and click the result, or  
   - **Click the Library marker** on the map.
4. In the **right-hand panel**, click **“Get directions”**.  
   You’ll see the **walking route** from your current location to the Library, with **distance** and **estimated time**.

---

#### Option B — Picking Hostel and Library by name (e.g. you’re planning the route, not using GPS)

1. **Set start (Hostel):**
   - Search **“hostel”** or click a **Hostel** marker on the map.
   - In the right panel, click **“Set as start”** (or “Set as start: Current location”).
2. **Set destination (Library):**
   - Search **“library”** or click the **Main Library** marker.
   - Click **“Set as destination”**.
3. Click **“Get directions”**.  
   The map shows the **walking path** from Hostel to Library with **distance** and **time**.

---

### Quick reference

| Goal | What to do |
|------|------------|
| **Start from where I am now** | Click **“Use my location as start”** (bottom-left on the map). |
| **Start from a building** | Click that building’s marker (or search it), then **“Set as start”** in the panel. |
| **Go to a building** | Click that building’s marker (or search it), then **“Set as destination”** or **“Get directions”**. |
| **One-tap: from my location → this building** | Click the building’s marker, then **“Quick: Navigate from my location”** in the panel. |
| **Only see certain places** | Use the **filter buttons** (All, Library, Cafeteria, Labs, Hostel, Parking, Admin). |
| **Remove the route** | Click **“Clear route”** in the side panel. |

---

## Project structure

```
campusbaze/
├── app/
│   ├── layout.tsx      # Root layout
│   ├── page.tsx        # Home page (wraps CampusNavigator)
│   └── globals.css     # Global and dark theme styles
├── components/
│   ├── Map.tsx                 # Google Map, markers, clustering, directions
│   ├── SearchBox.tsx           # Building search + Places autocomplete
│   ├── FilterButtons.tsx       # Category filters
│   ├── BuildingSidePanel.tsx   # Building info, nav controls, QR code
│   └── CampusNavigator.tsx     # Main app state and layout
├── data/
│   └── buildings.json          # Campus buildings dataset
├── lib/
│   ├── types.ts        # TypeScript types
│   └── mapUtils.ts     # Distance/format helpers
├── public/             # Static assets (e.g. building photos)
├── .env.local          # API key (not committed)
├── .env.example        # Example env
└── README.md
```

## Data format

Edit `data/buildings.json` to match your campus. Example:

```json
[
  {
    "id": 1,
    "name": "Main Library",
    "lat": 18.5204,
    "lng": 73.8567,
    "category": "library",
    "description": "Central campus library",
    "facilities": ["wifi", "study room"],
    "photo": "/buildings/library.jpg"
  }
]
```

**Categories:** `library` | `cafeteria` | `labs` | `hostel` | `parking` | `admin office`

## Deployment

### Vercel (recommended)

1. Push the project to GitHub.
2. In [Vercel](https://vercel.com), import the repo.
3. Add environment variable: `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` = your key.
4. Deploy.

```bash
# Or use Vercel CLI
npm i -g vercel
vercel
# Set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY when prompted or in project settings.
```

### Build and run production locally

```bash
npm run build
npm start
```

## Admin panel

Use the **Admin** panel to set latitude and longitude for all campus buildings. The map then uses this data for directions.

1. Open **Admin** (link in the top bar of the map) or go to `/admin`.
2. For each building you can:
   - Edit **name**, **latitude**, **longitude**, **category**, **description**, and **facilities**.
   - Click **Use my location** when you are physically at that building to fill its coordinates from your device GPS.
3. Click **Save all** to store the list in your browser (used when you open the map).
4. **Export JSON** — download the building list as a file.
5. **Import JSON** — upload a previously exported file to load or restore buildings.
6. **Reset to default** — restore the original sample building list.

After saving, go back to the map. Use **Use my location as start** and choose a building to get walking directions from your current position to that building.

## QR code navigation

Each building has a QR code in the side panel. Scanning it opens:

`https://your-domain.com/?building=<id>`

The app selects that building and zooms the map to it.

## Tech stack

- **Next.js 14** (App Router)
- **React 18**
- **@react-google-maps/api** — Map, Places, Geometry
- **@googlemaps/markerclusterer** — Marker clustering
- **qrcode.react** — QR codes
- **TypeScript**

## License

MIT.
