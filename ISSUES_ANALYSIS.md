# Complete Issues Analysis & Prioritization

## Total Issues: 50 (30 Admin + 11 Partners + 3 Family + 6 Register)

---

## 🔴 **CRITICAL PRIORITY** (Must Fix First - Backend + Frontend)

### Issues Requiring Backend Fixes:

1. **Admin #5**: Block user route error - "Route not found"
   - **Backend**: Check if route exists, fix endpoint
   - **Frontend**: Verify API call path
   - **Time**: 30-45 min

2. **Admin #12**: Unable to update quest
   - **Backend**: Verify update endpoint works
   - **Frontend**: Check edit quest component
   - **Time**: 1-2 hours

3. **Admin #24**: Unable to create activities (logout required)
   - **Backend**: Check if activity creation invalidates session
   - **Frontend**: Handle session properly after creation
   - **Time**: 1-2 hours

4. **Admin #29**: Unable to delete gifts
   - **Backend**: Verify delete endpoint
   - **Frontend**: Check delete function
   - **Time**: 30-45 min

5. **Partners #8**: Have to logout to create activity again
   - **Backend**: Check if activity creation causes session issues
   - **Frontend**: Reset form state properly
   - **Time**: 1-2 hours

6. **Partners #11**: Clicking edit profile, user logout
   - **Backend**: Check if profile update endpoint causes 401
   - **Frontend**: Handle 401 errors properly
   - **Time**: 30-45 min

7. **Family #1**: Reject booking causes logout
   - **Backend**: Check if reject endpoint returns 401
   - **Frontend**: Handle error responses properly
   - **Time**: 30-45 min

8. **Family #3**: Clicking edit profile, user logout
   - **Backend**: Same as Partners #11
   - **Frontend**: Same fix
   - **Time**: 30-45 min

9. **Register #2**: Forgot password - mail not received
   - **Backend**: Check email service, verify endpoint
   - **Frontend**: Verify API call
   - **Time**: 1-2 hours

10. **Admin #1**: Session expiry login page loading issue
    - **Backend**: May need to check session handling
    - **Frontend**: Fix login component loading state
    - **Time**: 30-45 min

---

## 🟡 **HIGH PRIORITY** (Quick Frontend Fixes - No Backend)

### Quick Fixes (15-20 min each):

1. **Admin #3**: Tooltips for action icons
2. **Admin #4**: Icon highlighting after actions
3. **Admin #7**: Serial numbers in lists
4. **Admin #15**: Back button on pages
5. **Admin #17**: Placeholders for empty data
6. **Admin #20**: Create and top arrow overlap
7. **Admin #25**: Asterisk for required fields in drops
8. **Partners #3**: No back button while adding activity
9. **Partners #6**: No back button on any module
10. **Register #3**: Asterisk for mandatory fields

### Medium Complexity (30-45 min each):

11. **Admin #2**: Status dropdown filter in users
12. **Admin #6**: Delete user list not updating
13. **Admin #8**: Family filter not working
14. **Admin #9**: User type filter not updating
15. **Admin #11**: Answer field empty in All Quests
16. **Admin #14**: Delete answer not reappearing
17. **Admin #19**: Unable to view quiz in mission view
18. **Admin #22**: Edit button for mysteries
19. **Admin #23**: Activity view image alignment
20. **Admin #26**: Delete answer fields disappear
21. **Admin #28**: New drop appears at last page
22. **Partners #4**: Error not specified on which field
23. **Partners #7**: Cancel button disabled when nothing added
24. **Family #2**: Total adventure count wrong in booking summary

---

## 🟢 **MEDIUM PRIORITY** (Validation & Form Fixes)

### Complex Validation Fixes (1-2 hours each):

1. **Admin #10**: Sub-admin form validations
   - Username, Email, Password validation
   - Min/max checks on Allowed Quests/Hunts
   - Asterisk for required fields
   - **Time**: 1-2 hours

2. **Admin #13**: Quest creation validations
   - No negative numbers for XP
   - Min/max limits on all fields
   - **Time**: 1-2 hours

3. **Admin #16**: Quest assignment to non-existent groups
   - Validate group exists before assignment
   - **Time**: 1-2 hours

4. **Admin #18**: Mission form validations
   - Date validations (start < end, no past dates)
   - Negative number restrictions
   - Longitude/latitude validation with error display
   - **Time**: 1-2 hours

5. **Admin #21**: Picture mysteries same issues
   - Same as mission validations
   - **Time**: 1-2 hours

6. **Admin #27**: Drop validations
   - Name, description validations
   - Min/max limits
   - **Time**: 1-2 hours

7. **Admin #30**: Gift validations
   - Name, description validations
   - **Time**: 1-2 hours

8. **Partners #1**: Activity price zero validation
   - Prevent zero price (min 0.01)
   - **Time**: 30-45 min

9. **Partners #2**: Activity form validations
   - Title, description min/max
   - Date validations (start < end, no past dates)
   - **Time**: 1-2 hours

10. **Partners #5**: Drop name and description validations
    - Min/max limits
    - **Time**: 30-45 min

11. **Partners #9**: Same quest issues as admin
    - Same validations as Admin #13
    - **Time**: 1-2 hours

12. **Partners #10**: Activity drop validations and asterisk
    - Add validations and asterisks
    - **Time**: 30-45 min

13. **Register #1**: Remember me not working
    - Implement localStorage for remember me
    - **Time**: 30-45 min

14. **Register #3**: No validation and max limit check
    - Add all field validations
    - **Time**: 1-2 hours

15. **Register #4**: Wrong emails accepted
    - Improve email regex validation
    - **Time**: 15-20 min

16. **Register #5**: Password validation
    - Alphanumeric + special chars
    - Max 10 characters
    - 1 capital + 1 number
    - **Time**: 30-45 min

---

## 📊 **TIME ESTIMATE SUMMARY**

### By Priority:

**Critical (Backend + Frontend):** ~8-12 hours
- 10 issues requiring backend coordination

**High Priority (Frontend Only):** ~6-8 hours
- 24 quick/medium fixes

**Medium Priority (Validation):** ~12-18 hours
- 16 validation/form fixes

### **TOTAL ESTIMATED TIME: 26-38 hours (3.5-5 working days)**

---

## 🎯 **RECOMMENDED EXECUTION ORDER**

### Phase 1: Critical Backend Issues (Day 1)
1. Fix all logout issues (Partners #11, Family #1, #3)
2. Fix route errors (Admin #5, #29)
3. Fix session/activity creation issues (Admin #24, Partners #8)
4. Fix forgot password email (Register #2)
5. Fix session expiry login (Admin #1)

### Phase 2: Quick UI Fixes (Day 1-2)
1. Add back buttons everywhere (Admin #15, Partners #3, #6)
2. Add tooltips and icons (Admin #3, #4)
3. Add serial numbers (Admin #7)
4. Add placeholders (Admin #17)
5. Fix overlaps (Admin #20)
6. Add asterisks (Admin #25, Register #3)

### Phase 3: Filter & List Updates (Day 2)
1. Fix all filter issues (Admin #2, #6, #8, #9)
2. Fix list updates (Admin #6, #14, #26, #28)
3. Fix answer field issues (Admin #11, #14, #26)

### Phase 4: Validation Implementation (Day 3-4)
1. Quest validations (Admin #13, Partners #9)
2. Mission validations (Admin #18, #21)
3. Activity validations (Partners #1, #2)
4. Drop validations (Admin #27, Partners #5, #10)
5. Gift validations (Admin #30)
6. Registration validations (Register #3, #4, #5)
7. Sub-admin validations (Admin #10)

### Phase 5: Complex Features (Day 4-5)
1. Quest update functionality (Admin #12)
2. Quiz view in missions (Admin #19)
3. Edit mysteries button (Admin #22)
4. Activity image alignment (Admin #23)
5. Quest group validation (Admin #16)
6. Remember me (Register #1)
7. Booking count fix (Family #2)

---

## 🔧 **BACKEND COORDINATION REQUIRED**

**Issues that need backend team involvement:**

1. Admin #5 - Block user route
2. Admin #12 - Quest update endpoint
3. Admin #24 - Activity creation session issue
4. Admin #29 - Gift delete endpoint
5. Partners #8 - Activity creation session
6. Partners #11 / Family #3 - Profile update 401 error
7. Family #1 - Booking reject 401 error
8. Register #2 - Forgot password email service
9. Admin #1 - Session expiry handling

**Action Required:** Coordinate with backend team to verify/fix these endpoints before frontend fixes.

---

## ✅ **READY TO START**

Once backend issues are confirmed/resolved, we can start with Phase 2 (Quick UI Fixes) as they don't depend on backend changes.

