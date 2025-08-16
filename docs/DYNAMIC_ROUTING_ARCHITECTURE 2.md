# Dynamic Routing Architecture with `[[...tab]].tsx`

## Table of Contents
- [Overview](#overview)
- [Implementation Pattern](#implementation-pattern)
- [Current Implementations](#current-implementations)
- [Benefits \& Advantages](#benefits--advantages)
- [Technical Architecture](#technical-architecture)
- [Code Examples](#code-examples)
- [File Structure](#file-structure)
- [URL Patterns](#url-patterns)
- [Best Practices](#best-practices)
- [Migration Guide](#migration-guide)
- [Troubleshooting](#troubleshooting)

## Overview

The Nezeza Distributors Platform uses Next.js **catch-all dynamic routes** with the `[[...tab]].tsx` pattern to create sophisticated, tab-based user interfaces in the support system. This approach allows a single file to handle multiple related routes while maintaining clean URLs and excellent user experience.

### What is `[[...tab]].tsx`?

The double bracket syntax `[[...tab]]` creates an **optional catch-all route** that matches:
- The base route: `/path`
- Single segments: `/path/segment`
- Multiple segments: `/path/segment1/segment2/segment3`

The parameter name `tab` is arbitrary - it could be `slug`, `path`, or any other name.

## Implementation Pattern

### Core Pattern Structure
```typescript
// File: pages/[userType]/support/[[...tab]].tsx

const TAB_MAP = {
  '': 'home',                    // /support
  'submit-ticket': 'submit-ticket', // /support/submit-ticket
  'my-tickets': 'my-tickets',       // /support/my-tickets
  'faqs': 'faqs',                   // /support/faqs
};

type TabValue = 'home' | 'submit-ticket' | 'my-tickets' | 'faqs';

const SupportPage = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [selectedTab, setSelectedTab] = useState<TabValue>('home');

  // Extract tab from URL
  useEffect(() => {
    const lastSegment = pathname?.split('/').pop() || '';
    const mappedTab = TAB_MAP[lastSegment as keyof typeof TAB_MAP] || 'home';
    setSelectedTab(mappedTab as TabValue);
  }, [pathname]);

  // Handle tab navigation
  const handleTabChange = (value: string) => {
    const targetPath = `/user/support${value === 'home' ? '' : `/${value}`}`;
    router.push(targetPath);
  };

  return (
    <Layout>
      <Tabs value={selectedTab} onValueChange={handleTabChange}>
        {/* Tab content based on selectedTab */}
      </Tabs>
    </Layout>
  );
};
```

## Current Implementations

Our platform currently uses this pattern in **5 support system implementations**, each tailored for different user types:

### 1. Customer Support
**File**: `pages/customer/support/[[...tab]].tsx`
**Routes Handled**:
- `/customer/support` → Home dashboard
- `/customer/support/submit-ticket` → Submit support ticket
- `/customer/support/my-tickets` → View submitted tickets
- `/customer/support/track-package` → Package tracking
- `/customer/support/order-assistance` → Order help
- `/customer/support/faqs` → Frequently asked questions

**Features**:
- Customer-focused support experience
- Order tracking integration
- Simple ticket submission
- Consumer-oriented FAQ

### 2. Retailer Support
**File**: `pages/retailer/support/[[...tab]].tsx`
**Routes Handled**:
- `/retailer/support` → Business dashboard
- `/retailer/support/submit-ticket` → Business request submission
- `/retailer/support/my-tickets` → Ticket management with business context
- `/retailer/support/analytics` → Support analytics and business metrics
- `/retailer/support/faqs` → Business-focused FAQ

**Advanced Features**:
- Business impact assessment
- Revenue tracking integration
- Volume pricing requests
- Account manager integration
- Sophisticated ticket management with file attachments

### 3. Wholesaler Support
**File**: `pages/wholesaler/support/[[...tab]].tsx`
**Routes Handled**:
- `/wholesaler/support` → Wholesaler home
- `/wholesaler/support/submit-ticket` → B2B ticket submission
- `/wholesaler/support/my-tickets` → B2B ticket management
- `/wholesaler/support/faqs` → Wholesaler FAQ

**Features**:
- B2B-focused support interface
- Bulk order support
- Partner-level assistance

### 4. Manufacturer Support
**File**: `pages/manufacturer/support/[[...tab]].tsx`
**Routes Handled**:
- `/manufacturer/support` → Manufacturer home
- `/manufacturer/support/submit-ticket` → Manufacturing support requests
- `/manufacturer/support/my-tickets` → Production-related tickets
- `/manufacturer/support/faqs` → Manufacturing FAQ

**Features**:
- Production-focused support
- Supply chain assistance
- Manufacturing-specific workflows

### 5. Admin Support Management
**File**: `pages/admin/support/[[...tab]].tsx`
**Routes Handled**:
- `/admin/support` → Admin dashboard (defaults to tickets)
- `/admin/support/dashboard` → Support analytics dashboard
- `/admin/support/tickets` → All support tickets management

**Features**:
- System-wide ticket management
- Support analytics and reporting
- Cross-user-type ticket handling
- Administrative controls

## Benefits & Advantages

### 1. **Code Organization & Maintenance**
- **Single File per User Type**: Instead of 5+ separate files, one file handles all related routes
- **Centralized Logic**: Tab navigation, state management, and routing logic in one place
- **Reduced Duplication**: Shared components and patterns across tabs
- **Easier Updates**: Add new tabs by updating configuration arrays

### 2. **User Experience Excellence**
- **Fast Navigation**: No page reloads when switching between tabs
- **Bookmarkable URLs**: Each tab has its own URL for direct access
- **Browser History**: Back/forward navigation works correctly
- **State Persistence**: User context maintained across tab switches

### 3. **SEO & Accessibility**
- **Clean URLs**: Human-readable and search-engine friendly
- **Proper Meta Tags**: Each tab can have unique meta information
- **Progressive Enhancement**: Works with JavaScript disabled
- **Screen Reader Support**: Proper ARIA labels and navigation

### 4. **Role-Based Customization**
- **User-Specific Content**: Each implementation tailored to user needs
- **Permission Integration**: Role-based access control per tab
- **Business Logic**: Custom workflows for different user types
- **Scalable Architecture**: Easy to add new user types

### 5. **Performance Benefits**
- **Code Splitting**: Only load components when needed
- **Shared Resources**: Common components loaded once
- **Optimized Rendering**: React's reconciliation works efficiently
- **Reduced Bundle Size**: Compared to separate page approach

## Technical Architecture

### URL Resolution Flow
```
1. User visits: /retailer/support/analytics
2. Next.js matches: pages/retailer/support/[[...tab]].tsx
3. useRouter provides: params.tab = ['analytics']
4. Component extracts: lastSegment = 'analytics'
5. TAB_MAP lookup: 'analytics' → 'analytics'
6. State update: selectedTab = 'analytics'
7. Render: Analytics component content
```

### State Management Pattern
```typescript
// URL-driven state management
const [selectedTab, setSelectedTab] = useState<TabValue>('home');

// Sync with URL changes
useEffect(() => {
  const lastSegment = pathname?.split('/').pop() || '';
  const mappedTab = TAB_MAP[lastSegment as keyof typeof TAB_MAP] || 'home';
  setSelectedTab(mappedTab as TabValue);
}, [pathname]);

// Navigation triggers URL changes
const handleTabChange = (value: string) => {
  const targetPath = `/retailer/support${value === 'home' ? '' : `/${value}`}`;
  router.push(targetPath); // This triggers useEffect above
};
```

### Component Architecture
```typescript
// Tab configuration approach
const tabs = [
  { 
    label: 'Dashboard', 
    value: 'dashboard', 
    content: <DashboardContent />,
    icon: '📊'
  },
  { 
    label: 'Submit Request', 
    value: 'submit-ticket', 
    content: <SubmitTicketContent />,
    icon: '🎫'
  },
  // ... more tabs
];

// Dynamic content rendering
const tabContent = tabs.find((tab) => tab.value === selectedTab)?.content;
```

## Code Examples

### Basic Implementation
```typescript
// pages/department/support/[[...tab]].tsx
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

const TAB_MAP = {
  '': 'home',
  'tickets': 'tickets',
  'analytics': 'analytics',
};

type TabValue = 'home' | 'tickets' | 'analytics';

const DepartmentSupportPage = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [selectedTab, setSelectedTab] = useState<TabValue>('home');

  useEffect(() => {
    const lastSegment = pathname?.split('/').pop() || '';
    const mappedTab = TAB_MAP[lastSegment as keyof typeof TAB_MAP] || 'home';
    setSelectedTab(mappedTab as TabValue);
  }, [pathname]);

  const handleTabChange = (value: string) => {
    const targetPath = `/department/support${value === 'home' ? '' : `/${value}`}`;
    router.push(targetPath);
  };

  const renderTabContent = () => {
    switch (selectedTab) {
      case 'home':
        return <HomeComponent />;
      case 'tickets':
        return <TicketsComponent />;
      case 'analytics':
        return <AnalyticsComponent />;
      default:
        return <HomeComponent />;
    }
  };

  return (
    <Layout>
      <TabNavigation 
        selectedTab={selectedTab} 
        onTabChange={handleTabChange} 
      />
      <div className="tab-content">
        {renderTabContent()}
      </div>
    </Layout>
  );
};

export default DepartmentSupportPage;
```

### Advanced Implementation with Form State
```typescript
// Advanced example from retailer support
const RetailerSupportPage = () => {
  const [selectedTab, setSelectedTab] = useState<TabValue>('dashboard');
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [formData, setFormData] = useState({
    subject: '',
    requestType: '',
    businessImpact: 'low',
    description: '',
    attachments: [] as File[],
  });

  // Memoized content components to prevent re-renders
  const renderTabContent = useCallback(() => {
    switch (selectedTab) {
      case 'dashboard':
        return <DashboardContent 
          businessData={businessData}
          tickets={tickets}
          onTabChange={handleTabChange}
        />;
      case 'submit-ticket':
        return <SubmitTicketContent 
          formData={formData}
          onSubmit={handleSubmit}
          onChange={handleInputChange}
        />;
      case 'my-tickets':
        return <MyTicketsContent 
          tickets={tickets}
          selectedTicket={selectedTicket}
          onTicketSelect={setSelectedTicket}
        />;
      default:
        return <DashboardContent />;
    }
  }, [selectedTab, formData, tickets, selectedTicket]);

  return (
    <SupportCenterLayout>
      <Tabs value={selectedTab} onValueChange={handleTabChange}>
        <TabsList>
          {tabs.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value}>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
      <div className="max-w-7xl mx-auto mt-2 mb-4 px-4">
        {renderTabContent()}
      </div>
    </SupportCenterLayout>
  );
};
```

## File Structure

### Traditional Approach (Avoided)
```
retailer/
└── support/
    ├── index.tsx              # Dashboard
    ├── submit-ticket.tsx      # Submit form
    ├── my-tickets.tsx         # Ticket list
    ├── analytics.tsx          # Business analytics
    └── faqs.tsx              # FAQ page
```
**Problems**: 5 files, inconsistent navigation, state loss on navigation

### Our Dynamic Approach
```
retailer/
└── support/
    └── [[...tab]].tsx         # Handles ALL support routes
```
**Benefits**: 1 file, consistent navigation, shared state, faster development

### Complete Project Structure
```
pages/
├── customer/
│   └── support/
│       └── [[...tab]].tsx    # Customer support portal
├── retailer/
│   └── support/
│       └── [[...tab]].tsx    # Business support portal
├── wholesaler/
│   └── support/
│       └── [[...tab]].tsx    # B2B support portal
├── manufacturer/
│   └── support/
│       └── [[...tab]].tsx    # Manufacturing support
└── admin/
    └── support/
        └── [[...tab]].tsx    # Admin support management
```

## URL Patterns

### Customer Support URLs
```
/customer/support                    → Home dashboard
/customer/support/submit-ticket      → Submit ticket form
/customer/support/my-tickets         → Customer's tickets
/customer/support/track-package      → Package tracking
/customer/support/order-assistance   → Order help
/customer/support/faqs               → Customer FAQ
```

### Retailer Support URLs
```
/retailer/support                    → Business dashboard
/retailer/support/submit-ticket      → Business request form
/retailer/support/my-tickets         → Business tickets
/retailer/support/analytics          → Support analytics
/retailer/support/faqs               → Business FAQ
```

### Admin Support URLs
```
/admin/support                       → Ticket management (default)
/admin/support/dashboard             → Support analytics
/admin/support/tickets               → All tickets view
```

### URL Parameters Access
```typescript
// For URL: /retailer/support/analytics
import { useParams } from 'next/navigation';

const params = useParams();
console.log(params.tab); // ['analytics']

// For URL: /retailer/support/tickets/urgent
const params = useParams();
console.log(params.tab); // ['tickets', 'urgent']
```

## Best Practices

### 1. **TAB_MAP Configuration**
```typescript
// Use descriptive, URL-friendly keys
const TAB_MAP = {
  '': 'home',                    // Always handle base route
  'submit-ticket': 'submit-ticket', // Use kebab-case for URLs
  'my-tickets': 'my-tickets',    // Keep URLs readable
  'faqs': 'faqs',               // Short, clear identifiers
};

// Avoid:
const TAB_MAP = {
  'submitTicket': 'submit',      // camelCase in URLs
  'my_tickets': 'tickets',       // snake_case in URLs
  'frequently-asked-questions': 'faq', // Too long
};
```

### 2. **Type Safety**
```typescript
// Define strict types for tabs
type TabValue = 'home' | 'submit-ticket' | 'my-tickets' | 'faqs';

// Use type-safe tab mapping
const mappedTab = TAB_MAP[lastSegment as keyof typeof TAB_MAP] || 'home';
setSelectedTab(mappedTab as TabValue);
```

### 3. **Performance Optimization**
```typescript
// Memoize expensive components
const DashboardContent = React.memo(({ data, onAction }) => {
  // Component implementation
});

// Use useCallback for event handlers
const handleTabChange = useCallback((value: string) => {
  const targetPath = `/retailer/support${value === 'home' ? '' : `/${value}`}`;
  router.push(targetPath);
}, [router]);

// Optimize content rendering
const renderTabContent = useCallback(() => {
  switch (selectedTab) {
    case 'dashboard':
      return <DashboardContent key="dashboard" data={data} />;
    // ... other cases
  }
}, [selectedTab, data]);
```

### 4. **Error Handling**
```typescript
// Handle invalid routes gracefully
useEffect(() => {
  const lastSegment = pathname?.split('/').pop() || '';
  const mappedTab = TAB_MAP[lastSegment as keyof typeof TAB_MAP];
  
  if (!mappedTab && lastSegment !== '') {
    // Invalid tab, redirect to home
    router.replace('/retailer/support');
    return;
  }
  
  setSelectedTab((mappedTab || 'home') as TabValue);
}, [pathname, router]);
```

### 5. **Accessibility**
```typescript
// Proper ARIA labels and roles
<Tabs value={selectedTab} onValueChange={handleTabChange} role="tablist">
  <TabsList aria-label="Support navigation">
    {tabs.map((tab) => (
      <TabsTrigger 
        key={tab.value} 
        value={tab.value}
        role="tab"
        aria-selected={selectedTab === tab.value}
      >
        {tab.label}
      </TabsTrigger>
    ))}
  </TabsList>
</Tabs>
```

## Migration Guide

### From Traditional Pages to Dynamic Routes

#### Step 1: Identify Related Pages
```
# Current structure
/dashboard/users.tsx
/dashboard/settings.tsx
/dashboard/analytics.tsx

# Target structure
/dashboard/[[...tab]].tsx
```

#### Step 2: Create TAB_MAP
```typescript
const TAB_MAP = {
  '': 'users',           // Default tab
  'settings': 'settings',
  'analytics': 'analytics',
};
```

#### Step 3: Extract Components
```typescript
// Move page content to components
import UserDashboard from '@/components/Dashboard/UserDashboard';
import SettingsPanel from '@/components/Dashboard/SettingsPanel';
import AnalyticsView from '@/components/Dashboard/AnalyticsView';
```

#### Step 4: Implement Dynamic Route
```typescript
const DashboardPage = () => {
  // Implementation following our pattern
  const renderTabContent = () => {
    switch (selectedTab) {
      case 'users':
        return <UserDashboard />;
      case 'settings':
        return <SettingsPanel />;
      case 'analytics':
        return <AnalyticsView />;
      default:
        return <UserDashboard />;
    }
  };
  
  // ... rest of implementation
};
```

#### Step 5: Update Navigation
```typescript
// Replace direct page links
<Link href="/dashboard/settings">Settings</Link>

// With tab-based navigation
<TabsTrigger value="settings">Settings</TabsTrigger>
```

### Migration Checklist
- [ ] Identify related pages that can be grouped
- [ ] Create TAB_MAP configuration
- [ ] Extract page content to components
- [ ] Implement dynamic route file
- [ ] Update navigation components
- [ ] Test all URL patterns
- [ ] Update internal links
- [ ] Verify SEO meta tags
- [ ] Test accessibility features
- [ ] Delete old page files

## Troubleshooting

### Common Issues

#### 1. **Tab Not Updating on URL Change**
**Problem**: URL changes but selectedTab state doesn't update
```typescript
// Missing dependency in useEffect
useEffect(() => {
  // Logic to update selectedTab
}, []); // ❌ Missing pathname dependency

// Solution
useEffect(() => {
  const lastSegment = pathname?.split('/').pop() || '';
  const mappedTab = TAB_MAP[lastSegment as keyof typeof TAB_MAP] || 'home';
  setSelectedTab(mappedTab as TabValue);
}, [pathname]); // ✅ Include pathname dependency
```

#### 2. **404 Errors on Direct URL Access**
**Problem**: Direct navigation to `/retailer/support/analytics` returns 404
**Cause**: Missing `[[...tab]].tsx` file or incorrect file naming

**Solution**: Ensure file is named exactly `[[...tab]].tsx` with double brackets

#### 3. **Infinite Re-renders**
**Problem**: Component re-renders continuously
```typescript
// Problematic code
const handleTabChange = (value: string) => {
  router.push(`/support/${value}`);
  setSelectedTab(value); // ❌ Manual state update causes issues
};

// Solution - let useEffect handle state updates
const handleTabChange = (value: string) => {
  router.push(`/support/${value}`); // ✅ Only update URL
};
```

#### 4. **State Loss on Tab Switch**
**Problem**: Form data or component state resets when switching tabs
**Solution**: Use memoization and proper key props
```typescript
// Preserve component state with keys
const renderTabContent = () => {
  switch (selectedTab) {
    case 'form':
      return <FormComponent key="form" data={formData} />;
    case 'list':
      return <ListComponent key="list" items={items} />;
  }
};
```

#### 5. **SEO Meta Tags Not Updating**
**Problem**: Page title/meta tags don't change with tabs
**Solution**: Implement dynamic meta tags
```typescript
import Head from 'next/head';

const getPageTitle = (tab: TabValue) => {
  const titles = {
    home: 'Support Dashboard',
    'submit-ticket': 'Submit Support Request',
    'my-tickets': 'My Support Tickets',
    analytics: 'Support Analytics',
  };
  return titles[tab] || 'Support';
};

// In component
<Head>
  <title>{getPageTitle(selectedTab)} | Nezeza</title>
  <meta name="description" content={getPageDescription(selectedTab)} />
</Head>
```

### Debugging Tools

#### URL Parameter Inspection
```typescript
// Debug URL parsing
useEffect(() => {
  console.log('Current pathname:', pathname);
  console.log('URL segments:', pathname?.split('/'));
  console.log('Last segment:', pathname?.split('/').pop());
  console.log('Mapped tab:', TAB_MAP[pathname?.split('/').pop() || '']);
}, [pathname]);
```

#### State Debugging
```typescript
// Monitor state changes
useEffect(() => {
  console.log('Selected tab changed to:', selectedTab);
}, [selectedTab]);
```

#### Router Debugging
```typescript
// Monitor router events
useEffect(() => {
  const handleRouteChange = (url) => {
    console.log('Route changed to:', url);
  };
  
  router.events.on('routeChangeComplete', handleRouteChange);
  return () => router.events.off('routeChangeComplete', handleRouteChange);
}, [router]);
```

## Performance Considerations

### Bundle Size Optimization
- Use dynamic imports for heavy tab components
- Implement code splitting per tab
- Lazy load non-critical tab content

### Memory Management
- Clean up event listeners in useEffect cleanup
- Avoid memory leaks in long-running tabs
- Use proper dependency arrays in hooks

### Rendering Optimization
- Memoize expensive computations
- Use React.memo for stable components
- Optimize re-render patterns

---

**Last Updated**: August 2025
**Pattern Version**: 2.0
**Status**: Production Ready
**Maintainer**: Development Team
