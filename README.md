# HabitTracker

A habit tracking application with social features to build and maintain healthy habits.

## Setup Instructions
### Docker Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/maheshsemwal/HabitTracker.git
   cd HabitTracker
   ```

2. **Setup environment files**
   ```bash
   cp backend/.env.example backend/.env
   ```
   add these variables
    ### Backend (.env)
    ```
    DATABASE_URL="postgresql://admin:password123@database:5432/habittracker"
    ACCESS_TOKEN_SECRET="your-super-secret-access-token-key-change-this-in-production"
    REFRESH_TOKEN_SECRET="your-super-secret-refresh-token-key-change-this-in-production"
    FRONTEND_URL="http://localhost:5173"
    PRISMA_API_KEY=""
    ```
    ```bash
    cp frontend/.env.example frontend/.env
    ```
    ### Frontend (.env)
    ```
    VITE_API_URL=http://localhost:3000/
    ```


3. **Start with Docker Compose**
   ```bash
   docker-compose up --build
   ```

4. **Access the application**
   - Frontend: http://localhost:5173
   - Backend: http://localhost:3000
   - Database: localhost:5432

**Note:** The backend automatically handles database migrations and seeding on startup.

## Database Configuration

- **Database:** habittracker
- **Username:** admin
- **Password:** password123
- **Port:** 5432

## Demo Users

- **Email:** john@example.com, jane@example.com, mike@example.com, sarah@example.com
- **Password:** password123

## Deployed URL
https://habit-tracker-eight-gilt.vercel.app/