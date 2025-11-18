import { PORT } from "./config.js";
import { server } from "./socket/socket.js";
import { connectToMongo } from "./config/database.js";
import jobs from "./jobs.js";
import { connectToMongoReplShard } from "./config/repl_shard_database.js";
import { notificationSubscriber } from "./subscribers/notification.subscriber.js";

async function main() {
  connectToMongo()
    .then((message) => {
      console.log(message);
    })
    .catch((error) => {
      console.error(error);
    });
  connectToMongoReplShard()
    .then((message) => {
      console.log(message);
    })
    .catch((error) => {
      console.error(error);
    });

  jobs();
  await notificationSubscriber(); // run in background

  server.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
  });
}

main()