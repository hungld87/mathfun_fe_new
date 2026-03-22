# Practice Completion Status Implementation

## Overview
Implemented visual indication and behavioral changes for completed practice tests in the practice list page, enforcing the "1 user = 1 practice attempt" rule across the entire user journey.

## Changes Made

### 1. Practice List Page (`/pages/practice/index.vue`)

#### Added State Management
```typescript
// User authentication state
const userStore = useUserStore()
const isAuthenticated = computed(() => userStore.isAuthenticated)

// User's completed practices (Map of practice documentId -> submission data)
const completedPractices = ref<Map<string, any>>(new Map())
```

#### Added API Fetch Function
```typescript
const fetchCompletedPractices = async () => {
  if (!isAuthenticated.value) {
    completedPractices.value = new Map()
    return
  }

  try {
    const token = localStorage.getItem('jwt')
    if (!token) {
      completedPractices.value = new Map()
      return
    }

    // Fetch all submissions without filtering by specific practice
    const response = await $fetch('/api/practice-scorings/my-history', {
      headers: {
        Authorization: `Bearer ${token}`
      },
      query: {}
    })

    // Build a map of practice documentId -> submission
    const newMap = new Map()
    if (response?.data && Array.isArray(response.data)) {
      response.data.forEach((submission: any) => {
        if (submission.practice_document?.documentId) {
          newMap.set(submission.practice_document.documentId, submission)
        }
      })
    }
    
    completedPractices.value = newMap
  } catch (error) {
    console.error('Failed to fetch completed practices:', error)
    completedPractices.value = new Map()
  }
}
```

#### Added Helper Function
```typescript
const isPracticeCompleted = (documentId: string) => {
  return completedPractices.value.has(documentId)
}
```

#### Added Lifecycle Hooks
```typescript
// Fetch completed practices on mount and when auth state changes
onMounted(() => {
  fetchCompletedPractices()
})

watch(isAuthenticated, () => {
  fetchCompletedPractices()
})
```

#### Updated UI Template
Changed the action column to show:
- **Completion badge**: Green checkmark badge with "Đã hoàn thành" text
- **Conditional button text**: "Xem kết quả" for completed practices, "Vào thi" for new ones
- **Conditional button style**: Blue gradient for completed, teal gradient for new
- **Conditional icon**: Document icon for completed, play icon for new

```vue
<td class="px-6 py-4 text-center">
  <div class="flex items-center justify-center gap-2">
    <!-- Completed Badge -->
    <span 
      v-if="isPracticeCompleted(practice.documentId)"
      class="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold"
    >
      <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
      </svg>
      Đã hoàn thành
    </span>
    
    <!-- Action Button -->
    <button
      @click="startPractice(practice.slug, practice.documentId)"
      :class="[
        'inline-flex items-center gap-2 px-4 py-2 rounded-lg font-semibold hover:shadow-lg hover:scale-105 transition-all whitespace-nowrap',
        isPracticeCompleted(practice.documentId)
          ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
          : 'bg-gradient-to-r from-primary to-teal-600 text-white'
      ]"
    >
      <!-- Icon changes based on completion status -->
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path 
          v-if="isPracticeCompleted(practice.documentId)"
          stroke-linecap="round" 
          stroke-linejoin="round" 
          stroke-width="2" 
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
        />
        <path 
          v-else
          stroke-linecap="round" 
          stroke-linejoin="round" 
          stroke-width="2" 
          d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
        />
      </svg>
      {{ isPracticeCompleted(practice.documentId) ? 'Xem kết quả' : 'Vào thi' }}
    </button>
  </div>
</td>
```

## User Flow

### Scenario 1: User Has Not Completed Practice
1. User visits practice list page
2. Sees practice with "Vào thi" button (teal gradient)
3. Clicks "Vào thi"
4. Navigates to practice detail page
5. Timer starts, user takes test
6. User submits answers
7. Auto-grading results displayed
8. Submission saved to database

### Scenario 2: User Has Already Completed Practice
1. User visits practice list page
2. API fetches user's completed practices (`fetchCompletedPractices()`)
3. Completed practices show:
   - Green badge with checkmark icon and "Đã hoàn thành" text
   - "Xem kết quả" button with blue gradient and document icon
4. User clicks "Xem kết quả"
5. Navigates to practice detail page
6. `onMounted()` hook calls `checkPreviousSubmission()`
7. Function detects previous submission via `/api/practice-scorings/my-history`
8. Sets `hasSubmittedBefore = true` and `previousSubmission` with data
9. Shows result modal immediately with previous score
10. Timer does NOT start (prevented by `!hasSubmittedBefore` check)
11. User cannot retake the test

### Scenario 3: User Logs In After Viewing List
1. User visits practice list as guest
2. All practices show "Vào thi" (no completion data available)
3. User logs in
4. `watch(isAuthenticated)` triggers
5. Calls `fetchCompletedPractices()` to refresh completion status
6. UI updates to show badges and "Xem kết quả" for completed practices

## API Endpoints Used

### `/api/practice-scorings/my-history`
**Purpose**: Fetch user's practice submissions

**Usage in List Page**:
- Called without `practiceDocumentId` query parameter
- Returns ALL user's submissions
- Used to build completion map for all practices

**Usage in Detail Page**:
- Called WITH `practiceDocumentId` query parameter
- Returns submissions for specific practice only
- Used to check if user already completed current practice

**Request** (List Page):
```typescript
await $fetch('/api/practice-scorings/my-history', {
  headers: {
    Authorization: `Bearer ${token}`
  },
  query: {} // No practiceDocumentId = get all submissions
})
```

**Request** (Detail Page):
```typescript
await $fetch('/api/practice-scorings/my-history', {
  headers: {
    Authorization: `Bearer ${token}`
  },
  params: {
    practiceDocumentId: documentId.value // Get specific practice submissions
  }
})
```

**Response**:
```typescript
{
  data: [
    {
      id: number
      documentId: string
      score: number
      practice_document: {
        id: number
        documentId: string
        title: string
      }
      // ... other fields
    }
  ]
}
```

## Technical Implementation Details

### Data Structure
- **completedPractices**: `Map<string, any>`
  - Key: Practice `documentId` (string)
  - Value: Full submission object with score, timestamp, etc.
  - Chosen for O(1) lookup performance

### Performance Considerations
- Single API call on mount fetches ALL user submissions
- Map data structure provides instant lookup: `isPracticeCompleted()`
- No need to make separate API calls for each practice in the list
- Efficient re-render with Vue's reactivity system

### Authentication Handling
- Fetches completion status only if user is authenticated
- Clears completion map when user logs out
- Refetches when user logs in (via `watch(isAuthenticated)`)
- Guards against missing JWT token

### Edge Cases Handled
1. **Unauthenticated users**: Shows "Vào thi" for all practices (no completion data)
2. **API errors**: Falls back to empty Map, treats all practices as incomplete
3. **Missing documentId**: Practice won't match any submission
4. **Multiple submissions**: Takes first submission (sorted by most recent in backend)
5. **localStorage conflicts**: Detail page clears storage if submission already exists

## Benefits

### User Experience
✅ Clear visual feedback of completed practices
✅ Prevents confusion about retaking tests
✅ Quick access to previous results
✅ Consistent messaging across list and detail pages

### Business Logic
✅ Enforces "1 user = 1 practice" rule at list level
✅ Prevents accidental re-attempts
✅ Maintains data integrity
✅ Aligns UI with backend restrictions

### Technical Quality
✅ Single source of truth (database)
✅ Efficient API usage (single call for all submissions)
✅ Fast lookups with Map data structure
✅ Proper reactive state management
✅ Clean separation of concerns

## Testing Checklist

- [ ] Guest user sees all "Vào thi" buttons
- [ ] Authenticated user with no completions sees all "Vào thi" buttons
- [ ] Authenticated user with completions sees badges and "Xem kết quả" buttons
- [ ] Clicking "Vào thi" starts new test normally
- [ ] Clicking "Xem kết quả" shows previous results immediately
- [ ] Timer does NOT start when viewing previous results
- [ ] User cannot retake completed test from detail page
- [ ] Logging in refreshes completion status
- [ ] Logging out clears completion status
- [ ] API errors don't break the page

## Future Enhancements

### Possible Improvements
1. **Loading states**: Show skeleton loaders while fetching completions
2. **Score display**: Show user's score directly on the badge
3. **Retry logic**: Allow retry with exponential backoff if API fails
4. **Cache strategy**: Cache completion status for session duration
5. **Sorting options**: Sort by completion status, score, date
6. **Filter options**: Show only completed or only incomplete practices
7. **Animation**: Smooth transitions when completion status updates

### Backend Considerations
- Consider adding pagination to my-history endpoint if user has many submissions
- Consider caching user submissions on backend for faster response
- Consider adding date ranges for filtering old submissions
