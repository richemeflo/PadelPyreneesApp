import "dotenv/config";

import { app } from "./app";

const port = process.env.PORT || 4000;

if (process.env.NODE_ENV !== "test") {
  app.listen(port, () => console.log(`API running on http://localhost:${port}`));
}

export default app;
