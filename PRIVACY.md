# Privacy Policy for Esti'mate

**Last Updated**: December 18, 2025

## Overview

Esti'mate is a browser extension that enhances Harvest's estimate functionality. This privacy policy explains what data we collect and how it is used.

## Data Collection

### Local Storage Only

The extension stores the following data **locally in your browser** only:
- Airtable workspace identifier
- Airtable API key
- Project management percentage preference
- Spellcheck server URL (if configured)

**This data never leaves your browser** except as described below.

### Optional Spellcheck Feature

If you configure and use the optional spellcheck feature:

**What data is collected:**
- Text content from estimate descriptions that you choose to spellcheck
- The content is sent to your configured spellcheck server

**Where it goes:**
- To the server URL you configure in the extension options
- This is typically a self-hosted server you control
- Default: `http://localhost:3000` (your local machine only)

**How it's used:**
- The server processes the text using AI (OpenAI API) to check spelling and grammar
- Corrections are returned to the extension
- The text may be temporarily stored by the AI service (OpenAI) according to their privacy policy

**You control this:**
- The spellcheck feature is **completely optional**
- You must manually configure a server URL to enable it
- You decide which text to check (item by item)
- If no server URL is configured, no data is transmitted

### Airtable Integration

If you configure Airtable integration:

**What data is sent:**
- Your Airtable API key
- Requests to fetch template data from your Airtable workspace

**Where it goes:**
- Directly to `api.airtable.com`
- This is Airtable's official API endpoint

**How it's used:**
- To fetch description templates you've configured in your Airtable workspace
- Subject to [Airtable's Privacy Policy](https://www.airtable.com/privacy)

## Third-Party Services

### Airtable (Optional)
- **Purpose**: Fetch description templates
- **Privacy Policy**: https://www.airtable.com/privacy
- **Data Sent**: API key, workspace queries
- **Your Control**: Only if you configure Airtable credentials

### OpenAI (Optional, via your spellcheck server)
- **Purpose**: AI-powered spelling and grammar checking
- **Privacy Policy**: https://openai.com/policies/privacy-policy
- **Data Sent**: Text content you choose to spellcheck
- **Your Control**: Only if you configure and use spellcheck feature

## No Analytics or Tracking

This extension does **not** collect:
- Usage statistics
- Analytics data
- Personal information
- Browsing history
- Any telemetry

## Data Sharing

We do not:
- Sell your data
- Share your data with third parties (except services you explicitly configure)
- Track your usage
- Store data on our servers

## Your Rights

You can:
- View all stored data in the extension's options page
- Delete all data by removing the extension
- Disable features that transmit data
- Use the extension without the optional features that transmit data

## Updates to This Policy

We will update this policy as needed. Check the "Last Updated" date at the top.

## Contact

For questions about this privacy policy:
- GitHub: https://github.com/antistatique/esti-mate
- Website: https://antistatique.net

## Self-Distribution Note

This extension is self-distributed for internal use. It is not published on public app stores. Updates are distributed via https://esti-mate.antistatique.io
