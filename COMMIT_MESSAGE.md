feat: Add Cycle piece for product feedback management

## Summary
Add comprehensive Cycle integration piece enabling product teams to automate feedback workflows through Activepieces.

## Features Added

### Actions (6)
- **Create Feedback**: Create new feedback entries in Cycle workspace
- **Assign Country**: Assign country attributes to feedback using real attribute value IDs
- **Get Attribute Values**: Discover available attributes and their option values
- **Explore Schema**: GraphQL schema introspection for advanced users
- **Custom GraphQL**: Execute custom GraphQL queries against Cycle API
- **Custom API Call**: Make direct REST API calls to Cycle endpoints

### Triggers (4)
- **New Feedback**: Poll for newly created feedback items
- **Feedback Status Changed**: Monitor feedback status transitions
- **Feedback Assigned**: Track feedback assignment changes
- **New Comment**: Detect new comments on feedback

## Technical Implementation
- **GraphQL Integration**: Full GraphQL client with proper query/mutation handling
- **Authentication**: Bearer token authentication via PieceAuth.SecretText
- **API Endpoint**: `https://api.product.cycle.app/graphql`
- **Real Attribute IDs**: Production-ready with actual Cycle attribute value IDs
- **Polling Strategy**: Efficient polling triggers with timestamp-based filtering
- **Error Handling**: Robust error handling with proper HTTP status codes
- **TypeScript**: Fully typed implementation with proper interfaces

## Production Ready
- ✅ No linting errors
- ✅ Real API integration tested
- ✅ Professional naming and descriptions
- ✅ Proper authentication flow
- ✅ Production attribute value IDs
- ✅ Comprehensive trigger coverage

## Usage
Enables automation workflows such as:
- Auto-create feedback from form submissions
- Notify teams when feedback status changes
- Assign feedback based on customer location
- Sync feedback data with external systems
- Custom reporting and analytics

## Category
Productivity / Product Management

## Author
meenu-lekha-premakumar
