# 🧩 MongoDB Replica Set Setup (Local Machine — Manual, No Docker)

### 🧠 Overview  
This guide explains how to **set up and fix replication** issues on your local **Windows machine** using **multiple mongod instances** (no Docker).  
You’ll end up with a working **replica set** that runs three MongoDB nodes locally, useful for development or testing high availability.

---

## ⚙️ Step 1. Prepare Data Directories

Create separate data directories for each MongoDB instance:
```bash
C:\data\rs0\node1
C:\data\rs0\node2
C:\data\rs0\node3
```

Or from PowerShell:
```powershell
mkdir C:\data\rs0\node1
mkdir C:\data\rs0\node2
mkdir C:\data\rs0\node3
```

---

## ⚙️ Step 2. Run MongoDB Instances With Replication Enabled

Open **three separate PowerShell windows** (or Command Prompts) and run one command per window:

### 🧱 Node 1 (Primary Candidate)
```powershell
cd "C:\Program Files\MongoDB\Server\8.0\bin"
mongod --dbpath C:\data\rs0\node1 --port 27017 --replSet "rs0"
```

### 🧱 Node 2
```powershell
cd "C:\Program Files\MongoDB\Server\8.0\bin"
mongod --dbpath C:\data\rs0\node2 --port 27018 --replSet "rs0"
```

### 🧱 Node 3
```powershell
cd "C:\Program Files\MongoDB\Server\8.0\bin"
mongod --dbpath C:\data\rs0\node3 --port 27019 --replSet "rs0"
```

> ⚠️ If you get “Access denied” errors, **run PowerShell as Administrator**.  
> ⚠️ Make sure no other MongoDB instance (like Compass default server) is using port **27017**.

---

## 🧭 Step 3. Connect and Initialize the Replica Set

Open another PowerShell window and connect to the **first instance**:
```powershell
cd "C:\Program Files\MongoDB\Server\8.0\bin"
mongosh --port 27017
```

Then, in the **mongosh shell**, run:
```js
rs.initiate({
  _id: "rs0",
  version: 1,
  members: [
    { _id: 0, host: "localhost:27017" },
    { _id: 1, host: "localhost:27018" },
    { _id: 2, host: "localhost:27019" }
  ]
});
```

✅ Expected output:
```json
{ "ok" : 1 }
```

---

## 🔍 Step 4. Verify the Replica Set

Check the replica set status:
```js
rs.status();
```

You should see something like:
```json
"members": [
  { "name": "localhost:27017", "stateStr": "PRIMARY" },
  { "name": "localhost:27018", "stateStr": "SECONDARY" },
  { "name": "localhost:27019", "stateStr": "SECONDARY" }
]
```

That means your replica set is working 🎉

---

## 🧰 Step 5. Connect via MongoDB Compass or App

### Connection String:
```
mongodb://localhost:27017,localhost:27018,localhost:27019/?replicaSet=rs0
```

Use this URI for:
- **MongoDB Compass**
- **Node.js / Mongoose / Prisma**
- **Any MongoDB client supporting replica sets**

---

## 🧩 Step 6. Test Replication

Insert a test document in the **primary**:
```js
use testDB;
db.users.insertOne({ name: "Ryan Charles Alcaraz", role: "Developer" });
```

Now on a **secondary node**:
```powershell
mongosh --port 27018
```

Enable secondary reads:
```js
rs.slaveOk();
db.users.find();
```

You should see the same record replicated 🎯

---

## 🧱 Optional — Fix Common Errors

| Error | Meaning | Fix |
|-------|----------|-----|
| `NoReplicationEnabled` | MongoDB not started with `--replSet` | Restart mongod with `--replSet rs0` |
| `ECONNREFUSED 27017` | Another instance already using port | Stop existing mongod or change port |
| `boost::filesystem::create_directory Access is denied` | No permission to create data folder | Run PowerShell as **Administrator** |
| `replSetInitiate quorum check failed` | Nodes not reachable | Ensure all `localhost` ports are accessible |
| `Server selection timed out` | App cannot connect | Use the full replica URI with `?replicaSet=rs0` |

---

## ✅ Verification Checklist

| Task | Status |
|------|---------|
| Created three data folders | ✅ |
| Started mongod instances with `--replSet` | ✅ |
| Ran `rs.initiate()` | ✅ |
| Verified `rs.status()` shows PRIMARY + SECONDARY nodes | ✅ |
| Tested replication with `insertOne()` | ✅ |
