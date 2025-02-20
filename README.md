# Is Aya Alive???

**Spoiler Alert**: She totally is! 💖

Ever wondered about Aya's current state of existence? Wonder no more! This app tracks her heartbeat, activity, and proves once and for all that she is, indeed, alive and kicking. 

## What's This Magic? 

This isn't just an app. It's a real-time Aya-existence-verification system powered by her Oura Ring. Whether she's resting, active, or working out, you'll know EXACTLY what she's up to.

## Environment Setup

### Environment Variables

This project uses a `.env` file to manage sensitive configuration details. 

#### Required Environment Variables
- `OURA_TOKEN`: Your Oura Ring API token

#### Setup Instructions
1. Create a `.env` file in the project root
2. Add your Oura Ring API token:
   ```
   OURA_TOKEN=your_oura_api_token_here
   ```

#### Security Notes
- The `.env` file is already included in `.gitignore`
- Never commit your actual API token to version control
- For Netlify deployments, set the `OURA_TOKEN` in the Netlify environment variables

### Running the App
1. Install dependencies:
   ```bash
   npm install
   ```
2. Create `.env` file with your token
3. Run the application:
   ```bash
   npm start
   ```
Simply open `index.html` in your browser or use a local development server.
