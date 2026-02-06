# Database Structure - Projects and Scenes

## ✅ Current Database Structure (Correct)

### 🗄️ Database Schema

#### **Collections:**
1. **users** - User accounts
2. **projects** - Story projects
3. **scenes** - Individual scenes belonging to projects

### 📋 Project Collection

#### **Structure:**
```json
{
  "_id": ObjectId("507f1f77bcf86cd799439011"),  // Unique project ID
  "user_id": ObjectId("507f191e810c19729de860ea"),  // Owner
  "name": "Epic Palace Story",  // Project name
  "project_type": "storytelling",
  "characters": {
    "Rohan": {
      "traits": "Warm olive skin, ornate turban...",
      "voice_id": "male_deep_01",
      "voice_tone": "emotional",
      "image": "data:image/jpeg;base64,..."
    },
    "Priya": {
      "traits": "Fair skin, elegant saree...",
      "voice_id": "female_soft_02",
      "voice_tone": "gentle",
      "image": "data:image/jpeg;base64,..."
    }
  },
  "settings": {
    "visual_style": "Cinematic Photorealism",
    "default_duration": 8
  },
  "total_scenes": 5,
  "created_at": ISODate("2026-02-03T10:00:00Z"),
  "last_updated": ISODate("2026-02-03T12:00:00Z")
}
```

#### **Key Fields:**
- **`_id`**: Unique identifier for the project (MongoDB ObjectId)
- **`user_id`**: Reference to the user who owns this project
- **`name`**: Project name (e.g., "Epic Palace Story")
- **`characters`**: Character library for this project
- **`settings`**: Project-wide settings (visual style, duration)
- **`total_scenes`**: Count of scenes in this project

### 📋 Scene Collection

#### **Structure:**
```json
{
  "_id": ObjectId("507f1f77bcf86cd799439012"),  // Unique scene ID
  "project_id": ObjectId("507f1f77bcf86cd799439011"),  // Links to project
  "user_id": ObjectId("507f191e810c19729de860ea"),  // Owner
  "scene_number": 1,
  "description": "Rohan enters the palace...",
  "duration": 8,
  "scene_type": "dialogue",
  "characters_in_scene": {
    "Rohan": {
      "dialogue": "Welcome to my home",
      "action": "enters palace",
      "emotion": "welcoming"
    }
  },
  "dialogue": "Welcome to my home",
  "camera_angle": "Wide shot",
  "transition_type": "Fade",
  "setting": "Palace entrance",
  "lighting": "Golden hour",
  "time_of_day": "Evening",
  "generated_prompt": "The scene fades in, revealing...",
  "story_context": "First scene - establish setting",
  "created_at": ISODate("2026-02-03T10:30:00Z"),
  "updated_at": ISODate("2026-02-03T11:00:00Z")
}
```

#### **Key Fields:**
- **`_id`**: Unique identifier for the scene (MongoDB ObjectId)
- **`project_id`**: **Links this scene to its parent project** ⭐
- **`user_id`**: Reference to the user who owns this scene
- **`scene_number`**: Order of this scene (1, 2, 3, etc.)
- **`generated_prompt`**: The Veo-ready prompt for this scene

### 🔗 Relationship Structure

```
User
 └── Project 1 (ID: abc123)
      ├── Scene 1 (project_id: abc123)
      ├── Scene 2 (project_id: abc123)
      ├── Scene 3 (project_id: abc123)
      └── Scene 4 (project_id: abc123)
 
 └── Project 2 (ID: def456)
      ├── Scene 1 (project_id: def456)
      ├── Scene 2 (project_id: def456)
      └── Scene 3 (project_id: def456)
```

### ✅ How It Works

#### **1. Create New Project:**
```
User creates "Epic Palace Story"
↓
Database creates new project with unique ID: abc123
↓
Project stored in 'projects' collection
```

#### **2. Add Scenes to Project:**
```
User splits script into 5 scenes
↓
Database creates 5 scene documents
↓
Each scene has project_id = abc123
↓
All 5 scenes linked to "Epic Palace Story"
```

#### **3. Query Scenes by Project:**
```python
# Get all scenes for project abc123
scenes = db.scenes.find({"project_id": ObjectId("abc123")})

# Result: All 5 scenes for "Epic Palace Story"
```

### 📊 Example Database State

#### **Projects Collection:**
```json
[
  {
    "_id": ObjectId("abc123"),
    "name": "Epic Palace Story",
    "total_scenes": 5,
    "characters": { "Rohan": {...}, "Priya": {...} }
  },
  {
    "_id": ObjectId("def456"),
    "name": "Forest Adventure",
    "total_scenes": 3,
    "characters": { "Arjun": {...} }
  }
]
```

#### **Scenes Collection:**
```json
[
  // Scenes for "Epic Palace Story" (project_id: abc123)
  {
    "_id": ObjectId("scene1"),
    "project_id": ObjectId("abc123"),  // Links to Epic Palace Story
    "scene_number": 1,
    "description": "Rohan enters palace..."
  },
  {
    "_id": ObjectId("scene2"),
    "project_id": ObjectId("abc123"),  // Links to Epic Palace Story
    "scene_number": 2,
    "description": "Rohan greets Priya..."
  },
  
  // Scenes for "Forest Adventure" (project_id: def456)
  {
    "_id": ObjectId("scene3"),
    "project_id": ObjectId("def456"),  // Links to Forest Adventure
    "scene_number": 1,
    "description": "Arjun walks through forest..."
  }
]
```

### 🔍 Key Points

#### **✅ Correct Structure:**

1. **Each Project Has Unique ID:**
   - Project 1: `_id = abc123`
   - Project 2: `_id = def456`
   - Project 3: `_id = ghi789`

2. **Scenes Reference Project ID:**
   - Scene 1 of Project 1: `project_id = abc123`
   - Scene 2 of Project 1: `project_id = abc123`
   - Scene 1 of Project 2: `project_id = def456`

3. **Same Project = Same project_id:**
   - All scenes in "Epic Palace Story" have `project_id = abc123`
   - All scenes in "Forest Adventure" have `project_id = def456`

### 📝 Code Implementation

#### **Project Model (project.py):**
```python
class ProjectInDB(ProjectBase):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)  # Unique project ID
    user_id: PyObjectId  # Owner
    total_scenes: int = 0
    created_at: datetime
    last_updated: datetime
```

#### **Scene Model (scene.py):**
```python
class SceneInDB(SceneBase):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)  # Unique scene ID
    project_id: PyObjectId  # Links to parent project ⭐
    user_id: PyObjectId  # Owner
    scene_number: int
    generated_prompt: Optional[str] = None
    created_at: datetime
    updated_at: datetime
```

### 🎯 Benefits of This Structure

1. **Organization:**
   - All scenes for a project are grouped by `project_id`
   - Easy to query: "Get all scenes for Project X"

2. **Isolation:**
   - Scenes from different projects don't mix
   - Each project is independent

3. **Scalability:**
   - Can have unlimited projects
   - Each project can have unlimited scenes

4. **Referential Integrity:**
   - Deleting a project can cascade delete all its scenes
   - Scenes always reference a valid project

5. **User Ownership:**
   - Both projects and scenes have `user_id`
   - Users can only access their own data

### 🔄 Common Operations

#### **1. Get All Projects for User:**
```python
projects = db.projects.find({"user_id": current_user_id})
```

#### **2. Get All Scenes for Project:**
```python
scenes = db.scenes.find({"project_id": project_id}).sort("scene_number", 1)
```

#### **3. Get Scene Count for Project:**
```python
count = db.scenes.count_documents({"project_id": project_id})
```

#### **4. Delete Project and All Scenes:**
```python
# Delete all scenes first
db.scenes.delete_many({"project_id": project_id})

# Then delete project
db.projects.delete_one({"_id": project_id})
```

#### **5. Update Scene in Project:**
```python
db.scenes.update_one(
    {"_id": scene_id, "project_id": project_id},
    {"$set": {"generated_prompt": new_prompt}}
)
```

### ✅ Summary

**Your database structure is CORRECT:**

- ✅ Each **project** has a unique `_id`
- ✅ Each **scene** has a unique `_id`
- ✅ Each **scene** has a `project_id` field linking it to its parent project
- ✅ All scenes in the same project share the same `project_id`
- ✅ Different projects have different `_id` values
- ✅ Scenes are properly isolated by project

**Example:**
```
Project "Epic Palace Story" (ID: abc123)
  ├── Scene 1 (project_id: abc123)
  ├── Scene 2 (project_id: abc123)
  ├── Scene 3 (project_id: abc123)
  └── Scene 4 (project_id: abc123)

Project "Forest Adventure" (ID: def456)
  ├── Scene 1 (project_id: def456)
  ├── Scene 2 (project_id: def456)
  └── Scene 3 (project_id: def456)
```

**This is the standard, correct way to structure a one-to-many relationship in MongoDB!** 🎬✨
