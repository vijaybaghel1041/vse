# Database Entity Relationships Guide - VSE Application

## Current Entities Overview

Your application has 5 main entities:
1. **User** - User accounts (ADMIN, MEMBER, AUDITOR roles)
2. **Role** - Role definitions
3. **VseSubmission** - Employee performance submissions
4. **EnabledMember** - Members enabled for audit cycle
5. **AuditProcess** - Audit workflow tracking

---

## Current Entity Structure (Issues)

### ❌ Problem: Weak Relationships

```
User Entity (Current)
├── id (Primary Key)
├── username
├── password
├── email
├── phone
└── role (STRING) ⚠️ ISSUE: Just a string, not connected to Role table

VseSubmission Entity (Current)
├── id (Primary Key)
├── employeeId (STRING) ⚠️ ISSUE: Should reference User
├── goalsAchieved
├── selfRating
└── year

EnabledMember Entity (Current)
├── id (Primary Key)
├── memberCode (STRING)
├── auditPeriod
├── emailId
├── submissionStatus ⚠️ ISSUE: No foreign key to User

AuditProcess Entity (Current)
├── id (Primary Key)
├── memberUsername (STRING) ⚠️ ISSUE: Should reference User
├── auditorUsername (STRING) ⚠️ ISSUE: Should reference User
├── status
├── initialExcelFile
├── auditorReportFile
├── memberFinalResponseFile
└── adminComments
```

---

## Recommended Entity Relationships (ERD)

```
┌─────────────────────┐
│        Role         │
├─────────────────────┤
│ roleId (PK)         │
│ roleName (UNIQUE)   │
│ description         │
└──────────┬──────────┘
           │ (1:N)
           │
           │ has
           │
┌──────────▼──────────┐
│        User         │
├─────────────────────┤
│ id (PK)             │◄────────────┐
│ username            │             │
│ password            │             │
│ email               │             │
│ phone               │             │
│ roleId (FK)         │             │
│ isActive            │             │
│ createdAt           │             │
└──────────┬──────────┘             │
           │                        │
     ┌─────┴─────────┬──────────────┘
     │               │
  (1:N)            (1:N)
     │               │
┌────▼─────────┐  ┌─┴──────────────┐
│ EnabledMember│  │VseSubmission    │
├──────────────┤  ├─────────────────┤
│ id (PK)      │  │ id (PK)         │
│ userId (FK)  │  │ userId (FK)     │
│ auditPeriod  │  │ goalsAchieved   │
│ emailId      │  │ selfRating      │
│ status       │  │ year            │
│ createdAt    │  │ submissionDate  │
└──────────────┘  │ submittedBy     │
                  └─────────────────┘
                        │
                        │ (1:1)
                        │
┌─────────────────────────▼──────────────┐
│        AuditProcess                    │
├────────────────────────────────────────┤
│ id (PK)                                │
│ memberId (FK → User)                   │
│ auditorId (FK → User)                  │
│ auditPeriod                            │
│ status (PENDING_AUDITOR → APPROVED)    │
│ initialExcelFile                       │
│ auditorReportFile                      │
│ memberFinalResponseFile                │
│ adminComments                          │
│ createdAt                              │
│ updatedAt                              │
└────────────────────────────────────────┘
```

---

## Why Database-Level Relationships Matter

### 1. **Data Integrity (Foreign Keys)**

**Current Problem:**
```sql
-- User table stores role as string
SELECT * FROM vse_users WHERE role = 'ADMIN';  -- Anyone could enter 'ADMI' or typo

-- AuditProcess stores usernames as strings
INSERT INTO vse_audits (memberUsername) VALUES ('nonexistent_user');  -- ❌ No validation
```

**Solution:**
```sql
-- Foreign key constraint enforces valid roles
ALTER TABLE vse_users ADD CONSTRAINT fk_user_role 
FOREIGN KEY (roleId) REFERENCES roles(roleId);

-- Foreign key ensures members exist
ALTER TABLE vse_audits ADD CONSTRAINT fk_audit_member 
FOREIGN KEY (memberId) REFERENCES vse_users(id);

INSERT INTO vse_audits (memberId) VALUES (999);  -- ❌ ERROR: memberId 999 doesn't exist
```

---

### 2. **Data Consistency (Cascading Operations)**

**Problem Without Relationships:**
```
If an auditor is deleted, their audit records still exist with orphaned username strings.
You manually have to find & clean up records.
```

**Solution With Relationships:**
```sql
ALTER TABLE vse_audits ADD CONSTRAINT fk_audit_auditor 
FOREIGN KEY (auditorId) REFERENCES vse_users(id) 
ON DELETE SET NULL;  -- Automatically NULL when auditor is deleted

-- Or archive the audit instead:
ON DELETE RESTRICT;  -- Prevent deletion if audits exist
```

---

### 3. **Query Performance (Indexing & Joins)**

**Current (Inefficient):**
```java
// String-based lookup (slow)
List<AuditProcess> audits = repository.findByMemberUsername("john_doe");

// In SQL: Full table scan
SELECT * FROM vse_audits WHERE memberUsername = 'john_doe';  -- Slow!
```

**Solution With Foreign Keys:**
```java
// ID-based lookup (fast)
List<AuditProcess> audits = repository.findByMemberId(5L);

// In SQL: Indexed lookup
SELECT * FROM vse_audits WHERE memberId = 5;  -- Fast!
```

---

### 4. **Business Logic Enforcement**

**Current Gaps:**
```
• A member can be in EnabledMember but not in User table
• A submission can reference an employee who doesn't exist
• An audit can involve non-existent users
• Role names could have typos (e.g., 'ADMM' instead of 'ADMIN')
```

**Solution:**
```sql
-- Ensures only valid members participate in audits
FOREIGN KEY (memberId) REFERENCES User(id)

-- Ensures consistent role names across system
FOREIGN KEY (roleId) REFERENCES Role(roleId)
```

---

## Recommended Entity Changes

### Step 1: Fix User Entity
```java
@Entity
@Table(name = "vse_users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;
    
    private String username;
    private String password;
    private String email;
    private String phone;
    
    // ✅ Changed from String to Foreign Key
    @ManyToOne
    @JoinColumn(name = "role_id", nullable = false)
    private Role role;
    
    private Boolean isActive = true;
    private LocalDateTime createdAt = LocalDateTime.now();
    
    // Relationships
    @OneToMany(mappedBy = "user")
    private List<VseSubmission> submissions;
    
    @OneToOne(mappedBy = "member")
    private EnabledMember enabledMember;
}
```

### Step 2: Fix VseSubmission Entity
```java
@Entity
@Table(name = "vse_submission")
public class VseSubmission {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;
    
    // ✅ Changed from employeeId string to User foreign key
    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    private String goalsAchieved;
    private String selfRating;
    private Integer year;
    
    private LocalDateTime submissionDate;
    private String submittedBy;
}
```

### Step 3: Fix EnabledMember Entity
```java
@Entity
@Table(name = "enabled_members")
public class EnabledMember {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;
    
    // ✅ Added foreign key to User
    @OneToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    private String memberCode;
    private String auditPeriod;
    private String emailId;
    private String submissionStatus;  // NOT_STARTED, PENDING_AUDITOR, PENDING_ADMIN, COMPLETED
    
    private LocalDateTime createdAt;
}
```

### Step 4: Fix AuditProcess Entity
```java
@Entity
@Table(name = "vse_audits")
public class AuditProcess {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;
    
    // ✅ Changed from memberUsername string to User foreign key
    @ManyToOne
    @JoinColumn(name = "member_id", nullable = false)
    private User member;
    
    // ✅ Changed from auditorUsername string to User foreign key
    @ManyToOne
    @JoinColumn(name = "auditor_id", nullable = false)
    private User auditor;
    
    private String auditPeriod;
    private String status;  // PENDING_AUDITOR, PENDING_MEMBER_REVIEW, PENDING_ADMIN, APPROVED, REJECTED
    
    private String initialExcelFile;
    private String auditorReportFile;
    private String memberFinalResponseFile;
    private String adminComments;
    
    @Column(columnDefinition = "TEXT")
    private String auditDescription;
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
```

---

## Data Flow with Proper Relationships

### Scenario 1: Admin Creates Audit Workflow
```
Step 1: Admin selects a Member from User table
   ↓ (memberId = FK to User)
Step 2: Admin selects an Auditor from User table with AUDITOR role
   ↓ (auditorId = FK to User)
Step 3: System creates AuditProcess record
   ✅ Database enforces: memberId & auditorId must exist in User table
   ✅ Database enforces: auditorId user.role must be 'AUDITOR'
```

### Scenario 2: Member Submits VSE Form
```
Step 1: User logs in (User.id = 5)
   ↓
Step 2: User submits VseSubmission
   ✅ Database validates: userId 5 exists in User table
   ✅ Automatic: submission.year, submissionDate recorded
```

### Scenario 3: Auditor Reviews & Member Responds
```
Step 1: Find audit where auditorId = current user
   SELECT * FROM vse_audits WHERE auditor_id = 10
   ✅ Fast indexed lookup by ID
   
Step 2: Update audit status
   ✅ Only valid statuses allowed (via application logic)
   
Step 3: If auditor deleted, their audits are set to NULL
   ✅ Data remains intact, no orphaned records
```

---

## SQL Schema (Proper Design)

```sql
-- Roles table
CREATE TABLE roles (
    role_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    role_name VARCHAR(50) UNIQUE NOT NULL,
    description VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Users table with FK to Role
CREATE TABLE vse_users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100),
    phone VARCHAR(20),
    role_id BIGINT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES roles(role_id),
    INDEX idx_username (username),
    INDEX idx_role_id (role_id)
);

-- EnabledMembers table with FK to User
CREATE TABLE enabled_members (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    member_code VARCHAR(50),
    audit_period VARCHAR(50),
    email_id VARCHAR(100),
    submission_status VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uk_user_period (user_id, audit_period),
    FOREIGN KEY (user_id) REFERENCES vse_users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id)
);

-- VseSubmission table with FK to User
CREATE TABLE vse_submission (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    goals_achieved TEXT,
    self_rating VARCHAR(20),
    year INT,
    submission_date TIMESTAMP,
    submitted_by VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES vse_users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_year (year)
);

-- AuditProcess table with FK to User (member & auditor)
CREATE TABLE vse_audits (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    member_id BIGINT NOT NULL,
    auditor_id BIGINT NOT NULL,
    audit_period VARCHAR(50),
    status VARCHAR(50),
    initial_excel_file VARCHAR(255),
    auditor_report_file VARCHAR(255),
    member_final_response_file VARCHAR(255),
    admin_comments TEXT,
    audit_description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (member_id) REFERENCES vse_users(id) ON DELETE RESTRICT,
    FOREIGN KEY (auditor_id) REFERENCES vse_users(id) ON DELETE RESTRICT,
    INDEX idx_member_id (member_id),
    INDEX idx_auditor_id (auditor_id),
    INDEX idx_status (status)
);
```

---

## Benefits Summary

| Benefit | Without Relationships | With Relationships |
|---------|----------------------|-------------------|
| **Data Integrity** | ❌ Orphaned records possible | ✅ Enforced by DB |
| **Query Speed** | ❌ String comparison | ✅ Indexed ID lookup |
| **Typos/Invalid Data** | ❌ Possible | ✅ FK constraint blocks |
| **Cascading Deletes** | ❌ Manual cleanup | ✅ Automatic |
| **Consistency** | ❌ Prone to errors | ✅ Guaranteed |
| **Reporting** | ❌ Complex joins on strings | ✅ Simple joins on IDs |

---

## Next Steps

1. **Update Java Entities** - Add @ManyToOne and @OneToOne annotations
2. **Create Migration Script** - Run database schema changes
3. **Update Service Layer** - Change from username lookups to ID-based
4. **Update Controllers** - Accept user IDs instead of usernames
5. **Update Frontend** - Send user IDs in requests
6. **Run Tests** - Verify relationships work correctly

