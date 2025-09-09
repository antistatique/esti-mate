# Spelling & Grammar Check Feature

## Overview
Add AI-powered spelling and grammar checking for estimate row descriptions using OpenAI API through a custom proxy server.

## User Experience Flow

1. **Trigger**: User clicks "check spell" button in top-right area (next to "IA" button)
2. **Processing**: All estimate row descriptions are sent to AI for analysis
3. **Visual Feedback**: Rows with issues get highlighted with pink/red borders
4. **Review Panel**: Right-side panel shows:
   - Original text with issues highlighted
   - Corrected version with changes marked
   - Accept/Reject buttons for each correction
5. **Application**: User manually accepts or rejects each row's corrections
6. **Clean Rows**: Rows without issues show no visual changes

## UI Design

### Trigger Button ✅ COMPLETED
- **Location**: Top-right area of estimate header
- **Style**: Harvest PDS dropdown button with proper classes
- **Label**: "IA Tools" dropdown with "Spell check" menu item
- **Behavior**: Dropdown menu with spell check option
- **Implementation**: Full Harvest-style dropdown with backdrop, menu, and accessibility

### Row Highlighting
- **Visual**: Pink/red border around rows with spelling/grammar issues
- **State**: Only rows with issues are highlighted
- **Clean rows**: No visual changes for error-free descriptions

### Correction Panel
- **Location**: Right-side panel (similar to mockup)
- **Content**: 
  - "[Reviewed content here with changes highlighted]"
  - Accept/Reject buttons for user decision
- **Interaction**: Manual review and acceptance of each correction

## Technical Architecture

### Frontend (Extension)
- **UI Components**:
  - "Check spell" button in estimate header area
  - Row highlighting system (pink borders for rows with issues)
  - Correction panel component with Accept/Reject controls
  - Loading states and progress indicators

- **API Integration**:
  - Send all row descriptions to local proxy server
  - Handle batched responses with row-by-row corrections
  - Apply accepted corrections to Harvest input fields

### Backend (Proxy Server)
**Location**: `./server/` directory

- **Technology Stack**: Node.js/Express API server
- **Endpoints**:
  - `POST /check-spelling` - Accepts array of text descriptions
  - Returns structured corrections with highlighted changes
- **OpenAI Integration**:
  - Use GPT model for spelling/grammar analysis
  - Format response with clear before/after comparisons
  - Handle rate limiting and error scenarios
- **Security**:
  - CORS configuration for extension origin
  - API key management for OpenAI
  - Input sanitization and validation

## Implementation Plan

### Phase 1: UI Integration ✅ COMPLETED
1. ✅ **Add "IA Tools" dropdown button** to estimate header (top-right positioning)
2. ✅ **Create Harvest-style dropdown structure** with proper PDS classes
3. ✅ **Add "Spell check" menu item** with click handlers
4. ✅ **Implement loading states** and user feedback ("Checking...")
5. ✅ **Add proper accessibility** attributes and keyboard navigation

### Phase 2: Server Development 🔄 NEXT
1. **Setup Express server** in `./server/` directory
2. **Create OpenAI integration** with spelling/grammar prompts
3. **Implement `/check-spelling` endpoint**
4. **Add error handling** and response formatting
5. **Test with sample estimate descriptions**

### Phase 3: API Integration & Functionality
1. **Collect description text** from all estimate rows
2. **Send data to server API** for spell/grammar checking
3. **Create correction panel component** for displaying results
4. **Implement row highlighting system** for rows with issues
5. **Add Accept/Reject functionality** for corrections

### Phase 4: UI/UX Polish
1. **Refine visual highlighting** (pink borders, change indicators)
2. **Improve correction panel** layout and interactions
3. **Add keyboard shortcuts** for Accept/Reject
4. **Error handling** for network issues
5. **Performance optimization** for large estimates

## Data Flow

```
1. User clicks "IA Tools" dropdown → "Spell check" menu item
2. Extension collects all row descriptions
3. POST to ./server/check-spelling with:
   {
     "descriptions": [
       { "id": "row-1", "text": "Description text..." },
       { "id": "row-2", "text": "Another description..." }
     ]
   }
4. Server processes with OpenAI API
5. Returns corrections:
   {
     "corrections": [
       {
         "id": "row-1",
         "hasIssues": true,
         "original": "Descriptin text...",
         "corrected": "Description text...",
         "changes": [{"type": "spelling", "from": "Descriptin", "to": "Description"}]
       }
     ]
   }
6. Extension highlights rows and shows correction panel
7. User accepts/rejects corrections per row
```

## Configuration

### Server Configuration
- **Port**: Configurable (default: 3000)
- **OpenAI API Key**: Environment variable
- **CORS Origins**: Extension URLs
- **Rate Limiting**: Prevent abuse

### Extension Settings
- **Server URL**: Configurable in extension options
- **Auto-check**: Option to check on estimate load
- **Language**: Spelling check language preference

## Error Handling

- **Network errors**: Graceful fallback with user notification
- **API rate limits**: Queue requests with user feedback
- **Server unavailable**: Clear error messaging
- **Invalid responses**: Fallback to no corrections

## Future Enhancements

- **Custom dictionary**: Add domain-specific terms
- **Language detection**: Auto-detect estimate language
- **Batch processing**: Handle large estimates efficiently
- **Confidence scoring**: Show certainty levels for corrections
- **Learning**: Remember user preferences for corrections

## Files to Create/Modify

### New Files
- `./server/package.json` - Server dependencies
- `./server/index.js` - Express server setup
- `./server/routes/spelling.js` - Spelling check endpoint
- `./server/.env.example` - Environment variables template
- `./src/content/components/SpellChecker.js` - Main component
- `./src/content/components/CorrectionPanel.js` - UI for corrections

### Modified Files
- `./src/content/App.js` - Initialize spell checker
- `./src/content/index.js` - Add spell check button to header
- `./CLAUDE.md` - Reference this planning document

## Testing Strategy

- **Unit tests**: Server endpoint functionality
- **Integration tests**: Extension-server communication
- **Manual testing**: Real estimate scenarios
- **Performance testing**: Large estimate handling
- **Cross-browser testing**: Chrome/Firefox compatibility