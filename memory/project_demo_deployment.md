---
name: Demo Environment Deployment
description: Status and key findings from the demo environment setup on Azure + Vercel
type: project
---

Demo environment is live as of 2026-04-12.

**URLs:**
- Frontend: https://biz-slot-one.vercel.app
- Backend: https://bizslot-api-demo-g8bngmgdb2e5gtht.israelcentral-01.azurewebsites.net
- Database: bizslot-demo on bizslot-demo-server.database.windows.net (Azure SQL serverless, free tier)

**Key lessons learned:**
- Azure auto-generates App Service URLs with a random suffix — never assume the name matches exactly
- Azure SQL serverless free tier pauses after 1h idle — connection string needs `Connection Timeout=60;`
- Azure portal shows connection strings with `{your_password}` placeholder — user must manually remove the `{}` braces
- Admin seed in Program.cs was wrapped in try/catch to survive slow DB wake-up
- `ASPNETCORE_ENVIRONMENT=Demo` activates appsettings.Demo.json

**Why:** Demo environment for UAT before production. Azure App Service F1 (free) + Azure SQL serverless free tier.

**How to apply:** When debugging Azure connectivity issues, check the connection string in App Settings for placeholder braces first.
