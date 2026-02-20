# Brightstream Branch Locator (Next.js)

## What this includes

- Next.js App Router (React + TypeScript)
- `/api/graph` proxy route to keep the Graph auth key server-side
- Pages:
  - Home: geolocation → nearest branches, ZIP quick search, country preview
  - Search: name/city/country/ZIP search
  - Countries: browse countries
  - Country detail: branches filtered by country code
  - All Branches: simple pagination
- SWR for client caching


## Optimizely GpahQL Headless Branch Finder Approach 

- Browse and query using the GrpahiQL interface to determine what data is available and what formats.
- Research best options for geolocation and distance calculation like HTML5 Geo API and Haversine formula.
- Use AI to help determine edge cases for desktop and mobile including security 
- Reviewed Brightstream example urls for style and design reference.
- Used AI to pull css data from example sites then check code and make tweeks.  
- Created a quick simple POC app using Google Apps Script to enter API to return data and test graphQA queries, and other needed APIs. No more than 30min.
- Once POC is working,
  -   Create git repo
  -   create skeleton next.js
  -   Use AI to update next with the functions from the POC and style previously aquired.
  -   Use Visual Studio Code to update local dev in real-time
- Run and test locally and use claude "Code" to help with testing and debugging and committing to git.
- Review AI generated code and make any changes
- commit changed to git branch using Claude Code. 
- Use Claude Code for any lingering bugs found in branch testing.
- Push changes to main in git and deploy in vercel.


## Observations and roadblocks:
- The Optimizely Content Graph BranchWhereInput doesn't support filtering on any of the custom fields (Name, City, ZipCode, Country).
  -   The only thing that works is getAllBranches with no where clause.
  -   Solution: fetch all branches once, do all filtering client-side.
  -   State data does not exist in the graph schema.
- Can't use country code server-side for anything
- State information not available in the Optimizely GraphQL provided
- Robots.txt blocking AI from being able to grab CSS and HTML file for quick styling. 
