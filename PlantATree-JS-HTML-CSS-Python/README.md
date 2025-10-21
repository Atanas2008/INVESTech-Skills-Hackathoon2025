# PlantATree - Eco Platform for Sofia 🌳

Project for mapping green zones, eco trails, and sharing eco initiatives in Bulgaria.

## 🚀 How to start the project

### 1. Install Python dependencies

Open a terminal in the project folder and run:

```bash
pip install -r requirements.txt
```

### 2. Start the Flask server

```bash
python app.py
```

### 3. Open your browser

Go to: http://localhost:5000

## 📁 Project Structure

```
PlantATree-JS-HTML-CSS-Python/
│
├── index.html          # Main HTML page
├── design.css          # CSS styles
├── script.js           # JavaScript functionality
├── app.py              # Flask backend server
├── requirements.txt    # Python dependencies
├── plantatree.db       # SQLite database (created automatically)
└── uploads/            # Folder for uploaded images (created automatically)
```

## 🎯 Features

### ✅ Implemented:
- 🏠 **Home page** with statistics
- 🗺️ **Interactive map** with demo locations
- 📝 **Eco actions feed** for sharing initiatives
- 👤 **User profile** with points and badges
- ➕ **Add locations** and eco actions
- 🔧 **Backend API** with Flask and SQLite
- 📊 **Database** with tables for users, locations, actions

### 🔄 To be developed:
- 🔐 Registration/login system
- 🗺️ Real map with Geoapify API
- 📱 Mobile optimization
- 🎮 Advanced gamification
- 👨‍💼 Admin panel for moderation

## 🛠️ Technologies

- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Backend**: Python Flask
- **Database**: SQLite
- **API**: Geoapify (for maps)
- **Styles**: Font Awesome (for icons)

## 👥 Team Roles

### Person 1 - Frontend Developer
- ✅ HTML structure and design
- ✅ CSS styles and animations  
- ✅ Responsive design
- 🔄 Mobile optimization

### Person 2 - Backend Developer  
- ✅ Flask API endpoints
- ✅ Database models
- ✅ CRUD operations
- 🔄 User system

### Person 3 - Maps & Database
- ✅ Integration with Geoapify API
- ✅ SQLite schema and data
- 🔄 Real map with coordinates
- 🔄 Geolocation functions

### Person 4 - DevOps & QA
- ✅ Project documentation
- ✅ Deployment instructions  
- 🔄 Tests and debugging
- 🔄 Hosting and production setup

## 🌟 API Endpoints

### Locations
- `GET /api/locations` - All approved locations
- `POST /api/locations` - Add a new location

### Eco Actions
- `GET /api/eco-actions` - All approved actions
- `POST /api/eco-actions` - Add a new action

### Statistics
- `GET /api/stats` - General platform statistics

### Users
- `GET /api/user/{id}/profile` - User profile

## 🎨 Design Concept

- **Color scheme**: Green tones (#7bc142, #2d5a27)
- **Typography**: Modern, readable
- **Icons**: Font Awesome
- **Layout**: Grid-based, responsive
- **Animations**: Subtle hover effects

## 📱 Future Improvements

1. **Mobile app** (React Native)
2. **Push notifications** for eco events
3. **Social features** (chat, sharing)
4. **Partnerships** with eco organizations
5. **Rewards system** with real prizes
6. **ML suggestions** for eco zones

## 🔧 Troubleshooting

### Flask issues:
```bash
pip install --upgrade Flask Flask-CORS
```

### Database issues:
- Delete the `plantatree.db` file and restart the server

### Image upload issues:
- Check if the `uploads/` folder exists
- Check write permissions

## 📞 Contacts

For questions and suggestions, contact the PlantATree team!

---
Made with 💚 for a greener Sofia!