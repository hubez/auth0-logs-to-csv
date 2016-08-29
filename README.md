# Auth0 Logs to CSV

Small tool to export your Auth0 Logs to a CSV file.

> Note: this tool still uses API v1

## Getting your account information

 1. Go to the Auth0 dashboard
 2. Go to **Apps/APIs**
 3. Get the `domain`, `client_id` and `client_secret` for one of your apps
 4. Save this information in a file called `config.json` in the following format:
 ```json
 {
   "AUTH0_DOMAIN": "{YOUR_DOMAIN}",
   "AUTH0_CLIENT_ID": "{CLIENT_ID}",
   "AUTH0_CLIENT_SECRET": "{CLIENT_SECRET}"
 }
 ```

## Exporting your logs

 1. Install Node.js 4.0 or higher: https://nodejs.org/en/download/
 2. Clone/Download this repository
 3. Run `npm start` from the repository's directory