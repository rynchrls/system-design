# 🧩 MongoDB Sharded Cluster with Replica Sets (Windows Setup)

This guide sets up a **MongoDB sharded cluster with replica sets** on Windows — including config servers, shard replicas, and a `mongos` router.

---

## 📁 Folder Structure

Inside your working directory (e.g. `C:\Users\Ryan Charles Alcaraz\replication_sharding`):

```
replication_sharding/
├── config/
│   ├── config1/
│   ├── config2/
│   └── config3/
├── shard1/
│   ├── rs1/
│   ├── rs2/
│   └── rs3/
└── shard2/
    ├── rs1/
    ├── rs2/
    └── rs3/
```

---

## ⚙️ 1. Start Config Servers

Open **three PowerShell terminals** (or use background jobs).

```powershell
# Config Server 1
mongod --configsvr --replSet configReplSet --dbpath ".\config\config1" --port 26051 --bind_ip localhost --logpath ".\config\config1\mongod.log"

# Config Server 2
mongod --configsvr --replSet configReplSet --dbpath ".\config\config2" --port 26052 --bind_ip localhost --logpath ".\config\config2\mongod.log"

# Config Server 3
mongod --configsvr --replSet configReplSet --dbpath ".\config\config3" --port 26053 --bind_ip localhost --logpath ".\config\config3\mongod.log"
```

### Initialize the Config Replica Set

```powershell
mongosh --port 26051
```

```js
rs.initiate({
  _id: "configReplSet",
  configsvr: true,
  members: [
    { _id: 0, host: "localhost:26051" },
    { _id: 1, host: "localhost:26052" },
    { _id: 2, host: "localhost:26053" }
  ]
});
```

---

## 💾 2. Start Shard Replica Sets

### Shard 1

```powershell
# Terminal 1
mongod --shardsvr --replSet shard1ReplSet --dbpath ".\shard1\rs1" --port 27018 --bind_ip localhost --logpath ".\shard1\rs1\mongod.log"

# Terminal 2
mongod --shardsvr --replSet shard1ReplSet --dbpath ".\shard1\rs2" --port 27019 --bind_ip localhost --logpath ".\shard1\rs2\mongod.log"

# Terminal 3
mongod --shardsvr --replSet shard1ReplSet --dbpath ".\shard1\rs3" --port 27020 --bind_ip localhost --logpath ".\shard1\rs3\mongod.log"
```

### Initialize Shard 1 Replica Set

```powershell
mongosh --port 27018
```

```js
rs.initiate({
  _id: "shard1ReplSet",
  members: [
    { _id: 0, host: "localhost:27018" },
    { _id: 1, host: "localhost:27019" },
    { _id: 2, host: "localhost:27020" }
  ]
});
```

---

### Shard 2

```powershell
# Terminal 1
mongod --shardsvr --replSet shard2ReplSet --dbpath ".\shard2\rs1" --port 27021 --bind_ip localhost --logpath ".\shard2\rs1\mongod.log"

# Terminal 2
mongod --shardsvr --replSet shard2ReplSet --dbpath ".\shard2\rs2" --port 27022 --bind_ip localhost --logpath ".\shard2\rs2\mongod.log"

# Terminal 3
mongod --shardsvr --replSet shard2ReplSet --dbpath ".\shard2\rs3" --port 27023 --bind_ip localhost --logpath ".\shard2\rs3\mongod.log"
```

### Initialize Shard 2 Replica Set

```powershell
mongosh --port 27021
```

```js
rs.initiate({
  _id: "shard2ReplSet",
  members: [
    { _id: 0, host: "localhost:27021" },
    { _id: 1, host: "localhost:27022" },
    { _id: 2, host: "localhost:27023" }
  ]
});
```

---

## 🚀 3. Start Mongos Router

```powershell
mongos --configdb configReplSet/localhost:26051,localhost:26052,localhost:26053 --port 27017 --bind_ip localhost --logpath ".\mongos.log"
```

> 💡 Keep this window open. This process routes all client connections.

---

## 🔗 4. Connect and Add Shards

```powershell
mongosh --port 27017
```

```js
sh.addShard("shard1ReplSet/localhost:27018,localhost:27019,localhost:27020");
sh.addShard("shard2ReplSet/localhost:27021,localhost:27022,localhost:27023");
```

Check cluster status:
```js
sh.status();
```

✅ You should see:
- Both shards registered
- Balancer enabled
- Active mongos

---

## 🧠 5. Enable Database Sharding

Example for your app database:

```js
use myAppDB
sh.enableSharding("myAppDB")
```

---

## 🗂️ 6. Shard a Collection

Shard by hashed key for even distribution:

```js
sh.shardCollection("myAppDB.users", { userId: "hashed" })
```

Insert sample data:
```js
for (let i = 0; i < 1000; i++) {
  db.users.insertOne({ userId: i, name: "User " + i })
}
```

Check distribution:
```js
db.users.getShardDistribution()
```

---

## 🧩 Optional: Run in Background

If you don’t want to keep all PowerShell windows open:
```powershell
Start-Job { mongod --configsvr --replSet configReplSet --dbpath ".\config\config1" --port 26051 --bind_ip localhost --logpath ".\config\config1\mongod.log" }
```

Use `Get-Job` to view background jobs.

---

## 🧾 Summary

| Component | Ports | Type | Replica Set |
|------------|--------|--------|--------------|
| Config Servers | 26051–26053 | Config | `configReplSet` |
| Shard 1 | 27018–27020 | Data Shard | `shard1ReplSet` |
| Shard 2 | 27021–27023 | Data Shard | `shard2ReplSet` |
| Mongos Router | 27017 | Query Router | — |

---

## ✅ Verification

After setup:
```js
sh.status()
```

Expected output:
- `shard1ReplSet` and `shard2ReplSet` appear
- `Balancer: enabled`
- `Active mongos: 1`
- No errors

---

## 🧹 Cleanup (Optional)

To reset your environment:
```powershell
Stop-Process -Name mongod -Force
Stop-Process -Name mongos -Force
Remove-Item -Recurse -Force .\config .\shard1 .\shard2 .\mongos.log
```

---

## 💡 Tips

- Use **different terminals** for each `mongod` or `mongos` instance.  
- For production, consider **auth**, **keyfiles**, and **persistent logs**.
- Verify replication via `rs.status()` inside shard shells.

---

**Author:** Ryan Charles Alcaraz  
**Setup Verified On:** Windows PowerShell  
**MongoDB Version:** 8.0.6  
**Date:** November 2025
