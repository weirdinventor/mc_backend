## **Gamification Feature Implementation Plan**

**1\. Goal**  
To implement the specified gamification features (XP, Grades, Badges) into the existing application, integrating seamlessly with current data structures and respecting established architectural patterns and naming conventions.  
**2\. Prerequisites & Assumptions**

* An existing Users table/model is present and functional.  
* An existing Modules or Groups table/model exists, representing the discussion groups associated with modules. **AI Agent Note:** *Verify the exact name and structure of this table (Modules, Groups, or similar) before creating foreign keys.*  
* The project has established naming conventions (e.g., snake\_case or camelCase for columns/variables), coding styles, and architectural patterns (e.g., MVC, Service Layer, Repository Pattern).  
* The project utilizes a specific ORM (e.g., SQLAlchemy, TypeORM, Prisma, Django ORM) or query builder.  
* Mechanisms exist or will be created to accurately track user actions relevant to XP gain, specifically:  
  * Detecting live stream/replay watching and calculating duration.  
  * Detecting participation "on stage" during a live event.  
* An administrative interface or system exists or will be built to manage certain aspects (like awarding special badges).

**3\. General Instructions for AI Coding Agent**

* **Consistency is Key:** Strictly adhere to the existing project architecture, naming conventions (table names, column names, variable names, function names, class names), and coding styles found in the current codebase. Examine existing models, services, controllers/views, and utility functions before writing new code.  
* **Use Existing Tools:** Utilize the project's configured database connection, ORM, or query builder for all database interactions. Do not introduce new database access methods unless explicitly required and approved.  
* **Error Handling & Logging:** Implement robust error handling (e.g., try-catch blocks, specific exceptions) and appropriate logging for all new backend logic, following existing patterns.  
* **Configuration:** Define non-trivial constants (XP values for actions, badge message thresholds like 250\) in a central configuration file or a dedicated constants module, following the project's standard practice. Avoid hardcoding magic numbers directly in the logic.  
* **Database Migrations:** All database schema changes (table creations, column additions/modifications) MUST be accompanied by corresponding migration scripts compatible with the project's migration tool (e.g., Alembic, TypeORM migrations, Prisma Migrate, Django migrations).

**4\. Implementation Steps**  
**Phase 1: Database Schema**

* **Step 1.1: Create New grades Table**  
  * id (Primary Key \- use same type as other primary keys, e.g., UUID or auto-incrementing integer).  
  * name (String/Varchar, NOT NULL, unique).  
  * min\_xp\_required (Integer, NOT NULL, add index).  
  * user\_type\_access (String/Enum, NOT NULL, values: 'Free', 'Paid', 'All').  
  * animation\_asset\_url (String/Varchar, NULLABLE).  
  * *Instruction:* Use project's naming convention for table and columns. Add the foreign key constraint from users.current\_grade\_id to grades.id.  
* **Step 1.2: Modify Existing Users Table**  
  * Add column: experience\_points (Integer, NOT NULL, default 0, add index).  
  * Add column: current\_grade\_id (Type appropriate for Foreign Key, NULLABLE, add foreign key constraint referencing grades.id later).  
  * Add column: last\_activity\_timestamp (Timestamp/DateTime, NULLABLE).  
  * Add column: last\_daily\_reward\_timestamp (Timestamp/DateTime, NULLABLE).  
  * *Instruction:* Use exact naming conventions already present in the Users table.  
* **Step 1.3: Create New badges Table**  
  * id (Primary Key \- same type as grades.id).  
  * name (String/Varchar, NOT NULL, unique).  
  * description (Text/String, NULLABLE).  
  * badge\_type (String/Enum, NOT NULL, values: 'Module\_Expert\_Contributor', 'Special').  
  * module\_id (Foreign Key, NULLABLE, referencing Modules/Groups.id \- **Verify target table name**).  
  * *Instruction:* Use project's naming convention.  
* **Step 1.4: Create New user\_badges Table (Join Table)**  
  * id (Primary Key \- same type as grades.id).  
  * user\_id (Foreign Key, NOT NULL, referencing users.id, add index).  
  * badge\_id (Foreign Key, NOT NULL, referencing badges.id, add index).  
  * earned\_timestamp (Timestamp/DateTime, NOT NULL, default to current timestamp).  
  * *Instruction:* Use project's naming convention. Add a unique constraint on (user\_id, badge\_id). Generate a migration script.  
* **Step 1.5: Create New user\_module\_progress Table**  
  * id (Primary Key \- same type as grades.id).  
  * user\_id (Foreign Key, NOT NULL, referencing users.id, add index).  
  * module\_id (Foreign Key, NOT NULL, referencing Modules/Groups.id, add index \- **Verify target table name**).  
  * completion\_status (String/Enum, NOT NULL, values: 'NotStarted', 'InProgress', 'Completed', default 'NotStarted').  
  * discussion\_message\_count (Integer, NOT NULL, default 0).  
  * *Instruction:* Use project's naming convention. Add a unique constraint on (user\_id, module\_id).

**Phase 2: Backend Logic**

* **Step 2.1: Create Gamification Service(s)**  
  * Following the project's service layer pattern, create a new service or set of services (e.g., GamificationService, or separate XPService, GradeService, BadgeService).  
  * Inject necessary dependencies (e.g., database repository/ORM access).  
* **Step 2.2: Implement Core Gamification Functions**  
  * award\_xp(user\_id, points):  
    * Atomically increment users.experience\_points by points.  
    * Update users.last\_activity\_timestamp to the current time.  
    * Call update\_user\_grade(user\_id).  
    * Return success/failure or relevant data.  
  * update\_user\_grade(user\_id):  
    * Fetch user's current experience\_points and user\_type.  
    * Query grades table: find the highest grade where min\_xp\_required \<= user.experience\_points AND user\_type\_access matches user's type (or is 'All'). Order by min\_xp\_required descending.  
    * If the found grade.id is different from users.current\_grade\_id, update users.current\_grade\_id.  
  * check\_and\_grant\_daily\_reward(user\_id):  
    * Fetch users.last\_daily\_reward\_timestamp.  
    * Determine the start of the current day (e.g., midnight in a consistent timezone like UTC).  
    * If last\_daily\_reward\_timestamp is null or before the start of the current day:  
      * Call award\_xp(user\_id, 5\) (use constant for 5).  
      * Update users.last\_daily\_reward\_timestamp to the current time.  
      * Return true (reward granted).  
    * Else:  
      * Return false (reward not granted).  
  * increment\_module\_message\_count(user\_id, module\_id):  
    * Find or create the user\_module\_progress record for the user/module.  
    * Atomically increment discussion\_message\_count.  
    * Return the new count.  
  * award\_module\_expert\_contributor\_badge(user\_id, module\_id):  
    * Find the badge record where badge\_type is 'Module\_Expert\_Contributor' and module\_id matches.  
    * If badge exists, check if an entry exists in user\_badges for this user\_id and badge\_id.  
    * If no entry exists, create one in user\_badges.  
  * award\_special\_badge(target\_user\_id, badge\_id):  
    * Verify that a badge with badge\_id exists and its badge\_type is 'Special'.  
    * Check if an entry exists in user\_badges for this user\_id and badge\_id.  
    * If no entry exists, create one in user\_badges.  
* **Step 2.3: Integrate Gamification Logic into Existing Code**  
  * **Identify Action Points:** Locate the existing code sections (controllers, services, event handlers) that correspond to the XP-triggering actions:  
    * User login/session validation (for daily check trigger).  
    * Live comment creation.  
    * Group discussion message creation.  
    * Reply creation.  
    * Media sharing in groups.  
    * Live stream watching (start/stop/heartbeat).  
    * Replay watching (start/stop/heartbeat).  
    * Live stage participation detection.  
  * **Implement Integrations:**  
    * **Daily Check:** In handlers for *most user-initiated actions* (e.g., posting message, commenting, watching content, potentially app foregrounding), make the *first* call within the handler gamification\_service.check\_and\_grant\_daily\_reward(user\_id).  
    * **XP Awards:** After the daily check (if applicable), call gamification\_service.award\_xp(user\_id, \<points\_constant\>) for the specific action.  
    * **Module Messages:** In the handler for creating a message in a module group:  
      * Call new\_count \= gamification\_service.increment\_module\_message\_count(user\_id, module\_id).  
      * If new\_count \== 250 (use constant), call gamification\_service.award\_module\_expert\_contributor\_badge(user\_id, module\_id).  
    * **Live/Replay Watching:** Integrate with the duration tracking mechanism. Periodically (e.g., every minute), call gamification\_service.award\_xp with the appropriate points-per-minute constant.  
    * **Module Progress:** Ensure user\_module\_progress records are created/updated when users gain access to modules or their completion status changes (this might be manual admin action or triggered elsewhere).

**Phase 3: Admin Backend & API**

* **Step 3.1: Create Admin API Endpoints**  
  * Develop secure API endpoints, restricted to admin users, for:  
    * POST /admin/badges: Create a new badge (primarily 'Special' type). Requires name, description.  
    * PUT /admin/badges/{badge\_id}: Update an existing badge.  
    * GET /admin/badges: List badges (with filtering/pagination).  
    * POST /admin/users/{user\_id}/badges: Assign a specific 'Special' badge (badge\_id in request body) to a user. Calls award\_special\_badge.  
    * GET /admin/users: List users (potentially with filtering/searching).  
    * GET /admin/users/{user\_id}/badges: List badges earned by a specific user.  
    * (Optional) GET /admin/modules/{module\_id}/users: List users associated with a module and their completion\_status from user\_module\_progress.

**Phase 4: Frontend API Data**

* **Step 4.1: Update User Profile Endpoints**  
  * Modify existing API endpoints that return user profile data.  
  * Ensure they include:  
    * experience\_points.  
    * current\_grade: An object containing name and animation\_asset\_url (joined from grades table via current\_grade\_id). Handle null current\_grade\_id gracefully (e.g., return null or default 'Rookie' grade details).  
    * badges: A list of objects, each containing name, description, and earned\_timestamp (joined from user\_badges and badges).

**Phase 5: Seeding & Testing**

* **Step 5.1: Seed Initial Data**  
  * Create a seeding script (using project's standard seeding tools) to populate the grades table with all defined grades (Rookie to Illuminati) including their min\_xp\_required, user\_type\_access, and placeholder animation\_asset\_url.  
* **Step 5.2: Testing**  
  * Write unit and integration tests for the new service functions (award\_xp, update\_user\_grade, badge awarding logic, etc.).  
  * Perform end-to-end testing by simulating user actions and verifying XP updates, grade changes, and badge awards in the database and via API responses.  
  * Test edge cases (e.g., first login, reaching exact XP threshold, awarding duplicate badges, admin actions).

**Execution Order:**

1. Implement Database Schema changes (Phase 1).  
2. Implement Backend Logic core functions (Steps 2.1, 2.2).  
3. Integrate backend logic into existing action points (Step 2.3).  
4. Develop Admin API endpoints (Phase 3).  
5. Update Frontend API data providers (Phase 4).  
6. Seed initial data and conduct thorough testing (Phase 5).