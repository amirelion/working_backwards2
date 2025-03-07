# Dashboard Feature Module

This feature module contains all components, hooks, and types related to the dashboard functionality. The dashboard shows a list of the user's Working Backwards processes and allows for filtering, sorting, and various actions (create, open, rename, delete).

## Structure

```
dashboard/
├── components/          # UI Components
│   ├── DashboardContainer.tsx  # Main container component
│   ├── ProcessCard.tsx         # Individual process card
│   ├── ProcessGrid.tsx         # Grid of process cards
│   ├── ProcessFilters.tsx      # Search, filter, and sort controls
│   ├── ProcessDialogs.tsx      # Dialog modals (create, rename, delete)
│   └── ProcessMenu.tsx         # Process action menu
├── hooks/               # Custom hooks
│   ├── useProcessDialogs.ts    # Dialog and menu state management
│   └── useProcessFiltering.ts  # Filtering and sorting logic
├── types/               # Type definitions
│   └── index.ts                # Shared types and interfaces
└── index.tsx            # Main export
```

## Components

### DashboardContainer

Main container component that orchestrates the dashboard UI and business logic. It handles authentication state, loading states, and composition of other components.

### ProcessCard

Displays individual process information in a card format, including title, creation date, and last update time.

### ProcessGrid

Displays a grid of ProcessCard components, handling loading states and empty states.

### ProcessFilters

Contains the search field, filter dropdown, sort button, and "New Process" button.

### ProcessDialogs

Contains all dialog modals:
- New Process dialog
- Delete confirmation dialog
- Rename process dialog

### ProcessMenu

Context menu for process options (open, rename, delete).

## Custom Hooks

### useProcessDialogs

Manages all dialog-related state and actions:
- Opening/closing dialogs
- Dialog form state
- Process menu state
- CRUD operations on processes

### useProcessFiltering

Handles filtering, sorting, and searching of processes:
- Search query state
- Filter state (all, recent, completed)
- Sort order (newest, oldest, alphabetical, last updated)
- Filtered process calculation

## Usage

The dashboard feature is integrated into the main application route for `/dashboard`. To use it:

```tsx
import Dashboard from './features/dashboard';

// In your router
<Route path="/dashboard" element={<Dashboard />} />
```

## Dependencies

This feature module depends on:
- Material UI components
- date-fns for date formatting
- AuthContext for user information
- ProcessListContext for process data and operations
- CurrentProcessContext for loading processes 