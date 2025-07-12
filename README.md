# Team members

Zala Vishvarajsinh Krushnpalsinh(TL) / vkzala0007@gmail.com
Jadeja Ghyanmayeeba Ranjitsinh / ghyanmatlab@gmail.com
Nistha Leua Alpeshkumar / nisthaleua@gmail.com
Souvik Hazra / souvikhazra1901@gmail.com

# SkillSwap Frontend

SkillSwap is a web application that allows users to exchange skills and connect with like-minded individuals. This frontend project provides a modern, responsive interface for browsing user profiles, searching for skills, requesting swaps, and managing user accounts.

## Features
- **User Authentication:** Login, signup, and session management.
- **Profile Browsing:** View user profiles, skills offered/wanted, ratings, and feedback.
- **Skill Search & Filters:** Search by skill and filter by availability.
- **Skill Swap Requests:** Request skill swaps via modal forms.
- **Admin Panel:** Manage users and requests (admin only).
- **Responsive Design:** Optimized for desktop and mobile devices.

## Project Structure
```
FrontEnd/
├── admin.html           # Admin dashboard
├── config.json          # App configuration
├── eslint.config.js     # ESLint configuration
├── index.html           # Main landing page
├── login.html           # Login page
├── package.json         # Project dependencies
├── postcss.config.js    # PostCSS configuration
├── profile.html         # User profile page
├── requests.html        # Skill swap requests page
├── signup.html          # Signup page
├── tailwind.config.js   # Tailwind CSS configuration
├── tsconfig*.json       # TypeScript configs
├── vite.config.ts       # Vite build config
├── js/                  # JavaScript logic
│   ├── admin.js
│   ├── auth.js
│   ├── data.js
│   ├── main.js
│   ├── profile.js
│   └── requests.js
├── src/                 # TypeScript/React source
│   ├── App.tsx
│   ├── index.css
│   ├── main.tsx
│   ├── vite-env.d.ts
│   ├── context/
│   │   ├── AuthContext.tsx
│   │   └── DataContext.tsx
│   └── types/
│       └── index.ts
├── styles/              # CSS styles
│   ├── main.css
│   └── responsive.css
```

## Getting Started
1. **Install dependencies:**
   ```sh
   npm install
   ```
2. **Run the development server:**
   ```sh
   npm run dev
   ```
3. **Open in browser:**
   Navigate to `http://localhost:5173` (default Vite port).

## Technologies Used
- HTML, CSS, JavaScript
- TypeScript, React
- Vite (build tool)
- Tailwind CSS
- ESLint, PostCSS

## Scripts

## Customization

## How to Use

1. **Browse Profiles:**
   - On the main page (`index.html`), view the grid of user profiles.
   - Click a profile to open a modal with detailed info, skills, availability, and feedback.

2. **Search & Filter:**
   - Use the search bar to find users by skill (e.g., "Photoshop").
   - Filter profiles by availability using the dropdown (weekends, evenings, etc.).

3. **Request a Skill Swap:**
   - In a profile modal, click "Request Skill Swap" to open the request form.
   - Select the skill you offer and the skill you want, add a message, and submit.

4. **Authentication:**
   - Use `login.html` to log in or `signup.html` to create an account.
   - Once logged in, additional navigation links (Profile, Requests, Admin) become available.

5. **Profile Management:**
   - Access your profile via the Profile link to view or edit your details and skills.

6. **View & Manage Requests:**
   - Go to `requests.html` to see incoming/outgoing skill swap requests.

7. **Admin Panel:**
   - If you have admin access, use `admin.html` to manage users and requests.

8. **Responsive Design:**
   - The app adapts to mobile and desktop screens automatically.

For further customization or development, refer to the source files in the `js/` and `src/` folders.

